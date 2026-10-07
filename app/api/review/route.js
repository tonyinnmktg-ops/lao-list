const Anthropic = require('@anthropic-ai/sdk').default
const { createClient } = require('@supabase/supabase-js')

// Reviews a new business submission. Called by a Supabase database webhook on insert.
//
// 1. Clean up the submitted fields (trim spaces).
// 2. Enrich from Google Maps (only if GOOGLE_PLACES_API_KEY is set): fill missing address,
//    phone, website, map pin, rating and photo. A match must agree on name and state;
//    a wrong address is worse than none.
// 3. AI review: reject spam or businesses with no Lao connection, and write a short
//    description when the submitted one is thin.
// 4. Guardrail: publish only if the listing has a street address or a website/social link.
//    Anything thinner is held as 'needs_info' for a person to finish, then published with
//      select publish_submission('<submission id>');

const LEGACY_CATEGORIES = {
  restaurant: 'Food & Beverage',
  nonprofit: 'Community & Faith',
  service: 'Professional Services',
  retail: 'Retail',
  Services: 'Professional Services',
}

// Room for the Google lookup and AI review
export const maxDuration = 30

const TEXT_FIELDS = ['name', 'category', 'subcategory', 'category_note', 'description', 'address', 'city', 'state', 'zip', 'phone', 'website', 'instagram', 'facebook']
const clean = (v) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') || null : v ?? null)

export async function POST(req) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  let submissionId
  try {
    const body = await req.json()
    submissionId = body.submissionId || body.record?.id || body.id
  } catch {
    submissionId = new URL(req.url).searchParams.get('submissionId')
  }

  const { data: submission, error } = await supabase.from('submissions').select('*').eq('id', submissionId).single()
  if (error || !submission) {
    return Response.json({ error: 'Submission not found' }, { status: 404 })
  }
  // Only review fresh submissions, so a retried webhook can't add the same business twice
  if (submission.review_status !== 'pending' || submission.review_notes) {
    return Response.json({ decision: submission.review_status })
  }

  // 1. Clean
  const listing = {}
  TEXT_FIELDS.forEach((k) => { listing[k] = clean(submission[k]) })
  listing.category = LEGACY_CATEGORIES[listing.category] || listing.category
  listing.is_lao_owned = submission.is_lao_owned

  // 2. Enrich
  let google = null
  try {
    google = await findOnGoogle(listing)
  } catch (err) {
    console.error('Google enrichment failed', err)
  }
  const extra = {} // fields only the businesses table has
  if (google) {
    for (const k of ['address', 'city', 'zip', 'phone', 'website']) {
      if (!listing[k] && google[k]) listing[k] = google[k]
    }
    listing.google_url = google.google_url
    Object.assign(extra, {
      place_id: google.place_id, lat: google.lat, lng: google.lng, rating: google.rating,
      photo_url: google.photo_url, formatted_address: google.formatted_address,
    })
  }

  // 3. AI review
  const prompt = `You are reviewing a business submission for LaoList, a directory of Lao-owned and Lao-inspired businesses in the United States.

Submission:
- Name: ${listing.name}
- Category: ${listing.category}
- Subcategory: ${listing.subcategory || ''}${listing.category_note ? ` (described as: ${listing.category_note})` : ''}
- Description: ${listing.description || ''}
- Address: ${listing.address || ''}
- City: ${listing.city || ''}
- State: ${listing.state || ''}
- Website: ${listing.website || ''}
- Instagram: ${listing.instagram || ''}
- Is Lao Owned: ${listing.is_lao_owned}
- Submitter Email: ${submission.submitter_email}
${google ? `\nGoogle Maps found a matching place: ${google.name}, ${google.formatted_address}${google.types?.length ? ` (types: ${google.types.join(', ')})` : ''}\n` : ''}
Approve if it looks like a real, legitimate business or organization with a connection to the Lao community. Reject if it looks like spam, a test, is missing a name or category, or has no apparent connection to the Lao community.

Also write a listing description: one or two plain sentences saying what the business is and where. Use only the facts above; do not invent menu items, services, history or claims. Keep any useful detail the submitter gave (for example a former name).

Respond in this exact format:
DECISION: approved or rejected
NOTES: your brief reasoning
DESCRIPTION: the listing description`

  let response
  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    })
    response = message.content[0].text
  } catch (err) {
    // Leave it pending with a note so a person can review it by hand
    await supabase.from('submissions')
      .update({ review_notes: 'Automatic review failed: ' + (err?.message || 'unknown error') })
      .eq('id', submissionId)
    return Response.json({ decision: 'pending' })
  }

  const approved = response.includes('DECISION: approved')
  const notes = response.split('NOTES:')[1]?.split('DESCRIPTION:')[0]?.trim() || ''
  const aiDescription = response.split('DESCRIPTION:')[1]?.trim()
  // Keep the submitter's description when it says something; replace it when it's thin
  if (aiDescription && (!listing.description || listing.description.length < 80)) {
    listing.description = aiDescription
  }

  if (!approved) {
    await supabase.from('submissions').update({ review_status: 'rejected', review_notes: notes }).eq('id', submissionId)
    return Response.json({ decision: 'rejected', notes })
  }

  // 4. Guardrail
  const hasLink = !!(listing.website || listing.instagram || listing.facebook)
  const missing = []
  if (!listing.address && !hasLink) missing.push('a street address or a website/social link')
  if (!listing.state) missing.push('a state')
  const enrichNote = google ? ' Enriched from Google Maps.' : ''

  if (missing.length) {
    // Save the cleaned version so whoever finishes it starts from there
    const held = `Held for review: missing ${missing.join(' and ')}.${enrichNote} AI review: ${notes}`
    await supabase.from('submissions')
      .update({ ...listing, review_status: 'needs_info', review_notes: held })
      .eq('id', submissionId)
    return Response.json({ decision: 'needs_info', notes: held })
  }

  const formatted = extra.formatted_address ||
    [listing.address, listing.city, [listing.state, listing.zip].filter(Boolean).join(' ')].filter(Boolean).join(', ') || null
  const { error: insertError } = await supabase.from('businesses').insert([{
    ...listing,
    ...extra,
    formatted_address: formatted,
    source: google ? 'submission+google' : 'submission',
    status: 'active',
  }])
  if (insertError) {
    await supabase.from('submissions')
      .update({ review_notes: 'Approved but could not publish: ' + insertError.message })
      .eq('id', submissionId)
    return Response.json({ decision: 'pending' })
  }

  await supabase.from('submissions')
    .update({ ...listing, review_status: 'approved', review_notes: notes + enrichNote })
    .eq('id', submissionId)
  return Response.json({ decision: 'approved', notes })
}

// Looks the business up on Google Maps (Places API, New). Returns null without a key or a confident match.
async function findOnGoogle(listing) {
  const key = process.env.GOOGLE_PLACES_API_KEY
  if (!key || !listing.name) return null
  const query = [listing.name, listing.address, listing.city, listing.state].filter(Boolean).join(', ')
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.addressComponents,places.location,places.internationalPhoneNumber,places.websiteUri,places.rating,places.googleMapsUri,places.photos,places.types',
    },
    body: JSON.stringify({ textQuery: query, maxResultCount: 3, regionCode: 'US' }),
  })
  if (!res.ok) throw new Error('Places search ' + res.status)
  const { places = [] } = await res.json()

  for (const p of places) {
    const comp = (type) => p.addressComponents?.find((c) => c.types?.includes(type))
    const state = comp('administrative_area_level_1')
    const sameState = !listing.state || [state?.longText, state?.shortText].some((s) => s && s.toLowerCase() === listing.state.toLowerCase())
    if (!sameState || !namesMatch(listing.name, p.displayName?.text)) continue

    let photo_url = null
    if (p.photos?.[0]?.name) {
      const ph = await fetch(`https://places.googleapis.com/v1/${p.photos[0].name}/media?maxWidthPx=800&skipHttpRedirect=true&key=${key}`)
      if (ph.ok) photo_url = (await ph.json()).photoUri || null
    }
    const street = [comp('street_number')?.longText, comp('route')?.shortText].filter(Boolean).join(' ')
    return {
      name: p.displayName?.text,
      place_id: p.id,
      address: street || null,
      city: comp('locality')?.longText || comp('sublocality')?.longText || null,
      zip: comp('postal_code')?.longText || null,
      formatted_address: p.formattedAddress?.replace(/, USA$/, '') || null,
      phone: p.internationalPhoneNumber || null,
      website: p.websiteUri || null,
      rating: p.rating ?? null,
      lat: p.location?.latitude ?? null,
      lng: p.location?.longitude ?? null,
      google_url: p.googleMapsUri || null,
      photo_url,
      types: p.types || [],
    }
  }
  return null
}

// True when most of the distinctive words in the shorter name appear in the other
function namesMatch(a, b) {
  if (!a || !b) return false
  const stop = new Set(['the', 'and', 'of', 'llc', 'inc', 'co', 'restaurant', 'cafe'])
  const words = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((w) => w && !stop.has(w))
  const [x, y] = [words(a), words(b)]
  if (!x.length || !y.length) return false
  const [short, long] = x.length <= y.length ? [x, new Set(y)] : [y, new Set(x)]
  return short.filter((w) => long.has(w)).length / short.length >= 0.6
}

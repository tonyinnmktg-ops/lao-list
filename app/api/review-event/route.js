const Anthropic = require('@anthropic-ai/sdk').default
const { createClient } = require('@supabase/supabase-js')

// Reviews a new event submission. Called by a Supabase database webhook on insert.
// Same pattern as business submissions: AI checks it's a real Lao community event,
// a guardrail checks it has enough detail, and only then is it published.
// Held events ('needs_info') can be finished and published by a person.

export const maxDuration = 30

const TYPES = ['Festival & Holiday', 'Food Pop-up', 'Community & Nonprofit', 'Arts & Nightlife']
const TEXT = ['title', 'type', 'description', 'venue_name', 'address', 'city', 'state', 'url', 'organizer']
const clean = (v) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') || null : v ?? null)
const toUrl = (v) => (!v || /^https?:\/\//i.test(v) ? v : 'https://' + v.replace(/^\/+/, ''))

export async function POST(req) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  let submissionId
  try {
    const body = await req.json()
    submissionId = body.submissionId || body.record?.id || body.id
  } catch {}
  if (!submissionId) return Response.json({ error: 'Missing submissionId' }, { status: 400 })

  const { data: sub } = await supabase.from('event_submissions').select('*').eq('id', submissionId).single()
  if (!sub) return Response.json({ error: 'Submission not found' }, { status: 404 })
  // Only review fresh submissions, so a retried webhook can't publish twice
  if (sub.review_status !== 'pending' || sub.review_notes) return Response.json({ decision: sub.review_status })

  const event = {}
  TEXT.forEach((k) => { event[k] = clean(sub[k]) })
  Object.assign(event, {
    start_date: sub.start_date, end_date: sub.end_date, start_time: sub.start_time, end_time: sub.end_time,
    is_online: !!sub.is_online, url: toUrl(event.url),
  })

  const prompt = `You are reviewing an event submitted to LaoList, a directory of Lao American businesses and community life in the United States.

Event:
- Name: ${event.title}
- Type: ${event.type}
- Dates: ${event.start_date}${event.end_date ? ' to ' + event.end_date : ''} ${event.start_time || ''}${event.end_time ? '-' + event.end_time : ''}
- Online: ${event.is_online}
- Venue: ${event.venue_name || ''}
- Address: ${[event.address, event.city, event.state].filter(Boolean).join(', ')}
- Organizer: ${event.organizer || ''}
- Link: ${event.url || ''}
- Description: ${event.description || ''}
- Submitter email: ${sub.submitter_email}

Approve if it looks like a real event with a connection to the Lao community (Lao culture, food, temples, organizations, artists or Lao-owned businesses). Reject spam, tests, commercial ads with no Lao connection, and anything offensive.
Do not reject because a time, address or other detail is missing; completeness is checked separately.

Also write an event description: one or two plain sentences saying what the event is. Use only the facts above; do not invent activities, prices or performers. If the submitted description is good, lightly tidy it instead.

Respond in this exact format:
DECISION: approved or rejected
NOTES: your brief reasoning
DESCRIPTION: the event description`

  let text
  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    })
    text = message.content[0].text
  } catch (err) {
    await supabase.from('event_submissions')
      .update({ review_notes: 'Automatic review failed: ' + (err?.message || 'unknown error') })
      .eq('id', submissionId)
    return Response.json({ decision: 'pending' })
  }

  const approved = text.includes('DECISION: approved')
  const notes = text.split('NOTES:')[1]?.split('DESCRIPTION:')[0]?.trim() || ''
  const description = text.split('DESCRIPTION:')[1]?.trim()
  if (description) event.description = description

  if (!approved) {
    await supabase.from('event_submissions').update({ review_status: 'rejected', review_notes: notes }).eq('id', submissionId)
    return Response.json({ decision: 'rejected', notes })
  }

  // Guardrail: a known type, a date that hasn't passed, a state (unless online), and a place or a link
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago' }).format(new Date())
  const missing = []
  if (!TYPES.includes(event.type)) missing.push('a valid event type')
  if (!event.start_date || (event.end_date || event.start_date) < today) missing.push('an upcoming date')
  if (!event.is_online && !event.state) missing.push('a state')
  if (!event.address && !event.venue_name && !event.url) missing.push('a venue, address or event link')

  if (missing.length) {
    const held = `Held for review: missing ${missing.join(', ')}. AI review: ${notes}`
    await supabase.from('event_submissions').update({ review_status: 'needs_info', review_notes: held }).eq('id', submissionId)
    return Response.json({ decision: 'needs_info', notes: held })
  }

  const { data: created, error } = await supabase
    .from('events')
    .insert([{ ...event, status: 'active', source: 'submission' }])
    .select('id')
    .single()
  if (error) {
    await supabase.from('event_submissions')
      .update({ review_notes: 'Approved but could not publish: ' + error.message })
      .eq('id', submissionId)
    return Response.json({ decision: 'pending' })
  }

  await supabase.from('event_submissions')
    .update({ review_status: 'approved', review_notes: notes, event_id: created.id })
    .eq('id', submissionId)
  return Response.json({ decision: 'approved', notes })
}

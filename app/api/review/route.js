const Anthropic = require('@anthropic-ai/sdk').default
const { createClient } = require('@supabase/supabase-js')

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Old form values, in case a submission made before the category update is approved later
const LEGACY_CATEGORIES = {
  restaurant: 'Food & Beverage',
  nonprofit: 'Community & Faith',
  service: 'Professional Services',
  retail: 'Retail',
  Services: 'Professional Services',
}

export async function POST(req) {
  let submissionId
try {
  const body = await req.json()
  if (body.submissionId) {
    submissionId = body.submissionId
  } else if (body.record && body.record.id) {
    submissionId = body.record.id
  } else if (body.id) {
    submissionId = body.id
  }
} catch {
  const url = new URL(req.url)
  submissionId = url.searchParams.get('submissionId')
}

  const { data: submission, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', submissionId)
    .single()

  if (error || !submission) {
    return Response.json({ error: 'Submission not found' }, { status: 404 })
  }
  // Only review fresh submissions, so a retried webhook can't add the same business twice
  if (submission.review_status !== 'pending' || submission.review_notes) {
    return Response.json({ decision: submission.review_status })
  }

  const prompt = `You are reviewing a business submission for LaoList, a directory of Lao-owned and Lao-inspired businesses in the United States.

Here is the submission:
- Name: ${submission.name}
- Category: ${submission.category}
- Subcategory: ${submission.subcategory || ''}${submission.category_note ? ` (described as: ${submission.category_note})` : ''}
- Description: ${submission.description}
- City: ${submission.city}
- State: ${submission.state}
- Website: ${submission.website}
- Is Lao Owned: ${submission.is_lao_owned}
- Submitter Email: ${submission.submitter_email}

Please review this submission and determine if it should be approved or rejected. Approve if it looks like a real, legitimate business or organization with a connection to the Lao community. Reject if it looks like spam, is missing critical information like a name or category, or has no apparent connection to the Lao community.

Respond in this exact format:
DECISION: approved or rejected
NOTES: your brief reasoning`

  let response
  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }]
    })
    response = message.content[0].text
  } catch (err) {
    // Leave it pending with a note so a person can review it by hand
    await supabase
      .from('submissions')
      .update({ review_notes: 'Automatic review failed: ' + (err?.message || 'unknown error') })
      .eq('id', submissionId)
    return Response.json({ decision: 'pending' })
  }

  const decision = response.includes('DECISION: approved') ? 'approved' : 'rejected'
  const notes = response.split('NOTES:')[1]?.trim() || ''

  if (decision === 'approved') {
    await supabase.from('businesses').insert([{
      name: submission.name,
      category: LEGACY_CATEGORIES[submission.category] || submission.category,
      subcategory: submission.subcategory || null,
      category_note: submission.category_note || null,
      description: submission.description,
      address: submission.address,
      formatted_address: [submission.address, submission.city, [submission.state, submission.zip].filter(Boolean).join(' ')]
        .filter(Boolean).join(', ') || null,
      city: submission.city,
      state: submission.state,
      zip: submission.zip,
      phone: submission.phone,
      website: submission.website,
      instagram: submission.instagram,
      facebook: submission.facebook,
      is_lao_owned: submission.is_lao_owned,
      status: 'active'
    }])
  }

  await supabase
    .from('submissions')
    .update({ review_status: decision, review_notes: notes })
    .eq('id', submissionId)

  return Response.json({ decision, notes })
}

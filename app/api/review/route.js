const Anthropic = require('@anthropic-ai/sdk').default
const { createClient } = require('@supabase/supabase-js')

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  const { submissionId } = await req.json()

  const { data: submission, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', submissionId)
    .single()

  if (error || !submission) {
    return Response.json({ error: 'Submission not found' }, { status: 404 })
  }

  const prompt = `You are reviewing a business submission for Lao List, a directory of Lao-owned and Lao-inspired businesses in the United States.

Here is the submission:
- Name: ${submission.name}
- Category: ${submission.category}
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

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    messages: [{ role: 'user', content: prompt }]
  })

  const response = message.content[0].text
  const decision = response.includes('DECISION: approved') ? 'approved' : 'rejected'
  const notes = response.split('NOTES:')[1]?.trim() || ''

  if (decision === 'approved') {
    await supabase.from('businesses').insert([{
      name: submission.name,
      category: submission.category,
      description: submission.description,
      address: submission.address,
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

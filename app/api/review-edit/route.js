const Anthropic = require('@anthropic-ai/sdk').default
const { createClient } = require('@supabase/supabase-js')

// Screens a suggested listing edit for spam, then emails the team.
// It never changes the live listing: approved edits are applied by hand with
//   select apply_listing_edit('<edit id>');

const LABELS = {
  name: 'Name', category: 'Category', subcategory: 'Subcategory', category_note: 'Business type note', description: 'Description',
  formatted_address: 'Address', phone: 'Phone', website: 'Website', instagram: 'Instagram',
  facebook: 'Facebook', is_lao_owned: 'Lao owned',
}

export async function POST(req) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  let editId
  try {
    editId = (await req.json()).editId
  } catch {}
  if (!editId) return Response.json({ error: 'Missing editId' }, { status: 400 })

  const { data: edit } = await supabase.from('listing_edits').select('*').eq('id', editId).single()
  // Only screen fresh suggestions, so re-posting an id does nothing
  if (!edit || edit.review_status !== 'pending' || edit.review_notes) {
    return Response.json({ ok: true })
  }
  const { data: biz } = await supabase.from('businesses').select('*').eq('id', edit.business_id).single()

  const lines = Object.entries(edit.changes).map(
    ([k, v]) => `- ${LABELS[k] || k}: "${edit.original[k] ?? ''}" → "${v ?? ''}"`
  )
  if (edit.mark_closed) lines.push('- Reported as PERMANENTLY CLOSED')
  const summary = lines.join('\n') || '(no field changes)'

  let decision = 'approved'
  let notes = ''
  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `You are screening a suggested edit to a listing on LaoList, a directory of Lao-owned and Lao-inspired businesses in the United States. A person will make the final decision; your job is only to catch spam, abuse or nonsense.

Listing: ${biz?.name} (${biz?.category}, ${biz?.city}, ${biz?.state})
Submitted by: ${edit.relationship} <${edit.submitter_email}>
Suggested changes:
${summary}
Note from submitter: ${edit.note || '(none)'}

Mark it spam if it is advertising, gibberish, offensive, or plainly unrelated to this business. Otherwise mark it ok, even if you cannot verify it.

Respond in this exact format:
DECISION: ok or spam
NOTES: one short sentence`,
      }],
    })
    const text = message.content[0].text
    decision = text.includes('DECISION: spam') ? 'spam' : 'approved'
    notes = text.split('NOTES:')[1]?.trim() || ''
  } catch (err) {
    // If screening fails, leave it for a person to look at
    decision = 'pending'
    notes = 'Automatic screening failed: ' + (err?.message || 'unknown error')
  }

  await supabase.from('listing_edits').update({ review_status: decision, review_notes: notes }).eq('id', editId)

  if (decision !== 'spam') await notify({ edit, biz, summary, notes })

  return Response.json({ ok: true })
}

// Optional email via Resend (https://resend.com). Skipped unless RESEND_API_KEY is set.
async function notify({ edit, biz, summary, notes }) {
  const key = process.env.RESEND_API_KEY
  const to = process.env.EDIT_NOTIFY_EMAIL
  if (!key || !to) return
  const site = process.env.NEXT_PUBLIC_SITE_URL || ''
  const text = `New suggested edit for ${biz?.name} (${biz?.city}, ${biz?.state})

From: ${edit.relationship} <${edit.submitter_email}>

${summary}

Note: ${edit.note || '(none)'}
Screening: ${notes}

Listing: ${site}/business/${edit.business_id}

To apply it, run this in the Supabase SQL editor:
select apply_listing_edit('${edit.id}');`
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.EDIT_NOTIFY_FROM || 'LaoList <onboarding@resend.dev>',
        to: [to],
        reply_to: edit.submitter_email,
        subject: `Suggested edit: ${biz?.name}`,
        text,
      }),
    })
  } catch {}
}

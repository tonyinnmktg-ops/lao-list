const { createClient } = require('@supabase/supabase-js')
const sharp = require('sharp')
const { randomUUID } = require('crypto')

// Takes a profile photo from the submit form, re-encodes it on the server
// (square 400px JPEG, metadata stripped) and stores it in the public "avatars" bucket.
// The bucket has no public upload policy; only this route can write to it.

export const runtime = 'nodejs'
const MAX_BYTES = 4 * 1024 * 1024 // the form shrinks photos first; Vercel caps bodies at 4.5 MB

export async function POST(req) {
  let file
  try {
    file = (await req.formData()).get('file')
  } catch {
    return Response.json({ error: 'No file' }, { status: 400 })
  }
  if (!file || typeof file.arrayBuffer !== 'function') return Response.json({ error: 'No file' }, { status: 400 })
  if (file.size > MAX_BYTES) return Response.json({ error: 'Photo is too large (4 MB max).' }, { status: 413 })

  let jpeg
  try {
    const input = Buffer.from(await file.arrayBuffer())
    const meta = await sharp(input, { limitInputPixels: 40_000_000 }).metadata()
    if (!['jpeg', 'png', 'webp', 'heif', 'avif', 'gif'].includes(meta.format)) throw new Error('format')
    jpeg = await sharp(input, { limitInputPixels: 40_000_000 })
      .rotate() // respect phone orientation
      .resize(400, 400, { fit: 'cover', position: 'attention' })
      .flatten({ background: '#ffffff' })
      .jpeg({ quality: 84, mozjpeg: true })
      .toBuffer()
  } catch {
    return Response.json({ error: 'That file doesn’t look like a photo. Try a JPG or PNG.' }, { status: 415 })
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const path = `submissions/${randomUUID()}.jpg`
  const { error } = await supabase.storage.from('avatars').upload(path, jpeg, { contentType: 'image/jpeg', upsert: false })
  if (error) return Response.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return Response.json({ url: data.publicUrl })
}

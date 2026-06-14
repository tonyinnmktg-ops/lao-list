const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabase = createClient(
  'https://zqarmyvtdmbwulpobymh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxYXJteXZ0ZG1id3VscG9ieW1oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk4NDI0MywiZXhwIjoyMDg3NTYwMjQzfQ.7YxUXvNg-9vqBLzpTp8JahlllsHIcj1X4xzYYQFlJBc'
)

const data = JSON.parse(fs.readFileSync('./scripts/photos.json', 'utf8'))

async function updatePhotos() {
  let updated = 0
  let skipped = 0

  for (const item of data) {
    if (!item.title || !item.imageUrl) { skipped++; continue }

    const { error } = await supabase
      .from('businesses')
      .update({ photo_url: item.imageUrl })
      .eq('name', item.title)

    if (error) {
      console.log('Error updating:', item.title, error.message)
      skipped++
    } else {
      console.log('Updated:', item.title)
      updated++
    }
  }

  console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}`)
}

updatePhotos()

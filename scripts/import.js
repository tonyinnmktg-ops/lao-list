const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabase = createClient(
  'https://zqarmyvtdmbwulpobymh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxYXJteXZ0ZG1id3VscG9ieW1oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk4NDI0MywiZXhwIjoyMDg3NTYwMjQzfQ.7YxUXvNg-9vqBLzpTp8JahlllsHIcj1X4xzYYQFlJBc'
)

const data = JSON.parse(fs.readFileSync('./scripts/data.json', 'utf8'))

async function importBusinesses() {
  let imported = 0
  let skipped = 0

  for (const item of data) {
    if (!item.title) { skipped++; continue }

    const business = {
      name: item.title || null,
      category: item.categoryName || 'other',
      description: item.description || null,
      address: item.street || null,
      city: item.city || null,
      state: item.state || null,
      zip: item.postalCode || null,
      phone: item.phone || null,
      website: item.website !== 'undefined' ? item.website : null,
      instagram: null,
      facebook: null,
      is_lao_owned: true,
      status: 'active'
    }

    const { error } = await supabase.from('businesses').insert([business])
    if (error) {
      console.log('Error inserting:', item.title, error.message)
      skipped++
    } else {
      console.log('Imported:', item.title)
      imported++
    }
  }

  console.log(`\nDone. Imported: ${imported}, Skipped: ${skipped}`)
}

importBusinesses()

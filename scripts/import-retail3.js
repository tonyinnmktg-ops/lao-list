const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabase = createClient(
  'https://zqarmyvtdmbwulpobymh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxYXJteXZ0ZG1id3VscG9ieW1oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk4NDI0MywiZXhwIjoyMDg3NTYwMjQzfQ.7YxUXvNg-9vqBLzpTp8JahlllsHIcj1X4xzYYQFlJBc'
)

const approved = [
  'Laos Asian Market',
  'Laos Oriental Grocery',
  'Wat phou market',
  "Lovan's Asian Market",
  'Mekong Market'
]

const data = JSON.parse(fs.readFileSync('./scripts/retail3.json', 'utf8'))

async function importRetail3() {
  let imported = 0
  let skipped = 0

  for (const item of data) {
    if (!approved.includes(item.title)) { skipped++; continue }

    const business = {
      name: item.title || null,
      category: 'retail',
      description: item.description || null,
      address: item.street || null,
      city: item.city || null,
      state: item.state || null,
      zip: item.postalCode || null,
      phone: item.phone || null,
      website: item.website !== 'undefined' ? item.website : null,
      google_url: item.url || null,
      photo_url: item.imageUrl || null,
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

importRetail3()

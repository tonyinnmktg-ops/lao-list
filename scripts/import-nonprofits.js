const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabase = createClient(
  'https://zqarmyvtdmbwulpobymh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxYXJteXZ0ZG1id3VscG9ieW1oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk4NDI0MywiZXhwIjoyMDg3NTYwMjQzfQ.7YxUXvNg-9vqBLzpTp8JahlllsHIcj1X4xzYYQFlJBc'
)

const approved = [
  'Lao America',
  'Lao Center of Minnesota',
  'Lao Family Community Development, Inc',
  'Lao Family Community Development',
  'Merced Lao Family Community Inc',
  'Merced Lao Family Community',
  'Laotian American Community of Fresno',
  'Lao Family Community Empowerment, Inc',
  'Center For Lao Studies',
  'Mekong NYC',
  'Southeast Asia Resource Action Center (SEARAC)',
  'Indo-Chinese Association',
  'Friends Without A Border'
]

const data = JSON.parse(fs.readFileSync('./scripts/nonprofits.json', 'utf8'))

async function importNonprofits() {
  let imported = 0
  let skipped = 0

  for (const item of data) {
    if (!approved.includes(item.title)) { skipped++; continue }

    const business = {
      name: item.title || null,
      category: 'nonprofit',
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

importNonprofits()

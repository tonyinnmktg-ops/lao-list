const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function GET() {
  const { count } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })

  return Response.json({ ok: true, businesses: count, pinged: new Date().toISOString() })
}

module.exports = { GET }

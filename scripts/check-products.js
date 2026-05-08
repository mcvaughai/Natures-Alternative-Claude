const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://ezryfycxfmtffobyfjfa.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .limit(1)

  if (data && data[0]) {
    console.log('Products table columns:')
    console.log(JSON.stringify(Object.keys(data[0])))
    console.log('\nSample row:')
    console.log(JSON.stringify(data[0], null, 2))
  } else {
    console.log('No rows found, trying column introspection via empty result...')
    const { data: d2, error: e2 } = await supabase.from('products').select('*').limit(0)
    console.log('empty result error:', e2)
  }

  if (error) console.error('Error:', error)
}

checkProducts()

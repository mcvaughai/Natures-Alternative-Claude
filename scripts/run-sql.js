const fs = require('fs')
const path = require('path')

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const SUPABASE_URL = 'https://ezryfycxfmtffobyfjfa.supabase.co'

async function runSQL() {
  const sql = fs.readFileSync(
    path.join(__dirname, '..', 'database', 'fix-products-rls.sql'),
    'utf8'
  )

  console.log('Running SQL via Supabase Management API...')

  // Extract project ref from URL
  const projectRef = 'ezryfycxfmtffobyfjfa'

  const response = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    }
  )

  const text = await response.text()
  if (response.ok) {
    console.log('SQL ran successfully!')
    console.log('Response:', text)
  } else {
    console.error('Management API failed (status', response.status + '):', text)
    console.log('\nTrying exec_sql RPC...')
    await tryRPC(sql)
  }
}

async function tryRPC(sql) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
    {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql }),
    }
  )

  const text = await response.text()
  if (response.ok) {
    console.log('exec_sql RPC succeeded!')
    console.log('Response:', text)
  } else {
    console.error('exec_sql RPC also failed (status', response.status + '):', text)
    console.log('\n--- Both methods failed. Run this SQL manually in the Supabase dashboard ---\n')
  }
}

runSQL().catch(console.error)

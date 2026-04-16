require('dotenv').config({ path: '.env.local' })

async function queryTables() {
  console.log('Querying Plus1Rewards database tables...\n')
  
  const response = await fetch(
    `${process.env.PLUS1_SUPABASE_URL}/rest/v1/`,
    {
      headers: {
        'apikey': process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY}`
      }
    }
  )
  
  const data = await response.json()
  console.log('API Response:', data)
  
  // Try to list tables by checking what endpoints exist
  console.log('\nTrying common table names:')
  const tablesToCheck = ['dependants', 'dependents', 'linked_people', 'member_dependants', 'member_dependents']
  
  for (const table of tablesToCheck) {
    const testResponse = await fetch(
      `${process.env.PLUS1_SUPABASE_URL}/rest/v1/${table}?limit=0`,
      {
        headers: {
          'apikey': process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY}`
        }
      }
    )
    
    if (testResponse.ok) {
      console.log(`  ✅ ${table} - EXISTS`)
    } else {
      const error = await testResponse.json()
      console.log(`  ❌ ${table} - ${error.message}`)
    }
  }
}

queryTables()

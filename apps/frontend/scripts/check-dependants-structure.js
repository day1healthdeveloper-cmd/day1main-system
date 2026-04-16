require('dotenv').config({ path: '.env.local' })

async function checkStructure() {
  // Try to get the table structure
  const response = await fetch(
    `${process.env.PLUS1_SUPABASE_URL}/rest/v1/dependants?limit=1`,
    {
      headers: {
        'apikey': process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY}`
      }
    }
  )
  
  console.log('GET dependants status:', response.status)
  const data = await response.json()
  console.log('Data:', data)
  
  // Check if it's actually a view
  console.log('\nChecking if dependants is a view or table...')
  
  // Try OPTIONS request
  const optionsResponse = await fetch(
    `${process.env.PLUS1_SUPABASE_URL}/rest/v1/dependants`,
    {
      method: 'OPTIONS',
      headers: {
        'apikey': process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY}`
      }
    }
  )
  
  console.log('OPTIONS status:', optionsResponse.status)
  console.log('Headers:', Object.fromEntries(optionsResponse.headers.entries()))
}

checkStructure()

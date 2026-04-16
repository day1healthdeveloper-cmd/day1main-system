require('dotenv').config({ path: '.env.local' })

async function forceUpdate() {
  console.log('Force updating price to 931...\n')
  
  // First check current value
  const checkResponse = await fetch(
    `${process.env.PLUS1_SUPABASE_URL}/rest/v1/members?cell_phone=eq.0795320781&select=id,cover_plan_price`,
    {
      headers: {
        'apikey': process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY}`
      }
    }
  )
  
  const checkData = await checkResponse.json()
  console.log('Current value:', checkData[0].cover_plan_price)
  console.log('Member ID:', checkData[0].id)
  
  // Update by ID instead of phone
  const updateResponse = await fetch(
    `${process.env.PLUS1_SUPABASE_URL}/rest/v1/members?id=eq.${checkData[0].id}`,
    {
      method: 'PATCH',
      headers: {
        'apikey': process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        cover_plan_price: 931
      })
    }
  )
  
  console.log('\nUpdate response status:', updateResponse.status)
  
  if (!updateResponse.ok) {
    const errorText = await updateResponse.text()
    console.error('Error:', errorText)
    return
  }
  
  const result = await updateResponse.json()
  console.log('Updated value:', result[0].cover_plan_price)
  console.log('Type:', typeof result[0].cover_plan_price)
}

forceUpdate()

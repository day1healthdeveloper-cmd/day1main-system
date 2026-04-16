require('dotenv').config({ path: '.env.local' })

async function debugUpdate() {
  const mobile = '0795320781'
  const newPremium = 931
  
  console.log('Environment check:')
  console.log('PLUS1_SUPABASE_URL:', process.env.PLUS1_SUPABASE_URL)
  console.log('PLUS1_SUPABASE_SERVICE_ROLE_KEY:', process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET')
  console.log('')
  
  const url = `${process.env.PLUS1_SUPABASE_URL}/rest/v1/members?cell_phone=eq.${encodeURIComponent(mobile)}`
  console.log('Update URL:', url)
  console.log('')
  
  const updateResponse = await fetch(url, {
    method: 'PATCH',
    headers: {
      'apikey': process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      cover_plan_price: String(newPremium)
    })
  })
  
  console.log('Response status:', updateResponse.status)
  console.log('Response headers:', Object.fromEntries(updateResponse.headers.entries()))
  
  const responseText = await updateResponse.text()
  console.log('Response body:', responseText)
  
  if (updateResponse.ok) {
    const result = JSON.parse(responseText)
    console.log('\nUpdated rows:', result.length)
    if (result.length > 0) {
      console.log('New price:', result[0].cover_plan_price)
    }
  }
}

debugUpdate()

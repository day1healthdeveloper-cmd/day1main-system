require('dotenv').config({ path: '.env.local' })

async function updatePremium() {
  const mobile = '0795320781'
  const newPremium = 931
  
  console.log('Updating Plus1Rewards premium for:', mobile)
  console.log('New premium:', newPremium)
  
  const updateResponse = await fetch(
    `${process.env.PLUS1_SUPABASE_URL}/rest/v1/members?cell_phone=eq.${encodeURIComponent(mobile)}`,
    {
      method: 'PATCH',
      headers: {
        'apikey': process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        cover_plan_price: newPremium,
        plan_status: 'active'
      })
    }
  )
  
  if (!updateResponse.ok) {
    const errorText = await updateResponse.text()
    console.error('Failed:', errorText)
    return
  }
  
  const result = await updateResponse.json()
  console.log('Success! Updated', result.length, 'row(s)')
  console.log('New price:', result[0].cover_plan_price)
}

updatePremium()

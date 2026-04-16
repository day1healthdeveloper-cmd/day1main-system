require('dotenv').config({ path: '.env.local' })

async function finalUpdate() {
  console.log('Final update for Theo in Plus1Rewards members table...\n')
  
  const updateResponse = await fetch(
    `${process.env.PLUS1_SUPABASE_URL}/rest/v1/members?id=eq.60f1722a-98c9-4cd2-8d14-a052810f5234`,
    {
      method: 'PATCH',
      headers: {
        'apikey': process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        cover_plan_price: '931',
        cover_plan_variant: 'Family',
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
  console.log('Success!')
  console.log('Name:', result[0].first_name, result[0].last_name)
  console.log('cover_plan_price:', result[0].cover_plan_price)
  console.log('cover_plan_variant:', result[0].cover_plan_variant)
  console.log('plan_status:', result[0].plan_status)
}

finalUpdate()

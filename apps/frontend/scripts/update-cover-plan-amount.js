require('dotenv').config({ path: '.env.local' })

async function updateCoverPlan() {
  console.log('Updating member_cover_plans target_amount to 931...\n')
  
  const updateResponse = await fetch(
    `${process.env.PLUS1_SUPABASE_URL}/rest/v1/member_cover_plans?id=eq.34294955-c5d9-4852-ad5a-a1a771253b01`,
    {
      method: 'PATCH',
      headers: {
        'apikey': process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        target_amount: 931,
        funded_amount: 931
      })
    }
  )
  
  if (!updateResponse.ok) {
    const errorText = await updateResponse.text()
    console.error('Error:', errorText)
    return
  }
  
  const result = await updateResponse.json()
  console.log('Success!')
  console.log('New target_amount:', result[0].target_amount)
  console.log('New funded_amount:', result[0].funded_amount)
}

updateCoverPlan()

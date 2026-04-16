require('dotenv').config({ path: '.env.local' })

async function updateTheo() {
  console.log('Updating Theo in Plus1Rewards...')
  console.log('Setting cover_plan_price to: 931')
  console.log('Setting cover_plan_variant to: Family\n')
  
  const updateResponse = await fetch(
    `${process.env.PLUS1_SUPABASE_URL}/rest/v1/members?cell_phone=eq.0795320781`,
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
  console.log('Success! Updated member:')
  console.log('Name:', result[0].first_name, result[0].last_name)
  console.log('Price:', result[0].cover_plan_price)
  console.log('Variant:', result[0].cover_plan_variant)
  console.log('Status:', result[0].plan_status)
}

updateTheo()

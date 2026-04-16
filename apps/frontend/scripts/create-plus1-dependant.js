require('dotenv').config({ path: '.env.local' })

async function createDependant() {
  // First get the Plus1 member ID
  const memberResponse = await fetch(
    `${process.env.PLUS1_SUPABASE_URL}/rest/v1/members?cell_phone=eq.0795320781&select=id,first_name,last_name`,
    {
      headers: {
        'apikey': process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY}`
      }
    }
  )
  
  const memberData = await memberResponse.json()
  console.log('Plus1 Member:', memberData[0])
  
  const plus1MemberId = memberData[0].id
  
  // Get member_cover_plan_id
  const coverPlanResponse = await fetch(
    `${process.env.PLUS1_SUPABASE_URL}/rest/v1/member_cover_plans?member_id=eq.${plus1MemberId}&select=id`,
    {
      headers: {
        'apikey': process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY}`
      }
    }
  )
  
  const coverPlanData = await coverPlanResponse.json()
  console.log('Cover Plan ID:', coverPlanData[0].id)
  
  const memberCoverPlanId = coverPlanData[0].id
  
  // Create dependant
  console.log('\nCreating dependant in Plus1Rewards...')
  
  const dependantResponse = await fetch(
    `${process.env.PLUS1_SUPABASE_URL}/rest/v1/dependants`,
    {
      method: 'POST',
      headers: {
        'apikey': process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        member_cover_plan_id: memberCoverPlanId,
        dependant_type: 'child',
        id_number: '1610086675084',
        first_name: 'Ri',
        last_name: 'du toit',
        linked_to_main_member_id: plus1MemberId,
        status: 'pending'
      })
    }
  )
  
  if (!dependantResponse.ok) {
    const errorText = await dependantResponse.text()
    console.error('Failed:', errorText)
    return
  }
  
  const result = await dependantResponse.json()
  console.log('Success! Created dependant:', result[0])
}

createDependant()

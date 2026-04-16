require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const plus1Supabase = createClient(
  process.env.PLUS1_SUPABASE_URL,
  process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY
)

async function checkCoverPlans() {
  console.log('Checking member_cover_plans for Theo...\n')
  
  // First get member ID
  const { data: member } = await plus1Supabase
    .from('members')
    .select('id, first_name, last_name')
    .eq('cell_phone', '0795320781')
    .single()
  
  console.log('Member:', member)
  
  // Get cover plans for this member
  const { data: coverPlans, error } = await plus1Supabase
    .from('member_cover_plans')
    .select('*')
    .eq('member_id', member.id)
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  console.log('\nCover plans:', coverPlans)
}

checkCoverPlans()

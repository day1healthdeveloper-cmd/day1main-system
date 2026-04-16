require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const plus1Supabase = createClient(
  process.env.PLUS1_SUPABASE_URL,
  process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY
)

async function checkMember() {
  console.log('Checking Plus1Rewards member: 0795320781\n')
  
  const { data, error } = await plus1Supabase
    .from('members')
    .select('cell_phone, first_name, last_name, cover_plan_name, cover_plan_price, plan_status')
    .eq('cell_phone', '0795320781')
    .single()
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  console.log('Member found:')
  console.log('Name:', data.first_name, data.last_name)
  console.log('Mobile:', data.cell_phone)
  console.log('Plan:', data.cover_plan_name)
  console.log('Price:', data.cover_plan_price)
  console.log('Status:', data.plan_status)
}

checkMember()

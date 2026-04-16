require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const plus1Supabase = createClient(
  process.env.PLUS1_SUPABASE_URL,
  process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY
)

async function testInsert() {
  console.log('Testing dependant insert using Supabase client...\n')
  
  const { data, error } = await plus1Supabase
    .from('dependants')
    .insert({
      member_cover_plan_id: '34294955-c5d9-4852-ad5a-a1a771253b01',
      dependant_type: 'child',
      id_number: '1610086675084',
      first_name: 'Ri',
      last_name: 'du toit',
      linked_to_main_member_id: '60f1722a-98c9-4cd2-8d14-a052810f5234',
      status: 'pending'
    })
    .select()
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  console.log('Success! Created dependant:', data[0])
}

testInsert()

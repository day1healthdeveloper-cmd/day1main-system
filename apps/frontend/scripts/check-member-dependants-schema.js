require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkSchema() {
  console.log('Checking member_dependants table schema...\n')
  
  // Get one row to see the columns
  const { data, error } = await supabase
    .from('member_dependants')
    .select('*')
    .limit(1)
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  if (data && data.length > 0) {
    console.log('Available columns:')
    Object.keys(data[0]).forEach(col => {
      console.log(`  - ${col}`)
    })
  } else {
    console.log('No data found, trying to get schema from error...')
    
    // Try inserting with a fake column to get schema info
    const { error: insertError } = await supabase
      .from('member_dependants')
      .insert({ fake_column_test: 'test' })
    
    console.log('Error message:', insertError?.message)
  }
}

checkSchema()

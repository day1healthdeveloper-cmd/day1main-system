require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const plus1Supabase = createClient(
  process.env.PLUS1_SUPABASE_URL,
  process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY
)

async function checkSchema() {
  console.log('Checking Plus1Rewards dependants table schema...\n')
  
  // Try to get any row to see columns
  const { data, error } = await plus1Supabase
    .from('dependants')
    .select('*')
    .limit(1)
  
  if (error) {
    console.error('Error:', error)
    
    // Try to insert a test row to see what columns are required
    const { error: insertError } = await plus1Supabase
      .from('dependants')
      .insert({ test: 'test' })
    
    console.log('\nInsert error (shows required columns):', insertError)
    return
  }
  
  if (data && data.length > 0) {
    console.log('Available columns:')
    Object.keys(data[0]).forEach(col => {
      console.log(`  - ${col}: ${typeof data[0][col]}`)
    })
  } else {
    console.log('Table is empty. Cannot determine schema from data.')
    console.log('Attempting insert to discover required fields...')
    
    const { error: insertError } = await plus1Supabase
      .from('dependants')
      .insert({})
    
    console.log('Error:', insertError)
  }
}

checkSchema()

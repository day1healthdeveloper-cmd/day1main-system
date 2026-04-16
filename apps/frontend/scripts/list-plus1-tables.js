require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const plus1Supabase = createClient(
  process.env.PLUS1_SUPABASE_URL,
  process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY
)

async function listTables() {
  console.log('Fetching all tables in Plus1Rewards database...\n')
  
  const { data, error } = await plus1Supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .order('table_name')
  
  if (error) {
    console.error('Error:', error)
    
    // Try alternative method
    console.log('\nTrying RPC method...')
    const { data: rpcData, error: rpcError } = await plus1Supabase
      .rpc('get_tables')
    
    if (rpcError) {
      console.error('RPC Error:', rpcError)
    } else {
      console.log('Tables:', rpcData)
    }
    return
  }
  
  console.log('Tables in Plus1Rewards:')
  data.forEach(table => {
    console.log(`  - ${table.table_name}`)
  })
}

listTables()

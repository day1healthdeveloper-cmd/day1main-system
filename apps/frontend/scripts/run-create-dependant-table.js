const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '../../.env.local' })

async function createTable() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 CREATING PLUS1_DEPENDANT_REQUESTS TABLE')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Read SQL file
  const sqlPath = path.join(__dirname, 'create-plus1-dependant-requests-table.sql')
  const sql = fs.readFileSync(sqlPath, 'utf8')

  console.log('📝 Executing SQL...\n')

  // Execute SQL
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

  if (error) {
    console.error('❌ Error creating table:', error.message)
    process.exit(1)
  }

  console.log('✅ Table created successfully!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

createTable()

require('dotenv').config({ path: '.env.local' })

async function getColumns() {
  const response = await fetch(
    `${process.env.PLUS1_SUPABASE_URL}/rest/v1/dependants?limit=0`,
    {
      method: 'GET',
      headers: {
        'apikey': process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY}`,
        'Prefer': 'return=representation'
      }
    }
  )
  
  const data = await response.json()
  
  console.log('Plus1Rewards dependants table columns:')
  console.log('(from empty result set)\n')
  
  if (data && data.length === 0) {
    console.log('Table exists but is empty')
    console.log('\nFrom error message, required columns include:')
    console.log('  - id (auto-generated)')
    console.log('  - member_cover_plan_id (required, NOT NULL)')
    console.log('  - dependant_type')
    console.log('  - id_number')
    console.log('  - linked_sa_main_member_id')
    console.log('  - status (default: pending)')
    console.log('  - created_at')
    console.log('  - first_name')
    console.log('  - last_name')
  }
}

getColumns()

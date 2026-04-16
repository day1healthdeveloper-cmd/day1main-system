require('dotenv').config({ path: '.env.local' })

async function directCheck() {
  const response = await fetch(
    `${process.env.PLUS1_SUPABASE_URL}/rest/v1/members?cell_phone=eq.0795320781&select=first_name,last_name,cover_plan_price,cover_plan_variant,plan_status`,
    {
      headers: {
        'apikey': process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY}`,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    }
  )
  
  const data = await response.json()
  console.log('Direct REST API result:')
  console.log(JSON.stringify(data[0], null, 2))
}

directCheck()

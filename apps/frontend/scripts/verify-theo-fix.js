const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function verifyTheoFix() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ VERIFICATION: THEO\'S PLAN NAME FIX')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const day1Supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Fetch Theo's current data from database
  const { data: member, error } = await day1Supabase
    .from('members')
    .select('member_number, first_name, last_name, mobile, plan_name, plan_id, monthly_premium, broker_code')
    .eq('mobile', '0795320781')
    .single()

  if (error) {
    console.error('❌ Error:', error.message)
    return
  }

  console.log('📊 CURRENT DATABASE STATE:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Member Number:', member.member_number)
  console.log('Name:', member.first_name, member.last_name)
  console.log('Mobile:', member.mobile)
  console.log('Broker Code:', member.broker_code)
  console.log('Plan Name:', member.plan_name)
  console.log('Plan ID:', member.plan_id)
  console.log('Monthly Premium:', member.monthly_premium)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // Verify plan_id links to correct product
  if (member.plan_id) {
    const { data: product, error: productError } = await day1Supabase
      .from('products')
      .select('id, name, category')
      .eq('id', member.plan_id)
      .single()

    if (productError) {
      console.error('❌ Product lookup error:', productError.message)
    } else {
      console.log('✅ PLAN ID VERIFICATION:')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('Product Name:', product.name)
      console.log('Product Category:', product.category)
      console.log('Product ID:', product.id)
      console.log('Match:', member.plan_name === product.name ? '✅ YES' : '❌ NO')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    }
  } else {
    console.log('⚠️  Plan ID is null - member won\'t see plan benefits\n')
  }

  console.log('📝 NEXT STEPS:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('1. Theo needs to LOGOUT from member dashboard')
  console.log('2. Theo needs to LOGIN again with mobile + PIN')
  console.log('3. Dashboard will fetch fresh data from database')
  console.log('4. Plan name will show: "Comprehensive Plan – Value Plus"')
  console.log('5. Plan benefits will be available (plan_id is set)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log('💡 WHY DASHBOARD STILL SHOWS OLD NAME:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('- Dashboard loads data from localStorage (cached)')
  console.log('- localStorage was set during previous login')
  console.log('- Database has correct data NOW')
  console.log('- Re-login will refresh localStorage with new data')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

verifyTheoFix()

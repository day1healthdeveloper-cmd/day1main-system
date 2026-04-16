const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function checkTheoPlanName() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔍 CHECKING THEO DU TOIT PLAN NAME')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // Plus1Rewards Database
  const plus1Supabase = createClient(
    process.env.PLUS1_SUPABASE_URL,
    process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY
  )

  // Day1Main Database
  const day1Supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Check Plus1Rewards
  console.log('📍 STEP 1: Checking Plus1Rewards database...')
  const { data: plus1Member, error: plus1Error } = await plus1Supabase
    .from('members')
    .select('cell_phone, first_name, last_name, cover_plan_name, cover_plan_price')
    .eq('cell_phone', '0795320781')
    .single()

  if (plus1Error) {
    console.error('❌ Error:', plus1Error.message)
  } else {
    console.log('✅ Found in Plus1Rewards:')
    console.log('   Name:', plus1Member.first_name, plus1Member.last_name)
    console.log('   Mobile:', plus1Member.cell_phone)
    console.log('   Plan Name:', plus1Member.cover_plan_name)
    console.log('   Plan Price:', plus1Member.cover_plan_price)
  }

  // Check Day1Main
  console.log('\n📍 STEP 2: Checking Day1Main database...')
  const { data: day1Member, error: day1Error } = await day1Supabase
    .from('members')
    .select('member_number, first_name, last_name, mobile, plan_name, plan_id, monthly_premium, broker_code')
    .eq('mobile', '0795320781')
    .single()

  if (day1Error) {
    console.error('❌ Error:', day1Error.message)
  } else {
    console.log('✅ Found in Day1Main:')
    console.log('   Member Number:', day1Member.member_number)
    console.log('   Name:', day1Member.first_name, day1Member.last_name)
    console.log('   Mobile:', day1Member.mobile)
    console.log('   Plan Name:', day1Member.plan_name)
    console.log('   Plan ID:', day1Member.plan_id)
    console.log('   Monthly Premium:', day1Member.monthly_premium)
    console.log('   Broker Code:', day1Member.broker_code)
  }

  // Check Products table
  console.log('\n📍 STEP 3: Checking Products table...')
  const { data: products, error: productsError } = await day1Supabase
    .from('products')
    .select('id, name, slug, category')
    .ilike('name', '%comprehensive%value%plus%')

  if (productsError) {
    console.error('❌ Error:', productsError.message)
  } else {
    console.log('✅ Found matching products:')
    products.forEach(p => {
      console.log(`   - ${p.name} (${p.category})`)
      console.log(`     ID: ${p.id}`)
      console.log(`     Slug: ${p.slug}`)
    })
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 COMPARISON')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  if (plus1Member && day1Member) {
    console.log('Plus1 Plan Name:  ', plus1Member.cover_plan_name)
    console.log('Day1 Plan Name:   ', day1Member.plan_name)
    console.log('Match:', plus1Member.cover_plan_name === day1Member.plan_name ? '✅ YES' : '❌ NO')
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

checkTheoPlanName()

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Import the plan mapper (we'll use the mapping directly)
const PLAN_MAPPINGS = [
  { plus1Name: 'Hospital - Value Plus', productName: 'Hospital Plan – Value Plus' },
  { plus1Name: 'Hospital - Platinum', productName: 'Hospital Plan – Platinum' },
  { plus1Name: 'Hospital - Executive', productName: 'Hospital Plan – Executive' },
  { plus1Name: 'Comprehensive - Value Plus', productName: 'Comprehensive Plan – Value Plus' },
  { plus1Name: 'Comprehensive - Platinum', productName: 'Comprehensive Plan – Platinum' },
  { plus1Name: 'Comprehensive - Executive', productName: 'Comprehensive Plan – Executive' },
  { plus1Name: 'Day to Day', productName: 'Day-to-Day Plan' },
  { plus1Name: 'Senior Hospital', productName: 'Senior Hospital Plan' },
  { plus1Name: 'Senior Day to Day', productName: 'Senior Day-to-Day Plan' },
  { plus1Name: 'Senior Comprehensive', productName: 'Senior Comprehensive Plan' }
]

function mapPlus1PlanToProduct(plus1PlanName) {
  const mapping = PLAN_MAPPINGS.find(
    m => m.plus1Name.toLowerCase() === plus1PlanName.toLowerCase()
  )
  if (!mapping) {
    throw new Error(`No plan mapping found for: ${plus1PlanName}`)
  }
  return mapping.productName
}

async function fixTheoPlanName() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔧 FIXING THEO DU TOIT PLAN NAME')
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

  // STEP 1: Get Plus1 plan name
  console.log('📍 STEP 1: Fetching Plus1 plan name...')
  const { data: plus1Member, error: plus1Error } = await plus1Supabase
    .from('members')
    .select('cover_plan_name')
    .eq('cell_phone', '0795320781')
    .single()

  if (plus1Error) {
    console.error('❌ Error:', plus1Error.message)
    return
  }

  console.log('✅ Plus1 plan name:', plus1Member.cover_plan_name)

  // STEP 2: Map to product name
  console.log('\n📍 STEP 2: Mapping to product name...')
  let productName
  try {
    productName = mapPlus1PlanToProduct(plus1Member.cover_plan_name)
    console.log('✅ Mapped to product name:', productName)
  } catch (error) {
    console.error('❌ Mapping error:', error.message)
    return
  }

  // STEP 3: Get product ID
  console.log('\n📍 STEP 3: Fetching product ID...')
  const { data: product, error: productError } = await day1Supabase
    .from('products')
    .select('id, name')
    .eq('name', productName)
    .single()

  if (productError) {
    console.error('❌ Error:', productError.message)
    return
  }

  console.log('✅ Found product:')
  console.log('   Name:', product.name)
  console.log('   ID:', product.id)

  // STEP 4: Update member record
  console.log('\n📍 STEP 4: Updating member record...')
  const { data: updatedMember, error: updateError } = await day1Supabase
    .from('members')
    .update({
      plan_name: productName,
      plan_id: product.id,
      updated_at: new Date().toISOString()
    })
    .eq('mobile', '0795320781')
    .eq('broker_code', 'POR')
    .select('member_number, first_name, last_name, plan_name, plan_id')
    .single()

  if (updateError) {
    console.error('❌ Error:', updateError.message)
    return
  }

  console.log('✅ Member updated successfully:')
  console.log('   Member Number:', updatedMember.member_number)
  console.log('   Name:', updatedMember.first_name, updatedMember.last_name)
  console.log('   Plan Name:', updatedMember.plan_name)
  console.log('   Plan ID:', updatedMember.plan_id)

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ THEO\'S PLAN NAME FIXED SUCCESSFULLY')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

fixTheoPlanName()

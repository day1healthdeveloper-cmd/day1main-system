const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Plan mappings
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

async function fixAllPlus1PlanNames() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔧 FIXING ALL PLUS1 MEMBER PLAN NAMES')
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

  // STEP 1: Get all Plus1 members from Day1Main
  console.log('📍 STEP 1: Fetching all Plus1 members from Day1Main...')
  const { data: day1Members, error: day1Error } = await day1Supabase
    .from('members')
    .select('id, member_number, first_name, last_name, mobile, plan_name, plan_id, broker_code')
    .eq('broker_code', 'POR')

  if (day1Error) {
    console.error('❌ Error:', day1Error.message)
    return
  }

  console.log(`✅ Found ${day1Members.length} Plus1 members in Day1Main\n`)

  let successCount = 0
  let errorCount = 0
  let skippedCount = 0

  // STEP 2: Process each member
  for (const member of day1Members) {
    console.log(`\n━━━ Processing: ${member.first_name} ${member.last_name} (${member.member_number}) ━━━`)
    console.log(`Mobile: ${member.mobile}`)
    console.log(`Current plan name: ${member.plan_name}`)
    console.log(`Current plan ID: ${member.plan_id || 'NULL'}`)

    try {
      // Fetch Plus1 plan name
      const { data: plus1Member, error: plus1Error } = await plus1Supabase
        .from('members')
        .select('cover_plan_name')
        .eq('cell_phone', member.mobile)
        .single()

      if (plus1Error || !plus1Member) {
        console.log(`⚠️  Member not found in Plus1Rewards database - SKIPPED`)
        skippedCount++
        continue
      }

      console.log(`Plus1 plan name: ${plus1Member.cover_plan_name}`)

      // Map to product name
      let productName
      try {
        productName = mapPlus1PlanToProduct(plus1Member.cover_plan_name)
        console.log(`Mapped to: ${productName}`)
      } catch (mappingError) {
        console.log(`❌ Mapping error: ${mappingError.message} - SKIPPED`)
        errorCount++
        continue
      }

      // Check if already correct
      if (member.plan_name === productName && member.plan_id) {
        console.log(`✅ Already correct - SKIPPED`)
        skippedCount++
        continue
      }

      // Get product ID
      const { data: product, error: productError } = await day1Supabase
        .from('products')
        .select('id')
        .eq('name', productName)
        .single()

      if (productError || !product) {
        console.log(`❌ Product not found: ${productName} - SKIPPED`)
        errorCount++
        continue
      }

      // Update member record
      const { error: updateError } = await day1Supabase
        .from('members')
        .update({
          plan_name: productName,
          plan_id: product.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', member.id)

      if (updateError) {
        console.log(`❌ Update error: ${updateError.message}`)
        errorCount++
        continue
      }

      console.log(`✅ UPDATED: ${member.plan_name} → ${productName}`)
      console.log(`   Plan ID: ${member.plan_id || 'NULL'} → ${product.id}`)
      successCount++

    } catch (error) {
      console.log(`❌ Error: ${error.message}`)
      errorCount++
    }
  }

  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 SUMMARY')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`Total members: ${day1Members.length}`)
  console.log(`✅ Successfully updated: ${successCount}`)
  console.log(`⚠️  Skipped (already correct or not found): ${skippedCount}`)
  console.log(`❌ Errors: ${errorCount}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

fixAllPlus1PlanNames()

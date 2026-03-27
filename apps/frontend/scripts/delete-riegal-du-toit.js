/**
 * Delete Riegal du Toit from database
 * Removes all applications and related data
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function deleteRiegalDuToit() {
  try {
    console.log('🔍 Searching for Riegal du Toit...')

    // Find applications by name
    const { data: applications, error: findError } = await supabase
      .from('applications')
      .select('id, application_number, first_name, last_name, email, id_number')
      .or('first_name.ilike.%riegal%,last_name.ilike.%du toit%,last_name.ilike.%dutoit%')

    if (findError) {
      console.error('❌ Error finding applications:', findError)
      return
    }

    if (!applications || applications.length === 0) {
      console.log('ℹ️  No applications found for Riegal du Toit')
      return
    }

    console.log(`\n📋 Found ${applications.length} application(s):`)
    applications.forEach(app => {
      console.log(`  - ${app.application_number}: ${app.first_name} ${app.last_name} (${app.email || 'no email'})`)
    })

    console.log('\n🗑️  Deleting applications...')

    // Delete each application
    for (const app of applications) {
      const { error: deleteError } = await supabase
        .from('applications')
        .delete()
        .eq('id', app.id)

      if (deleteError) {
        console.error(`❌ Error deleting ${app.application_number}:`, deleteError)
      } else {
        console.log(`✅ Deleted ${app.application_number}`)
      }
    }

    console.log('\n✅ Done!')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

deleteRiegalDuToit()

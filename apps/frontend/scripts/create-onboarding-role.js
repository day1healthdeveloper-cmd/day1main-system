/**
 * Create Onboarding role in the database
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createOnboardingRole() {
  try {
    console.log('🔍 Checking if onboarding role exists...')

    // Check if role already exists
    const { data: existingRole, error: checkError } = await supabase
      .from('roles')
      .select('*')
      .eq('name', 'onboarding')
      .single()

    if (existingRole) {
      console.log('✅ Onboarding role already exists:', existingRole)
      return
    }

    console.log('➕ Creating onboarding role...')

    // Create the role
    const { data: newRole, error: createError } = await supabase
      .from('roles')
      .insert({
        name: 'onboarding',
        description: 'Onboarding specialist for new member setup and verification'
      })
      .select()
      .single()

    if (createError) {
      console.error('❌ Error creating role:', createError)
      return
    }

    console.log('✅ Onboarding role created successfully:', newRole)

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

createOnboardingRole()

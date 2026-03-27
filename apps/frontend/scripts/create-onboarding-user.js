/**
 * Create Onboarding user in the database
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createOnboardingUser() {
  try {
    console.log('🔍 Checking if onboarding role exists...')

    // First, ensure the role exists
    let { data: role, error: roleError } = await supabase
      .from('roles')
      .select('*')
      .eq('name', 'onboarding')
      .single()

    if (!role) {
      console.log('➕ Creating onboarding role...')
      const { data: newRole, error: createRoleError } = await supabase
        .from('roles')
        .insert({
          name: 'onboarding',
          description: 'Onboarding specialist for new member setup and verification'
        })
        .select()
        .single()

      if (createRoleError) {
        console.error('❌ Error creating role:', createRoleError)
        return
      }
      role = newRole
      console.log('✅ Onboarding role created')
    } else {
      console.log('✅ Onboarding role exists')
    }

    console.log('🔍 Checking if onboarding user exists...')

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'onboarding@day1main.com')
      .single()

    if (existingUser) {
      console.log('✅ Onboarding user already exists:', existingUser)
      return
    }

    console.log('➕ Creating onboarding user in Supabase Auth...')

    // Create user in Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'onboarding@day1main.com',
      password: 'onboarding123',
      email_confirm: true,
      user_metadata: {
        first_name: 'Onboarding',
        last_name: 'Specialist'
      }
    })

    if (authError) {
      console.error('❌ Error creating auth user:', authError)
      return
    }

    console.log('✅ Auth user created:', authUser.user.id)

    console.log('➕ Creating onboarding user in users table...')

    // Create user in users table
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id,
        email: 'onboarding@day1main.com',
        first_name: 'Onboarding',
        last_name: 'Specialist'
      })
      .select()
      .single()

    if (userError) {
      console.error('❌ Error creating user:', userError)
      return
    }

    console.log('✅ User created:', newUser)

    console.log('➕ Assigning onboarding role to user...')

    // Assign role to user
    const { data: userRole, error: userRoleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authUser.user.id,
        role_id: role.id
      })
      .select()
      .single()

    if (userRoleError) {
      console.error('❌ Error assigning role:', userRoleError)
      return
    }

    console.log('✅ Role assigned successfully!')
    console.log('\n📧 Login credentials:')
    console.log('   Email: onboarding@day1main.com')
    console.log('   Password: onboarding123')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

createOnboardingUser()

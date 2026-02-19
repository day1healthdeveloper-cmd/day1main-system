import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';

const supabaseUrl = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU0NzU2NSwiZXhwIjoyMDgxMTIzNTY1fQ.swDffWzSySfDnJEDCEPx6rzDSuVUPe21EQmgV2oe_9I';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUser() {
  try {
    console.log('Creating test user...');

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'test@day1main.com')
      .single();

    if (existingUser) {
      console.log('⚠️  User already exists. Deleting and recreating...');
      
      // Delete existing user
      await supabase.from('user_roles').delete().eq('user_id', existingUser.id);
      await supabase.from('profiles').delete().eq('user_id', existingUser.id);
      await supabase.from('users').delete().eq('id', existingUser.id);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('test123', 10);

    // Create user in users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email: 'test@day1main.com',
        password_hash: hashedPassword,
        is_active: true,
        email_verified: true,
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating user:', userError);
      return;
    }

    console.log('✅ User created:', user);

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        first_name: 'Test',
        last_name: 'User',
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
    } else {
      console.log('✅ Profile created');
    }

    // Get operations_manager role ID
    const { data: role } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'operations_manager')
      .single();

    if (!role) {
      console.error('❌ operations_manager role not found');
      return;
    }

    // Assign operations_manager role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: user.id,
        role_id: role.id,
      });

    if (roleError) {
      console.error('Error assigning role:', roleError);
      return;
    }

    console.log('✅ Role assigned: operations_manager');
    console.log('\n=== TEST USER CREDENTIALS ===');
    console.log('Email: test@day1main.com');
    console.log('Password: test123');
    console.log('Role: operations_manager');
    console.log('Direct link: https://day1main-system.vercel.app/test-operations');
    console.log('=============================\n');

  } catch (error) {
    console.error('Error:', error);
  }
}

createTestUser();

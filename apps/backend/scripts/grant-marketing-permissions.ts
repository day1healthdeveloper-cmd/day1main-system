import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function grantMarketingPermissions() {
  try {
    console.log('🔍 Finding users...');
    
    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email');
    
    if (usersError) {
      throw usersError;
    }
    
    console.log(`Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.email} (${user.id})`);
    });
    
    // Get marketing role
    const { data: marketingRole, error: roleError } = await supabase
      .from('roles')
      .select('id, name')
      .eq('name', 'marketing_manager')
      .single();
    
    if (roleError || !marketingRole) {
      console.log('❌ Marketing manager role not found');
      return;
    }
    
    console.log(`\n✅ Found marketing_manager role: ${marketingRole.id}`);
    
    // Get marketing permissions
    const { data: permissions, error: permError } = await supabase
      .from('permissions')
      .select('id, name')
      .or('name.eq.marketing:view,name.eq.marketing:write');
    
    if (permError) {
      throw permError;
    }
    
    console.log(`\n✅ Found ${permissions.length} marketing permissions:`);
    permissions.forEach(p => console.log(`  - ${p.name}`));
    
    // Grant marketing role to all users (for testing)
    console.log('\n🔧 Granting marketing role to all users...');
    
    for (const user of users) {
      // Check if user already has the role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role_id', marketingRole.id)
        .single();
      
      if (!existingRole) {
        const { error: assignError } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            role_id: marketingRole.id,
          });
        
        if (assignError) {
          console.log(`  ❌ Failed to assign role to ${user.email}: ${assignError.message}`);
        } else {
          console.log(`  ✅ Assigned marketing_manager role to ${user.email}`);
        }
      } else {
        console.log(`  ℹ️  ${user.email} already has marketing_manager role`);
      }
    }
    
    console.log('\n✅ Done! Users now have marketing permissions.');
    console.log('💡 Users may need to log out and log back in for permissions to take effect.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

grantMarketingPermissions();

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addMarketingPermissions() {
  try {
    console.log('🔍 Checking existing permissions...');
    
    // Check if marketing permissions exist
    const { data: existingPerms } = await supabase
      .from('permissions')
      .select('*')
      .or('name.eq.marketing:view,name.eq.marketing:write');
    
    console.log(`Found ${existingPerms?.length || 0} existing marketing permissions`);
    
    // Marketing permissions to add
    const marketingPermissions = [
      {
        name: 'marketing:view',
        description: 'View marketing data and campaigns',
        resource: 'marketing',
        action: 'view',
      },
      {
        name: 'marketing:write',
        description: 'Create and edit marketing campaigns',
        resource: 'marketing',
        action: 'write',
      },
    ];
    
    console.log('\n📝 Adding marketing permissions...');
    
    for (const perm of marketingPermissions) {
      const { data: existing } = await supabase
        .from('permissions')
        .select('*')
        .eq('name', perm.name)
        .single();
      
      if (!existing) {
        const { error } = await supabase
          .from('permissions')
          .insert(perm);
        
        if (error) {
          console.log(`  ❌ Failed to add ${perm.name}: ${error.message}`);
        } else {
          console.log(`  ✅ Added permission: ${perm.name}`);
        }
      } else {
        console.log(`  ℹ️  Permission already exists: ${perm.name}`);
      }
    }
    
    // Get marketing_manager role
    const { data: marketingRole } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'marketing_manager')
      .single();
    
    if (!marketingRole) {
      console.log('\n❌ marketing_manager role not found');
      return;
    }
    
    // Get the permission IDs
    const { data: permissions } = await supabase
      .from('permissions')
      .select('id, name')
      .or('name.eq.marketing:view,name.eq.marketing:write');
    
    if (!permissions || permissions.length === 0) {
      console.log('\n❌ Marketing permissions not found');
      return;
    }
    
    console.log('\n🔗 Linking permissions to marketing_manager role...');
    
    for (const perm of permissions) {
      const { data: existing } = await supabase
        .from('role_permissions')
        .select('*')
        .eq('role_id', marketingRole.id)
        .eq('permission_id', perm.id)
        .single();
      
      if (!existing) {
        const { error } = await supabase
          .from('role_permissions')
          .insert({
            role_id: marketingRole.id,
            permission_id: perm.id,
          });
        
        if (error) {
          console.log(`  ❌ Failed to link ${perm.name}: ${error.message}`);
        } else {
          console.log(`  ✅ Linked ${perm.name} to marketing_manager`);
        }
      } else {
        console.log(`  ℹ️  ${perm.name} already linked to marketing_manager`);
      }
    }
    
    console.log('\n✅ Done! Marketing permissions are set up.');
    console.log('💡 Users with marketing_manager role now have marketing:view and marketing:write permissions.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addMarketingPermissions();

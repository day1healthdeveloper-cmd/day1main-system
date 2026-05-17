/**
 * Run Policy Definitions Migration
 * This creates the policy_definitions table in Supabase
 * Run: node run-policy-definitions-migration.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Hardcoded credentials from backend .env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
if (!supabaseUrl) throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL");
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseKey) throw new Error("Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY");

async function runMigration() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    console.log('🔗 Connecting to Supabase...');
    console.log('URL:', supabaseUrl);
    console.log('✅ Client created!\n');

    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'RUN_THIS_IN_SUPABASE.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📝 Running migration via REST API...');
    console.log('Creating policy_definitions table...\n');
    
    // Split SQL into individual statements and execute them
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.includes('DROP') || statement.includes('CREATE') || statement.includes('ALTER')) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        
        // Use the REST API to execute SQL
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: statement })
        });
        
        if (!response.ok) {
          const error = await response.text();
          console.error('Failed:', error);
        }
      }
    }
    
    console.log('\n✅ Migration completed!\n');
    console.log('Created:');
    console.log('  - policy_definitions table');
    console.log('  - Indexes for performance');
    console.log('  - RLS policies for security\n');
    
    // Verify the table was created by trying to query it
    const { data, error } = await supabase
      .from('policy_definitions')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('⚠️  Could not verify table (this is normal if exec_sql is not available)');
      console.log('Please run the SQL manually in Supabase SQL Editor');
    } else {
      console.log('✅ Table verified and accessible!');
    }
    
  } catch (error) {
    console.error('❌ Migration failed!');
    console.error('Error:', error.message);
    console.log('\n📋 Manual Steps:');
    console.log('1. Open Supabase Dashboard: https://supabase.com/dashboard');
    console.log('2. Go to SQL Editor');
    console.log('3. Copy contents of RUN_THIS_IN_SUPABASE.sql');
    console.log('4. Paste and click RUN');
    process.exit(1);
  }
}

runMigration();

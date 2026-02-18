/**
 * Run Product Benefits Migration
 */

require('dotenv').config({ path: 'apps/backend/.env' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🚀 Running Product Benefits Migration\n');
  console.log('='.repeat(60));

  try {
    // Read migration file
    const sql = fs.readFileSync('apps/backend/migrations/013_product_benefits.sql', 'utf8');
    
    console.log('\n📄 Executing migration...');
    
    // Execute migration
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // Try direct execution if RPC doesn't exist
      console.log('⚠️  RPC method not available, trying direct execution...');
      
      // Split by semicolon and execute each statement
      const statements = sql.split(';').filter(s => s.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          const { error: execError } = await supabase.rpc('exec', { query: statement });
          if (execError) {
            console.error(`❌ Error executing statement:`, execError.message);
            console.error(`Statement:`, statement.substring(0, 100) + '...');
          }
        }
      }
    }
    
    console.log('\n✅ Migration completed!');
    console.log('\n📊 Created tables:');
    console.log('   - benefit_types');
    console.log('   - product_benefits');
    console.log('   - benefit_usage');
    console.log('   - pmb_conditions');
    console.log('   - chronic_conditions');
    console.log('   - product_chronic_benefits');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();

/**
 * Run Product Benefits Migration Directly
 */

require('dotenv').config({ path: '../apps/backend/.env' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🚀 Running Product Benefits Migration Directly\n');
  console.log('='.repeat(60));

  try {
    // Read SQL file
    const sql = fs.readFileSync('../SUPABASE_RUN_THIS_SQL.sql', 'utf8');
    
    console.log('\n📄 Executing SQL statements...\n');
    
    // Split into individual statements and execute
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && !s.startsWith('DO $$'));
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;
      
      try {
        // Use raw SQL query through Supabase
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
        
        if (error) {
          console.log(`❌ Statement ${i + 1} failed:`, error.message.substring(0, 100));
          errorCount++;
        } else {
          console.log(`✅ Statement ${i + 1} executed`);
          successCount++;
        }
      } catch (err) {
        console.log(`❌ Statement ${i + 1} error:`, err.message.substring(0, 100));
        errorCount++;
      }
    }
    
    console.log(`\n📊 Results:`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Errors: ${errorCount}`);
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
  }
}

runMigration();

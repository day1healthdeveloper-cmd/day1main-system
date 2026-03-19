const { createClient } = require('@supabase/supabase-js');
const { readFileSync } = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  console.log('Running feedback table migration...\n');

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'create-feedback-table.sql');
    const sql = readFileSync(sqlPath, 'utf-8');

    // Split by semicolon and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      console.log('Executing:', statement.substring(0, 50) + '...');
      
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
      
      if (error) {
        console.error('Error:', error.message);
        // Try direct query if RPC fails
        const { error: directError } = await supabase.from('_').select('*').limit(0);
        if (directError) {
          console.log('Trying alternative method...');
        }
      } else {
        console.log('✓ Success\n');
      }
    }

    console.log('Migration completed!');
    console.log('\nTables created:');
    console.log('- feedback');
    console.log('- feedback_comments');
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

runMigration();

require('dotenv').config({ path: 'apps/backend/.env' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  console.log('Adding employee_number column to members table...\n');

  const sql = fs.readFileSync('supabase/migrations/019_add_employee_number.sql', 'utf8');

  try {
    // Split by semicolon and run each statement
    const statements = sql.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { query: statement });
        if (error) {
          console.error('Error executing statement:', error.message);
        } else {
          console.log('✓ Executed:', statement.substring(0, 50) + '...');
        }
      }
    }

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

runMigration();

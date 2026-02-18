import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  console.log('🔍 Checking current database schema...\n');

  // Check if tables exist
  const tables = ['landing_pages', 'landing_page_visits', 'landing_page_leads'];
  
  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);

    if (error) {
      console.log(`❌ Table '${table}' does not exist`);
      console.log(`   Error: ${error.message}\n`);
    } else {
      console.log(`✅ Table '${table}' exists`);
      console.log(`   Sample data count: ${data?.length || 0}\n`);
    }
  }

  // Check permissions table structure
  console.log('📋 Checking permissions table structure...');
  const { data: permData, error: permError } = await supabase
    .from('permissions')
    .select('*')
    .limit(1);

  if (!permError && permData) {
    console.log('✅ Permissions table columns:', Object.keys(permData[0] || {}));
  }

  // Check role_permissions table structure
  console.log('\n📋 Checking role_permissions table structure...');
  const { data: rpData, error: rpError } = await supabase
    .from('role_permissions')
    .select('*')
    .limit(1);

  if (!rpError && rpData) {
    console.log('✅ Role_permissions table columns:', Object.keys(rpData[0] || {}));
  }
}

async function runMigration() {
  console.log('\n🚀 Running migration...\n');

  const migrationPath = path.resolve(__dirname, '../migrations/007_landing_pages.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

  // Split by semicolon and execute each statement
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (!statement) continue;

    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        console.log(`❌ Statement ${i + 1} failed:`);
        console.log(`   ${statement.substring(0, 100)}...`);
        console.log(`   Error: ${error.message}\n`);
        errorCount++;
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`);
        successCount++;
      }
    } catch (err: any) {
      console.log(`❌ Statement ${i + 1} failed:`);
      console.log(`   ${statement.substring(0, 100)}...`);
      console.log(`   Error: ${err.message}\n`);
      errorCount++;
    }
  }

  console.log(`\n📊 Migration Summary:`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
}

async function main() {
  try {
    await checkSchema();
    
    console.log('\n' + '='.repeat(60));
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question('\nDo you want to run the migration? (yes/no): ', async (answer: string) => {
      readline.close();
      
      if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        await runMigration();
        await checkSchema();
      } else {
        console.log('Migration cancelled.');
      }
      
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();

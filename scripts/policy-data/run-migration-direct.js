/**
 * Run Migration Directly via PostgreSQL
 * Run: node run-migration-direct.js
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function runMigration() {
  console.log('🚀 Running Payment Groups Migration...\n');

  const client = new Client({
    connectionString: 'postgresql://postgres.ldygmpaipxbokxzyzyti:Day1Main2026!@aws-0-eu-central-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!\n');

    // Read migration file
    const migrationPath = path.join(__dirname, '../../supabase/migrations/018_payment_groups.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded');
    console.log(`📏 SQL length: ${sql.length} characters\n`);

    console.log('⚙️  Executing migration...\n');
    
    await client.query(sql);

    console.log('✅ Migration executed successfully!\n');

    // Verify tables
    console.log('🔍 Verifying tables...\n');
    
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('payment_groups', 'group_payment_history', 'group_member_payments', 'eft_payment_notifications')
      ORDER BY table_name
    `);

    console.log('Tables created:');
    result.rows.forEach(row => {
      console.log(`✅ ${row.table_name}`);
    });

    // Check members table columns
    console.log('\n🔍 Checking members table columns...\n');
    
    const columnsResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'members' 
      AND column_name IN ('payment_group_id', 'collection_method')
      ORDER BY column_name
    `);

    console.log('Members table columns:');
    columnsResult.rows.forEach(row => {
      console.log(`✅ ${row.column_name}`);
    });

    console.log('\n✅ Migration completed successfully!\n');

  } catch (error) {
    console.error('❌ Migration Failed!\n');
    console.error('Error:', error.message);
    console.error('\nStack:', error.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();

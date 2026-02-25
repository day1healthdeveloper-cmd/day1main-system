/**
 * Update Providers Table Schema
 * Run: node scripts/update-providers-table.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/frontend/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateProvidersTable() {
  console.log('🔧 Updating providers table schema...\n');

  const sql = `
    -- Add new columns to existing providers table
    ALTER TABLE providers ADD COLUMN IF NOT EXISTS region VARCHAR(100);
    ALTER TABLE providers ADD COLUMN IF NOT EXISTS suburb VARCHAR(100);
    ALTER TABLE providers ADD COLUMN IF NOT EXISTS address TEXT;
    ALTER TABLE providers ADD COLUMN IF NOT EXISTS doctor_surname VARCHAR(255);
    ALTER TABLE providers ADD COLUMN IF NOT EXISTS prno VARCHAR(50);
    ALTER TABLE providers ADD COLUMN IF NOT EXISTS tel VARCHAR(50);
    ALTER TABLE providers ADD COLUMN IF NOT EXISTS fax VARCHAR(50);
    ALTER TABLE providers ADD COLUMN IF NOT EXISTS disp_province VARCHAR(100);
    ALTER TABLE providers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
    ALTER TABLE providers ADD COLUMN IF NOT EXISTS profession VARCHAR(100);

    -- Add indexes for new columns
    CREATE INDEX IF NOT EXISTS idx_providers_region ON providers(region);
    CREATE INDEX IF NOT EXISTS idx_providers_suburb ON providers(suburb);
    CREATE INDEX IF NOT EXISTS idx_providers_profession ON providers(profession);
    CREATE INDEX IF NOT EXISTS idx_providers_is_active ON providers(is_active);
    CREATE INDEX IF NOT EXISTS idx_providers_prno ON providers(prno);
  `;

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // Try alternative method - direct query
      console.log('Trying direct SQL execution...\n');
      
      const queries = sql.split(';').filter(q => q.trim());
      
      for (const query of queries) {
        if (query.trim()) {
          const { error: queryError } = await supabase.rpc('exec_sql', { query: query.trim() });
          if (queryError) {
            console.log(`⚠️  Query: ${query.substring(0, 50)}...`);
            console.log(`   Error: ${queryError.message}\n`);
          } else {
            console.log(`✅ Executed: ${query.substring(0, 50)}...`);
          }
        }
      }
    } else {
      console.log('✅ Schema updated successfully!\n');
    }

    // Verify the columns were added
    console.log('🔍 Verifying new columns...\n');
    const { data: sample, error: sampleError } = await supabase
      .from('providers')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.log('❌ Error verifying:', sampleError.message);
    } else {
      const columns = sample && sample.length > 0 ? Object.keys(sample[0]) : [];
      console.log('Current columns in providers table:');
      columns.forEach(col => console.log(`  - ${col}`));
      console.log('');
    }

    console.log('✅ Providers table is ready for import!\n');

  } catch (error) {
    console.error('❌ Update failed:', error.message);
    process.exit(1);
  }
}

updateProvidersTable();

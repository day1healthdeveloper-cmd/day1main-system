/**
 * Create Product Benefits Tables
 */

require('dotenv').config({ path: '../apps/backend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  console.log('🚀 Creating Product Benefits Tables\n');
  console.log('='.repeat(60));

  const tables = [
    {
      name: 'benefit_types',
      check: async () => {
        const { data, error } = await supabase.from('benefit_types').select('id').limit(1);
        return !error;
      }
    },
    {
      name: 'product_benefits',
      check: async () => {
        const { data, error } = await supabase.from('product_benefits').select('id').limit(1);
        return !error;
      }
    },
    {
      name: 'benefit_usage',
      check: async () => {
        const { data, error } = await supabase.from('benefit_usage').select('id').limit(1);
        return !error;
      }
    },
    {
      name: 'pmb_conditions',
      check: async () => {
        const { data, error } = await supabase.from('pmb_conditions').select('id').limit(1);
        return !error;
      }
    },
    {
      name: 'chronic_conditions',
      check: async () => {
        const { data, error } = await supabase.from('chronic_conditions').select('id').limit(1);
        return !error;
      }
    },
    {
      name: 'product_chronic_benefits',
      check: async () => {
        const { data, error } = await supabase.from('product_chronic_benefits').select('id').limit(1);
        return !error;
      }
    }
  ];

  console.log('\n📊 Checking which tables exist...\n');

  for (const table of tables) {
    const exists = await table.check();
    if (exists) {
      console.log(`✅ ${table.name} - EXISTS`);
    } else {
      console.log(`❌ ${table.name} - DOES NOT EXIST`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n⚠️  Tables need to be created in Supabase SQL Editor');
  console.log('\n📋 Instructions:');
  console.log('   1. Go to: https://supabase.com/dashboard');
  console.log('   2. Select your project');
  console.log('   3. Click "SQL Editor" in the left menu');
  console.log('   4. Click "New Query"');
  console.log('   5. Copy the contents of: SUPABASE_RUN_THIS_SQL.sql');
  console.log('   6. Paste and click "Run"');
  console.log('\n   File location: SUPABASE_RUN_THIS_SQL.sql');
}

createTables();

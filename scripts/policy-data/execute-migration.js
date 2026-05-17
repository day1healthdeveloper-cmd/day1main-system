/**
 * Execute Members Table Migration Directly
 * Uses Supabase service key to run SQL
 */

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
if (!SUPABASE_URL) throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL");
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_SERVICE_KEY) throw new Error("Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY");

async function executeMigration() {
  console.log('🔧 EXECUTING MEMBERS TABLE MIGRATION');
  console.log('=' .repeat(80));
  console.log('');

  try {
    // Execute each ALTER TABLE statement separately
    const statements = [
      // Add address fields
      "ALTER TABLE public.members ADD COLUMN IF NOT EXISTS address_line1 VARCHAR(255)",
      "ALTER TABLE public.members ADD COLUMN IF NOT EXISTS address_line2 VARCHAR(255)",
      "ALTER TABLE public.members ADD COLUMN IF NOT EXISTS city VARCHAR(100)",
      "ALTER TABLE public.members ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20)",
      
      // Add plan fields
      "ALTER TABLE public.members ADD COLUMN IF NOT EXISTS plan_name VARCHAR(100)",
      "ALTER TABLE public.members ADD COLUMN IF NOT EXISTS plan_config VARCHAR(50)",
      "ALTER TABLE public.members ADD COLUMN IF NOT EXISTS monthly_premium DECIMAL(10,2)",
      "ALTER TABLE public.members ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE",
      
      // Add banking fields
      "ALTER TABLE public.members ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100)",
      "ALTER TABLE public.members ADD COLUMN IF NOT EXISTS account_number VARCHAR(50)",
      "ALTER TABLE public.members ADD COLUMN IF NOT EXISTS branch_code VARCHAR(20)",
      "ALTER TABLE public.members ADD COLUMN IF NOT EXISTS account_holder_name VARCHAR(255)",
      "ALTER TABLE public.members ADD COLUMN IF NOT EXISTS debit_order_day INTEGER",
      
      // Add mobile field
      "ALTER TABLE public.members ADD COLUMN IF NOT EXISTS mobile VARCHAR(20)",
    ];

    console.log('⚙️  Executing ALTER TABLE statements...');
    console.log('');

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      const columnName = stmt.match(/ADD COLUMN IF NOT EXISTS (\w+)/)[1];
      
      process.stdout.write(`  ${i + 1}. Adding ${columnName}... `);
      
      // Use a PostgreSQL function call approach
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'params=single-object'
        },
        body: JSON.stringify({ sql: stmt })
      });

      // Even if the RPC doesn't exist, try direct query
      if (!response.ok) {
        // Try using PostgREST's ability to execute via a custom function
        // Since we can't execute arbitrary SQL via REST API, we'll use a workaround
        console.log('⚠️  (REST API limitation)');
      } else {
        console.log('✅');
      }
    }

    console.log('');
    console.log('⚠️  REST API has limitations for DDL statements');
    console.log('');
    console.log('📝 ALTERNATIVE: Use Supabase Client Library');
    console.log('-'.repeat(80));
    
    // Try using raw SQL via a stored procedure approach
    console.log('Attempting to add columns via batch operation...');
    console.log('');

    // Create a single batch ALTER statement
    const batchSQL = `
      DO $$ 
      BEGIN
        ALTER TABLE public.members ADD COLUMN IF NOT EXISTS address_line1 VARCHAR(255);
        ALTER TABLE public.members ADD COLUMN IF NOT EXISTS address_line2 VARCHAR(255);
        ALTER TABLE public.members ADD COLUMN IF NOT EXISTS city VARCHAR(100);
        ALTER TABLE public.members ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20);
        ALTER TABLE public.members ADD COLUMN IF NOT EXISTS plan_name VARCHAR(100);
        ALTER TABLE public.members ADD COLUMN IF NOT EXISTS plan_config VARCHAR(50);
        ALTER TABLE public.members ADD COLUMN IF NOT EXISTS monthly_premium DECIMAL(10,2);
        ALTER TABLE public.members ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE;
        ALTER TABLE public.members ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100);
        ALTER TABLE public.members ADD COLUMN IF NOT EXISTS account_number VARCHAR(50);
        ALTER TABLE public.members ADD COLUMN IF NOT EXISTS branch_code VARCHAR(20);
        ALTER TABLE public.members ADD COLUMN IF NOT EXISTS account_holder_name VARCHAR(255);
        ALTER TABLE public.members ADD COLUMN IF NOT EXISTS debit_order_day INTEGER;
        ALTER TABLE public.members ADD COLUMN IF NOT EXISTS mobile VARCHAR(20);
      END $$;
    `;

    console.log('SQL to run in Supabase SQL Editor:');
    console.log('-'.repeat(80));
    console.log(batchSQL);
    console.log('-'.repeat(80));
    console.log('');
    console.log('Please run this in: https://supabase.com/dashboard/project/ldygmpaipxbokxzyzyti/sql');
    console.log('');

  } catch (error) {
    console.error('❌ Migration failed!\n');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

executeMigration();

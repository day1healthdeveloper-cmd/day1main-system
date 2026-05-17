/**
 * Get Real Supabase Schema
 * Run: node get-schema.js
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
if (!SUPABASE_URL) throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL");
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
if (!SUPABASE_ANON_KEY) throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY");

async function getSchema() {
  console.log('🔍 Fetching Real Supabase Schema...\n');

  const tables = [
    'members',
    'applications', 
    'policies',
    'claims',
    'products',
    'providers',
    'contacts',
    'users'
  ];

  for (const table of tables) {
    try {
      console.log(`\n📋 TABLE: ${table.toUpperCase()}`);
      console.log('='.repeat(60));
      
      // Get one record to see structure
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?limit=1`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.log(`❌ Cannot access ${table} table`);
        continue;
      }

      const data = await response.json();
      
      if (data.length > 0) {
        const record = data[0];
        const columns = Object.keys(record);
        
        console.log(`\nColumns (${columns.length}):`);
        columns.forEach(col => {
          const value = record[col];
          const type = value === null ? 'null' : typeof value;
          console.log(`  - ${col}: ${type}`);
        });
      } else {
        // Table is empty, try to get schema from error message
        const testResponse = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json'
          }
        });
        console.log(`\n⚠️  Table is empty - no sample data available`);
      }

    } catch (error) {
      console.log(`❌ Error accessing ${table}:`, error.message);
    }
  }

  console.log('\n\n✅ Schema fetch complete!\n');
}

getSchema();

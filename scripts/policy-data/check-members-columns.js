/**
 * Query Members Table Structure
 * Run: node check-members-columns.js
 */

const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDc1NjUsImV4cCI6MjA4MTEyMzU2NX0.EGtoHE5B7Zs1lmnrWrVEwtSmPyh_z8_v8Kk-tlBgtnQ';

async function checkMembersTable() {
  console.log('🔍 Querying Members Table Structure...\n');

  try {
    // Get one member record to see all columns
    const response = await fetch(`${SUPABASE_URL}/rest/v1/members?limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const members = await response.json();
    
    if (members.length === 0) {
      console.log('⚠️  No members found in table. Checking table structure via API...\n');
      
      // Try to get table schema from OpenAPI spec
      const schemaResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      const schema = await schemaResponse.json();
      const membersSchema = schema.definitions?.members;
      
      if (membersSchema && membersSchema.properties) {
        const columns = Object.keys(membersSchema.properties);
        console.log(`📊 Members Table Columns (${columns.length} total):\n`);
        
        columns.forEach((col, index) => {
          const prop = membersSchema.properties[col];
          const type = prop.type || 'unknown';
          const format = prop.format ? ` (${prop.format})` : '';
          console.log(`${index + 1}. ${col} - ${type}${format}`);
        });
      } else {
        console.log('❌ Could not retrieve table schema');
      }
    } else {
      const member = members[0];
      const columns = Object.keys(member);
      
      console.log(`📊 Members Table Columns (${columns.length} total):\n`);
      
      columns.forEach((col, index) => {
        const value = member[col];
        const type = value === null ? 'null' : typeof value;
        console.log(`${index + 1}. ${col} - ${type} - ${value === null ? 'NULL' : JSON.stringify(value).substring(0, 50)}`);
      });
    }

    // Get total count
    const countResponse = await fetch(`${SUPABASE_URL}/rest/v1/members?select=count`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      }
    });

    const countHeader = countResponse.headers.get('content-range');
    if (countHeader) {
      const count = countHeader.split('/')[1];
      console.log(`\n📈 Total Members: ${count}\n`);
    }

    console.log('✅ Query completed successfully!\n');

  } catch (error) {
    console.error('❌ Query Failed!\n');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkMembersTable();

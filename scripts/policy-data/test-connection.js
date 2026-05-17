/**
 * Supabase Connection Test Script
 * Run: node test-connection.js
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
if (!SUPABASE_URL) throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL");
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
if (!SUPABASE_ANON_KEY) throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY");

async function testConnection() {
  console.log('🔍 Testing Supabase Connection...\n');
  console.log('Project URL:', SUPABASE_URL);
  console.log('Project ID: ldygmpaipxbokxzyzyti\n');

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const tables = Object.keys(data.definitions || {});

    console.log('✅ Connection Successful!\n');
    console.log(`📊 Found ${tables.length} tables:\n`);
    
    // Group tables by category
    const categories = {
      'Core': ['contacts', 'applications', 'members'],
      'Dependents': ['application_dependents', 'member_dependents'],
      'Marketing': ['landing_pages', 'landing_page_leads', 'landing_page_visits', 'contact_interactions'],
      'Insurance': ['policies', 'claims', 'products', 'providers'],
      'Auth & Security': ['users', 'roles', 'permissions', 'user_roles', 'role_permissions', 'sessions', 'mfa_devices'],
      'Compliance': ['popia_audit_log', 'audit_events'],
      'Other': []
    };

    // Categorize tables
    const categorized = {};
    tables.forEach(table => {
      let found = false;
      for (const [category, categoryTables] of Object.entries(categories)) {
        if (categoryTables.includes(table)) {
          if (!categorized[category]) categorized[category] = [];
          categorized[category].push(table);
          found = true;
          break;
        }
      }
      if (!found) {
        if (!categorized['Other']) categorized['Other'] = [];
        categorized['Other'].push(table);
      }
    });

    // Display categorized tables
    for (const [category, categoryTables] of Object.entries(categorized)) {
      if (categoryTables && categoryTables.length > 0) {
        console.log(`  ${category}:`);
        categoryTables.forEach(table => console.log(`    - ${table}`));
        console.log('');
      }
    }

    // Test a simple query
    console.log('🔍 Testing query on contacts table...');
    const contactsResponse = await fetch(`${SUPABASE_URL}/rest/v1/contacts?select=count`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      }
    });

    const contactCount = contactsResponse.headers.get('content-range');
    if (contactCount) {
      const count = contactCount.split('/')[1];
      console.log(`✅ Contacts table accessible: ${count} records\n`);
    }

    console.log('✅ All tests passed! Supabase is ready to use.\n');

  } catch (error) {
    console.error('❌ Connection Failed!\n');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check your internet connection');
    console.error('2. Verify the Supabase URL is correct');
    console.error('3. Verify the API key is correct');
    console.error('4. Check Supabase service status at https://status.supabase.com\n');
    process.exit(1);
  }
}

testConnection();

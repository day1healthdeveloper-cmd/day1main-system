/**
 * Check All Tables and Record Counts
 * Run: node check-all-tables.js
 */

const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDc1NjUsImV4cCI6MjA4MTEyMzU2NX0.EGtoHE5B7Zs1lmnrWrVEwtSmPyh_z8_v8Kk-tlBgtnQ';

async function checkAllTables() {
  console.log('🔍 Checking All Tables in Database...\n');

  try {
    // Get schema
    const schemaResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      }
    });

    const schema = await schemaResponse.json();
    const tables = Object.keys(schema.definitions || {});

    console.log(`📊 Found ${tables.length} tables\n`);

    // Check each table for record count
    const tableCounts = [];
    
    for (const table of tables) {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=count`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'count=exact'
          }
        });

        const countHeader = response.headers.get('content-range');
        const count = countHeader ? parseInt(countHeader.split('/')[1]) : 0;
        
        tableCounts.push({ table, count });
      } catch (err) {
        tableCounts.push({ table, count: 'ERROR' });
      }
    }

    // Sort by count descending
    tableCounts.sort((a, b) => {
      if (a.count === 'ERROR') return 1;
      if (b.count === 'ERROR') return -1;
      return b.count - a.count;
    });

    // Display results
    console.log('TABLE NAME                          | RECORD COUNT');
    console.log('------------------------------------|--------------');
    
    tableCounts.forEach(({ table, count }) => {
      const paddedTable = table.padEnd(35);
      const countStr = count === 'ERROR' ? 'ERROR' : count.toString().padStart(12);
      console.log(`${paddedTable} | ${countStr}`);
    });

    console.log('\n✅ Check completed!\n');

    // Categorize tables
    console.log('📋 RECOMMENDED TABLES TO KEEP:\n');
    console.log('  CRITICAL (System/Auth):');
    console.log('    - users (login accounts)');
    console.log('    - roles (system roles)');
    console.log('    - permissions (system permissions)');
    console.log('    - role_permissions (role-permission mappings)');
    console.log('    - user_roles (user role assignments)');
    console.log('    - profiles (user profiles)');
    console.log('');
    console.log('  REFERENCE DATA (Lookup tables):');
    console.log('    - products (insurance products/plans)');
    console.log('    - providers (healthcare providers)');
    console.log('    - brokers (broker information)');
    console.log('    - landing_pages (marketing pages)');
    console.log('');
    console.log('  CONFIGURATION:');
    console.log('    - benefit_rules (insurance rules)');
    console.log('    - tariff_codes (medical tariffs)');
    console.log('');
    console.log('🗑️  TABLES TO CLEAR (Member/Transaction Data):\n');
    console.log('    - members (member records)');
    console.log('    - member_dependents (dependents)');
    console.log('    - applications (applications)');
    console.log('    - application_dependents (application dependents)');
    console.log('    - policies (policies)');
    console.log('    - claims (claims)');
    console.log('    - contacts (marketing contacts)');
    console.log('    - contact_interactions (contact history)');
    console.log('    - landing_page_leads (leads)');
    console.log('    - landing_page_visits (visits)');
    console.log('    - debit_order_runs (debit order batches)');
    console.log('    - debit_order_transactions (debit order transactions)');
    console.log('    - payment_history (payment records)');
    console.log('    - audit_events (audit logs)');
    console.log('    - popia_audit_log (POPIA logs)');
    console.log('');

  } catch (error) {
    console.error('❌ Check Failed!\n');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkAllTables();

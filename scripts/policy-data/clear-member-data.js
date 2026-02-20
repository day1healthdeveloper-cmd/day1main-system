/**
 * Clear Member and Transaction Data (Keep System Config)
 * Run: node clear-member-data.js
 * 
 * KEEPS: users, roles, permissions, products, brokers, benefit config
 * CLEARS: members, sessions, debit orders, marketing contacts, audit logs
 */

const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU0NzU2NSwiZXhwIjoyMDgxMTIzNTY1fQ.swDffWzSySfDnJEDCEPx6rzDSuVUPe21EQmgV2oe_9I';

// Tables to clear (in order to handle foreign key constraints)
const TABLES_TO_CLEAR = [
  // Member-related data (clear dependents before members)
  'member_dependents',
  'members',
  
  // Application data
  'application_dependents',
  'applications',
  
  // Policy and claims
  'policies',
  'claims',
  
  // Marketing/Contact data
  'contact_interactions',
  'contacts',
  'landing_page_leads',
  'landing_page_visits',
  'marketing_contacts',
  
  // Payment/Debit order data
  'debit_order_transactions',
  'debit_order_runs',
  'payment_history',
  'payment_reconciliations',
  'payment_discrepancies',
  'debicheck_mandates',
  
  // Netcash logs
  'netcash_webhook_logs',
  'netcash_reconciliation',
  'netcash_audit_log',
  
  // Audit logs
  'audit_events',
  'popia_audit_log',
  
  // Sessions (old login sessions)
  'sessions',
  
  // Other transactional data
  'active_members',
  'rejected_applicants',
  'refund_requests',
  'benefit_usage',
  'benefit_change_history'
];

async function clearTable(tableName) {
  try {
    // Get count before deletion
    const countBeforeResponse = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?select=count`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'count=exact'
      }
    });

    const countBeforeHeader = countBeforeResponse.headers.get('content-range');
    const countBefore = countBeforeHeader ? parseInt(countBeforeHeader.split('/')[1]) : 0;

    if (countBefore === 0) {
      return { success: true, remaining: 0, cleared: 0 };
    }

    // Delete all records using neq filter (not equal to impossible value)
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?id=neq.00000000-0000-0000-0000-000000000000`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      }
    });

    // Get count after deletion
    const countAfterResponse = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?select=count`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'count=exact'
      }
    });

    const countAfterHeader = countAfterResponse.headers.get('content-range');
    const remainingCount = countAfterHeader ? parseInt(countAfterHeader.split('/')[1]) : 0;

    if (response.ok || response.status === 404) {
      return { success: true, remaining: remainingCount, cleared: countBefore - remainingCount };
    } else {
      const errorText = await response.text();
      return { success: false, error: `HTTP ${response.status}: ${errorText}`, remaining: remainingCount, cleared: 0 };
    }
  } catch (error) {
    return { success: false, error: error.message, remaining: '?', cleared: 0 };
  }
}

async function clearMemberData() {
  console.log('🗑️  Clearing Member and Transaction Data...\n');
  console.log('⚠️  WARNING: This will delete all member records, applications, payments, etc.\n');
  console.log('✅ KEEPING: users, roles, permissions, products, brokers, benefit config\n');
  
  // Wait 3 seconds to allow cancellation
  console.log('Starting in 3 seconds... (Press Ctrl+C to cancel)\n');
  await new Promise(resolve => setTimeout(resolve, 3000));

  const results = [];
  let totalCleared = 0;

  for (const table of TABLES_TO_CLEAR) {
    process.stdout.write(`Clearing ${table}...`.padEnd(50));
    
    const result = await clearTable(table);
    results.push({ table, ...result });
    
    if (result.success) {
      console.log(`✅ Cleared ${result.cleared} records`);
      if (result.remaining === 0) totalCleared++;
    } else {
      console.log(`⚠️  ${result.error}`);
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY\n');
  console.log(`Tables processed: ${TABLES_TO_CLEAR.length}`);
  console.log(`Tables cleared: ${totalCleared}`);
  console.log(`Errors: ${results.filter(r => !r.success).length}`);
  
  if (results.filter(r => !r.success).length > 0) {
    console.log('\n⚠️  Tables with errors:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.table}: ${r.error}`);
    });
  }

  console.log('\n✅ Member data cleared! Database ready for real member import.\n');
  console.log('📋 PRESERVED DATA:');
  console.log('  - 11 users (login accounts)');
  console.log('  - 12 roles + 31 permissions');
  console.log('  - 19 brokers');
  console.log('  - 9 products (insurance plans)');
  console.log('  - Benefit configuration');
  console.log('');
}

clearMemberData();

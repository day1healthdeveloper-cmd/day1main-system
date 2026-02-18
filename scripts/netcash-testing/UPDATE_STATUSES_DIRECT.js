/**
 * Update transaction statuses using direct SQL via Supabase RPC
 */

const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDc1NjUsImV4cCI6MjA4MTEyMzU2NX0.EGtoHE5B7Zs1lmnrWrVEwtSmPyh_z8_v8Kk-tlBgtnQ';

console.log('🔄 Updating transaction statuses...\n');

async function updateStatuses() {
  try {
    // Get all transaction IDs
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/debit_order_transactions?select=id&order=created_at.desc&limit=20`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const transactions = await response.json();
    console.log(`Found ${transactions.length} transactions\n`);
    
    // Update first 6 to successful
    for (let i = 0; i < 6 && i < transactions.length; i++) {
      const result = await fetch(
        `${SUPABASE_URL}/rest/v1/debit_order_transactions?id=eq.${transactions[i].id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            status: 'successful',
            netcash_status: 'APPROVED',
            updated_at: new Date().toISOString()
          })
        }
      );
      console.log(`✅ Transaction ${i+1} → successful (${result.status})`);
    }
    
    // Update next 8 to failed
    const reasons = ['Insufficient funds', 'Account closed', 'Invalid account', 'Bank declined'];
    for (let i = 6; i < 14 && i < transactions.length; i++) {
      const result = await fetch(
        `${SUPABASE_URL}/rest/v1/debit_order_transactions?id=eq.${transactions[i].id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            status: 'failed',
            netcash_status: 'DECLINED',
            failure_reason: reasons[(i-6) % reasons.length],
            retry_count: Math.floor(Math.random() * 3),
            updated_at: new Date().toISOString()
          })
        }
      );
      console.log(`❌ Transaction ${i+1} → failed (${result.status})`);
    }
    
    console.log('\n✅ Done! Refresh the UI to see changes.');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

updateStatuses();

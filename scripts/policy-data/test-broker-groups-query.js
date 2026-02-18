/**
 * Test Broker Groups Query
 * Run: node test-broker-groups-query.js
 */

const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDc1NjUsImV4cCI6MjA4MTEyMzU2NX0.EGtoHE5B7Zs1lmnrWrVEwtSmPyh_z8_v8Kk-tlBgtnQ';

async function testBrokerGroupsQuery() {
  console.log('🔍 Testing Broker Groups Query...\n');

  try {
    // Query members table
    console.log('📊 Querying members table...');
    const response = await fetch(`${SUPABASE_URL}/rest/v1/members?select=broker_group,debit_order_status,monthly_premium,total_arrears`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const members = await response.json();
    console.log(`✅ Found ${members.length} members\n`);

    if (members.length === 0) {
      console.log('❌ No members found in database!');
      return;
    }

    // Group by broker_group
    const groupMap = new Map();

    members.forEach(member => {
      const group = member.broker_group;
      
      if (!group) {
        return;
      }
      
      if (!groupMap.has(group)) {
        groupMap.set(group, {
          broker_group: group,
          member_count: 0,
          active_count: 0,
          pending_count: 0,
          suspended_count: 0,
          failed_count: 0,
          total_premium: 0,
          total_arrears: 0,
        });
      }

      const stats = groupMap.get(group);
      stats.member_count++;
      stats.total_premium += member.monthly_premium || 0;
      stats.total_arrears += member.total_arrears || 0;

      if (member.debit_order_status === 'active') stats.active_count++;
      if (member.debit_order_status === 'pending') stats.pending_count++;
      if (member.debit_order_status === 'suspended') stats.suspended_count++;
      if (member.debit_order_status === 'failed') stats.failed_count++;
    });

    const result = Array.from(groupMap.values()).sort((a, b) => 
      a.broker_group.localeCompare(b.broker_group)
    );
    
    console.log(`✅ Created ${result.length} broker groups\n`);
    console.log('📋 Broker Groups:\n');
    result.forEach(group => {
      console.log(`  ${group.broker_group.padEnd(10)} | ${String(group.member_count).padStart(4)} members | R${group.total_premium.toFixed(2).padStart(12)} | Active: ${group.active_count}`);
    });
    
    console.log('\n✅ Query test completed successfully!\n');
    console.log('Sample group object:');
    console.log(JSON.stringify(result[0], null, 2));
    
  } catch (error) {
    console.error('❌ Query Failed!\n');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testBrokerGroupsQuery();

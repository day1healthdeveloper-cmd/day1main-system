require('dotenv').config({ path: 'apps/backend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Testing Broker Groups Query');
console.log('URL:', supabaseUrl);
console.log('Key present:', !!supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBrokerGroups() {
  try {
    console.log('\n📊 Querying members table...');
    
    const { data: members, error } = await supabase
      .from('members')
      .select('broker_group, debit_order_status, monthly_premium, total_arrears');

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log(`✅ Found ${members.length} members`);
    
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
    
    console.log(`\n✅ Created ${result.length} broker groups`);
    console.log('\n📋 Broker Groups:');
    result.forEach(group => {
      console.log(`  ${group.broker_group}: ${group.member_count} members, R${group.total_premium.toFixed(2)} premium`);
    });
    
    console.log('\n✅ Test completed successfully!');
    console.log('\nSample group object:');
    console.log(JSON.stringify(result[0], null, 2));
    
  } catch (error) {
    console.error('❌ Exception:', error);
  }
}

testBrokerGroups();

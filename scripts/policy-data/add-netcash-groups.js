/**
 * Add Netcash Group IDs to Members Table
 * Run: node add-netcash-groups.js
 */

const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDc1NjUsImV4cCI6MjA4MTEyMzU2NX0.EGtoHE5B7Zs1lmnrWrVEwtSmPyh_z8_v8Kk-tlBgtnQ';

async function addNetcashGroups() {
  console.log('🚀 Adding Netcash group IDs to members table...\n');

  try {
    // Group mapping (placeholder IDs - update with actual Netcash group IDs)
    const groupMapping = {
      'DAY1': 1,
      'D1PAR': 2,
      'D1MAM': 3,
      'D1ACU': 4,
      'D1AIB': 5,
      'D1ARC': 6,
      'D1AXS': 7,
      'D1BOU': 8,
      'D1BPO': 9,
      'D1CSS': 10,
      'D1MED': 11,
      'D1MEM': 12,
      'D1MKT': 13,
      'D1MTS': 14,
      'D1NAV': 15,
      'D1RCO': 16,
      'D1TFG': 17,
      'D1THR': 18,
      'D1TLD': 19,
    };

    console.log('📊 Group Mapping (Placeholder IDs):');
    Object.entries(groupMapping).forEach(([broker, netcashId]) => {
      console.log(`  ${broker.padEnd(8)} → Netcash Group ${netcashId}`);
    });
    console.log('');

    // Update members with group IDs
    console.log('📝 Updating members with Netcash group IDs...\n');
    
    let totalUpdated = 0;
    
    for (const [brokerGroup, netcashGroupId] of Object.entries(groupMapping)) {
      // Get members for this broker group
      const getMembersRes = await fetch(
        `${SUPABASE_URL}/rest/v1/members?broker_group=eq.${brokerGroup}&select=id,member_number`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
          },
        }
      );

      const members = await getMembersRes.json();

      if (members && members.length > 0) {
        // Update all members in this group
        const updateRes = await fetch(
          `${SUPABASE_URL}/rest/v1/members?broker_group=eq.${brokerGroup}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify({ netcash_group_id: netcashGroupId }),
          }
        );

        if (updateRes.ok) {
          console.log(`✅ ${brokerGroup.padEnd(8)} : ${members.length} members → Group ${netcashGroupId}`);
          totalUpdated += members.length;
        } else {
          console.log(`❌ ${brokerGroup.padEnd(8)} : Failed to update`);
        }
      } else {
        console.log(`⚠️  ${brokerGroup.padEnd(8)} : No members found`);
      }
    }

    console.log(`\n✅ Updated ${totalUpdated} members with Netcash group IDs\n`);

    // Verify
    console.log('📊 Verification:\n');
    
    const verifyRes = await fetch(
      `${SUPABASE_URL}/rest/v1/members?select=broker_group,netcash_group_id&limit=1000`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    const allMembers = await verifyRes.json();

    // Count by group
    const counts = {};
    allMembers.forEach((m) => {
      const key = `${m.broker_group} (Group ${m.netcash_group_id})`;
      counts[key] = (counts[key] || 0) + 1;
    });

    Object.entries(counts)
      .sort()
      .forEach(([group, count]) => {
        console.log(`  ${group.padEnd(30)} : ${count} members`);
      });

    console.log('\n✅ Netcash group IDs added successfully!\n');
    console.log('📋 Next Steps:');
    console.log('1. Go to Netcash dashboard');
    console.log('2. Create the 19 master file groups');
    console.log('3. Note the actual group IDs Netcash assigns');
    console.log('4. Update the groupMapping in this script with real IDs');
    console.log('5. Run this script again to update with real IDs\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addNetcashGroups();

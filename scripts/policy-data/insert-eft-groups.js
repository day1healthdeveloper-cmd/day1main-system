/**
 * Insert EFT Groups
 * Run: node insert-eft-groups.js
 */

const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU0NzU2NSwiZXhwIjoyMDgxMTIzNTY1fQ.swDffWzSySfDnJEDCEPx6rzDSuVUPe21EQmgV2oe_9I';

const eftGroups = [
  'Afrit',
  'Almar Investments',
  'AOG Western Reef',
  'AOG Head Office',
  'AOG Limpopo',
  'Zutari',
  'Buddy',
  'Central Management',
  'Bidvest',
  'Coactivate',
  'Global Precast',
  'LBX Group',
  'Health Wealth Group',
  'IQAS',
  'JG Electronics',
  'Konika Minolta',
  'Legal and General',
  'New Era Life Insurance',
  'Partners Hair Design',
  'Pioneer Plastics',
  'Primedia Instore',
  'Primedia Outdoor',
  'Pryde Trusses',
  'R&G Sheet Metal',
  'Rovos Rail Tours',
  'Sanitech',
  'SDL',
  'Spheros',
  'Steelpoort',
  'Stellenbosch Blinds',
  'TC Smelters',
  'TFD Network',
  'Tshenolo Insurance Brokers'
];

async function insertGroups() {
  console.log('🚀 Inserting EFT Groups...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const groupName of eftGroups) {
    try {
      const groupCode = groupName
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50);

      const groupData = {
        group_name: groupName,
        group_code: groupCode,
        company_name: groupName,
        group_type: 'eft_group',
        collection_method: 'individual_eft',
        collection_frequency: 'monthly',
        status: 'active',
        total_members: 0,
        total_monthly_premium: 0
      };

      const response = await fetch(`${SUPABASE_URL}/rest/v1/payment_groups`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(groupData)
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${groupName} (${data[0].id})`);
        successCount++;
      } else {
        const error = await response.text();
        console.log(`❌ ${groupName} - ${error}`);
        errorCount++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.log(`❌ ${groupName} - ${error.message}`);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY\n');
  console.log(`Total groups: ${eftGroups.length}`);
  console.log(`✅ Successfully inserted: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log('\n✅ EFT groups insertion completed!\n');
}

insertGroups();

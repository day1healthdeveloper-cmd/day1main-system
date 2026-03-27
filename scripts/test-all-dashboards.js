/**
 * Test All Dashboard API Routes
 */

const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU0NzU2NSwiZXhwIjoyMDgxMTIzNTY1fQ.swDffWzSySfDnJEDCEPx6rzDSuVUPe21EQmgV2oe_9I';

const BASE_URL = 'https://day1main-system.vercel.app';

const dashboards = [
  { role: 'Admin', url: '/api/admin/applications' },
  { role: 'Admin', url: '/api/admin/members' },
  { role: 'Admin', url: '/api/admin/products' },
  { role: 'Admin', url: '/api/admin/payment-groups' },
  { role: 'Marketing', url: '/api/marketing/dashboard' },
  { role: 'Marketing', url: '/api/marketing/leads' },
  { role: 'Operations', url: '/api/operations/payment-groups' },
  { role: 'Operations', url: '/api/operations/members?no_group=true' },
  { role: 'Leads', url: '/api/leads' },
  { role: 'Applications', url: '/api/applications' },
];

async function testDashboard(dashboard) {
  try {
    const response = await fetch(`${BASE_URL}${dashboard.url}`, {
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
      }
    });

    const status = response.status;
    let result = '❌ FAILED';
    let details = '';

    if (status === 200) {
      result = '✅ OK';
      const data = await response.json();
      details = `(${JSON.stringify(data).length} bytes)`;
    } else if (status === 404) {
      result = '⚠️  404';
      details = 'Not Found';
    } else if (status === 500) {
      result = '❌ 500';
      const text = await response.text();
      details = text.substring(0, 100);
    } else if (status === 503) {
      result = '⚠️  503';
      details = 'Service Unavailable';
    } else {
      result = `❌ ${status}`;
      details = await response.text();
    }

    console.log(`${result} [${dashboard.role}] ${dashboard.url}`);
    if (details && status !== 200 && status !== 503) {
      console.log(`    ${details}\n`);
    }

  } catch (error) {
    console.log(`❌ ERROR [${dashboard.role}] ${dashboard.url}`);
    console.log(`    ${error.message}\n`);
  }
}

async function testAll() {
  console.log('🧪 Testing All Dashboard API Routes\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  for (const dashboard of dashboards) {
    await testDashboard(dashboard);
  }

  console.log('\n✅ Testing complete!\n');
}

testAll();

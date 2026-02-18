/**
 * Fetch Real Dashboard Data from Supabase
 * Run: node fetch-dashboard-data.js
 */

const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDc1NjUsImV4cCI6MjA4MTEyMzU2NX0.EGtoHE5B7Zs1lmnrWrVEwtSmPyh_z8_v8Kk-tlBgtnQ';

async function getCount(table) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=count`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      }
    });

    const contentRange = response.headers.get('content-range');
    if (contentRange) {
      return parseInt(contentRange.split('/')[1]) || 0;
    }
    return 0;
  } catch (error) {
    console.error(`Error fetching ${table}:`, error.message);
    return 0;
  }
}

async function getClaimsData() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/claims?select=status,claim_amount`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      }
    });

    const claims = await response.json();
    
    if (!Array.isArray(claims)) {
      return { pending: 0, paid: 0, totalPaid: 0, outstanding: 0, total: 0 };
    }
    
    const pending = claims.filter(c => c.status === 'pending' || c.status === 'submitted').length;
    const paid = claims.filter(c => c.status === 'paid' || c.status === 'approved').length;
    const totalPaid = claims
      .filter(c => c.status === 'paid')
      .reduce((sum, c) => sum + (parseFloat(c.claim_amount) || 0), 0);
    const outstanding = claims
      .filter(c => c.status === 'pending' || c.status === 'submitted' || c.status === 'approved')
      .reduce((sum, c) => sum + (parseFloat(c.claim_amount) || 0), 0);

    return { pending, paid, totalPaid, outstanding, total: claims.length };
  } catch (error) {
    console.error('Error fetching claims data:', error.message);
    return { pending: 0, paid: 0, totalPaid: 0, outstanding: 0, total: 0 };
  }
}

async function getPoliciesData() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/policies?select=status,premium_amount`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      }
    });

    const policies = await response.json();
    
    if (!Array.isArray(policies)) {
      return { active: 0, totalPremium: 0, total: 0 };
    }
    
    const active = policies.filter(p => p.status === 'active').length;
    const totalPremium = policies
      .filter(p => p.status === 'active')
      .reduce((sum, p) => sum + (parseFloat(p.premium_amount) || 0), 0);

    return { active, totalPremium, total: policies.length };
  } catch (error) {
    console.error('Error fetching policies data:', error.message);
    return { active: 0, totalPremium: 0, total: 0 };
  }
}

async function getApplicationsData() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/applications?select=status`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      }
    });

    const applications = await response.json();
    
    if (!Array.isArray(applications)) {
      return { pending: 0, total: 0 };
    }
    
    const pending = applications.filter(a => 
      a.status === 'pending' || 
      a.status === 'submitted' || 
      a.status === 'under_review'
    ).length;

    return { pending, total: applications.length };
  } catch (error) {
    console.error('Error fetching applications data:', error.message);
    return { pending: 0, total: 0 };
  }
}

async function fetchDashboardData() {
  console.log('📊 Fetching Real Dashboard Data...\n');

  // Get counts
  const members = await getCount('members');
  const providers = await getCount('providers');
  const brokers = await getCount('users'); // Assuming brokers are in users table
  
  // Get detailed data
  const policiesData = await getPoliciesData();
  const claimsData = await getClaimsData();
  const applicationsData = await getApplicationsData();

  // Calculate financial data
  const monthlyPremium = policiesData.totalPremium;
  const claimsPaid = claimsData.totalPaid;
  const outstandingClaims = claimsData.outstanding;
  const lossRatio = monthlyPremium > 0 ? ((claimsPaid / monthlyPremium) * 100).toFixed(1) : 0;
  const cashReserves = monthlyPremium * 0.8; // Estimate: 80% of monthly premium as reserves

  const dashboardData = {
    systemStatistics: {
      members: members,
      activePolicies: policiesData.active,
      pendingClaims: claimsData.pending,
      pendingPreauths: 0, // Will be 0 if no preauth table
      providers: providers,
      activeBrokers: brokers
    },
    financialOverview: {
      monthlyPremium: Math.round(monthlyPremium),
      claimsPaid: Math.round(claimsPaid),
      outstandingClaims: Math.round(outstandingClaims),
      cashReserves: Math.round(cashReserves),
      lossRatio: parseFloat(lossRatio),
      claimsCount: claimsData.paid
    },
    applications: {
      pending: applicationsData.pending,
      total: applicationsData.total
    }
  };

  console.log('✅ Dashboard Data Fetched:\n');
  console.log(JSON.stringify(dashboardData, null, 2));
  console.log('\n');

  return dashboardData;
}

fetchDashboardData();

/**
 * Check if day1health landing page exists
 */

const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDc1NjUsImV4cCI6MjA4MTEyMzU2NX0.EGtoHE5B7Zs1lmnrWrVEwtSmPyh_z8_v8Kk-tlBgtnQ';

async function checkLandingPage() {
  console.log('🔍 Checking for day1health landing page...\n');

  try {
    // Check if landing page exists
    const response = await fetch(`${SUPABASE_URL}/rest/v1/landing_pages?slug=eq.day1health&select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.length === 0) {
      console.log('❌ Landing page "day1health" NOT FOUND\n');
      console.log('We need to create it. Would you like me to create it now?\n');
      return false;
    } else {
      console.log('✅ Landing page "day1health" EXISTS!\n');
      console.log('Details:');
      console.log('  ID:', data[0].id);
      console.log('  Name:', data[0].name);
      console.log('  Slug:', data[0].slug);
      console.log('  Template:', data[0].template);
      console.log('  Status:', data[0].status);
      console.log('\n✅ Ready to test at: http://localhost:3001/lp/day1health\n');
      return true;
    }

  } catch (error) {
    console.error('❌ Error checking landing page!\n');
    console.error('Error:', error.message);
    return false;
  }
}

checkLandingPage();

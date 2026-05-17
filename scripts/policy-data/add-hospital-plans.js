/**
 * Add 4 Hospital Plans to Products Table
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
if (!SUPABASE_URL) throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL");
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_SERVICE_KEY) throw new Error("Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY");

const plans = [
  {
    name: 'Executive Hospital Plan',
    code: 'executive',
    regime: 'medical_scheme',
    description: 'Comprehensive hospital cover with high benefit limits including critical illness, maternity, and funeral benefits. Covers up to R500,000 for accident/trauma incidents.',
    status: 'published'
  },
  {
    name: 'Platinum Hospital Plan',
    code: 'platinum',
    regime: 'medical_scheme',
    description: 'Premium hospital cover with excellent benefit limits including critical illness, maternity, and funeral benefits. Covers up to R300,000 for accident/trauma incidents.',
    status: 'published'
  },
  {
    name: 'Value Plus Hospital Plan',
    code: 'value-plus',
    regime: 'medical_scheme',
    description: 'Affordable hospital cover for members under 65 with essential benefits including accident trauma and funeral cover. Covers up to R300,000 for accident/trauma incidents.',
    status: 'published'
  },
  {
    name: 'Value Plus Hospital Plan - Senior',
    code: 'value-plus-senior',
    regime: 'medical_scheme',
    description: 'Tailored hospital cover for seniors 65+ with essential benefits. Covers up to R150,000 for accident/trauma incidents. Excludes maternity and sports injuries.',
    status: 'published'
  }
];

async function addPlans() {
  console.log('📦 ADDING 4 HOSPITAL PLANS TO PRODUCTS TABLE');
  console.log('=' .repeat(80));
  console.log('');

  try {
    // Check if plans already exist
    console.log('🔍 Checking for existing plans...');
    const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/products?select=code`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    });
    
    const existingProducts = await checkResponse.json();
    const existingCodes = existingProducts.map(p => p.code);
    
    console.log(`Found ${existingProducts.length} existing products`);
    console.log('');

    // Filter out plans that already exist
    const plansToAdd = plans.filter(plan => !existingCodes.includes(plan.code));
    
    if (plansToAdd.length === 0) {
      console.log('✅ All 4 hospital plans already exist in database!');
      console.log('');
      console.log('Existing plans:');
      plans.forEach(plan => {
        console.log(`  - ${plan.name} (${plan.code})`);
      });
      console.log('');
      return;
    }

    console.log(`📝 Adding ${plansToAdd.length} new plans...`);
    console.log('');

    // Add plans
    const response = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(plansToAdd)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to add plans: ${error}`);
    }

    const addedPlans = await response.json();

    console.log('✅ PLANS ADDED SUCCESSFULLY!');
    console.log('');
    console.log('Added plans:');
    addedPlans.forEach(plan => {
      console.log(`  ✅ ${plan.name}`);
      console.log(`     Code: ${plan.code}`);
      console.log(`     Base Premium: R${plan.base_premium}`);
      console.log(`     Cover Amount: R${plan.cover_amount.toLocaleString()}`);
      console.log(`     Age Range: ${plan.age_range}`);
      console.log('');
    });

    console.log('🎯 SUMMARY:');
    console.log('-'.repeat(80));
    console.log(`Total plans in database: ${existingProducts.length + addedPlans.length}`);
    console.log(`New plans added: ${addedPlans.length}`);
    console.log('');
    console.log('All 4 hospital plans are now available in the Products tab!');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addPlans();

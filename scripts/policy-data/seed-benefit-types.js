/**
 * Seed Benefit Types Data
 * Run: node supabase/seed-benefit-types.js
 */

const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDc1NjUsImV4cCI6MjA4MTEyMzU2NX0.EGtoHE5B7Zs1lmnrWrVEwtSmPyh_z8_v8Kk-tlBgtnQ';

const benefitTypes = [
  // Hospital Benefits
  { code: 'HOSP_GENERAL', name: 'General Hospital Admission', category: 'hospital', description: 'General hospital admission and accommodation', requires_preauth: true },
  { code: 'HOSP_ICU', name: 'ICU/High Care', category: 'hospital', description: 'Intensive Care Unit and High Care', requires_preauth: true },
  { code: 'HOSP_MATERNITY', name: 'Maternity', category: 'hospital', description: 'Maternity and childbirth', requires_preauth: true },
  { code: 'HOSP_SURGERY', name: 'Surgery', category: 'hospital', description: 'Surgical procedures', requires_preauth: true },
  { code: 'HOSP_ONCOLOGY', name: 'Oncology', category: 'hospital', description: 'Cancer treatment', requires_preauth: true },
  
  // Specialist Benefits
  { code: 'SPEC_CONSULTATION', name: 'Specialist Consultation', category: 'specialist', description: 'Specialist doctor consultations', requires_preauth: false },
  { code: 'SPEC_SURGEON', name: 'Surgeon Fees', category: 'specialist', description: 'Surgeon professional fees', requires_preauth: true },
  { code: 'SPEC_ANAESTHETIST', name: 'Anaesthetist Fees', category: 'specialist', description: 'Anaesthetist professional fees', requires_preauth: true },
  
  // GP & Day-to-Day Benefits
  { code: 'GP_CONSULTATION', name: 'GP Consultation', category: 'day_to_day', description: 'General Practitioner consultations', requires_preauth: false },
  { code: 'ACUTE_MEDICATION', name: 'Acute Medication', category: 'day_to_day', description: 'Acute medication from pharmacy', requires_preauth: false },
  { code: 'CHRONIC_MEDICATION', name: 'Chronic Medication', category: 'day_to_day', description: 'Chronic medication from pharmacy', requires_preauth: false },
  { code: 'DENTISTRY', name: 'Dentistry', category: 'day_to_day', description: 'Dental consultations and procedures', requires_preauth: false },
  { code: 'OPTOMETRY', name: 'Optometry', category: 'day_to_day', description: 'Eye tests and spectacles', requires_preauth: false },
  
  // Diagnostic Benefits
  { code: 'PATHOLOGY', name: 'Pathology', category: 'diagnostic', description: 'Laboratory tests and pathology', requires_preauth: false },
  { code: 'RADIOLOGY', name: 'Radiology', category: 'diagnostic', description: 'X-rays and radiology', requires_preauth: false },
  { code: 'MRI_CT', name: 'MRI/CT Scans', category: 'diagnostic', description: 'MRI and CT scans', requires_preauth: true },
  
  // Allied Health Benefits
  { code: 'PHYSIOTHERAPY', name: 'Physiotherapy', category: 'allied_health', description: 'Physiotherapy treatments', requires_preauth: false },
  { code: 'PSYCHOLOGY', name: 'Psychology', category: 'allied_health', description: 'Psychology and counselling', requires_preauth: false },
  { code: 'OCCUPATIONAL_THERAPY', name: 'Occupational Therapy', category: 'allied_health', description: 'Occupational therapy', requires_preauth: false },
  { code: 'SPEECH_THERAPY', name: 'Speech Therapy', category: 'allied_health', description: 'Speech and language therapy', requires_preauth: false },
  
  // Emergency Benefits
  { code: 'AMBULANCE', name: 'Ambulance Services', category: 'emergency', description: 'Emergency ambulance transport', requires_preauth: false },
  { code: 'EMERGENCY_ROOM', name: 'Emergency Room', category: 'emergency', description: 'Emergency room treatment', requires_preauth: false },
  
  // PMB Benefits
  { code: 'PMB_DIAGNOSIS', name: 'PMB Diagnosis', category: 'pmb', description: 'Prescribed Minimum Benefits - Diagnosis', requires_preauth: false },
  { code: 'PMB_TREATMENT', name: 'PMB Treatment', category: 'pmb', description: 'Prescribed Minimum Benefits - Treatment', requires_preauth: false },
  { code: 'PMB_EMERGENCY', name: 'PMB Emergency', category: 'pmb', description: 'Prescribed Minimum Benefits - Emergency', requires_preauth: false },
];

async function seedBenefitTypes() {
  console.log('🌱 Seeding Benefit Types...\n');

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/benefit_types`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(benefitTypes)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const data = await response.json();
    console.log(`✅ Inserted ${data.length} benefit types\n`);

    // Group by category
    const byCategory = {};
    data.forEach(bt => {
      if (!byCategory[bt.category]) byCategory[bt.category] = [];
      byCategory[bt.category].push(bt);
    });

    console.log('Benefit Types by Category:\n');
    Object.entries(byCategory).forEach(([category, types]) => {
      console.log(`  ${category.toUpperCase()} (${types.length}):`);
      types.forEach(t => console.log(`    - ${t.name} (${t.code})`));
      console.log('');
    });

    console.log('✅ Benefit types seeded successfully!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedBenefitTypes();

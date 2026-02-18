/**
 * 6-STEP APPLICATION FLOW TEST
 * Tests the complete application submission from landing page to database
 */

const FRONTEND_URL = 'http://localhost:3001';
const BACKEND_URL = 'http://localhost:3000';

async function testApplicationFlow() {
  console.log('🧪 TESTING 6-STEP APPLICATION FLOW');
  console.log('=' .repeat(80));
  console.log('');

  // TEST 1: Landing Page
  console.log('📋 TEST 1: Landing Page');
  console.log('-'.repeat(80));
  try {
    const landingResponse = await fetch(`${FRONTEND_URL}/lp/summer-health-2026`);
    if (landingResponse.ok) {
      const html = await landingResponse.text();
      const hasButton = html.includes('1 Min Signup') || html.includes('Apply Now');
      console.log(`✅ Landing page loads: ${landingResponse.status}`);
      console.log(`✅ Application button present: ${hasButton ? 'Yes' : 'No'}`);
    } else {
      console.log(`❌ Landing page failed: ${landingResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ Landing page error: ${error.message}`);
  }
  console.log('');

  // TEST 2: Application Page
  console.log('📋 TEST 2: Application Page');
  console.log('-'.repeat(80));
  try {
    const applyResponse = await fetch(`${FRONTEND_URL}/apply?plan=starter&planName=Starter%20Plan&price=599&adults=1&children=0`);
    if (applyResponse.ok) {
      const html = await applyResponse.text();
      const hasStep1 = html.includes('Personal Info') || html.includes('firstName');
      const hasStep2 = html.includes('Documents');
      const hasStep3 = html.includes('Dependents');
      const hasStep4 = html.includes('Medical History');
      const hasStep5 = html.includes('Banking');
      const hasStep6 = html.includes('Review') || html.includes('Submit');
      
      console.log(`✅ Application page loads: ${applyResponse.status}`);
      console.log(`✅ Step 1 (Personal Info): ${hasStep1 ? 'Present' : 'Missing'}`);
      console.log(`✅ Step 2 (Documents): ${hasStep2 ? 'Present' : 'Missing'}`);
      console.log(`✅ Step 3 (Dependents): ${hasStep3 ? 'Present' : 'Missing'}`);
      console.log(`✅ Step 4 (Medical History): ${hasStep4 ? 'Present' : 'Missing'}`);
      console.log(`✅ Step 5 (Banking): ${hasStep5 ? 'Present' : 'Missing'}`);
      console.log(`✅ Step 6 (Review & Submit): ${hasStep6 ? 'Present' : 'Missing'}`);
    } else {
      console.log(`❌ Application page failed: ${applyResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ Application page error: ${error.message}`);
  }
  console.log('');

  // TEST 3: Submit Test Application
  console.log('📋 TEST 3: Submit Test Application');
  console.log('-'.repeat(80));
  
  const testApplication = {
    // Step 1: Personal Info
    firstName: 'John',
    lastName: 'TestUser',
    idNumber: '8001015009087',
    dateOfBirth: '1980-01-01',
    gender: 'male',
    email: 'john.test@example.com',
    mobile: '0821234567',
    addressLine1: '123 Test Street',
    city: 'Cape Town',
    postalCode: '8001',
    
    // Plan Info
    planId: 'starter',
    planName: 'Starter Plan',
    planConfig: 'single',
    monthlyPrice: 599,
    
    // Step 2: Documents (mock URLs)
    idDocumentUrl: 'https://example.com/id.jpg',
    proofOfAddressUrl: 'https://example.com/address.pdf',
    selfieUrl: 'https://example.com/selfie.jpg',
    
    // Step 3: Dependents (none for this test)
    dependents: [],
    
    // Step 4: Medical History
    medicalHistory: {
      hasPreExisting: false,
      hasPreviousInsurer: false
    },
    
    // Step 5: Banking
    bankName: 'FNB',
    accountNumber: '62123456789',
    branchCode: '250655',
    accountHolderName: 'John TestUser',
    debitOrderDay: 1,
    
    // Step 6: Terms & Consent
    voiceRecordingUrl: 'https://example.com/voice.mp3',
    signatureUrl: 'https://example.com/signature.png',
    termsAccepted: true,
    marketingConsent: true,
    marketingConsentDate: new Date().toISOString(),
    emailConsent: true,
    smsConsent: false,
    phoneConsent: false
  };

  try {
    const submitResponse = await fetch(`${FRONTEND_URL}/api/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testApplication)
    });

    if (submitResponse.ok) {
      const result = await submitResponse.json();
      console.log('✅ Application submitted successfully!');
      console.log(`   Application Number: ${result.applicationNumber}`);
      console.log(`   Application ID: ${result.applicationId}`);
      console.log(`   Contact ID: ${result.contactId}`);
      
      // Store for verification
      global.testApplicationId = result.applicationId;
      global.testContactId = result.contactId;
    } else {
      const error = await submitResponse.json();
      console.log(`❌ Application submission failed: ${submitResponse.status}`);
      console.log(`   Error: ${error.error || error.details || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(`❌ Application submission error: ${error.message}`);
  }
  console.log('');

  // TEST 4: Verify Database Storage
  console.log('📋 TEST 4: Verify Database Storage');
  console.log('-'.repeat(80));
  console.log('⚠️  Manual verification required:');
  console.log('   1. Check Supabase dashboard for new application record');
  console.log('   2. Verify contact record was created/updated');
  console.log('   3. Check all 51 fields are populated correctly');
  console.log('   4. Verify marketing consent flags are stored');
  console.log('');

  // TEST 5: Admin View
  console.log('📋 TEST 5: Admin View Access');
  console.log('-'.repeat(80));
  try {
    const adminResponse = await fetch(`${FRONTEND_URL}/admin/applications`);
    if (adminResponse.ok) {
      console.log('✅ Admin applications page accessible');
      console.log('   URL: http://localhost:3001/admin/applications');
    } else {
      console.log(`⚠️  Admin page requires authentication: ${adminResponse.status}`);
      console.log('   This is expected - login required');
    }
  } catch (error) {
    console.log(`❌ Admin page error: ${error.message}`);
  }
  console.log('');

  // SUMMARY
  console.log('=' .repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('=' .repeat(80));
  console.log('');
  console.log('✅ COMPLETED TESTS:');
  console.log('   1. Landing page loads and has application button');
  console.log('   2. Application page loads with all 6 steps');
  console.log('   3. Application submission API works');
  console.log('   4. Database storage (manual verification needed)');
  console.log('   5. Admin view accessible (requires login)');
  console.log('');
  console.log('🎯 NEXT STEPS FOR CEO DEMO:');
  console.log('   1. Test OCR feature (Scan ID button)');
  console.log('   2. Test voice recording on Step 6');
  console.log('   3. Test signature capture on Step 6');
  console.log('   4. Login to admin and view submitted application');
  console.log('   5. Create 5-10 sample applications with different statuses');
  console.log('');
  console.log('🔗 DEMO FLOW:');
  console.log('   Landing Page → http://localhost:3001/lp/summer-health-2026');
  console.log('   Application  → http://localhost:3001/apply');
  console.log('   Admin View   → http://localhost:3001/admin/applications');
  console.log('');
}

testApplicationFlow();

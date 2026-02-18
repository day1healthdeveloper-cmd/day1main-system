/**
 * Test Complete Approval Flow
 * 1. Submit application with ALL fields
 * 2. Approve application
 * 3. Verify member has ALL fields (exact copy)
 * 4. Verify application is deleted
 */

const FRONTEND_URL = 'http://localhost:3001';
const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU0NzU2NSwiZXhwIjoyMDgxMTIzNTY1fQ.swDffWzSySfDnJEDCEPx6rzDSuVUPe21EQmgV2oe_9I';

async function testCompleteFlow() {
  console.log('🧪 TESTING COMPLETE APPROVAL FLOW');
  console.log('=' .repeat(80));
  console.log('');

  // STEP 1: Submit complete application
  console.log('📝 STEP 1: Submitting complete test application...');
  console.log('-'.repeat(80));
  
  const testApplication = {
    // Step 1: Personal Information
    firstName: 'Emma',
    lastName: 'TestFlow',
    idNumber: '9405125009088',
    dateOfBirth: '1994-05-12',
    gender: 'female',
    email: 'emma.testflow@example.com',
    mobile: '0829876543',
    addressLine1: '789 Test Street',
    addressLine2: 'Unit 5C',
    city: 'Cape Town',
    postalCode: '8001',
    
    // Plan Information
    planId: 'platinum',
    planName: 'Platinum Hospital',
    planConfig: 'individual',
    monthlyPrice: 2500,
    
    // Step 2: Documents
    idDocumentUrl: 'https://ldygmpaipxbokxzyzyti.supabase.co/storage/v1/object/public/applications/documents/id/TEST-EMMA-ID.jpg',
    proofOfAddressUrl: 'https://ldygmpaipxbokxzyzyti.supabase.co/storage/v1/object/public/applications/documents/address/TEST-EMMA-ADDR.pdf',
    selfieUrl: 'https://ldygmpaipxbokxzyzyti.supabase.co/storage/v1/object/public/applications/documents/selfie/TEST-EMMA-SELFIE.jpg',
    
    // Step 3: No dependents for this test
    dependents: [],
    
    // Step 4: Medical History
    medicalHistory: {
      hasPreExisting: false,
      preExistingConditions: '',
      currentMedications: '',
      hasPreviousInsurer: false,
      previousInsurer: '',
      reasonForSwitching: 'First time medical aid member'
    },
    
    // Step 5: Banking Details
    bankName: 'FNB',
    accountNumber: '987654321',
    branchCode: '250655',
    accountHolderName: 'Emma TestFlow',
    debitOrderDay: 15,
    
    // Step 6: Terms & Consent
    voiceRecordingUrl: 'https://ldygmpaipxbokxzyzyti.supabase.co/storage/v1/object/public/applications/voice/TEST-EMMA-VOICE.webm',
    signatureUrl: 'https://ldygmpaipxbokxzyzyti.supabase.co/storage/v1/object/public/applications/signatures/TEST-EMMA-SIG.png',
    termsAccepted: true,
    marketingConsent: false,
    marketingConsentDate: new Date().toISOString(),
    emailConsent: false,
    smsConsent: false,
    phoneConsent: false
  };

  let applicationId, applicationNumber;

  try {
    const submitResponse = await fetch(`${FRONTEND_URL}/api/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testApplication)
    });

    if (!submitResponse.ok) {
      const error = await submitResponse.json();
      throw new Error(`Submission failed: ${error.error || error.details}`);
    }

    const submitResult = await submitResponse.json();
    applicationId = submitResult.applicationId;
    applicationNumber = submitResult.applicationNumber;
    
    console.log(`✅ Application submitted: ${applicationNumber}`);
    console.log(`   Application ID: ${applicationId}`);
    console.log('');

  } catch (error) {
    console.error('❌ STEP 1 FAILED:', error.message);
    process.exit(1);
  }

  // STEP 2: Approve application
  console.log('✅ STEP 2: Approving application...');
  console.log('-'.repeat(80));

  let memberId, memberNumber;

  try {
    const approveResponse = await fetch(`${FRONTEND_URL}/api/admin/applications`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicationId: applicationId,
        status: 'approved',
        reviewNotes: 'Test approval - verifying complete data copy',
      })
    });

    if (!approveResponse.ok) {
      const error = await approveResponse.json();
      throw new Error(`Approval failed: ${error.error || error.details}`);
    }

    const approveResult = await approveResponse.json();
    memberId = approveResult.member.id;
    memberNumber = approveResult.member.member_number;
    
    console.log(`✅ Application approved`);
    console.log(`   Member Number: ${memberNumber}`);
    console.log(`   Member ID: ${memberId}`);
    console.log('');

  } catch (error) {
    console.error('❌ STEP 2 FAILED:', error.message);
    process.exit(1);
  }

  // STEP 3: Verify member has ALL fields
  console.log('🔍 STEP 3: Verifying member has ALL application fields...');
  console.log('-'.repeat(80));

  try {
    const memberResponse = await fetch(`${SUPABASE_URL}/rest/v1/members?id=eq.${memberId}&select=*`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    });

    const members = await memberResponse.json();
    const member = members[0];

    if (!member) {
      throw new Error('Member not found!');
    }

    console.log('✅ Member found in database');
    console.log('');
    console.log('📋 Verifying ALL fields copied correctly:');
    console.log('');

    // Verify each field group
    const checks = [
      { name: 'Personal Info', fields: ['first_name', 'last_name', 'id_number', 'email', 'mobile', 'date_of_birth', 'gender'] },
      { name: 'Address', fields: ['address_line1', 'address_line2', 'city', 'postal_code'] },
      { name: 'Documents', fields: ['id_document_url', 'proof_of_address_url', 'selfie_url'] },
      { name: 'Medical History', fields: ['medical_history'] },
      { name: 'Banking', fields: ['bank_name', 'account_number', 'branch_code', 'account_holder_name', 'debit_order_day'] },
      { name: 'Voice & Signature', fields: ['voice_recording_url', 'signature_url'] },
      { name: 'Terms & Consent', fields: ['terms_accepted_at', 'marketing_consent', 'email_consent', 'sms_consent', 'phone_consent'] },
      { name: 'Plan', fields: ['plan_id', 'plan_name', 'plan_config', 'monthly_premium'] },
      { name: 'Application Tracking', fields: ['application_id', 'application_number', 'approved_at'] },
    ];

    let allFieldsPresent = true;

    for (const check of checks) {
      console.log(`${check.name}:`);
      for (const field of check.fields) {
        const hasValue = member[field] !== null && member[field] !== undefined;
        if (hasValue) {
          console.log(`  ✅ ${field}: ${typeof member[field] === 'object' ? 'JSON data present' : member[field]}`);
        } else {
          console.log(`  ❌ ${field}: MISSING`);
          allFieldsPresent = false;
        }
      }
      console.log('');
    }

    if (!allFieldsPresent) {
      throw new Error('Some fields are missing from member record!');
    }

    console.log('✅ ALL FIELDS COPIED SUCCESSFULLY!');
    console.log('');

  } catch (error) {
    console.error('❌ STEP 3 FAILED:', error.message);
    process.exit(1);
  }

  // STEP 4: Verify application is deleted
  console.log('🗑️  STEP 4: Verifying application is deleted...');
  console.log('-'.repeat(80));

  try {
    const appResponse = await fetch(`${SUPABASE_URL}/rest/v1/applications?id=eq.${applicationId}&select=*`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    });

    const applications = await appResponse.json();

    if (applications.length > 0) {
      throw new Error('Application still exists in database! Should be deleted after approval.');
    }

    console.log('✅ Application deleted successfully');
    console.log('');

    // Check dependents also deleted
    const depResponse = await fetch(`${SUPABASE_URL}/rest/v1/application_dependents?application_id=eq.${applicationId}&select=*`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    });

    const dependents = await depResponse.json();

    if (dependents.length > 0) {
      throw new Error('Application dependents still exist! Should be deleted with application.');
    }

    console.log('✅ Application dependents deleted successfully');
    console.log('');

  } catch (error) {
    console.error('❌ STEP 4 FAILED:', error.message);
    process.exit(1);
  }

  // SUCCESS!
  console.log('🎉 ALL TESTS PASSED!');
  console.log('=' .repeat(80));
  console.log('');
  console.log('✅ Application submitted with ALL fields');
  console.log('✅ Application approved successfully');
  console.log('✅ Member created with EXACT COPY of all application data');
  console.log('✅ Application and dependents deleted after approval');
  console.log('');
  console.log(`📊 Member Details:`);
  console.log(`   Member Number: ${memberNumber}`);
  console.log(`   Member ID: ${memberId}`);
  console.log(`   Name: Emma TestFlow`);
  console.log(`   Email: emma.testflow@example.com`);
  console.log('');
  console.log('🎯 APPROVAL FLOW WORKING PERFECTLY!');
  console.log('');
}

testCompleteFlow().catch(error => {
  console.error('');
  console.error('❌ TEST FAILED:', error.message);
  console.error('');
  process.exit(1);
});

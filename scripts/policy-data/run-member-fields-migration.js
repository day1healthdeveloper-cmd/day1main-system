/**
 * Run Migration: Add ALL application fields to members table
 */

const fs = require('fs');

const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU0NzU2NSwiZXhwIjoyMDgxMTIzNTY1fQ.swDffWzSySfDnJEDCEPx6rzDSuVUPe21EQmgV2oe_9I';

async function runMigration() {
  console.log('🔄 RUNNING MIGRATION: Add ALL application fields to members');
  console.log('=' .repeat(80));
  console.log('');

  try {
    // Read migration file
    const migrationSQL = fs.readFileSync('supabase/migrations/009_add_all_application_fields_to_members.sql', 'utf8');
    
    console.log('📄 Migration SQL:');
    console.log('-'.repeat(80));
    console.log(migrationSQL);
    console.log('');
    
    console.log('⏳ Executing migration...');
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ query: migrationSQL })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Migration failed: ${error}`);
    }

    console.log('✅ MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('');
    console.log('📊 Added fields to members table:');
    console.log('-'.repeat(80));
    console.log('Documents:');
    console.log('  ✅ id_document_url');
    console.log('  ✅ id_document_ocr_data');
    console.log('  ✅ proof_of_address_url');
    console.log('  ✅ proof_of_address_ocr_data');
    console.log('  ✅ selfie_url');
    console.log('  ✅ face_verification_result');
    console.log('');
    console.log('Medical:');
    console.log('  ✅ medical_history');
    console.log('');
    console.log('Terms & Consent:');
    console.log('  ✅ voice_recording_url');
    console.log('  ✅ signature_url');
    console.log('  ✅ terms_accepted_at');
    console.log('  ✅ terms_ip_address');
    console.log('  ✅ terms_user_agent');
    console.log('  ✅ marketing_consent');
    console.log('  ✅ marketing_consent_date');
    console.log('  ✅ email_consent');
    console.log('  ✅ sms_consent');
    console.log('  ✅ phone_consent');
    console.log('');
    console.log('Application Tracking:');
    console.log('  ✅ plan_id');
    console.log('  ✅ application_id');
    console.log('  ✅ application_number');
    console.log('  ✅ approved_at');
    console.log('  ✅ approved_by');
    console.log('  ✅ underwriting_status');
    console.log('  ✅ underwriting_notes');
    console.log('  ✅ risk_rating');
    console.log('  ✅ review_notes');
    console.log('');
    console.log('🎯 Members table now has ALL application fields!');
    console.log('');

  } catch (error) {
    console.error('❌ MIGRATION FAILED!');
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    process.exit(1);
  }
}

runMigration();

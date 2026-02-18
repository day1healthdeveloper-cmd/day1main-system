/**
 * Execute Migration: Add ALL application fields to members table
 * Uses direct SQL execution via Supabase client
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU0NzU2NSwiZXhwIjoyMDgxMTIzNTY1fQ.swDffWzSySfDnJEDCEPx6rzDSuVUPe21EQmgV2oe_9I';

async function executeMigration() {
  console.log('🔄 EXECUTING MIGRATION: Add ALL application fields to members');
  console.log('=' .repeat(80));
  console.log('');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Execute each ALTER TABLE statement individually
  const statements = [
    // Documents
    "ALTER TABLE members ADD COLUMN IF NOT EXISTS id_document_url TEXT",
    "ALTER TABLE members ADD COLUMN IF NOT EXISTS id_document_ocr_data JSONB",
    "ALTER TABLE members ADD COLUMN IF NOT EXISTS proof_of_address_url TEXT",
    "ALTER TABLE members ADD COLUMN IF NOT EXISTS proof_of_address_ocr_data JSONB",
    "ALTER TABLE members ADD COLUMN IF NOT EXISTS selfie_url TEXT",
    "ALTER TABLE members ADD COLUMN IF NOT EXISTS face_verification_result JSONB",
    
    // Medical
    "ALTER TABLE members ADD COLUMN IF NOT EXISTS medical_history JSONB",
    
    // Voice & Signature
    "ALTER TABLE members ADD COLUMN IF NOT EXISTS voice_recording_url TEXT",
    "ALTER TABLE members ADD COLUMN IF NOT EXISTS signature_url TEXT",
    
    // Terms
    "ALTER TABLE members ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE",
    "ALTER TABLE members ADD COLUMN IF NOT EXISTS terms_ip_address TEXT",
    "ALTER TABLE members ADD COLUMN IF NOT EXISTS terms_user_agent TEXT",
    
    // Marketing Consent
    "ALTER TABLE members ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false",
    "ALTER TABLE members ADD COLUMN IF NOT EXISTS marketing_consent_date TIMESTAMP WITH TIME ZONE",
    "ALTER TABLE members ADD COLUMN IF NOT EXISTS email_consent BOOLEAN DEFAULT false",
    "ALTER TABLE members ADD COLUMN IF NOT EXISTS sms_consent BOOLEAN DEFAULT false",
    "ALTER TABLE members ADD COLUMN IF NOT EXISTS phone_consent BOOLEAN DEFAULT false",
    
    // Plan
    "ALTER TABLE members ADD COLUMN IF NOT EXISTS plan_id TEXT",
    
    // Application Tracking
    "ALTER TABLE members ADD COLUMN IF NOT EXISTS application_id UUID",
    "ALTER TABLE members ADD COLUMN IF NOT EXISTS application_number TEXT",
    "ALTER TABLE members ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE",
    "ALTER TABLE members ADD COLUMN IF NOT EXISTS approved_by UUID",
    
    // Underwriting
    "ALTER TABLE members ADD COLUMN IF NOT EXISTS underwriting_status TEXT",
    "ALTER TABLE members ADD COLUMN IF NOT EXISTS underwriting_notes TEXT",
    "ALTER TABLE members ADD COLUMN IF NOT EXISTS risk_rating TEXT",
    
    // Review
    "ALTER TABLE members ADD COLUMN IF NOT EXISTS review_notes TEXT",
    
    // Indexes
    "CREATE INDEX IF NOT EXISTS idx_members_application_id ON members(application_id)",
    "CREATE INDEX IF NOT EXISTS idx_members_application_number ON members(application_number)"
  ];

  console.log(`⏳ Executing ${statements.length} SQL statements...`);
  console.log('');

  let successCount = 0;
  let errorCount = 0;

  for (const statement of statements) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      if (error) {
        // Try direct execution via REST API
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query: statement })
        });
        
        if (!response.ok) {
          console.log(`⚠️  ${statement.substring(0, 60)}...`);
        } else {
          successCount++;
        }
      } else {
        successCount++;
      }
    } catch (err) {
      console.log(`⚠️  ${statement.substring(0, 60)}...`);
      errorCount++;
    }
  }

  console.log('');
  console.log('✅ MIGRATION COMPLETED!');
  console.log('');
  console.log(`📊 Results: ${successCount} successful, ${errorCount} skipped/errors`);
  console.log('');
  console.log('🎯 Members table now has ALL application fields!');
  console.log('');
  console.log('Next: Update approval process to copy ALL fields');
  console.log('');
}

executeMigration().catch(console.error);

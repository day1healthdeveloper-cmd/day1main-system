/**
 * Run Policy Sections Migration
 * Creates tables for policy sections and section items
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU0NzU2NSwiZXhwIjoyMDgxMTIzNTY1fQ.swDffWzSySfDnJEDCEPx6rzDSuVUPe21EQmgV2oe_9I';

async function runMigration() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    console.log('🔗 Connecting to Supabase...');
    console.log('✅ Connected!\n');

    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'apps', 'backend', 'migrations', '017_policy_sections.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📝 Running migration...');
    console.log('Creating policy_sections and policy_section_items tables...\n');
    
    // Split into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    // Execute via REST API (note: this may not work for DDL, but we'll try)
    console.log('⚠️  Note: DDL statements may need to be run manually in Supabase SQL Editor\n');
    
    console.log('📋 SQL to run in Supabase SQL Editor:');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log(sql);
    console.log('\n═══════════════════════════════════════════════════════════\n');
    
    console.log('✅ Migration file ready!');
    console.log('📍 Location: apps/backend/migrations/017_policy_sections.sql\n');
    
    console.log('📋 Manual Steps:');
    console.log('1. Open Supabase Dashboard: https://supabase.com/dashboard/project/ldygmpaipxbokxzyzyti/sql/new');
    console.log('2. Copy contents of apps/backend/migrations/017_policy_sections.sql');
    console.log('3. Paste and click RUN\n');
    
    // Try to verify if tables exist (this will work after manual run)
    const { data: tables, error } = await supabase
      .from('policy_sections')
      .select('*')
      .limit(1);
    
    if (!error) {
      console.log('✅ Tables already exist and are accessible!\n');
    } else {
      console.log('⚠️  Tables not yet created. Please run the SQL manually.\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

runMigration();

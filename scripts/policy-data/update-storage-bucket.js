/**
 * Update Supabase Storage Bucket Settings
 * Removes MIME type restrictions to allow all file types
 */

const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU0NzU2NSwiZXhwIjoyMDgxMTIzNTY1fQ.swDffWzSySfDnJEDCEPx6rzDSuVUPe21EQmgV2oe_9I';

async function updateBucket() {
  console.log('🔧 UPDATING STORAGE BUCKET SETTINGS');
  console.log('=' .repeat(80));
  console.log('');

  try {
    // Update bucket to allow all MIME types
    const response = await fetch(`${SUPABASE_URL}/storage/v1/bucket/applications`, {
      method: 'PUT',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        public: true,
        file_size_limit: 52428800, // 50MB
        allowed_mime_types: null // Allow all MIME types
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.log('❌ Failed to update bucket:', error);
      console.log('');
      console.log('📝 Manual fix:');
      console.log('   1. Go to Supabase Dashboard → Storage → applications');
      console.log('   2. Click bucket settings (gear icon)');
      console.log('   3. Remove MIME type restrictions');
      console.log('   4. Save changes');
      console.log('');
      return;
    }

    const result = await response.json();
    console.log('✅ Bucket updated successfully!');
    console.log('');
    console.log('Settings:');
    console.log(`   Public: ${result.public}`);
    console.log(`   File size limit: ${result.file_size_limit} bytes (${Math.round(result.file_size_limit / 1024 / 1024)}MB)`);
    console.log(`   MIME types: ${result.allowed_mime_types || 'All types allowed'}`);
    console.log('');

    console.log('=' .repeat(80));
    console.log('✅ BUCKET READY FOR ALL FILE TYPES');
    console.log('=' .repeat(80));
    console.log('');

  } catch (error) {
    console.error('❌ Update failed!\n');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

updateBucket();

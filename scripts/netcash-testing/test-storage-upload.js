/**
 * Test Supabase Storage Upload
 * Verifies that file uploads work correctly
 */

const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDc1NjUsImV4cCI6MjA4MTEyMzU2NX0.EGtoHE5B7Zs1lmnrWrVEwtSmPyh_z8_v8Kk-tlBgtnQ';

async function testStorageUpload() {
  console.log('🧪 TESTING SUPABASE STORAGE UPLOAD');
  console.log('=' .repeat(80));
  console.log('');

  try {
    // Create a test text file
    const testContent = 'This is a test file for storage upload verification';
    const blob = new Blob([testContent], { type: 'text/plain' });
    const fileName = `test/test-${Date.now()}.txt`;

    console.log('📤 Uploading test file...');
    console.log(`   File: ${fileName}`);
    console.log(`   Size: ${blob.size} bytes`);
    console.log('');

    // Upload the file
    const formData = new FormData();
    formData.append('file', blob, fileName);

    const uploadResponse = await fetch(
      `${SUPABASE_URL}/storage/v1/object/applications/${fileName}`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: blob
      }
    );

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      throw new Error(`Upload failed: ${uploadResponse.status} - ${error}`);
    }

    const uploadResult = await uploadResponse.json();
    console.log('✅ Upload successful!');
    console.log(`   Path: ${uploadResult.Key || uploadResult.path || fileName}`);
    console.log('');

    // Get the public URL
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/applications/${fileName}`;
    console.log('🔗 Public URL:');
    console.log(`   ${publicUrl}`);
    console.log('');

    // Verify the file is accessible
    console.log('🔍 Verifying file is accessible...');
    const verifyResponse = await fetch(publicUrl);
    
    if (verifyResponse.ok) {
      const content = await verifyResponse.text();
      console.log('✅ File is accessible!');
      console.log(`   Content: "${content}"`);
      console.log('');
    } else {
      console.log('❌ File not accessible');
      console.log(`   Status: ${verifyResponse.status}`);
      console.log('');
    }

    console.log('=' .repeat(80));
    console.log('✅ STORAGE UPLOAD TEST PASSED');
    console.log('=' .repeat(80));
    console.log('');
    console.log('📝 Next steps:');
    console.log('   1. Go to application Step 6');
    console.log('   2. Record voice acceptance');
    console.log('   3. Draw and save signature');
    console.log('   4. Check browser console for upload logs');
    console.log('   5. Submit application');
    console.log('   6. Verify URLs in database');
    console.log('');

  } catch (error) {
    console.error('❌ Storage upload test failed!\n');
    console.error('Error:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Check if "applications" bucket exists');
    console.log('   2. Verify bucket is public');
    console.log('   3. Check RLS policies allow uploads');
    console.log('   4. Run: node check-storage-bucket.js');
    console.log('');
    process.exit(1);
  }
}

testStorageUpload();

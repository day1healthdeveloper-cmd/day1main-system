/**
 * Test Netcash File Generation
 * Generates a test debit order file from database
 * Run: node test-file-generation.js
 */

const { generateDebitOrderFile, validateMembers, saveFile, generateSummary } = require('./generate-debit-order-file');

const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDc1NjUsImV4cCI6MjA4MTEyMzU2NX0.EGtoHE5B7Zs1lmnrWrVEwtSmPyh_z8_v8Kk-tlBgtnQ';

async function testFileGeneration() {
  console.log('🧪 Testing Netcash File Generation\n');
  
  try {
    // Fetch test members from database
    console.log('📥 Fetching test members from database...');
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/members?debit_order_status=eq.active&select=member_number,first_name,last_name,bank_name,account_number,branch_code,account_holder_name,monthly_premium,email,mobile,broker_group,debit_order_day,netcash_account_reference&limit=10`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    const members = await response.json();
    
    if (!members || members.length === 0) {
      console.error('❌ No active members found');
      process.exit(1);
    }
    
    console.log(`✅ Found ${members.length} active members\n`);
    
    // Validate members
    console.log('🔍 Validating member data...');
    const validationErrors = validateMembers(members);
    
    if (validationErrors.length > 0) {
      console.log('⚠️  Validation errors found:\n');
      validationErrors.forEach(err => {
        console.log(`Member ${err.member_number} (index ${err.index}):`);
        err.errors.forEach(e => console.log(`  - ${e}`));
        console.log('');
      });
      
      console.log('❌ Fix validation errors before generating file\n');
      process.exit(1);
    }
    
    console.log('✅ All members validated successfully\n');
    
    // Generate file
    console.log('📝 Generating Netcash debit order file...');
    
    const options = {
      batchName: `TEST_BATCH_${new Date().toISOString().split('T')[0].replace(/-/g, '')}`,
      actionDate: '20260310', // March 10, 2026
      instruction: 'TwoDay'
    };
    
    const fileContent = generateDebitOrderFile(members, options);
    
    // Save file
    const filename = `${options.batchName}.txt`;
    const filepath = saveFile(fileContent, filename);
    
    console.log(`✅ File generated: ${filepath}\n`);
    
    // Generate summary
    const summary = generateSummary(members, options);
    
    console.log('📊 BATCH SUMMARY\n');
    console.log(`Batch Name: ${summary.batchName}`);
    console.log(`Action Date: ${summary.actionDate}`);
    console.log(`Instruction: ${summary.instruction}`);
    console.log(`Member Count: ${summary.memberCount}`);
    console.log(`Total Amount: R${summary.totalAmount}`);
    console.log(`Broker Groups: ${summary.brokerGroups.join(', ')}`);
    console.log(`Generated At: ${summary.generatedAt}\n`);
    
    // Display file preview
    console.log('📄 FILE PREVIEW (First 10 lines)\n');
    const lines = fileContent.split('\n');
    lines.slice(0, 10).forEach((line, i) => {
      console.log(`${String(i + 1).padStart(2, '0')}: ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`);
    });
    
    if (lines.length > 10) {
      console.log(`... (${lines.length - 10} more lines)`);
    }
    
    console.log('\n✅ Test file generation complete!\n');
    console.log('📋 Next Steps:');
    console.log('1. Review the generated file');
    console.log('2. Update NETCASH_SERVICE_KEY in environment variables');
    console.log('3. Contact Netcash to get your service key');
    console.log('4. Test upload via Netcash portal (manual)');
    console.log('5. Build API integration for automated uploads\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testFileGeneration();

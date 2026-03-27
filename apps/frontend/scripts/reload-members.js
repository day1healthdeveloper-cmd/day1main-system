require('dotenv').config({ path: '.env.local' });
const { execSync } = require('child_process');

console.log('🔄 RELOADING MEMBERS FROM member_feb_fixed.xlsx\n');
console.log('Step 1: Clearing existing data...\n');

try {
  // Clear existing data
  execSync('node scripts/clear-members.js', { stdio: 'inherit' });
  
  console.log('\n' + '='.repeat(80));
  console.log('Step 2: Importing new data...\n');
  
  // Import new data
  execSync('node scripts/import-members-with-dependants.js src/app/members/member_feb_fixed.xlsx 2', { stdio: 'inherit' });
  
  console.log('\n' + '='.repeat(80));
  console.log('Step 3: Verifying counts...\n');
  
  // Check counts
  execSync('node scripts/check-member-counts.js', { stdio: 'inherit' });
  
  console.log('\n✅ RELOAD COMPLETE!');
  
} catch (error) {
  console.error('\n❌ RELOAD FAILED:', error.message);
  process.exit(1);
}

/**
 * Netcash Debit Order File Generator
 * Generates Netcash-compliant debit order batch files
 * Run: node generate-debit-order-file.js
 */

const fs = require('fs');
const path = require('path');

// Configuration (will come from environment variables in production)
const CONFIG = {
  serviceKey: process.env.NETCASH_SERVICE_KEY || '657eb988-5345-45f7-a5e5-07a1a586155f',
  softwareVendorKey: '24ade73c-98cf-47b3-99be-cc7b867b3080', // Default Netcash key
  instruction: 'TwoDay', // 'Sameday', 'TwoDay', or 'Update'
};

/**
 * Generate Netcash debit order file
 * @param {Array} members - Array of member objects
 * @param {Object} options - Batch options
 * @returns {String} - File content
 */
function generateDebitOrderFile(members, options = {}) {
  const {
    batchName = `BATCH_${new Date().toISOString().split('T')[0]}`,
    actionDate = getNextDebitDate(),
    instruction = CONFIG.instruction,
  } = options;

  const lines = [];
  
  // 1. HEADER RECORD (H)
  const header = [
    'H',
    CONFIG.serviceKey,
    '1', // Version
    instruction,
    batchName,
    actionDate,
    CONFIG.softwareVendorKey
  ].join('');
  
  lines.push(header);
  
  // 2. KEY RECORD (K) - Defines which fields are included
  const keyRecord = [
    'K',
    '101', // Account reference
    '102', // Account name
    '103', // Account active
    '104', // Delete account
    '131', // Banking detail type
    '132', // Account holder name
    '133', // Account type
    '134', // Branch code
    '135', // Filler
    '136', // Account number
    '137', // Masked card (blank for bank accounts)
    '161', // Default amount
    '162', // Amount
    '201', // Email
    '202', // Mobile
    '281', // Group
    '301', // Extra 1 (broker_group)
    '302', // Extra 2 (member_number)
    '303', // Extra 3 (debit_order_day)
    '509'  // Resubmit unpaids
  ].join('');
  
  lines.push(keyRecord);
  
  // 3. TRANSACTION RECORDS (T) - One per member
  let totalAmount = 0;
  let transactionCount = 0;
  
  members.forEach(member => {
    // Convert premium to cents
    const amountInCents = Math.round(member.monthly_premium * 100);
    totalAmount += amountInCents;
    transactionCount++;
    
    // Account type: 1=savings, 2=cheque, 3=transmission
    const accountType = getAccountType(member.bank_name);
    
    // Format mobile number (remove spaces, dashes)
    const mobile = (member.mobile || '').replace(/[\s-]/g, '');
    
    const transaction = [
      'T',
      member.netcash_account_reference || `D1-${member.member_number}`, // 101 Account ref
      `${member.first_name} ${member.last_name}`.substring(0, 30), // 102 Account name
      '1', // 103 Active
      '0', // 104 Don't delete
      '1', // 131 Bank account (not credit card)
      member.account_holder_name || `${member.first_name} ${member.last_name}`, // 132 Holder name
      accountType, // 133 Account type
      member.branch_code, // 134 Branch code
      '0', // 135 Filler
      member.account_number, // 136 Account number
      '', // 137 Masked card (blank for bank)
      amountInCents, // 161 Default amount
      amountInCents, // 162 Amount
      member.email || '', // 201 Email
      mobile, // 202 Mobile
      member.broker_group || '', // 281 Group
      member.broker_group || '', // 301 Extra 1
      member.member_number || '', // 302 Extra 2
      member.debit_order_day || '', // 303 Extra 3
      '0' // 509 Resubmit unpaids (0=no, 1=yes)
    ].join(' ');
    
    lines.push(transaction);
  });
  
  // 4. FOOTER RECORD (F)
  const footer = [
    'F',
    transactionCount,
    totalAmount,
    '9999'
  ].join(' ');
  
  lines.push(footer);
  
  return lines.join('\n');
}

/**
 * Get account type based on bank name
 */
function getAccountType(bankName) {
  // Most SA banks use cheque accounts for debit orders
  // 1=savings, 2=cheque, 3=transmission
  const savingsKeywords = ['savings', 'save'];
  const lowerBank = (bankName || '').toLowerCase();
  
  if (savingsKeywords.some(kw => lowerBank.includes(kw))) {
    return '1'; // Savings
  }
  
  return '2'; // Cheque (default)
}

/**
 * Get next debit date (2 business days from now for TwoDay)
 */
function getNextDebitDate() {
  const date = new Date();
  let businessDays = 0;
  
  // Add 2 business days
  while (businessDays < 2) {
    date.setDate(date.getDate() + 1);
    const dayOfWeek = date.getDay();
    
    // Skip weekends (0=Sunday, 6=Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDays++;
    }
  }
  
  // Format as CCYYMMDD
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}${month}${day}`;
}

/**
 * Validate member data before generating file
 */
function validateMember(member) {
  const errors = [];
  
  if (!member.member_number) errors.push('Missing member_number');
  if (!member.first_name) errors.push('Missing first_name');
  if (!member.last_name) errors.push('Missing last_name');
  if (!member.bank_name) errors.push('Missing bank_name');
  if (!member.account_number) errors.push('Missing account_number');
  if (!member.branch_code) errors.push('Missing branch_code');
  if (!member.monthly_premium || member.monthly_premium <= 0) errors.push('Invalid monthly_premium');
  
  // Validate branch code (6 digits)
  if (member.branch_code && !/^\d{6}$/.test(member.branch_code)) {
    errors.push('Invalid branch_code format (must be 6 digits)');
  }
  
  // Validate account number (max 15 digits)
  if (member.account_number && member.account_number.length > 15) {
    errors.push('Account number too long (max 15 digits)');
  }
  
  return errors;
}

/**
 * Validate all members and return errors
 */
function validateMembers(members) {
  const allErrors = [];
  
  members.forEach((member, index) => {
    const errors = validateMember(member);
    if (errors.length > 0) {
      allErrors.push({
        index,
        member_number: member.member_number,
        errors
      });
    }
  });
  
  return allErrors;
}

/**
 * Save file to disk
 */
function saveFile(content, filename) {
  const outputDir = path.join(__dirname, 'output');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, content, 'utf8');
  
  return filepath;
}

/**
 * Generate summary report
 */
function generateSummary(members, options) {
  const totalAmount = members.reduce((sum, m) => sum + m.monthly_premium, 0);
  const brokerGroups = [...new Set(members.map(m => m.broker_group))];
  
  return {
    batchName: options.batchName,
    actionDate: options.actionDate,
    instruction: options.instruction,
    memberCount: members.length,
    totalAmount: totalAmount.toFixed(2),
    brokerGroups: brokerGroups.sort(),
    generatedAt: new Date().toISOString()
  };
}

// Export functions
module.exports = {
  generateDebitOrderFile,
  validateMembers,
  validateMember,
  saveFile,
  generateSummary,
  getNextDebitDate
};

// CLI usage
if (require.main === module) {
  console.log('🔧 Netcash Debit Order File Generator\n');
  console.log('This is a library module. Use it in your scripts.\n');
  console.log('Example usage:');
  console.log('```javascript');
  console.log('const { generateDebitOrderFile, saveFile } = require("./generate-debit-order-file");');
  console.log('');
  console.log('const members = [');
  console.log('  {');
  console.log('    member_number: "DAY1035164",');
  console.log('    first_name: "John",');
  console.log('    last_name: "Smith",');
  console.log('    bank_name: "Standard Bank",');
  console.log('    account_number: "123456789",');
  console.log('    branch_code: "051001",');
  console.log('    account_holder_name: "John Smith",');
  console.log('    monthly_premium: 565.00,');
  console.log('    email: "john@test.com",');
  console.log('    mobile: "0821234567",');
  console.log('    broker_group: "DAY1",');
  console.log('    debit_order_day: 2');
  console.log('  }');
  console.log('];');
  console.log('');
  console.log('const fileContent = generateDebitOrderFile(members, {');
  console.log('  batchName: "TEST_BATCH_2026_02",');
  console.log('  actionDate: "20260310",');
  console.log('  instruction: "TwoDay"');
  console.log('});');
  console.log('');
  console.log('saveFile(fileContent, "debit_order_batch.txt");');
  console.log('```');
}

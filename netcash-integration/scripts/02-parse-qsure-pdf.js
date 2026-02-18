/**
 * Parse Qsure DAY1 Statement PDF
 * Extracts member data from the detailed statement
 */

const fs = require('fs');
const path = require('path');

// We'll use pdf-parse library
const { PDFParse } = require('pdf-parse');

const PDF_PATH = path.join(__dirname, '../docs/QSURE DAY1 Statement (2026.01).pdf');
const OUTPUT_CSV = path.join(__dirname, '../data/day1-members-extracted.csv');

async function parsePDF() {
  console.log('📄 PARSING QSURE DAY1 STATEMENT PDF');
  console.log('=' .repeat(80));
  console.log('');

  try {
    // Check if PDF exists
    if (!fs.existsSync(PDF_PATH)) {
      console.error(`❌ PDF not found at: ${PDF_PATH}`);
      console.error('');
      console.error('Please ensure the PDF is named: "QSURE DAY1 Detailed Statement.pdf"');
      console.error('And placed in: netcash-integration/docs/');
      process.exit(1);
    }

    console.log(`📂 Reading PDF: ${PDF_PATH}`);
    console.log('');

    // Read PDF file
    const dataBuffer = fs.readFileSync(PDF_PATH);
    
    console.log('🔍 Parsing PDF content...');
    const parser = new PDFParse();
    const data = await parser.parse(dataBuffer);
    
    console.log(`✅ PDF parsed successfully!`);
    console.log(`   Pages: ${data.numpages}`);
    console.log(`   Text length: ${data.text.length} characters`);
    console.log('');

    // Extract text content
    const text = data.text;
    
    // Save raw text for inspection
    const rawTextPath = path.join(__dirname, '../data/day1-raw-text.txt');
    fs.writeFileSync(rawTextPath, text);
    console.log(`💾 Raw text saved to: ${rawTextPath}`);
    console.log('');

    // Parse member records
    console.log('🔍 Extracting member records...');
    const members = extractMembers(text);
    
    console.log(`✅ Found ${members.length} member records`);
    console.log('');

    if (members.length > 0) {
      // Show sample
      console.log('📊 Sample records (first 5):');
      console.log('');
      members.slice(0, 5).forEach((member, idx) => {
        console.log(`${idx + 1}. ${member.initials} ${member.surname}`);
        console.log(`   Policy: ${member.policy_reference}`);
        console.log(`   Amount: R ${member.amount}`);
        console.log(`   Debit Date: ${member.debit_date}`);
        console.log(`   Status: ${member.status}`);
        console.log('');
      });

      // Create data directory if it doesn't exist
      const dataDir = path.join(__dirname, '../data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Convert to CSV
      const csv = convertToCSV(members);
      fs.writeFileSync(OUTPUT_CSV, csv);
      
      console.log(`✅ CSV exported to: ${OUTPUT_CSV}`);
      console.log('');
      
      // Statistics
      const successCount = members.filter(m => m.status === 'success').length;
      const rejectedCount = members.filter(m => m.status === 'rejected').length;
      const totalAmount = members.reduce((sum, m) => sum + parseFloat(m.amount || 0), 0);
      
      console.log('📊 Statistics:');
      console.log(`   Total members: ${members.length}`);
      console.log(`   Successful: ${successCount} (${(successCount/members.length*100).toFixed(1)}%)`);
      console.log(`   Rejected: ${rejectedCount} (${(rejectedCount/members.length*100).toFixed(1)}%)`);
      console.log(`   Total amount: R ${totalAmount.toFixed(2)}`);
      console.log('');
      
      console.log('✅ PDF parsing complete!');
      console.log('');
      console.log('Next steps:');
      console.log('1. Review the CSV file');
      console.log('2. Run: node 03-import-day1-members.js');
      
    } else {
      console.log('⚠️  No member records found!');
      console.log('');
      console.log('Please check the raw text file and adjust the parsing logic.');
      console.log(`Raw text saved to: ${rawTextPath}`);
    }

  } catch (error) {
    console.error('❌ Failed to parse PDF!\n');
    console.error('Error:', error.message);
    console.error('');
    console.error('Troubleshooting:');
    console.error('1. Ensure pdf-parse is installed: npm install pdf-parse');
    console.error('2. Check PDF file is not corrupted');
    console.error('3. Check PDF file path is correct');
    process.exit(1);
  }
}

function extractMembers(text) {
  const members = [];
  
  // Split into lines
  const lines = text.split('\n');
  
  // Look for transaction patterns
  // Typical format might be:
  // Initials Surname | Policy Ref | Date | Amount | Status
  // Or table format with columns
  
  // This is a placeholder - we'll need to adjust based on actual PDF format
  // For now, let's try to find patterns
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines and headers
    if (!line || line.includes('Transaction') || line.includes('COLLECTIONS')) {
      continue;
    }
    
    // Try to match transaction lines
    // Pattern: might have initials, surname, policy number, amount
    // Example: "J.P. Smith PAR10001 1075.00 Success"
    
    // Look for lines with amounts (R xxx.xx or xxx.xx)
    const amountMatch = line.match(/R?\s*(\d{1,6}[,.]?\d{0,2})/);
    
    if (amountMatch) {
      // Try to extract components
      const parts = line.split(/\s+/);
      
      // This is a rough extraction - will need refinement
      const member = {
        initials: '',
        surname: '',
        policy_reference: '',
        amount: '',
        debit_date: '',
        status: 'success',
        raw_line: line
      };
      
      // Try to identify initials (usually 1-3 letters with dots)
      const initialsMatch = line.match(/\b([A-Z]\.?){1,3}\b/);
      if (initialsMatch) {
        member.initials = initialsMatch[0];
      }
      
      // Amount
      member.amount = amountMatch[1].replace(',', '');
      
      // Status (look for "Reject" or "Success")
      if (line.toLowerCase().includes('reject')) {
        member.status = 'rejected';
      }
      
      members.push(member);
    }
  }
  
  return members;
}

function convertToCSV(members) {
  const headers = ['initials', 'surname', 'policy_reference', 'amount', 'debit_date', 'status', 'raw_line'];
  const rows = [headers.join(',')];
  
  members.forEach(member => {
    const row = headers.map(header => {
      const value = member[header] || '';
      // Escape commas and quotes
      return `"${value.toString().replace(/"/g, '""')}"`;
    });
    rows.push(row.join(','));
  });
  
  return rows.join('\n');
}

// Run the parser
parsePDF();

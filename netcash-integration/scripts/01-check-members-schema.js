/**
 * Check Members Table Schema
 * Shows current structure before adding broker columns
 */

const SUPABASE_URL = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU0NzU2NSwiZXhwIjoyMDgxMTIzNTY1fQ.swDffWzSySfDnJEDCEPx6rzDSuVUPe21EQmgV2oe_9I';

async function checkSchema() {
  console.log('🔍 CHECKING MEMBERS TABLE SCHEMA');
  console.log('=' .repeat(80));
  console.log('');

  try {
    // Get table definition
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const schema = await response.json();
    
    if (schema.definitions && schema.definitions.members) {
      const membersSchema = schema.definitions.members;
      console.log('✅ Members table found!\n');
      
      const properties = membersSchema.properties || {};
      const columns = Object.keys(properties).sort();
      
      console.log(`Total columns: ${columns.length}\n`);
      
      // Check for broker-related columns
      const brokerColumns = columns.filter(col => 
        col.includes('broker') || 
        col.includes('debit') || 
        col.includes('payment') || 
        col.includes('premium')
      );
      
      if (brokerColumns.length > 0) {
        console.log('🔍 Broker-related columns found:');
        brokerColumns.forEach(col => console.log(`  ✅ ${col}`));
        console.log('');
      } else {
        console.log('⚠️  No broker-related columns found. Need to add:');
        console.log('  - broker_group');
        console.log('  - broker_id');
        console.log('  - debit_order_day');
        console.log('  - monthly_premium');
        console.log('  - payment_status');
        console.log('  - last_payment_date');
        console.log('  - last_payment_amount');
        console.log('');
      }
      
      // Show all columns
      console.log('All columns:');
      columns.forEach((col, idx) => {
        const prop = properties[col];
        console.log(`  ${idx + 1}. ${col} (${prop.type || 'unknown'})`);
      });
      console.log('');
      
      // Check if brokers table exists
      if (schema.definitions.brokers) {
        console.log('✅ Brokers table exists!');
      } else {
        console.log('⚠️  Brokers table does not exist. Need to create it.');
      }
      console.log('');
      
      // Check if payment_history table exists
      if (schema.definitions.payment_history) {
        console.log('✅ Payment history table exists!');
      } else {
        console.log('⚠️  Payment history table does not exist. Need to create it.');
      }
      console.log('');
      
    } else {
      console.log('❌ Members table not found in schema');
    }

  } catch (error) {
    console.error('❌ Failed to check schema!\n');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkSchema();

/**
 * Add Additional Policy Definitions
 * Adds the remaining legal/interpretation definitions
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU0NzU2NSwiZXhwIjoyMDgxMTIzNTY1fQ.swDffWzSySfDnJEDCEPx6rzDSuVUPe21EQmgV2oe_9I';

// Additional definitions
const additionalDefinitions = [
  { 
    term: 'Writing', 
    definition: 'means legible writing and in English and excludes any form of electronic communication contemplated in the Electronic Communications and Transactions Act, 25 of 2002', 
    category: 'legal' 
  },
  { 
    term: 'Singular and Plural', 
    definition: 'Any reference to the singular includes the plural and vice versa; and any reference to a gender includes the other gender', 
    category: 'legal' 
  },
  { 
    term: 'Clause Headings', 
    definition: 'The clause headings in this Policy have been inserted for convenience only and shall not be taken into account in its interpretation', 
    category: 'legal' 
  },
  { 
    term: 'Substantive Provisions in Definitions', 
    definition: 'If any provision in a definition is a substantive provision conferring rights or imposing obligations on any party, effect shall be given to it as if it were a substantive clause in the body of the Policy, notwithstanding that it is only contained in the interpretation clause', 
    category: 'legal' 
  },
  { 
    term: 'Governing Law', 
    definition: 'This Policy shall be governed by, construed and interpreted in accordance with the law of the Republic of South Africa', 
    category: 'legal' 
  },
];

async function addDefinitions() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    console.log('🔗 Connecting to Supabase...');
    console.log('✅ Connected!\n');

    // Get Executive Hospital Plan product ID
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('name', 'Executive Hospital Plan')
      .limit(1);
    
    if (productError || !products || products.length === 0) {
      throw new Error('Executive Hospital Plan product not found');
    }
    
    const productId = products[0].id;
    console.log(`📦 Product ID: ${productId}\n`);

    // Get current max display_order
    const { data: existing } = await supabase
      .from('policy_definitions')
      .select('display_order')
      .eq('product_id', productId)
      .order('display_order', { ascending: false })
      .limit(1);

    const startOrder = existing && existing.length > 0 ? existing[0].display_order + 1 : 1;
    console.log(`📝 Starting from display order: ${startOrder}\n`);

    // Insert additional definitions
    console.log(`Adding ${additionalDefinitions.length} additional definitions...\n`);
    
    const definitionsToInsert = additionalDefinitions.map((def, index) => ({
      product_id: productId,
      term: def.term,
      definition: def.definition,
      category: def.category,
      display_order: startOrder + index,
    }));

    const { data, error } = await supabase
      .from('policy_definitions')
      .insert(definitionsToInsert)
      .select();

    if (error) {
      throw new Error(`Insert failed: ${error.message}`);
    }

    additionalDefinitions.forEach((def, index) => {
      console.log(`  ${startOrder + index}. ${def.term} (${def.category})`);
    });

    console.log(`\n✅ Successfully added ${additionalDefinitions.length} definitions!\n`);

    // Get total count
    const { data: allDefs } = await supabase
      .from('policy_definitions')
      .select('*')
      .eq('product_id', productId);
    
    console.log(`📊 Total definitions now: ${allDefs.length}\n`);

    // Show breakdown by category
    const categories = {};
    allDefs.forEach(def => {
      categories[def.category] = (categories[def.category] || 0) + 1;
    });
    
    console.log('📋 Breakdown by category:');
    Object.keys(categories).sort().forEach(cat => {
      console.log(`  ${cat}: ${categories[cat]}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addDefinitions();

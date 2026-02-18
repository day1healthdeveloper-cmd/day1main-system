/**
 * Add Additional Insuring Section Details
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU0NzU2NSwiZXhwIjoyMDgxMTIzNTY1fQ.swDffWzSySfDnJEDCEPx6rzDSuVUPe21EQmgV2oe_9I';

const additionalItems = [
  {
    title: 'Temporary Total Disability - Effective Date',
    content: 'The Insurance Cover afforded any Insured Person for Temporary Total Disability will only come into effect 3 (three) calendar months after the Inception Date of the Policy',
  },
  {
    title: 'Temporary Total Disability - Coverage Terms',
    content: 'If during the period of the Policy any Insured Person, within the Territorial Limits, sustains an Illness which first manifests itself after 3 (three) calendar months from the Inception Date stated in the Policy Schedule which directly and independently of all other causes results within fourteen days of the onset of such Illness, as defined, in Hospitalisation, the Insurer agrees to pay the Service Provider directly the Compensation stated in the Insuring Section',
  },
  {
    title: 'Temporary Total Disability - Cessation',
    content: 'The Compensation specified for Temporary Total Disability shall cease as soon as the Insured Person has been discharged from Hospital',
  },
  {
    title: 'Illness Top-Up Benefit - Purpose',
    content: 'The Illness Top-Up Benefit is payable in instances where the daily stated benefits are insufficient to cover the Hospital costs related to the Hospital Admission, due to an illness and is payable by the Insurer directly to the Service Provider',
  },
  {
    title: 'Illness Top-Up Benefit - Limits',
    content: 'The Illness Top-Up Benefit is payable per annum up to a maximum of R25,000.00 per individual with an overall limit of 2 incidents per family per annum. The Illness Top-Up Benefit has a 3 (three) month waiting period and is subject to pre-authorisation (by Insurers)',
  },
  {
    title: 'Critical Illness - Diagnosis Requirements',
    content: 'If during the Period of Insurance any Insured Person, within the Territorial Limits, be diagnosed as suffering from a Critical Illness, symptoms of which were not present in the Insured Person in the 12 (twelve) months prior to the inception of the Policy Schedule and which symptoms first manifested itself after 3 (three) calendar months from the Inception Date stated in the Policy Schedule, the Insurer agrees to pay the Service Provider directly the Compensation stated in the Insuring Section',
  },
  {
    title: 'Critical Illness - Payment Terms',
    content: 'Upon discharge from the Hospital and after the Insured Person has survived for a period of 30 (thirty) days, from the date of diagnosis, the amount of Compensation specified in the Schedule is payable',
  },
  {
    title: 'Critical Illness - Benefit Limitation',
    content: 'In the event that the amount paid reaches R50,000 no further benefit shall be payable in respect of any Critical Illness of any Insured person for a period of 12 (twelve) months from the date that the Insured Person was diagnosed of such Critical Illness for which benefit has been paid to the Service Provider, unless the Insured Person has undergone a full medical examination (at their own expense), at the Inception Date of the Policy, for the maximum benefit of R250,000 to be agreed upon by Insurers',
  },
  {
    title: 'Critical Illness - Termination Upon Full Payment',
    content: 'It is declared that upon payment of 100% of the Compensation for any one claim under Critical Illness in respect of any Insured Person, all cover provided shall be terminated and cannot be reinstated in respect of the Critical Illness Benefit that has been paid for that Insured Person',
  },
  {
    title: 'Critical Illness - Non-Addition to TTD',
    content: 'Compensation under Critical Illness shall not be in addition to Temporary Total Disability Illness in Hospital',
  },
  {
    title: 'Critical Illness - Effective Date',
    content: 'Insurance Cover afforded any Insured person in terms of the Critical Illness will only come into effect 3 (three) calendar months after the Inception Date stated in the Policy Schedule',
  },
  {
    title: 'Accident Stated Benefit - Limits',
    content: 'For an Accident, the compensation shall be limited to an amount of R250,000 per Insured Person per Accident and R500,000 per Family per Accident and payable by the Insurer directly to the Service Provider',
  },
  {
    title: 'Accident Stated Benefit - Physiotherapy',
    content: 'Physiotherapy, as a result of an Accident, is limited to 7 (seven) sessions per event',
  },
  {
    title: 'Accidental Permanent Total Disability - Coverage',
    content: 'If during the period of the Policy the Principal Member only, within the Territorial Limits, sustains Bodily Injury which directly and independently of all other causes results within 12 (twelve) months of the Accident, in Permanent Total Disability as specified in the circumstances set out in the Insuring Section to this Policy, the Insurer agrees to pay to the Principal Member only the Compensation stated in the Insuring Section',
  },
  {
    title: 'Accidental PTD - Speech Loss',
    content: 'Permanent and total loss of or use of Speech: 100%',
  },
  {
    title: 'Accidental PTD - Hearing Loss',
    content: 'Permanent and total loss of or use of Hearing in both ears: 100%',
  },
  {
    title: 'Accidental PTD - Limb Loss',
    content: 'Permanent and total loss of or use of Any limb by physical separation at or above wrist or ankle of one or more limbs: 100%',
  },
  {
    title: 'Accidental PTD - Eye Loss',
    content: 'Permanent and total loss of or use of One or both eyes: 100%',
  },
  {
    title: 'Accidental PTD - Maximum Payment',
    content: 'In the event of Compensation being due under more than one of the benefits referred to above as a consequence of any one Accident to the Principal Member, the maximum amount payable shall not exceed 100% (one hundred percent) in total under Accidental Permanent Total Disability Benefits',
  },
  {
    title: 'Accidental PTD - Compensation Limit',
    content: 'For Accidental Permanent Total Disability, the compensation shall be limited to an amount of R250,000',
  },
];

async function addInsuringDetails() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    console.log('🔗 Connecting to Supabase...');
    console.log('✅ Connected!\n');

    const { data: products } = await supabase
      .from('products')
      .select('id')
      .eq('name', 'Executive Hospital Plan')
      .limit(1);
    
    if (!products || products.length === 0) {
      throw new Error('Product not found');
    }
    
    const productId = products[0].id;
    console.log(`📦 Product ID: ${productId}\n`);

    // Get current max display_order
    const { data: existingItems } = await supabase
      .from('policy_section_items')
      .select('display_order')
      .eq('product_id', productId)
      .eq('section_type', 'insuring-section')
      .order('display_order', { ascending: false })
      .limit(1);

    const startOrder = existingItems && existingItems.length > 0 ? existingItems[0].display_order + 1 : 1;

    console.log(`📝 Adding ${additionalItems.length} additional items starting at order ${startOrder}...\n`);
    
    const itemsToInsert = additionalItems.map((item, index) => ({
      product_id: productId,
      section_type: 'insuring-section',
      title: item.title,
      content: item.content,
      display_order: startOrder + index,
    }));

    await supabase
      .from('policy_section_items')
      .insert(itemsToInsert);

    additionalItems.forEach((item, index) => {
      console.log(`  ${startOrder + index}. ${item.title}`);
    });

    console.log(`\n✅ Successfully added ${additionalItems.length} items!\n`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addInsuringDetails();

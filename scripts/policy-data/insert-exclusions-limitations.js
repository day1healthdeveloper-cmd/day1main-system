/**
 * Insert General Exclusions and Limitations Section
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU0NzU2NSwiZXhwIjoyMDgxMTIzNTY1fQ.swDffWzSySfDnJEDCEPx6rzDSuVUPe21EQmgV2oe_9I';

const exclusionItems = [
  {
    title: 'Suicide and Self-Injury',
    content: 'Caused by suicide, or self-injury or intentional exposure to obvious risk of Injury (unless in an attempt to save human life)',
  },
  {
    title: 'Pre-Existing Conditions',
    content: 'Caused by a Pre-Existing Condition (including pregnancy) (unless otherwise provided for herein)',
  },
  {
    title: 'Age Limitation',
    content: 'Over 70 years of age (unless otherwise provided herein)',
  },
  {
    title: 'Alcohol, Drugs or Narcotics',
    content: 'Caused by or as a result of the influence of alcohol, drugs or narcotics upon such Insured Person unless administered by or prescribed by and taken in accordance with the instructions of a member of the medical profession (other than himself)',
  },
  {
    title: 'Atomic Energy and Nuclear',
    content: 'Caused by or arising from exposure to or contamination by atomic energy and/or nuclear fission or reaction',
  },
  {
    title: 'Air Travel',
    content: 'Whilst travelling by air other than as a passenger and not as a member of the crew nor for the purpose of any trade or technical operation thereon or therein',
  },
  {
    title: 'Civil Disturbances and War',
    content: 'Whilst participating in any labour disturbances, riot, strike, lock-out or civil commotion or public disorder or active involvement in war, acts of terrorism, invasion, act of foreign enemy, hostilities (whether war be declared or not), civil war, rebellion, revolution, insurrection or political risk of any kind',
  },
  {
    title: 'Professional Sport',
    content: 'Whilst participating in a Professional Sport',
  },
  {
    title: 'Mental Illness',
    content: 'For any mental illness, mental disability, mental impairment and psychopathic disorders, all forms of depression, major affective disorders, psychotic and neurotic disorders, as well as stress and anxiety related disorders and/or nervous disorders, other than those caused by Accident as defined in this Insurance',
  },
  {
    title: 'Armed Forces Employment',
    content: 'Who is in employment or service in the permanent force of the South African National Defence Force, South African Police Service or any other armed forces',
  },
  {
    title: 'Extreme Sports',
    content: 'For any claims for mountaineering or rock climbing necessitating the use of ropes or guides, potholing, hang gliding, sky diving, riding or driving in a race or rally, quad biking, off-road motorcycling, kick-boxing or other body contact sports, underwater activities involving the use of artificial breathing apparatus unless the Insured Person has an open water diving certificate or is diving with a qualified instructor to a depth no greater than 30 metres and/or similar activities, unless agreed by Insurer',
  },
  {
    title: 'Unlawful Acts',
    content: 'For any claim arising whilst the Insured Person is perpetrating an intentional unlawful act in terms of South African Law',
  },
  {
    title: 'Gradually Operating Causes',
    content: 'Caused by any gradually operating cause of which the Insured Person is aware',
  },
  {
    title: 'Pregnancy and Childbirth',
    content: 'For pregnancy or childbirth unless the mother has been insured under this policy for more than 3 (three) months for unknown conditions or 12 (twelve) months for pre-existing conditions nor for any congenital abnormalities',
  },
  {
    title: 'Ongoing Medical Treatments',
    content: 'For claims in respect of expenses arising out of regular medical treatments on an ongoing basis',
  },
  {
    title: 'Elective Procedures',
    content: 'For obesity, elective, elective cosmetic or plastic, corrective optical and laser surgery or treatment and costs resulting therefrom',
  },
  {
    title: 'Birth Control and Infertility',
    content: 'For treatment, directly or indirectly arising from, or connected with male and female birth control, infertility and any form of assisted reproduction',
  },
  {
    title: 'Known Newborn Conditions',
    content: 'For any new-born children where the Illness or Critical Illness was known by the Principal Insured Person prior to the birth of that Dependant Child',
  },
  {
    title: 'Premature Childbirth',
    content: 'In respect of premature childbirth unless the expected date of birth is later than 3 (three) months after inception of insurance for unknown conditions and 12 (twelve) months for pre-existing conditions, including complications that may arise during pregnancy, within the waiting period',
  },
  {
    title: 'Reasonable Precautions',
    content: 'The Insured Persons shall take all reasonable precautions to prevent Accidents, including Domestic Violence and to comply with all statutory requirements and regulations',
  },
  {
    title: 'Aggravated Conditions',
    content: 'If the consequences of an Accident shall be aggravated by any condition or physical disability of the Insured Person which existed before the Accident occurred, the amount of any compensation payable under this Insurance in respect of the consequences of the Accident shall be the amount which it is reasonably considered would have been payable if such consequences had not been so aggravated',
  },
  {
    title: 'Other Health Insurance',
    content: 'If at the time of any Insured Event giving rise to a Medical Expenses claim under this Policy, a Health Insurance and/or Medical Aid Scheme policy exists with any other Insurer and/or Medical Aid Scheme authorising and covering the Insured Person against the defined events, the Insurer will require the payment certificate from the Health Insurance and/or Medical Aid Scheme policy of the payments made in respect of such Insured Event whereafter any financial shortfalls that are not covered by the other Insurer and/or Medical Aid Scheme will be assessed and, where applicable, paid directly to the Service Provider by the Insurer',
  },
  {
    title: 'Waiting Period Consultations',
    content: 'Whereby medical advice, treatment, diagnosis or consultation has taken place within the waiting period as specified in the Policy. The waiting periods apply to the Illness Stated Benefit, Maternity Benefit, Critical Illness Benefit and Funeral Benefit',
  },
  {
    title: 'Neglect of Medical Care',
    content: 'Whereby the Insured Person unreasonably or wilfully neglects or fails to seek and remain under the care of a medical practitioner',
  },
  {
    title: 'Refusal of Treatment',
    content: 'Whereby the Insured Person refuses medical treatment recommended by a physician or medical practitioner',
  },
  {
    title: 'Pain Investigation and Treatment',
    content: 'Resulting from, whilst in Hospital for the investigation of pain and pain related conditions and treatment in this context, which includes bed rest, traction, physiotherapy, spinal blocks, medication or intravenous medication',
  },
  {
    title: 'Work-Related Injuries',
    content: 'For any bodily injury whilst performing duties that are related to the Insured Persons place of work',
  },
  {
    title: 'Disease, Epidemic or Pandemic',
    content: 'Disease, epidemic or pandemic',
  },
];

async function insertExclusionsLimitations() {
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

    // Add section
    await supabase
      .from('policy_sections')
      .upsert({
        product_id: productId,
        section_type: 'exclusions-limitations',
        content: 'The Insurer shall not be liable to pay Compensation for Bodily Injury, Illness, Maternity or Critical Illness in respect of any Insured Person:',
        display_order: 4,
      }, {
        onConflict: 'product_id,section_type'
      });

    console.log('✅ Section added\n');

    // Clear existing
    await supabase
      .from('policy_section_items')
      .delete()
      .eq('product_id', productId)
      .eq('section_type', 'exclusions-limitations');

    // Insert items
    console.log(`📝 Inserting ${exclusionItems.length} exclusion items...\n`);
    
    const itemsToInsert = exclusionItems.map((item, index) => ({
      product_id: productId,
      section_type: 'exclusions-limitations',
      title: item.title,
      content: item.content,
      display_order: index + 1,
    }));

    await supabase
      .from('policy_section_items')
      .insert(itemsToInsert);

    exclusionItems.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.title}`);
    });

    console.log(`\n✅ Successfully inserted ${exclusionItems.length} items!\n`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

insertExclusionsLimitations();

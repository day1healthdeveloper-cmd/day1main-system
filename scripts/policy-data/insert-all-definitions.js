/**
 * Insert All Policy Definitions
 * Parses and inserts all 38 definitions from the policy document
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU0NzU2NSwiZXhwIjoyMDgxMTIzNTY1fQ.swDffWzSySfDnJEDCEPx6rzDSuVUPe21EQmgV2oe_9I';

// All definitions with proper categorization
const definitions = [
  { term: 'Accident or Accidental', definition: 'means a sudden unforeseen, unexpected, unusual, specific event, which is unintended, arises from a source external to the Insured, is independent of illness, disease or other bodily malfunction, which occurs at an identifiable time and place during the period of the Policy', category: 'general' },
  { term: 'Accidental Permanent Total Disability', definition: 'means Permanent and total loss of or use of: Speech (100%), Hearing in both ears (100%), Any limb by physical separation at or above wrist or ankle (100%), One or both eyes (100%), Sight in one or both eyes (100%)', category: 'medical' },
  { term: 'Admission', definition: 'means admission into a Hospital as an Inpatient, for a period of at least 24 (twenty-four) hours, on the advice or and under the professional care and attendance of a qualified physician', category: 'medical' },
  { term: 'AFRICA ASSIST', definition: 'means the emergency medical response unit available to the Insured Persons for emergency medical assistance', category: 'general' },
  { term: 'Application Form', definition: 'The form that the Principal Insured completes and nominates the Dependants (where applicable) to be insured under this Policy', category: 'general' },
  { term: 'ASISA', definition: 'means the Association for Savings and Investments South Africa', category: 'general' },
  { term: 'Beneficiary', definition: 'The person/s as nominated by the Principal Insured, to receive the Funeral Benefit, subject to the terms and conditions set out in this Policy and in the Policy Schedule', category: 'legal' },
  { term: 'Benefit', definition: 'means the Benefit set out in the Policy Schedule, provided by the Insurer in terms of this Policy', category: 'financial' },
  { term: 'Bodily Injury', definition: 'means Bodily Injury by violent external and visible means caused by an Accident, but shall include Bodily Injury caused by starvation, thirst and exposure to the elements as a result of a Road Accident', category: 'medical' },
  { term: 'Casualty Illness', definition: 'means in the event an Insured Person requires medical attention for an illness, condition or sickness (non-accident related) and is immediately admitted as an inpatient, into hospital, from the casualty unit for 24 (twenty-four) hours or longer', category: 'medical' },
  { term: 'Commencement Date', definition: 'means the date specified in the Policy Schedule', category: 'general' },
  { term: 'Compensation', definition: 'means the amount payable directly to the Service Provider, Principal Member or the Insured Person\'s estate, depending on the type of benefit claimed', category: 'financial' },
  { term: 'Critical Illness', definition: 'means any of the following: Heart Attack (as defined in ASISA SCIDEP), Chronic Coronary Heart Disease (Open bypass surgery or surgical treatment, excludes angioplasty), Stroke (as defined in ASISA SCIDEP), Cancer (as defined in ASISA SCIDEP), Kidney Failure (end stage renal failure requiring regular dialysis), Major Organ Transplant (human to human transplant of Kidney, Heart, Lung, Liver, Pancreas or Bone Marrow), Paraplegia (total and irreversible loss of use of both legs or both arms), Blindness (total and irrecoverable sudden loss of vision in both eyes)', category: 'medical' },
  { term: 'Day', definition: 'means 24 (twenty-four) consecutive hours from time of Admission into Hospital to the time of Discharge from Hospital (as stated on the Hospital account)', category: 'general' },
  { term: 'Day Procedure', definition: 'A surgical procedure and/or Hospital Admission that is considered to be less than 24 (twenty-four) hours in Hospital by a qualified physician', category: 'medical' },
  { term: 'Dependant Child(ren)', definition: 'means: (a) a child of a Principal Member under the age of 21 years, including stepchild, illegitimate child or legally adopted child; (b) a stillborn child born after 28th week of pregnancy or posthumous child; (c) a child permanently mentally or physically disabled and totally dependent; (d) a child under 26 years who is a full time student at registered university, Technicon or tertiary education institution, and who is unmarried', category: 'legal' },
  { term: 'Emergency', definition: 'The sudden and, at the time, unexpected onset of a health condition, due to an Accident-related incident, that requires immediate medical or surgical treatment', category: 'medical' },
  { term: 'Family', definition: 'means the Principal Member (being a natural person) in whose name this policy is effected and includes the Principal Member\'s Spouse and Dependant Children under the age of 21 years which form part of the Principal Member\'s household and who are resident in the Republic of South Africa', category: 'legal' },
  { term: 'Hospital', definition: 'means an establishment which: holds a licence as a hospital or day clinic or nursing home; operates primarily for the reception, care and treatment of sick, ailing or injured persons as inpatients; provides organised facilities for diagnosis and surgical treatment; is not primarily a rest or convalescent home or similar establishment and is not, other than incidentally, a place for alcoholics or drug addicts', category: 'medical' },
  { term: 'Illness', definition: 'means the onset of any acute somatic, unforeseeable, unpredictable Illness (excluding mental Illness) which requires admission to Hospital, for no less than 24 hours, and which was not a Pre-Existing Condition. A recurrence of any Illness will only be considered a separate Illness if 6 months have elapsed from the date of onset of the preceding Illness', category: 'medical' },
  { term: 'Inception Date', definition: 'means the date specified in the Policy Schedule', category: 'general' },
  { term: 'Injury', definition: 'A sudden and unexpected bodily injury necessitating Primary Health Benefits, Emergency Benefits and/or Hospital Confinement Benefits', category: 'medical' },
  { term: 'Insured Persons', definition: 'means the Principal Member as named on the Policy Schedule and their named Spouse and Dependant Children and Domestic Employee (where applicable)', category: 'legal' },
  { term: 'Insurer', definition: 'means African Unity Life Limited, Registration Number 2003/016142/06, a licensed life insurer in terms of the Long-Term Insurance Act of 1998 and an authorised financial services provider (FSP 8447) in terms of the Financial Advisory and Intermediary Services Act of 2002, having its registered address at 3 Herholdt Street, Stellenbosch, 7600', category: 'legal' },
  { term: 'Insuring Section', definition: 'means the benefit payable directly to the Service Provider, Principal Member or the Insured Person\'s estate, depending on the type of benefit claimed', category: 'financial' },
  { term: 'Policy Schedule', definition: 'means the Long-Term insurance policy schedule issued to the Principal Member in terms of section 48 of the Long-Term Insurance Act', category: 'legal' },
  { term: 'Pre-Authorisation Services', definition: 'a telephonic call-centre service in terms of which the Insurer or its subcontractor assists with the pre-authorisation for treatment of a Member in terms of this Policy', category: 'general' },
  { term: 'Pre-Existing Condition', definition: 'means any Bodily Injury, Illness, Maternity or Critical Illness for which the Insured Person received medical advice, treatment, or whereby diagnosis or consultation has been provided in the 12 (twelve) months prior to the Inception Date stated in the Policy Schedule', category: 'medical' },
  { term: 'Premium', definition: 'means the premium payable to the Insurer on a monthly basis in terms of this Policy in order to secure the Benefits', category: 'financial' },
  { term: 'Principal Member', definition: 'means the person who applies for Insurance Cover under this Policy', category: 'legal' },
  { term: 'Professional Sport', definition: 'means a sporting activity in which an Insured Person engages and from which such Insured Person derives the majority of their monthly income', category: 'general' },
  { term: 'SCIDEP', definition: 'means the ASISA Standardised Critical Illness Definitions Project', category: 'general' },
  { term: 'Sports Injury', definition: 'means injuries as a result from acute trauma or repetitive stress associated with athletic activities. Sports injuries can affect bones or soft tissue such as ligaments, muscles and tendons', category: 'medical' },
  { term: 'Spouse', definition: 'means the named Spouse of a Principal Member. Not more than one Spouse shall be covered in respect of each Principal Member', category: 'legal' },
  { term: 'Temporary Total Disability', definition: 'means the Insured Person being admitted to Hospital as an inpatient for no less than 24 (twenty-four) hours, from time of Hospital Admission to time of Hospital Discharge (as stated on the Hospital account)', category: 'medical' },
  { term: 'Territorial Limits', definition: 'means the Republic of South Africa, Namibia, Lesotho, Botswana, Swaziland, Zimbabwe and Mozambique', category: 'general' },
  { term: 'the / this Policy', definition: 'means this insurance agreement concluded between the Insurer and the Principal Member in respect of the Benefits underwritten by the Insurer', category: 'legal' },
];

async function insertDefinitions() {
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

    // Delete existing definitions for this product
    console.log('🗑️  Clearing existing definitions...');
    await supabase
      .from('policy_definitions')
      .delete()
      .eq('product_id', productId);
    console.log('✅ Cleared\n');

    // Insert all definitions
    console.log(`📝 Inserting ${definitions.length} definitions...\n`);
    
    const definitionsToInsert = definitions.map((def, index) => ({
      product_id: productId,
      term: def.term,
      definition: def.definition,
      category: def.category,
      display_order: index + 1,
    }));

    const { data, error } = await supabase
      .from('policy_definitions')
      .insert(definitionsToInsert)
      .select();

    if (error) {
      throw new Error(`Insert failed: ${error.message}`);
    }

    definitions.forEach((def, index) => {
      console.log(`  ${index + 1}. ${def.term} (${def.category})`);
    });

    console.log(`\n✅ Successfully inserted ${definitions.length} definitions!\n`);

    // Verify
    const { data: countData, error: countError } = await supabase
      .from('policy_definitions')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId);
    
    console.log(`� Total definitions in database: ${data.length}\n`);

    // Show breakdown by category
    const categories = {};
    definitions.forEach(def => {
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

insertDefinitions();

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const definitions = [
  {
    term: 'Accident or Accidental',
    definition: 'means a sudden unforeseen, unexpected, unusual, specific event, which is unintended, arises from a source external to the Insured, is independent of illness, disease or other bodily malfunction, which occurs at an identifiable time and place during the period of the Policy;'
  },
  {
    term: 'Accidental Permanent Total Disability',
    definition: 'means Permanent and total loss of or use of: Speech 100%, Hearing in both ears 100%, Any limb 100% by physical separation at or above wrist or ankle of one or more limbs, One or both eyes 100% sight in one or both eyes.'
  },
  {
    term: 'Admission',
    definition: 'means admission into a Hospital as an Inpatient, for a period of at least 24 (twenty-four) hours, on the advice or and under the professional care and attendance of a qualified physician;'
  },
  {
    term: 'AFRICA ASSIST',
    definition: 'means the emergency medical response unit available to the Insured Persons for emergency medical assistance;'
  },
  {
    term: 'Application Form',
    definition: 'The form that the Principal Insured completes and nominates the Dependants (where applicable) to be insured under this Policy.'
  },
  {
    term: 'ASISA',
    definition: 'means the Association for Savings and Investments South Africa;'
  },
  {
    term: 'Beneficiary',
    definition: 'The person/s as nominated by the Principal Insured, to receive the Funeral Benefit, subject to the terms and conditions set out in this Policy and in the Policy Schedule.'
  },
  {
    term: 'Benefit',
    definition: 'means the Benefit set out in the Policy Schedule, provided by the Insurer in terms of this Policy;'
  },
  {
    term: 'Bodily Injury',
    definition: 'means Bodily Injury by violent external and visible means caused by an Accident, but shall include Bodily Injury caused by starvation, thirst and exposure to the elements as a result of a Road Accident;'
  },
  {
    term: 'Casualty Illness',
    definition: 'means in the event an Insured Person requires medical attention for an illness, condition or sickness (non accident related) and is immediately admitted as an inpatient, into hospital, from the casualty unit for 24 (twenty-four) hours or longer.'
  },
  {
    term: 'Commencement Date',
    definition: 'means the date specified in the Policy Schedule;'
  },
  {
    term: 'Compensation',
    definition: 'means the amount payable directly to the Service Provider, Principal Member or the Insured Person\'s estate, depending on the type of benefit claimed in terms of clause 7 and/or 8 hereof;'
  },
  {
    term: 'Critical Illness',
    definition: 'means any of the following: Heart Attack (as defined in ASISA SCIDEP), Chronic Coronary Heart Disease (Open bypass surgery or surgical treatment of Coronary disease, excludes angioplasty), Stroke (as defined in ASISA SCIDEP), Cancer (as defined in ASISA SCIDEP), Kidney Failure (end stage renal failure requiring regular renal dialysis), Major Organ Transplant (human to human transplant of Kidney, Heart, Lung, Liver, Pancreas or Bone Marrow), Paraplegia (total and irreversible loss of use of both legs or both arms), Blindness (total and irrecoverable sudden loss of vision in both eyes);'
  },
  {
    term: 'Day',
    definition: 'means 24 (twenty-four) consecutive hours from time of Admission into Hospital to the time of Discharge from Hospital (as stated on the Hospital account);'
  },
  {
    term: 'Day Procedure',
    definition: 'A surgical procedure and/or Hospital Admission that is considered to be less than 24 (twenty-four) hours in Hospital by a qualified physician;'
  },
  {
    term: 'Dependant Child(ren)',
    definition: 'means: a child of a Principal Member under the age of 21 (twenty one) years, including a stepchild, an illegitimate child or legally adopted child; a stillborn child born after the 28th week of pregnancy or posthumous child; a child being permanently mentally or physically disabled and totally dependent upon the Principal Member; a child under the age of 26 years who is a full-time student at any registered university, Technikon or tertiary education institution, and who is unmarried;'
  },
  {
    term: 'Emergency',
    definition: 'The sudden and, at the time, unexpected onset of a health condition, due to an Accident-related incident, that requires immediate medical or surgical treatment;'
  },
  {
    term: 'Family',
    definition: 'means the Principal Member (being a natural person) in whose name this policy is effected and includes the Principal Member\'s Spouse and Dependant Children under the age of 21 (twenty-one) years which form part of the Principal Member\'s household and who are resident in the Republic of South Africa;'
  },
  {
    term: 'Hospital',
    definition: 'means an establishment which: holds a licence as a hospital or day clinic or nursing home; operates primarily for the reception, care and treatment of sick, ailing or injured persons as inpatients; provides organised facilities for diagnosis and surgical treatment; is not primarily a rest or convalescent home or similar establishment and is not, other than incidentally, a place for alcoholics or drug addicts;'
  },
  {
    term: 'Illness',
    definition: 'means the onset of any acute somatic, unforeseeable, unpredictable Illness (excluding mental Illness) which requires Admission to Hospital, for no less than 24 (twenty-four) hours, and which was not a Pre-Existing Condition (unless otherwise provided for herein). A recurrence of any Illness will only be considered a separate Illness if 6 (six) months have elapsed from the date of onset of the preceding Illness'
  },
  {
    term: 'Inception Date',
    definition: 'means the date specified in the Policy Schedule'
  },
  {
    term: 'Injury',
    definition: 'A sudden and unexpected bodily injury necessitating Primary Health Benefits, Emergency Benefits and/or Hospital Confinement Benefits;'
  },
  {
    term: 'Insured Persons',
    definition: 'means the Principal Member as named on the Policy Schedule and their named Spouse and Dependant Children and Domestic Employee (where applicable);'
  },
  {
    term: 'Insurer',
    definition: 'means African Unity Life Limited, registration number 2003/016142/06, a licensed life insurer in terms of the Long-Term Insurance Act of 1998 and an authorised financial services provider(FSP 8447) in terms of the Financial Advisory and Intermediary Services Act of 2002, having its registered address at 3 Herholdt Street, Stellenbosch, 7600.'
  },
  {
    term: 'Insuring Section',
    definition: 'means the benefit payable directly to the Service Provider, Principal Member or the Insured Person\'s estate, depending on the type of benefit claimed in terms of clause 7 and/or 8 hereof;'
  },
  {
    term: 'Policy Schedule',
    definition: 'means the Long-Term insurance policy schedule issued to the Principal Member in terms of section 48 of the Long-Term Insurance Act;'
  },
  {
    term: 'Pre-Authorisation Services',
    definition: 'a telephonic call-centre service in terms of which the Insurer or its subcontractor assists with the pre authorisation for treatment of a Member in terms of this Policy;'
  },
  {
    term: 'Pre-Existing Condition',
    definition: 'means any Bodily Injury, Illness, Maternity or Critical Illness for which the Insured Person received medical advice, treatment, or whereby diagnosis or consultation has been provided in the 12 (twelve) months prior to the Inception Date stated in the Policy Schedule (unless otherwise provided for herein);'
  },
  {
    term: 'Premium',
    definition: 'means the premium payable to the Insurer on a monthly basis in terms of this Policy in order to secure the Benefits;'
  },
  {
    term: 'Principal Member',
    definition: 'means the person who applies for Insurance Cover under this Policy;'
  },
  {
    term: 'Professional Sport',
    definition: 'means a sporting activity in which an Insured Person engages and from which such Insured Person derives the majority of their monthly income;'
  },
  {
    term: 'SCIDEP',
    definition: 'means the ASISA Standardised Critical Illness Definitions Project;'
  },
  {
    term: 'Sports Injury',
    definition: 'means injuries as a result from acute trauma or repetitive stress associated with athletic activities. Sports injuries can affect bones or soft tissue such as ligaments, muscles and tendons;'
  },
  {
    term: 'Spouse',
    definition: 'means the named Spouse of a Principal Member. Not more than one Spouse shall be covered in respect of each Principal Member;'
  },
  {
    term: 'Temporary Total Disability',
    definition: 'means the Insured Person being admitted to Hospital as an inpatient for no less than 24 (twenty-four) hours, from time of Hospital Admission to time of Hospital Discharge (as stated on the Hospital account);'
  },
  {
    term: 'Territorial Limits',
    definition: 'means the Republic of South Africa, Namibia, Lesotho, Botswana, Swaziland, Zimbabwe and Mozambique;'
  },
  {
    term: 'the / this Policy',
    definition: 'means this insurance agreement concluded between the Insurer and the Principal Member in respect of the Benefits underwritten by the Insurer'
  },
  {
    term: 'Waiting Period',
    definition: 'means the period subsequent to the Inception Date of the Policy, in which no Benefits will be paid'
  }
];

async function addDefinitionsToAllPlans() {
  console.log('🔍 Adding definitions to all plans...\n');

  // Get all products
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name')
    .eq('status', 'published')
    .order('name');

  if (productsError) {
    console.error('❌ Error fetching products:', productsError);
    return;
  }

  if (!products || products.length === 0) {
    console.log('❌ No products found');
    return;
  }

  console.log(`📦 Found ${products.length} products\n`);

  let totalInserted = 0;

  for (const product of products) {
    console.log(`\n📝 Processing: ${product.name}`);
    
    // Check if definitions already exist
    const { data: existing } = await supabase
      .from('policy_section_items')
      .select('id')
      .eq('product_id', product.id)
      .eq('section_type', 'definitions');

    if (existing && existing.length > 0) {
      console.log(`   ⚠️  Already has ${existing.length} definitions - skipping`);
      continue;
    }

    // Insert definitions for this product
    const itemsToInsert = definitions.map((def, index) => ({
      product_id: product.id,
      section_type: 'definitions',
      title: def.term,
      content: def.definition,
      display_order: index + 1
    }));

    const { data: inserted, error: insertError } = await supabase
      .from('policy_section_items')
      .insert(itemsToInsert)
      .select();

    if (insertError) {
      console.error(`   ❌ Error inserting definitions:`, insertError);
      continue;
    }

    console.log(`   ✅ Inserted ${inserted.length} definitions`);
    totalInserted += inserted.length;
  }

  console.log(`\n\n✨ Complete! Added ${totalInserted} total definition items across all plans`);
  console.log(`📊 Average: ${Math.round(totalInserted / products.length)} definitions per plan`);
}

addDefinitionsToAllPlans().catch(console.error);

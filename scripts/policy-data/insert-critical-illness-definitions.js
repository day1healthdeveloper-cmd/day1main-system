/**
 * Insert Critical Illness Definitions Section
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ldygmpaipxbokxzyzyti.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU0NzU2NSwiZXhwIjoyMDgxMTIzNTY1fQ.swDffWzSySfDnJEDCEPx6rzDSuVUPe21EQmgV2oe_9I';

const criticalIllnessItems = [
  {
    title: 'Background - Policy Integration',
    content: 'The Policy together with this Annexure 1 constitutes an indivisible agreement between the parties',
  },
  {
    title: 'Background - Definitions Consistency',
    content: 'All words and expressions defined in the Policy shall have a similar meaning in this Annexure 1 unless expressly stipulated otherwise or inconsistent with, or otherwise indicated by the context',
  },
  {
    title: 'SCIDEP Definitions',
    content: 'For purposes of this Policy, the Critical Illness shall bear the meanings as assigned to it in the Policy or this Annexure 1, whichever applicable, which definitions are prescribed in terms of the SCIDEP definitions',
  },
  {
    title: 'Layman\'s Definition Note',
    content: 'For the sake of convenience, a layman\'s definition is included herein due to the complexity of the medical definitions of Critical Illness',
  },
  {
    title: 'Cancer - Definition',
    content: 'Cancer is an uncontrolled growth that spreads into the normal tissue surrounding the organ where the cancer originates. The diagnosis must be supported by tests where a pathologist confirms the presence of cancer using a microscope',
  },
  {
    title: 'Cancer - Exclusion Rationale',
    content: 'Some cancers have been specifically excluded because the long-term outcome is good and the effect on quality of life is minimal; and treatment is neither expensive nor extensive',
  },
  {
    title: 'Cancer - Exclusion: Non-Invasive Cells',
    content: 'Cancerous cells that have not invaded the surrounding or underlying tissue',
  },
  {
    title: 'Cancer - Exclusion: Early Stage Cancers',
    content: 'Early cancer of the prostate gland, testicular and breast',
  },
  {
    title: 'Cancer - Exclusion: Skin Cancers',
    content: 'All cancers of the skin except cancerous moles that have invaded underlying tissue',
  },
  {
    title: 'Cancer Staging - General Rule',
    content: 'As a general rule there are four stages of cancer. Stage 1 cancer is defined by an invasive cancer confined to the tissue or organ of origin. Stage 2 cancer is defined by the involvement of adjacent structures or organs. Stage 3 cancer involves spreading to regional lymph nodes. Stage 4 cancer is characterized by distant metastasis',
  },
  {
    title: 'Cancer Staging - AJCC Standards',
    content: 'Each type of cancer is staged specifically by the American Joint Committee for Cancer (AJCC). This staging is based on the outcome of the specific cancer and does not always follow the general rule as stated above',
  },
  {
    title: 'Heart Attack - Severity Levels',
    content: 'Four levels of severity of heart attacks are defined: Level D is the mildest and Level A the most severe',
  },
  {
    title: 'Heart Attack - Levels C and D Recovery',
    content: 'In both Levels C and D, the patient recovers fully, and the heart function returns to normal',
  },
  {
    title: 'Heart Attack - Levels A and B Damage',
    content: 'In Levels A and B, more permanent damage has resulted, which means the heart function is less than 100% after recovery',
  },
  {
    title: 'Heart Attack - Measurement Timing',
    content: 'The effect of the heart attack on heart function should be measured 6 weeks after the heart attack',
  },
  {
    title: 'Heart Attack Level A - Severe Impairment',
    content: 'Heart attacks where a significant proportion of the heart muscle was damaged. The same tests are used to measure the damage as under Level B but the results would show a more serious level of impaired function. This person will have difficulty coping with normal activities of daily living, and will most likely not be able to work',
  },
  {
    title: 'Heart Attack Level B - Mild Permanent Impairment',
    content: 'This is usually a heart attack that does not recover 100% of normal function. The degree of permanent damage can be measured by a heart sonar, an exercise tolerance test or a measurement of physical abilities. These measurements should be performed 6 weeks after the heart attack. A person with this level of heart damage should still be able to manage normal daily activities and even his/her occupation, if the occupation does not involve strenuous physical work. However, this person\'s insurability will be adversely affected, and the future risk for a repeat cardiac event is high. Significant life-style adaptation and risk factor modification are indicated',
  },
  {
    title: 'Heart Attack Level C - Moderate Severity',
    content: 'In this case damage to the heart muscle is more than in Level D. In some cases, a cardiologist will intervene early and reverse the potential damage. This intervention may include administration of drugs to dissolve the blood clot in the coronary artery(ies), balloon stretching of the coronary artery, with or without a stent. Because the clinical methods of diagnosing this level of heart attack are unambiguous, only two of the three criteria are required',
  },
  {
    title: 'Heart Attack Level C - Criteria: Chest Pain',
    content: 'Typical chest pain or other symptoms typically associated with a heart attack',
  },
  {
    title: 'Heart Attack Level C - Criteria: ECG Changes',
    content: 'Certain defined ECG changes. At this level the changes are more marked and more specific to a heart attack',
  },
  {
    title: 'Heart Attack Level C - Criteria: Blood Tests',
    content: 'Elevated blood test results greater than required for Level D',
  },
  {
    title: 'Heart Attack Level D - Mild with Full Recovery',
    content: 'This is a heart attack where the ECG changes and blood test results are mildly abnormal. Therefore, all three criteria are required: Typical chest pain or other symptoms associated with a heart attack; and certain defined ECG changes; and an elevation in certain blood test results',
  },
  {
    title: 'Stroke - Definition',
    content: 'A stroke occurs when the blood supply to a portion of the brain is obstructed and this part of the brain tissue dies. It can also happen when there is bleeding into the brain tissue due to a weakening or abnormality of the blood vessel wall. A common cause of the rupture of a brain blood vessel is longstanding uncontrolled high blood pressure',
  },
  {
    title: 'Stroke - Effects',
    content: 'The result of a stroke is usually paralysis of an arm and leg, sometimes with one half of the face affected as well. In some cases, people also lose their ability to speak. The paralysis can recover to varying degrees. Some recover fully, whereas others may retain permanent weakness of a limb(s)',
  },
  {
    title: 'Transient Ischaemic Attack (TIA) - Definition',
    content: 'A Transient Ischaemic Attack (TIA) occurs when the blood supply is momentarily interrupted but restored before any permanent damage can occur',
  },
  {
    title: 'TIA - Symptoms',
    content: 'It usually results in one or more of the following symptoms: A loss of sensation; Dizziness; Lameness of a limb; Loss of speech, which only occur for a few minutes to hours and recovery is quick and spontaneous',
  },
];

async function insertCriticalIllnessDefinitions() {
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
        section_type: 'critical-illness-definitions',
        content: 'Definitions of Heart Attack, Stroke and Cancer',
        display_order: 8,
      }, {
        onConflict: 'product_id,section_type'
      });

    console.log('✅ Section added\n');

    // Clear existing
    await supabase
      .from('policy_section_items')
      .delete()
      .eq('product_id', productId)
      .eq('section_type', 'critical-illness-definitions');

    // Insert items
    console.log(`📝 Inserting ${criticalIllnessItems.length} critical illness definition items...\n`);
    
    const itemsToInsert = criticalIllnessItems.map((item, index) => ({
      product_id: productId,
      section_type: 'critical-illness-definitions',
      title: item.title,
      content: item.content,
      display_order: index + 1,
    }));

    await supabase
      .from('policy_section_items')
      .insert(itemsToInsert);

    criticalIllnessItems.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.title}`);
    });

    console.log(`\n✅ Successfully inserted ${criticalIllnessItems.length} items!\n`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

insertCriticalIllnessDefinitions();

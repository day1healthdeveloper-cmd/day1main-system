/**
 * PMB (Prescribed Minimum Benefits) Constants
 * Based on South African Medical Schemes Act Regulations
 * 
 * PMBs are a set of defined benefits that all medical schemes must cover in full
 * without co-payments or annual limits.
 */

/**
 * PMB Condition Categories
 * As defined in Annexure A of the Medical Schemes Act
 */
export enum PMBCategory {
  // Emergency medical conditions
  EMERGENCY = 'emergency',
  
  // 270 Diagnosis-Treatment Pairs (DTPs)
  DTP = 'dtp',
  
  // 27 Chronic Disease List (CDL) conditions
  CHRONIC = 'chronic',
}

/**
 * 27 Chronic Disease List (CDL) Conditions
 * These must be covered in full by all medical schemes
 */
export const CHRONIC_DISEASE_LIST = [
  {
    code: 'CDL01',
    name: 'Addisons Disease',
    icd10_codes: ['E27.1', 'E27.2'],
  },
  {
    code: 'CDL02',
    name: 'Asthma',
    icd10_codes: ['J45', 'J45.0', 'J45.1', 'J45.8', 'J45.9'],
  },
  {
    code: 'CDL03',
    name: 'Bipolar Mood Disorder',
    icd10_codes: ['F31', 'F31.0', 'F31.1', 'F31.2', 'F31.3', 'F31.4', 'F31.5', 'F31.6', 'F31.7', 'F31.8', 'F31.9'],
  },
  {
    code: 'CDL04',
    name: 'Bronchiectasis',
    icd10_codes: ['J47'],
  },
  {
    code: 'CDL05',
    name: 'Cardiac Failure',
    icd10_codes: ['I50', 'I50.0', 'I50.1', 'I50.9'],
  },
  {
    code: 'CDL06',
    name: 'Cardiomyopathy',
    icd10_codes: ['I42', 'I42.0', 'I42.1', 'I42.2', 'I42.3', 'I42.4', 'I42.5', 'I42.6', 'I42.7', 'I42.8', 'I42.9'],
  },
  {
    code: 'CDL07',
    name: 'Chronic Obstructive Pulmonary Disease',
    icd10_codes: ['J44', 'J44.0', 'J44.1', 'J44.8', 'J44.9'],
  },
  {
    code: 'CDL08',
    name: 'Chronic Renal Disease',
    icd10_codes: ['N18', 'N18.0', 'N18.1', 'N18.2', 'N18.3', 'N18.4', 'N18.5', 'N18.8', 'N18.9'],
  },
  {
    code: 'CDL09',
    name: 'Coronary Artery Disease',
    icd10_codes: ['I20', 'I21', 'I22', 'I23', 'I24', 'I25'],
  },
  {
    code: 'CDL10',
    name: 'Crohns Disease',
    icd10_codes: ['K50', 'K50.0', 'K50.1', 'K50.8', 'K50.9'],
  },
  {
    code: 'CDL11',
    name: 'Diabetes Insipidus',
    icd10_codes: ['E23.2', 'N25.1'],
  },
  {
    code: 'CDL12',
    name: 'Diabetes Mellitus Type 1',
    icd10_codes: ['E10', 'E10.0', 'E10.1', 'E10.2', 'E10.3', 'E10.4', 'E10.5', 'E10.6', 'E10.7', 'E10.8', 'E10.9'],
  },
  {
    code: 'CDL13',
    name: 'Diabetes Mellitus Type 2',
    icd10_codes: ['E11', 'E11.0', 'E11.1', 'E11.2', 'E11.3', 'E11.4', 'E11.5', 'E11.6', 'E11.7', 'E11.8', 'E11.9'],
  },
  {
    code: 'CDL14',
    name: 'Dysrhythmia',
    icd10_codes: ['I47', 'I48', 'I49'],
  },
  {
    code: 'CDL15',
    name: 'Epilepsy',
    icd10_codes: ['G40', 'G40.0', 'G40.1', 'G40.2', 'G40.3', 'G40.4', 'G40.5', 'G40.6', 'G40.7', 'G40.8', 'G40.9'],
  },
  {
    code: 'CDL16',
    name: 'Glaucoma',
    icd10_codes: ['H40', 'H40.0', 'H40.1', 'H40.2', 'H40.3', 'H40.4', 'H40.5', 'H40.6', 'H40.8', 'H40.9'],
  },
  {
    code: 'CDL17',
    name: 'Haemophilia',
    icd10_codes: ['D66', 'D67', 'D68.0', 'D68.1', 'D68.2'],
  },
  {
    code: 'CDL18',
    name: 'HIV/AIDS',
    icd10_codes: ['B20', 'B21', 'B22', 'B23', 'B24', 'Z21'],
  },
  {
    code: 'CDL19',
    name: 'Hyperlipidaemia',
    icd10_codes: ['E78', 'E78.0', 'E78.1', 'E78.2', 'E78.3', 'E78.4', 'E78.5', 'E78.6', 'E78.8', 'E78.9'],
  },
  {
    code: 'CDL20',
    name: 'Hypertension',
    icd10_codes: ['I10', 'I11', 'I12', 'I13', 'I15'],
  },
  {
    code: 'CDL21',
    name: 'Hypothyroidism',
    icd10_codes: ['E03', 'E03.0', 'E03.1', 'E03.2', 'E03.3', 'E03.4', 'E03.5', 'E03.8', 'E03.9'],
  },
  {
    code: 'CDL22',
    name: 'Multiple Sclerosis',
    icd10_codes: ['G35'],
  },
  {
    code: 'CDL23',
    name: 'Parkinsons Disease',
    icd10_codes: ['G20'],
  },
  {
    code: 'CDL24',
    name: 'Rheumatoid Arthritis',
    icd10_codes: ['M05', 'M06'],
  },
  {
    code: 'CDL25',
    name: 'Schizophrenia',
    icd10_codes: ['F20', 'F20.0', 'F20.1', 'F20.2', 'F20.3', 'F20.4', 'F20.5', 'F20.6', 'F20.8', 'F20.9'],
  },
  {
    code: 'CDL26',
    name: 'Systemic Lupus Erythematosus',
    icd10_codes: ['M32', 'M32.0', 'M32.1', 'M32.8', 'M32.9'],
  },
  {
    code: 'CDL27',
    name: 'Ulcerative Colitis',
    icd10_codes: ['K51', 'K51.0', 'K51.1', 'K51.2', 'K51.3', 'K51.4', 'K51.5', 'K51.8', 'K51.9'],
  },
]

/**
 * Sample Diagnosis-Treatment Pairs (DTPs)
 * In production, this would be a comprehensive list of 270+ DTPs
 */
export const DIAGNOSIS_TREATMENT_PAIRS = [
  {
    dtp_code: 'DTP001',
    diagnosis_icd10: 'I21',
    diagnosis_name: 'Acute Myocardial Infarction',
    treatment_codes: ['36415', '36416'], // Procedure codes
    treatment_name: 'Coronary angioplasty',
    must_pay_minimum: true,
  },
  {
    dtp_code: 'DTP002',
    diagnosis_icd10: 'C50',
    diagnosis_name: 'Malignant neoplasm of breast',
    treatment_codes: ['19120', '19125', '19126'],
    treatment_name: 'Mastectomy',
    must_pay_minimum: true,
  },
  {
    dtp_code: 'DTP003',
    diagnosis_icd10: 'O80',
    diagnosis_name: 'Normal delivery',
    treatment_codes: ['59400', '59409', '59410'],
    treatment_name: 'Vaginal delivery',
    must_pay_minimum: true,
  },
  {
    dtp_code: 'DTP004',
    diagnosis_icd10: 'O82',
    diagnosis_name: 'Delivery by caesarean section',
    treatment_codes: ['59510', '59514', '59515'],
    treatment_name: 'Caesarean section',
    must_pay_minimum: true,
  },
  {
    dtp_code: 'DTP005',
    diagnosis_icd10: 'S72',
    diagnosis_name: 'Fracture of femur',
    treatment_codes: ['27244', '27245', '27246'],
    treatment_name: 'Femur fracture repair',
    must_pay_minimum: true,
  },
]

/**
 * Emergency conditions that qualify as PMBs
 */
export const EMERGENCY_CONDITIONS = [
  'Sudden loss of consciousness',
  'Severe bleeding',
  'Severe chest pain',
  'Severe shortness of breath',
  'Severe allergic reaction',
  'Severe burns',
  'Suspected stroke',
  'Suspected heart attack',
  'Major trauma',
  'Poisoning',
]

/**
 * PMB Coverage Rules
 */
export const PMB_COVERAGE_RULES = {
  // No co-payments allowed for PMB conditions
  co_payment_allowed: false,
  
  // No annual limits for PMB conditions
  annual_limit_applies: false,
  
  // Must be covered at cost (no network penalties)
  network_penalty_applies: false,
  
  // Pre-authorization may be required but cannot be used to deny valid PMB claims
  preauth_can_deny: false,
  
  // Waiting periods do not apply to emergency PMBs
  waiting_period_applies_to_emergency: false,
}

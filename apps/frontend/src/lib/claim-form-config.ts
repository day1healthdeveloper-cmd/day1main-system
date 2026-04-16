// Claim form configuration based on benefit type
// Maps benefit types to required fields and validation rules

export interface ClaimFormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'file' | 'textarea';
  required: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface ClaimFormConfig {
  benefitType: string;
  displayName: string;
  description: string;
  fields: ClaimFormField[];
  requiredDocuments: string[];
  preAuthRequired: boolean;
}

export const CLAIM_FORM_CONFIGS: Record<string, ClaimFormConfig> = {
  // GP / Doctor Visits
  doctor_visits: {
    benefitType: 'doctor_visits',
    displayName: 'GP Consultation',
    description: 'Claim for general practitioner consultation',
    fields: [
      {
        name: 'serviceDate',
        label: 'Date of Consultation',
        type: 'date',
        required: true,
        validation: {
          message: 'Service date must be within last 4 months'
        }
      },
      {
        name: 'diagnosisCode',
        label: 'Diagnosis Code (ICD-10)',
        type: 'text',
        required: true,
        validation: {
          pattern: '^[A-Z][0-9]{2}(\\.[0-9]{1,2})?$',
          message: 'Enter valid ICD-10 code (e.g., J00, A09.9)'
        }
      },
      {
        name: 'procedureCode',
        label: 'Procedure Code',
        type: 'text',
        required: true
      },
      {
        name: 'claimedAmount',
        label: 'Amount Claimed (R)',
        type: 'number',
        required: true,
        validation: {
          min: 0,
          message: 'Amount must be positive'
        }
      },
      {
        name: 'notes',
        label: 'Additional Notes',
        type: 'textarea',
        required: false
      }
    ],
    requiredDocuments: ['invoice', 'prescription'],
    preAuthRequired: false
  },

  // Specialist
  specialist: {
    benefitType: 'specialist',
    displayName: 'Specialist Consultation',
    description: 'Claim for specialist consultation',
    fields: [
      {
        name: 'serviceDate',
        label: 'Date of Consultation',
        type: 'date',
        required: true
      },
      {
        name: 'specialistType',
        label: 'Specialist Type',
        type: 'select',
        required: true,
        options: [
          { value: 'cardiologist', label: 'Cardiologist' },
          { value: 'dermatologist', label: 'Dermatologist' },
          { value: 'orthopedic', label: 'Orthopedic Surgeon' },
          { value: 'neurologist', label: 'Neurologist' },
          { value: 'gynecologist', label: 'Gynecologist' },
          { value: 'other', label: 'Other' }
        ]
      },
      {
        name: 'referralDoctor',
        label: 'Referring GP Name',
        type: 'text',
        required: true
      },
      {
        name: 'diagnosisCode',
        label: 'Diagnosis Code (ICD-10)',
        type: 'text',
        required: true
      },
      {
        name: 'procedureCode',
        label: 'Procedure Code',
        type: 'text',
        required: true
      },
      {
        name: 'claimedAmount',
        label: 'Amount Claimed (R)',
        type: 'number',
        required: true
      }
    ],
    requiredDocuments: ['invoice', 'referral_letter', 'clinical_notes'],
    preAuthRequired: false
  },

  // Dentistry
  dentistry: {
    benefitType: 'dentistry',
    displayName: 'Dental Treatment',
    description: 'Claim for dental treatment',
    fields: [
      {
        name: 'serviceDate',
        label: 'Date of Treatment',
        type: 'date',
        required: true
      },
      {
        name: 'treatmentType',
        label: 'Treatment Type',
        type: 'select',
        required: true,
        options: [
          { value: 'cleaning', label: 'Cleaning' },
          { value: 'filling', label: 'Filling' },
          { value: 'extraction', label: 'Extraction' },
          { value: 'root_canal', label: 'Root Canal' },
          { value: 'crown', label: 'Crown' },
          { value: 'emergency', label: 'Emergency Treatment' }
        ]
      },
      {
        name: 'toothNumber',
        label: 'Tooth Number(s)',
        type: 'text',
        required: false
      },
      {
        name: 'procedureCode',
        label: 'Procedure Code',
        type: 'text',
        required: true
      },
      {
        name: 'claimedAmount',
        label: 'Amount Claimed (R)',
        type: 'number',
        required: true
      }
    ],
    requiredDocuments: ['invoice', 'treatment_plan'],
    preAuthRequired: false
  },

  // Optometry
  optometry: {
    benefitType: 'optometry',
    displayName: 'Optical / Optometry',
    description: 'Claim for optical services',
    fields: [
      {
        name: 'serviceDate',
        label: 'Date of Service',
        type: 'date',
        required: true
      },
      {
        name: 'serviceType',
        label: 'Service Type',
        type: 'select',
        required: true,
        options: [
          { value: 'eye_test', label: 'Eye Test' },
          { value: 'glasses', label: 'Prescription Glasses' },
          { value: 'contact_lenses', label: 'Contact Lenses' },
          { value: 'frames', label: 'Frames Only' }
        ]
      },
      {
        name: 'prescription',
        label: 'Prescription Details',
        type: 'textarea',
        required: false
      },
      {
        name: 'claimedAmount',
        label: 'Amount Claimed (R)',
        type: 'number',
        required: true
      }
    ],
    requiredDocuments: ['invoice', 'prescription'],
    preAuthRequired: false
  },

  // Pathology
  pathology: {
    benefitType: 'pathology',
    displayName: 'Pathology Tests',
    description: 'Claim for pathology/blood tests',
    fields: [
      {
        name: 'serviceDate',
        label: 'Date of Test',
        type: 'date',
        required: true
      },
      {
        name: 'testType',
        label: 'Test Type',
        type: 'text',
        required: true
      },
      {
        name: 'referringDoctor',
        label: 'Referring Doctor',
        type: 'text',
        required: true
      },
      {
        name: 'procedureCode',
        label: 'Procedure Code',
        type: 'text',
        required: true
      },
      {
        name: 'claimedAmount',
        label: 'Amount Claimed (R)',
        type: 'number',
        required: true
      }
    ],
    requiredDocuments: ['invoice', 'referral', 'test_results'],
    preAuthRequired: false
  },

  // Radiology
  radiology: {
    benefitType: 'radiology',
    displayName: 'Radiology / Imaging',
    description: 'Claim for X-rays, scans, and imaging',
    fields: [
      {
        name: 'serviceDate',
        label: 'Date of Imaging',
        type: 'date',
        required: true
      },
      {
        name: 'imagingType',
        label: 'Imaging Type',
        type: 'select',
        required: true,
        options: [
          { value: 'xray', label: 'X-Ray' },
          { value: 'ultrasound', label: 'Ultrasound' },
          { value: 'ct_scan', label: 'CT Scan' },
          { value: 'mri', label: 'MRI' },
          { value: 'mammogram', label: 'Mammogram' }
        ]
      },
      {
        name: 'bodyPart',
        label: 'Body Part',
        type: 'text',
        required: true
      },
      {
        name: 'referringDoctor',
        label: 'Referring Doctor',
        type: 'text',
        required: true
      },
      {
        name: 'procedureCode',
        label: 'Procedure Code',
        type: 'text',
        required: true
      },
      {
        name: 'claimedAmount',
        label: 'Amount Claimed (R)',
        type: 'number',
        required: true
      }
    ],
    requiredDocuments: ['invoice', 'referral', 'imaging_report'],
    preAuthRequired: false
  },

  // Medication
  medication: {
    benefitType: 'medication',
    displayName: 'Acute Medication',
    description: 'Claim for acute medication',
    fields: [
      {
        name: 'serviceDate',
        label: 'Date of Purchase',
        type: 'date',
        required: true
      },
      {
        name: 'pharmacyName',
        label: 'Pharmacy Name',
        type: 'text',
        required: true
      },
      {
        name: 'medicationName',
        label: 'Medication Name',
        type: 'text',
        required: true
      },
      {
        name: 'prescribingDoctor',
        label: 'Prescribing Doctor',
        type: 'text',
        required: true
      },
      {
        name: 'claimedAmount',
        label: 'Amount Claimed (R)',
        type: 'number',
        required: true
      }
    ],
    requiredDocuments: ['invoice', 'prescription'],
    preAuthRequired: false
  },

  // Chronic Medication
  chronic_medication: {
    benefitType: 'chronic_medication',
    displayName: 'Chronic Medication',
    description: 'Claim for chronic medication',
    fields: [
      {
        name: 'serviceDate',
        label: 'Date of Purchase',
        type: 'date',
        required: true
      },
      {
        name: 'pharmacyName',
        label: 'Pharmacy Name',
        type: 'text',
        required: true
      },
      {
        name: 'medicationName',
        label: 'Medication Name',
        type: 'text',
        required: true
      },
      {
        name: 'chronicCondition',
        label: 'Chronic Condition',
        type: 'text',
        required: true
      },
      {
        name: 'prescribingDoctor',
        label: 'Prescribing Doctor',
        type: 'text',
        required: true
      },
      {
        name: 'claimedAmount',
        label: 'Amount Claimed (R)',
        type: 'number',
        required: true
      }
    ],
    requiredDocuments: ['invoice', 'prescription', 'chronic_script'],
    preAuthRequired: false
  },

  // Hospital
  hospital: {
    benefitType: 'hospital',
    displayName: 'Hospital Admission',
    description: 'Claim for hospital admission',
    fields: [
      {
        name: 'admissionDate',
        label: 'Admission Date',
        type: 'date',
        required: true
      },
      {
        name: 'dischargeDate',
        label: 'Discharge Date',
        type: 'date',
        required: true
      },
      {
        name: 'hospitalName',
        label: 'Hospital Name',
        type: 'text',
        required: true
      },
      {
        name: 'admissionType',
        label: 'Admission Type',
        type: 'select',
        required: true,
        options: [
          { value: 'emergency', label: 'Emergency' },
          { value: 'planned', label: 'Planned Surgery' },
          { value: 'maternity', label: 'Maternity' }
        ]
      },
      {
        name: 'diagnosisCode',
        label: 'Primary Diagnosis (ICD-10)',
        type: 'text',
        required: true
      },
      {
        name: 'procedureCode',
        label: 'Procedure Code',
        type: 'text',
        required: true
      },
      {
        name: 'attendingDoctor',
        label: 'Attending Doctor',
        type: 'text',
        required: true
      },
      {
        name: 'claimedAmount',
        label: 'Total Amount Claimed (R)',
        type: 'number',
        required: true
      },
      {
        name: 'preAuthNumber',
        label: 'Pre-Authorization Number',
        type: 'text',
        required: true
      }
    ],
    requiredDocuments: ['hospital_invoice', 'discharge_summary', 'pre_auth_approval', 'clinical_notes'],
    preAuthRequired: true
  },

  // Maternity
  maternity: {
    benefitType: 'maternity',
    displayName: 'Maternity',
    description: 'Claim for maternity services',
    fields: [
      {
        name: 'serviceDate',
        label: 'Date of Service',
        type: 'date',
        required: true
      },
      {
        name: 'serviceType',
        label: 'Service Type',
        type: 'select',
        required: true,
        options: [
          { value: 'antenatal', label: 'Antenatal Care' },
          { value: 'delivery', label: 'Delivery' },
          { value: 'postnatal', label: 'Postnatal Care' },
          { value: 'caesarean', label: 'Caesarean Section' }
        ]
      },
      {
        name: 'hospitalName',
        label: 'Hospital/Clinic Name',
        type: 'text',
        required: true
      },
      {
        name: 'attendingDoctor',
        label: 'Attending Doctor/Midwife',
        type: 'text',
        required: true
      },
      {
        name: 'claimedAmount',
        label: 'Amount Claimed (R)',
        type: 'number',
        required: true
      },
      {
        name: 'preAuthNumber',
        label: 'Pre-Authorization Number',
        type: 'text',
        required: false
      }
    ],
    requiredDocuments: ['invoice', 'clinical_notes', 'birth_certificate'],
    preAuthRequired: true
  }
};

// Helper function to get claim form config
export function getClaimFormConfig(benefitType: string): ClaimFormConfig | null {
  return CLAIM_FORM_CONFIGS[benefitType] || null;
}

// Helper function to get all available claim types
export function getAllClaimTypes(): ClaimFormConfig[] {
  return Object.values(CLAIM_FORM_CONFIGS);
}

// Map claim_type to benefit_type
export function mapClaimTypeToBenefitType(claimType: string): string {
  const mapping: Record<string, string> = {
    'Consultation': 'doctor_visits',
    'Specialist Consultation': 'specialist',
    'Dental': 'dentistry',
    'Optical': 'optometry',
    'Pathology': 'pathology',
    'Radiology': 'radiology',
    'Pharmacy': 'medication',
    'Chronic Medication': 'chronic_medication',
    'Hospitalization': 'hospital',
    'Hospital Admission': 'hospital',
    'Maternity': 'maternity'
  };
  
  return mapping[claimType] || 'other';
}

# Developer Quick Reference - 6-Step Application

## Quick Start

### Running the Application
```bash
cd apps/frontend
npm run dev
```
Application runs on: `http://localhost:3001`

### File Locations
```
apps/frontend/src/
├── app/apply/page.tsx                          # Main application page
├── components/apply-steps/
│   ├── Step1Personal.tsx                       # Step 1: Personal Info
│   ├── Step2Documents.tsx                      # Step 2: Documents
│   ├── Step5Dependents.tsx                     # Step 3: Dependents
│   ├── Step6MedicalHistory.tsx                 # Step 4: Medical History
│   ├── Step7Banking.tsx                        # Step 5: Banking
│   └── Step6ReviewTermsSubmit.tsx              # Step 6: Review & Submit
├── app/api/
│   ├── ocr/route.ts                            # Google Vision OCR
│   ├── leads/route.ts                          # Lead capture
│   └── applications/route.ts                   # Application submission
└── types/application.ts                        # TypeScript types
```

---

## Step Configuration

### Main Apply Page
**File**: `apps/frontend/src/app/apply/page.tsx`

```typescript
const steps = [
  { number: 1, title: 'Personal Info', component: Step1Personal },
  { number: 2, title: 'Documents', component: Step2Documents },
  { number: 3, title: 'Dependents', component: Step5Dependents },
  { number: 4, title: 'Medical History', component: Step6MedicalHistory },
  { number: 5, title: 'Banking Details', component: Step7Banking },
  { number: 6, title: 'Review & Submit', component: Step6ReviewTermsSubmit },
]
```

### Step Props Interface
```typescript
interface Props {
  data: ApplicationData
  updateData: (data: Partial<ApplicationData>) => void
  nextStep: () => void
  prevStep: () => void
  goToStep?: (step: number) => void  // Optional, used in Step 6
}
```

---

## Data Structure

### ApplicationData Type
**File**: `apps/frontend/src/types/application.ts`

```typescript
interface ApplicationData {
  // Plan Info
  planId?: string
  planName?: string
  planConfig?: 'single' | 'couple' | 'family'
  monthlyPrice?: number
  
  // Step 1: Personal
  firstName: string
  lastName: string
  idNumber: string
  dateOfBirth: string
  gender?: string
  email: string
  mobile: string
  addressLine1: string
  city: string
  postalCode: string
  
  // Step 2: Documents
  idDocumentUrl?: string
  proofOfAddressUrl?: string
  selfieUrl?: string
  
  // Step 3: Dependents
  dependents?: Dependent[]
  
  // Step 4: Medical History
  medicalHistory?: MedicalHistory
  
  // Step 5: Banking
  bankName?: string
  accountNumber?: string
  branchCode?: string
  accountHolderName?: string
  debitOrderDay?: number
  
  // Step 6: Terms & Consent
  voiceRecordingUrl?: string
  signatureUrl?: string
  termsAccepted?: boolean
  marketingConsent?: boolean
  marketingConsentDate?: string
  emailConsent?: boolean
  smsConsent?: boolean
  phoneConsent?: boolean
}
```

---

## Key Features by Step

### Step 1: Personal Info
```typescript
// Scan ID Feature
const handleIdScan = async (file: File) => {
  const response = await fetch('/api/ocr', {
    method: 'POST',
    body: JSON.stringify({ image: base64Image, documentType: 'sa-id' })
  })
  // Auto-fills: idNumber, firstName, lastName, dateOfBirth
}

// Auto-population from ID
const autoPopulateFromId = (idNumber: string) => {
  // Extracts DOB (YYMMDD) and gender from ID number
}

// Lead capture
await fetch('/api/leads', {
  method: 'POST',
  body: JSON.stringify({ ...formData, source: 'website_application' })
})
```

### Step 2: Documents
```typescript
// OCR Processing
const handleOCR = async (imageUrl: string) => {
  const response = await fetch('/api/ocr', {
    method: 'POST',
    body: JSON.stringify({ image: imageUrl, documentType: 'sa-id' })
  })
  const { extractedData } = await response.json()
  // Returns: idNumber, firstName, lastName, dateOfBirth
}

// Image Rotation
const rotateImage = (degrees: number) => {
  // Rotates image by 90° increments
}
```

### Step 6: Review & Submit
```typescript
// Voice Recording
const startRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const mediaRecorder = new MediaRecorder(stream)
  // Records voice acceptance
}

// Digital Signature
import SignatureCanvas from 'react-signature-canvas'
const signatureRef = useRef<SignatureCanvas>(null)
const signatureUrl = signatureRef.current?.toDataURL()

// Submission
const handleSubmit = async () => {
  const response = await fetch('/api/applications', {
    method: 'POST',
    body: JSON.stringify(applicationData)
  })
  router.push(`/application-submitted?ref=${result.applicationNumber}`)
}
```

---

## API Endpoints

### OCR Processing
```typescript
// POST /api/ocr
{
  image: string,        // Base64 encoded image
  documentType: 'sa-id' | 'passport' | 'drivers-license'
}

// Response
{
  success: boolean,
  extractedData: {
    idNumber?: string,
    firstName?: string,
    lastName?: string,
    dateOfBirth?: string
  }
}
```

### Lead Capture
```typescript
// POST /api/leads
{
  firstName: string,
  lastName: string,
  email: string,
  mobile: string,
  source: 'website_application',
  lifecycleStage: 'application_started'
}
```

### Application Submission
```typescript
// POST /api/applications
{
  ...applicationData,
  termsAccepted: true,
  marketingConsent: boolean,
  marketingConsentDate: string,
  emailConsent: boolean,
  smsConsent: boolean,
  phoneConsent: boolean
}

// Response
{
  success: boolean,
  applicationNumber: string
}
```

---

## Environment Variables

### Required Variables
```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Cloud Vision (for OCR)
# Service account JSON file: google-vision-key.json
```

### Google Vision Setup
1. Create service account in Google Cloud Console
2. Enable Cloud Vision API
3. Download JSON key file
4. Place in `apps/frontend/google-vision-key.json`
5. Add to `.gitignore`

---

## Common Tasks

### Adding a New Field to Step 1
```typescript
// 1. Update ApplicationData type
interface ApplicationData {
  newField?: string  // Add here
}

// 2. Update Step1Personal.tsx
const [formData, setFormData] = useState({
  newField: data.newField || '',  // Add to state
})

// 3. Add input field
<input
  name="newField"
  value={formData.newField}
  onChange={handleChange}
/>

// 4. Update submission
updateData(formData)  // Automatically includes newField
```

### Modifying Step Order
```typescript
// apps/frontend/src/app/apply/page.tsx

// Change step order in array
const steps = [
  { number: 1, title: 'New Step', component: NewStepComponent },
  // ... rest of steps
]

// Update max step count
const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 6))
```

### Adding Validation
```typescript
// In step component
const handleNext = () => {
  // Add validation
  if (!formData.requiredField) {
    alert('Please fill in required field')
    return
  }
  
  updateData(formData)
  nextStep()
}
```

---

## Debugging Tips

### Check Application State
```typescript
// In any step component
console.log('Current data:', data)
console.log('Form data:', formData)
```

### Test OCR Locally
```bash
# Test OCR endpoint
curl -X POST http://localhost:3001/api/ocr \
  -H "Content-Type: application/json" \
  -d '{"image":"base64_image_here","documentType":"sa-id"}'
```

### Check Database Records
```sql
-- Check leads
SELECT * FROM contacts WHERE source = 'website_application' ORDER BY created_at DESC LIMIT 10;

-- Check applications
SELECT * FROM applications ORDER BY created_at DESC LIMIT 10;
```

### Common Issues

**Issue**: OCR not working
- Check `google-vision-key.json` exists
- Verify Google Cloud Vision API is enabled
- Check service account has correct permissions

**Issue**: Step navigation broken
- Verify step count matches array length
- Check `nextStep` max value is correct
- Ensure all step components are imported

**Issue**: Form data not persisting
- Check `updateData` is called before `nextStep`
- Verify `ApplicationData` type includes all fields
- Check state initialization in apply page

---

## Testing Commands

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Type Check
```bash
npx tsc --noEmit
```

### Lint
```bash
npm run lint
```

---

## Deployment Checklist

- [ ] All environment variables set
- [ ] Google Vision service account configured
- [ ] Database migrations run
- [ ] API endpoints tested
- [ ] OCR functionality tested
- [ ] All 6 steps tested end-to-end
- [ ] Mobile responsiveness verified
- [ ] Voice recording tested on mobile
- [ ] Signature canvas tested on touch devices
- [ ] Form validation working
- [ ] Error handling in place
- [ ] Success page working
- [ ] Analytics tracking (if applicable)

---

## Support & Resources

### Documentation
- [Complete 6-Step Documentation](./COMPLETE_6_STEP_DOCUMENTATION.md)
- [Application Flow Updated](./APPLICATION_FLOW_UPDATED.md)
- [Step Consolidation Complete](./STEP_CONSOLIDATION_COMPLETE.md)
- [Google Vision Setup](./GOOGLE_VISION_SETUP.md)
- [OCR Upgrade Complete](./OCR_UPGRADE_COMPLETE.md)

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [React Signature Canvas](https://github.com/agilgur5/react-signature-canvas)
- [Google Cloud Vision API](https://cloud.google.com/vision/docs)
- [Supabase Documentation](https://supabase.com/docs)

---

**Quick Reference Version**: 1.0  
**Last Updated**: January 24, 2026  
**For**: Day1Health Development Team

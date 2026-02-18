# Complete Member Schema

All members in the system share the same database structure. Only the **values** differ (plan names, status, broker group, etc.).

## Current Members Table (71 columns)

### Personal Information
- `id` - UUID (Primary Key)
- `member_number` - Unique member/policy number (e.g., DAY17038894, PAR10001)
- `first_name` - First name or initial
- `last_name` - Surname
- `id_number` - South African ID number
- `date_of_birth` - Date of birth
- `gender` - Gender
- `email` - Email address
- `mobile` - Mobile phone number
- `phone` - Alternative phone number

### Address Information
- `address_line1` - Street address
- `address_line2` - Additional address info
- `city` - City
- `postal_code` - Postal code

### Banking Information
- `bank_name` - Bank name
- `account_number` - Account number
- `branch_code` - Branch code
- `account_holder_name` - Account holder name

### Broker/Group Information
- `broker_group` - Broker code (DAY1, D1PAR, D1MAM, etc.)
- `broker_id` - Foreign key to brokers table
- `debit_order_day` - Day of month for debit order (1-31)
- `monthly_premium` - Monthly premium amount
- `payment_status` - Payment status (active, rejected, suspended)
- `last_payment_date` - Last successful payment date
- `last_payment_amount` - Last payment amount

### Netcash Integration (NEW)
- `netcash_account_reference` - Unique Netcash reference (e.g., D1-DAY1035164)
- `debit_order_status` - Debit order status (pending, active, suspended, failed, cancelled)
- `last_debit_date` - Last debit order attempt date
- `next_debit_date` - Next scheduled debit order date
- `failed_debit_count` - Number of consecutive failed debit attempts
- `debit_order_mandate_date` - Date when debit order mandate was signed
- `debicheck_mandate_id` - DebiCheck mandate reference number
- `debicheck_mandate_status` - DebiCheck status (pending, approved, rejected, expired)
- `total_arrears` - Total outstanding arrears amount

### Plan Information
- `plan_id` - Plan identifier
- `plan_name` - Plan name
- `plan_config` - Plan configuration (JSON)
- `start_date` - Plan start date

### Status & Tracking
- `status` - Member status (active, pending, suspended, cancelled)
- `kyc_status` - KYC verification status
- `kyc_verified_at` - KYC verification timestamp
- `risk_score` - Risk score
- `risk_rating` - Risk rating

### Documents
- `id_document_url` - ID document URL
- `id_document_ocr_data` - OCR extracted data (JSON)
- `proof_of_address_url` - Proof of address URL
- `proof_of_address_ocr_data` - OCR data (JSON)
- `selfie_url` - Selfie photo URL
- `face_verification_result` - Face verification result (JSON)
- `signature_url` - Signature image URL
- `voice_recording_url` - Voice recording URL

### Medical Information
- `medical_history` - Medical history (JSON)

### Consent & Compliance
- `marketing_consent` - Marketing consent flag
- `marketing_consent_date` - Consent date
- `email_consent` - Email consent
- `sms_consent` - SMS consent
- `phone_consent` - Phone consent
- `terms_accepted_at` - Terms acceptance timestamp
- `terms_ip_address` - IP address at acceptance
- `terms_user_agent` - User agent at acceptance

### Application Tracking
- `application_id` - Related application UUID
- `application_number` - Application number
- `approved_at` - Approval timestamp
- `approved_by` - Approver UUID

### Underwriting
- `underwriting_status` - Underwriting status
- `underwriting_notes` - Underwriting notes
- `review_notes` - Review notes

### System Fields
- `user_id` - Related user UUID
- `contact_id` - Related contact UUID
- `created_at` - Record creation timestamp
- `updated_at` - Last update timestamp

---

## Example Member Record

```json
{
  "id": "uuid-here",
  "member_number": "DAY17038894",
  "first_name": "John",
  "last_name": "Smith",
  "id_number": "8001015800080",
  "date_of_birth": "1980-01-01",
  "gender": "male",
  "email": "john.smith@example.com",
  "mobile": "0821234567",
  "phone": null,
  
  "address_line1": "123 Main Street",
  "address_line2": "Apartment 4B",
  "city": "Johannesburg",
  "postal_code": "2000",
  
  "bank_name": "Standard Bank",
  "account_number": "123456789",
  "branch_code": "051001",
  "account_holder_name": "John Smith",
  
  "broker_group": "DAY1",
  "broker_id": "broker-uuid",
  "debit_order_day": 2,
  "monthly_premium": 565.00,
  "payment_status": "active",
  "last_payment_date": "2026-01-02",
  "last_payment_amount": 565.00,
  
  "plan_id": "starter-plan",
  "plan_name": "Starter Hospital Plan",
  "plan_config": {"cover_amount": 50000},
  "start_date": "2025-12-01",
  
  "status": "active",
  "kyc_status": "verified",
  "kyc_verified_at": "2025-12-01T10:00:00Z",
  "risk_score": 75,
  "risk_rating": "low",
  
  "id_document_url": "https://...",
  "id_document_ocr_data": {...},
  "proof_of_address_url": "https://...",
  "proof_of_address_ocr_data": {...},
  "selfie_url": "https://...",
  "face_verification_result": {...},
  "signature_url": "https://...",
  "voice_recording_url": "https://...",
  
  "medical_history": {...},
  
  "marketing_consent": true,
  "marketing_consent_date": "2025-12-01",
  "email_consent": true,
  "sms_consent": true,
  "phone_consent": false,
  "terms_accepted_at": "2025-12-01T09:00:00Z",
  "terms_ip_address": "102.165.x.x",
  "terms_user_agent": "Mozilla/5.0...",
  
  "application_id": "app-uuid",
  "application_number": "APP2025001",
  "approved_at": "2025-12-01T11:00:00Z",
  "approved_by": "admin-uuid",
  
  "underwriting_status": "approved",
  "underwriting_notes": "Standard approval",
  "review_notes": null,
  
  "user_id": "user-uuid",
  "contact_id": "contact-uuid",
  "created_at": "2025-12-01T08:00:00Z",
  "updated_at": "2026-01-02T10:00:00Z"
}
```

---

## What Differs Between Members

### Always Different
- `id` - Unique UUID
- `member_number` - Unique policy number
- Personal details (name, ID, DOB, contact info)
- Banking details
- `broker_group` - Which broker channel they came from
- `monthly_premium` - Their specific premium amount

### Often Different
- `plan_id` / `plan_name` - Different plan selections
- `status` - active, pending, suspended, cancelled
- `payment_status` - active, rejected, suspended
- `debit_order_day` - Different collection dates
- Documents and verification data
- Medical history
- Consent preferences

### Usually Same Within Broker Group
- `broker_id` - Same for all members in a broker group
- Commission rates (stored in brokers table, not members)

---

## Required vs Optional Fields

### Required (NOT NULL)
- `id`
- `member_number`
- `id_number`
- `date_of_birth`
- `email`
- `mobile`
- `first_name`
- `last_name`

### Optional (Can be NULL)
- Most other fields can be null initially
- Filled in during onboarding/application process
- Updated over time as member interacts with system

---

## Next Steps

1. ✅ Schema is complete (57 columns)
2. ✅ Broker columns added (broker_group, broker_id, payment fields)
3. ⏳ Fill in missing data for existing 895 members
4. ⏳ Build member management UI
5. ⏳ Build broker dashboards
6. ⏳ Build debit order processing

---

**Status:** Schema documented and ready for use

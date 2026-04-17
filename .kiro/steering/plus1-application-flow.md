# Plus1Rewards Application Flow

## Overview

The Plus1 application funnel is a **specialized 6-step application process** for existing Plus1Rewards members who want to add Day1Health medical cover to their Plus1 membership. This flow is significantly different from the standard application process.

## Key Differences from Standard Application

1. **No Banking Details Required** - Payment is handled by Plus1Rewards, not Day1Health
2. **Pre-populated Member Data** - All personal information is fetched from Plus1Rewards database
3. **Read-Only Personal Information** - Members cannot edit their pre-filled data
4. **Dependents Added Later** - Dependents are not added during application, but later through Plus1 account
5. **Automatic Broker Assignment** - Broker code is automatically set to 'POR' (Plus1Rewards)
6. **Dual Database Update** - Both Day1Main and Plus1Rewards databases are updated on approval

## Application URL

**Route:** `/plus1confirm`

**Query Parameters:**
- `plan` - Plan ID (optional)
- `planName` - Plan name (optional)
- `config` - Plan configuration: single/couple/family (optional)
- `price` - Monthly price (optional)
- `adults` - Number of adults (optional)
- `children` - Number of children (optional)

**Example:**
```
/plus1confirm?plan=abc123&planName=Day%20to%20Day%20Single&config=single&price=385
```

## The 6-Step Application Flow

### Step 1: Plus1 Member Confirmation
**Component:** `Step1Plus1Confirm.tsx`

**Process:**
1. User enters their Plus1Rewards mobile number
2. System calls `/api/plus1/search-application-member?mobile={mobile}` (NOT `/api/plus1/search-member`)
3. API searches Plus1Rewards database for member by `cell_phone`
4. API verifies member does NOT exist in Day1Main database (critical for new applications)
5. If found in Plus1 but NOT in Day1Main, auto-fills ALL personal information:
   - First name, last name
   - ID number
   - Date of birth
   - Gender
   - Email
   - Mobile
   - Address line 1
   - City
   - Postal code
   - Cover plan name
   - Cover plan price
5. All fields are **READ-ONLY** (disabled) - no editing allowed
6. Displays cover plan name and monthly price
7. On submit, saves lead to `contacts` table with `source: 'website_application'`
8. Proceeds to Step 2

**Important:** 
- Member MUST be found in Plus1Rewards database to proceed
- Member must NOT exist in Day1Main database (new application)
- If member exists in Day1Main, show error: "use upgrade process instead"

### Step 2: Documents
**Component:** `Step2Documents.tsx`

**Process:**
- Same as standard application
- Upload ID document
- Upload proof of address
- Upload selfie
- OCR processing via Google Cloud Vision API
- Face verification

### Step 3: Dependents (Disabled)
**Component:** `Step3Plus1Dependents.tsx`

**Process:**
- This step is **DISABLED** for Plus1 members
- Shows informational message: "You can add dependants to your cover plan later through your Plus1Rewards account or by contacting our support team"
- Just a pass-through step - no data collected
- Dependents will be added later through Plus1Rewards system

**Why Disabled:** Plus1Rewards manages family structures separately.

### Step 4: Medical History
**Component:** `Step6MedicalHistory.tsx`

**Process:**
- Same as standard application
- Collects medical history information:
  - Chronic medication
  - Other medical treatment
  - Dental treatment
  - Future medical concerns
  - Pregnancy
  - Major operations (past 5 years)
  - Hospital admissions (past 5 years)
  - Medical aid membership history

### Step 5: Your Medi Cover Plan
**Component:** `Step5Plus1CoverPlan.tsx`

**Process:**
- Displays the cover plan name (from Plus1 database)
- Shows monthly premium
- **NO banking details collected** - payment handled by Plus1Rewards
- Just a confirmation/review step

**Why No Banking:** Plus1Rewards already has payment information and handles billing.

### Step 6: Review & Submit
**Component:** `Step6Plus1ReviewSubmit.tsx`

**Process:**
1. Review all application information with edit buttons
2. Modified Terms & Conditions (no payment information)
3. **Voice Recording** (REQUIRED for insurance compliance)
4. **Digital Signature** (REQUIRED for insurance compliance)
5. Marketing consent checkboxes (email, SMS, phone)
6. Submit application to `/api/applications`
7. On success, redirects to `/plus1-application-submitted?ref={applicationNumber}`

**Critical Requirements:**
- Voice recording is MANDATORY
- Digital signature is MANDATORY
- Both are legal requirements for insurance applications

## Backend Application Submission

**API Route:** `POST /api/applications`

**Process:**
1. Creates contact record in `contacts` table
2. Creates application record in `applications` table with:
   - `brokerCode: 'POR'` (Plus1Rewards)
   - `status: 'submitted'`
   - All personal information from Step 1
   - Document URLs from Step 2
   - Medical history from Step 4
   - Voice recording and signature URLs from Step 6
   - `collection_method: null` (no payment method needed)
3. Saves application dependents (if any - though typically none for Plus1)
4. Returns application number

## Admin Approval Process

**Route:** `/admin/applications`

**Critical Order of Operations:**

### 1. Duplicate Check
```typescript
// Check for existing member by ID number or mobile
const { data: existingMembers } = await supabaseAdmin
  .from('members')
  .select('id, member_number, first_name, last_name, id_number, mobile')
  .or(`id_number.eq.${application.id_number},mobile.eq.${application.mobile}`)
```

If duplicate found → throw error → approval fails

### 2. Get Broker Code
```typescript
const { data: broker } = await supabaseAdmin
  .from('brokers')
  .select('code')
  .eq('id', application.broker_id)
  .single()

brokerCode = broker?.code || null
```

### 3. Update Plus1Rewards Database (BEFORE creating member)
**CRITICAL:** This happens BEFORE member creation to prevent duplicates

```typescript
if (brokerCode === 'POR') {
  // Use direct REST API to bypass RLS issues
  const updateResponse = await fetch(
    `${process.env.PLUS1_SUPABASE_URL}/rest/v1/members?cell_phone=eq.${encodeURIComponent(application.mobile)}`,
    {
      method: 'PATCH',
      headers: {
        'apikey': process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY!,
        'Authorization': `Bearer ${process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY!}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ plan_status: 'active' })
    }
  )
  
  // If this fails, throw error - NO member will be created
}
```

**Why This Order Matters:**
- If Plus1 update fails and member was already created → duplicate member in database
- By updating Plus1 FIRST, if it fails, no member is created
- Prevents orphaned member records

### 4. Generate Member Number
```typescript
const memberNumber = await generateNextMemberNumber()
// Returns format: DAY1XXXXXXX (sequential)
```

### 5. Create Member Record
```typescript
const { data: member, error: memberError } = await supabaseAdmin
  .from('members')
  .insert({
    member_number: memberNumber,
    // ... all application fields copied exactly
    broker_code: 'POR',
    collection_method: null, // No payment method for Plus1
    status: 'active',
  })
```

### 6. Copy Dependents
```typescript
// Copy from application_dependents to member_dependents
// (Usually none for Plus1 applications)
```

### 7. Delete Application
```typescript
// Delete from application_dependents
// Delete from applications
// Documents remain in Supabase Storage with URLs in member record
```

## Environment Variables Required

```bash
# Plus1Rewards External Database
PLUS1_SUPABASE_URL=https://gcbmlxdxwakkubpldype.supabase.co
PLUS1_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Plus1Rewards Database Schema

**Table:** `members`

**Columns Used:**
- `cell_phone` (text) - Used to find member
- `plan_status` (text) - Updated to 'active' on approval
- `first_name` (text)
- `last_name` (text)
- `sa_id` (text) - ID number
- `date_of_birth` (date)
- `email` (text)
- `address_line_1` (text)
- `city` (text)
- `postal_code` (text)
- `cover_plan_name` (text)
- `cover_plan_price` (text)
- `suburb` (text) - Must exist (even if null) to avoid RLS errors

**Important:** The Plus1Rewards database has RLS policies that reference the `suburb` column. This column MUST exist in the schema, even if it's always null.

## API Endpoints

### Search Plus1 Application Member
**Endpoint:** `GET /api/plus1/search-application-member?mobile={mobile}`

**Status:** ✅ IMPLEMENTED

**Purpose:** Search Plus1Rewards database for NEW APPLICATION members (who should NOT exist in Day1Main yet)

**CRITICAL:** This is different from `/api/plus1/search-member` which is for UPGRADES where member must exist in both databases.

**Process:**
1. Searches Plus1Rewards database by `cell_phone`
2. Verifies member does NOT exist in Day1Main (critical for new applications)
3. If found in Plus1 but NOT in Day1Main, returns member data
4. If found in both databases, returns error: "use upgrade process instead"

**Returns:**
```json
{
  "found": true,
  "member": {
    "firstName": "John",
    "lastName": "Doe",
    "idNumber": "1234567890123",
    "dateOfBirth": "1990-01-01",
    "gender": "male",
    "email": "john@example.com",
    "mobile": "0821234567",
    "addressLine1": "123 Main St",
    "city": "Cape Town",
    "postalCode": "8001",
    "coverPlanName": "Day to Day Single",
    "coverPlanPrice": "385"
  }
}
```

## Common Issues and Solutions

### Issue: "column suburb does not exist"
**Cause:** Plus1Rewards database RLS policy references suburb column that doesn't exist

**Solution:** Add suburb column to Plus1Rewards members table:
```sql
ALTER TABLE members ADD COLUMN IF NOT EXISTS suburb text NULL;
```

### Issue: Duplicate member created when Plus1 update fails
**Cause:** Member was created before Plus1 update, then Plus1 update failed

**Solution:** Code now updates Plus1 FIRST, before creating member. If Plus1 fails, no member is created.

### Issue: Member search returns "member not found" for Plus1 members
**Cause:** Using wrong API endpoint - `/api/plus1/search-member` is for upgrades, not new applications

**Solution:** Use `/api/plus1/search-application-member` for new Plus1 applications. This endpoint:
- Searches Plus1Rewards database
- Verifies member does NOT exist in Day1Main yet
- Returns error if member already exists (should use upgrade process instead)

### Issue: Member cannot edit pre-filled information
**Cause:** This is intentional - data comes from Plus1Rewards and should not be editable

**Solution:** If member data is incorrect, they must update it in Plus1Rewards first, then restart application.

### Issue: Medical history fields showing as required
**Cause:** Fields were marked as required with asterisks

**Solution:** Medical history detail fields are now optional (not required). Only yes/no questions are required. Call centre can follow up for details if needed.

## Call Centre Verification

**Route:** `/call-centre/application/[id]`

**Status:** ✅ IMPLEMENTED

**Purpose:** Call centre agents verify Plus1 applications before admin approval

**Features:**
- **Personal Information Display** - Shows all member details with phone call link
- **Address Display** - Full address information
- **Plan Details** - Plan name and monthly premium
- **Dependants Display** - Shows any dependants (typically none for Plus1)
- **Banking Details** - Shows payment method (EFT or Debit Order)
- **Document Viewing** - Inline document display with iframes:
  - ID Document - Displayed inline in 600px iframe with blue border
  - Proof of Address - Displayed inline in 600px iframe with green border
  - Documents readable directly in the page (no new tabs)
  - Shows "No document uploaded" if missing
- **Call Recording** - MANDATORY verification call recording:
  - MediaRecorder API for recording
  - Start/Stop recording with timer
  - Audio playback preview
  - Upload to Supabase Storage (`call-recordings/verification-calls/`)
  - Verify button disabled until recording uploaded
- **Verification Notes** - Required textarea for documenting call
- **Status Update** - Changes application status to 'under_review' after verification

**Verification Workflow:**
1. Call centre agent opens application from support dashboard
2. Reviews all member information and documents
3. Clicks "Start Recording" before calling member
4. Calls member to verify details (phone link provided)
5. Confirms identity, plan details, and documents
6. Stops recording and uploads to storage
7. Adds verification notes
8. Clicks "Mark as Verified & Send to Admin"
9. Application moves to admin for final approval

**Important:** 
- Call recording is MANDATORY for insurance compliance
- Documents must be viewable and verified
- Verification notes are required
- Status changes to 'under_review' (not 'approved' - only admin can approve)

## Testing Checklist

When testing Plus1 application flow:

1. ✅ Member search finds Plus1 member by mobile number (uses `/api/plus1/search-application-member`)
2. ✅ System verifies member does NOT exist in Day1Main database
3. ✅ All personal information auto-fills correctly from Plus1Rewards
4. ✅ All personal fields are read-only (disabled)
5. ✅ Cover plan name and price display correctly
6. ✅ Documents upload successfully
7. ✅ Dependents step shows disabled message
8. ✅ Medical history saves correctly (fields are optional, not required)
9. ✅ Voice recording is required and saves
10. ✅ Digital signature is required and saves
11. ✅ Plan brochure link works (served from `public/cover plan brochures/`)
12. ✅ Product guide link works (served from `public/Day1 Health Product Guide.pdf`)
13. ✅ Policy wording link works (served from `public/plan exact wording/`)
14. ✅ Application submits successfully
15. ✅ Call centre can view application with all details
16. ✅ ID document displays inline in iframe (600px, blue border)
17. ✅ Proof of address displays inline in iframe (600px, green border)
18. ✅ Documents readable directly in page without opening new tabs
18. ✅ Call recording works and uploads successfully
19. ✅ Verification notes can be added
20. ✅ Application status changes to 'under_review' after verification
21. ✅ Admin can see application with broker code 'POR'
22. ✅ Admin approval updates Plus1Rewards database FIRST
23. ✅ Member is created in Day1Main database
24. ✅ Application is deleted after successful approval
25. ✅ No duplicate members created if Plus1 update fails

## File Locations

**Frontend:**
- Application page: `apps/frontend/src/app/plus1confirm/page.tsx`
- Step 1: `apps/frontend/src/components/apply-steps/Step1Plus1Confirm.tsx`
- Step 3: `apps/frontend/src/components/apply-steps/Step3Plus1Dependents.tsx`
- Step 4: `apps/frontend/src/components/apply-steps/Step6MedicalHistory.tsx` (fields optional, not required)
- Step 5: `apps/frontend/src/components/apply-steps/Step5Plus1CoverPlan.tsx`
- Step 6: `apps/frontend/src/components/apply-steps/Step6Plus1ReviewSubmit.tsx` (includes brochure links)
- Call centre verification: `apps/frontend/src/app/call-centre/application/[id]/page.tsx` (enhanced document display)

**Backend:**
- Application submission: `apps/frontend/src/app/api/applications/route.ts`
- Application approval: `apps/frontend/src/app/api/admin/applications/route.ts`
- Plus1 application member search: `apps/frontend/src/app/api/plus1/search-application-member/route.ts` (NEW APPLICATIONS)
- Plus1 upgrade member search: `apps/frontend/src/app/api/plus1/search-member/route.ts` (UPGRADES ONLY)

**Assets:**
- Brochures: `apps/frontend/public/cover plan brochures/*.pdf`
- Product Guide: `apps/frontend/public/Day1 Health Product Guide.pdf`
- Policy Wording: `apps/frontend/public/plan exact wording/*.pdf`

## Important Notes for Future Development

1. **Never change the order** of Plus1 update and member creation - Plus1 MUST be updated first
2. **Always use direct REST API** for Plus1 updates to avoid RLS issues
3. **Never allow editing** of pre-filled Plus1 member data
4. **Keep dependents step disabled** - Plus1 manages this separately
5. **No banking details** should ever be collected for Plus1 applications
6. **Voice recording and signature** are legal requirements - cannot be optional
7. **Broker code 'POR'** is hardcoded and should never change
8. **Plus1 database schema** must include suburb column to avoid RLS errors
9. **30-Day Active Check** - Plus1 members show "Active until" date (30 days from approval) instead of banking details
10. **Automated Status Sync** - Daily cron job syncs Plus1 member status; inactive Plus1 members are set to 'suspended' in Day1Main

## Success Criteria

A successful Plus1 application approval should:
1. Update Plus1Rewards database (`plan_status = 'active'`)
2. Create member in Day1Main database with broker code 'POR'
3. Delete application from applications table
4. NOT create duplicate members if any step fails
5. Complete in under 5 seconds

## Monitoring

Watch for these log messages during approval:

```
✅ Plus1 member detected - updating Plus1Rewards status to active
🔄 Updating Plus1 status for mobile: 0821234567
✅ Plus1 member status updated to active for mobile: 0821234567 (1 row(s) updated)
✅ Generated member number: DAY1XXXXXXX
```

If you see:
```
❌ Failed to update Plus1 status: ...
❌ CRITICAL: Error updating Plus1 status: ...
```

The approval will fail and NO member will be created (this is correct behavior).


## Plus1 Member Management

### 30-Day Active Check

Plus1 members have a different payment model than standard Day1Health members:

**Banking Details Display:**
- Standard members: Show bank account, branch code, debit order day
- Plus1 members (broker code 'POR'): Show "Active until" date instead

**Active Until Calculation:**
- Date = Approval date + 30 days
- Example: Approved on 2026-04-09 → Active until 2026-05-09
- Displayed in Banking Details section of member profile

**Implementation:**
```typescript
// In member details page
{member.brokerCode === 'POR' ? (
  <div>
    <p className="text-xs text-gray-600">Active Until</p>
    <p className="font-medium">
      {member.joinDate ? 
        new Date(new Date(member.joinDate).getTime() + 30 * 24 * 60 * 60 * 1000)
          .toLocaleDateString('en-ZA', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }) 
        : 'N/A'}
    </p>
  </div>
) : (
  // Show banking details for non-Plus1 members
)}
```

### Automated Status Synchronization

**Cron Job:** `/api/cron/sync-plus1-status`

**Schedule:** Daily at midnight (configured in hosting platform)

**Process:**
1. Finds all Day1Main members with broker code 'POR' (Plus1Rewards)
2. Filters members approved 30+ days ago
3. For each member:
   - Queries Plus1Rewards database by mobile number
   - Checks `plan_status` column
   - Maps Plus1 status to Day1 status
   - Updates Day1Main member status if changed

**Status Mapping:**
```typescript
Plus1 Status          → Day1 Status
'active'              → 'active'
'inactive'            → 'suspended'
'suspended'           → 'suspended'
'paused'              → 'suspended'
```

**Security:**
- Requires `CRON_SECRET` environment variable for authentication
- Uses service role keys to bypass RLS policies
- Logs all sync operations for audit trail

**Monitoring:**
```
✅ Sync complete: 150 checked, 5 updated, 0 errors
```

**Error Handling:**
- If Plus1 member not found: Logs error, continues to next member
- If Plus1 database unavailable: Returns 500 error, retries next day
- If Day1 update fails: Logs error, continues to next member

**Environment Variables Required:**
```bash
CRON_SECRET=your_secret_key_here
PLUS1_SUPABASE_URL=https://gcbmlxdxwakkubpldype.supabase.co
PLUS1_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Manual Trigger:**
```bash
curl -X GET https://your-domain.com/api/cron/sync-plus1-status \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Testing:**
1. Create Plus1 member (broker code 'POR')
2. Set approval date to 31+ days ago
3. Update Plus1Rewards `plan_status` to 'inactive'
4. Run cron job manually
5. Verify Day1Main member status changed to 'suspended'


### Issue: Brochure/Product Guide links not working (404 errors)
**Cause:** PDFs were in `docs/` folder but Next.js can only serve from `public/` folder. Also, `/api/brochure` endpoint was failing.

**Solution:** All PDFs now copied to public folder and links updated to use direct public paths:
- Brochures: `public/cover plan brochures/*.pdf` → `/cover plan brochures/Comprehensive Value Plus Plan.pdf`
- Product Guide: `public/Day1 Health Product Guide.pdf` → `/Day1 Health Product Guide.pdf`
- Policy Wording: `public/plan exact wording/*.pdf` → `/plan exact wording/Value Plus Plan - Exact Policy Wording - Final.pdf`

**Status:** ✅ FIXED - All brochure links now work correctly using direct public folder paths

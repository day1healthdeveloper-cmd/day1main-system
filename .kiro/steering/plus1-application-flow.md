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
2. System calls `/api/plus1/search-member?mobile={mobile}`
3. API searches Plus1Rewards database for member by `cell_phone`
4. If found, auto-fills ALL personal information:
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

**Important:** Member MUST be found in Plus1Rewards database to proceed.

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

### Search Plus1 Member
**Endpoint:** `GET /api/plus1/search-member?mobile={mobile}`

**Purpose:** Search Plus1Rewards database for member by mobile number

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

### Issue: Member cannot edit pre-filled information
**Cause:** This is intentional - data comes from Plus1Rewards and should not be editable

**Solution:** If member data is incorrect, they must update it in Plus1Rewards first, then restart application.

### Issue: Dependents step is disabled
**Cause:** This is intentional - Plus1 manages dependents separately

**Solution:** Dependents are added later through Plus1Rewards account or support team.

## Testing Checklist

When testing Plus1 application flow:

1. ✅ Member search finds Plus1 member by mobile number
2. ✅ All personal information auto-fills correctly
3. ✅ All personal fields are read-only (disabled)
4. ✅ Cover plan name and price display correctly
5. ✅ Documents upload successfully
6. ✅ Dependents step shows disabled message
7. ✅ Medical history saves correctly
8. ✅ Voice recording is required and saves
9. ✅ Digital signature is required and saves
10. ✅ Application submits successfully
11. ✅ Admin can see application with broker code 'POR'
12. ✅ Admin approval updates Plus1Rewards database FIRST
13. ✅ Member is created in Day1Main database
14. ✅ Application is deleted after successful approval
15. ✅ No duplicate members created if Plus1 update fails

## File Locations

**Frontend:**
- Application page: `apps/frontend/src/app/plus1confirm/page.tsx`
- Step 1: `apps/frontend/src/components/apply-steps/Step1Plus1Confirm.tsx`
- Step 3: `apps/frontend/src/components/apply-steps/Step3Plus1Dependents.tsx`
- Step 5: `apps/frontend/src/components/apply-steps/Step5Plus1CoverPlan.tsx`
- Step 6: `apps/frontend/src/components/apply-steps/Step6Plus1ReviewSubmit.tsx`

**Backend:**
- Application submission: `apps/frontend/src/app/api/applications/route.ts`
- Application approval: `apps/frontend/src/app/api/admin/applications/route.ts`
- Plus1 member search: `apps/frontend/src/app/api/plus1/search-member/route.ts`

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

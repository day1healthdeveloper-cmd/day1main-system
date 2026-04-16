# Plus1 Add Dependants Process

## Overview

The Plus1 add dependants process allows existing Plus1Rewards members with Day1Health medical cover to add dependants (spouse/partner or children) to their existing plan. This is a specialized workflow that requires call centre verification before final approval by operations manager.

## Key Differences from Standard Add Dependants

1. **Plus1 Integration** - Dependants must sync with Plus1Rewards database
2. **No Payment Changes** - Payment continues through Plus1Rewards system
3. **Call Centre Verification Required** - All dependant additions must be verified via phone call with mandatory call recording
4. **Operations Manager Approval** - Final approval after call centre verification
5. **Broker Code** - All Plus1 members have broker code 'POR' (Plus1Rewards)
6. **Dual Visibility** - Dependant requests appear in BOTH Call Centre and Operations dashboards simultaneously
7. **Dependant Code Assignment** - System assigns proper dependant code (01-05 for spouse/partner, 06+ for children)

## Add Dependants Flow

### Step 1: Member Submits Dependant Request

**Route:** `/plus1adddependant`

**Process:**
1. Member enters Plus1 mobile number
2. System searches Plus1Rewards database via `/api/plus1/search-member`
3. Current plan and premium are auto-populated from Plus1 database
4. Member fills in dependant details:
   - First name, last name
   - ID number (or passport for non-SA residents)
   - Date of birth
   - Gender
   - Relationship (spouse, partner, child)
5. Member uploads dependant documents:
   - ID document or passport
   - Birth certificate (if child under 16)
   - Marriage certificate (if spouse)
6. System calculates new premium based on:
   - Current premium
   - Dependant type (spouse/partner vs child)
   - Dependant age
   - Plan configuration
7. System shows dependant addition summary:
   - Current Premium: R___
   - Dependant Cost: +R___
   - New Premium: R___
8. Member submits dependant request

**Data Captured:**
- Mobile number
- Member data (first name, last name, email, etc.)
- Dependant personal information
- Dependant relationship
- Document URLs
- Current premium
- New premium (current + dependant cost)

**Submission:**
- POST to `/api/plus1/add-dependant`
- Status: 'pending'
- **Notification sent to BOTH:**
  - Call Centre Dashboard (Member Support tab)
  - Operations Dashboard (Call Centre tab + sidebar badge)

### Step 2: Call Centre Verification

**Routes:** 
- `/call-centre/support` (Member Support tab)
- `/operations/call-centre` (Operations can also see and follow up)

**Process:**
1. Call centre agent sees pending dependant request
2. Agent clicks "Start Verification Call" or "Process Dependant Request"
3. Agent calls member to verify dependant addition
4. **Agent records the call (REQUIRED - not optional)**
   - Click "Start Recording Call"
   - Conduct verification
   - Click "Stop Recording"
   - Upload recording to Supabase Storage
5. Agent completes verification checklist:
   - Confirm member identity (ID number displayed from database)
   - Verify dependant relationship (spouse/partner/child)
   - Confirm dependant details (ID number, date of birth)
   - Review uploaded documents (ID, birth certificate, marriage certificate)
   - Explain new plan premium (shown in blue)
   - Confirm member understands waiting periods for dependant
   - Confirm premium increase amount
   - Check member's recent claim history
6. Agent documents verification notes (required)
7. Agent clicks "Verify & Approve Dependant Request"

**Status Change:**
- From: 'pending'
- To: 'verified'

**Data Added:**
- Verification notes (required)
- Call recording URL (required)
- Verified by (agent ID/name)
- Verified at (timestamp)

**Important:** Call recording is MANDATORY for insurance compliance. The verify button is disabled until recording is uploaded.

### Step 3: Operations Manager Approval

**Route:** `/operations/call-centre`

**Process:**
1. Operations manager sees verified dependant request (status badge shows "PENDING APPROVAL")
2. Reviews verification details:
   - Verified by (call centre agent name)
   - Verified at (timestamp)
   - Verification notes (what the agent documented)
   - Call recording (can listen to the full call)
3. Reviews member information and dependant details
4. Checks uploaded documents (ID, birth certificate, marriage certificate)
5. Verifies dependant relationship is valid
6. Checks member's claim history
7. Verifies new premium calculation
8. Approves or rejects dependant request

**On Approval:**
1. Fetch dependant request details from database
2. Find member in Day1Main database using mobile number
3. **Determine dependant code:**
   - Query existing dependants for this member
   - If relationship is 'spouse' or 'partner': Assign code 01-05 (next available)
   - If relationship is 'child': Assign code 06+ (next available)
4. **Update Plus1Rewards database FIRST** (critical order to prevent data inconsistency):
   - Update `cover_plan_price` to new premium (current + dependant cost)
   - **Update `plan_status` to 'active'** (critical - enables all member functionality)
   - If this fails, STOP - nothing else happens
5. Create dependant record in Day1Main `member_dependants` table:
   - Link to member via `member_id`
   - Assign dependant code (01-05 for spouse/partner, 06+ for child)
   - Store all dependant details
   - Store document URLs
   - Set status to 'active'
6. Update member record in Day1Main database:
   - Update `monthly_premium` to new premium
   - Update `updated_at` timestamp
7. Update dependant request status to 'approved'
8. Record `approved_at` timestamp
9. TODO: Send confirmation email/SMS to member

**On Rejection:**
1. Update dependant request status to 'rejected'
2. Add rejection reason
3. Send notification to member

## Database Schema

### Table: `plus1_dependant_requests`

**Status:** ✅ CREATED

**Proposed Schema:**
```sql
CREATE TABLE plus1_dependant_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id),
  mobile_number TEXT NOT NULL,
  member_first_name TEXT,
  member_last_name TEXT,
  member_email TEXT,
  
  -- Dependant Information
  dependant_first_name TEXT NOT NULL,
  dependant_last_name TEXT NOT NULL,
  dependant_id_number TEXT NOT NULL,
  dependant_date_of_birth DATE NOT NULL,
  dependant_gender TEXT NOT NULL,
  dependant_relationship TEXT NOT NULL, -- spouse, partner, child
  
  -- Documents
  id_document_url TEXT,
  birth_certificate_url TEXT,
  marriage_certificate_url TEXT,
  
  -- Premium Information
  current_premium DECIMAL(10,2) NOT NULL,
  dependant_cost DECIMAL(10,2) NOT NULL,
  new_premium DECIMAL(10,2) NOT NULL,
  
  -- Status and Workflow
  status TEXT NOT NULL DEFAULT 'pending', -- pending, verified, approved, rejected
  verification_notes TEXT,
  call_recording_url TEXT,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  rejected_by UUID REFERENCES users(id),
  rejected_at TIMESTAMP,
  
  -- Timestamps
  requested_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP
);
```

### Dependant Code Assignment Logic

**Spouse/Partner Codes (01-05):**
- Query existing dependants: `SELECT dependant_code FROM member_dependants WHERE member_id = ? AND dependant_code BETWEEN '01' AND '05' ORDER BY dependant_code DESC LIMIT 1`
- If no spouse/partner exists: Assign '01'
- If spouse/partner exists: Assign next available (02, 03, 04, 05)
- Maximum 5 spouse/partner dependants per member

**Child Codes (06+):**
- Query existing child dependants: `SELECT dependant_code FROM member_dependants WHERE member_id = ? AND dependant_code >= '06' ORDER BY dependant_code DESC LIMIT 1`
- If no children exist: Assign '06'
- If children exist: Assign next available (07, 08, 09, 10, etc.)
- No maximum limit on children

## API Endpoints

### POST `/api/plus1/add-dependant`

**Status:** NOT YET CREATED

**Purpose:** Submit dependant addition request

**Request Body:**
```json
{
  "mobile_number": "0821234567",
  "dependant_first_name": "Jane",
  "dependant_last_name": "Doe",
  "dependant_id_number": "0001015800084",
  "dependant_date_of_birth": "2000-01-01",
  "dependant_gender": "female",
  "dependant_relationship": "spouse",
  "id_document_url": "https://...",
  "birth_certificate_url": "https://...",
  "marriage_certificate_url": "https://...",
  "current_premium": 385.00,
  "dependant_cost": 150.00,
  "new_premium": 535.00
}
```

**Implementation:**
- Validates request data
- Saves dependant request to `plus1_dependant_requests` table
- Sets status to 'pending'
- Returns success with dependant request ID

### GET `/api/plus1/dependant-requests`

**Status:** NOT YET CREATED

**Purpose:** Fetch dependant requests for call centre and operations dashboards

**Query Parameters:**
- `status` - Filter by status (pending, verified, approved, rejected)
- `includeMembers` - Include full member details (true/false)

**Features:**
- Query `plus1_dependant_requests` table
- Filter by status
- Optional `includeMembers=true` parameter to fetch full member details
- Returns dependant requests with member data, documents, and claim history

### PATCH `/api/plus1/dependant-requests/[id]`

**Status:** NOT YET CREATED

**Purpose:** Update dependant request status (verify, approve, reject)

**Actions:**

**1. Verify Action** (Call Centre Agent):
- Requires: `verification_notes`, `call_recording_url`
- Updates status to 'verified'
- Records `verified_at` timestamp
- TODO: Record `verified_by` user ID

**2. Approve Action** (Operations Manager):
- Fetches dependant request and member details
- **Determines dependant code** based on relationship and existing dependants
- **Updates Plus1Rewards database FIRST:**
  - `cover_plan_price` → new premium (current + dependant cost)
  - `plan_status` → 'active' (critical!)
  - If fails, entire approval stops
- Creates dependant in Day1Main `member_dependants` table:
  - Assigns proper dependant code (01-05 or 06+)
  - Links to member
  - Stores all dependant details
  - Sets status to 'active'
- Updates Day1Main member record:
  - `monthly_premium` → new premium
- Updates dependant request status to 'approved'
- Records `approved_at` timestamp
- TODO: Record `approved_by` user ID
- TODO: Send confirmation email/SMS

**3. Reject Action** (Call Centre or Operations):
- Requires: `rejection_reason`
- Updates status to 'rejected'
- Records `rejected_at` timestamp
- TODO: Record `rejected_by` user ID
- TODO: Send notification to member

## Components

### DependantVerificationForm

**Location:** `apps/frontend/src/components/call-centre/dependant-verification-form.tsx`

**Status:** NOT YET CREATED

**Purpose:** Call centre verification form for dependant requests

**Features:**
- **Call Recording (REQUIRED):**
  - MediaRecorder API for recording verification calls
  - Start/Stop recording with timer
  - Audio playback preview
  - Upload to Supabase Storage (`call-recordings/dependant-verification-calls/`)
  - Verify button disabled until recording uploaded
- **Verification Checklist:**
  - Confirm member identity (ID number shown in blue)
  - Verify dependant relationship (spouse/partner/child)
  - Confirm dependant details (ID, DOB shown in blue)
  - Review uploaded documents (ID, birth certificate, marriage certificate)
  - Explain new premium (shown in blue)
  - Confirm member understands waiting periods for dependant
  - Confirm premium increase amount (shown in blue)
  - Check recent claim history
- **Verification Notes:** Required textarea for documenting call
- **Verified View (for Operations Manager):**
  - Shows verified information (member ID, dependant details, premiums, increase)
  - Displays verification notes
  - Audio player for call recording
  - Document preview/download links
  - Approve/Reject buttons (only for operations_manager role)
- **Role-Based Actions:**
  - Call centre agents: Can verify only
  - Operations managers: Can approve/reject verified requests

## Pages

### Plus1 Add Dependant Page

**Location:** `apps/frontend/src/app/plus1adddependant/page.tsx`

**Status:** NOT YET CREATED

**Features:**
- Member mobile number search
- Current plan and premium display (auto-populated)
- Dependant details form:
  - Personal information
  - Relationship dropdown
  - Document uploads
- Premium calculator (shows current + dependant cost = new premium)
- Dependant addition summary
- Submit button

### Operations Call Centre Page (Updated)

**Location:** `apps/frontend/src/app/operations/call-centre/page.tsx`

**Status:** NEEDS UPDATE

**Features to Add:**
- Add "Dependant Requests" to sidebar tabs
- Display pending and verified dependant requests
- Show dependant request cards with:
  - Member information
  - Dependant information
  - Document links
  - Premium summary (Current → New)
  - Status badge (PENDING VERIFICATION / PENDING APPROVAL)
  - Action button:
    - "Start Verification Call" for pending requests
    - "Check Dependant Verification" for verified requests
- Opens `DependantVerificationForm` modal for each request
- Passes user role to form for role-based actions
- Auto-refreshes on verification/approval

## Environment Variables

```bash
# Plus1Rewards External Database
PLUS1_SUPABASE_URL=https://gcbmlxdxwakkubpldype.supabase.co
PLUS1_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Workflow States

```
pending → verified → approved
                  ↘ rejected
```

**pending:**
- Dependant request submitted by member
- Visible in BOTH Call Centre Dashboard (Member Support) AND Operations Dashboard (Call Centre)
- Waiting for call centre verification
- Operations manager can see and follow up if call centre is slow

**verified:**
- Call centre has verified the dependant request via phone call
- Verification notes and call recording added (recording is mandatory)
- Documents reviewed
- Visible in Operations Dashboard (Call Centre) with "PENDING APPROVAL" badge
- Waiting for operations manager approval

**approved:**
- Operations manager has approved the dependant request
- Dependant created in both databases with proper dependant code
- Member premium updated in both databases
- Member notified of dependant addition

**rejected:**
- Dependant request rejected (by call centre or operations manager)
- Rejection reason documented
- Member notified

## Notification Flow

**When member submits dependant request (Status: pending):**
- ✅ Appears in Call Centre Dashboard → Member Support tab
- ✅ Appears in Operations Dashboard → Call Centre tab
- ✅ Badge count on Call Centre sidebar button (Operations Dashboard)
- ✅ Badge count on Member Support button (Call Centre Dashboard)

**When call centre verifies (Status: verified):**
- ✅ Appears in Operations Dashboard → Call Centre tab with "PENDING APPROVAL" status
- ✅ Badge count updates on Call Centre sidebar button
- ✅ Shows verification details, notes, call recording, and documents
- ✅ Ready for operations manager approval

This dual visibility ensures operations managers can monitor dependant requests and follow up with call centre if needed, similar to how applications and upgrades work.

## Business Rules

1. **Identity Verification Required** - Call centre must verify member identity before approval
2. **Call Recording Mandatory** - Call recording is REQUIRED (not optional) for insurance compliance
3. **Document Verification** - All uploaded documents must be reviewed and validated
4. **Relationship Validation** - Dependant relationship must be valid (spouse, partner, child)
5. **Dependant Code Assignment** - System automatically assigns proper code (01-05 for spouse/partner, 06+ for child)
6. **Age Validation** - Children must be under 21 (or 25 if student)
7. **Claim History Check** - Review recent claims to assess risk
8. **Payment Verification** - Payment continues through Plus1Rewards (no banking details needed)
9. **Waiting Periods** - Inform member of waiting periods for dependant (3 months general, 12 months maternity)
10. **Premium Increase** - Member must verbally consent to premium increase
11. **Database Sync** - Both Day1Main and Plus1Rewards databases must be updated
12. **Plus1 Status Active** - `plan_status` must be set to 'active' in Plus1Rewards (critical for all functionality)
13. **Update Order Critical** - Plus1Rewards MUST be updated BEFORE Day1Main to prevent data inconsistency
14. **Broker Code** - Must remain 'POR' (Plus1Rewards) after adding dependant
15. **Dual Visibility** - Dependant requests visible to both Call Centre and Operations simultaneously
16. **Operations Follow-up** - Operations manager can follow up with call centre if verification is delayed
17. **Role-Based Approval** - Only operations managers can approve; call centre can only verify

## Testing Checklist

When testing Plus1 add dependants flow:

1. ⬜ Member can search by mobile number
2. ⬜ Current plan and premium display correctly from Plus1 database
3. ⬜ Dependant form validates all required fields
4. ⬜ Document uploads work correctly
5. ⬜ Premium calculator shows correct new premium
6. ⬜ Dependant addition summary shows correctly
7. ⬜ Dependant request saves to database
8. ⬜ Call centre sees pending dependant request
9. ⬜ Verification form works correctly
10. ⬜ Call recording uploads successfully
11. ⬜ Document review works in verification form
12. ⬜ Status changes to 'verified' after verification
13. ⬜ Operations manager can approve/reject
14. ⬜ Dependant code is assigned correctly (01-05 or 06+)
15. ⬜ Plus1Rewards database updates FIRST on approval (with plan_status: 'active')
16. ⬜ Dependant created in Day1Main with correct code
17. ⬜ Member premium updated in Day1Main on approval
18. ⬜ Member receives confirmation notification (TODO)
19. ⬜ Dependant history is tracked (TODO)

## TODO List

### High Priority
- [ ] Create `plus1_dependant_requests` database table
- [ ] Create `/api/plus1/add-dependant` POST endpoint
- [ ] Create `/api/plus1/dependant-requests` GET endpoint
- [ ] Create `/api/plus1/dependant-requests/[id]` PATCH endpoint
- [ ] Create `/plus1adddependant` page with dependant form
- [ ] Create `DependantVerificationForm` component
- [ ] Integrate dependant requests into call centre dashboard
- [ ] Update operations call centre page with dependant requests tab
- [ ] Implement dependant code assignment logic
- [ ] Implement call recording upload to Supabase Storage
- [ ] Implement role-based access (call centre vs operations manager)

### Medium Priority
- [ ] Add `verified_by`, `approved_by`, `rejected_by` user tracking
- [ ] Add email/SMS notifications for dependant request status changes
- [ ] Create dependant history view for members
- [ ] Add dependant request analytics to operations dashboard
- [ ] Implement document preview/download in verification form
- [ ] Add premium calculator validation

### Low Priority
- [ ] Add dependant request search/filter
- [ ] Export dependant requests to CSV
- [ ] Add dependant request notes/comments
- [ ] Create dependant request audit log
- [ ] Add bulk dependant addition (multiple dependants at once)

## Success Criteria

A successful Plus1 add dependant should:
1. ✅ Save dependant request to database with status 'pending'
2. ✅ Notify call centre of pending request (dual visibility with operations)
3. ✅ Allow call centre to verify via phone and add notes
4. ✅ Require mandatory call recording upload
5. ✅ Require document verification
6. ✅ Change status to 'verified' after verification
7. ✅ Allow operations manager to approve/reject (not call centre)
8. ✅ Assign correct dependant code (01-05 for spouse/partner, 06+ for child)
9. ✅ Update Plus1Rewards database FIRST on approval (including plan_status: 'active')
10. ✅ Create dependant in Day1Main database with correct code
11. ✅ Update member premium in Day1Main database on approval
12. ⬜ Send confirmation to member (TODO)
13. ✅ Complete in under 48 hours from request to approval

**Status:** ✅ FULLY IMPLEMENTED - Ready for testing

## Monitoring

Watch for these log messages:

```
✅ Plus1 dependant request submitted: [mobile]
✅ Dependant code assigned: [code] for relationship: [spouse/child]
✅ Dependant request verified by: [agent]
✅ Dependant approved for member: [member_number]
✅ Plus1 database updated: [mobile] - new premium: R[amount]
✅ Day1Main dependant created: [dependant_code] for member: [member_number]
✅ Day1Main member premium updated: [member_number]
```

If you see:
```
❌ Failed to save dependant request: ...
❌ Failed to assign dependant code: ...
❌ Failed to update Plus1 database: ...
❌ Failed to create dependant record: ...
❌ Failed to update member premium: ...
```

The dependant addition will fail and should be retried or handled manually.

## Notes

- This process is specifically for Plus1Rewards members (broker code 'POR')
- Standard member dependant additions follow a different process
- Payment continues through Plus1Rewards - no banking details needed
- Dependants are subject to underwriting rules (waiting periods, pre-existing conditions)
- Dependant code assignment is automatic and follows strict rules
- Maximum 5 spouse/partner dependants (codes 01-05)
- No maximum on children dependants (codes 06+)
- Documents are mandatory for verification and compliance

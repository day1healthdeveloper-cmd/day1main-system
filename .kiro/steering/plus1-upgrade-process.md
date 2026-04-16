# Plus1 Member Upgrade Process

## Overview

The Plus1 upgrade process allows existing Plus1Rewards members with Day1Health medical cover to upgrade their plan to a higher tier. This is a specialized workflow that requires call centre verification before final approval by operations manager.

## Key Differences from Standard Upgrades

1. **Plus1 Integration** - Upgrades must sync with Plus1Rewards database
2. **No Payment Changes** - Payment continues through Plus1Rewards system
3. **Call Centre Verification Required** - All upgrades must be verified via phone call with mandatory call recording
4. **Operations Manager Approval** - Final approval after call centre verification
5. **Broker Code** - All Plus1 members have broker code 'POR' (Plus1Rewards)
6. **Dual Visibility** - Upgrade requests appear in BOTH Call Centre and Operations dashboards simultaneously

## Upgrade Flow

### Step 1: Member Submits Upgrade Request

**Route:** `/plus1upgrade`

**Process:**
1. Member enters Plus1 mobile number
2. System searches Plus1Rewards database via `/api/plus1/search-member`
3. Current plan is auto-populated from Plus1 database
4. Member selects upgraded plan from dropdown (loaded from `products` table)
5. System shows upgrade summary (From → To)
6. Member submits upgrade request

**Data Captured:**
- Mobile number
- Current plan name
- Upgraded plan name
- Member data (first name, last name, email, etc.)

**Submission:**
- POST to `/api/plus1/upgrade`
- Status: 'pending'
- **Notification sent to BOTH:**
  - Call Centre Dashboard (Member Support tab)
  - Operations Dashboard (Call Centre tab + sidebar badge)

### Step 2: Call Centre Verification

**Routes:** 
- `/call-centre/support` (Member Support tab)
- `/operations/call-centre` (Operations can also see and follow up)

**Process:**
1. Call centre agent sees pending upgrade request
2. Agent clicks "Start Verification Call" or "Process Upgrade"
3. Agent calls member to verify upgrade
4. **Agent records the call (REQUIRED - not optional)**
   - Click "Start Recording Call"
   - Conduct verification
   - Click "Stop Recording"
   - Upload recording to Supabase Storage
5. Agent completes verification checklist:
   - Confirm member identity (ID number displayed from database)
   - Verify current plan details (shown in blue)
   - Explain new plan benefits and coverage (View Brochure button)
   - Confirm member understands waiting periods (if any)
   - Confirm new monthly premium amount (shown in blue)
   - Check recent claim history
6. Agent documents verification notes (required)
7. Agent clicks "Verify & Approve Upgrade"

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
1. Operations manager sees verified upgrade request (status badge shows "VERIFIED")
2. Reviews verification details:
   - Verified by (call centre agent name)
   - Verified at (timestamp)
   - Verification notes (what the agent documented)
   - Call recording (can listen to the full call)
3. Reviews member information and upgrade details
4. Checks member's claim history
5. Verifies new plan pricing
6. Approves or rejects upgrade

**On Approval:**
1. Fetch upgrade request details from database
2. Find member in Day1Main database using mobile number
3. **Update Plus1Rewards database FIRST** (critical order to prevent data inconsistency):
   - Update `cover_plan_name` to upgraded plan
   - Update `cover_plan_price` to new premium
   - **Update `plan_status` to 'active'** (critical - enables all member functionality)
   - If this fails, STOP - nothing else happens
4. Update member record in Day1Main database:
   - Change `plan_name` to upgraded plan
   - Update `monthly_premium` to new premium
   - Update `updated_at` timestamp
5. Update upgrade request status to 'approved'
6. Record `approved_at` timestamp
7. TODO: Send confirmation email/SMS to member

**On Rejection:**
1. Update upgrade request status to 'rejected'
2. Add rejection reason
3. Send notification to member

## Database Schema

### Table: `plus1_upgrade_requests`

**Status:** ✅ CREATED

**Schema:**
```sql
CREATE TABLE plus1_upgrade_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id),
  mobile_number TEXT NOT NULL,
  member_first_name TEXT,
  member_last_name TEXT,
  member_email TEXT,
  current_plan TEXT NOT NULL,
  upgraded_plan TEXT NOT NULL,
  current_price DECIMAL(10,2),
  upgraded_price DECIMAL(10,2),
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
  requested_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP
);
```

## API Endpoints

### POST `/api/plus1/upgrade`

**Status:** ✅ IMPLEMENTED

**Purpose:** Submit upgrade request

**Implementation:**
- Validates request data
- Saves upgrade request to `plus1_upgrade_requests` table
- Sets status to 'pending'
- Returns success with upgrade request ID

### GET `/api/plus1/upgrade-requests`

**Status:** ✅ IMPLEMENTED

**Purpose:** Fetch upgrade requests for call centre and operations dashboards

**Features:**
- Query `plus1_upgrade_requests` table
- Filter by status (pending, verified, approved, rejected)
- Optional `includeMembers=true` parameter to fetch full member details
- Returns upgrade requests with member data, claims history, and plan benefits

### PATCH `/api/plus1/upgrade-requests/[id]`

**Status:** ✅ IMPLEMENTED

**Purpose:** Update upgrade request status (verify, approve, reject)

**Actions:**

**1. Verify Action** (Call Centre Agent):
- Requires: `verification_notes`, `call_recording_url`
- Updates status to 'verified'
- Records `verified_at` timestamp
- TODO: Record `verified_by` user ID

**2. Approve Action** (Operations Manager):
- Fetches upgrade request and member details
- **Updates Plus1Rewards database FIRST:**
  - `cover_plan_name` → upgraded plan
  - `cover_plan_price` → new premium
  - `plan_status` → 'active' (critical!)
  - If fails, entire approval stops
- Updates Day1Main member record:
  - `plan_name` → upgraded plan
  - `monthly_premium` → new premium
- Updates upgrade request status to 'approved'
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

### UpgradeVerificationForm

**Location:** `apps/frontend/src/components/call-centre/upgrade-verification-form.tsx`

**Status:** ✅ IMPLEMENTED

**Purpose:** Call centre verification form for upgrade requests

**Features:**
- **Call Recording (REQUIRED):**
  - MediaRecorder API for recording verification calls
  - Start/Stop recording with timer
  - Audio playback preview
  - Upload to Supabase Storage (`call-recordings/upgrade-verification-calls/`)
  - Verify button disabled until recording uploaded
- **Verification Checklist:**
  - Confirm member identity (ID number shown in blue)
  - Verify current plan details (shown in blue)
  - Explain new plan benefits (View Brochure button opens PDF)
  - Confirm member understands waiting periods
  - Confirm new monthly premium (shown in blue)
  - Check recent claim history
- **Verification Notes:** Required textarea for documenting call
- **Verified View (for Operations Manager):**
  - Shows verified information (ID, plans, premiums, increase)
  - Displays verification notes
  - Audio player for call recording
  - Approve/Reject buttons (only for operations_manager role)
- **Role-Based Actions:**
  - Call centre agents: Can verify only
  - Operations managers: Can approve/reject verified requests

## Pages

### Plus1 Upgrade Page

**Location:** `apps/frontend/src/app/plus1upgrade/page.tsx`

**Status:** CREATED

**Features:**
- Member mobile number search
- Current plan display (auto-populated)
- Upgraded plan dropdown (loads from products table)
- Upgrade summary
- Submit button

### Operations Call Centre Page

**Location:** `apps/frontend/src/app/operations/call-centre/page.tsx`

**Status:** ✅ IMPLEMENTED

**Features:**
- Sidebar with 3 tabs:
  1. **Member Upgrades** - Shows pending and verified upgrade requests
  2. Extra 1 (placeholder)
  3. Extra 2 (placeholder)
- Fetches upgrade requests with `includeMembers=true` for full member details
- Displays upgrade requests in cards with:
  - Member information
  - Upgrade summary (From → To)
  - Status badge (PENDING VERIFICATION / PENDING APPROVAL)
  - Action button:
    - "Start Verification Call" for pending requests
    - "Check Upgrade Verification" for verified requests
- Opens `UpgradeVerificationForm` modal for each request
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
- Upgrade request submitted by member
- Visible in BOTH Call Centre Dashboard (Member Support) AND Operations Dashboard (Call Centre)
- Waiting for call centre verification
- Operations manager can see and follow up if call centre is slow

**verified:**
- Call centre has verified the upgrade via phone call
- Verification notes and call recording added (recording is mandatory)
- Visible in Operations Dashboard (Call Centre) with "VERIFIED" badge
- Waiting for operations manager approval

**approved:**
- Operations manager has approved the upgrade
- Member record updated in both databases
- Member notified of upgrade

**rejected:**
- Upgrade request rejected (by call centre or operations manager)
- Rejection reason documented
- Member notified

## Notification Flow

**When member submits upgrade (Status: pending):**
- ✅ Appears in Call Centre Dashboard → Member Support tab
- ✅ Appears in Operations Dashboard → Call Centre tab
- ✅ Badge count on Call Centre sidebar button (Operations Dashboard)
- ✅ Count shown in Call Centre Queue card (Operations Dashboard)
- ✅ Badge count on Member Support button (Call Centre Dashboard)

**When call centre verifies (Status: verified):**
- ✅ Appears in Operations Dashboard → Call Centre tab with "VERIFIED" status
- ✅ Badge count updates on Call Centre sidebar button
- ✅ Shows verification details, notes, and call recording
- ✅ Ready for operations manager approval

This dual visibility ensures operations managers can monitor upgrade requests and follow up with call centre if needed, similar to how applications work.

## Business Rules

1. **Identity Verification Required** - Call centre must verify member identity before approval
2. **Call Recording Mandatory** - Call recording is REQUIRED (not optional) for insurance compliance
3. **Claim History Check** - Review recent claims to assess risk
4. **Payment Verification** - Payment continues through Plus1Rewards (no banking details needed)
5. **Waiting Periods** - Inform member of any waiting periods for new benefits
6. **Premium Increase** - Member must verbally consent to premium increase
7. **Database Sync** - Both Day1Main and Plus1Rewards databases must be updated
8. **Plus1 Status Active** - `plan_status` must be set to 'active' in Plus1Rewards (critical for all functionality)
9. **Update Order Critical** - Plus1Rewards MUST be updated BEFORE Day1Main to prevent data inconsistency
10. **Broker Code** - Must remain 'POR' (Plus1Rewards) after upgrade
11. **Dual Visibility** - Upgrade requests visible to both Call Centre and Operations simultaneously
12. **Operations Follow-up** - Operations manager can follow up with call centre if verification is delayed
13. **Role-Based Approval** - Only operations managers can approve; call centre can only verify

## Testing Checklist

When testing Plus1 upgrade flow:

1. ✅ Member can search by mobile number
2. ✅ Current plan displays correctly from Plus1 database
3. ✅ Available plans load from products table
4. ✅ Upgrade summary shows From → To correctly
5. ✅ Upgrade request saves to database
6. ✅ Call centre sees pending upgrade request
7. ✅ Verification form works correctly
8. ✅ Call recording uploads successfully
9. ✅ Status changes to 'verified' after verification
10. ✅ Operations manager can approve/reject
11. ✅ Plus1Rewards database updates FIRST on approval (with plan_status: 'active')
12. ✅ Member record updates in Day1Main on approval
13. ⬜ Member receives confirmation notification (TODO)
14. ⬜ Upgrade history is tracked (TODO)

## TODO List

### High Priority
- [x] Create `plus1_upgrade_requests` database table
- [x] Update `/api/plus1/upgrade` to save to database
- [x] Create `/api/plus1/upgrade-requests` GET endpoint
- [x] Create `/api/plus1/upgrade-requests/:id` PATCH endpoint
- [x] Integrate upgrade requests into call centre dashboard
- [x] Add verification workflow to call centre page
- [x] Add approval workflow for operations manager
- [x] Implement call recording upload to Supabase Storage
- [x] Implement role-based access (call centre vs operations manager)
- [x] Add verified information display for double verification
- [x] Update Plus1Rewards `plan_status` to 'active' on approval

### Medium Priority
- [ ] Add `verified_by`, `approved_by`, `rejected_by` user tracking
- [ ] Add email/SMS notifications for upgrade status changes
- [ ] Create upgrade history view for members
- [ ] Add upgrade analytics to operations dashboard

### Low Priority
- [ ] Add upgrade request search/filter
- [ ] Export upgrade requests to CSV
- [ ] Add upgrade request notes/comments
- [ ] Create upgrade request audit log

## Success Criteria

A successful Plus1 upgrade should:
1. ✅ Save upgrade request to database with status 'pending'
2. ✅ Notify call centre of pending request (dual visibility with operations)
3. ✅ Allow call centre to verify via phone and add notes
4. ✅ Require mandatory call recording upload
5. ✅ Change status to 'verified' after verification
6. ✅ Allow operations manager to approve/reject (not call centre)
7. ✅ Update Plus1Rewards database FIRST on approval (including plan_status: 'active')
8. ✅ Update member record in Day1Main database on approval
9. ⬜ Send confirmation to member (TODO)
10. ✅ Complete in under 48 hours from request to approval

## Monitoring

Watch for these log messages:

```
✅ Plus1 upgrade request submitted: [mobile]
✅ Upgrade request verified by: [agent]
✅ Upgrade approved for member: [member_number]
✅ Plus1 database updated: [mobile]
✅ Day1Main member updated: [member_number]
```

If you see:
```
❌ Failed to save upgrade request: ...
❌ Failed to update Plus1 database: ...
❌ Failed to update member record: ...
```

The upgrade will fail and should be retried or handled manually.

## Notes

- This process is specifically for Plus1Rewards members (broker code 'POR')
- Standard member upgrades follow a different process
- Payment continues through Plus1Rewards - no banking details needed
- Upgrades are subject to underwriting rules (waiting periods, pre-existing conditions)
- Member can only upgrade, not downgrade (business rule)

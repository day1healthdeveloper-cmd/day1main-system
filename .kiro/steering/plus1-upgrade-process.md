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

### Plus1 Plan Pricing Reference

**IMPORTANT:** Plus1 upgrades use a fixed set of plans with standard pricing. Use this reference table to populate `current_price` and `upgraded_price` columns in the `plus1_upgrade_requests` table.

| Plan Name | Monthly Premium | Notes |
|-----------|----------------|-------|
| Day-to-Day Plan | R385.00 | Default starter plan |
| Hospital Value Plus | R390.00 | Default hospital plan |
| Comprehensive - Value Plus | R665.00 | First upgrade option |

**Common Upgrade Paths:**
- Day-to-Day Plan (R385) → Comprehensive - Value Plus (R665) = **+R280/month**
- Hospital Value Plus (R390) → Comprehensive - Value Plus (R665) = **+R275/month**

**Implementation:**
When saving upgrade requests to `plus1_upgrade_requests` table:
1. Match `current_plan` name to get `current_price`
2. Match `upgraded_plan` name to get `upgraded_price`
3. Calculate premium increase: `upgraded_price - current_price`

This ensures consistent pricing in verification forms and approval workflows.

### Step 1: Member Submits Upgrade Request

**Route:** `/plus1upgrade`

**Process:**
1. Member enters Plus1 mobile number
2. System searches **Day1Main database** via `/api/plus1/search-member` to get current plan
3. System searches **Plus1Rewards database** to get upgraded plan (where `plan_status = 'pending_upgrade'`)
4. **Current plan auto-populated from Day1Main** (`members.plan_name`)
5. **Upgraded plan auto-populated from Plus1Rewards** (`members.cover_plan_name`)
6. System shows upgrade summary with **hardcoded pricing** from reference table
7. Member confirms upgrade request (no selection - pre-determined by Plus1)

**Data Flow:**
- **Current Plan:** Day1Main `members.plan_name` → Day-to-Day Plan (R385.00)
- **Upgraded Plan:** Plus1Rewards `members.cover_plan_name` → Comprehensive - Value Plus (R665.00)
- **Premium Increase:** R665.00 - R385.00 = **+R280.00/month**

**Submission:**
- POST to `/api/plus1/upgrade` with hardcoded pricing
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
7. Agent clicks "**Verify Upgrade Request**" (NOT approve - agents can only verify!)

**Status Change:**
- From: 'pending'
- To: 'verified'

**Data Added:**
- Verification notes (required)
- Call recording URL (required)
- Verified by (agent ID/name)
- Verified at (timestamp)

**Important:** 
- Call recording is MANDATORY for insurance compliance. The verify button is disabled until recording is uploaded.
- **Call centre agents can ONLY verify, NOT approve** - approval is done by operations manager only
- **View Brochure button** opens PDF via `/api/brochure?file=Comprehensive Value Plus Plan.pdf`

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

**Purpose:** Submit upgrade request with hardcoded pricing

**Implementation:**
- Uses **hardcoded pricing reference table** for consistent pricing
- Validates request data
- Saves upgrade request to `plus1_upgrade_requests` table with correct pricing:
  - `current_price`: Looked up from plan name (e.g., Day-to-Day Plan = 385.00)
  - `upgraded_price`: Looked up from plan name (e.g., Comprehensive - Value Plus = 665.00)
- Sets status to 'pending'
- Returns success with upgrade request ID

### GET `/api/plus1/upgrade-requests`

**Status:** ✅ IMPLEMENTED

**Purpose:** Fetch upgrade requests for call centre and operations dashboards

**Features:**
- Query `plus1_upgrade_requests` table with correct pricing values
- Filter by status (pending, verified, approved, rejected)
- Optional `includeMembers=true` parameter to fetch full member details
- Returns upgrade requests with member data, claims history, and plan benefits
- **Pricing now displays correctly:** +R280.00/month increase, R665.00 new premium

### PATCH `/api/plus1/upgrade-requests/[id]`

**Status:** ✅ IMPLEMENTED

**Purpose:** Update upgrade request status (verify, approve, reject)

**Actions:**

**1. Verify Action** (Call Centre Agent):
- Requires: `verification_notes`, `call_recording_url`
- Updates status to 'verified' (NOT approved!)
- Records `verified_at` timestamp
- TODO: Record `verified_by` user ID

**2. Approve Action** (Operations Manager ONLY):
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

**3. Reject Action** (Operations Manager ONLY):
- Requires: `rejection_reason`
- Updates status to 'rejected'
- Records `rejected_at` timestamp
- TODO: Record `rejected_by` user ID
- TODO: Send notification to member

**Important:** Call centre agents can ONLY verify - they cannot approve or reject upgrade requests.

### GET `/api/brochure`

**Status:** ✅ IMPLEMENTED

**Purpose:** Serve plan brochure PDFs securely

**Features:**
- Serves PDFs from `docs/cover plan brochures/` folder
- Security: Whitelist of allowed file names only
- Returns PDF with `Content-Type: application/pdf` and `Content-Disposition: inline`
- Opens in browser's built-in PDF viewer
- Example: `/api/brochure?file=Comprehensive Value Plus Plan.pdf`

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
  - Explain new plan benefits (View Brochure button shows inline collapsible PDF viewer)
  - Confirm member understands waiting periods
  - Confirm new monthly premium (shown in blue)
  - Check recent claim history
- **Plan Brochure Display:**
  - Inline collapsible PDF viewer (similar to application document display)
  - Toggle View/Hide Brochure button
  - Default height: 400px (readable preview)
  - Expand/Collapse: 400px ↔ 800px with smooth transitions
  - Blue border styling consistent with verification theme
  - Direct PDF serving from `/cover plan brochures/` folder
  - Plan-specific brochure mapping (Hospital Value Plus → Hospital Value Plus Plan.pdf)
  - Fallback download link for browsers without PDF support
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
13. **Role-Based Approval** - Only operations managers can approve or reject; call centre can only verify

## Testing Checklist

When testing Plus1 upgrade flow:

1. ✅ Member can search by mobile number
2. ✅ Current plan displays correctly from Day1Main database (Day-to-Day Plan)
3. ✅ Upgraded plan displays correctly from Plus1Rewards database (Comprehensive - Value Plus)
4. ✅ Pricing shows correctly: Current R385.00, Upgraded R665.00, Increase +R280.00
5. ✅ Upgrade summary shows From → To correctly with pricing
6. ✅ Upgrade request saves to database with correct `current_price` and `upgraded_price`
7. ✅ Call centre sees pending upgrade request with correct pricing
8. ✅ Verification form works correctly with proper button text ("Verify Upgrade Request")
9. ✅ Call recording uploads successfully
10. ✅ View Brochure button shows inline collapsible PDF viewer (400px ↔ 800px)
11. ✅ Plan brochure displays correctly with expand/collapse functionality
12. ✅ Status changes to 'verified' after verification (not approved!)
12. ✅ Operations manager can approve/reject (call centre cannot approve)
13. ✅ Plus1Rewards database updates FIRST on approval (with plan_status: 'active')
14. ✅ Member record updates in Day1Main on approval
15. ⬜ Member receives confirmation notification (TODO)
16. ⬜ Upgrade history is tracked (TODO)

## TODO List

### High Priority
- [x] Create `plus1_upgrade_requests` database table
- [x] Update `/api/plus1/upgrade` to save to database with hardcoded pricing
- [x] Create `/api/plus1/upgrade-requests` GET endpoint
- [x] Create `/api/plus1/upgrade-requests/:id` PATCH endpoint
- [x] Integrate upgrade requests into call centre dashboard
- [x] Add verification workflow to call centre page
- [x] Add approval workflow for operations manager
- [x] Implement call recording upload to Supabase Storage
- [x] Implement role-based access (call centre vs operations manager)
- [x] Add verified information display for double verification
- [x] Update Plus1Rewards `plan_status` to 'active' on approval
- [x] Fix pricing display with hardcoded reference table
- [x] Add brochure PDF viewer via `/api/brochure`
- [x] Correct button text: "Verify Upgrade Request" (not "Verify & Approve")
- [x] Fix database pricing values (current_price and upgraded_price)

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
1. ✅ Save upgrade request to database with status 'pending' and correct pricing
2. ✅ Notify call centre of pending request (dual visibility with operations)
3. ✅ Allow call centre to verify via phone and add notes (NOT approve!)
4. ✅ Require mandatory call recording upload
5. ✅ Change status to 'verified' after verification (call centre cannot approve)
6. ✅ Allow operations manager to approve/reject (not call centre)
7. ✅ Display correct pricing: +R280.00/month increase, R665.00 new premium
8. ✅ View Brochure button works via `/api/brochure` PDF viewer
9. ✅ Update Plus1Rewards database FIRST on approval (including plan_status: 'active')
10. ✅ Update member record in Day1Main database on approval
11. ⬜ Send confirmation to member (TODO)
12. ✅ Complete in under 48 hours from request to approval

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

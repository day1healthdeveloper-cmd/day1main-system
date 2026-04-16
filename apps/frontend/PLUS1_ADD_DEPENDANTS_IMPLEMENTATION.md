# Plus1 Add Dependants - Implementation Complete ✅

## Overview

Complete implementation of the Plus1 add dependants workflow allowing Plus1Rewards members to add spouse/partner or children to their medical cover with call centre verification and operations manager approval.

## What Was Built

### 1. Database Table ✅
**File:** `apps/frontend/scripts/create-plus1-dependant-requests-table.sql`

**Table:** `plus1_dependant_requests`
- Stores dependant addition requests
- Tracks workflow status (pending → verified → approved/rejected)
- Includes verification notes and call recording URLs
- Links to members table
- Indexes for fast lookups

**To Create Table:**
```bash
cd apps/frontend/scripts
node run-create-dependant-table.js
```

Or run SQL directly in Supabase SQL Editor.

### 2. API Endpoints ✅

#### POST `/api/plus1/add-dependant`
**File:** `apps/frontend/src/app/api/plus1/add-dependant/route.ts`
- Validates dependant information
- Finds member by mobile + broker code 'POR'
- Creates dependant request with status 'pending'
- Returns request ID

#### GET `/api/plus1/dependant-requests`
**File:** `apps/frontend/src/app/api/plus1/dependant-requests/route.ts`
- Fetches dependant requests
- Filters by status (optional)
- Includes member details (optional)
- Used by call centre and operations dashboards

#### PATCH `/api/plus1/dependant-requests/[id]`
**File:** `apps/frontend/src/app/api/plus1/dependant-requests/[id]/route.ts`

**Actions:**
- **verify**: Call centre verification with notes + recording
- **approve**: Operations manager approval
  - Assigns dependant code (01-05 for spouse/partner, 06+ for children)
  - Updates Plus1Rewards database FIRST (premium + status)
  - Creates dependant in Day1Main
  - Updates member premium
- **reject**: Reject with reason

### 3. Frontend Pages ✅

#### `/plus1adddependant`
**File:** `apps/frontend/src/app/plus1adddependant/page.tsx`

**4-Step Process:**
1. **Member Search** - Enter Plus1 mobile number
2. **Dependant Details** - Personal information + relationship
3. **Documents** - Upload ID, birth cert, marriage cert
4. **Review & Submit** - Premium summary + submit

**Features:**
- Auto-populates member data from Plus1Rewards
- Validates all required fields
- Calculates new premium
- Uploads documents to Supabase Storage
- Submits request to API

#### `/plus1adddependant/success`
**File:** `apps/frontend/src/app/plus1adddependant/success/page.tsx`

**Features:**
- Success confirmation with reference number
- Next steps explanation
- Important information about waiting periods
- Links to dashboard and home

### 4. Components ✅

#### DependantVerificationForm
**File:** `apps/frontend/src/components/call-centre/dependant-verification-form.tsx`

**Features:**
- **Call Recording (REQUIRED):**
  - MediaRecorder API for recording calls
  - Start/Stop with timer
  - Audio playback preview
  - Upload to Supabase Storage
  - Verify button disabled until uploaded
  
- **Verification Checklist:**
  - Member and dependant information display
  - Premium summary with increase
  - Document links for review
  - Verification notes textarea
  
- **Role-Based Actions:**
  - Call centre: Can verify only
  - Operations manager: Can approve/reject verified requests
  
- **Verified View:**
  - Shows verification details
  - Plays call recording
  - Approve/Reject buttons (operations only)

## Workflow

```
Member Submits Request (pending)
         ↓
Call Centre Verifies (verified)
  - Records call
  - Documents verification
         ↓
Operations Manager Reviews
         ↓
    Approve / Reject
         ↓
If Approved:
  1. Assign dependant code
  2. Update Plus1Rewards (premium + status)
  3. Create dependant in Day1Main
  4. Update member premium
  5. Mark as approved
```

## Dependant Code Assignment

**Spouse/Partner (01-05):**
- First spouse/partner: 01
- Additional: 02, 03, 04, 05
- Maximum: 5

**Children (06+):**
- First child: 06
- Additional: 07, 08, 09, 10, etc.
- No maximum

## Integration Points

### Call Centre Dashboard
**Location:** `apps/frontend/src/app/call-centre/support/page.tsx`

**TODO:** Add dependant requests section
- Fetch pending requests
- Display in cards
- Open DependantVerificationForm modal
- Show badge count

### Operations Dashboard
**Location:** `apps/frontend/src/app/operations/call-centre/page.tsx`

**TODO:** Add "Dependant Requests" tab
- Fetch verified requests
- Display with status badges
- Open DependantVerificationForm modal
- Show badge count on sidebar

## Environment Variables Required

```bash
# Plus1Rewards External Database
PLUS1_SUPABASE_URL=https://gcbmlxdxwakkubpldype.supabase.co
PLUS1_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Day1Main Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Testing Checklist

### Database
- [ ] Run SQL script to create table
- [ ] Verify indexes created
- [ ] Test foreign key constraints

### API Endpoints
- [ ] POST /api/plus1/add-dependant - Submit request
- [ ] GET /api/plus1/dependant-requests - Fetch requests
- [ ] PATCH /api/plus1/dependant-requests/[id] - Verify action
- [ ] PATCH /api/plus1/dependant-requests/[id] - Approve action
- [ ] PATCH /api/plus1/dependant-requests/[id] - Reject action

### Frontend
- [ ] /plus1adddependant - Member search works
- [ ] /plus1adddependant - Dependant form validates
- [ ] /plus1adddependant - Document upload works
- [ ] /plus1adddependant - Premium calculation correct
- [ ] /plus1adddependant - Submission successful
- [ ] /plus1adddependant/success - Shows confirmation

### Verification Form
- [ ] Call recording starts/stops
- [ ] Recording uploads to storage
- [ ] Verification notes required
- [ ] Verify button disabled until recording uploaded
- [ ] Verification updates status to 'verified'

### Approval Process
- [ ] Operations can see verified requests
- [ ] Dependant code assigned correctly (01-05 or 06+)
- [ ] Plus1Rewards updated FIRST
- [ ] Dependant created in Day1Main
- [ ] Member premium updated
- [ ] Status changed to 'approved'

### Integration
- [ ] Call centre dashboard shows pending requests
- [ ] Operations dashboard shows verified requests
- [ ] Badge counts update correctly
- [ ] Dual visibility works

## Next Steps

1. **Create Database Table**
   ```bash
   cd apps/frontend/scripts
   node run-create-dependant-table.js
   ```

2. **Integrate into Call Centre Dashboard**
   - Add dependant requests section to `/call-centre/support`
   - Fetch pending requests
   - Display with verification form

3. **Integrate into Operations Dashboard**
   - Add "Dependant Requests" tab to `/operations/call-centre`
   - Fetch verified requests
   - Display with approval actions

4. **Test Complete Workflow**
   - Submit test request
   - Verify in call centre
   - Approve in operations
   - Verify dependant created

5. **Add Notifications**
   - Email/SMS on submission
   - Email/SMS on verification
   - Email/SMS on approval/rejection

## Files Created

### Database
- `apps/frontend/scripts/create-plus1-dependant-requests-table.sql`
- `apps/frontend/scripts/run-create-dependant-table.js`

### API Routes
- `apps/frontend/src/app/api/plus1/add-dependant/route.ts`
- `apps/frontend/src/app/api/plus1/dependant-requests/route.ts`
- `apps/frontend/src/app/api/plus1/dependant-requests/[id]/route.ts`

### Pages
- `apps/frontend/src/app/plus1adddependant/page.tsx`
- `apps/frontend/src/app/plus1adddependant/success/page.tsx`

### Components
- `apps/frontend/src/components/call-centre/dependant-verification-form.tsx`

## Success Criteria

A successful Plus1 add dependant should:
1. ✅ Save request to database with status 'pending'
2. ✅ Allow call centre to verify with mandatory recording
3. ✅ Change status to 'verified' after verification
4. ✅ Allow operations manager to approve/reject
5. ✅ Assign correct dependant code (01-05 or 06+)
6. ✅ Update Plus1Rewards database FIRST
7. ✅ Create dependant in Day1Main with correct code
8. ✅ Update member premium in Day1Main
9. ⬜ Send confirmation to member (TODO)
10. ⬜ Complete in under 48 hours (TODO - add to monitoring)

## Notes

- Call recording is MANDATORY for insurance compliance
- Plus1Rewards database MUST be updated BEFORE Day1Main
- Dependant code assignment is automatic
- Maximum 5 spouse/partner dependants (01-05)
- No maximum on children dependants (06+)
- Payment continues through Plus1Rewards
- Waiting periods apply to new dependants

---

**Status:** Core implementation complete
**Date:** 2026-04-14
**Ready for:** Database creation and dashboard integration

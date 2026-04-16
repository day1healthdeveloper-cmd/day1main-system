# Claim Lifecycle Test Plan

## Overview

This document outlines the comprehensive testing plan for the Day1Health claims system. The system is 95% complete with core functionality implemented including claims submission, eligibility verification, benefit tracking, adjudication, and payment processing.

**Status:** Ready for testing  
**Last Updated:** 2026-04-16  
**System Completion:** 95%

---

## Provider Network Summary

### Total Providers: 1,916 (All Active)

**Provider Breakdown:**
- **GP (General Practitioners):** 1,170 (61%)
- **Dentist:** 746 (39%)

**Provider Tier:** Network providers (100% tariff rate)

**Geographic Coverage:** Nationwide (Eastern Cape, Western Cape, North West, etc.)

---

## Test Plan Structure

### Phase 1: Provider Portal Testing 🏥

**Objective:** Test provider claims submission and tracking

**Test Cases:**

#### 1.1 Provider Login
- [ ] Select test provider from database
- [ ] Login with provider credentials
- [ ] Verify dashboard loads correctly
- [ ] Check provider information display

#### 1.2 Eligibility Verification
- [ ] Search member by member number
- [ ] Search member by ID number
- [ ] Verify eligibility response shows:
  - Member status (active/suspended)
  - Plan details
  - Waiting periods (general, specialist, hospital, maternity)
  - Benefit limits and usage
  - Remaining benefits
- [ ] Test with inactive member (should fail)
- [ ] Test with non-existent member (should fail)

#### 1.3 GP Consultation Claim Submission
- [ ] Select claim type: "consultation"
- [ ] Enter member details
- [ ] Enter service date (within last 4 months)
- [ ] Enter diagnosis code (ICD-10)
- [ ] Enter procedure code
- [ ] Enter tariff code
- [ ] Enter claimed amount (e.g., R500)
- [ ] Upload supporting documents (optional)
- [ ] Submit claim
- [ ] Verify claim number generated (format: CLM-YYYYMMDD-XXXXXX)
- [ ] Check auto-approval (if amount ≤ benefit limit)
- [ ] Verify claim appears in provider dashboard

#### 1.4 Dental Claim Submission
- [ ] Select claim type: "dental"
- [ ] Enter member details
- [ ] Enter service date
- [ ] Enter diagnosis and procedure codes
- [ ] Enter claimed amount (e.g., R1,500)
- [ ] Upload supporting documents
- [ ] Submit claim
- [ ] Verify claim status (auto-approved or pending review)

#### 1.5 High-Value Claim (Manual Review)
- [ ] Submit claim with amount > R10,000
- [ ] Verify status = "pending" (manual review required)
- [ ] Verify claim appears in claims assessor queue

#### 1.6 Claims History
- [ ] View provider claims history
- [ ] Filter by status (pending, approved, rejected, paid)
- [ ] Filter by date range
- [ ] Search by claim number
- [ ] Search by member number
- [ ] Verify statistics display correctly

#### 1.7 Payment Tracking
- [ ] View approved claims
- [ ] Check payment status
- [ ] Verify payment reference
- [ ] Check payment date

---

### Phase 2: Member Claims Testing 👤

**Objective:** Test member refund claims submission

**Test Cases:**

#### 2.1 Member Login
- [ ] Login as test member
- [ ] Verify member dashboard loads
- [ ] Check member information display

#### 2.2 Refund Claim Submission
- [ ] Navigate to "Submit Claim" page
- [ ] Select claim type (GP visit, dental, optical, etc.)
- [ ] Enter service date
- [ ] Enter provider details (if out-of-network)
- [ ] Enter claimed amount
- [ ] Upload invoice/receipt (required)
- [ ] Upload prescription (if applicable)
- [ ] Submit claim
- [ ] Verify claim number generated
- [ ] Verify claim appears in member dashboard

#### 2.3 Claim Status Tracking
- [ ] View submitted claims
- [ ] Check claim status (pending, approved, rejected, paid)
- [ ] View claim details
- [ ] Check rejection reason (if rejected)
- [ ] View payment information (if approved)

#### 2.4 Benefit Usage Tracking
- [ ] View annual benefit usage
- [ ] Check GP visits used/remaining
- [ ] Check dental benefit used/remaining
- [ ] Check optical benefit used/remaining
- [ ] Verify usage updates after claim approval

---

### Phase 3: Claims Assessor Testing 👨‍⚕️

**Objective:** Test claims adjudication workflow

**Test Cases:**

#### 3.1 Claims Assessor Login
- [ ] Login as claims assessor
- [ ] Verify claims queue loads
- [ ] Check pending claims count

#### 3.2 Claim Review
- [ ] Select pending claim from queue
- [ ] View claim details:
  - Member information
  - Provider information
  - Service date
  - Diagnosis and procedure codes
  - Claimed amount
  - Supporting documents
- [ ] View member's claim history
- [ ] Check benefit usage for the year
- [ ] Review fraud alerts (if any)

#### 3.3 Benefit Calculator
- [ ] Open benefit calculator
- [ ] Verify calculation breakdown:
  - Tariff rate application (100% network, 80% out-of-network)
  - Co-payment calculation
  - PMB rules application
  - Final approved amount
- [ ] Check amount validation warnings
- [ ] Check fraud risk score

#### 3.4 Claim Approval
- [ ] Select "Approve" action
- [ ] Enter approved amount (from calculator)
- [ ] Add approval notes (optional)
- [ ] Submit approval
- [ ] Verify claim status changes to "approved"
- [ ] Verify benefit usage updates
- [ ] Verify audit trail entry created
- [ ] Verify processing time recorded

#### 3.5 Claim Rejection
- [ ] Select "Reject" action
- [ ] Choose rejection code from library (60 codes available)
- [ ] Enter rejection reason
- [ ] Submit rejection
- [ ] Verify claim status changes to "rejected"
- [ ] Verify rejection reason saved
- [ ] Verify audit trail entry created

#### 3.6 Claim Pend (Request Additional Info)
- [ ] Select "Pend" action
- [ ] Choose pend reason (12 options available)
- [ ] Specify additional information requested
- [ ] Submit pend
- [ ] Verify claim status changes to "pended"
- [ ] Verify pend reason saved

#### 3.7 Fraud Detection
- [ ] Review claims with fraud alerts
- [ ] Check fraud risk score (0-100)
- [ ] Review fraud indicators:
  - Duplicate claims
  - High-frequency claims
  - Unusual submission times
  - Amount anomalies
- [ ] Assign to fraud reviewer (if needed)

---

### Phase 4: Finance Testing 💰

**Objective:** Test payment processing and batch generation

**Test Cases:**

#### 4.1 Finance Dashboard
- [ ] Login as finance user
- [ ] View payment batches dashboard
- [ ] Check pending payments count
- [ ] View payment statistics

#### 4.2 Payment Batch Generation
- [ ] Navigate to "Generate Payment Batch"
- [ ] Select date range
- [ ] Select batch type (provider/member_refund/mixed)
- [ ] Preview claims to be included
- [ ] Verify total claims count
- [ ] Verify total amount
- [ ] Generate batch
- [ ] Verify batch number generated (format: BATCH-YYYYMMDD-XXX)
- [ ] Verify batch status = "draft"

#### 4.3 Batch Review
- [ ] Open generated batch
- [ ] Review included claims
- [ ] Check payment details:
  - Payee name
  - Bank details
  - Payment amount
- [ ] Verify total calculations
- [ ] Check for duplicate payments

#### 4.4 Batch Approval
- [ ] Select "Approve Batch" action
- [ ] Verify approval confirmation
- [ ] Submit approval
- [ ] Verify batch status changes to "approved"
- [ ] Verify approved_by and approved_at recorded

#### 4.5 EFT File Generation
- [ ] Select approved batch
- [ ] Click "Generate EFT File"
- [ ] Verify EFT file generated (NAEDO format)
- [ ] Download EFT file
- [ ] Verify file format:
  - Header record
  - Transaction records (one per payment)
  - Trailer record
- [ ] Verify file naming convention
- [ ] Verify file stored in Supabase Storage

#### 4.6 Payment Status Tracking
- [ ] Mark batch as "processing"
- [ ] Update individual payment statuses
- [ ] Mark payments as "paid"
- [ ] Record payment dates
- [ ] Record payment references
- [ ] Verify claim status updates to "paid"

#### 4.7 Payment Reconciliation
- [ ] View completed batches
- [ ] Check payment success rate
- [ ] Review failed payments
- [ ] Check failure reasons
- [ ] Generate payment report

---

### Phase 5: End-to-End Flow Testing 🔄

**Objective:** Test complete claim lifecycle from submission to payment

**Test Scenarios:**

#### Scenario A: Simple GP Claim (Auto-Approved)
1. **Provider submits claim:**
   - Member: Active member with benefits available
   - Claim type: GP consultation
   - Amount: R500 (within benefit limit)
   - Expected: Auto-approved immediately

2. **Verify auto-approval:**
   - Status: "approved"
   - Approved amount: R500
   - Processing time: < 5 seconds
   - Benefit usage updated

3. **Finance processes payment:**
   - Claim included in next payment batch
   - Batch approved
   - EFT file generated
   - Payment status: "paid"

4. **Provider receives payment:**
   - Payment reference recorded
   - Payment date recorded
   - Provider can view payment in dashboard

**Expected Duration:** Same day (if batch runs daily)

---

#### Scenario B: Dental Claim (Manual Review)
1. **Member submits refund claim:**
   - Claim type: Dental treatment
   - Amount: R2,500
   - Documents: Invoice, receipt
   - Expected: Pending manual review

2. **Claims assessor reviews:**
   - Reviews claim details
   - Checks benefit usage (R2,000 annual limit)
   - Uses benefit calculator
   - Approves R2,000 (limit reached)
   - Rejects R500 (exceeds limit)

3. **Member notified:**
   - Status: "approved"
   - Approved amount: R2,000
   - Rejection reason: "Annual limit reached"

4. **Finance processes payment:**
   - Payment to member bank account
   - EFT file generated
   - Payment completed

**Expected Duration:** 1-2 business days

---

#### Scenario C: High-Value Hospital Claim (Pre-Auth Required)
1. **Provider submits claim:**
   - Claim type: Hospital admission
   - Amount: R50,000
   - Pre-auth required: Yes
   - Expected: Pending review

2. **Claims assessor reviews:**
   - Verifies pre-authorization number
   - Checks hospital benefit limit
   - Reviews diagnosis codes (ICD-10)
   - Checks PMB status
   - Approves claim

3. **Finance processes payment:**
   - High-value payment requires additional approval
   - Batch approved by finance manager
   - EFT file generated
   - Payment completed

**Expected Duration:** 3-5 business days (statutory 30-day limit)

---

#### Scenario D: Fraudulent Claim (Rejected)
1. **Provider submits claim:**
   - Duplicate claim detected (same member, date, amount)
   - Fraud risk score: 80 (high)
   - Expected: Flagged for fraud review

2. **Fraud reviewer investigates:**
   - Reviews claim history
   - Checks provider fraud score
   - Confirms duplicate
   - Rejects claim

3. **Provider notified:**
   - Status: "rejected"
   - Rejection code: R41 (Duplicate claim)
   - Rejection reason: "Duplicate claim submitted"

4. **Fraud alert recorded:**
   - Provider fraud score increased
   - Alert logged for monitoring

**Expected Duration:** 1-2 business days

---

## Testing Checklist

### Pre-Testing Setup
- [ ] Verify database has test data:
  - Active members with various plans
  - Providers (GPs and Dentists)
  - Product benefits configured
- [ ] Verify test user accounts:
  - Provider user
  - Member user
  - Claims assessor user
  - Finance user
- [ ] Verify environment variables configured
- [ ] Verify Supabase Storage buckets exist

### During Testing
- [ ] Document all test results
- [ ] Screenshot key screens
- [ ] Record any errors or issues
- [ ] Note performance (response times)
- [ ] Check browser console for errors
- [ ] Verify email/SMS notifications (if implemented)

### Post-Testing
- [ ] Review test results
- [ ] Document bugs found
- [ ] Prioritize fixes
- [ ] Retest after fixes
- [ ] Update documentation

---

## Success Criteria

### Functional Requirements
- ✅ Claims can be submitted by providers and members
- ✅ Eligibility verification returns accurate data
- ✅ Auto-approval works for simple claims
- ✅ Manual review queue works correctly
- ✅ Benefit calculator provides accurate amounts
- ✅ Rejection codes library is accessible
- ✅ Payment batches can be generated
- ✅ EFT files are generated correctly
- ✅ Payment tracking works end-to-end

### Performance Requirements
- ✅ Eligibility check: < 2 seconds
- ✅ Claim submission: < 5 seconds
- ✅ Auto-approval: < 5 seconds
- ✅ Manual review: < 24 hours
- ✅ Payment processing: < 7 days

### Business Requirements
- ✅ Statutory 30-day payment requirement met
- ✅ Fraud detection identifies suspicious claims
- ✅ Audit trail captures all actions
- ✅ Benefit limits enforced correctly
- ✅ Waiting periods validated

---

## Known Limitations

### Not Yet Implemented (5% Remaining)
1. **Pre-Authorization System:**
   - GOP (Guarantee of Payment) issuance
   - Pre-auth approval workflow
   - Pre-auth tracking
   - GOP validation on claims

2. **Notifications:**
   - Email notifications (claim status changes)
   - SMS notifications (payment confirmations)
   - Provider payment notifications

3. **Multi-Line Claims:**
   - `claim_lines` table (not created)
   - Support for multiple procedures per claim
   - Line-by-line adjudication

4. **Advanced Features:**
   - Claim appeals workflow
   - Claim amendments
   - Bulk claim upload
   - Provider performance analytics

---

## Test Data Requirements

### Test Members
- **Member 1:** Active, Day to Day plan, no claims history
- **Member 2:** Active, Platinum plan, some claims history
- **Member 3:** Active, benefits nearly exhausted
- **Member 4:** Suspended (for negative testing)

### Test Providers
- **Provider 1:** GP, network tier, good standing
- **Provider 2:** Dentist, network tier, good standing
- **Provider 3:** GP, high fraud score (for fraud testing)

### Test Claims
- **Simple GP claim:** R500, auto-approve
- **Dental claim:** R1,500, manual review
- **High-value claim:** R15,000, manual review
- **Duplicate claim:** For fraud detection testing
- **Out-of-benefit claim:** Exceeds annual limit

---

## Reporting

### Test Report Template

**Test Date:** [Date]  
**Tester:** [Name]  
**Environment:** [Development/Staging/Production]

**Test Results:**
- Total test cases: [X]
- Passed: [X]
- Failed: [X]
- Blocked: [X]

**Issues Found:**
1. [Issue description]
   - Severity: [Critical/High/Medium/Low]
   - Steps to reproduce
   - Expected vs Actual result
   - Screenshots

**Performance Metrics:**
- Average claim submission time: [X] seconds
- Average eligibility check time: [X] seconds
- Average adjudication time: [X] hours

**Recommendations:**
- [List of recommendations]

---

## Next Steps After Testing

1. **Fix Critical Bugs:** Address any blocking issues
2. **Optimize Performance:** Improve slow queries/operations
3. **Add Notifications:** Implement email/SMS notifications
4. **Build Pre-Auth System:** Complete remaining 5%
5. **User Training:** Train staff on system usage
6. **Go Live:** Deploy to production

---

## Contact

For questions or issues during testing:
- **Technical Lead:** [Name]
- **Product Owner:** [Name]
- **Support:** admin@day1.co.za

---

**Document Version:** 1.0  
**Last Updated:** 2026-04-16  
**Status:** Ready for Testing

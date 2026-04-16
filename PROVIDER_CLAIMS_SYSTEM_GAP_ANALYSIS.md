# Provider Claims System - Gap Analysis & Delivery Roadmap

**Date:** April 15, 2026  
**Assessment:** Day1Main Provider Claims System Readiness  
**Scope:** Excluding WhatsApp integration (future phase)

---

## Executive Summary

**Current State:** 40% complete - UI exists, backend missing  
**Estimated Completion:** 4-6 weeks for MVP  
**Recommendation:** BUILD custom claims engine (not buy)

### What We Have ✅
- **Provider Portal UI** - Fully built and styled
- **Claims Database Schema** - Comprehensive table structure
- **Member/Provider Data** - 2,330 members, 1,919 providers
- **Product/Benefits Data** - 10 plans with 99 detailed benefits
- **Authentication System** - Provider login infrastructure

### What's Missing ❌
- **All Backend APIs** - No claim submission, eligibility, or adjudication
- **Claims Adjudication Engine** - No auto-approval logic
- **Benefit Tracking** - No usage tracking against limits
- **Pre-Authorization Workflow** - Not implemented
- **Payment Tracking** - No payment reconciliation

---

## Detailed Gap Analysis

### 1. Provider Portal Frontend (✅ 95% Complete)

#### Claims Submission Page (`/provider/claims/submit`)
**Status:** ✅ Fully Built

**Features:**
- Patient information capture (member number, ID, name)
- Service date and claim type selection
- Multi-line claim entry (diagnosis, procedure, tariff codes)
- Quantity and unit price calculation
- Document upload (invoices, prescriptions)
- Total calculation
- Form validation

**Missing:**
- Backend API endpoint (`/api/provider/claims/submit`)
- Actual claim submission logic
- Response handling for approval/rejection

#### Eligibility Check Page (`/provider/eligibility`)
**Status:** ✅ Fully Built

**Features:**
- Member search by member number or ID
- Member information display
- Policy details display
- Coverage summary with annual limits
- Benefit details table
- Waiting period status
- Pre-auth requirements display
- Dependant list

**Missing:**
- Backend API endpoint (`/api/provider/eligibility`)
- Real-time eligibility verification
- Benefit usage calculation
- Waiting period validation

#### Provider Dashboard (`/provider/dashboard`)
**Status:** ✅ Fully Built

**Features:**
- Statistics cards (claims count, pending, approved amounts)
- Quick action buttons
- Recent claims list
- Monthly summary
- Payment summary

**Missing:**
- Backend API endpoint (`/api/provider/claims`)
- Real claims data (currently shows placeholder/empty)
- Statistics calculation

---

### 2. Database Schema (✅ 90% Complete)

#### Claims Table
**Status:** ✅ Exists with comprehensive schema

**Columns:**
- `id`, `claim_number`, `member_id`, `provider_id`
- `service_date`, `submission_date`, `claim_type`
- `claimed_amount`, `approved_amount`, `status`
- `icd10_codes[]`, `tariff_codes[]`
- `pre_auth_number`, `pre_auth_required`, `is_pmb`
- `benefit_type`, `rejection_code`, `rejection_reason`
- `pended_reason`, `pended_date`, `additional_info_requested`
- `approved_by`, `approved_at`, `paid_date`, `payment_reference`
- `fraud_alert_triggered`, `fraud_risk_score`, `fraud_review_status`
- `appeal_status`, `appeal_date`, `appeal_notes`
- `processing_time_hours`, `claim_source`, `submission_method`

**Missing:**
- Claim lines table (for multi-line claims)
- Benefit usage tracking table
- Pre-authorization table

#### Supporting Tables
**Status:** ✅ Exist

- `claim_documents` - Document storage
- `claim_audit_trail` - Audit logging
- `provider_fraud_alerts` - Fraud detection
- `tariff_codes` - Tariff code reference (empty)
- `pmb_conditions` - PMB conditions (empty)
- `chronic_conditions` - Chronic conditions (empty)

**Missing:**
- `claim_lines` table for multi-line claims
- `benefit_usage` table for tracking limits
- `pre_authorizations` table
- Data in tariff_codes, pmb_conditions, chronic_conditions

---

### 3. Backend APIs (❌ 0% Complete)

#### Critical APIs Needed

**1. POST `/api/provider/claims/submit`**
**Status:** ❌ Not Implemented

**Required Functionality:**
- Validate provider authentication
- Verify member eligibility
- Check benefit limits and usage
- Validate waiting periods
- Check pre-auth requirements
- Auto-adjudicate simple claims (GP visits, dental, etc.)
- Create claim record in database
- Create claim lines records
- Upload supporting documents
- Return instant approval/rejection for simple claims
- Queue complex claims for manual review
- Send notifications to member and provider

**Estimated Effort:** 1-2 weeks

---

**2. POST `/api/provider/eligibility`**
**Status:** ❌ Not Implemented

**Required Functionality:**
- Search member by member_number or id_number
- Verify member status (active/suspended/cancelled)
- Fetch member plan details
- Calculate benefit usage (used vs remaining)
- Check waiting periods (general, specialist, hospital)
- Identify pre-auth requirements
- Return dependant information
- Return recent claim history

**Estimated Effort:** 1 week

---

**3. GET `/api/provider/claims`**
**Status:** ❌ Not Implemented

**Required Functionality:**
- Fetch provider's claim history
- Filter by status, date range, member
- Calculate statistics (total, pending, approved, paid)
- Return claim details with member info
- Support pagination

**Estimated Effort:** 3-4 days

---

**4. GET `/api/provider/claims/[id]`**
**Status:** ❌ Not Implemented

**Required Functionality:**
- Fetch single claim details
- Include claim lines
- Include documents
- Include audit trail
- Include member and provider info

**Estimated Effort:** 2-3 days

---

### 4. Claims Adjudication Engine (❌ 0% Complete)

**Status:** ❌ Not Implemented

**Required Components:**

#### A. Benefit Limit Validation
- Check annual limits per benefit type
- Track usage across claims
- Calculate remaining benefits
- Handle family vs individual limits

#### B. Waiting Period Validation
- General waiting period (3 months)
- Specialist waiting period (3 months)
- Hospital waiting period (3 months)
- Maternity waiting period (12 months)
- Pre-existing condition exclusions (12 months)

#### C. Auto-Approval Rules
**Simple Claims (Auto-Approve):**
- GP consultations (within limit)
- Dental visits (within limit)
- Optical benefits (within limit)
- Pharmacy claims (within limit)
- Pathology tests (within limit)
- Radiology (within limit)

**Complex Claims (Manual Review):**
- Hospital admissions
- Specialist procedures
- High-value claims (>R10,000)
- Claims requiring pre-auth
- PMB claims
- Claims with fraud flags

#### D. Fraud Detection Rules
- Duplicate claim detection
- Unusual claim patterns
- High-frequency claims
- Provider risk scoring
- Member risk scoring

**Estimated Effort:** 3-4 weeks

---

### 5. Pre-Authorization Workflow (❌ 0% Complete)

**Status:** ❌ Not Implemented

**Required Functionality:**
- Pre-auth request submission
- Pre-auth approval workflow
- Link pre-auth to claims
- Pre-auth expiry tracking
- Pre-auth usage tracking

**Estimated Effort:** 2-3 weeks

---

### 6. Payment Tracking (❌ 0% Complete)

**Status:** ❌ Not Implemented

**Required Functionality:**
- Payment batch creation
- Payment reconciliation
- Payment status tracking
- Provider payment history
- Payment notifications

**Estimated Effort:** 2-3 weeks

---

## Plan Complexity Analysis

### Day1Health Plans (10 Total)

**Hospital Plans (3):**
1. Hospital Value Plus Plan
2. Hospital Platinum Plan
3. Hospital Executive Plan

**Comprehensive Plans (3):**
4. Comprehensive Value Plus Plan
5. Comprehensive Platinum Plan
6. Comprehensive Executive Plan

**Day-to-Day Plans (1):**
7. Day to Day Plan

**Senior Plans (3):**
8. Senior Hospital Plan
9. Senior Comprehensive Plan
10. Senior Day to Day Plan

### Benefit Structure Complexity: ⭐⭐ (Simple)

**Characteristics:**
- Fixed amounts per benefit (e.g., R500 per GP visit)
- Clear annual limits (e.g., 5 GP visits per year)
- Straightforward waiting periods (3, 6, 12 months)
- No complex co-payments or deductibles
- No tiered pricing based on provider
- No complex formularies

**Example Benefits:**
- GP Visits: R500 per visit, 5 visits per year, 3-month waiting period
- Dental: R2,000 per year, 3-month waiting period
- Optical: R1,500 per year, 3-month waiting period
- Hospital: R50,000 per admission, 3-month waiting period

**Conclusion:** These plans are MUCH simpler than typical medical schemes. Rules are straightforward business logic, not complex algorithms.

---

## Build vs Buy Analysis

### Option 1: Build Custom Claims Engine

**Pros:**
- Plans are simple - rules are straightforward
- Full control over features and timeline
- No ongoing licensing fees
- Can iterate quickly
- Tailored to Day1Health needs
- No vendor lock-in

**Cons:**
- Initial development time (4-6 weeks)
- Need to build fraud detection
- Need to maintain and update

**Cost Estimate:**
- Development: R400,000 - R600,000 (Year 1)
- Maintenance: R100,000 - R150,000 per year
- Total 3-Year Cost: R600,000 - R900,000

---

### Option 2: Use Switching Company (Medikredit/Healthbridge)

**Pros:**
- Established infrastructure
- Built-in fraud detection
- Compliance built-in
- Provider network connectivity

**Cons:**
- High setup fees (R200,000 - R500,000)
- Per-transaction fees (R5 - R15 per claim)
- Monthly fees (R20,000 - R50,000)
- Vendor lock-in
- Less control over features
- Slower iteration
- May not support simple plan structure well

**Cost Estimate:**
- Setup: R200,000 - R500,000
- Monthly: R20,000 - R50,000 (R240,000 - R600,000/year)
- Per-transaction: R5 - R15 × 10,000 claims/month = R50,000 - R150,000/month (R600,000 - R1,800,000/year)
- Total Year 1: R440,000 - R780,000
- Total Year 2-3: R340,000 - R580,000/year
- Total 3-Year Cost: R1,120,000 - R1,940,000

---

### Recommendation: BUILD ✅

**Reasons:**
1. **Plans are simple** - Fixed amounts, clear limits, straightforward rules
2. **Cost savings** - 40-50% cheaper over 3 years
3. **Full control** - Can iterate quickly, add features as needed
4. **No vendor lock-in** - Own the system
5. **Already 40% done** - UI built, database designed
6. **Small scale** - 2,330 members, manageable claim volume

**When to reconsider:**
- If member base grows to 50,000+
- If plans become significantly more complex
- If fraud becomes a major issue
- If need to connect to 100+ external providers

---

## Delivery Roadmap

### Phase 1: Core APIs (CRITICAL) - 2-3 Weeks

**Week 1-2:**
1. ✅ Create `claim_lines` table
2. ✅ Create `benefit_usage` table
3. ✅ Build `/api/provider/eligibility` endpoint
   - Member search and verification
   - Benefit usage calculation
   - Waiting period validation
   - Return comprehensive eligibility data
4. ✅ Build `/api/provider/claims` GET endpoint
   - Fetch provider claim history
   - Calculate statistics
   - Support filtering and pagination

**Week 2-3:**
5. ✅ Build `/api/provider/claims/submit` endpoint
   - Validate member eligibility
   - Check benefit limits
   - Validate waiting periods
   - Create claim and claim lines
   - Upload documents
   - Return instant response
6. ✅ Build `/api/provider/claims/[id]` endpoint
   - Fetch single claim details
   - Include all related data

**Deliverable:** Providers can submit claims and check eligibility

---

### Phase 2: Claims Adjudication Engine - 3-4 Weeks

**Week 4-5:**
1. ✅ Build benefit limit tracking system
   - Track usage per benefit type
   - Calculate remaining benefits
   - Handle annual resets
2. ✅ Implement waiting period validation
   - Calculate waiting period completion
   - Check pre-existing conditions
   - Return clear status messages
3. ✅ Create auto-approval rules for simple claims
   - GP visits
   - Dental
   - Optical
   - Pharmacy
   - Pathology
   - Radiology

**Week 6-7:**
4. ✅ Build manual review queue for complex claims
   - Hospital admissions
   - Specialist procedures
   - High-value claims
   - Pre-auth required claims
5. ✅ Implement basic fraud detection rules
   - Duplicate claim detection
   - Unusual patterns
   - High-frequency claims
6. ✅ Build claims assessor dashboard
   - View pending claims
   - Approve/reject claims
   - Add notes and reasons
   - Track processing time

**Deliverable:** Claims are auto-adjudicated or queued for review

---

### Phase 3: Pre-Authorization - 2-3 Weeks

**Week 8-9:**
1. ✅ Create `pre_authorizations` table
2. ✅ Build `/api/provider/preauth/submit` endpoint
3. ✅ Build pre-auth approval workflow
4. ✅ Link pre-auth to claims
5. ✅ Build pre-auth tracking dashboard

**Deliverable:** Providers can request and track pre-authorizations

---

### Phase 4: Payment Tracking - 2-3 Weeks

**Week 10-11:**
1. ✅ Build payment batch creation
2. ✅ Build payment reconciliation
3. ✅ Build provider payment dashboard
4. ✅ Implement payment notifications

**Deliverable:** Providers can track payments

---

### Phase 5: Enhancements - Ongoing

**Future Features:**
- Advanced fraud detection (ML-based)
- Provider performance analytics
- Member claim history portal
- Bulk claim upload
- API for practice management systems
- WhatsApp bot integration

---

## What Providers Need (From Medikredit/Healthbridge Analysis)

### 1. Real-Time Eligibility Verification ⭐⭐⭐⭐⭐
**Status:** ❌ Not Implemented  
**Priority:** CRITICAL  
**Impact:** Prevents claim rejections, saves time

**What it does:**
- Instant member lookup
- Active status verification
- Benefit availability check
- Waiting period status
- Pre-auth requirements

**Day1Main Gap:** Need `/api/provider/eligibility` endpoint

---

### 2. Integrated Workflow ⭐⭐⭐⭐⭐
**Status:** ❌ Not Implemented  
**Priority:** CRITICAL  
**Impact:** Saves 4.75 hours per day per provider

**What it does:**
- Check eligibility → Submit claim → Track status
- All in one system
- No switching between systems
- No manual data entry

**Day1Main Gap:** Need all APIs connected

---

### 3. Automatic Claim Submission ⭐⭐⭐⭐⭐
**Status:** ❌ Not Implemented  
**Priority:** CRITICAL  
**Impact:** Reduces admin time by 80%

**What it does:**
- Submit claim with one click
- Auto-populate member details
- Instant approval for simple claims
- Automatic document upload

**Day1Main Gap:** Need `/api/provider/claims/submit` with auto-adjudication

---

### 4. Payment Reconciliation ⭐⭐⭐⭐
**Status:** ❌ Not Implemented  
**Priority:** HIGH  
**Impact:** Reduces payment disputes

**What it does:**
- Track claim payment status
- Match payments to claims
- Identify missing payments
- Generate payment reports

**Day1Main Gap:** Need payment tracking system

---

### 5. Multi-Scheme Connectivity ⭐⭐⭐⭐⭐
**Status:** ✅ Not Needed (Single Scheme)  
**Priority:** N/A  
**Impact:** N/A for Day1Health

**What it does:**
- Connect to multiple medical schemes
- Single interface for all schemes
- Unified claim submission

**Day1Main Status:** Not applicable - Day1Health is single scheme

---

### 6. Pre-Authorization Management ⭐⭐⭐⭐
**Status:** ❌ Not Implemented  
**Priority:** HIGH  
**Impact:** Prevents claim rejections for hospital/specialist

**What it does:**
- Submit pre-auth requests
- Track pre-auth status
- Link pre-auth to claims
- Expiry notifications

**Day1Main Gap:** Need pre-auth workflow

---

## Critical Success Factors

### 1. Speed ⚡
- Eligibility check: <2 seconds
- Simple claim approval: <5 seconds
- Complex claim queued: <10 seconds

### 2. Accuracy ✅
- Correct benefit calculations
- Accurate waiting period validation
- Proper fraud detection

### 3. Usability 🎯
- Simple, intuitive interface
- Clear error messages
- Helpful guidance

### 4. Reliability 🔒
- 99.9% uptime
- Data integrity
- Audit trail

---

## Risk Assessment

### Technical Risks

**1. Benefit Calculation Complexity**
- **Risk:** Incorrect benefit calculations
- **Mitigation:** Comprehensive testing, clear business rules
- **Severity:** HIGH

**2. Fraud Detection**
- **Risk:** Missing fraudulent claims
- **Mitigation:** Start with basic rules, enhance over time
- **Severity:** MEDIUM

**3. Performance**
- **Risk:** Slow response times with high volume
- **Mitigation:** Database indexing, caching, load testing
- **Severity:** MEDIUM

### Business Risks

**1. Provider Adoption**
- **Risk:** Providers don't use the system
- **Mitigation:** Simple UI, training, support
- **Severity:** HIGH

**2. Claim Processing Delays**
- **Risk:** Manual review queue backs up
- **Mitigation:** Hire claims assessors, optimize auto-approval rules
- **Severity:** MEDIUM

**3. Regulatory Compliance**
- **Risk:** Non-compliance with CMS requirements
- **Mitigation:** Legal review, audit trail, proper documentation
- **Severity:** HIGH

---

## Resource Requirements

### Development Team
- 1 Senior Backend Developer (full-time, 8 weeks)
- 1 Frontend Developer (part-time, 2 weeks for API integration)
- 1 QA Engineer (part-time, 4 weeks)
- 1 Product Manager (part-time, oversight)

### Operations Team
- 2-3 Claims Assessors (for manual review queue)
- 1 Claims Manager (oversight)
- 1 Support Person (provider support)

### Infrastructure
- Supabase (existing)
- Document storage (existing)
- Email/SMS notifications (existing)

---

## Success Metrics

### Provider Metrics
- **Eligibility Check Time:** <2 seconds
- **Claim Submission Time:** <5 minutes
- **Auto-Approval Rate:** >70% of claims
- **Provider Satisfaction:** >4.5/5

### Operational Metrics
- **Claims Processing Time:** <24 hours for simple, <5 days for complex
- **Payment Time:** <7 days from approval
- **Fraud Detection Rate:** >95% accuracy
- **System Uptime:** >99.9%

### Business Metrics
- **Provider Adoption:** >80% of providers using system
- **Claim Volume:** 10,000+ claims per month
- **Cost per Claim:** <R50
- **Provider Retention:** >90%

---

## Conclusion

**Current State:** 40% complete - UI exists, backend missing

**Estimated Completion:** 4-6 weeks for MVP (Phase 1-2)

**Recommendation:** BUILD custom claims engine

**Next Steps:**
1. Approve roadmap and budget
2. Assign development team
3. Start Phase 1 (Core APIs)
4. Hire claims assessors
5. Plan provider training

**Key Message:** The Day1Health plans are simple enough that building a custom claims engine is feasible, cost-effective, and will provide better control and flexibility than buying a switching company solution.

---

**Document Version:** 1.0  
**Last Updated:** April 15, 2026  
**Author:** Kiro AI Assistant

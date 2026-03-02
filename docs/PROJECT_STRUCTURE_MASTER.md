# Day1Main - Project Structure Master Reference

## OFFICIAL PROJECT STRUCTURE
This document defines the official logical structure of the Day1Main project.
All documentation, development, and testing must follow this structure.

Last Updated: February 27, 2026
Status: OFFICIAL MASTER REFERENCE

---

## THE 8 LOGICAL SECTIONS

### SECTION 1: MARKETING & APPLICATION FUNNEL
**Purpose:** Customer acquisition and lead generation
**Business Flow:** Prospect → Lead → Application
**Status:** COMPLETE

**What It Does:**
- Landing pages and marketing campaigns
- Lead capture and management
- Lead scoring and qualification
- Application form (6-step process)
- Document upload and OCR processing
- Application submission

**Key Features:**
- Multi-channel lead capture
- Campaign management
- Landing page builder
- 6-step application form
- Google Vision OCR integration
- Marketing consent management

**Dependencies:** None (entry point)
**Outputs:** Application record created

---

### SECTION 2: APPLICATION PROCESSING & APPROVAL
**Purpose:** Qualify and approve new members
**Business Flow:** Application → Verification → Approval → Ready for Member Creation
**Status:** COMPLETE

**What It Does:**
- Application review and verification
- KYC (Know Your Customer) verification
- Document verification
- Risk assessment
- Admin approval/rejection
- First payment verification
- Debit order mandate setup

**Key Features:**
- KYC verification workflow
- Document verification
- Application approval interface
- Risk assessment
- Debit order mandate capture

**Dependencies:** Section 1 (receives applications)
**Outputs:** Approved application ready for member creation

---

### SECTION 3: MEMBER DATABASE & PLANS (CORE FOUNDATION)
**Purpose:** Central member registry - THE FOUNDATION EVERYTHING RUNS ON
**Business Flow:** Approved Application → Member Record Created
**Status:** COMPLETE

**What It Does:**
- Convert approved applications to member records
- Store all core member information
- Assign insurance plans
- Link dependants
- Manage member status
- Member search and filtering

**Core Information Stored:**
- Personal details (name, ID, DOB, contact)
- Main member + dependants
- Plan assignment (which of 9 insurance plans)
- Banking account details
- Payment method (debit order/manual)
- Payment schedule (monthly collection date)
- Status (active/pending/suspended/in_waiting)
- Broker assignment
- Premium amount
- Join date
- Policy number
- Member number

**The 9 Insurance Plans:**
1. Value Plus Plan
2. Value Plus Hospital Plan
3. Value Plus Hospital Plan - Senior
4. Executive Plan
5. Executive Hospital Plan
6. Executive Junior Plan
7. Platinum Plan
8. Platinum Hospital Plan
9. Senior Comprehensive Hospital Plan

**Key Features:**
- Member database (3,581 members)
- Advanced search and filtering
- Plan assignment interface
- Member profile management
- Status management
- Data import/export

**Dependencies:** Section 2 (receives approved applications)
**Outputs:** Complete member record - ALL OTHER SECTIONS DEPEND ON THIS

**CRITICAL NOTE:** This is the CORE DATABASE. Every other section reads from or writes to this member database.

---

### SECTION 4: FEE COLLECTION & PAYMENTS
**Purpose:** Revenue collection and payment processing
**Business Flow:** Member Active → Monthly Collection → Payment Processed
**Status:** COMPLETE

**What It Does:**
- Generate monthly debit order batches
- Process debit orders via Netcash
- Track payment success/failure
- Manage failed payments and retries
- Process manual payments (EFT)
- Allocate payments to member accounts
- Process refunds

**Key Features:**
- Netcash integration
- Batch processing
- Collection calendar
- Failed payment management
- Retry logic
- Manual payment processing
- Refunds processing
- Payment reconciliation

**Payment Methods:**
- A - MAG TAPE: Debit order (primary)
- B - BANK CASH: Manual/EFT payments

**Dependencies:** Section 3 (member banking details, payment method, premium amount)
**Outputs:** Revenue collected, member payment status updated

---

### SECTION 5: BROKERS & PROVIDERS
**Purpose:** Distribution network and service delivery channels
**Business Flow:** Ongoing - Brokers sell, Providers service
**Status:** COMPLETE

**What It Does:**

**Brokers (20 brokers):**
- Broker management and portal
- View their member portfolio
- Submit new applications
- Track commissions
- Generate quotes
- Manage leads

**Providers (1,916 providers):**
- Provider database management
- Provider portal and authentication
- Verify member eligibility
- Submit claims
- Request pre-authorization
- View payment history

**Key Features:**
- Broker portal (applications, policies, leads, quotes, commissions)
- Provider portal (claims, eligibility, pre-auth, payments)
- Provider authentication system
- Eligibility verification
- Provider search and management

**Dependencies:** Section 3 (member records for eligibility verification, broker assignments)
**Outputs:** Sales channel active, service delivery network operational

---

### SECTION 6: CLAIMS PROCESSING
**Purpose:** Service delivery to members
**Business Flow:** Member/Provider → Claim Submission → Assessment → Approval → Payment
**Status:** PARTIAL (interface exists, workflow needs completion)

**What It Does:**
- Receive claims from members or providers
- Validate claim (member active? plan covers benefit?)
- Claims assessment and review
- Pre-authorization for procedures
- Approve or reject claims
- Process payment to provider
- Notify member
- Track claim history
- Detect fraud

**Key Features:**
- Claims submission interface
- Claims assessment workflow
- Pre-authorization system
- Claims approval/rejection
- Provider payment processing
- Claim tracking and history
- Fraud detection

**Dependencies:**
- Section 3 (member plan, status, benefit limits)
- Section 5 (provider details)
**Outputs:** Claims processed, providers paid, members serviced

---

### SECTION 7: FINANCES & COMMISSIONS
**Purpose:** Financial management and accounting
**Business Flow:** Ongoing - Track all financial transactions
**Status:** PARTIAL (structure exists, automation needed)

**What It Does:**
- Track premium collections
- Reconcile payments
- Calculate broker commissions
- Process commission payments
- Maintain general ledger
- Record journal entries
- Generate trial balance
- Financial reporting
- Budget management

**Key Features:**
- General ledger
- Journal entries
- Trial balance
- Bank reconciliation
- Payment reconciliation
- Commission calculations
- Commission payments
- Financial reports

**Dependencies:**
- Section 3 (member premiums)
- Section 4 (payment collections)
- Section 5 (broker commissions)
- Section 6 (claims payments)
**Outputs:** Financial records, commission payments, financial reports

---

### SECTION 8: REPORTING, COMPLIANCE & CALL CENTRE
**Purpose:** Business intelligence, regulatory compliance, and customer support
**Business Flow:** Ongoing - Monitor, report, support
**Status:** PARTIAL (framework exists, needs enhancement)

**What It Does:**

**Reporting:**
- Member reports and analytics
- Claims reports
- Financial reports
- Operational dashboards
- Custom query builder
- Scheduled reports

**Compliance:**
- POPIA (data protection) compliance
- Regulatory reporting
- Fraud management
- Audit trails
- Complaints management
- Breach management

**Call Centre:**
- Member support interface
- Quick member lookup
- Status updates
- Payment queries
- Claims status inquiries
- Policy information
- Issue logging and tracking

**Key Features:**
- Report dashboard
- Analytics and BI
- Query builder
- Compliance register
- POPIA compliance tools
- Call centre interface
- Member support tools

**Dependencies:** ALL previous sections (reads data from entire system)
**Outputs:** Business insights, compliance reports, customer support

---

## DEPENDENCY FLOW DIAGRAM

```
SECTION 1: Marketing & Application Funnel
    ↓
SECTION 2: Application Processing & Approval
    ↓
SECTION 3: MEMBER DATABASE & PLANS (CORE)
    ↓
    ├→ SECTION 4: Fee Collection & Payments
    ├→ SECTION 5: Brokers & Providers
    ├→ SECTION 6: Claims Processing (also needs Section 5)
    ├→ SECTION 7: Finances & Commissions (needs Sections 4, 5, 6)
    └→ SECTION 8: Reporting, Compliance & Call Centre (needs ALL)
```

---

## DEVELOPMENT & TESTING ORDER

**Phase 1: Foundation (Sections 1-3)**
Must be completed first as everything depends on Section 3

**Phase 2: Operations (Sections 4-5)**
Revenue collection and distribution network

**Phase 3: Service Delivery (Section 6)**
Claims processing

**Phase 4: Financial & Support (Sections 7-8)**
Financial management and business intelligence

---

## CURRENT STATUS SUMMARY

| Section | Status | Completion |
|---------|--------|------------|
| 1. Marketing & Application Funnel | COMPLETE | 100% |
| 2. Application Processing & Approval | COMPLETE | 100% |
| 3. Member Database & Plans (CORE) | COMPLETE | 100% |
| 4. Fee Collection & Payments | COMPLETE | 100% |
| 5. Brokers & Providers | COMPLETE | 100% |
| 6. Claims Processing | PARTIAL | 60% |
| 7. Finances & Commissions | PARTIAL | 70% |
| 8. Reporting, Compliance & Call Centre | PARTIAL | 65% |

**Overall Project Completion: 85%**

---

## KEY METRICS

- Total Members: 3,581
- Members with Plans: 1,917 (53%)
- Members Pending Plans: 1,664 (47%)
- Total Providers: 1,916
- Total Brokers: 20
- Insurance Plans: 9
- User Roles: 10

---

## IMPORTANT NOTES

1. **Section 3 is the CORE** - Everything depends on the member database
2. **Sequential Flow** - Each section builds on previous sections
3. **No Skipping** - Cannot implement Section 6 without Sections 3 and 5
4. **Testing Order** - Test in sequence: 1→2→3→4→5→6→7→8
5. **Documentation** - All docs must reference these 8 sections
6. **Consistency** - Use these section names in all communications

---

## REFERENCE DOCUMENTS

- PROJECT_STRUCTURE_MASTER.md (this document) - OFFICIAL REFERENCE
- PROJECT_SUMMARY_CLEAN.md - Executive summary
- PROJECT_COMPREHENSIVE_SUMMARY.md - Detailed technical summary
- INSURANCE_PLANS_REFERENCE.md - The 9 insurance plans
- MEMBER_FILTERS_REFERENCE.md - Member search and filtering

---

**This is the OFFICIAL project structure. All team members, documentation, and development must follow this structure.**

CLAIMS DEPARTMENT - COMPREHENSIVE SUMMARY

================================================================================

OVERVIEW
The Claims Department manages the entire lifecycle of medical claims from submission by healthcare providers through assessment, approval/rejection, and payment processing. The system includes fraud detection, pre-authorization workflows, and comprehensive audit trails.

================================================================================

DATABASE SCHEMA

--------------------------------------------------------------------------------

1. CLAIMS TABLE (Main Claims Table)

CORE IDENTIFICATION
- id (UUID, Primary Key) - Unique claim identifier
- claim_number (TEXT) - Human-readable claim number (Format: CLM-YYYYMMDD-XXX)
- policy_id (UUID, Foreign Key) - Links to policy
- member_id (UUID, Foreign Key) - Links to members table
- provider_id (UUID, Foreign Key) - Links to providers table

CLAIM DETAILS
- service_date (DATE) - Date when medical service was provided
- submission_date (TIMESTAMP) - When claim was submitted
- claim_type (TEXT) - Type of claim (e.g., "Consultation", "Hospitalization", "Procedure")
- claimed_amount (NUMERIC) - Amount claimed by provider
- approved_amount (NUMERIC) - Amount approved for payment (null if not yet approved)

MEDICAL CODING
- icd10_codes (JSONB/ARRAY) - ICD-10 diagnosis codes
- tariff_codes (JSONB/ARRAY) - Procedure/tariff codes
- benefit_type (TEXT) - Type of benefit being claimed

STATUS AND WORKFLOW
- status (TEXT) - Current claim status:
  - pending - Awaiting assessment
  - approved - Approved for payment
  - rejected - Rejected
  - pended - Additional information required
  - paid - Payment processed
- created_at (TIMESTAMP) - Record creation timestamp
- updated_at (TIMESTAMP) - Last update timestamp

PRE-AUTHORIZATION
- pre_auth_number (TEXT) - Pre-authorization reference number
- pre_auth_required (BOOLEAN) - Whether pre-auth is required
- is_pmb (BOOLEAN) - Prescribed Minimum Benefits flag

REJECTION/PENDING
- rejection_code (TEXT) - Standardized rejection code
- rejection_reason (TEXT) - Detailed rejection explanation
- pended_reason (TEXT) - Reason for pending status
- pended_date (TIMESTAMP) - When claim was pended
- additional_info_requested (TEXT) - Details of information needed

APPROVAL AND PAYMENT
- approved_by (UUID) - User ID who approved the claim
- approved_at (TIMESTAMP) - Approval timestamp
- paid_date (DATE) - Payment processing date
- payment_reference (TEXT) - Payment transaction reference

FRAUD DETECTION
- fraud_alert_triggered (BOOLEAN) - Whether fraud alert was raised
- fraud_risk_score (NUMERIC) - Calculated fraud risk score (0-100)
- fraud_review_status (TEXT) - Status of fraud review
- fraud_reviewer_id (UUID) - Fraud reviewer user ID
- fraud_review_notes (TEXT) - Fraud investigation notes

APPEALS
- appeal_status (TEXT) - Appeal status if claim was appealed
- appeal_date (TIMESTAMP) - When appeal was filed
- appeal_notes (TEXT) - Appeal details and notes

METRICS
- processing_time_hours (NUMERIC) - Time taken to process claim

SOURCE TRACKING
- claim_source (TEXT) - Origin of claim (e.g., "provider_portal", "email", "fax")
- submission_method (TEXT) - How claim was submitted (e.g., "portal", "api", "manual")

--------------------------------------------------------------------------------

2. CLAIM_AUDIT_TRAIL TABLE (Audit History)

CORE FIELDS
- id (UUID, Primary Key) - Unique audit entry ID
- claim_id (UUID, Foreign Key) - Links to claims table
- action (TEXT) - Action performed (e.g., "submitted", "approved", "rejected", "pended")
- performed_by (UUID/TEXT) - User ID or identifier who performed action
- performed_at (TIMESTAMP) - When action was performed

STATUS TRACKING
- old_status (TEXT) - Previous claim status
- new_status (TEXT) - New claim status after action

NOTES
- notes (TEXT) - Additional context or comments about the action

================================================================================

USER ROLES AND ACCESS

--------------------------------------------------------------------------------

1. PROVIDER
Access: Provider Portal
Capabilities:
  - Submit new claims
  - View claim history
  - Check claim status
  - Upload supporting documents
  - View payment status

2. CLAIMS ASSESSOR
Access: Claims Assessor Dashboard
Capabilities:
  - Review pending claims queue
  - Approve/reject claims
  - Request additional information (pend claims)
  - Process pre-authorization requests
  - Review fraud alerts
  - Add assessment notes
  - View claim history and audit trail

3. ADMIN
Access: Admin Dashboard
Capabilities:
  - View all claims across system
  - Generate reports
  - Override decisions
  - Manage claim workflows
  - Configure fraud detection rules

================================================================================

WORKFLOWS

--------------------------------------------------------------------------------

A. STANDARD CLAIM SUBMISSION FLOW

1. Provider submits claim via portal
2. System generates claim_number (CLM-YYYYMMDD-XXX)
3. Claim status set to 'pending'
4. Audit trail entry created (action: 'submitted')
5. Claim appears in Claims Assessor queue
6. Assessor reviews claim
7. Decision made:
   - APPROVE: status 'approved', approved_amount set
   - REJECT: status 'rejected', rejection_reason set
   - PEND: status 'pended', pended_reason set
8. Audit trail entry created for decision
9. If approved: Payment processing
10. Status 'paid', paid_date set

--------------------------------------------------------------------------------

B. PRE-AUTHORIZATION FLOW

1. Provider submits claim with pre_auth_required: true
2. Claim routed to Pre-Auth Queue
3. Assessor reviews medical necessity
4. Decision:
   - APPROVE: pre_auth_number generated
   - REJECT: rejection_reason provided
5. Provider notified of pre-auth decision

--------------------------------------------------------------------------------

C. FRAUD DETECTION FLOW

1. Claim submitted
2. Automated fraud detection runs
3. If fraud_risk_score > threshold:
   - fraud_alert_triggered: true
   - Claim routed to Fraud Queue
4. Fraud specialist reviews
5. Investigation outcome:
   - CLEARED: Process normally
   - CONFIRMED: Reject + flag provider
   - NEEDS_MORE_INFO: Pend claim

================================================================================

API ENDPOINTS

--------------------------------------------------------------------------------

PROVIDER ENDPOINTS
- POST /api/provider/claims/submit - Submit new claim
- GET /api/provider/claims - Get provider's claims history
- GET /api/provider/claims/[id] - Get specific claim details

CLAIMS ASSESSOR ENDPOINTS
- GET /api/claims-assessor/dashboard - Get assessor dashboard stats
- GET /api/claims-assessor/queue - Get pending claims queue
- PATCH /api/claims-assessor/queue/[id] - Update claim (approve/reject/pend)
- GET /api/claims-assessor/preauth - Get pre-auth queue
- PATCH /api/claims-assessor/preauth/[id] - Process pre-auth request
- GET /api/claims-assessor/fraud - Get fraud alerts queue
- PATCH /api/claims-assessor/fraud/[id] - Process fraud case
- GET /api/claims-assessor/claims - Get all claims for assessor

ADMIN ENDPOINTS
- GET /api/admin/dashboard/stats - Get system-wide stats (includes pending claims count)

================================================================================

FRONTEND PAGES

--------------------------------------------------------------------------------

PROVIDER PORTAL

1. Dashboard (/provider/dashboard)
   - Recent claims summary
   - Quick stats (total, pending, approved)
   - Quick actions

2. Submit Claim (/provider/claims/submit)
   - Member verification
   - Service details form
   - ICD-10 and tariff code entry
   - Document upload
   - Claim line items

3. Claims History (/provider/claims/history)
   - All submitted claims
   - Status tracking
   - Payment information

--------------------------------------------------------------------------------

CLAIMS ASSESSOR PORTAL

1. Dashboard (/claims-assessor/dashboard)
   - Pending claims count
   - Pre-auth requests count
   - Fraud alerts count
   - Processing metrics

2. Claims Queue (/claims-assessor/queue)
   - List of pending claims
   - Quick filters (status, date range)
   - Claim details modal
   - Approve/Reject/Pend actions

3. Pre-Auth Queue (/claims-assessor/preauth)
   - Pre-authorization requests
   - Medical necessity review
   - Approve/Reject with notes

4. Fraud Cases (/claims-assessor/fraud)
   - Fraud-flagged claims
   - Risk score display
   - Investigation tools
   - Clear/Confirm fraud actions

================================================================================

KEY FEATURES

--------------------------------------------------------------------------------

1. AUDIT TRAIL
- Every claim action is logged
- Tracks who did what and when
- Immutable history for compliance
- Supports appeals and disputes

2. FRAUD DETECTION
- Automated risk scoring
- Pattern detection
- Duplicate claim checking
- Provider behavior analysis

3. PRE-AUTHORIZATION
- Medical necessity review
- Cost containment
- Member protection
- Provider guidance

4. STATUS MANAGEMENT
- Clear workflow states
- Automated notifications
- SLA tracking
- Escalation rules

5. PAYMENT INTEGRATION
- Approved claims to Payment queue
- Payment reference tracking
- Reconciliation support
- Provider statements

================================================================================

CURRENT STATISTICS

Total Claims in System: 7
Sample Claim Number Format: CLM-20260327-001
Active Providers: Multiple (linked via provider_id)
Active Members: Multiple (linked via member_id)

================================================================================

INTEGRATION POINTS

--------------------------------------------------------------------------------

1. MEMBERS SYSTEM
- Validates member eligibility
- Checks benefit limits
- Verifies coverage dates
- Links to member policies

2. PROVIDERS SYSTEM
- Provider authentication
- Practice information
- Payment details
- Performance metrics

3. BENEFITS SYSTEM
- Benefit verification
- PMB checking
- Coverage limits
- Co-payment calculations

4. FINANCE SYSTEM
- Payment processing
- Reconciliation
- Provider statements
- Member statements

================================================================================

FUTURE ENHANCEMENTS (POTENTIAL)

1. Automated claim adjudication for simple cases
2. Machine learning fraud detection
3. Real-time eligibility checking
4. Electronic document management
5. Provider self-service appeals
6. Member claim tracking portal
7. Predictive analytics for claim patterns
8. Integration with medical schemes registry

================================================================================

TECHNICAL NOTES

--------------------------------------------------------------------------------

DATABASE RELATIONSHIPS

claims
  - Links to members (member_id)
  - Links to providers (provider_id)
  - Links to policies (policy_id)
  - Links to claim_audit_trail (one-to-many)

DATA TYPES
- Amounts stored as NUMERIC for precision
- Dates stored as DATE type
- Timestamps stored as TIMESTAMP WITH TIME ZONE
- Arrays stored as JSONB for flexibility
- UUIDs used for all primary keys

PERFORMANCE CONSIDERATIONS
- Indexes on: status, submission_date, provider_id, member_id
- Audit trail partitioned by date (recommended)
- Archived claims moved to separate table after 2 years
- Real-time stats cached for dashboard performance

================================================================================

Document Generated: 2026-03-30
Last Updated: 2026-03-30

================================================================================

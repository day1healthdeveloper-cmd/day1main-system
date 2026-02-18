# Implementation Plan: Day1Main Medical Insurer System

## Overview

This implementation plan breaks down the Day1Main system into discrete, manageable coding tasks. The plan follows an incremental approach where each task builds on previous work, with regular checkpoints to ensure quality and correctness. Tasks are organized into phases that align with the design document's implementation strategy.

The system will be built using TypeScript/NestJS for the backend, Next.js for the frontend, PostgreSQL for the database, and follows a modular architecture with clear service boundaries.

## Tasks

### Phase 1: Foundation and Infrastructure

- [x] 1. Set up project structure and development environment
  - Initialize monorepo with pnpm workspaces (backend, frontend, shared)
  - Configure TypeScript, ESLint, Prettier
  - Set up NestJS backend project with modular structure
  - Set up Next.js 14 frontend project with App Router
  - Configure environment variables and secrets management
  - Set up Docker Compose for local development (PostgreSQL, Redis)
  - _Requirements: System architecture_

- [x] 2. Implement database schema and migrations
  - [x] 2.1 Create Prisma schema for all core tables
    - Identity & access tables (users, profiles, roles, permissions, sessions, mfa_devices, audit_events)
    - Member administration tables (members, dependants, contacts, addresses, consents, risk_flags)
    - Products & policies tables (products, plans, benefits, rules, policies, policy_members)
    - Provider network tables (providers, practices, contracts, tariffs, networks)
    - Claims tables (claims, claim_lines, preauth_requests, adjudications, appeals)
    - Billing & payments tables (invoices, payments, mandates, refunds, reconciliations)
    - Finance ledger tables (gl_accounts, journals, entries, bank_statements)
    - Marketing & CRM tables (leads, campaigns, messages, referrals)
    - Compliance tables (compliance_register, breach_incidents, data_subject_requests)
    - Reporting tables (report_jobs, report_outputs, sars_submissions)
    - _Requirements: Data model specification_

  - [x] 2.2 Generate and test initial migration
    - Run migration on development database
    - Verify all tables, indexes, and constraints are created
    - _Requirements: Database schema_

  - [x] 2.3 Create seed data for development
    - Seed roles and permissions
    - Seed sample products and plans
    - Seed clinical codes (ICD-10 subset)
    - Seed test users with different roles
    - _Requirements: RBAC roles_

- [x] 3. Implement authentication and session management
  - [x] 3.1 Create authentication service
    - Implement login with email/password
    - Implement JWT token generation and validation
    - Implement refresh token rotation
    - Implement session management with Redis
    - _Requirements: 7.1 (IAM roles)_

  - [x] 3.2 Implement MFA support
    - TOTP-based MFA setup and verification
    - MFA device registration
    - MFA enforcement for privileged roles
    - _Requirements: 26.8 (MFA for privileged users)_

  - [ ]* 3.3 Write property test for authentication
    - **Property: Session validity**
    - For any valid login credentials, a session token should be generated that can be validated
    - **Validates: Requirements 7.1**



- [x] 4. Implement RBAC (Role-Based Access Control)
  - [x] 4.1 Create RBAC service
    - Implement role assignment and revocation
    - Implement permission checking
    - Create permission decorators for NestJS controllers
    - Implement role hierarchy (if needed)
    - _Requirements: 6.4, 7.1-7.7_

  - [x] 4.2 Define all system roles and permissions
    - Create permission constants for all operations
    - Map permissions to roles (Member, Broker, Claims Assessor, etc.)
    - Implement separation of duties rules
    - _Requirements: 6.5, 6.6, 6.7, 7.1-7.7_

  - [ ]* 4.3 Write property test for RBAC
    - **Property 18: Role-based permission enforcement**
    - For any operation, the system should verify that the user has the required permission
    - **Validates: Requirements 6.4**

  - [ ]* 4.4 Write property test for claims assessor restriction
    - **Property 19: Claims assessor restriction**
    - For any user with only Claims Assessor role, attempts to modify benefit rules should fail
    - **Validates: Requirements 6.5**

- [ ] 5. Implement audit logging infrastructure
  - [ ] 5.1 Create audit service
    - Implement append-only audit event creation
    - Create audit event interceptor for automatic logging
    - Implement audit query functionality
    - Store audit events in separate append-only table
    - _Requirements: 5.1-5.8_

  - [ ] 5.2 Implement audit event immutability
    - Prevent UPDATE and DELETE operations on audit_events table
    - Use database triggers or constraints to enforce immutability
    - _Requirements: 5.7, 5.8_

  - [ ]* 5.3 Write property test for audit immutability
    - **Property 13: Audit event immutability**
    - For any audit event, attempts to update or delete should fail
    - **Validates: Requirements 5.7, 5.8**

  - [ ]* 5.4 Write property test for decision auditability
    - **Property 12: Decision auditability**
    - For any critical decision, an immutable audit event should be created with full context
    - **Validates: Requirements 5.1-5.6**

- [ ] 6. Checkpoint - Foundation complete
  - Verify all tests pass
  - Verify authentication works end-to-end
  - Verify RBAC permissions are enforced
  - Verify audit events are immutable
  - Ask the user if questions arise

### Phase 2: Member and Policy Administration

- [x] 7. Implement member registration and onboarding
  - [x] 7.1 Create member service
    - Implement member registration with validation
    - Implement dependant management
    - Implement contact and address management
    - Implement member document storage
    - _Requirements: 8.1, 8.7_

  - [x] 7.2 Implement consent management (POPIA)
    - Create consent capture for processing and marketing separately
    - Implement consent revocation
    - Track consent history
    - _Requirements: 2.2, 8.2, 21.1_

  - [ ]* 7.3 Write property test for required member data
    - **Property 20: Required member data capture**
    - For any member onboarding, required fields should be validated before proceeding
    - **Validates: Requirements 8.1**

  - [ ]* 7.4 Write property test for separate consent capture
    - **Property 9: Separate consent capture**
    - For any member onboarding, two distinct consent records should be created
    - **Validates: Requirements 8.2, 21.1**

- [x] 8. Implement KYC and FICA compliance
  - [x] 8.1 Create KYC service
    - Implement ID number validation (SA ID format)
    - Implement risk scoring algorithm
    - Implement PEP checking (mock for now, integrate later)
    - Store KYC results with member record
    - _Requirements: 3.2, 3.3, 3.4, 8.3_

  - [x] 8.2 Implement CDD workflows
    - Create CDD questionnaire and data capture
    - Implement risk-based CDD levels
    - Store CDD results and documentation
    - _Requirements: 3.1_

  - [x]* 8.3 Write property test for KYC execution
    - **Property 10: KYC execution**
    - For any member onboarding, KYC checks should be performed and recorded
    - **Validates: Requirements 3.2, 3.3, 3.4, 8.3**

  - [x]* 8.4 Write property test for FICA audit trail
    - **Property 11: FICA audit trail**
    - For any FICA activity, an audit event should be created
    - **Validates: Requirements 3.6**

- [x] 9. Implement policy management
  - [x] 9.1 Create policy service
    - Implement policy creation
    - Implement policy member assignment
    - Implement policy status management (active, lapsed, cancelled)
    - Implement policy endorsements
    - Track policy status history
    - _Requirements: 8.7, 8.10_

  - [x] 9.2 Implement waiting period calculation
    - Calculate cover activation date based on plan waiting periods
    - Track waiting period status per benefit
    - Validate waiting periods during claims processing
    - _Requirements: 8.10_

  - [x]* 9.3 Write property test for policy creation completeness
    - **Property 23: Policy creation completeness**
    - For any completed onboarding, policy, mandate, and credentials should be created
    - **Validates: Requirements 8.7, 8.8, 8.11**

  - [x]* 9.4 Write property test for waiting period calculation
    - **Property 24: Waiting period calculation**
    - For any policy, cover activation date should be calculated based on waiting period rules
    - **Validates: Requirements 8.10**

- [x] 10. Implement POPIA data protection features
  - [x] 10.1 Create data classification service
    - Mark health data fields as special personal information
    - Implement data minimisation checks
    - Implement purpose limitation validation
    - _Requirements: 2.1, 2.6_

  - [x] 10.2 Implement access control for sensitive data
    - Enforce least privilege access to health data
    - Log all access to special personal information
    - Implement field-level encryption for sensitive data
    - _Requirements: 2.3, 2.4_

  - [x]* 10.3 Write property test for health data classification
    - **Property 3: Health data classification**
    - For any health data field, it should be marked with special personal information classification
    - **Validates: Requirements 2.1**

  - [x]* 10.4 Write property test for consent-based processing
    - **Property 4: Consent-based processing**
    - For any health data processing, a corresponding consent record must exist
    - **Validates: Requirements 2.2**

  - [x]* 10.5 Write property test for least privilege access
    - **Property 5: Least privilege access**
    - For any access to special personal information, user permissions should be verified
    - **Validates: Requirements 2.3**

  - [x]* 10.6 Write property test for sensitive data audit trail
    - **Property 6: Immutable audit trail for sensitive data**
    - For any access to special personal information, an immutable audit event should be created
    - **Validates: Requirements 2.4, 5.7, 5.8**

- [x] 11. Checkpoint - Member and policy administration complete
  - Verify member registration works end-to-end
  - Verify KYC and consent capture work correctly
  - Verify policies are created with correct waiting periods
  - Verify POPIA data protection is enforced
  - Ask the user if questions arise

### Phase 3: Product Catalog and Rules Engine

- [x] 12. Implement product catalog
  - [x] 12.1 Create product service
    - Implement product creation with regime tagging
    - Implement plan management
    - Implement benefit definition
    - Implement benefit limits and exclusions
    - Version products and plans
    - _Requirements: 1.2, 1.5, 19.1_

  - [x] 12.2 Implement product approval workflow
    - Create approval request system
    - Implement multi-step approval (Compliance Officer, Finance Manager)
    - Track approval status and history
    - Prevent publication without required approvals
    - _Requirements: 6.2, 6.3, 6.6, 6.7_

  - [x]* 12.3 Write property test for product regime validation
    - **Property 1: Product regime validation**
    - For any product, it should be rejected without valid regime tag
    - **Validates: Requirements 1.2, 1.5**

  - [x]* 12.4 Write property test for multi-step approval
    - **Property 17: Multi-step approval requirement**
    - For any product publication, multiple role approvals should be required
    - **Validates: Requirements 6.2, 6.3, 6.6, 6.7**

  - [x]* 12.5 Write property test for multi-role product lifecycle
    - **Property 16: Multi-role product lifecycle**
    - For any product lifecycle, different users with different roles should perform each step
    - **Validates: Requirements 6.1**

- [x] 13. Implement rules engine core
  - [x] 13.1 Create rules engine service
    - Design rule DSL or use JSON Logic
    - Implement rule evaluation engine
    - Support rule versioning with effective dates
    - Implement rule context (policy, member, claim data)
    - Generate audit trail for rule execution
    - _Requirements: 19.1, 19.4, 19.7_

  - [x] 13.2 Implement benefit rules
    - Annual limits
    - Per-event limits
    - Sublimits
    - Co-payments and deductibles
    - Network penalties
    - Exclusions
    - Referral requirements
    - Pre-auth requirements
    - _Requirements: 19.7_

  - [x] 13.3 Implement rules simulation mode
    - Create simulation API endpoint
    - Execute rules without persisting results
    - Return detailed simulation report
    - _Requirements: 19.3_

  - [x]* 13.4 Write property test for rules versioning
    - **Property 46: Rules versioning**
    - For any rule change, a new version should be created preserving previous versions
    - **Validates: Requirements 19.1, 19.2**

  - [x]* 13.5 Write property test for rules simulation
    - **Property 47: Rules simulation**
    - For any rule version, simulation mode should work without affecting production data
    - **Validates: Requirements 19.3**

  - [x]* 13.6 Write property test for rules audit output
    - **Property 48: Rules audit output**
    - For any rule execution, audit output should explain decisions
    - **Validates: Requirements 19.4**



- [x] 14. Implement PMB rules (Medical Scheme mode)
  - [x] 14.1 Create PMB service
    - Load PMB provisions from configuration
    - Implement PMB ICD-10 mapping
    - Implement Diagnosis-Treatment Pair (DTP) logic
    - Integrate PMB rules with rules engine
    - _Requirements: 13.1, 13.2, 13.3_

  - [x] 14.2 Implement PMB claim protection
    - Detect PMB-eligible claims
    - Apply "must-pay minimum" logic
    - Prevent rejection of valid PMB claims
    - _Requirements: 13.4, 13.5_

  - [x]* 14.3 Write property test for DTP logic
    - **Property 35: DTP logic application**
    - For any medical scheme claim, DTP logic should be evaluated
    - **Validates: Requirements 13.3**

  - [x]* 14.4 Write property test for PMB claim protection
    - **Property 34: PMB claim protection**
    - For any claim matching PMB criteria, it should not be rejected
    - **Validates: Requirements 13.4, 13.5**

- [x] 15. Implement regime-specific workflows
  - [x] 15.1 Create regime configuration service
    - Load regime-specific settings
    - Enforce Medical Schemes Act workflows for medical_scheme regime
    - Enforce Insurance Act workflows for insurance regime
    - _Requirements: 1.3, 1.4_

  - [x] 15.2 Implement underwriting (insurance mode)
    - Create underwriting questionnaire
    - Implement underwriting decision logic
    - Store underwriting results
    - _Requirements: 8.5_

  - [x]* 15.3 Write property test for regime-specific workflows
    - **Property 2: Regime-specific compliance workflows**
    - For any product, regime-specific workflows should be enforced
    - **Validates: Requirements 1.3, 1.4**

  - [x]* 15.4 Write property test for regime-specific onboarding
    - **Property 22: Regime-specific onboarding**
    - For insurance products, underwriting should be performed; for medical scheme, eligibility validation
    - **Validates: Requirements 8.5, 8.6**

- [x] 16. Checkpoint - Product catalog and rules engine complete
  - Verify products can be created with regime tags
  - Verify approval workflows work correctly
  - Verify rules engine evaluates benefit rules
  - Verify PMB rules protect medical scheme claims
  - Ask the user if questions arise

### Phase 4: Provider Network Management

- [x] 17. Implement provider onboarding
  - [x] 17.1 Create provider service
    - Implement provider registration
    - Implement practice management
    - Implement credential verification workflow
    - Implement bank account verification
    - Store provider documents
    - _Requirements: 10.1, 10.2, 10.3_

  - [x] 17.2 Implement provider contracts and tariffs
    - Create contract management
    - Implement tariff schedule management
    - Assign tariffs to providers
    - Support multiple tariff versions
    - _Requirements: 10.4_

  - [x] 17.3 Implement provider networks
    - Create network definitions (DSP networks for medical schemes)
    - Assign providers to networks
    - Track network membership history
    - _Requirements: 10.5_

  - [x] 17.4 Implement provider authorisations
    - Grant claim submission authorisation
    - Enable EDI/API access for providers
    - Track authorisation status
    - _Requirements: 10.6_

  - [x]* 17.5 Write unit tests for provider onboarding
    - Test provider registration validation
    - Test credential verification workflow
    - Test bank account verification
    - _Requirements: 10.1, 10.2, 10.3_

- [x] 18. Checkpoint - Provider network complete
  - Verify provider registration works end-to-end
  - Verify contracts and tariffs are assigned correctly
  - Verify provider authorisations work
  - Ask the user if questions arise

### Phase 5: Claims Processing

- [x] 19. Implement claims intake
  - [x] 19.1 Create claims service
    - Implement claim submission from multiple channels
    - Validate claim data structure
    - Generate unique claim numbers
    - Store claim documents
    - Track claim status history
    - _Requirements: 11.1_

  - [x] 19.2 Implement claim validation
    - Validate member eligibility (active policy)
    - Validate waiting periods
    - Validate exclusions
    - Validate clinical codes (ICD-10, procedure codes, tariff codes)
    - _Requirements: 11.2, 11.3, 11.4, 11.5_

  - [x]* 19.3 Write property test for multi-channel claim intake
    - **Property 25: Multi-channel claim intake**
    - For any submission channel, claims should be accepted with consistent structure
    - **Validates: Requirements 11.1**

  - [x]* 19.4 Write property test for claim eligibility validation
    - **Property 26: Claim eligibility validation**
    - For any claim, eligibility, waiting periods, and exclusions should be validated
    - **Validates: Requirements 11.2, 11.3, 11.4**

  - [x]* 19.5 Write property test for clinical code validation
    - **Property 27: Clinical code validation**
    - For any claim, clinical codes should be validated against the codes table
    - **Validates: Requirements 11.5**

- [x] 20. Implement claims adjudication
  - [x] 20.1 Create adjudication service
    - Integrate with rules engine for benefit evaluation
    - Calculate approved amounts based on rules
    - Generate reason codes for decisions
    - Create benefit adjudication records
    - _Requirements: 11.6_

  - [x] 20.2 Implement claim status workflow
    - Assign status (approved, pended, rejected)
    - Generate reason codes
    - Create document requests for pended claims
    - Support status transitions
    - _Requirements: 11.8, 11.9_

  - [x]* 20.3 Write property test for rules engine adjudication
    - **Property 28: Rules engine adjudication**
    - For any validated claim, rules engine should produce adjudication result
    - **Validates: Requirements 11.6**

  - [x]* 20.4 Write property test for claim status assignment
    - **Property 30: Claim status assignment**
    - For any adjudicated claim, a valid status with reason codes should be assigned
    - **Validates: Requirements 11.8**

  - [x]* 20.5 Write property test for pended claim document request
    - **Property 31: Pended claim document request**
    - For any pended claim, a document request should be created
    - **Validates: Requirements 11.9**

- [x] 21. Implement fraud detection for claims
  - [x] 21.1 Create fraud detection service
    - Implement claim anomaly scoring (frequency, amount, pattern)
    - Detect duplicate claims
    - Flag high-risk claims for review
    - Create investigation cases
    - _Requirements: 11.7, 22.2_

  - [x]* 21.2 Write property test for fraud scoring
    - **Property 29: Fraud scoring execution**
    - For any adjudicated claim, fraud scoring should be performed
    - **Validates: Requirements 11.7**

  - [x]* 21.3 Write property test for claim anomaly detection
    - **Property 55: Claim anomaly detection**
    - For any claim, anomaly score should be calculated based on historical data
    - **Validates: Requirements 22.2**

- [x] 22. Implement pre-authorisation workflow
  - [x] 22.1 Create pre-auth service
    - Implement pre-auth request submission
    - Validate eligibility and benefits
    - Create clinical review queue
    - Implement approval with limits and conditions
    - Link claims to pre-auths
    - Track pre-auth utilisation
    - _Requirements: 12.1-12.6_

  - [x]* 22.2 Write unit tests for pre-auth workflow
    - Test pre-auth request validation
    - Test approval with limits
    - Test claim-to-preauth linking
    - _Requirements: 12.1-12.6_

- [x] 23. Implement appeals and disputes
  - [x] 23.1 Create appeals service
    - Implement appeal submission for rejected claims
    - Create appeal review workflow
    - Track appeal status and outcomes
    - _Requirements: 11.12_

  - [x]* 23.2 Write unit tests for appeals workflow
    - Test appeal submission
    - Test appeal review process
    - _Requirements: 11.12_

- [x] 24. Implement claim payment scheduling
  - [x] 24.1 Create claim payment service
    - Schedule payments for approved claims
    - Support provider payment and member reimbursement
    - Generate payment batches
    - _Requirements: 11.10_

  - [x] 24.2 Implement statement generation
    - Generate member statements
    - Generate provider remittance advice
    - Store statement history
    - _Requirements: 11.11_

  - [x]* 24.3 Write property test for approved claim payment
    - **Property 32: Approved claim payment scheduling**
    - For any approved claim, a payment record should be created
    - **Validates: Requirements 11.10**

  - [x]* 24.4 Write property test for paid claim statements
    - **Property 33: Paid claim statement generation**
    - For any paid claim, statements should be generated for member and provider
    - **Validates: Requirements 11.11**

- [x] 25. Checkpoint - Claims processing complete
  - Verify claims can be submitted from multiple channels
  - Verify claims are adjudicated correctly by rules engine
  - Verify PMB claims are protected
  - Verify fraud detection flags suspicious claims
  - Verify approved claims schedule payments
  - Ask the user if questions arise

### Phase 6: Payments and Financial Management

- [ ] 26. Implement payment mandate management
  - [ ] 26.1 Create mandate service
    - Implement mandate creation and storage
    - Support DebiCheck mandate registration
    - Track mandate status (active, expired, cancelled)
    - Validate bank account details
    - _Requirements: 14.1, 15.1_

  - [ ]* 26.2 Write unit tests for mandate management
    - Test mandate creation
    - Test mandate validation
    - _Requirements: 14.1, 15.1_

- [ ] 27. Implement payment processing
  - [ ] 27.1 Create payment service
    - Integrate with payment gateway (PayFast)
    - Implement payment processing
    - Handle payment callbacks idempotently
    - Support multiple payment methods
    - _Requirements: 15.1, 15.2_

  - [ ] 27.2 Implement payment retry logic
    - Schedule retries for failed payments
    - Implement exponential backoff
    - Track retry attempts
    - _Requirements: 14.2_

  - [ ] 27.3 Implement refund processing
    - Create refund requests with approval workflow
    - Process refunds via payment gateway
    - Track refund status
    - _Requirements: 15.7_

  - [ ]* 27.4 Write property test for payment idempotency
    - **Property 36: Payment idempotency**
    - For any payment callback, processing multiple times should create only one payment
    - **Validates: Requirements 15.2**

  - [ ]* 27.5 Write property test for payment ledger entries
    - **Property 37: Payment ledger entries**
    - For any payment, ledger entries, audit events, and timeline entries should be created
    - **Validates: Requirements 15.3, 15.4, 15.5**

  - [ ]* 27.6 Write property test for failed payment retry
    - **Property 38: Failed payment retry**
    - For any failed payment, retries should be scheduled according to retry rules
    - **Validates: Requirements 14.2**



- [ ] 28. Implement collections and lapse management
  - [ ] 28.1 Create collections service
    - Schedule debit orders based on billing frequency
    - Implement grace period logic
    - Implement policy lapse for non-payment
    - Implement policy reinstatement
    - Send arrears notifications
    - _Requirements: 14.3, 14.4, 14.5, 14.6, 14.7, 14.8_

  - [ ]* 28.2 Write property test for grace period and lapse
    - **Property 39: Grace period and lapse**
    - For any policy with repeated payment failures, grace period and lapse logic should apply
    - **Validates: Requirements 14.3, 14.4, 14.5**

- [ ] 29. Implement double-entry ledger
  - [ ] 29.1 Create ledger service
    - Implement GL account management
    - Implement journal entry posting
    - Enforce double-entry accounting (debits = credits)
    - Calculate account balances
    - Support cost centres
    - _Requirements: 20.1, 20.2_

  - [ ] 29.2 Integrate ledger with payment events
    - Post journal entries for all payments
    - Post journal entries for refunds
    - Post journal entries for commissions
    - Post journal entries for claim payments
    - _Requirements: 15.3_

  - [ ]* 29.3 Write property test for double-entry balance
    - **Property 49: Double-entry balance**
    - For any journal entry, sum of debits should equal sum of credits
    - **Validates: Requirements 20.2**

  - [ ]* 29.4 Write property test for account balance calculation
    - **Property 50: Account balance calculation**
    - For any GL account and date, balance should equal sum of entries up to that date
    - **Validates: Requirements 20.2**

- [ ] 30. Implement reconciliation engine
  - [ ] 30.1 Create reconciliation service
    - Import bank statements
    - Match payments to bank statement lines
    - Allocate payments to invoices
    - Identify unallocated payments
    - Identify discrepancies
    - Generate reconciliation reports
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

  - [ ]* 30.2 Write property test for daily reconciliation
    - **Property 40: Daily reconciliation execution**
    - For any business day, reconciliation should identify matches and discrepancies
    - **Validates: Requirements 16.1, 16.4**

  - [ ]* 30.3 Write property test for payment allocation
    - **Property 41: Payment allocation**
    - For any received payment, it should be allocated to the corresponding invoice
    - **Validates: Requirements 16.2**

- [ ] 31. Implement broker and commission management
  - [ ] 31.1 Create broker service
    - Implement broker registration
    - Track policies sold by broker
    - Calculate commissions based on commission rules
    - Generate commission statements
    - _Requirements: 17.1, 17.2, 17.3, 17.4_

  - [ ]* 31.2 Write property test for commission calculation auditability
    - **Property 42: Commission calculation auditability**
    - For any commission calculation, audit trail should show formula, inputs, and result
    - **Validates: Requirements 17.3, 5.6**

  - [ ]* 31.3 Write property test for commission statement generation
    - **Property 43: Commission statement generation**
    - For any broker and period, statement should show all policies and commissions
    - **Validates: Requirements 17.4**

- [ ] 32. Checkpoint - Payments and financial management complete
  - Verify payment processing works with payment gateway
  - Verify payment retries work correctly
  - Verify ledger maintains double-entry balance
  - Verify reconciliation matches payments to bank statements
  - Verify broker commissions are calculated correctly
  - Ask the user if questions arise

### Phase 7: Compliance and Regulatory

- [x] 33. Implement POPIA data subject requests
  - [x] 33.1 Create data subject request service
    - Implement access request processing
    - Implement erasure request processing
    - Implement rectification request processing
    - Track request status and completion
    - Enforce statutory timeframes (30 days)
    - _Requirements: 25.1, 25.2, 25.3, 25.4, 25.5, 2.7_

  - [x]* 33.2 Write property test for data subject request processing
    - **Property 8: Data subject request processing**
    - For any data subject request, it should be processed within statutory timeframe
    - **Validates: Requirements 2.7, 25.1**

- [x] 34. Implement breach incident management
  - [x] 34.1 Create breach management service
    - Implement breach incident reporting
    - Create breach investigation workflow
    - Track breach status and remediation
    - Generate regulator notification
    - _Requirements: 2.8_

  - [x]* 34.2 Write unit tests for breach workflow
    - Test breach incident creation
    - Test breach workflow steps
    - _Requirements: 2.8_

- [x] 35. Implement fraud detection and investigation
  - [x] 35.1 Create fraud service
    - Implement duplicate member detection (bank, phone, ID)
    - Implement provider outlier detection
    - Create investigation case management
    - Generate SIU export packs
    - _Requirements: 22.1, 22.3, 22.5, 22.6_

  - [x]* 35.2 Write property test for duplicate member detection
    - **Property 54: Duplicate member detection**
    - For any member registration, duplicates should be flagged based on bank/phone/ID
    - **Validates: Requirements 22.1**

  - [x]* 35.3 Write property test for provider outlier detection
    - **Property 56: Provider outlier detection**
    - For any provider, outliers should be identified based on tariff and code patterns
    - **Validates: Requirements 22.3**

- [x] 36. Implement complaints and disputes management
  - [x] 36.1 Create complaints service
    - Implement complaint case intake
    - Assign SLA timers based on complaint type
    - Implement escalation workflow
    - Track complaint resolution
    - Generate Ombud export packs
    - Support root-cause tagging
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6_

  - [ ]* 36.2 Write property test for SLA timer enforcement
    - **Property 44: SLA timer enforcement**
    - For any complaint, SLA timer should trigger escalation if expired
    - **Validates: Requirements 18.2, 18.3**

  - [ ]* 36.3 Write property test for complaint resolution tracking
    - **Property 45: Complaint resolution tracking**
    - For any complaint, resolution outcome and root-cause tags should be tracked
    - **Validates: Requirements 18.5**

- [x] 37. Implement SARS reporting
  - [x] 37.1 Create SARS reporting service
    - Generate SARS third-party submission files
    - Validate submission data
    - Calculate file hashes
    - Store submission audit trail
    - Support both medical scheme and insurance reporting
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 37.2 Write property test for SARS submission validation
    - **Property 14: SARS submission validation**
    - For any SARS submission, data should be validated before file generation
    - **Validates: Requirements 4.3**

  - [ ]* 37.3 Write property test for SARS submission audit trail
    - **Property 15: SARS submission audit trail**
    - For any SARS submission, audit record with file hash should be created
    - **Validates: Requirements 4.4**

- [x] 38. Implement regulatory reporting
  - [x] 38.1 Create CMS reporting service (medical scheme mode)
    - Generate PMB reporting dashboards
    - Generate claims turnaround time reports
    - Generate complaints/disputes statistics
    - Generate provider network statistics
    - Generate member movement reports
    - Generate solvency/financial extracts
    - _Requirements: 23.1, 23.2, 23.3, 23.4, 23.5, 23.6_

  - [x] 38.2 Create FSCA/PA reporting service (insurance mode)
    - Maintain policy registers
    - Maintain claims registers
    - Generate conduct metrics (complaints, lapses, TCF)
    - Maintain product governance artefacts
    - _Requirements: 24.1, 24.2, 24.3, 24.4_

  - [ ]* 38.3 Write unit tests for regulatory reports
    - Test CMS report generation
    - Test FSCA/PA report generation
    - _Requirements: 23.1-23.6, 24.1-24.4_

- [x] 39. Checkpoint - Compliance and regulatory complete
  - Verify POPIA data subject requests work
  - Verify fraud detection identifies duplicates and outliers
  - Verify complaints management tracks SLAs
  - Verify SARS submissions generate correctly
  - Verify regulatory reports generate for both regimes
  - Ask the user if questions arise

### Phase 8: Marketing and CRM

- [x] 40. Implement lead management
  - [x] 40.1 Create lead service
    - Implement lead capture from multiple sources
    - Assign leads to users
    - Track lead conversion to policies
    - Track lead sources and attribution
    - _Requirements: 21.5, 21.6_

  - [ ]* 40.2 Write unit tests for lead management
    - Test lead capture
    - Test lead assignment
    - Test lead conversion tracking
    - _Requirements: 21.5, 21.6_

- [x] 41. Implement campaign management
  - [x] 41.1 Create campaign service
    - Create and manage campaigns
    - Send messages (email, SMS, WhatsApp)
    - Track UTM attribution
    - Log all messages sent
    - _Requirements: 21.4, 21.7, 21.8_

  - [x] 41.2 Implement consent-first marketing
    - Check marketing consent before sending
    - Support opt-out processing
    - Track opt-out requests
    - _Requirements: 21.1, 21.2_

  - [ ]* 41.3 Write property test for marketing consent check
    - **Property 51: Marketing consent check**
    - For any marketing message, recipient consent should be verified
    - **Validates: Requirements 21.1, 21.2**

  - [ ]* 41.4 Write property test for opt-out processing
    - **Property 52: Opt-out processing**
    - For any opt-out request, consent should be updated and future messages prevented
    - **Validates: Requirements 21.2**

  - [ ]* 41.5 Write property test for message logging
    - **Property 53: Message logging**
    - For any message sent, it should be logged with full details
    - **Validates: Requirements 21.3**

- [x] 42. Implement referral programme
  - [x] 42.1 Create referral service
    - Generate referral codes for members
    - Track referrals and conversions
    - Calculate referral rewards
    - _Requirements: 21.7_

  - [ ]* 42.2 Write unit tests for referral programme
    - Test referral code generation
    - Test referral tracking
    - _Requirements: 21.7_

- [x] 43. Checkpoint - Marketing and CRM complete
  - Verify lead capture and conversion tracking work
  - Verify campaigns respect marketing consent
  - Verify opt-out processing works
  - Verify referral programme tracks conversions
  - Ask the user if questions arise



### Phase 9: User Interfaces - Member Portal

- [x] 44. Set up Next.js frontend project
  - [x] 44.1 Initialize Next.js 14 with App Router
    - Configure TypeScript, Tailwind CSS, shadcn/ui
    - Set up authentication with JWT tokens
    - Configure API client for backend
    - Set up environment variables
    - _Requirements: UI architecture_

  - [x]* 44.2 Write unit tests for API client
    - Test authentication flow
    - Test token refresh
    - Test error handling
    - _Requirements: 28.1_

- [x] 45. Implement public landing page
  - [x] 45.1 Create landing page layout
    - Implement hero section
    - Implement product showcase
    - Implement footer with links
    - Make responsive for mobile/tablet/desktop
    - _Requirements: UI design_

  - [x]* 45.2 Write unit tests for landing page
    - Test page renders correctly
    - Test navigation links work
    - _Requirements: UI design_

- [x] 46. Implement authenticated layout with left sidebar
  - [x] 46.1 Create Supabase-style sidebar layout
    - Implement collapsible left sidebar navigation
    - Implement top bar with user menu and search
    - Implement responsive behavior (mobile drawer)
    - Apply consistent styling across all portals
    - _Requirements: UI design_

  - [x]* 46.2 Write unit tests for sidebar layout
    - Test sidebar navigation
    - Test responsive behavior
    - _Requirements: UI design_

- [x] 47. Implement member portal pages
  - [x] 47.1 Create dashboard page
    - Display policy summary
    - Display recent claims
    - Display quick actions
    - _Requirements: 29.1_

  - [x] 47.2 Create policy details page
    - Display policy information
    - Display digital membership card
    - Display covered members
    - Allow document downloads
    - _Requirements: 29.1, 29.6_

  - [x] 47.3 Create claims pages
    - Implement claim submission form
    - Display claims history
    - Display claim status tracking
    - _Requirements: 29.2_

  - [x] 47.4 Create pre-auth pages
    - Display pre-auth status
    - Allow pre-auth submission
    - _Requirements: 29.3_

  - [x] 47.5 Create payments page
    - Display payment history
    - Display invoices
    - Allow payment method management
    - _Requirements: 29.4_

  - [x] 47.6 Create documents page
    - Display policy documents
    - Display statements
    - Allow tax certificate downloads
    - _Requirements: 29.4, 29.6_

  - [x] 47.7 Create profile page
    - Display and edit personal information
    - Manage dependants
    - Manage consents
    - _Requirements: 29.5_

  - [ ]* 47.8 Write unit tests for member portal pages
    - Test each page renders correctly
    - Test form submissions
    - Test data display
    - _Requirements: 29.1-29.6_



### Phase 10: User Interfaces - Provider Portal

- [ ] 48. Implement provider portal pages
  - [x] 48.1 Create provider dashboard
    - Display statistics (claims submitted, payments received)
    - Display pending items
    - _Requirements: 30.1_

  - [x] 48.2 Create eligibility check page
    - Implement real-time eligibility lookup
    - Display member coverage details
    - _Requirements: 30.1_

  - [ ] 48.3 Create claim submission page
    - Implement claim submission form
    - Support multiple claim lines
    - Upload supporting documents
    - _Requirements: 30.2_

  - [ ] 48.4 Create pre-auth submission page
    - Implement pre-auth request form
    - _Requirements: 30.2_

  - [ ] 48.5 Create claims history page
    - Display submitted claims
    - Display claim status
    - _Requirements: 30.2_

  - [x] 48.6 Create payments page
    - Display remittance advice
    - Display payment history
    - _Requirements: 30.3_

  - [ ]* 48.7 Write unit tests for provider portal pages
    - Test eligibility check
    - Test claim submission
    - Test payment display
    - _Requirements: 30.1-30.3_

### Phase 11: User Interfaces - Broker Portal

- [ ] 49. Implement broker portal pages
  - [ ] 49.1 Create broker dashboard
    - Display lead and policy pipeline
    - Display statistics
    - _Requirements: 31.1_

  - [x] 49.2 Create leads management page
    - Display leads list
    - Allow lead capture
    - Track lead status
    - _Requirements: 31.1_

  - [ ] 49.3 Create quote generation page
    - Generate quotes for products
    - Send quotes to prospects
    - _Requirements: 31.1_

  - [ ] 49.4 Create policies page
    - Display active policies
    - Display policy status
    - _Requirements: 31.1_

  - [ ] 49.5 Create commissions page
    - Display commission statements
    - Display commission history
    - _Requirements: 31.2_

  - [ ]* 49.6 Write unit tests for broker portal pages
    - Test lead management
    - Test quote generation
    - Test commission display
    - _Requirements: 31.1-31.2_

### Phase 12: User Interfaces - Admin Backoffice

- [x] 50. Implement admin backoffice pages
  - [x] 50.1 Create admin dashboard
    - Display system statistics
    - Display pending approvals
    - Display alerts
    - _Requirements: 32.1_

  - [x] 50.2 Create member administration pages
    - Search members
    - View member details
    - Edit member information
    - Manage onboarding queue
    - _Requirements: 32.1_

  - [x] 50.3 Create policy administration pages
    - Search policies
    - View policy details
    - Process endorsements
    - Manage lapses and reinstatements
    - _Requirements: 32.2_

  - [x] 50.4 Create product and rules administration pages
    - Manage product catalog
    - Edit benefit rules
    - Approval queue for products
    - _Requirements: 32.2_

  - [x] 50.5 Create claims workbench
    - Display pending claims
    - Review and adjudicate claims
    - Request additional information
    - Approve/reject claims
    - _Requirements: 32.3_

  - [x] 50.6 Create provider administration pages
    - Provider directory
    - Provider onboarding queue
    - Manage contracts and tariffs
    - _Requirements: 32.1_

  - [x] 50.7 Create finance pages
    - Invoicing
    - Payment processing
    - Reconciliations
    - GL and ledger views
    - _Requirements: 32.4_

  - [x] 50.8 Create broker administration pages
    - Broker directory
    - Commission management
    - _Requirements: 32.1_

  - [ ]* 50.9 Write unit tests for admin backoffice pages
    - Test member search and management
    - Test claims workbench
    - Test product approval workflow
    - _Requirements: 32.1-32.4_

### Phase 13: User Interfaces - Compliance Console

- [x] 51. Implement compliance console pages
  - [x] 51.1 Create compliance dashboard
    - Display compliance status overview
    - Display pending items
    - Display alerts
    - _Requirements: 33.1_

  - [x] 51.2 Create POPIA management pages
    - Data subject requests queue
    - Breach register
    - Consent management
    - Access logs viewer
    - _Requirements: 33.1, 33.2_

  - [x] 51.3 Create fraud and risk pages
    - Investigations queue
    - Risk flags management
    - Anomaly reports
    - _Requirements: 33.3_

  - [x] 51.4 Create vendor management pages
    - Vendor register
    - Risk assessments
    - _Requirements: 33.4_

  - [x] 51.5 Create compliance register pages
    - Obligations register
    - Reviews schedule
    - RoPA (Record of Processing Activities)
    - _Requirements: 33.5_

  - [ ]* 51.6 Write unit tests for compliance console pages
    - Test data subject request processing
    - Test breach register
    - Test fraud investigations
    - _Requirements: 33.1-33.5_

### Phase 14: User Interfaces - Reporting Studio

- [x] 52. Implement reporting studio pages
  - [x] 52.1 Create reporting dashboard
    - Display available reports
    - Display scheduled reports
    - _Requirements: 34.1_

  - [x] 52.2 Create regulatory reports pages
    - CMS reports (medical scheme mode)
    - FSCA/PA reports (insurance mode)
    - SARS submissions
    - _Requirements: 34.1, 34.2, 34.3_

  - [x] 52.3 Create operational reports pages
    - Claims analytics
    - Financial reports
    - Member reports
    - _Requirements: 34.1_

  - [x] 52.4 Create ad-hoc query builder
    - Query builder interface
    - Export functionality
    - _Requirements: 34.4_

  - [x] 52.5 Create scheduled reports page
    - Schedule report generation
    - Manage report schedules
    - _Requirements: 34.5_

  - [ ]* 52.6 Write unit tests for reporting studio pages
    - Test report generation
    - Test export functionality
    - _Requirements: 34.1-34.6_

- [ ] 53. Checkpoint - All user interfaces complete
  - Verify all portals render correctly
  - Verify navigation works across all portals
  - Verify forms submit correctly
  - Verify data displays correctly
  - Ask the user if questions arise

### Phase 15: Integration and External Services

- [ ] 54. Implement payment gateway integration
  - [ ] 54.1 Integrate PayFast
    - Implement payment initiation
    - Handle payment callbacks
    - Implement webhook verification
    - _Requirements: 15.1, 15.2_

  - [ ] 54.2 Integrate DebiCheck
    - Implement mandate registration
    - Process debit orders
    - Handle debit order responses
    - _Requirements: 14.1_

  - [ ]* 54.3 Write integration tests for payment gateway
    - Test payment flow end-to-end (sandbox)
    - Test callback handling
    - _Requirements: 15.1, 15.2_

- [ ] 55. Implement messaging integrations
  - [ ] 55.1 Integrate email service (SMTP2GO)
    - Send transactional emails
    - Track email delivery status
    - _Requirements: 21.3_

  - [ ] 55.2 Integrate SMS gateway
    - Send SMS messages
    - Track SMS delivery status
    - _Requirements: 21.3_

  - [ ] 55.3 Integrate WhatsApp Business API
    - Send WhatsApp messages
    - Track message delivery status
    - _Requirements: 21.3_

  - [ ]* 55.4 Write integration tests for messaging
    - Test email sending
    - Test SMS sending
    - _Requirements: 21.3_

- [ ] 56. Implement identity verification integration
  - [ ] 56.1 Integrate ID verification service
    - Verify SA ID numbers
    - Verify passport numbers
    - Store verification results
    - _Requirements: 3.2_

  - [ ]* 56.2 Write integration tests for ID verification
    - Test ID verification flow
    - _Requirements: 3.2_

- [ ] 57. Checkpoint - Integrations complete
  - Verify payment gateway integration works
  - Verify messaging services work
  - Verify ID verification works
  - Ask the user if questions arise

### Phase 16: Testing and Quality Assurance

- [ ] 58. Implement comprehensive property-based tests
  - [ ] 58.1 Review all correctness properties
    - Ensure each property has at least one property test
    - Verify property tests use appropriate generators
    - _Requirements: All correctness properties_

  - [ ] 58.2 Implement missing property tests
    - Add property tests for any properties without tests
    - Configure all property tests to run 100+ iterations
    - _Requirements: All correctness properties_

  - [ ]* 58.3 Run full property test suite
    - Execute all property tests
    - Fix any failing tests
    - Document any property violations found
    - _Requirements: All correctness properties_

- [ ] 59. Implement end-to-end integration tests
  - [ ] 59.1 Test member onboarding to claim payment flow
    - Member registration → policy creation → claim submission → claim payment
    - _Requirements: 35.1, 35.2, 35.3_

  - [ ] 59.2 Test employer onboarding flow
    - Employer registration → bulk member upload → monthly reconciliation
    - _Requirements: 9.1-9.6_

  - [ ] 59.3 Test provider onboarding to payment flow
    - Provider registration → claim submission → payment
    - _Requirements: 10.1-10.8, 35.3_

  - [ ] 59.4 Test product lifecycle flow
    - Product creation → approval → publication
    - _Requirements: 35.1_

  - [ ] 59.5 Test data subject request flow
    - Request submission → processing → completion
    - _Requirements: 35.7_

  - [ ]* 59.6 Write integration tests for all end-to-end flows
    - Test each flow completes successfully
    - Test audit trails are created
    - _Requirements: 35.1-35.8_

- [ ] 60. Perform security testing
  - [ ] 60.1 Test authentication and authorization
    - Test login/logout
    - Test token expiry and refresh
    - Test permission enforcement
    - Test MFA
    - _Requirements: 26.1-26.8_

  - [ ] 60.2 Test data protection
    - Test encryption at rest
    - Test encryption in transit
    - Test access controls for sensitive data
    - _Requirements: 2.1-2.9, 26.1-26.8_

  - [ ]* 60.3 Perform penetration testing
    - Test for SQL injection
    - Test for XSS
    - Test for CSRF
    - Test for authentication bypass
    - _Requirements: Security testing_

- [ ] 61. Perform compliance testing
  - [ ] 61.1 Test POPIA compliance
    - Verify consent capture works
    - Verify data subject requests work
    - Verify breach workflows work
    - Verify audit logs are immutable
    - _Requirements: 2.1-2.9, 25.1-25.6, 35.6, 35.7_

  - [ ] 61.2 Test FICA compliance
    - Verify KYC checks work
    - Verify risk scoring works
    - Verify PEP checks work
    - _Requirements: 3.1-3.6_

  - [ ] 61.3 Test SARS reporting
    - Verify SARS submissions generate correctly
    - Verify validation works
    - Verify audit trails are created
    - _Requirements: 4.1-4.5, 35.8_

  - [ ] 61.4 Test regulatory reporting
    - Verify CMS reports generate (medical scheme mode)
    - Verify FSCA/PA reports generate (insurance mode)
    - _Requirements: 23.1-23.6, 24.1-24.4, 35.8_

- [ ] 62. Checkpoint - Testing complete
  - Verify all property tests pass
  - Verify all integration tests pass
  - Verify security tests pass
  - Verify compliance tests pass
  - Ask the user if questions arise

### Phase 17: Performance and Optimization

- [ ] 63. Perform load testing
  - [ ] 63.1 Test claims processing throughput
    - Target: 1000 claims per minute
    - Identify bottlenecks
    - _Requirements: Performance testing_

  - [ ] 63.2 Test payment processing throughput
    - Target: 500 payments per minute
    - Identify bottlenecks
    - _Requirements: Performance testing_

  - [ ] 63.3 Test API endpoint performance
    - Target: 100 requests per second per endpoint
    - Measure p50, p95, p99 response times
    - _Requirements: Performance testing_

  - [ ]* 63.4 Optimize identified bottlenecks
    - Add database indexes
    - Optimize queries
    - Add caching where appropriate
    - _Requirements: Performance testing_

- [ ] 64. Implement observability
  - [ ] 64.1 Set up OpenTelemetry
    - Instrument all services
    - Collect traces, metrics, and logs
    - _Requirements: Observability_

  - [ ] 64.2 Set up Sentry
    - Configure error tracking
    - Set up alerts for critical errors
    - _Requirements: Observability_

  - [ ] 64.3 Create monitoring dashboards
    - API response times
    - Error rates
    - Database performance
    - Queue depth
    - Payment success rates
    - _Requirements: Monitoring and alerting_

- [ ] 65. Checkpoint - Performance and observability complete
  - Verify system meets performance targets
  - Verify monitoring dashboards work
  - Verify alerts trigger correctly
  - Ask the user if questions arise

### Phase 18: Deployment and Documentation

- [ ] 66. Prepare production deployment
  - [ ] 66.1 Set up production infrastructure
    - Configure database (PostgreSQL with replication)
    - Configure Redis cluster
    - Configure object storage
    - Configure load balancer
    - _Requirements: Deployment architecture_

  - [ ] 66.2 Configure CI/CD pipeline
    - Automated testing
    - Automated deployment to staging
    - Manual approval for production
    - _Requirements: Deployment_

  - [ ] 66.3 Set up backup and disaster recovery
    - Configure automated backups
    - Test point-in-time recovery
    - Document disaster recovery procedures
    - _Requirements: 27.1-27.5_

  - [ ] 66.4 Configure secrets management
    - Store all secrets in vault
    - Rotate secrets
    - _Requirements: 26.3, 26.4_

- [ ] 67. Create system documentation
  - [ ] 67.1 Write API documentation
    - Document all API endpoints
    - Include request/response examples
    - _Requirements: 28.1-28.5_

  - [ ] 67.2 Write deployment documentation
    - Document infrastructure setup
    - Document deployment procedures
    - Document rollback procedures
    - _Requirements: Deployment_

  - [ ] 67.3 Write operations runbooks
    - Common operational tasks
    - Troubleshooting guides
    - Incident response procedures
    - _Requirements: Operations_

- [ ] 68. Final checkpoint - System complete
  - Verify all requirements are implemented
  - Verify all tests pass
  - Verify system is production-ready
  - Verify documentation is complete
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties (minimum 100 iterations each)
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end workflows
- The implementation follows an incremental approach where each phase builds on previous work
- Regular checkpoints allow for user feedback and course correction

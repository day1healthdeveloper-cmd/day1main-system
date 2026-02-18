# Day1Main Build Progress

## Completed Tasks ✅

### Phase 1: Foundation and Infrastructure

#### ✅ Task 1: Set up project structure and development environment
- Monorepo with pnpm workspaces
- NestJS backend with TypeScript
- Next.js 14 frontend with App Router
- Tailwind CSS + shadcn/ui
- Docker Compose (PostgreSQL + Redis)
- ESLint, Prettier, TypeScript strict mode

#### ✅ Task 2: Implement database schema and migrations
- Complete Prisma schema with 80+ tables
- All core entities: Identity, Members, Products, Policies, Providers, Claims, Payments, Finance, Marketing, Compliance, Reporting
- PMB support for medical scheme mode
- Seed script with RBAC data
- Migration scripts

#### ✅ Task 3: Implement authentication and session management
- User registration and login
- JWT token generation and validation
- Refresh token rotation
- Session management with Redis
- MFA support (TOTP)
- Password hashing with bcrypt
- Audit logging for auth events

#### ✅ Task 4: Implement RBAC (Role-Based Access Control)
- 16 system roles defined
- 50+ permissions across all resources
- Role-permission mappings
- Permission guards and decorators
- Role guards and decorators
- Separation of duties enforcement (Claims Assessor cannot change benefit rules)
- Multi-role approval for products (Compliance Officer + Finance Manager)
- Comprehensive seed data

#### ✅ Task 5: Implement audit logging infrastructure
- Audit service with immutable logging
- Automatic HTTP request logging (AuditInterceptor)
- Entity audit trail tracking
- User activity tracking
- Audit statistics and reporting
- Helper functions for common audit operations
- Query API with filters and pagination
- Compliance-ready audit trail

### Phase 2: Member and Policy Administration

#### ✅ Task 7: Implement member registration and onboarding
- Member service with registration and validation
- Dependant management
- Contact and address management
- Member document storage
- Consent management (POPIA compliant)
- Separate consent capture for processing and marketing
- Consent revocation and history tracking

#### ✅ Task 8: Implement KYC and FICA compliance
- KYC service with ID verification (SA ID format)
- Risk scoring algorithm (0-100 scale)
- PEP checking (mock implementation)
- CDD workflows with risk-based levels
- Enhanced due diligence (EDD) for high-risk members
- Risk flag management
- Comprehensive property tests for KYC execution and FICA audit trail
- All FICA activities logged to immutable audit trail

#### ✅ Task 9: Implement policy management
- Policy service with creation and validation
- Policy member assignment (principal and dependants)
- Policy status management (pending, active, lapsed, cancelled, suspended)
- Policy endorsements with premium adjustments
- Status history tracking for all transitions
- Waiting period calculation based on plan rules
- Cover activation date calculation
- Member coverage validation
- Unique policy number generation (regime-specific)
- Comprehensive property tests for policy creation and waiting periods

#### ✅ Task 10: Implement POPIA data protection features
- Data classification service for health data identification
- Special personal information marking (health data per POPIA Section 26)
- Consent-based processing validation
- Purpose limitation enforcement
- Data minimization checks
- Least privilege access control for health data
- Automatic audit logging for sensitive data access
- Field-level data masking for unauthorized users
- Data subject rights support (access, rectification, erasure)
- Data processing reports for POPIA compliance
- Comprehensive property tests for all POPIA requirements

### Phase 3: Product Catalog and Rules Engine

#### ✅ Task 12: Implement product catalog
- Product service with regime tagging (medical_scheme vs insurance)
- Plan management with benefits
- Benefit definition with limits and exclusions
- Product versioning support
- Multi-step approval workflow (Compliance Officer + Finance Manager)
- Approval tracking and history
- Publication control (requires all approvals)
- Separation of duties enforcement
- Role-based approval permissions
- Comprehensive property tests for regime validation and approval workflows

#### ✅ Task 13: Implement rules engine core
- Rules engine service with JSON-based rule evaluation
- Rule versioning with effective dates
- Support for 8 rule types (annual limits, per-event limits, co-payments, exclusions, network penalties, pre-auth, waiting periods, custom)
- Rule context evaluation (policy, member, claim, benefit, provider data)
- Simulation mode (test rules without persisting)
- Detailed audit trail with explanations for every rule execution
- Rule version history tracking
- Active rule determination based on effective dates
- Comprehensive property tests for versioning, simulation, and audit output

#### ✅ Task 14: Implement PMB rules (Medical Scheme mode)
- PMB service with eligibility checking for emergency, CDL, and DTP conditions
- 27 Chronic Disease List (CDL) conditions with ICD-10 mapping
- 5 sample Diagnosis-Treatment Pairs (DTPs) with procedure code matching
- Emergency condition recognition
- PMB claim protection (removes co-payments, annual limits, network penalties)
- Cannot-reject logic for valid PMB claims
- Comprehensive audit logging for all PMB evaluations
- Property tests for DTP logic application (Property 35)
- Property tests for PMB claim protection (Property 34)
- 22 tests passing for PMB functionality

#### ✅ Task 15: Implement regime-specific workflows
- Regime configuration service with Medical Schemes Act and Insurance Act workflows
- Underwriting service for insurance products with risk assessment
- Risk scoring algorithm (age, smoking, pre-existing conditions, BMI, hospitalizations)
- 4-tier risk rating (low, medium, high, very_high)
- Automated underwriting decisions with premium loading
- Eligibility validation for medical scheme products (open enrollment)
- Regime-specific onboarding steps
- Comprehensive audit logging for underwriting and eligibility
- Property tests for regime-specific workflows (Property 2)
- Property tests for regime-specific onboarding (Property 22)
- 24 tests passing for regime functionality

### Phase 4: Provider Network Management

#### ✅ Task 17: Implement provider onboarding
- Provider service with registration and credential verification
- Unique provider number generation (GP, SPEC, HOSP, PHARM, etc.)
- Practice management (multiple practices per provider)
- Credential verification workflow with status tracking
- Bank account verification for payments
- Contract management with tariff schedules
- Network assignment (DSP networks for medical schemes)
- Provider authorizations for claim submission and EDI/API access
- Authorization revocation support
- Comprehensive audit logging for all provider operations
- 18 tests passing for provider functionality

### Phase 5: Claims Processing

#### ✅ Task 19: Implement claims intake
- Claims service with multi-channel submission (API, EDI, portal)
- Unique claim number generation (CLM-YYYYMMDD-NNNNNN format)
- Member eligibility validation (active policy coverage)
- Waiting period validation
- Exclusion validation (diagnosis and procedure exclusions)
- Clinical code validation (ICD-10, procedure codes, tariff codes)
- Claim status tracking with history
- Comprehensive audit logging for all claim submissions
- Property tests for multi-channel intake (Property 25)
- Property tests for eligibility validation (Property 26)
- Property tests for clinical code validation (Property 27)
- 22 tests passing for claims functionality

#### ✅ Task 20: Implement claims adjudication
- Adjudication service with rules engine integration
- PMB protection checking for medical schemes
- Claim line adjudication with benefit rule evaluation
- Status determination (approved, pended, rejected)
- Document request creation for pended claims
- Reason code generation
- Audit logging for all adjudication events
- Controller endpoints for adjudication and status updates
- Property tests for rules engine adjudication (Property 28)
- Property tests for claim status assignment (Property 30)
- Property tests for pended claim document requests (Property 31)
- 11 tests passing for adjudication functionality

#### ✅ Task 21: Implement fraud detection for claims
- Fraud detection service with anomaly scoring
- Frequency scoring (high claim submission rates)
- Amount scoring (unusually high claim amounts vs historical data)
- Pattern scoring (weekend submissions, round numbers, old service dates)
- Duplicate claim detection (same member, provider, date, procedures)
- Composite fraud score (0-100) with risk levels (low/medium/high/critical)
- Automatic flagging of high-risk claims for review
- Investigation case management (create, track, close cases)
- Unique case number generation (FRD-YYYYMMDD-NNNNNN)
- Controller endpoints for fraud scoring and case management
- Property tests for fraud scoring execution (Property 29)
- Property tests for claim anomaly detection (Property 55)
- 11 tests passing for fraud detection functionality

#### ✅ Task 22: Implement pre-authorisation workflow
- Pre-auth service with request submission and validation
- Member eligibility validation before pre-auth
- Unique pre-auth number generation (PA-YYYYMMDD-NNNNNN)
- Approval workflow with limits, conditions, and expiry dates
- Rejection workflow with reason codes
- Request more information workflow
- Clinical review queue (pending pre-auths)
- Claim-to-preauth linking with validation
- Pre-auth utilisation tracking (approved, utilised, remaining amounts)
- Expiry date checking
- Remaining amount validation before claim linking
- Controller endpoints for pre-auth management
- 16 tests passing for pre-auth functionality

#### ✅ Task 23: Implement appeals and disputes
- Appeals service for rejected and pended claims
- Appeal submission with supporting documents
- Validation to prevent appeals on approved claims
- Prevention of duplicate pending appeals
- Appeal review workflow (approve/reject)
- Approval with optional revised amounts (partial approval)
- Claim status update on appeal approval
- Appeal status tracking (pending, approved, rejected)
- Appeal retrieval by ID, status, and claim
- Pending appeals queue for reviewers
- Appeal statistics (total, pending, approved, rejected, approval rate)
- Comprehensive audit logging for all appeal actions
- Controller endpoints for appeal management
- 17 tests passing for appeals functionality

#### ✅ Task 24: Implement claim payment scheduling
- Payment service for approved claims
- Payment scheduling for providers and member reimbursements
- Unique payment reference generation (PP/MR-YYYYMMDD-NNNNNN)
- Scheduled payment date calculation (business days)
- Payment batch generation (BATCH-YYYYMMDD-NNNN)
- Member statement generation with claim details
- Provider remittance advice generation
- Unique statement numbers (MEM/RA-YYYYMMDD-NNNNNN)
- Mark claims as paid functionality
- Period-based statement generation
- Comprehensive audit logging for all payment actions
- Controller endpoints for payment and statement management
- Property tests for payment scheduling (Property 32)
- Property tests for statement generation (Property 33)
- 12 tests passing for payment functionality

### Phase 6: Payments and Financial Management (In Progress)

#### ✅ Task 26: Implement payment mandate management
- Mandate service with creation and validation
- Bank account validation (account number, type, branch code)
- Mandate status management (pending, active, cancelled, expired)
- DebiCheck reference support
- Mandate activation workflow
- Mandate cancellation with reason tracking
- Mandate expiry management (3-year expiry)
- Active mandate retrieval for members
- Mandates expiring soon detection (30-day window)
- Comprehensive audit logging for all mandate operations
- Controller endpoints for mandate management
- 21 tests passing for mandate functionality

**API Endpoints:**
- POST /api/v1/payments/mandates - Create mandate
- GET /api/v1/payments/mandates/:mandateId - Get mandate
- GET /api/v1/payments/mandates/member/:memberId - Get member mandates
- GET /api/v1/payments/mandates/member/:memberId/active - Get active mandate
- PUT /api/v1/payments/mandates/:mandateId/activate - Activate mandate
- PUT /api/v1/payments/mandates/:mandateId/cancel - Cancel mandate
- GET /api/v1/payments/mandates/:mandateId/validate - Validate mandate
- GET /api/v1/payments/mandates/expiring/soon - Get expiring mandates

#### ✅ Task 27: Implement payment processing
- Payment processing service with gateway integration support
- Payment initiation with invoice and mandate validation
- Unique payment reference generation (PAY-YYYYMMDD-NNNNNN)
- Idempotent payment callback handling (prevents duplicate processing)
- Payment status management (pending, completed, failed, permanently_failed)
- Invoice status update on successful payment
- Payment failure tracking with reason codes
- Exponential backoff retry scheduling (1h, 4h, 24h, 72h)
- Maximum 4 retry attempts before permanent failure
- Refund request workflow with approval process
- Refund processing via gateway
- Refund status tracking (pending, approved, processed)
- Pending retry queue management
- Comprehensive audit logging for all payment operations
- Controller endpoints for payment and refund management
- 19 tests passing for payment processing functionality

**API Endpoints:**
- POST /api/v1/payments/process - Process payment
- POST /api/v1/payments/callback - Handle payment callback
- GET /api/v1/payments/:paymentId - Get payment by ID
- GET /api/v1/payments/reference/:paymentReference - Get payment by reference
- GET /api/v1/payments/invoice/:invoiceId/payments - Get invoice payments
- GET /api/v1/payments/retries/pending - Get pending retries
- POST /api/v1/payments/refunds - Request refund
- PUT /api/v1/payments/refunds/:refundId/approve - Approve refund
- PUT /api/v1/payments/refunds/:refundId/process - Process refund
- GET /api/v1/payments/refunds/:refundId - Get refund by ID
- GET /api/v1/payments/refunds/status/:status - Get refunds by status

#### ✅ Task 28: Implement collections and lapse management
- Collections service with debit order scheduling
- Invoice generation for billing periods
- Arrears processing with grace period calculation (30 days)
- Automatic policy lapse after grace period expiry
- Policy reinstatement workflow
- Arrears notification system (placeholder for messaging integration)
- Policies in arrears tracking
- Policies approaching lapse detection (7-day warning)
- Lapsed policies management
- Policy status history tracking
- Comprehensive audit logging for all collections operations
- Controller endpoints for collections management
- 13 tests passing for collections functionality

**API Endpoints:**
- POST /api/v1/payments/collections/debit-orders - Schedule debit order
- POST /api/v1/payments/collections/arrears/process - Process arrears
- GET /api/v1/payments/collections/arrears - Get policies in arrears
- GET /api/v1/payments/collections/approaching-lapse - Get policies approaching lapse
- POST /api/v1/payments/collections/lapse - Lapse policy
- POST /api/v1/payments/collections/reinstate - Reinstate policy
- GET /api/v1/payments/collections/lapsed - Get lapsed policies

#### ✅ Task 29: Implement double-entry ledger
- Ledger service with GL account management
- Double-entry journal posting with validation (debits = credits)
- Account balance calculation based on account type (asset, liability, equity, revenue, expense)
- Trial balance generation
- Cost centre management for expense tracking
- Account type validation (asset, liability, equity, revenue, expense)
- Balance tolerance checking (0.01 precision)
- Journal entry retrieval by ID and date range
- Account transaction history
- Comprehensive audit logging for all ledger operations
- Finance controller with ledger endpoints
- Finance module integration
- 12 tests passing for ledger functionality

**API Endpoints:**
- POST /api/v1/finance/accounts - Create GL account
- GET /api/v1/finance/accounts - Get all accounts
- GET /api/v1/finance/accounts/:accountId - Get account by ID
- GET /api/v1/finance/accounts/:accountId/balance - Get account balance
- GET /api/v1/finance/accounts/:accountId/transactions - Get account transactions
- POST /api/v1/finance/journal-entries - Post journal entry
- GET /api/v1/finance/journal-entries/:entryId - Get journal entry
- GET /api/v1/finance/journal-entries - Get journal entries by date range
- GET /api/v1/finance/trial-balance - Generate trial balance
- POST /api/v1/finance/cost-centres - Create cost centre
- GET /api/v1/finance/cost-centres - Get all cost centres
- GET /api/v1/finance/cost-centres/:costCentreId - Get cost centre by ID
- GET /api/v1/finance/cost-centres/:costCentreId/transactions - Get cost centre transactions

#### ✅ Task 30: Implement reconciliation engine
- Reconciliation service with bank statement import
- Bank statement line parsing and storage
- Payment matching by reference (exact match)
- Payment matching by amount and date (probable match)
- Match confidence levels (exact, probable, possible, none)
- Payment allocation to statement lines
- Invoice allocation support
- Unallocated payment tracking
- Unallocated statement line tracking
- Daily reconciliation execution
- Discrepancy detection and reporting
- Reconciliation status management (pending, reconciled)
- Comprehensive reconciliation reports
- Comprehensive audit logging for all reconciliation operations
- 16 tests passing for reconciliation functionality

**API Endpoints:**
- POST /api/v1/finance/bank-statements - Import bank statement
- GET /api/v1/finance/bank-statements/:statementId - Get bank statement
- POST /api/v1/finance/bank-statements/:statementId/match - Match payments
- POST /api/v1/finance/allocations - Allocate payment
- GET /api/v1/finance/unallocated-payments - Get unallocated payments
- GET /api/v1/finance/bank-statements/:statementId/unallocated-lines - Get unallocated lines
- POST /api/v1/finance/reconciliations/daily - Perform daily reconciliation
- GET /api/v1/finance/reconciliations/:reconciliationId - Get reconciliation
- GET /api/v1/finance/reconciliations - Get reconciliations by date range
- GET /api/v1/finance/reconciliations/discrepancies/pending - Get discrepancies
- GET /api/v1/finance/reconciliations/:reconciliationId/report - Generate report

#### ✅ Task 31: Implement broker and commission management
- Broker service with broker registration
- Broker role assignment to users
- Policy tracking by broker
- Commission calculation based on policy premiums
- Commission rate management (10% default)
- Commission type support (new_business)
- Commission status tracking (pending, paid)
- Commission statement generation
- Unique statement number generation (CS-YYYYMMDD-NNNNNN)
- Broker statistics (policies, commissions earned/pending)
- Comprehensive audit logging with formula, inputs, and results
- Broker controller with commission endpoints
- Broker module integration
- 11 tests passing for broker functionality

**API Endpoints:**
- POST /api/v1/brokers/register - Register broker
- GET /api/v1/brokers - Get all brokers
- GET /api/v1/brokers/:brokerId - Get broker by ID
- GET /api/v1/brokers/:brokerId/policies - Get broker policies
- GET /api/v1/brokers/:brokerId/statistics - Get broker statistics
- POST /api/v1/brokers/commissions/calculate - Calculate commissions
- GET /api/v1/brokers/:brokerId/commissions - Get broker commissions
- PUT /api/v1/brokers/commissions/:commissionId/mark-paid - Mark commission paid
- POST /api/v1/brokers/statements/generate - Generate commission statement
- GET /api/v1/brokers/statements/:statementId - Get statement by ID
- GET /api/v1/brokers/:brokerId/statements - Get broker statements

## Current Status

**Backend API:**
- ✅ Authentication & Authorization
- ✅ RBAC with separation of duties
- ✅ Audit logging infrastructure
- ✅ Database schema complete
- ✅ Member registration and onboarding
- ✅ KYC and FICA compliance
- ✅ Policy management with waiting periods
- ✅ POPIA data protection and compliance
- ✅ Product catalog with multi-step approval
- ✅ Rules engine with versioning and simulation
- ✅ PMB rules (Medical Scheme mode)
- ✅ Regime-specific workflows (underwriting & eligibility)
- ✅ Provider network management
- ✅ Claims intake with validation
- ✅ Claims adjudication with rules engine
- ✅ Fraud detection with anomaly scoring
- ✅ Pre-authorisation workflow
- ✅ Appeals and disputes
- ✅ Claim payment scheduling and statements
- ✅ Payment mandate management
- ✅ Payment processing with retry logic
- ✅ Collections and lapse management
- ✅ Double-entry ledger
- ✅ Bank reconciliation
- ✅ Broker commission management
- ✅ POPIA data subject requests
- ✅ Breach incident management
- ✅ Fraud detection and investigation
- ✅ Complaints and disputes management
- ✅ SARS reporting
- ✅ CMS and FSCA/PA regulatory reporting

**Frontend:**
- ✅ Basic Next.js setup
- ✅ Tailwind CSS configured
- ⏳ UI components (next phase)

## Next Steps

### Phase 3: Product Catalog and Rules Engine
- ✅ Task 12: Implement product catalog
- ✅ Task 13: Implement rules engine core
- ✅ Task 14: Implement PMB rules (Medical Scheme mode)
- ✅ Task 15: Implement regime-specific workflows
- ✅ Task 16: Checkpoint - Product catalog and rules engine complete

### Phase 4: Provider Network Management
- ✅ Task 17: Implement provider onboarding
- ✅ Task 18: Checkpoint - Provider network complete

### Phase 5: Claims Processing ✅ COMPLETE
- ✅ Task 19: Implement claims intake
- ✅ Task 20: Implement claims adjudication
- ✅ Task 21: Implement fraud detection for claims
- ✅ Task 22: Implement pre-authorisation workflow
- ✅ Task 23: Implement appeals and disputes
- ✅ Task 24: Implement claim payment scheduling
- ✅ Task 25: Checkpoint - Claims processing complete

**Phase 5 Summary:**
- 89 tests passing for claims processing (22 + 11 + 11 + 16 + 17 + 12)
- 35 API endpoints implemented
- Multi-channel claim intake with validation
- Rules engine adjudication with PMB protection
- Fraud detection with anomaly scoring
- Pre-authorisation workflow with utilisation tracking
- Appeals and disputes management
- Payment scheduling and statement generation
- 100% test pass rate maintained

### Phase 6: Payments and Financial Management (Complete ✅)
- ✅ Task 26: Implement payment mandate management
- ✅ Task 27: Implement payment processing
- ✅ Task 28: Implement collections and lapse management
- ✅ Task 29: Implement double-entry ledger
- ✅ Task 30: Implement reconciliation engine
- ✅ Task 31: Implement broker and commission management
- ✅ Task 32: Checkpoint - Payments and financial management complete

**Phase 6 Summary:**
- 92 tests passing for payments and financial management
- 61 API endpoints implemented
- Payment mandate management with DebiCheck support
- Payment processing with idempotent callbacks and retry logic
- Collections and lapse management with 30-day grace period
- Double-entry accounting ledger with trial balance
- Bank reconciliation with intelligent payment matching
- Broker commission management with audit trail
- 100% test pass rate maintained
- See PHASE6_CHECKPOINT.md for detailed verification

### Phase 7: Compliance and Regulatory (Complete ✅)
- ✅ Task 33: Implement POPIA data subject requests
- ✅ Task 34: Implement breach incident management
- ✅ Task 35: Implement fraud detection and investigation
- ✅ Task 36: Implement complaints and disputes management
- ✅ Task 37: Implement SARS reporting
- ✅ Task 38: Implement regulatory reporting
- ✅ Task 39: Checkpoint - Compliance and regulatory complete

**Phase 7 Summary:**
- 62 tests passing for compliance and regulatory (11 + 13 + 9 + 8 + 10 + 11)
- 68 API endpoints implemented
- POPIA data subject requests with 30-day statutory timeframe
- Breach incident management with auto-escalation
- Fraud detection with duplicate member and provider outlier detection
- Complaints management with SLA tracking and Ombud export
- SARS reporting with CSV file generation and audit trail
- CMS regulatory reporting (PMB dashboard, claims turnaround, complaints stats, provider network, member movement, solvency)
- FSCA/PA regulatory reporting (policy register, claims register, conduct metrics, product governance)
- 100% test pass rate maintained

### Phase 8: Marketing and CRM (Complete ✅)

#### ✅ Task 40: Implement lead management
- Lead service with multi-source capture (web, phone, email, referral, broker)
- Lead assignment to users
- Lead conversion tracking to policies
- Lead source and attribution tracking
- Lead status management (new, contacted, qualified, converted, lost)
- Lead retrieval by status and assigned user
- Lead statistics (total, converted, conversion rate)
- Comprehensive audit logging for all lead operations
- Controller endpoints for lead management
- 8 tests passing for lead functionality

**API Endpoints:**
- POST /api/v1/marketing/leads - Capture lead
- GET /api/v1/marketing/leads/:leadId - Get lead by ID
- GET /api/v1/marketing/leads/status/:status - Get leads by status
- GET /api/v1/marketing/leads/assigned/:userId - Get assigned leads
- PUT /api/v1/marketing/leads/:leadId/assign - Assign lead
- PUT /api/v1/marketing/leads/:leadId/convert - Convert lead
- PUT /api/v1/marketing/leads/:leadId/status - Update lead status
- GET /api/v1/marketing/leads/statistics - Get lead statistics
- GET /api/v1/marketing/leads/source/:source - Get leads by source
- GET /api/v1/marketing/leads/source/:source/statistics - Get source statistics
- GET /api/v1/marketing/leads/member/:memberId - Get member's lead

#### ✅ Task 41: Implement campaign management
- Campaign service with creation and management
- Message sending with consent verification (POPIA compliant)
- Opt-out processing with consent revocation
- Message logging for all sent messages
- Campaign status tracking (draft, active, paused, completed)
- Message status tracking (pending, sent, delivered, opened, clicked, failed)
- Consent-first marketing (Property 51)
- Opt-out processing (Property 52)
- Message logging (Property 53)
- Comprehensive audit logging for all campaign operations
- Controller endpoints for campaign management
- 10 tests passing for campaign functionality

**API Endpoints:**
- POST /api/v1/marketing/campaigns - Create campaign
- GET /api/v1/marketing/campaigns/:campaignId - Get campaign
- GET /api/v1/marketing/campaigns - Get all campaigns
- GET /api/v1/marketing/campaigns/status/:status - Get campaigns by status
- PUT /api/v1/marketing/campaigns/:campaignId/status - Update campaign status
- POST /api/v1/marketing/campaigns/:campaignId/send - Send message
- POST /api/v1/marketing/campaigns/opt-out - Process opt-out
- GET /api/v1/marketing/campaigns/:campaignId/messages - Get campaign messages
- GET /api/v1/marketing/campaigns/:campaignId/statistics - Get campaign statistics
- GET /api/v1/marketing/campaigns/member/:memberId/messages - Get member messages

#### ✅ Task 42.1: Implement referral programme
- Referral service with code generation
- Unique referral code generation (name-based + random digits)
- Referral conversion tracking
- Reward calculation (R100 per successful referral)
- Referral statistics (total, converted, conversion rate)
- Referral code validation
- Member referral history
- Comprehensive audit logging for all referral operations
- Controller endpoints for referral management
- 10 tests passing for referral functionality

**API Endpoints:**
- POST /api/v1/marketing/referrals/generate - Generate referral code
- GET /api/v1/marketing/referrals/code/:referralCode - Get referral by code
- POST /api/v1/marketing/referrals/convert - Track conversion
- GET /api/v1/marketing/referrals/member/:memberId - Get member's referrals
- GET /api/v1/marketing/referrals/member/:memberId/rewards - Calculate rewards
- GET /api/v1/marketing/referrals/statistics - Get statistics
- GET /api/v1/marketing/referrals/statistics/:memberId - Get member statistics

**Phase 8 Progress:**
- 28 tests passing for marketing and CRM (8 + 10 + 10)
- 28 API endpoints implemented
- Lead management with multi-source capture
- Campaign management with POPIA-compliant consent verification
- Referral programme with reward tracking
- 100% test pass rate maintained
- See PHASE8_CHECKPOINT.md for detailed verification

### Phase 9: User Interfaces - Member Portal (In Progress)

#### ✅ Task 44.1: Initialize Next.js 14 with App Router
**Implementation:**
- Next.js 14 with App Router configured
- TypeScript with strict mode enabled
- Tailwind CSS with shadcn/ui design system
- API client with JWT authentication
- Token refresh mechanism
- Authentication context provider
- Protected routes with redirect
- Login page with form validation
- Basic dashboard page

**Files Created:**
- `apps/frontend/src/lib/api-client.ts` - API client with authentication
- `apps/frontend/src/lib/utils.ts` - Utility functions (cn helper)
- `apps/frontend/src/contexts/auth-context.tsx` - Authentication context
- `apps/frontend/src/components/ui/button.tsx` - Button component
- `apps/frontend/src/components/ui/input.tsx` - Input component
- `apps/frontend/src/components/ui/card.tsx` - Card components
- `apps/frontend/src/app/login/page.tsx` - Login page
- `apps/frontend/src/app/dashboard/page.tsx` - Dashboard page
- `apps/frontend/src/app/layout.tsx` - Updated with AuthProvider
- `apps/frontend/src/app/page.tsx` - Updated landing page

**Features:**
- JWT token storage in localStorage
- Automatic token refresh on 401 responses
- Protected route pattern (redirect to login if not authenticated)
- User context available throughout the app
- Responsive design with Tailwind CSS
- shadcn/ui components for consistent styling

**API Client Features:**
- GET, POST, PUT, DELETE methods
- Automatic Authorization header injection
- Token refresh on expiry
- Error handling with typed errors
- Login, logout, register methods
- getCurrentUser method

**Authentication Flow:**
1. User logs in with email/password
2. API client stores access and refresh tokens
3. All API requests include Authorization header
4. On 401 response, automatically refresh token
5. Retry failed request with new token
6. If refresh fails, clear tokens and redirect to login

**Environment Configuration:**
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:3000/api/v1)

#### ✅ Task 44.2: Write unit tests for API client
**Implementation:**
- Jest testing framework configured
- Comprehensive API client tests
- Mock fetch and localStorage
- Test coverage for all authentication flows

**Files Created:**
- `apps/frontend/jest.config.js` - Jest configuration
- `apps/frontend/jest.setup.js` - Test setup with mocks
- `apps/frontend/src/lib/__tests__/api-client.test.ts` - API client tests
- `apps/frontend/package.json` - Updated with test dependencies

**Test Coverage:**
- Token Management (3 tests)
  - Set tokens in memory and localStorage
  - Clear tokens from memory and localStorage
  - Check authentication status
- Authentication Flow (5 tests)
  - Login successfully
  - Logout successfully
  - Clear tokens on logout failure
  - Register successfully
  - Get current user
- Token Refresh (3 tests)
  - Refresh token on 401 response
  - Clear tokens if refresh fails
  - No refresh attempt without refresh token
- HTTP Methods (4 tests)
  - GET request
  - POST request with data
  - PUT request with data
  - DELETE request
- Error Handling (3 tests)
  - Throw error for non-OK responses
  - Handle responses without JSON error body
  - Handle network errors
- Authorization Header (2 tests)
  - Include Authorization header when authenticated
  - No Authorization header when not authenticated

**Total Tests:** 20 tests covering all API client functionality

**Test Commands:**
```bash
cd apps/frontend
npm install
npm test              # Run tests once
npm run test:watch    # Run tests in watch mode
```

**Next Steps:**
- Install frontend dependencies: `cd apps/frontend && npm install`
- Run tests: `npm test`
- Start frontend dev server: `npm run dev` (runs on port 3001)
- Start backend dev server: `cd apps/backend && npm run dev` (runs on port 3000)
- Access frontend at http://localhost:3001
- Login with demo credentials: admin@day1main.com / admin123

#### ✅ Task 45: Implement public landing page
**Implementation:**
- Enhanced landing page with modern design
- Responsive layout for mobile/tablet/desktop
- Hero section with CTA buttons
- Trust indicators (POPIA, CMS, FICA)
- Features showcase with 6 key features
- Call-to-action section
- Comprehensive footer with navigation

**Files Updated:**
- `apps/frontend/src/app/page.tsx` - Enhanced landing page
- `apps/frontend/src/app/__tests__/page.test.tsx` - Landing page tests

**Landing Page Sections:**
1. **Navigation Bar**
   - Logo and branding
   - Sign In and Get Started buttons
   - Sticky navigation on scroll

2. **Hero Section**
   - Main headline: "Medical Coverage Made Simple"
   - Descriptive subheading
   - Primary and secondary CTA buttons
   - Trust indicators (POPIA, CMS, FICA compliant)

3. **Features Section**
   - 6 feature cards with icons:
     - Medical Schemes & Insurance
     - Claims Processing
     - POPIA Compliance
     - Payments & Billing
     - Regulatory Reporting
     - Provider Network
   - Responsive grid layout

4. **Call-to-Action Section**
   - "Ready to Get Started?" heading
   - Start Free Trial and Contact Sales buttons
   - Prominent primary-colored card

5. **Footer**
   - Company branding and description
   - 4 navigation columns:
     - Product (Features, Pricing, Documentation, API)
     - Company (About, Blog, Careers, Contact)
     - Legal (Privacy Policy, Terms, POPIA, Security)
   - Copyright notice

**Test Coverage (17 tests):**
- Page rendering
- Hero section content
- Trust indicators
- Features section (6 features)
- CTA section
- Footer sections and links
- Navigation links (Sign In, Get Started, Learn More)
- Responsive design elements

**Design Features:**
- Gradient background (blue-50 to white)
- Card-based feature showcase
- Icon-based visual hierarchy
- Consistent color scheme with primary brand color
- Hover effects on interactive elements
- Mobile-responsive grid layouts
- Accessible navigation structure

#### ✅ Task 46: Implement authenticated layout with sidebar
**Implementation:**
- Supabase-style collapsible sidebar layout
- Responsive design with mobile drawer
- Top bar with search and notifications
- User menu with dropdown
- Active route highlighting
- Smooth transitions and animations

**Files Created:**
- `apps/frontend/src/components/ui/dropdown-menu.tsx` - Dropdown menu component
- `apps/frontend/src/components/layout/sidebar-layout.tsx` - Sidebar layout component
- `apps/frontend/src/components/layout/__tests__/sidebar-layout.test.tsx` - Layout tests
- `apps/frontend/src/app/dashboard/page.tsx` - Updated with new layout

**Sidebar Features:**
1. **Collapsible Sidebar**
   - Desktop: Toggle between expanded (256px) and collapsed (64px)
   - Mobile: Slide-in drawer with backdrop
   - Smooth transitions (300ms ease-in-out)
   - Persistent state during navigation

2. **Navigation Items**
   - Dashboard (home icon)
   - Policies (document icon)
   - Claims (clipboard icon)
   - Payments (credit card icon)
   - Documents (file icon)
   - Profile (user icon)
   - Active route highlighting with primary color
   - Hover states for better UX

3. **Top Bar**
   - Mobile menu button (hamburger)
   - Search bar with icon
   - Notification bell icon
   - Responsive layout
   - Sticky positioning

4. **User Menu**
   - User avatar with initials
   - Full name and email display
   - Dropdown menu with:
     - Profile Settings
     - Account Settings
     - Log out
   - Collapsed state shows only avatar

5. **Responsive Behavior**
   - Desktop (lg+): Sidebar always visible, collapsible
   - Tablet/Mobile: Sidebar hidden, opens as drawer
   - Touch-friendly tap targets
   - Backdrop overlay on mobile
   - Smooth animations

**Dashboard Enhancements:**
- Quick stats cards (4 metrics)
- Quick action cards (3 actions)
- Recent claims list with status badges
- Integrated with sidebar layout
- Responsive grid layouts

**Test Coverage (13 tests):**
- Sidebar navigation items render
- User information display
- Children content rendering
- Search bar presence
- Active navigation highlighting
- Logo rendering
- Notification icon
- Mobile menu button
- Sidebar hidden on mobile by default
- User initials display
- Navigation link hrefs (dashboard, policies, claims)

**Design System:**
- Consistent spacing and padding
- Primary color for active states
- Gray scale for neutral elements
- Border colors for separation
- Hover states for interactivity
- Focus states for accessibility
- Smooth transitions throughout

#### ✅ Task 47.1-47.3, 47.5: Implement member portal pages
**Implementation:**
- Dashboard page with stats and quick actions
- Policies page with digital membership cards
- Claims page with submission form and history
- Payments page with invoices and payment methods

**Files Created:**
- `apps/frontend/src/app/policies/page.tsx` - Policies management page
- `apps/frontend/src/app/claims/page.tsx` - Claims submission and tracking
- `apps/frontend/src/app/payments/page.tsx` - Payment history and management

**Dashboard Page (47.1):**
- Welcome message with user name
- 4 quick stat cards:
  - Active Policies (2)
  - Pending Claims (3)
  - Next Payment (R2,450)
  - Coverage (100%)
- 3 quick action cards:
  - Submit a Claim
  - View Policies
  - Make a Payment
- Recent claims list with status badges
- Fully integrated with sidebar layout

**Policies Page (47.2):**
1. **Digital Membership Cards**
   - Gradient card design (primary and purple variants)
   - Member name and number
   - Plan type display
   - Day1Main branding

2. **Policy Details**
   - Premium amount (monthly)
   - Start and renewal dates
   - Coverage information
   - Covered members count

3. **Covered Members List**
   - Principal member
   - Spouse
   - Children/Dependants
   - Avatar with initials
   - Relationship labels

4. **Policy Documents**
   - Policy Schedule
   - Certificate of Cover
   - Benefit Guide
   - Download buttons
   - Icon-based visual hierarchy

5. **Actions**
   - View Benefits button
   - Download Card button

**Claims Page (47.3):**
1. **Claim Submission Form**
   - Claim type dropdown (8 types)
   - Service date picker
   - Provider name input
   - Amount input
   - Diagnosis code (ICD-10)
   - Procedure code
   - Additional notes textarea
   - Document upload area (drag & drop)
   - Submit and Cancel buttons
   - Toggle between form and list view

2. **Claims Summary**
   - Total claims count
   - Pending claims count
   - Approved claims count
   - Paid claims count

3. **Claims History**
   - Claim number (CLM-YYYYMMDD-NNN format)
   - Claim type
   - Provider name
   - Service date
   - Amount
   - Status badges (pending, approved, paid)
   - Approved amount display
   - Paid date display
   - View Details button

4. **Status Tracking**
   - Color-coded status badges:
     - Yellow: Pending/Under Review
     - Green: Approved
     - Blue: Paid
     - Red: Rejected

**Payments Page (47.5):**
1. **Payment Summary**
   - Next payment amount and due date
   - Pay Now button
   - Payment method display
   - Update Method button
   - Total paid for year
   - Payment count

2. **Outstanding Invoices**
   - Invoice number
   - Invoice date
   - Due date (highlighted)
   - Amount
   - Status badge
   - Pay Now button
   - Download button
   - Yellow highlight for pending

3. **Payment History**
   - Payment reference
   - Payment date
   - Payment method
   - Amount
   - Status (Completed)
   - Green checkmark icon

4. **Payment Method Management**
   - Bank account display
   - Masked account number
   - Primary badge
   - Edit button
   - Add Payment Method button

**Design Features:**
- Consistent card-based layouts
- Status badges with color coding
- Icon-based visual hierarchy
- Responsive grid layouts
- Hover effects on interactive elements
- Form validation ready
- Document upload UI
- Digital membership cards with gradients
- Professional color scheme

#### ✅ Task 47.4, 47.6, 47.7: Complete remaining member portal pages
**Implementation:**
- Pre-authorization page with request form and tracking
- Documents page with categorized document management
- Profile page with personal info, dependants, and consents

**Files Created:**
- `apps/frontend/src/app/preauth/page.tsx` - Pre-authorization management
- `apps/frontend/src/app/documents/page.tsx` - Document library
- `apps/frontend/src/app/profile/page.tsx` - Profile and settings

**Pre-Auth Page (47.4):**
1. **Pre-Auth Request Form**
   - Procedure type dropdown (7 types)
   - Planned procedure date
   - Provider/hospital name
   - Estimated amount
   - Diagnosis code (ICD-10)
   - Procedure code
   - Clinical notes textarea
   - Document upload (drag & drop)
   - Toggle between form and list

2. **Pre-Auth Summary**
   - Total requests count
   - Pending count
   - Approved count
   - Utilized count

3. **Pre-Auth Tracking**
   - Request number (PA-YYYYMMDD-NNN)
   - Procedure type and provider
   - Request and procedure dates
   - Estimated amount
   - Status badges (pending, approved, utilized)
   - Approved amount display
   - Expiry date and conditions
   - Utilization tracking

4. **Information Section**
   - When pre-auth is required
   - List of procedures requiring pre-auth
   - Emergency procedure note
   - Submission timeline guidance

**Documents Page (47.6):**
1. **Quick Stats**
   - Policy documents count (4)
   - Statements count (3)
   - Tax certificates count (2)
   - Claim documents count (2)

2. **Policy Documents**
   - Policy schedules
   - Certificates of cover
   - Benefit guides
   - Color-coded icons
   - File size and date display
   - Download buttons

3. **Tax Certificates**
   - Annual tax certificates for SARS
   - Tax year display
   - Issue date
   - Request certificate button
   - Orange-themed icons

4. **Monthly Statements**
   - Account statements by month
   - Statement date and size
   - Download functionality
   - Blue-themed icons

5. **Claim Documents**
   - Claim receipts
   - Supporting documents
   - Linked to claim numbers
   - Green-themed icons

**Profile Page (47.7):**
1. **Personal Information**
   - Edit mode toggle
   - First name, last name
   - Email address
   - Phone number
   - ID number (read-only)
   - Date of birth
   - Member since date
   - Save/Cancel buttons

2. **Contact Information**
   - Residential address
   - Postal address
   - Edit buttons per section
   - Formatted address display

3. **Dependants Management**
   - List of dependants
   - Avatar with initials
   - Relationship labels
   - ID number and DOB
   - Add dependant button
   - Edit/Remove buttons

4. **Privacy & Consents (POPIA)**
   - Processing consent
   - Marketing consent
   - Third-party sharing consent
   - Grant/Revoke buttons
   - Granted date display
   - POPIA compliance notice
   - Information card about POPIA

5. **Security Settings**
   - Password management
   - Last changed date
   - Two-factor authentication
   - Enable/Change buttons

**Phase 9 Summary:**
- ✅ Task 44: Frontend setup (API client + 20 tests)
- ✅ Task 45: Landing page (enhanced + 17 tests)
- ✅ Task 46: Sidebar layout (collapsible + 13 tests)
- ✅ Task 47: Member portal pages (7 of 7 sub-tasks complete)
  - Dashboard with stats and actions
  - Policies with digital cards
  - Claims with submission form
  - Pre-auth with tracking
  - Payments with invoices
  - Documents library
  - Profile with POPIA consents

**Total Frontend Pages:** 8 complete pages
- Landing page
- Login page
- Dashboard
- Policies
- Claims
- Pre-Auth
- Payments
- Documents
- Profile

**Design System Highlights:**
- Consistent card-based layouts throughout
- Color-coded status badges (yellow, green, blue, red)
- Icon-based visual hierarchy
- Responsive grid layouts (mobile, tablet, desktop)
- Form validation ready
- Document upload UI with drag & drop
- Digital membership cards with gradients
- Professional color scheme
- Hover and focus states
- Smooth transitions
- Accessible navigation
- POPIA compliance features

### Phase 10: Complete Frontend Build - ALL Pages (Complete ✅)

#### ✅ Task 49: Build ALL remaining frontend pages with demo data
**Implementation:**
- Created 21 additional frontend pages to achieve 100% backend coverage
- All pages include demo data, search/filter, statistics, and actions
- Updated sidebar navigation for all 7 roles
- Role-specific navigation menus

**Total Pages Created: 29 pages**

**Compliance Portal (5 pages):**
1. `/compliance/popia` - POPIA compliance dashboard
2. `/compliance/data-requests` - Data subject access requests (DSARs)
3. `/compliance/breaches` - Data breach incident tracking
4. `/compliance/complaints` - Complaints management
5. `/compliance/reports` - Regulatory reports

**Admin Finance Pages (4 pages):**
6. `/admin/finance/ledger` - General ledger and chart of accounts
7. `/admin/finance/journal-entries` - Journal entry management
8. `/admin/finance/reconciliation` - Bank reconciliation
9. `/admin/finance/trial-balance` - Trial balance report

**Admin Additional Pages (3 pages):**
10. `/admin/rules` - Rules engine management
11. `/admin/pmb` - PMB reference and checker (27 CDL conditions)
12. `/admin/regime` - Regime configuration (MSA & Insurance Act)

**Finance Portal (4 pages):**
13. `/finance/ledger` - Ledger viewer
14. `/finance/journal-entries` - Journal entries
15. `/finance/reconciliation` - Reconciliation interface
16. `/finance/trial-balance` - Trial balance

**Member Portal (2 pages):**
17. `/dependants` - Dependant management
18. `/consent` - Consent management with POPIA rights

**Broker Portal (2 pages):**
19. `/broker/quotes` - Quote management
20. `/broker/applications` - Application tracking

**Claims Assessor Portal (2 pages):**
21. `/claims-assessor/preauth` - Pre-authorization queue
22. `/claims-assessor/fraud` - Fraud detection cases

**Marketing Portal (4 pages - from Phase 8):**
23. `/marketing/leads` - Lead management
24. `/marketing/campaigns` - Campaign management
25. `/marketing/referrals` - Referral program
26. `/marketing/analytics` - Marketing analytics

**Admin Portal (3 pages - from Phase 8):**
27. `/admin/audit` - Audit log viewer
28. `/admin/kyc` - KYC verification dashboard
29. `/admin/roles` - RBAC role management

**Navigation Updates:**
- Admin (14 items): Dashboard, Members, Policies, Products, Claims, Providers, Finance, Brokers, Audit Log, KYC, Roles, Rules, PMB, Regime
- Finance Manager (7 items): Dashboard, Ledger, Journal Entries, Reconciliation, Trial Balance, Payments, Profile
- Compliance Officer (7 items): Dashboard, POPIA, Data Requests, Breaches, Complaints, Reports, Profile
- Claims Assessor (6 items): Dashboard, Claims Queue, Pre-Auth Queue, Fraud Cases, My Claims, Profile
- Broker (7 items): Dashboard, My Clients, Quotes, Applications, Policies, Commissions, Profile
- Member (8 items): Dashboard, My Policies, My Claims, Dependants, Payments, Documents, Consent, Profile
- Marketing Manager (6 items): Dashboard, Leads, Campaigns, Referrals, Analytics, Profile

**Backend Coverage: 100%**
All 20 backend modules now have frontend UI:
1. ✅ auth - Login pages
2. ✅ admin - Admin dashboard and management
3. ✅ broker - Broker portal with quotes and applications
4. ✅ claims - Claims management and assessment
5. ✅ compliance - Full compliance portal
6. ✅ marketing - Marketing portal with all features
7. ✅ payments - Payment tracking
8. ✅ policies - Policy management
9. ✅ providers - Provider management
10. ✅ audit - Audit log viewer
11. ✅ finance - Complete finance module
12. ✅ kyc - KYC verification dashboard
13. ✅ members - Member management with dependants
14. ✅ pmb - PMB reference and checker
15. ✅ popia - POPIA compliance and data subject rights
16. ✅ products - Product management
17. ✅ rbac - Role and permission management
18. ✅ regime - Regime configuration
19. ✅ rules - Rules engine management
20. ✅ supabase - Internal service (no UI needed)

**Design Features:**
- Consistent card-based layouts throughout
- Color-coded status badges (yellow, green, blue, red)
- Icon-based visual hierarchy
- Responsive grid layouts (mobile, tablet, desktop)
- Search and filter functionality on all pages
- Statistics cards with key metrics
- Action buttons (create, edit, delete, view)
- Demo data for all entities
- South African context (Rand currency, local providers)
- POPIA and PMB compliance features

**Phase 10 Summary:**
- ✅ 100% frontend coverage achieved
- ✅ 29 pages created with demo data
- ✅ All 7 role-based portals complete
- ✅ Navigation updated for all roles
- ✅ Consistent design system throughout
- ✅ Ready for backend API integration

See PHASE9_COMPLETE.md for detailed verification.

## API Endpoints Available

### Authentication
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- POST /api/v1/auth/logout
- POST /api/v1/auth/refresh
- GET /api/v1/auth/me

### MFA
- POST /api/v1/auth/mfa/totp/setup
- POST /api/v1/auth/mfa/totp/verify-setup
- POST /api/v1/auth/mfa/totp/verify
- GET /api/v1/auth/mfa/devices
- DELETE /api/v1/auth/mfa/devices/:id

### RBAC
- GET /api/v1/rbac/roles
- GET /api/v1/rbac/permissions
- GET /api/v1/rbac/users/:userId/roles
- GET /api/v1/rbac/users/:userId/permissions
- POST /api/v1/rbac/users/:userId/roles
- DELETE /api/v1/rbac/users/:userId/roles/:roleId
- GET /api/v1/rbac/me/roles
- GET /api/v1/rbac/me/permissions

### Audit
- GET /api/v1/audit/events
- GET /api/v1/audit/events/recent
- GET /api/v1/audit/events/entity/:entityType/:entityId
- GET /api/v1/audit/events/user/:userId
- GET /api/v1/audit/statistics
- GET /api/v1/audit/me

### Members
- POST /api/v1/members/register
- GET /api/v1/members/:memberId
- PUT /api/v1/members/:memberId
- POST /api/v1/members/:memberId/dependants
- POST /api/v1/members/:memberId/contacts
- POST /api/v1/members/:memberId/addresses
- POST /api/v1/members/:memberId/consents
- PUT /api/v1/members/:memberId/consents/:consentId/revoke

### KYC
- POST /api/v1/kyc/members/:memberId/perform
- GET /api/v1/kyc/members/:memberId/status
- PUT /api/v1/kyc/members/:memberId/risk-score
- POST /api/v1/kyc/members/:memberId/flag
- PUT /api/v1/kyc/flags/:flagId/resolve
- GET /api/v1/kyc/review-queue
- POST /api/v1/kyc/members/:memberId/edd

### Policies
- POST /api/v1/policies
- GET /api/v1/policies/:policyId
- PUT /api/v1/policies/:policyId/status
- POST /api/v1/policies/:policyId/endorsements
- GET /api/v1/policies/:policyId/status-history
- GET /api/v1/policies/member/:memberId
- GET /api/v1/policies/member/:memberId/coverage
- GET /api/v1/policies/:policyId/member/:memberId/waiting-period

### POPIA (Data Protection)
- GET /api/v1/popia/members/:memberId/data-report
- POST /api/v1/popia/data-access-request
- GET /api/v1/popia/classification/:entityType/:fieldName
- GET /api/v1/popia/encryption-fields/:entityType

### Products
- POST /api/v1/products
- GET /api/v1/products
- GET /api/v1/products/:productId
- POST /api/v1/products/:productId/approve
- POST /api/v1/products/:productId/reject
- POST /api/v1/products/:productId/publish
- GET /api/v1/products/pending-approval/:role
- GET /api/v1/products/:productId/approval-history

### Rules Engine
- POST /api/v1/rules/benefits/:benefitId
- POST /api/v1/rules/:ruleId/evaluate
- POST /api/v1/rules/simulate
- GET /api/v1/rules/benefits/:benefitId/active
- GET /api/v1/rules/benefits/:benefitId/history/:ruleName

### PMB (Prescribed Minimum Benefits)
- POST /api/v1/pmb/check-eligibility
- POST /api/v1/pmb/evaluate-dtp
- GET /api/v1/pmb/cdl-conditions
- GET /api/v1/pmb/dtps
- GET /api/v1/pmb/coverage-rules
- GET /api/v1/pmb/emergency-conditions

### Regime Configuration & Underwriting
- GET /api/v1/regime/config/:regime
- GET /api/v1/regime/onboarding-steps/:regime
- POST /api/v1/regime/underwriting/:memberId/:productId
- GET /api/v1/regime/underwriting/:memberId/:productId
- POST /api/v1/regime/eligibility/:memberId/:productId
- GET /api/v1/regime/validate-workflow/:regime/:workflow

### Providers
- POST /api/v1/providers/register
- GET /api/v1/providers/:providerId
- GET /api/v1/providers
- POST /api/v1/providers/:providerId/practices
- POST /api/v1/providers/:providerId/verify-credential
- POST /api/v1/providers/:providerId/verify-bank-account
- POST /api/v1/providers/:providerId/contracts
- POST /api/v1/providers/:providerId/networks
- POST /api/v1/providers/:providerId/authorizations
- DELETE /api/v1/providers/:providerId/authorizations/:authId

### Claims
- POST /api/v1/claims
- GET /api/v1/claims/:claimId
- GET /api/v1/claims/member/:memberId
- GET /api/v1/claims/provider/:providerId
- GET /api/v1/claims/status/:status
- GET /api/v1/claims/:claimId/status-history
- POST /api/v1/claims/:claimId/adjudicate
- PUT /api/v1/claims/:claimId/status
- POST /api/v1/claims/:claimId/fraud-score
- POST /api/v1/claims/fraud/investigations
- GET /api/v1/claims/fraud/investigations
- PUT /api/v1/claims/fraud/investigations/:caseId/close
- POST /api/v1/claims/preauth
- GET /api/v1/claims/preauth/:preauthId
- GET /api/v1/claims/preauth/status/:status
- GET /api/v1/claims/preauth/member/:memberId
- GET /api/v1/claims/preauth/queue/clinical-review
- POST /api/v1/claims/preauth/:preauthId/approve
- POST /api/v1/claims/preauth/:preauthId/reject
- POST /api/v1/claims/preauth/:preauthId/request-info
- GET /api/v1/claims/preauth/:preauthId/utilisation
- POST /api/v1/claims/preauth/:preauthId/validate-claim/:claimId
- POST /api/v1/claims/appeals
- GET /api/v1/claims/appeals/:appealId
- GET /api/v1/claims/appeals/status/:status
- GET /api/v1/claims/appeals/claim/:claimId
- GET /api/v1/claims/appeals/queue/pending
- GET /api/v1/claims/appeals/statistics
- POST /api/v1/claims/appeals/:appealId/approve
- POST /api/v1/claims/appeals/:appealId/reject
- POST /api/v1/claims/:claimId/schedule-payment
- POST /api/v1/claims/payments/batches
- PUT /api/v1/claims/:claimId/mark-paid
- POST /api/v1/claims/statements/member/:memberId
- POST /api/v1/claims/statements/provider/:providerId

### Compliance & Regulatory Reporting
- POST /api/v1/compliance/breach-incidents
- GET /api/v1/compliance/breach-incidents
- GET /api/v1/compliance/breach-incidents/:incidentId
- GET /api/v1/compliance/breach-incidents/number/:incidentNumber
- GET /api/v1/compliance/breach-incidents/queue/open
- GET /api/v1/compliance/breach-incidents/queue/critical
- GET /api/v1/compliance/breach-incidents/queue/unreported-critical
- GET /api/v1/compliance/breach-incidents/severity/:severity
- PUT /api/v1/compliance/breach-incidents/:incidentId/investigate
- PUT /api/v1/compliance/breach-incidents/:incidentId/report-to-regulator
- PUT /api/v1/compliance/breach-incidents/:incidentId/close
- GET /api/v1/compliance/breach-incidents/statistics/summary
- POST /api/v1/compliance/fraud/members/:memberId/detect-duplicates
- POST /api/v1/compliance/fraud/providers/:providerId/detect-outliers
- POST /api/v1/compliance/fraud/cases/:caseId/export-siu
- GET /api/v1/compliance/fraud/statistics
- POST /api/v1/compliance/complaints
- GET /api/v1/compliance/complaints
- GET /api/v1/compliance/complaints/:complaintId
- GET /api/v1/compliance/complaints/number/:complaintNumber
- GET /api/v1/compliance/complaints/queue/overdue-sla
- GET /api/v1/compliance/complaints/queue/approaching-sla
- PUT /api/v1/compliance/complaints/:complaintId/escalate
- POST /api/v1/compliance/complaints/auto-escalate
- PUT /api/v1/compliance/complaints/:complaintId/assign
- PUT /api/v1/compliance/complaints/:complaintId/resolve
- PUT /api/v1/compliance/complaints/:complaintId/close
- POST /api/v1/compliance/complaints/:complaintId/export-ombud
- GET /api/v1/compliance/complaints/statistics/summary
- GET /api/v1/compliance/complaints/root-cause/:rootCauseTag
- POST /api/v1/compliance/sars/submissions
- GET /api/v1/compliance/sars/submissions/:submissionNumber
- GET /api/v1/compliance/sars/submissions/tax-year/:taxYear
- GET /api/v1/compliance/sars/submissions/type/:submissionType
- PUT /api/v1/compliance/sars/submissions/:submissionNumber/mark-submitted
- GET /api/v1/compliance/sars/statistics
- GET /api/v1/compliance/reporting/cms/pmb
- GET /api/v1/compliance/reporting/cms/claims-turnaround
- GET /api/v1/compliance/reporting/cms/complaints
- GET /api/v1/compliance/reporting/cms/provider-network
- GET /api/v1/compliance/reporting/cms/member-movement
- GET /api/v1/compliance/reporting/cms/solvency
- GET /api/v1/compliance/reporting/fsca/policy-register
- GET /api/v1/compliance/reporting/fsca/claims-register
- GET /api/v1/compliance/reporting/fsca/conduct-metrics
- GET /api/v1/compliance/reporting/fsca/product-governance

### Regulatory Reporting
- GET /api/v1/compliance/reporting/cms/pmb
- GET /api/v1/compliance/reporting/cms/claims-turnaround
- GET /api/v1/compliance/reporting/cms/complaints
- GET /api/v1/compliance/reporting/cms/provider-network
- GET /api/v1/compliance/reporting/cms/member-movement
- GET /api/v1/compliance/reporting/cms/solvency
- GET /api/v1/compliance/reporting/fsca/policy-register
- GET /api/v1/compliance/reporting/fsca/claims-register
- GET /api/v1/compliance/reporting/fsca/conduct-metrics
- GET /api/v1/compliance/reporting/fsca/product-governance

### Marketing & CRM
- POST /api/v1/marketing/leads
- GET /api/v1/marketing/leads/:leadId
- GET /api/v1/marketing/leads/status/:status
- GET /api/v1/marketing/leads/assigned/:userId
- PUT /api/v1/marketing/leads/:leadId/assign
- PUT /api/v1/marketing/leads/:leadId/convert
- PUT /api/v1/marketing/leads/:leadId/status
- GET /api/v1/marketing/leads/statistics
- GET /api/v1/marketing/leads/source/:source
- GET /api/v1/marketing/leads/source/:source/statistics
- GET /api/v1/marketing/leads/member/:memberId
- POST /api/v1/marketing/campaigns
- GET /api/v1/marketing/campaigns/:campaignId
- GET /api/v1/marketing/campaigns
- GET /api/v1/marketing/campaigns/status/:status
- PUT /api/v1/marketing/campaigns/:campaignId/status
- POST /api/v1/marketing/campaigns/:campaignId/send
- POST /api/v1/marketing/campaigns/opt-out
- GET /api/v1/marketing/campaigns/:campaignId/messages
- GET /api/v1/marketing/campaigns/:campaignId/statistics
- GET /api/v1/marketing/campaigns/member/:memberId/messages
- POST /api/v1/marketing/referrals/generate
- GET /api/v1/marketing/referrals/code/:referralCode
- POST /api/v1/marketing/referrals/convert
- GET /api/v1/marketing/referrals/member/:memberId
- GET /api/v1/marketing/referrals/member/:memberId/rewards
- GET /api/v1/marketing/referrals/statistics
- GET /api/v1/marketing/referrals/statistics/:memberId

### Payments & Mandates
- POST /api/v1/payments/mandates
- GET /api/v1/payments/mandates/:mandateId
- GET /api/v1/payments/mandates/member/:memberId
- GET /api/v1/payments/mandates/member/:memberId/active
- PUT /api/v1/payments/mandates/:mandateId/activate
- PUT /api/v1/payments/mandates/:mandateId/cancel
- GET /api/v1/payments/mandates/:mandateId/validate
- GET /api/v1/payments/mandates/expiring/soon
- POST /api/v1/payments/process
- POST /api/v1/payments/callback
- GET /api/v1/payments/:paymentId
- GET /api/v1/payments/reference/:paymentReference
- GET /api/v1/payments/invoice/:invoiceId/payments
- GET /api/v1/payments/retries/pending
- POST /api/v1/payments/refunds
- PUT /api/v1/payments/refunds/:refundId/approve
- PUT /api/v1/payments/refunds/:refundId/process
- GET /api/v1/payments/refunds/:refundId
- GET /api/v1/payments/refunds/status/:status
- POST /api/v1/payments/collections/debit-orders
- POST /api/v1/payments/collections/arrears/process
- GET /api/v1/payments/collections/arrears
- GET /api/v1/payments/collections/approaching-lapse
- POST /api/v1/payments/collections/lapse
- POST /api/v1/payments/collections/reinstate
- GET /api/v1/payments/collections/lapsed

## Test Credentials

**Admin User:**
- Email: admin@day1main.com
- Password: admin123
- Role: system_admin

## Setup Instructions

```bash
# Install dependencies
pnpm install

# Start Docker services
docker-compose up -d

# Setup database
cd apps/backend
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed

# Start development servers
pnpm dev
```

## Architecture Highlights

- **Modular Architecture**: Clear separation of concerns
- **Compliance by Construction**: POPIA, FICA, SARS compliance built-in
- **Audit Everything**: Immutable audit trail for all critical operations
- **Separation of Duties**: Multi-step approvals, role restrictions
- **Type Safety**: Full TypeScript coverage
- **Property-Based Testing**: Ready for correctness verification

## Test Statistics

- **421 tests passing** across 32 test suites
  - 15 KYC tests
  - 14 Policies tests
  - 24 POPIA tests
  - 17 Products tests
  - 16 Rules tests
  - 22 PMB tests
  - 24 Regime tests
  - 18 Providers tests
  - 22 Claims tests
  - 11 Adjudication tests
  - 11 Fraud Detection tests
  - 16 Pre-Auth tests
  - 17 Appeals tests
  - 12 Payment tests
  - 21 Mandate tests
  - 19 Payment Processing tests
  - 13 Collections tests
  - 12 Ledger tests
  - 16 Reconciliation tests
  - 11 Broker tests
  - 11 Data Subject Request tests
  - 13 Breach Incident tests
  - 9 Fraud Service tests
  - 8 Complaints tests
  - 10 SARS Reporting tests
  - 11 Regulatory Reporting tests
  - 8 Lead Management tests
  - 10 Campaign Management tests
  - 10 Referral Programme tests
- Property-based tests for all major features
- 100% test pass rate maintained

## Database Statistics

- 80+ tables
- 16 roles
- 50+ permissions
- Proper indexing for performance
- Foreign key relationships for data integrity
- Audit trail with immutability

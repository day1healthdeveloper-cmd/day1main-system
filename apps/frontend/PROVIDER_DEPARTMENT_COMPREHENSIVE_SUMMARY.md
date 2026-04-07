PROVIDER DEPARTMENT - COMPREHENSIVE SUMMARY

================================================================================

OVERVIEW
The Provider Department manages healthcare providers (doctors, dentists, specialists, hospitals, pharmacies) who deliver medical services to members. The system handles provider onboarding, credentialing, network management, claims submission, payment processing, and performance monitoring.

================================================================================

DATABASE SCHEMA
bm
--------------------------------------------------------------------------------

PROVIDERS TABLE (Main Provider Table)

CORE IDENTIFICATION
- id (UUID, Primary Key) - Unique provider identifier
- provider_number (TEXT) - Human-readable provider number (Format: DENT000002, DOC000123)
- name (TEXT) - Provider's full name or practice name
- type (TEXT) - Provider type (e.g., "Dentist", "GP", "Specialist", "Hospital")
- practice_name (TEXT) - Official practice/clinic name

CONTACT INFORMATION
- email (TEXT) - Primary email address
- phone (TEXT) - Primary phone number
- tel (TEXT) - Alternative telephone number
- fax (TEXT) - Fax number
- address (TEXT) - Physical address
- suburb (TEXT) - Suburb/area
- region (TEXT) - Region/city
- disp_province (TEXT) - Province

PROFESSIONAL DETAILS
- profession (TEXT) - Professional category (e.g., "Dentist", "General Practitioner")
- doctor_surname (TEXT) - Surname for individual practitioners
- prno (TEXT) - Practice number
- hpcsa_number (TEXT) - Health Professions Council of South Africa registration number
- hpcsa_verified_at (TIMESTAMP) - When HPCSA registration was verified
- pcns_practice_number (TEXT) - PCNS (Provider Classification and Numbering System) number
- pcns_verified_at (TIMESTAMP) - When PCNS was verified

STATUS AND WORKFLOW
- status (TEXT) - Current provider status:
  - active - Actively providing services
  - pending - Onboarding in progress
  - inactive - Temporarily inactive
  - suspended - Suspended from network
  - terminated - Contract terminated
- is_active (BOOLEAN) - Quick active/inactive flag
- created_at (TIMESTAMP) - Record creation timestamp
- updated_at (TIMESTAMP) - Last update timestamp



AUTHENTICATION AND ACCESS
- user_id (UUID, Foreign Key) - Links to users table for portal access
- login_email (TEXT) - Email for portal login
- login_password (TEXT) - Password for portal login (hashed)

NETWORK AND CONTRACTING
- provider_tier (TEXT) - Network tier:
  - network - In-network provider (preferred rates)
  - out_of_network - Out-of-network provider
  - preferred - Preferred provider (best rates)
- tariff_rate_percentage (NUMERIC) - Percentage of standard tariff (e.g., 100, 120, 80)
- direct_payment_status (TEXT) - Payment arrangement status:
  - active - Direct payment enabled
  - suspended - Payment suspended
  - member_pays - Member pays provider directly
- contract_start_date (DATE) - Contract effective date
- contract_end_date (DATE) - Contract expiry date
- termination_reason (TEXT) - Reason if contract terminated

COMPLIANCE AND INSURANCE
- professional_indemnity_expiry (DATE) - Professional indemnity insurance expiry date
- last_fraud_review_date (DATE) - Last fraud risk assessment date

PERFORMANCE AND RISK
- fraud_risk_score (NUMERIC) - Calculated fraud risk score (0-100)
- performance_rating (NUMERIC) - Provider performance rating (1-5 stars)

================================================================================

USER ROLES AND ACCESS

--------------------------------------------------------------------------------

1. PROVIDER (Healthcare Professional)
Access: Provider Portal
Capabilities:
  - Submit claims for services rendered
  - Check member eligibility before treatment
  - Request pre-authorizations
  - View claim status and history
  - View payment history and statements
  - Update practice information
  - Upload supporting documents
  - View performance metrics

2. ADMIN (Provider Management Team)
Access: Admin Dashboard - Provider Management Section
Capabilities:
  - Onboard new providers
  - Verify credentials (HPCSA, PCNS)
  - Create provider portal accounts
  - Update provider information
  - Manage network tiers and tariff rates
  - Suspend/terminate providers
  - View provider performance
  - Generate provider reports
  - Process provider payments
  - Manage contracts

3. OPERATIONS MANAGER
Access: Operations Dashboard
Capabilities:
  - Provider onboarding workflow
  - Credential verification
  - Contract management
  - Provider communications
  - Network optimization



================================================================================

WORKFLOWS

--------------------------------------------------------------------------------

A. PROVIDER ONBOARDING FLOW

1. Admin receives provider application
2. Provider record created with status 'pending'
3. Provider number generated (e.g., DENT000002)
4. Credential verification:
   - HPCSA registration verified
   - PCNS number verified
   - Professional indemnity insurance checked
5. Contract negotiation:
   - Network tier assigned
   - Tariff rate agreed
   - Payment terms set
6. Portal account created:
   - login_email and login_password set
   - user_id linked to auth system
7. Provider status changed to 'active'
8. Provider receives welcome email with portal credentials
9. Provider can start submitting claims

--------------------------------------------------------------------------------

B. CREDENTIAL VERIFICATION FLOW

1. Provider submits HPCSA number
2. System verifies with HPCSA registry (manual or API)
3. If valid:
   - hpcsa_number stored
   - hpcsa_verified_at timestamp set
4. Provider submits PCNS practice number
5. System verifies with PCNS database
6. If valid:
   - pcns_practice_number stored
   - pcns_verified_at timestamp set
7. Professional indemnity insurance certificate uploaded
8. Expiry date recorded in professional_indemnity_expiry
9. All credentials verified: Provider eligible for activation

--------------------------------------------------------------------------------

C. CLAIM SUBMISSION FLOW (Provider Side)

1. Provider logs into portal
2. Checks member eligibility
3. Provides treatment/service
4. Submits claim via portal:
   - Member details
   - Service date
   - ICD-10 diagnosis codes
   - Tariff codes
   - Claimed amount
5. System validates:
   - Provider is active
   - Member is active and covered
   - Service is within benefit limits
6. Claim created with provider_id link
7. Provider receives claim number
8. Provider can track claim status
9. Once approved: Payment processed
10. Provider receives payment notification

--------------------------------------------------------------------------------

D. PROVIDER SUSPENSION FLOW

1. Trigger event:
   - Fraud alert
   - Credential expiry
   - Contract breach
   - Quality issues
2. Admin reviews case
3. Decision to suspend:
   - status changed to 'suspended'
   - direct_payment_status changed to 'suspended'
   - termination_reason documented
4. Provider notified
5. Existing claims processed
6. New claims blocked
7. Investigation/remediation period
8. Resolution:
   - REINSTATE: status back to 'active'
   - TERMINATE: status changed to 'terminated'



================================================================================

API ENDPOINTS

--------------------------------------------------------------------------------

ADMIN ENDPOINTS (Provider Management)
- GET /api/admin/providers - Get all providers (paginated, returns 1916 providers)
- POST /api/admin/providers - Create new provider
- GET /api/admin/providers/[id] - Get specific provider details
- PUT /api/admin/providers/[id] - Update provider information
- DELETE /api/admin/providers/[id] - Delete provider
- POST /api/admin/providers/[id]/create-account - Create portal account for provider
- GET /api/admin/dashboard/stats - Get system stats (includes total providers count)

PROVIDER PORTAL ENDPOINTS
- GET /api/provider/claims - Get provider's claims history
- POST /api/provider/claims/submit - Submit new claim
- GET /api/provider/claims/[id] - Get specific claim details
- GET /api/provider/dashboard - Get provider dashboard stats
- POST /api/provider/eligibility/check - Check member eligibility
- POST /api/provider/preauth/submit - Submit pre-authorization request

================================================================================

FRONTEND PAGES

--------------------------------------------------------------------------------

ADMIN PORTAL (Provider Management)

1. Provider List (/admin/providers)
   - All 1916 providers displayed
   - Search and filter capabilities
   - Quick stats (total, active, pending, inactive)
   - Bulk actions
   - Export to CSV

2. Provider Details (/admin/providers/[id])
   - Full provider information
   - Credential status
   - Contract details
   - Performance metrics
   - Claims history
   - Payment history
   - Edit capabilities

3. Add Provider (/admin/providers/new)
   - Provider information form
   - Contact details
   - Professional credentials
   - Network tier selection
   - Contract terms
   - Create portal account option

4. Provider Onboarding (/operations/providers)
   - Onboarding workflow
   - Credential verification checklist
   - Document upload
   - Status tracking

--------------------------------------------------------------------------------

PROVIDER PORTAL

1. Dashboard (/provider/dashboard)
   - Recent claims summary
   - Payment summary
   - Quick stats (total claims, pending, approved, paid)
   - Quick actions (submit claim, check eligibility)
   - Important notifications

2. Check Eligibility (/provider/eligibility)
   - Member number lookup
   - Real-time eligibility check
   - Benefit information
   - Coverage limits
   - Pre-authorization requirements

3. Submit Claim (/provider/claims/submit)
   - Member verification
   - Service details form
   - ICD-10 diagnosis code entry
   - Tariff code entry
   - Multiple claim lines
   - Document upload
   - Total amount calculation
   - Submit button

4. Claims History (/provider/claims/history)
   - All submitted claims
   - Status tracking (pending, approved, rejected, paid)
   - Filter by date, status, member
   - Search by claim number
   - View claim details
   - Download claim documents

5. Pre-Authorization (/provider/preauth)
   - Submit pre-auth requests
   - View pre-auth status
   - Pre-auth history

6. Payments (/provider/payments)
   - Payment history
   - Payment statements
   - Outstanding payments
   - Payment method details
   - Download statements



================================================================================

KEY FEATURES

--------------------------------------------------------------------------------

1. CREDENTIAL MANAGEMENT
- HPCSA registration verification
- PCNS practice number validation
- Professional indemnity insurance tracking
- Automatic expiry notifications
- Compliance monitoring

2. NETWORK MANAGEMENT
- Multi-tier network structure (network, out-of-network, preferred)
- Flexible tariff rate configuration
- Geographic coverage tracking
- Provider capacity management
- Network optimization tools

3. PORTAL ACCESS
- Secure authentication system
- Custom login credentials per provider
- Role-based access control
- Session management
- Password reset functionality

4. CLAIMS INTEGRATION
- Direct claim submission from portal
- Real-time claim status tracking
- Automated claim validation
- Document attachment support
- Claim history and reporting

5. PAYMENT MANAGEMENT
- Direct payment to providers
- Payment status tracking
- Statement generation
- Payment reconciliation
- Multiple payment methods support

6. PERFORMANCE MONITORING
- Performance rating system (1-5 stars)
- Fraud risk scoring
- Claims approval rate tracking
- Average processing time
- Member satisfaction scores

7. COMPLIANCE AND AUDIT
- Credential expiry tracking
- Contract compliance monitoring
- Fraud detection and prevention
- Audit trail for all changes
- Regulatory reporting

================================================================================

CURRENT STATISTICS

Total Providers in System: 1916
Active Providers: Majority
Provider Types: Dentist, GP, Specialist, Hospital, Pharmacy, etc.
Sample Provider Number: DENT000002
Network Tiers: network, out_of_network, preferred
Authentication: Custom login system with email/password

================================================================================

INTEGRATION POINTS

--------------------------------------------------------------------------------

1. CLAIMS SYSTEM
- Provider submits claims
- Claims linked to provider_id
- Payment flows back to provider
- Performance metrics calculated from claims

2. MEMBERS SYSTEM
- Eligibility checking
- Member verification before treatment
- Benefit limit checking
- Coverage validation

3. FINANCE SYSTEM
- Payment processing
- Provider statements
- Reconciliation
- Tax reporting
- Banking integration

4. CREDENTIALING SYSTEMS
- HPCSA registry integration
- PCNS database integration
- Professional indemnity verification
- Qualification verification

5. AUTHENTICATION SYSTEM
- User account creation
- Portal access management
- Role assignment
- Session management



================================================================================

PROVIDER TYPES AND SPECIALIZATIONS

--------------------------------------------------------------------------------

COMMON PROVIDER TYPES
- Dentist - Dental practitioners and oral health specialists
- GP (General Practitioner) - Primary care physicians
- Specialist - Medical specialists (cardiologist, orthopedic, etc.)
- Hospital - Hospital facilities
- Pharmacy - Pharmacies and dispensaries
- Physiotherapist - Physical therapy practitioners
- Optometrist - Eye care specialists
- Psychologist - Mental health professionals
- Radiologist - Imaging and radiology services
- Pathologist - Laboratory and pathology services

NETWORK TIERS EXPLAINED
- Network: Standard in-network providers with agreed rates
- Preferred: Premium providers with best rates and quality
- Out-of-Network: Providers outside the network (higher member cost)

TARIFF RATE EXAMPLES
- 100% - Standard network rate
- 120% - Premium rate for specialists
- 80% - Discounted rate for high-volume providers
- 150% - Out-of-network rate

================================================================================

PROVIDER PORTAL AUTHENTICATION

--------------------------------------------------------------------------------

AUTHENTICATION METHOD
- Custom authentication system (not Supabase Auth initially)
- Credentials stored in providers table:
  - login_email
  - login_password (hashed)
- Session stored in localStorage with 24-hour expiry
- Provider session includes:
  - provider.id
  - provider.email
  - provider.firstName
  - provider.lastName
  - roles: ['provider']

LOGIN PROCESS
1. Provider enters email and password
2. System checks providers table for matching credentials
3. If valid: Session created and stored
4. Provider redirected to dashboard
5. Session validated on each page load
6. Auto-logout after 24 hours

EXAMPLE PROVIDER CREDENTIALS
- Email: nxamalo1@gmail.com
- Password: 223344
- Provider: NXAMALO ZN

================================================================================

FRAUD DETECTION AND RISK MANAGEMENT

--------------------------------------------------------------------------------

FRAUD RISK SCORING
- Automated risk score calculation (0-100)
- Factors considered:
  - Claim frequency patterns
  - Unusual billing patterns
  - Duplicate claims
  - Out-of-scope services
  - Member complaints
  - Industry benchmarks

RISK SCORE THRESHOLDS
- 0-30: Low risk (green)
- 31-60: Medium risk (yellow)
- 61-80: High risk (orange)
- 81-100: Critical risk (red)

FRAUD REVIEW PROCESS
1. Automated system flags high-risk providers
2. Fraud specialist reviews provider history
3. Investigation conducted
4. Outcomes:
   - CLEARED: Continue normal operations
   - MONITORING: Enhanced monitoring period
   - SUSPENDED: Temporary suspension pending investigation
   - TERMINATED: Contract terminated

FRAUD PREVENTION MEASURES
- Real-time claim validation
- Pattern detection algorithms
- Peer comparison analysis
- Member feedback integration
- Regular audits
- Credential verification



================================================================================

PAYMENT AND FINANCIAL MANAGEMENT

--------------------------------------------------------------------------------

PAYMENT ARRANGEMENTS

Direct Payment (direct_payment_status: 'active')
- Medical scheme pays provider directly
- Fastest payment method
- Requires banking details on file
- Payment within 7-14 days of approval

Member Pays (direct_payment_status: 'member_pays')
- Member pays provider at time of service
- Member submits claim for reimbursement
- Provider receives immediate payment
- Member waits for reimbursement

Suspended Payment (direct_payment_status: 'suspended')
- Payment temporarily suspended
- Usually due to fraud investigation or credential issues
- Existing approved claims still paid
- New claims not paid until resolved

PAYMENT PROCESSING FLOW
1. Claim approved by assessor
2. Approved amount calculated based on tariff rate
3. Payment instruction created
4. Banking details verified
5. Payment processed (EFT/Direct Deposit)
6. Payment reference generated
7. Provider notified
8. Statement updated

TARIFF RATE CALCULATION
Example: Consultation with tariff code 0190
- Standard tariff: R500
- Provider tariff rate: 120%
- Calculated amount: R500 x 1.20 = R600
- Scheme pays: R600 (if in-network)

================================================================================

PERFORMANCE METRICS AND REPORTING

--------------------------------------------------------------------------------

KEY PERFORMANCE INDICATORS (KPIs)

1. CLAIMS METRICS
   - Total claims submitted
   - Claims approval rate
   - Average claim amount
   - Claims rejection rate
   - Average processing time

2. QUALITY METRICS
   - Member satisfaction score
   - Complaint rate
   - Re-admission rate (hospitals)
   - Treatment success rate
   - Adherence to protocols

3. FINANCIAL METRICS
   - Total payments received
   - Average payment per claim
   - Outstanding payments
   - Payment turnaround time

4. COMPLIANCE METRICS
   - Credential status (current/expired)
   - Contract compliance rate
   - Documentation completeness
   - Fraud risk score

5. OPERATIONAL METRICS
   - Member volume served
   - Service capacity utilization
   - Response time to pre-auth requests
   - Portal usage frequency

REPORTING CAPABILITIES
- Monthly provider statements
- Performance scorecards
- Claims summary reports
- Payment reconciliation reports
- Compliance status reports
- Network utilization reports



================================================================================

CONTRACT MANAGEMENT

--------------------------------------------------------------------------------

CONTRACT LIFECYCLE

1. NEGOTIATION PHASE
   - Network tier discussion
   - Tariff rate negotiation
   - Service scope definition
   - Geographic coverage agreement
   - Payment terms agreement

2. ACTIVATION PHASE
   - Contract signed
   - contract_start_date set
   - contract_end_date set (typically 1-3 years)
   - Provider status changed to 'active'
   - Portal access granted

3. ACTIVE PHASE
   - Provider delivers services
   - Claims submitted and processed
   - Performance monitored
   - Compliance tracked
   - Regular reviews conducted

4. RENEWAL PHASE
   - 90 days before expiry: Renewal notice
   - Performance review conducted
   - Terms renegotiated if needed
   - New contract_end_date set
   - Contract extended

5. TERMINATION PHASE
   - Notice period (typically 30-90 days)
   - Reason documented in termination_reason
   - Existing claims processed
   - Final payment processed
   - Portal access revoked
   - Status changed to 'terminated'

TERMINATION REASONS
- Contract expiry (natural end)
- Provider request
- Fraud confirmed
- Credential issues
- Quality concerns
- Breach of contract
- Business closure
- Relocation out of service area

================================================================================

GEOGRAPHIC COVERAGE

--------------------------------------------------------------------------------

LOCATION TRACKING
- address: Physical practice address
- suburb: Suburb/neighborhood
- region: City/town
- disp_province: Province

NETWORK OPTIMIZATION
- Geographic gap analysis
- Provider density mapping
- Member accessibility assessment
- Service area coverage
- Travel distance calculations

REGIONAL MANAGEMENT
- Regional provider coordinators
- Area-specific contracts
- Local tariff variations
- Regional performance tracking

================================================================================

FUTURE ENHANCEMENTS (POTENTIAL)

1. Automated credential verification via API integration
2. Real-time eligibility checking at point of service
3. Mobile app for providers
4. Telemedicine provider integration
5. AI-powered fraud detection
6. Automated contract renewal workflows
7. Provider self-service credential updates
8. Integrated appointment booking system
9. Provider-to-provider referral system
10. Quality outcome tracking and reporting
11. Patient feedback and rating system
12. Automated payment reconciliation
13. Provider training and certification tracking
14. Network adequacy analysis tools
15. Predictive analytics for provider performance



================================================================================

TECHNICAL NOTES

--------------------------------------------------------------------------------

DATABASE RELATIONSHIPS

providers
  - Links to users (user_id) for portal authentication
  - Links to claims (provider_id) - one-to-many
  - Links to pre_authorizations (provider_id) - one-to-many
  - Links to payments (provider_id) - one-to-many

DATA TYPES
- Amounts stored as NUMERIC for precision
- Dates stored as DATE type
- Timestamps stored as TIMESTAMP WITH TIME ZONE
- UUIDs used for all primary keys
- Text fields for flexible string data

PERFORMANCE CONSIDERATIONS
- Indexes on: provider_number, status, type, region
- Full-text search on name and practice_name
- Pagination for large provider lists (1916 providers)
- Caching for frequently accessed provider data
- Optimized queries for claims lookup by provider

SECURITY CONSIDERATIONS
- Login credentials hashed before storage
- Session tokens with expiry
- Role-based access control
- Audit logging for sensitive operations
- Secure document storage
- PII protection compliance

DATA MIGRATION NOTES
- 1916 providers imported from legacy system
- Provider numbers preserved from old system
- Contact information cleaned and standardized
- Credential verification status tracked
- Historical data maintained for continuity

================================================================================

PROVIDER ONBOARDING CHECKLIST

--------------------------------------------------------------------------------

STEP 1: BASIC INFORMATION
- Provider name
- Practice name
- Provider type
- Contact details (email, phone, fax)
- Physical address

STEP 2: PROFESSIONAL CREDENTIALS
- HPCSA registration number
- HPCSA verification
- PCNS practice number
- PCNS verification
- Professional qualifications
- Specialization details

STEP 3: COMPLIANCE DOCUMENTS
- Professional indemnity insurance certificate
- Insurance expiry date
- Practice license
- Tax clearance certificate
- Banking details for payments

STEP 4: CONTRACT TERMS
- Network tier selection
- Tariff rate agreement
- Service scope definition
- Geographic coverage
- Contract start and end dates

STEP 5: PORTAL ACCESS
- Create user account
- Set login email
- Generate temporary password
- Assign provider role
- Send welcome email with credentials

STEP 6: ACTIVATION
- Final verification check
- Status changed to 'active'
- Provider added to network directory
- Claims submission enabled
- Payment processing enabled

================================================================================

SUPPORT AND TRAINING

--------------------------------------------------------------------------------

PROVIDER SUPPORT CHANNELS
- Dedicated provider helpline
- Email support
- Portal help center
- Training webinars
- User guides and documentation
- FAQ section
- Video tutorials

TRAINING TOPICS
- Portal navigation
- Claim submission process
- Eligibility checking
- Pre-authorization requests
- Document upload
- Payment tracking
- Performance metrics understanding

COMMON PROVIDER ISSUES
- Login problems: Password reset process
- Claim rejections: Coding errors, missing information
- Payment delays: Banking details, claim status
- Eligibility confusion: Coverage limits, benefit types
- Portal navigation: User guide reference

================================================================================

Document Generated: 2026-03-30
Last Updated: 2026-03-30

Total Providers: 1916
Active Provider Example: NXAMALO ZN (nxamalo1@gmail.com)
System Status: Operational

================================================================================

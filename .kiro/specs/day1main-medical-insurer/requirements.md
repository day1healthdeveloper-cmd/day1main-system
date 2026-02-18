# Requirements Document: Day1Main Medical Insurer System

## Introduction

Day1Main is a comprehensive South African medical insurer operating system designed to operate under the Insurance Act and Twin Peaks regulatory framework (FSCA/PA). The system handles the complete lifecycle of member management, products, partners, claims, payments, marketing, and governance with South African law and compliance requirements built into the architecture. This is an insurance business, NOT a medical scheme.

## Glossary

- **System**: Day1Main medical insurer operating system
- **Member**: An individual covered under an insurance policy
- **Policy**: An insurance contract between the System and a Member defining coverage and benefits
- **Claim**: A request for payment or reimbursement for medical services under an insurance policy
- **Provider**: A healthcare service provider (doctor, hospital, pharmacy, etc.)
- **Broker**: An intermediary who sells insurance policies on behalf of the System
- **FSCA**: Financial Sector Conduct Authority - conduct regulator for financial services
- **PA**: Prudential Authority - prudential regulator for financial institutions
- **POPIA**: Protection of Personal Information Act
- **FICA**: Financial Intelligence Centre Act
- **SARS**: South African Revenue Service
- **ICD-10**: International Classification of Diseases, 10th Revision
- **KYC**: Know Your Customer
- **CDD**: Customer Due Diligence
- **PEP**: Politically Exposed Person
- **TCF**: Treating Customers Fairly
- **DebiCheck**: South African authenticated debit order system
- **Preauth**: Pre-authorisation for medical procedures
- **RoPA**: Record of Processing Activities
- **DPO**: Data Protection Officer
- **SIU**: Special Investigations Unit
- **Underwriting**: Risk assessment process for insurance applications
- **Microinsurance**: Low-premium insurance products for lower-income markets
- **Hospital_Cash_Plan**: Insurance product that pays cash benefits for hospital stays

## Requirements

### Requirement 1: Insurance Product Management

**User Story:** As a Product Manager, I want to create and manage insurance products, so that we can offer health insurance coverage to customers.

#### Acceptance Criteria

1. THE System SHALL support creation of health insurance products
2. THE System SHALL support creation of microinsurance products
3. THE System SHALL support creation of hospital cash plan products
4. WHEN a product is created, THE System SHALL require product classification by type
5. THE System SHALL enforce Insurance Act compliance workflows for all products
6. THE System SHALL prevent products from being published without required regulatory approvals

### Requirement 2: POPIA Compliance for Special Personal Information

**User Story:** As a Data Protection Officer, I want health data to be processed according to POPIA requirements, so that the System complies with South African data protection law.

#### Acceptance Criteria

1. THE System SHALL classify health data as special personal information
2. THE System SHALL implement purpose-specific consent capture for health data processing
3. THE System SHALL enforce least privilege access controls for health data
4. THE System SHALL log all access to special personal information in an immutable audit trail
5. THE System SHALL encrypt health data at rest and in transit
6. THE System SHALL implement data minimisation and purpose limitation controls
7. THE System SHALL support data subject access requests within statutory timeframes
8. WHEN a data breach occurs, THE System SHALL provide a breach incident workflow
9. THE System SHALL maintain a Record of Processing Activities (RoPA)

### Requirement 3: FICA Compliance and KYC

**User Story:** As a Compliance Officer, I want the System to implement FICA requirements, so that we meet anti-money laundering obligations.

#### Acceptance Criteria

1. WHERE the System's entity is an accountable institution, THE System SHALL implement Customer Due Diligence (CDD) workflows
2. THE System SHALL perform KYC checks during member onboarding
3. THE System SHALL implement risk scoring for members
4. THE System SHALL check for Politically Exposed Persons (PEP) status
5. THE System SHALL provide suspicious transaction reporting workflows
6. THE System SHALL maintain audit trails of all FICA-related activities

### Requirement 4: SARS Third-Party Reporting

**User Story:** As a Finance Manager, I want the System to generate SARS third-party reports, so that we comply with tax reporting obligations.

#### Acceptance Criteria

1. THE System SHALL support SARS third-party reporting for insurance payment data
2. THE System SHALL support SARS third-party reporting for insurance premiums
3. THE System SHALL validate SARS submission files before generation
4. THE System SHALL maintain submission audit trails with file hashes
5. THE System SHALL provide secure file preparation for SARS submissions

### Requirement 5: Auditability and Immutable Logging

**User Story:** As an Auditor, I want all system decisions to be reproducible from audit logs, so that we can demonstrate compliance and investigate issues.

#### Acceptance Criteria

1. THE System SHALL log all claims decisions with full reasoning in an immutable audit trail
2. THE System SHALL log all benefit changes with full reasoning in an immutable audit trail
3. THE System SHALL log all pricing changes with full reasoning in an immutable audit trail
4. THE System SHALL log all member status changes with full reasoning in an immutable audit trail
5. THE System SHALL log all refund decisions with full reasoning in an immutable audit trail
6. THE System SHALL log all broker commission calculations with full reasoning in an immutable audit trail
7. THE System SHALL implement append-only audit event storage
8. THE System SHALL prevent modification or deletion of audit events

### Requirement 6: Separation of Duties

**User Story:** As a Compliance Officer, I want separation of duties enforced in the System, so that no single person can create and approve critical changes.

#### Acceptance Criteria

1. THE System SHALL prevent a single role from creating, changing, approving, and publishing a product
2. THE System SHALL require multi-step approvals for product publication
3. THE System SHALL require multi-step approvals for benefit rule changes
4. THE System SHALL enforce role-based access control (RBAC) for all operations
5. THE System SHALL prevent Claims Assessors from changing benefit rules
6. THE System SHALL require Compliance Officer approval before product publication
7. THE System SHALL require Finance Manager approval before product publication

### Requirement 7: Role-Based Access Control

**User Story:** As a System Administrator, I want comprehensive role-based access control, so that users can only perform actions appropriate to their role.

#### Acceptance Criteria

1. THE System SHALL support the following minimum roles: Member, Employer Admin, Broker, Call Centre Agent, Claims Assessor, Claims Supervisor, Provider Admin, Finance Clerk, Finance Manager, Compliance Officer, Data Protection Officer, Risk/Fraud Analyst, Product Manager, Actuary, System Admin, Auditor
2. THE System SHALL enforce permissions based on assigned roles
3. WHERE a user has the Auditor role, THE System SHALL grant read-only access to all data
4. WHERE a user has the Auditor role, THE System SHALL prevent any data modifications
5. WHERE a user has the DPO role, THE System SHALL grant access to consent management, data access logs, and breach workflows
6. THE System SHALL support assignment of multiple roles to a single user
7. THE System SHALL log all role assignments and changes

### Requirement 8: Member Onboarding (Individual)

**User Story:** As a Member, I want to onboard to the System, so that I can obtain medical insurance coverage.

#### Acceptance Criteria

1. WHEN a Member onboards, THE System SHALL capture identity, contact, and address information
2. WHEN a Member onboards, THE System SHALL capture separate consents for processing and marketing
3. WHERE FICA applies, WHEN a Member onboards, THE System SHALL perform KYC/CDD with risk scoring
4. WHEN a Member selects a product, THE System SHALL validate eligibility based on product rules
5. WHEN a Member selects a product, THE System SHALL perform underwriting assessment
6. WHEN underwriting is complete, THE System SHALL approve or decline coverage based on underwriting rules
7. WHEN a Member completes onboarding, THE System SHALL create a Policy
8. WHEN a Member completes onboarding, THE System SHALL create a payment mandate
9. WHEN first payment is collected, THE System SHALL issue policy documents and welcome pack
10. WHEN a Policy is created, THE System SHALL activate cover based on waiting periods and rules
11. WHEN a Policy is created, THE System SHALL create member portal access credentials

### Requirement 9: Employer and Group Onboarding

**User Story:** As an Employer Admin, I want to onboard my organization and employees, so that we can provide group medical insurance coverage.

#### Acceptance Criteria

1. WHEN an Employer onboards, THE System SHALL capture employer profile information
2. WHEN an Employer onboards, THE System SHALL support payroll file ingestion
3. WHEN an Employer uploads members, THE System SHALL perform bulk member upload with validation
4. WHEN an Employer onboards, THE System SHALL create an employer billing account
5. WHEN an Employer assigns plans, THE System SHALL support per-employee plan mapping
6. THE System SHALL perform monthly reconciliation of payroll vs billed vs collected amounts

### Requirement 10: Provider Onboarding and Network Management

**User Story:** As a Provider Admin, I want to onboard healthcare providers, so that they can submit claims and receive payments.

#### Acceptance Criteria

1. WHEN a Provider onboards, THE System SHALL capture provider registration information
2. WHEN a Provider onboards, THE System SHALL verify provider credentials
3. WHEN a Provider onboards, THE System SHALL verify provider bank account information
4. WHEN a Provider onboards, THE System SHALL assign contract and tariff schedules
5. WHEN a Provider onboards, THE System SHALL assign network membership
6. WHEN a Provider onboards, THE System SHALL enable EDI/API claim submission capabilities
7. THE System SHALL maintain provider practice information
8. THE System SHALL maintain provider authorisations for claim submission

### Requirement 11: Claims Processing Core Flow

**User Story:** As a Claims Assessor, I want to process claims efficiently, so that Members and Providers receive timely payments.

#### Acceptance Criteria

1. THE System SHALL accept claim intake from member portal, provider portal, EDI, and call centre capture
2. WHEN a claim is received, THE System SHALL validate member eligibility including active policy status
3. WHEN a claim is received, THE System SHALL validate waiting periods have been satisfied
4. WHEN a claim is received, THE System SHALL validate the claim is not for an excluded service
5. WHEN a claim is received, THE System SHALL validate ICD-10 codes, procedure codes, and tariff codes
6. WHEN a claim is validated, THE System SHALL execute rules adjudication using the benefits engine
7. WHEN a claim is adjudicated, THE System SHALL perform fraud scoring and anomaly checks
8. WHEN a claim is adjudicated, THE System SHALL assign a status of approved, pended, or rejected with reason codes
9. IF a claim is pended, THEN THE System SHALL request additional documents and clinical information
10. WHEN a claim is approved, THE System SHALL schedule payment to provider or member reimbursement
11. WHEN a claim is paid, THE System SHALL generate statements for member and provider
12. THE System SHALL support appeals and disputes workflow for rejected claims

### Requirement 12: Pre-Authorisation Flow

**User Story:** As a Member, I want to obtain pre-authorisation for hospital procedures, so that I know my coverage before receiving care.

#### Acceptance Criteria

1. WHEN a preauth request is submitted, THE System SHALL validate member eligibility
2. WHEN a preauth request is submitted, THE System SHALL validate benefit coverage
3. WHERE clinical review is required, WHEN a preauth request is submitted, THE System SHALL route to clinical review queue
4. WHEN a preauth is approved, THE System SHALL specify limits, expiry date, and conditions
5. WHEN a subsequent claim references a preauth, THE System SHALL auto-link the claim to the preauth
6. THE System SHALL track preauth utilisation against approved limits

### Requirement 13: Underwriting Rules Engine

**User Story:** As an Actuary, I want automated underwriting rules, so that we can assess risk consistently and efficiently.

#### Acceptance Criteria

1. THE System SHALL implement configurable underwriting rules per product
2. WHEN an application is submitted, THE System SHALL evaluate underwriting rules automatically
3. THE System SHALL support manual underwriting override with approval workflow
4. THE System SHALL calculate risk-based pricing based on underwriting assessment
5. THE System SHALL maintain audit trail of all underwriting decisions
6. THE System SHALL support underwriting questions and health declarations
7. THE System SHALL support exclusions and loadings based on underwriting outcomes

### Requirement 14: Collections and Payment Management

**User Story:** As a Finance Clerk, I want automated collections management, so that member payments are collected reliably.

#### Acceptance Criteria

1. THE System SHALL support debit order mandate creation and storage
2. THE System SHALL schedule debit orders according to member payment schedules
3. WHEN a payment fails, THE System SHALL implement retry rules
4. WHEN a payment fails repeatedly, THE System SHALL implement grace period rules
5. WHEN grace period expires, THE System SHALL implement lapse logic
6. THE System SHALL support policy reinstatement after lapse
7. THE System SHALL implement arrears management workflows
8. WHEN a member is in arrears, THE System SHALL send automated member communications

### Requirement 15: Payment Gateway Integration

**User Story:** As a Finance Manager, I want secure payment gateway integration, so that we can collect and disburse payments reliably.

#### Acceptance Criteria

1. THE System SHALL integrate with payment gateways for payment collection
2. THE System SHALL process payment gateway callbacks idempotently
3. WHEN a payment is received, THE System SHALL write ledger entries
4. WHEN a payment is received, THE System SHALL write audit events
5. WHEN a payment is received, THE System SHALL write member timeline entries
6. THE System SHALL support DebiCheck authenticated debit orders
7. THE System SHALL support refunds with approval workflow

### Requirement 16: Reconciliation Engine

**User Story:** As a Finance Manager, I want automated reconciliation, so that all payments are accurately tracked and allocated.

#### Acceptance Criteria

1. THE System SHALL perform daily reconciliation against bank statements
2. THE System SHALL automatically allocate payments to invoices
3. THE System SHALL identify unallocated payments for manual review
4. THE System SHALL identify discrepancies between expected and actual payments
5. THE System SHALL maintain reconciliation audit trails

### Requirement 17: Broker and Commission Management

**User Story:** As a Broker, I want to track my policies and commissions, so that I can manage my business effectively.

#### Acceptance Criteria

1. THE System SHALL maintain broker registration and credentials
2. THE System SHALL track policies sold by each broker
3. THE System SHALL calculate broker commissions based on commission rules
4. THE System SHALL generate commission statements for brokers
5. THE System SHALL support partner affiliate tracking
6. WHEN commission is calculated, THE System SHALL write ledger entries and audit events

### Requirement 18: Complaints and Disputes Management

**User Story:** As a Call Centre Agent, I want to manage complaints and disputes, so that member issues are resolved fairly and within SLA timeframes.

#### Acceptance Criteria

1. THE System SHALL support complaint case intake
2. WHEN a complaint is created, THE System SHALL assign SLA timers based on complaint type
3. WHEN a complaint exceeds SLA, THE System SHALL trigger escalation workflows
4. THE System SHALL generate Ombud-ready export packs for complaints
5. THE System SHALL track complaint outcomes and root-cause tags
6. THE System SHALL support dispute workflows for claim rejections

### Requirement 19: Product and Benefits Rules Engine

**User Story:** As a Product Manager, I want a flexible rules engine, so that I can define complex benefit structures and pricing.

#### Acceptance Criteria

1. THE System SHALL implement a versioned rules engine
2. THE System SHALL support effective dates for rule versions
3. THE System SHALL support simulation mode to test claims before publishing rules
4. WHEN a rule is executed, THE System SHALL generate audit output explaining the decision
5. THE System SHALL support policy-level and plan-level rule overrides
6. THE System SHALL support rules expressing: annual limits, per-event limits, sublimits, waiting periods, exclusions, network penalties, co-payments, deductibles, referral requirements, preauth requirements

### Requirement 20: Double-Entry Ledger

**User Story:** As a Finance Manager, I want a double-entry accounting ledger, so that all financial transactions are accurately recorded.

#### Acceptance Criteria

1. THE System SHALL implement a double-entry general ledger
2. WHEN a financial transaction occurs, THE System SHALL create balanced journal entries
3. THE System SHALL support GL accounts, cost centres, and account hierarchies
4. THE System SHALL support bank statement import and matching
5. THE System SHALL support allocation of payments to invoices

### Requirement 21: Marketing and CRM with Consent Management

**User Story:** As a Marketing Manager, I want to run compliant marketing campaigns, so that we can acquire and retain members while respecting their preferences.

#### Acceptance Criteria

1. THE System SHALL capture marketing consent separately from processing consent
2. THE System SHALL provide easy opt-out mechanisms for marketing communications
3. THE System SHALL log all marketing messages sent
4. THE System SHALL track campaign attribution using UTM parameters
5. THE System SHALL support lead capture from forms, WhatsApp, and agents
6. THE System SHALL support funnel tracking per product
7. THE System SHALL support referral programmes
8. THE System SHALL support partner campaigns
9. THE System SHALL support automated onboarding sequences
10. THE System SHALL support renewal and retention messaging
11. THE System SHALL support abandoned checkout recovery

### Requirement 22: Fraud Detection and Risk Management

**User Story:** As a Risk/Fraud Analyst, I want automated fraud detection, so that we can identify and investigate suspicious activity.

#### Acceptance Criteria

1. THE System SHALL detect duplicate members based on bank account, phone, and ID number
2. THE System SHALL detect claim anomalies based on frequency, high-value, and pattern analysis
3. THE System SHALL detect provider outliers based on tariff usage and code patterns
4. THE System SHALL maintain member risk flags
5. THE System SHALL support investigation case management
6. THE System SHALL generate SIU export packs for investigations

### Requirement 23: FSCA/PA Regulatory Reporting

**User Story:** As a Compliance Officer, I want to generate FSCA/PA regulatory reports, so that the insurance business complies with reporting obligations.

#### Acceptance Criteria

1. THE System SHALL maintain policy registers for regulatory reporting
2. THE System SHALL maintain claims registers for regulatory reporting
3. THE System SHALL generate conduct metrics including complaints, lapses, and TCF indicators
4. THE System SHALL maintain product governance artefacts including approvals, disclosures, and versions
5. THE System SHALL generate claims turnaround time reports
6. THE System SHALL generate provider network statistics
7. THE System SHALL generate member movement reports (join/leave/lapse)
8. THE System SHALL generate solvency and financial extracts for PA reporting

### Requirement 24: Data Subject Rights (POPIA)

**User Story:** As a Data Protection Officer, I want to process data subject requests, so that we comply with POPIA rights.

#### Acceptance Criteria

1. THE System SHALL support data subject access requests
2. THE System SHALL support data subject erasure requests
3. THE System SHALL support data subject rectification requests
4. THE System SHALL track data subject request status and completion
5. THE System SHALL enforce statutory timeframes for data subject requests
6. THE System SHALL maintain audit trails of all data subject requests

### Requirement 25: Security and Encryption

**User Story:** As a System Administrator, I want comprehensive security controls, so that member data is protected from unauthorised access.

#### Acceptance Criteria

1. THE System SHALL encrypt all data at rest
2. THE System SHALL encrypt all data in transit using TLS
3. THE System SHALL implement encryption key management
4. THE System SHALL implement secrets vault for sensitive configuration
5. THE System SHALL implement Web Application Firewall (WAF)
6. THE System SHALL implement rate limiting
7. THE System SHALL implement DDoS protection
8. THE System SHALL implement multi-factor authentication (MFA) for privileged users

### Requirement 26: Backup and Disaster Recovery

**User Story:** As a System Administrator, I want automated backups and disaster recovery, so that we can recover from system failures.

#### Acceptance Criteria

1. THE System SHALL perform automated backups of all data
2. THE System SHALL support point-in-time restore
3. THE System SHALL maintain disaster recovery runbooks
4. THE System SHALL monitor SLA compliance for system availability
5. THE System SHALL test disaster recovery procedures regularly

### Requirement 27: API and Integration Layer

**User Story:** As a System Integrator, I want comprehensive APIs, so that external systems can integrate with Day1Main.

#### Acceptance Criteria

1. THE System SHALL expose a Member Portal API
2. THE System SHALL expose a Provider Portal API
3. THE System SHALL expose a Broker Portal API
4. THE System SHALL expose an Admin Backoffice API
5. THE System SHALL implement a webhook system for event notifications
6. THE System SHALL integrate with payment gateways
7. THE System SHALL support bank statement ingestion
8. THE System SHALL integrate with email, SMS, and WhatsApp providers
9. THE System SHALL support identity verification service integration
10. THE System SHALL support document signing service integration

### Requirement 28: Member Portal Application

**User Story:** As a Member, I want a self-service portal, so that I can manage my policy and claims online.

#### Acceptance Criteria

1. THE Member Portal SHALL display policy details and digital membership card
2. THE Member Portal SHALL allow claim submission and tracking
3. THE Member Portal SHALL display preauth status
4. THE Member Portal SHALL allow download of statements and tax certificates
5. THE Member Portal SHALL allow update of contact information
6. THE Member Portal SHALL allow download of policy documents

### Requirement 29: Provider Portal Application

**User Story:** As a Provider, I want a provider portal, so that I can check eligibility and submit claims online.

#### Acceptance Criteria

1. THE Provider Portal SHALL allow real-time eligibility checks
2. THE Provider Portal SHALL allow claim submission
3. THE Provider Portal SHALL allow preauth submission
4. THE Provider Portal SHALL display remittance advice
5. THE Provider Portal SHALL display payment history

### Requirement 30: Broker Portal Application

**User Story:** As a Broker, I want a broker portal, so that I can manage my leads, policies, and commissions.

#### Acceptance Criteria

1. THE Broker Portal SHALL display lead and policy pipeline
2. THE Broker Portal SHALL display commission statements
3. THE Broker Portal SHALL allow quote generation
4. THE Broker Portal SHALL allow policy application submission
5. THE Broker Portal SHALL display policy status

### Requirement 31: Admin Backoffice Application

**User Story:** As an administrative user, I want a comprehensive backoffice, so that I can manage all aspects of the System.

#### Acceptance Criteria

1. THE Admin Backoffice SHALL support member administration
2. THE Admin Backoffice SHALL support product and rules administration with approval gates
3. THE Admin Backoffice SHALL provide a claims workbench
4. THE Admin Backoffice SHALL support finance and reconciliation workflows
5. THE Admin Backoffice SHALL provide compliance dashboards

### Requirement 32: Compliance Console Application

**User Story:** As a Compliance Officer, I want a compliance console, so that I can manage POPIA, risk, and regulatory obligations.

#### Acceptance Criteria

1. THE Compliance Console SHALL support POPIA request management
2. THE Compliance Console SHALL maintain a breach register
3. THE Compliance Console SHALL display access logs for audit
4. THE Compliance Console SHALL support vendor risk management
5. THE Compliance Console SHALL maintain a compliance obligations register

### Requirement 33: Reporting Studio Application

**User Story:** As a Compliance Officer, I want a reporting studio, so that I can generate regulatory and management reports.

#### Acceptance Criteria

1. THE Reporting Studio SHALL support generation of FSCA/PA regulator packs
2. THE Reporting Studio SHALL support generation of SARS submission files
3. THE Reporting Studio SHALL support ad-hoc report creation
4. THE Reporting Studio SHALL support scheduled report generation
5. THE Reporting Studio SHALL maintain report execution history

### Requirement 34: System Definition of Done

**User Story:** As a System Administrator, I want to verify the System is complete, so that we can launch Day1Main.

#### Acceptance Criteria

1. THE System SHALL demonstrate that a policy can be sold and created
2. THE System SHALL demonstrate that payment can be collected
3. THE System SHALL demonstrate that a claim can be submitted, adjudicated, and paid
4. THE System SHALL demonstrate that statements can be generated
5. THE System SHALL demonstrate that complaints can be logged and resolved
6. THE System SHALL demonstrate that audit trails prove the full lifecycle
7. THE System SHALL demonstrate that POPIA workflows exist and are testable
8. THE System SHALL demonstrate that FSCA/PA and SARS reports can be generated

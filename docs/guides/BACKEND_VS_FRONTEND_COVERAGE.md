# Backend vs Frontend Coverage Analysis

## Backend Modules (20 total)

### ✅ Has Frontend UI (9 modules)

1. **auth** → `/login` ✅
   - Login page exists
   - Authentication working

2. **admin** → `/admin/*` ✅
   - Dashboard, Members, Policies, Products, Claims, Providers, Finance, Brokers
   - All admin pages exist

3. **broker** → `/broker/*` ✅
   - Broker dashboard, clients, policies, commissions
   - Pages exist

4. **claims** → `/claims` ✅
   - Claims page exists
   - Pre-auth page exists at `/preauth`

5. **compliance** → `/compliance` ✅
   - Compliance page exists

6. **marketing** → `/marketing/*` ✅ (JUST CREATED)
   - Login, Dashboard
   - Leads, Campaigns, Referrals (navigation ready)

7. **payments** → `/payments` ✅
   - Payments page exists

8. **policies** → `/policies` ✅
   - Policies page exists

9. **providers** → `/provider/*` ✅
   - Provider eligibility, payments, preauth pages exist

---

### ❌ NO Frontend UI (11 modules)

#### 1. **audit** - Audit Logging System
**Backend:** `apps/backend/src/audit/`
- Audit service with immutable logging
- HTTP request logging (AuditInterceptor)
- Entity audit trail tracking
- User activity tracking
- Audit statistics and reporting

**Missing Frontend:**
- No `/audit` or `/admin/audit` pages
- No audit log viewer
- No audit search/filter UI
- No audit reports dashboard

**Should Add:**
- Audit log viewer for admins
- Search and filter audit events
- Audit reports and statistics
- User activity timeline

---

#### 2. **finance** - Finance Ledger & Reconciliation
**Backend:** `apps/backend/src/finance/`
- Double-entry ledger
- GL accounts management
- Journal entries
- Bank reconciliation
- Trial balance

**Missing Frontend:**
- No `/finance` pages (except basic structure)
- No ledger viewer
- No journal entry forms
- No reconciliation UI
- No trial balance reports

**Should Add:**
- GL accounts management page
- Journal entry creation/viewing
- Bank reconciliation interface
- Trial balance reports
- Financial statements

---

#### 3. **kyc** - KYC & FICA Compliance
**Backend:** `apps/backend/src/kyc/`
- KYC service with ID verification
- Risk scoring (0-100)
- PEP checking
- CDD workflows
- Enhanced due diligence (EDD)

**Missing Frontend:**
- No `/kyc` or `/admin/kyc` pages
- No KYC verification interface
- No risk assessment viewer
- No CDD workflow UI

**Should Add:**
- KYC verification dashboard
- Member risk assessment page
- CDD workflow interface
- PEP check results viewer

---

#### 4. **members** - Member Management
**Backend:** `apps/backend/src/members/`
- Member registration
- Dependant management
- Contact/address management
- Document storage
- Consent management

**Missing Frontend:**
- Basic member pages exist in `/admin/members`
- But missing detailed member profile pages
- No dependant management UI
- No document upload/viewer
- No consent management interface

**Should Add:**
- Detailed member profile page
- Dependant add/edit/remove forms
- Document upload and viewer
- Consent management interface
- Member history timeline

---

#### 5. **pmb** - Prescribed Minimum Benefits (Medical Scheme)
**Backend:** `apps/backend/src/pmb/`
- PMB eligibility checking
- 27 Chronic Disease List (CDL) conditions
- Diagnosis-Treatment Pairs (DTPs)
- Emergency condition recognition
- PMB claim protection

**Missing Frontend:**
- No `/pmb` pages
- No PMB checker tool
- No CDL condition viewer
- No DTP lookup interface

**Should Add:**
- PMB eligibility checker
- CDL conditions reference
- DTP lookup tool
- PMB claim protection indicator

---

#### 6. **popia** - POPIA Data Protection
**Backend:** `apps/backend/src/popia/`
- Data classification service
- Special personal information marking
- Consent-based processing
- Data subject rights (access, rectification, erasure)
- Data processing reports

**Missing Frontend:**
- No `/popia` or `/compliance/popia` pages
- No data subject request forms
- No consent management UI
- No data processing reports

**Should Add:**
- Data subject request form (access, rectification, erasure)
- Consent management dashboard
- Data processing reports
- POPIA compliance dashboard

---

#### 7. **products** - Product Catalog & Rules
**Backend:** `apps/backend/src/products/`
- Product catalog with regime tagging
- Plan management with benefits
- Benefit definitions
- Product versioning
- Multi-step approval workflow

**Missing Frontend:**
- Basic products page exists in `/admin/products`
- But missing detailed product editor
- No benefit rules editor
- No approval workflow UI
- No product versioning interface

**Should Add:**
- Product editor with benefit rules
- Approval workflow interface
- Product version history viewer
- Benefit calculator/simulator

---

#### 8. **regime** - Regime-Specific Workflows
**Backend:** `apps/backend/src/regime/`
- Medical Schemes Act workflows
- Insurance Act workflows
- Underwriting service
- Risk assessment
- Eligibility validation

**Missing Frontend:**
- No `/regime` pages
- No underwriting interface
- No risk assessment viewer
- No regime configuration UI

**Should Add:**
- Underwriting dashboard
- Risk assessment interface
- Regime configuration page
- Eligibility checker

---

#### 9. **rules** - Rules Engine
**Backend:** `apps/backend/src/rules/`
- Rules engine with JSON-based evaluation
- Rule versioning
- 8 rule types (limits, co-payments, exclusions, etc.)
- Simulation mode
- Audit trail

**Missing Frontend:**
- No `/rules` or `/admin/rules` pages
- No rule editor
- No rule simulator
- No rule version history viewer

**Should Add:**
- Rule editor with visual builder
- Rule simulator/tester
- Rule version history
- Rule audit trail viewer

---

#### 10. **rbac** - Role-Based Access Control
**Backend:** `apps/backend/src/rbac/`
- 16 system roles
- 50+ permissions
- Role-permission mappings
- Separation of duties

**Missing Frontend:**
- No `/admin/rbac` or `/admin/roles` pages
- No role management UI
- No permission assignment interface
- No user role assignment UI

**Should Add:**
- Role management page (create, edit, delete roles)
- Permission assignment interface
- User role assignment page
- Separation of duties configuration

---

#### 11. **supabase** - Database Service
**Backend:** `apps/backend/src/supabase/`
- Supabase client wrapper
- Database connection management

**Missing Frontend:**
- No UI needed (internal service)

---

## Summary

### Coverage Statistics
- **Total Backend Modules:** 20
- **With Frontend UI:** 9 (45%)
- **Without Frontend UI:** 11 (55%)

### Priority for Frontend Development

#### 🔴 High Priority (Core Functionality)
1. **Finance** - Ledger, reconciliation, financial reports
2. **Members** - Detailed member profiles, dependants, documents
3. **Products** - Product editor, benefit rules, approval workflow
4. **KYC** - KYC verification, risk assessment, CDD workflows
5. **RBAC** - Role and permission management

#### 🟡 Medium Priority (Compliance & Reporting)
6. **Audit** - Audit log viewer, search, reports
7. **POPIA** - Data subject requests, consent management
8. **PMB** - PMB checker, CDL reference, DTP lookup
9. **Rules** - Rule editor, simulator, version history

#### 🟢 Low Priority (Advanced Features)
10. **Regime** - Underwriting interface, regime configuration

### Existing Frontend Pages That Need Enhancement
- `/admin/members` - Add detailed member profiles, dependants, documents
- `/admin/products` - Add product editor, benefit rules, approval workflow
- `/admin/finance` - Add ledger viewer, journal entries, reconciliation
- `/admin/claims` - Add PMB indicators, rule evaluation results
- `/compliance` - Add POPIA compliance dashboard, data subject requests

## Recommendations

### Phase 1: Core Admin Functionality
1. Create `/admin/finance/*` pages for ledger and reconciliation
2. Enhance `/admin/members/*` with detailed profiles and dependants
3. Create `/admin/products/editor` for product and benefit management
4. Create `/admin/roles` for RBAC management

### Phase 2: Compliance & Verification
5. Create `/admin/kyc` for KYC verification and risk assessment
6. Create `/admin/audit` for audit log viewing and reports
7. Create `/compliance/popia` for data subject requests
8. Create `/admin/pmb` for PMB reference and checking

### Phase 3: Advanced Features
9. Create `/admin/rules` for rule editor and simulator
10. Create `/admin/regime` for underwriting and regime configuration

## Current Status

### What Works Now ✅
- Login and authentication
- Admin dashboard with statistics
- Member, policy, claim, provider basic views
- Broker portal with basic functionality
- Marketing portal (just created)
- Payment tracking
- Compliance basic views

### What's Missing ❌
- Detailed CRUD operations for most entities
- Financial management UI
- KYC verification interface
- Product and benefit rule editor
- RBAC management UI
- Audit log viewer
- POPIA compliance tools
- PMB reference tools
- Rules engine UI

### Next Steps
Choose which area to focus on based on business priority:
1. **Finance** - If financial management is critical
2. **Members** - If member onboarding and management is priority
3. **Products** - If product configuration is needed
4. **KYC** - If compliance verification is urgent
5. **RBAC** - If user management is needed

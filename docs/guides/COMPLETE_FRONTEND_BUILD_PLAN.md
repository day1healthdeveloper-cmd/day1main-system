# Complete Frontend Build Plan

## Goal
Build ALL missing frontend pages with demo data, properly organized by department/role.

## Organization Structure

### 1. Admin Portal (`/admin/*`)
**Role:** system_admin
**Pages to Build:**
- ✅ Dashboard (exists)
- ✅ Members (exists - needs enhancement)
- ✅ Policies (exists - needs enhancement)
- ✅ Products (exists - needs enhancement)
- ✅ Claims (exists)
- ✅ Providers (exists)
- ✅ Finance (exists - needs enhancement)
- ✅ Brokers (exists)
- ❌ **Audit** - NEW
- ❌ **KYC** - NEW
- ❌ **RBAC/Roles** - NEW
- ❌ **Rules Engine** - NEW
- ❌ **PMB Reference** - NEW
- ❌ **Regime Config** - NEW

### 2. Member Portal (`/dashboard`, `/policies`, etc.)
**Role:** member
**Pages:**
- ✅ Dashboard (exists)
- ✅ My Policies (exists)
- ✅ My Claims (exists)
- ✅ Payments (exists)
- ✅ Documents (exists)
- ✅ Profile (exists)
- ❌ **My Dependants** - NEW
- ❌ **My Documents** - NEW (enhance)
- ❌ **Consent Management** - NEW

### 3. Broker Portal (`/broker/*`)
**Role:** broker
**Pages:**
- ✅ Dashboard (exists)
- ✅ My Clients (exists)
- ✅ Policies (exists)
- ✅ Commissions (exists)
- ❌ **Quotes** - NEW (enhance)
- ❌ **Applications** - NEW

### 4. Claims Assessor Portal (`/claims-assessor/*`)
**Role:** claims_assessor
**Pages:**
- ✅ Dashboard (exists)
- ✅ Claims Queue (exists)
- ✅ My Claims (exists)
- ❌ **Pre-Auth Queue** - NEW
- ❌ **Fraud Cases** - NEW

### 5. Finance Portal (`/finance/*`)
**Role:** finance_manager
**Pages:**
- ✅ Dashboard (exists)
- ✅ Payments (exists)
- ❌ **Ledger** - NEW
- ❌ **Journal Entries** - NEW
- ❌ **Reconciliations** - NEW (enhance)
- ❌ **Reports** - NEW (enhance)
- ❌ **Trial Balance** - NEW

### 6. Compliance Portal (`/compliance/*`)
**Role:** compliance_officer
**Pages:**
- ✅ Basic page (exists)
- ❌ **POPIA Dashboard** - NEW
- ❌ **Data Subject Requests** - NEW
- ❌ **Breach Incidents** - NEW
- ❌ **Complaints** - NEW
- ❌ **Regulatory Reports** - NEW

### 7. Marketing Portal (`/marketing/*`)
**Role:** marketing_manager
**Pages:**
- ✅ Login (exists)
- ✅ Dashboard (exists)
- ❌ **Leads** - NEW
- ❌ **Campaigns** - NEW
- ❌ **Referrals** - NEW
- ❌ **Analytics** - NEW

## Build Order

### Phase 1: Admin Portal Enhancement (Priority 1)
1. `/admin/audit` - Audit log viewer
2. `/admin/kyc` - KYC verification dashboard
3. `/admin/roles` - RBAC management
4. `/admin/rules` - Rules engine
5. `/admin/pmb` - PMB reference
6. `/admin/finance/ledger` - GL accounts and ledger
7. `/admin/finance/journal-entries` - Journal entry management
8. `/admin/finance/reconciliation` - Bank reconciliation
9. `/admin/finance/trial-balance` - Trial balance report

### Phase 2: Compliance Portal (Priority 2)
10. `/compliance/popia` - POPIA dashboard
11. `/compliance/data-requests` - Data subject requests
12. `/compliance/breaches` - Breach incidents
13. `/compliance/complaints` - Complaints management
14. `/compliance/reports` - Regulatory reports

### Phase 3: Marketing Portal (Priority 3)
15. `/marketing/leads` - Lead management
16. `/marketing/campaigns` - Campaign management
17. `/marketing/referrals` - Referral program
18. `/marketing/analytics` - Marketing analytics

### Phase 4: Member Portal Enhancement (Priority 4)
19. `/dependants` - Dependant management
20. `/documents` - Document management (enhance)
21. `/consent` - Consent management

### Phase 5: Finance Portal Enhancement (Priority 5)
22. `/finance/ledger` - Ledger viewer
23. `/finance/journal-entries` - Journal entries
24. `/finance/reconciliation` - Reconciliation interface
25. `/finance/trial-balance` - Trial balance

### Phase 6: Other Portals (Priority 6)
26. `/broker/quotes` - Quote management
27. `/broker/applications` - Application tracking
28. `/claims-assessor/preauth` - Pre-auth queue
29. `/claims-assessor/fraud` - Fraud cases

## Implementation Strategy

For each page:
1. Create page component with SidebarLayout
2. Add demo data (realistic mock data)
3. Create tables/cards for data display
4. Add search/filter functionality
5. Add action buttons (create, edit, delete)
6. Add statistics/metrics at top
7. Use consistent styling (role-specific colors)

## File Structure

```
apps/frontend/src/app/
├── admin/
│   ├── audit/page.tsx
│   ├── kyc/page.tsx
│   ├── roles/page.tsx
│   ├── rules/page.tsx
│   ├── pmb/page.tsx
│   └── finance/
│       ├── ledger/page.tsx
│       ├── journal-entries/page.tsx
│       ├── reconciliation/page.tsx
│       └── trial-balance/page.tsx
├── compliance/
│   ├── popia/page.tsx
│   ├── data-requests/page.tsx
│   ├── breaches/page.tsx
│   ├── complaints/page.tsx
│   └── reports/page.tsx
├── marketing/
│   ├── leads/page.tsx
│   ├── campaigns/page.tsx
│   ├── referrals/page.tsx
│   └── analytics/page.tsx
├── finance/
│   ├── ledger/page.tsx
│   ├── journal-entries/page.tsx
│   ├── reconciliation/page.tsx
│   └── trial-balance/page.tsx
├── broker/
│   ├── quotes/page.tsx
│   └── applications/page.tsx
├── claims-assessor/
│   ├── preauth/page.tsx
│   └── fraud/page.tsx
└── (member pages)
    ├── dependants/page.tsx
    ├── documents/page.tsx (enhance)
    └── consent/page.tsx
```

## Estimated Pages to Build
- **Admin:** 9 new pages
- **Compliance:** 5 new pages
- **Marketing:** 4 new pages
- **Finance:** 4 new pages
- **Member:** 3 new pages
- **Broker:** 2 new pages
- **Claims Assessor:** 2 new pages

**Total:** ~29 new pages

## Starting Now...
Building all pages systematically with demo data.

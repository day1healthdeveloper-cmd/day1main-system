# Day1Main Documentation

## START HERE

**OFFICIAL PROJECT STRUCTURE:** [PROJECT_STRUCTURE_MASTER.md](./PROJECT_STRUCTURE_MASTER.md)

This is the single source of truth for the project structure. All documentation, development, testing, and communication must follow the 8-section structure defined in this document.

---

## The 8 Official Sections

1. Marketing and Application Funnel
2. Application Processing and Approval  
3. Member Database and Plans (CORE FOUNDATION)
4. Fee Collection and Payments
5. Brokers and Providers
6. Claims Processing
7. Finances and Commissions
8. Reporting, Compliance and Call Centre

**Rule:** Always reference sections by number and name (e.g., "Section 3: Member Database and Plans")

---

## Documentation Index

### Core Documents
- **[PROJECT_STRUCTURE_MASTER.md](./PROJECT_STRUCTURE_MASTER.md)** - OFFICIAL structure (READ THIS FIRST)
- **[PROJECT_SUMMARY_CLEAN.md](./PROJECT_SUMMARY_CLEAN.md)** - Executive summary for presentations
- **[INSURANCE_PLANS_REFERENCE.md](./INSURANCE_PLANS_REFERENCE.md)** - The 9 insurance plans
- **[MEMBER_FILTERS_REFERENCE.md](./MEMBER_FILTERS_REFERENCE.md)** - Member search and filtering

### Technical Documents
- **[MONEY_COLLECTION_METHODS.md](./MONEY_COLLECTION_METHODS.md)** - Payment processing (Section 4)
- **[BULK_UPLOAD_TEMPLATE.md](./BULK_UPLOAD_TEMPLATE.md)** - Data import (Section 3)
- **[PROVIDERS_TODO.md](./PROVIDERS_TODO.md)** - Provider management tasks (Section 5)

### Data Files
- **all members list - CORRECTED.xlsx** - Current member database (Section 3)
- **providers_rows.csv** - Provider database (Section 5)

---

## Quick Reference

### Which Section Am I Working On?

**Marketing/Leads?** → Section 1
**Applications/KYC?** → Section 2
**Members/Plans?** → Section 3 (CORE)
**Payments/Debit Orders?** → Section 4
**Brokers/Providers?** → Section 5
**Claims?** → Section 6
**Finance/Commissions?** → Section 7
**Reports/Compliance/Support?** → Section 8

### Dependencies

- Sections 1-2 → Feed into Section 3
- Section 3 → Everything depends on this
- Sections 4-8 → All depend on Section 3

### Testing Order

Test in sequence: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

---

## Documentation Rules

1. **Always reference PROJECT_STRUCTURE_MASTER.md** when discussing project structure
2. **Use section numbers** (Section 1, Section 2, etc.) in all communications
3. **Follow the dependency flow** - don't skip sections
4. **Update this README** if you add new documentation
5. **Keep consistency** - all docs must align with the 8-section structure

---

## For New Team Members

1. Read [PROJECT_STRUCTURE_MASTER.md](./PROJECT_STRUCTURE_MASTER.md) first
2. Understand the 8 sections and their dependencies
3. Identify which section(s) you'll be working on
4. Read the relevant technical documents
5. Follow the testing order

---

## For Presentations

Use [PROJECT_SUMMARY_CLEAN.md](./PROJECT_SUMMARY_CLEAN.md) - it's formatted without special characters for easy copying.

---

Last Updated: February 27, 2026

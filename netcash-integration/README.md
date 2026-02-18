# Netcash Integration - Day1Health Medical Insurer

## 📁 Folder Structure

```
netcash-integration/
├── docs/                   # Documentation and planning
├── qsure-files/           # Current Qsure system files (for reference)
├── excel-sheets/          # Member data, premium calculations, reports
├── database-schema/       # Database table structures and migrations
├── api-specs/             # Netcash API specifications and examples
└── test-data/             # Sample data for testing
```

---

## 📋 Purpose

This folder contains all resources needed to integrate Day1Health with Netcash payment gateway for debit order collections, replacing the current Qsure system.

**Goal:** Automate monthly premium collections for 1,000+ members via Netcash API

---

## 📂 Folder Descriptions

### `/docs` - Documentation
Place all planning documents, integration guides, and technical specifications here.

**Files to add:**
- Integration plan
- API authentication setup
- Workflow diagrams
- Testing procedures
- Go-live checklist

### `/qsure-files` - Current Qsure System
Place all files from the current Qsure billing system here for reference.

**Files to add:**
- Qsure batch files
- Qsure reports
- Current debit order formats
- Rejection reports
- Payment reconciliation files
- Any Qsure documentation

**Purpose:** Understand current system to ensure smooth migration

### `/excel-sheets` - Member Data & Calculations
Place all Excel files containing member data, premium calculations, and business logic.

**Files to add:**
- Member masterfile (with bank details)
- Premium calculation sheets
- Debit order schedules
- Payment history
- Arrears reports
- Commission calculations
- Financial reconciliation sheets

**Purpose:** Extract real data and business formulas to build into system

### `/database-schema` - Database Structure
SQL files and documentation for database tables needed for Netcash integration.

**Files to add:**
- Members table structure
- Debit order runs table
- Transactions table
- Payment history table
- Migration scripts
- Index definitions

**Purpose:** Define database structure for storing debit order data

### `/api-specs` - Netcash API Documentation
Netcash API specifications, examples, and integration code.

**Files to add:**
- Netcash API credentials (secure)
- File format specifications
- Sample request/response files
- Error code documentation
- Webhook specifications
- Test environment details

**Purpose:** Reference for building Netcash integration

### `/test-data` - Testing Files
Sample data for testing the integration before going live.

**Files to add:**
- Test member data (10-20 records)
- Sample debit order batches
- Expected results
- Test scenarios
- Validation scripts

**Purpose:** Safe testing without affecting real members

---

## 🚀 Integration Phases

### Phase 1: Data Collection (Current)
- [ ] Collect Qsure files
- [ ] Collect member Excel sheets
- [ ] Document current database schema
- [ ] Get Netcash API credentials

### Phase 2: Analysis
- [ ] Analyze member data structure
- [ ] Extract premium calculation formulas
- [ ] Map Qsure format to Netcash format
- [ ] Identify data gaps

### Phase 3: Database Setup
- [ ] Create debit order tables
- [ ] Add Netcash fields to members table
- [ ] Create migration scripts
- [ ] Setup indexes

### Phase 4: Backend Development
- [ ] Build Netcash module
- [ ] Implement file generation
- [ ] Create API endpoints
- [ ] Add error handling

### Phase 5: Testing
- [ ] Test with sample data
- [ ] Validate file formats
- [ ] Test Netcash submission
- [ ] Verify reconciliation

### Phase 6: Go Live
- [ ] Import full member base
- [ ] Submit first production batch
- [ ] Monitor results
- [ ] Reconcile payments

---

## 📊 Key Data Points Needed

### From Excel Sheets:
- [ ] Member Number
- [ ] ID Number
- [ ] Full Name
- [ ] Bank Name
- [ ] Account Number
- [ ] Branch Code
- [ ] Account Type
- [ ] Account Holder Name
- [ ] Monthly Premium Amount
- [ ] Debit Order Day
- [ ] Payment Status
- [ ] Arrears Amount

### From Qsure Files:
- [ ] Current file format
- [ ] Batch structure
- [ ] Error handling
- [ ] Reconciliation process
- [ ] Rejection handling

### From Database:
- [ ] Current members table structure
- [ ] Payment history structure
- [ ] Policy information
- [ ] Product pricing

---

## 🔐 Security Notes

**IMPORTANT:** This folder may contain sensitive data:
- Bank account numbers
- Member personal information
- API credentials
- Financial data

**Security Measures:**
1. Add to `.gitignore` (already done)
2. Encrypt sensitive files
3. Use environment variables for credentials
4. Limit access to authorized personnel only
5. Delete test data after use

---

## 📝 Next Steps

1. **Add Qsure Files**
   - Request all current Qsure batch files
   - Get rejection reports
   - Obtain reconciliation files

2. **Add Excel Sheets**
   - Get member masterfile
   - Get premium calculation sheets
   - Get payment history

3. **Document Database**
   - Export current members table schema
   - Document all relevant tables
   - Create migration plan

4. **Get Netcash Credentials**
   - Service Key
   - API credentials
   - Test environment access

5. **Start Building**
   - Analyze collected data
   - Build database schema
   - Develop Netcash module
   - Create Operations dashboard

---

## 📞 Contacts

**Netcash Support:**
- Website: https://netcash.co.za
- API Docs: https://api.netcash.co.za
- Support: support@netcash.co.za

**Day1Health:**
- Operations Manager: [Contact]
- Finance Manager: [Contact]
- IT/System Admin: [Contact]

---

## 📈 Success Metrics

**Cost Savings:**
- Target: R99,024/year vs Qsure
- Per member: R8.25/month savings

**Processing Efficiency:**
- Target: 100% automated debit order runs
- Target: Same-day reconciliation
- Target: <2% rejection rate

**System Performance:**
- Target: Process 1,000 members in <5 minutes
- Target: Real-time status updates
- Target: Zero manual interventions

---

## 🎯 Project Status

**Current Phase:** Data Collection  
**Start Date:** [Date]  
**Target Go-Live:** [Date]  
**Status:** 🟡 In Progress

---

## 📚 Related Documentation

- [Netcash Integration Plan](../NETCASH_INTEGRATION_PLAN.md)
- [Qsure vs Netcash Comparison](../QSURE_VS_NETCASH_COMPARISON.md)
- [Data Import System](../DATA_IMPORT_BACKEND_COMPLETE.md)

---

**Last Updated:** 2026-02-08  
**Maintained By:** Development Team

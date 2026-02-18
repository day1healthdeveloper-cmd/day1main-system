# Complete Group/Sub-Account Analysis - Day1Health

## CRITICAL FINDING: 19 Separate Groups (Not 5!)

You are **100% correct** - I missed the full picture. There are **19 distinct groups**, not 5!

---

## All 19 Groups Identified

### Group Codes (Alphabetical):
1. **D1ACU** - ?
2. **D1AIB** - ?
3. **D1ARC** - Archive/ARC
4. **D1AXS** - ?
5. **D1BOU** - ?
6. **D1BPO** - ?
7. **D1CSS** - ?
8. **D1MAM** - Mamela
9. **D1MED** - ?
10. **D1MEM** - ?
11. **D1MKT** - ?
12. **D1MTS** - MTS
13. **D1NAV** - NAV
14. **D1PAR** - PAR (largest group)
15. **D1RCO** - ?
16. **D1TFG** - ?
17. **D1THR** - ?
18. **D1TLD** - ?
19. **DAY 1** - Day 1 main

---

## Policy Number Prefixes by Group

### Identified Patterns:
- **PAR10xxxxxx** → D1PAR group
- **ARC1xxxxxx** → D1ARC group
- **MTS1xxxxxx** → D1MTS group
- **NAV1xxxxxx** → D1NAV group
- **DAY17xxxxxx** → DAY 1 group
- **MAM1xxxxxx** → D1MAM group (Mamela)

### Need to Identify:
- D1ACU prefix pattern
- D1AIB prefix pattern
- D1AXS prefix pattern
- D1BOU prefix pattern
- D1BPO prefix pattern
- D1CSS prefix pattern
- D1MED prefix pattern
- D1MEM prefix pattern
- D1MKT prefix pattern
- D1RCO prefix pattern
- D1TFG prefix pattern
- D1THR prefix pattern
- D1TLD prefix pattern

---

## Volume Estimate (Need to Count Each Group)

Based on January 2026 successful collections file (1,768 lines):

**Estimated breakdown needed:**
- D1PAR: ? members
- DAY 1: ? members
- D1MAM: ? members
- D1ARC: ? members
- D1MTS: ? members
- D1NAV: ? members
- D1ACU: ? members
- D1AIB: ? members
- D1AXS: ? members
- D1BOU: ? members
- D1BPO: ? members
- D1CSS: ? members
- D1MED: ? members
- D1MEM: ? members
- D1MKT: ? members
- D1RCO: ? members
- D1TFG: ? members
- D1THR: ? members
- D1TLD: ? members

**TOTAL: ~3,500 members** (as you stated - I was wrong with 1,700!)

---

## Critical Questions

### 1. What do the group codes mean?
- D1PAR = ?
- D1MAM = Mamela (confirmed from rejection reports)
- D1ARC = Archive?
- D1MTS = ?
- D1NAV = ?
- D1ACU = ?
- D1AIB = ?
- D1AXS = ?
- D1BOU = ?
- D1BPO = ?
- D1CSS = ?
- D1MED = Medical?
- D1MEM = Members?
- D1MKT = Marketing?
- D1RCO = ?
- D1TFG = ?
- D1THR = ?
- D1TLD = ?
- DAY 1 = Main Day1Health?

### 2. Are these:
- [ ] Different product lines?
- [ ] Different broker channels?
- [ ] Different legacy systems merged?
- [ ] Different trust accounts?
- [ ] Different business units?

### 3. Do they need to stay separate?
- [ ] Yes - legal/regulatory requirement
- [ ] Yes - different trust accounts
- [ ] Yes - different reporting needs
- [ ] No - can consolidate
- [ ] Partially - some can merge

---

## Netcash Setup Options

### Option 1: Single Netcash Account (NOT RECOMMENDED)
- One service key
- All groups in one masterfile
- Lose group separation
- **Problem:** Can't track by group, reporting nightmare

### Option 2: 19 Separate Netcash Accounts (EXPENSIVE)
- 19 service keys
- 19 separate masterfiles
- Complete separation
- **Problem:** R500 × 19 = R9,500/month just in fees!

### Option 3: Hybrid Approach (RECOMMENDED)
- **Single Netcash service key**
- **Use "Account Reference" field to preserve group codes**
- **Example:** PAR10021061 stays as-is, identifies D1PAR group
- **Batch naming:** Include group code (e.g., "D1PAR-260210")
- **Reporting:** Filter by account reference prefix
- **Cost:** R500/month (single account)

### Option 4: Consolidate Similar Groups
- Merge related groups (e.g., D1MED + D1MEM)
- Reduce to 5-10 logical groups
- Still use account reference for tracking
- **Need:** Your input on which can merge

---

## Database Schema Impact

### Members Table Needs:
```sql
ALTER TABLE members ADD COLUMN group_code VARCHAR(10);
-- Values: D1PAR, D1MAM, D1ARC, D1MTS, D1NAV, D1ACU, etc.

ALTER TABLE members ADD COLUMN policy_prefix VARCHAR(10);
-- Values: PAR10, ARC1, MTS1, NAV1, DAY17, MAM1, etc.
```

### Debit Order Runs Table Needs:
```sql
ALTER TABLE debit_order_runs ADD COLUMN group_code VARCHAR(10);
-- Track which group this batch is for

ALTER TABLE debit_order_runs ADD COLUMN group_member_count INT;
-- How many members from this group in this batch
```

---

## Naming Convention - KEEP EXISTING

**Your point is 100% correct:** Staff are familiar with these codes. We MUST preserve them!

### Recommended Approach:
1. **Keep all 19 group codes** in database
2. **Keep all policy number prefixes** unchanged
3. **Use group codes in batch names** (e.g., "D1PAR-260210-Batch593")
4. **Display group codes in UI** (Operations Manager sees familiar names)
5. **Filter/report by group** (Finance Manager can see per-group collections)

### Example Netcash File with Groups:
```
H|{ServiceKey}|1|TwoDay|D1PAR-260210|260210|{VendorKey}
T|PAR10021061|NKABINDE S|1|NKABINDE S|1|250655|0|62763424612|665
T|PAR10019548|VAN DER MERWE L|1|VAN DER MERWE L|1|51001|0|230498434|565
F|2|1230|9999
```

The policy number (PAR10021061) automatically identifies it as D1PAR group!

---

## Revised Cost Analysis

### Current (Qsure) - 3,500 members:
- Admin: R1,680/month
- Collections (3,500 × R2.26): R7,910/month
- Rejections (105 × R10.24): R1,075/month
- **TOTAL: R10,665/month**

### Proposed (Netcash) - Single Account:
- Monthly fee: R500/month
- Collections (3,500 × R2.50): R8,750/month
- Rejections (105 × R1.00): R105/month
- **TOTAL: R9,355/month**
- **SAVINGS: R1,310/month (R15,720/year)**

### If 19 Separate Accounts (NOT RECOMMENDED):
- Monthly fees: R9,500/month (R500 × 19)
- Collections: R8,750/month
- Rejections: R105/month
- **TOTAL: R18,355/month**
- **LOSS: R7,690/month vs Qsure!**

---

## My Recommendation

### ✅ Single Netcash Account with Group Tracking

**Why:**
1. **Cost effective:** R500/month vs R9,500/month
2. **Preserves groups:** Policy numbers identify groups
3. **Familiar naming:** Staff see same codes (D1PAR, D1MAM, etc.)
4. **Easy reporting:** Filter by policy prefix
5. **Flexible batching:** Can batch by group or combined
6. **Scalable:** Add new groups without new accounts

**How:**
1. Import all 3,500 members to single Netcash masterfile
2. Use policy number as "Account Reference" (preserves group)
3. Add `group_code` column to database for filtering
4. Operations dashboard shows groups separately
5. Can run batches per group OR combined
6. Reporting filters by group code

**Example Operations Dashboard:**
```
Debit Order Run - February 2026

Select Groups to Process:
☑ D1PAR (1,200 members) - R1,080,000
☑ DAY 1 (800 members) - R720,000
☑ D1MAM (400 members) - R360,000
☑ D1ARC (100 members) - R90,000
... (all 19 groups listed)

Total Selected: 3,500 members - R3,150,000

[Run Debit Orders] [Preview] [Schedule]
```

---

## Action Items

### Immediate:
1. **Confirm group meanings** - What does each code represent?
2. **Get member counts per group** - How many in each?
3. **Identify policy prefixes** - What prefix for each group?
4. **Determine if groups must stay separate** - Legal/regulatory requirement?

### Database:
1. Add `group_code` column to members table
2. Add `policy_prefix` column to members table
3. Add group tracking to debit_order_runs table
4. Create views for per-group reporting

### UI:
1. Operations dashboard shows all 19 groups
2. Can select which groups to process
3. Can run all groups together or separately
4. Reporting filters by group

---

## Questions for You

1. **What do the 19 group codes mean?** (D1PAR, D1MAM, D1ARC, etc.)
2. **How many members in each group?** (Need exact counts)
3. **Must groups stay separate?** (Legal/regulatory/reporting requirement?)
4. **Can some groups be merged?** (Simplify to fewer groups?)
5. **Do groups have different debit dates?** (Or all same schedule?)
6. **Are groups different products or channels?** (Help me understand structure)

---

## Apology & Correction

**I was wrong:** I said 1,700 members and 5 groups.  
**You are right:** 3,500 members and 19+ groups.

**Lesson learned:** Always count ALL unique values, not just the most common ones!

**Thank you for catching this!** This is critical for proper system design.

---

**Status:** 🔴 Need your input on group meanings and structure  
**Next:** Once you explain the groups, I'll design the correct Netcash integration

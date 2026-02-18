# Admin UI - Comprehensive Benefits View

## 🎯 What the Administrator Will See & Do

### Main Benefits Configuration Page

```
┌─────────────────────────────────────────────────────────────────┐
│ Executive Hospital Plan - Benefits Configuration                │
│ ← Back to Policy Creator                    📄 Scan Document    │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Total: 25    │ Configured:  │ Documents:   │ Last Updated │
│ Benefits     │ 18 Benefits  │ 3 versions   │ 2 days ago   │
└──────────────┴──────────────┴──────────────┴──────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 📄 Uploaded Documents (3)                                       │
├─────────────────────────────────────────────────────────────────┤
│ ✓ Executive Plan v2.1 - 26 pages - Jan 2026  [View] [Download] │
│ ✓ Executive Plan v2.0 - 24 pages - Dec 2025  [View] [Archive]  │
│ ✓ Executive Plan v1.0 - 20 pages - Nov 2025  [View] [Archive]  │
│                                                                  │
│ [+ Upload New Version]                                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Filter: [All (25)] [Hospital (5)] [Day-to-Day (8)] [...]       │
│ Search: [________________]  🔍                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ☑ HOSPITAL ADMISSION                          [Edit Details] ▼ │
├─────────────────────────────────────────────────────────────────┤
│ Basic Configuration:                                            │
│   Coverage: Unlimited                                           │
│   Copayment: R1,000 per admission                              │
│   Waiting Period: 3 months                                      │
│   Preauth: Required                                             │
│                                                                  │
│ 📄 Full Description: [Edit]                                     │
│   "Covers all costs related to hospital admission including     │
│    ward fees, theatre fees, medication during stay..."          │
│                                                                  │
│ ✅ What IS Covered (12 items): [Edit]                          │
│   ✓ Ward fees (general ward)                                   │
│   ✓ Theatre fees                                                │
│   ✓ ICU/High Care                                               │
│   ✓ Medication during stay                                      │
│   ✓ Surgical procedures                                         │
│   ... [Show all 12]                                             │
│                                                                  │
│ ❌ What is NOT Covered (8 items): [Edit]                       │
│   ✗ Cosmetic procedures                                         │
│   ✗ Experimental treatments                                     │
│   ✗ Self-inflicted injuries                                     │
│   ✗ Elective procedures during waiting period                   │
│   ... [Show all 8]                                              │
│                                                                  │
│ ⚠️ Conditions & Requirements (6 items): [Edit]                 │
│   ⚠ Pre-authorization required for planned admissions           │
│   ⚠ Emergency admissions: notify within 24 hours               │
│   ⚠ Must use network hospitals for full cover                  │
│   ⚠ Out-of-network: 70% reimbursement                          │
│   ... [Show all 6]                                              │
│                                                                  │
│ 🏥 Network Requirements: [Edit]                                │
│   Network Required: Yes                                         │
│   Approved Hospitals: 47 hospitals [View List]                 │
│   Out-of-Network Coverage: 70%                                  │
│                                                                  │
│ 🛏️ Room & Accommodation: [Edit]                                │
│   Standard: General ward (included)                             │
│   Private room: R500/day additional                             │
│   Semi-private: R250/day additional                             │
│                                                                  │
│ 🔢 Procedure Codes: [Edit]                                     │
│   ICD-10 Codes: All codes except exclusions [View 2,450 codes] │
│   Tariff Codes: NHRPL 2026 rates apply [View codes]           │
│                                                                  │
│ 📋 Authorization Rules: [Edit]                                 │
│   Planned Admissions: Pre-auth required (48h turnaround)       │
│   Emergency: Notify within 24 hours                             │
│   Threshold: All admissions                                     │
│   Required Documents: Admission letter, Specialist referral     │
│                                                                  │
│ 📄 Policy References:                                           │
│   Section: 7.1 (Page 16)                                        │
│   Document: Executive Plan v2.1                                 │
│   [View in Document]                                            │
│                                                                  │
│ 📝 Change History: [View All]                                  │
│   Jan 15, 2026 - Admin User - Updated copayment R800→R1000    │
│   Dec 10, 2025 - Admin User - Added private room option        │
│                                                                  │
│ [Save Changes] [Delete Benefit] [Duplicate to Other Product]   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ☑ MATERNITY                                   [Edit Details] ▼ │
├─────────────────────────────────────────────────────────────────┤
│ Basic Configuration:                                            │
│   Coverage: Annual Limit                                        │
│   Annual Limit: R50,000                                         │
│   Waiting Period: 12 months                                     │
│   Preauth: Required                                             │
│                                                                  │
│ [Full details similar to above...]                              │
└─────────────────────────────────────────────────────────────────┘

... [All 25 benefits listed]
```

## 🎨 Edit Modes

### When Admin Clicks "Edit Details":

```
┌─────────────────────────────────────────────────────────────────┐
│ 📝 HOSPITAL ADMISSION - Comprehensive Editor                    │
│                                    [Save All] [Cancel] [Delete] │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ▼ 📄 Full Description                                           │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ [Rich Text Editor]                                       │  │
│   │ Covers all costs related to hospital admission...       │  │
│   │                                                          │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│ ▼ ✅ What IS Covered (12 items)                                │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ [Add new inclusion: _______________] [+ Add]            │  │
│   ├─────────────────────────────────────────────────────────┤  │
│   │ ✓ Ward fees (general ward)              [Edit] [Delete] │  │
│   │ ✓ Theatre fees                          [Edit] [Delete] │  │
│   │ ✓ ICU/High Care                         [Edit] [Delete] │  │
│   │ ... [All items editable]                                 │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│ ▼ ❌ What is NOT Covered (8 items)                             │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ [Add new exclusion: _______________] [+ Add]            │  │
│   ├─────────────────────────────────────────────────────────┤  │
│   │ ✗ Cosmetic procedures                   [Edit] [Delete] │  │
│   │ ✗ Experimental treatments               [Edit] [Delete] │  │
│   │ ... [All items editable]                                 │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│ ▼ ⚠️ Conditions & Requirements (6 items)                       │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ [Add new condition: _______________] [+ Add]            │  │
│   ├─────────────────────────────────────────────────────────┤  │
│   │ ⚠ Pre-auth required for planned        [Edit] [Delete] │  │
│   │ ⚠ Emergency: notify within 24h         [Edit] [Delete] │  │
│   │ ... [All items editable]                                 │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│ ▼ 🏥 Network Requirements                                       │
│   Network Required: [✓] Yes  [ ] No                            │
│   Out-of-Network Coverage: [70] %                               │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ Approved Hospitals (47):                                 │  │
│   │ [Search hospitals: _______________] [+ Add Hospital]    │  │
│   │                                                          │  │
│   │ ✓ Netcare Milpark Hospital    [Remove]                  │  │
│   │ ✓ Life Fourways Hospital      [Remove]                  │  │
│   │ ✓ Mediclinic Sandton          [Remove]                  │  │
│   │ ... [All 47 hospitals listed]                            │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│ ▼ 🛏️ Room & Accommodation                                      │
│   Standard Room Type: [General Ward ▼]                         │
│   Private Room Available: [✓] Yes  [ ] No                      │
│   Private Room Cost: R [500] per day                            │
│   Semi-Private Available: [✓] Yes  [ ] No                      │
│   Semi-Private Cost: R [250] per day                            │
│   Notes: [_________________________________]                    │
│                                                                  │
│ ▼ 🔢 Procedure Codes                                           │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ ICD-10 Codes:                                            │  │
│   │ [Add code: _______________] [+ Add]                     │  │
│   │                                                          │  │
│   │ Coverage: [✓] All codes  [ ] Specific codes only        │  │
│   │                                                          │  │
│   │ Excluded ICD-10 Codes (from exclusions):                │  │
│   │ • Z41.* (Cosmetic procedures)           [Remove]        │  │
│   │ • Z00.* (Routine examinations)          [Remove]        │  │
│   │ ... [All excluded codes]                                 │  │
│   ├─────────────────────────────────────────────────────────┤  │
│   │ Tariff Codes:                                            │  │
│   │ [Add code: _______________] [+ Add]                     │  │
│   │                                                          │  │
│   │ • 0001 - Ward fees                      [Edit] [Remove] │  │
│   │ • 0002 - Theatre fees                   [Edit] [Remove] │  │
│   │ ... [All tariff codes]                                   │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│ ▼ 📋 Authorization Rules                                        │
│   Requires Pre-authorization: [✓] Yes  [ ] No                  │
│   Threshold Amount: R [0] (all admissions)                      │
│   Turnaround Time: [48] hours                                   │
│   Emergency Override: [✓] Yes  [ ] No                          │
│   Requires Specialist Referral: [✓] Yes  [ ] No                │
│   Requires Medical Motivation: [ ] Yes  [✓] No                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ Required Documents:                                      │  │
│   │ [Add document: _______________] [+ Add]                 │  │
│   │                                                          │  │
│   │ • Admission letter from specialist      [Remove]        │  │
│   │ • Specialist referral                   [Remove]        │  │
│   │ • Medical motivation (if applicable)    [Remove]        │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│ ▼ 📄 Policy References                                          │
│   Section Number: [7.1]                                         │
│   Page Reference: [16]                                          │
│   Document Version: [Executive Plan v2.1 ▼]                    │
│   [View in Document]                                            │
│                                                                  │
│ [Save All Changes] [Cancel] [Delete This Benefit]              │
└─────────────────────────────────────────────────────────────────┘
```

## ✅ Full CRUD Operations

### CREATE:
- ✅ Add new inclusions (type & press Enter or click Add)
- ✅ Add new exclusions (type & press Enter or click Add)
- ✅ Add new conditions (type & press Enter or click Add)
- ✅ Add new hospitals to network (search & add)
- ✅ Add new procedure codes (ICD-10, tariff codes)
- ✅ Add new required documents

### READ:
- ✅ View all benefit details in collapsed/expanded view
- ✅ View full document (26 pages)
- ✅ Search within document
- ✅ View change history
- ✅ View all versions of documents

### UPDATE:
- ✅ Edit descriptions (rich text editor)
- ✅ Edit any inclusion/exclusion/condition
- ✅ Update limits, copayments, waiting periods
- ✅ Change network requirements
- ✅ Update room types and costs
- ✅ Modify procedure codes
- ✅ Change authorization rules
- ✅ Update policy references

### DELETE:
- ✅ Remove inclusions (click Remove button)
- ✅ Remove exclusions (click Remove button)
- ✅ Remove conditions (click Remove button)
- ✅ Remove hospitals from network
- ✅ Remove procedure codes
- ✅ Delete entire benefit (with confirmation)
- ✅ Archive old document versions

## 🔍 Additional Features

### Search & Filter:
- Search across all benefits
- Filter by category
- Search within documents
- Find specific ICD-10 codes

### Bulk Operations:
- Copy benefit to another product
- Duplicate benefit configuration
- Import from another product
- Export to PDF/Excel

### Validation:
- Required fields highlighted
- Duplicate detection
- Conflict warnings
- Completeness score

### Audit Trail:
- Every change tracked
- Who changed what
- When and why
- Revert to previous version

## 🎯 Summary

**YES - Admin can:**
1. ✅ View EVERYTHING clearly
2. ✅ Add new items to any list
3. ✅ Edit any existing item
4. ✅ Delete any item
5. ✅ Search and filter
6. ✅ Track all changes
7. ✅ View original documents
8. ✅ Export data

**Nothing is hidden. Everything is editable. Full control.**

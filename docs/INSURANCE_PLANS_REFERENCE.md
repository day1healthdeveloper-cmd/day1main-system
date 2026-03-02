# INSURANCE PLANS REFERENCE

## ALL 9 INSURANCE PLANS IN DATABASE

**IMPORTANT:** These are the ONLY 9 insurance plans in the system. Always reference these exact names and IDs.

---

### 1. Executive Hospital Plan
- **ID:** `9bb038ad-dbf6-480c-a71e-adb93943cb1c`
- **Status:** published
- **Type:** Hospital Plan
- **Category:** Executive

### 2. Executive Junior Plan
- **ID:** `c9f5019e-d584-4fe3-8e59-84682718f6ac`
- **Status:** published
- **Type:** Junior Plan
- **Category:** Executive

### 3. Executive Plan
- **ID:** `f64e2f78-14ba-425a-9fde-863e4ad708f1`
- **Status:** published
- **Type:** Comprehensive Plan
- **Category:** Executive

### 4. Platinum Hospital Plan
- **ID:** `57c3f348-36da-4e95-b357-d90518101bfc`
- **Status:** published
- **Type:** Hospital Plan
- **Category:** Platinum

### 5. Platinum Plan
- **ID:** `8730897b-c8db-4d36-82e8-a0cc80998155`
- **Status:** published
- **Type:** Comprehensive Plan
- **Category:** Platinum

### 6. Senior Comprehensive Hospital Plan
- **ID:** `f962addc-2ecb-42c5-a16e-56af84417fd7`
- **Status:** published
- **Type:** Hospital Plan
- **Category:** Senior

### 7. Value Plus Hospital Plan
- **ID:** `6f016877-6b34-485f-96c7-2f14bdaf81c4`
- **Status:** published
- **Type:** Hospital Plan
- **Category:** Value Plus

### 8. Value Plus Hospital Plan - Senior
- **ID:** `c7d41748-cbfa-4476-a8db-0dc21cf046aa`
- **Status:** published
- **Type:** Hospital Plan (Senior)
- **Category:** Value Plus

### 9. Value Plus Plan
- **ID:** `499e3163-0df1-48fa-b403-a1b3850f9acd`
- **Status:** published
- **Type:** Comprehensive Plan
- **Category:** Value Plus

---

## PLAN CATEGORIES

### Executive Plans (3 plans)
1. Executive Hospital Plan
2. Executive Junior Plan
3. Executive Plan

### Platinum Plans (2 plans)
4. Platinum Hospital Plan
5. Platinum Plan

### Senior Plans (1 plan)
6. Senior Comprehensive Hospital Plan

### Value Plus Plans (3 plans)
7. Value Plus Hospital Plan
8. Value Plus Hospital Plan - Senior
9. Value Plus Plan

---

## DATABASE TABLES

### Products Table
- Contains all 9 plans
- Table: `products`
- Status: All marked as `published`

### Policy Section Items Table
- Contains all policy documents, definitions, benefits
- Table: `policy_section_items`
- Each plan has ~60-140 items including:
  - 38 Definitions (same for all plans)
  - Waiting Periods
  - General Provisions
  - Payment of Premium
  - Exclusions & Limitations
  - General Conditions
  - Insuring Section (Benefits)
  - Funeral Benefit
  - Critical Illness Definitions

---

## QUICK REFERENCE SCRIPT

To list all plans anytime, run:
```bash
node apps/frontend/scripts/list-all-plans.js
```

---

**Last Updated:** February 26, 2026
**Total Plans:** 9
**All Plans Status:** Published & Active

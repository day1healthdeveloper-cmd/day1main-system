# Day1Health - Medical Insurer Configuration

## ✅ Changes Made

### 1. Removed Medical Scheme Option
- **Before**: Products could be "Medical Scheme" or "Insurance"
- **After**: All products are "Insurance" only

### 2. Updated Product Creation Form
- Removed radio button selection for regime type
- Added informational message: "Medical Insurance - Day1Health operates as a medical insurer regulated by the FSCA"
- Hardcoded regime to 'insurance'

### 3. Updated PMB Section
- Changed from: "PMB Covered (Required for Medical Schemes)"
- Changed to: "Include PMB Coverage (Optional)"
- Added note explaining PMB is optional for medical insurers

### 4. Updated Product Display
- Removed "MEDICAL SCHEME" badge from product cards
- Cleaner display without regime type badge

### 5. Updated Database
- All 4 existing products updated from 'medical_scheme' to 'insurance'
- Executive Hospital Plan ✅
- Platinum Hospital Plan ✅
- Value Plus Hospital Plan ✅
- Value Plus Hospital Plan - Senior ✅

## 📋 Key Differences

### Medical Scheme (CMS Regulated):
- Must cover Prescribed Minimum Benefits (PMBs)
- Community-rated (same premium for all)
- Cannot exclude pre-existing conditions
- Must accept all applicants
- Regulated by Council for Medical Schemes

### Medical Insurer (FSCA Regulated):
- PMB coverage is optional
- Can use risk-based pricing
- Can exclude pre-existing conditions
- Can decline applications
- Regulated by Financial Sector Conduct Authority

## 🎯 Day1Health Position

**Day1Health is a Medical Insurer**:
- FSCA regulated
- Can offer flexible product designs
- Can use underwriting
- Can set waiting periods
- Can exclude certain conditions
- PMB coverage is optional (can be included as a benefit)

## 📝 Product Configuration

### What You Can Do:
✅ Set any premium amounts
✅ Set any benefit limits
✅ Include or exclude any benefits
✅ Set waiting periods as needed
✅ Require medical underwriting
✅ Exclude pre-existing conditions
✅ Optionally include PMB coverage

### What Medical Schemes Must Do:
❌ Cover all PMBs (270+ conditions)
❌ Accept all applicants
❌ Community-rated premiums
❌ No pre-existing condition exclusions
❌ Limited waiting periods

## 🚀 Impact on System

### Policy Creator:
- Simplified product creation
- No confusion about regime type
- Clear messaging about being an insurer

### Benefits Configuration:
- Full flexibility in benefit design
- No mandatory PMB requirements
- Can create gap cover, hospital plans, etc.

### Claims Processing:
- Can apply policy exclusions
- Can enforce waiting periods
- Can decline claims for excluded conditions

### Compliance:
- FSCA reporting (not CMS)
- Different regulatory requirements
- Different consumer protection rules

## ✅ Files Updated

1. `apps/frontend/src/app/admin/products/new/page.tsx`
   - Removed regime selection
   - Updated PMB messaging
   - Hardcoded to 'insurance'

2. `apps/frontend/src/app/admin/products/page.tsx`
   - Removed regime badge display

3. Database (via `supabase/update-products-to-insurance.js`)
   - Updated all 4 products to 'insurance'

## 📊 Current State

All products now correctly configured as:
- **Regime**: insurance
- **Regulator**: FSCA
- **Type**: Medical Insurer
- **PMB**: Optional

The system now accurately reflects Day1Health's position as a medical insurer, not a medical scheme.

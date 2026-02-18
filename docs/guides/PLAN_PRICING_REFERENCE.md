# Plan Pricing Reference - All Valid Combinations

## Pricing Formula
- **Single**: Base price only
- **Couple**: Base + Spouse price
- **Family**: Base + Spouse + (Child price × number of children)

---

## Value Plus Hospital Plan (Ages 18-64)
**Base Prices:**
- Single: R390
- Spouse: +R312
- Child: +R156 (max 4 children)

**Valid Combinations (10 total):**
1. Single: R390
2. Single + 1 Child: R546
3. Single + 2 Children: R702
4. Single + 3 Children: R858
5. Single + 4 Children: R1,014
6. Couple: R702 (390 + 312)
7. Couple + 1 Child: R858 (390 + 312 + 156)
8. Couple + 2 Children: R1,014 (390 + 312 + 312)
9. Couple + 3 Children: R1,170 (390 + 312 + 468)
10. Couple + 4 Children: R1,326 (390 + 312 + 624)

---

## Platinum Hospital Plan (All Ages)
**Base Prices:**
- Single: R560
- Spouse: +R448
- Child: +R224 (max 4 children)

**Valid Combinations (10 total):**
1. Single: R560
2. Single + 1 Child: R784
3. Single + 2 Children: R1,008
4. Single + 3 Children: R1,232
5. Single + 4 Children: R1,456
6. Couple: R1,008 (560 + 448)
7. Couple + 1 Child: R1,232 (560 + 448 + 224)
8. Couple + 2 Children: R1,456 (560 + 448 + 448)
9. Couple + 3 Children: R1,680 (560 + 448 + 672)
10. Couple + 4 Children: R1,904 (560 + 448 + 896)

---

## Executive Hospital Plan (All Ages)
**Base Prices:**
- Single: R640
- Spouse: +R512
- Child: +R256 (max 4 children)

**Valid Combinations (10 total):**
1. Single: R640
2. Single + 1 Child: R896
3. Single + 2 Children: R1,152
4. Single + 3 Children: R1,408
5. Single + 4 Children: R1,664
6. Couple: R1,152 (640 + 512)
7. Couple + 1 Child: R1,408 (640 + 512 + 256)
8. Couple + 2 Children: R1,664 (640 + 512 + 512)
9. Couple + 3 Children: R1,920 (640 + 512 + 768)
10. Couple + 4 Children: R2,176 (640 + 512 + 1024)

---

## Value Plus Senior Plan (Ages 65+)
**Base Prices:**
- Single: R580
- Spouse: +R580 (same as base for seniors)
- Child: R0 (no children allowed)

**Valid Combinations (2 total):**
1. Single: R580
2. Couple: R1,160 (580 + 580)

---

## Implementation Status

### ✅ FIXED: ThreePlanCards.tsx (Drag-n-Drop Component)
- Removed hardcoded `couplePrice` and `familyPrice`
- Now uses correct formula: `base + spouse + (child × count)`
- `getDisplayPrice()` function correctly calculates:
  - Single: `plan.price`
  - Couple: `plan.price + plan.spousePrice`
  - Family: `plan.price + plan.spousePrice + plan.childPrice`

### ✅ FIXED: PlanSlider.tsx
- `calculateTotalPrice()` function uses correct formula
- Calculator shows for Single, Couple, and Family options
- Couple option now shows children calculator
- All combinations calculate correctly

### 🎯 Testing Checklist
- [ ] Test Value Plus: Single, Couple, Couple+Children
- [ ] Test Platinum: Single, Couple, Couple+Children
- [ ] Test Executive: Single, Couple, Couple+Children
- [ ] Test Senior: Single, Couple (no children option)
- [ ] Verify drag-n-drop shows correct prices
- [ ] Verify plan slider shows correct prices
- [ ] Test hard refresh maintains correct prices

---

## Notes
- All prices are monthly premiums
- Maximum 4 children per family (except Senior plan)
- Senior plan does not allow children
- Pricing is consistent across all components
- Source: JSON files in `cover plan details/` folder

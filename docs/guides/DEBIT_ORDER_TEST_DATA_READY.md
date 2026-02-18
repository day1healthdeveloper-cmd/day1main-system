# Debit Order Test Data - Ready for Testing

## ✅ Setup Complete

**Date:** February 8, 2026  
**Total Test Members:** 190 (10 per broker group)  
**Total Members in System:** 900 (715 DAY1 + 185 test members)

---

## 📊 Test Data Distribution

### By Broker Group (10 members each)
- DAY1 - Day1Health Direct
- D1PAR - Parabellum
- D1MAM - Mamela
- D1ACU - Acumen Holdings
- D1AIB - Assurity Insurance Broker
- D1ARC - ARC BPO
- D1AXS - Accsure
- D1BOU - Boulderson
- D1BPO - Agency BPO
- D1CSS - CSS Credit Solutions
- D1MED - Medi-Safu Brokers
- D1MEM - Medi-Safu Montana
- D1MKT - MKT Marketing
- D1MTS - All My T
- D1NAV - Day1 Navigator
- D1RCO - Right Cover Online
- D1TFG - The Foschini Group
- D1THR - 360 Financial Service
- D1TLD - Teledirect

---

## 🧪 Test Scenarios (Per Group)

Each broker group has 10 members with these scenarios:

### 1. Active Members (5 per group)
- ✅ Successful debit orders
- ✅ Last payment completed
- ✅ Next debit date scheduled
- ✅ Zero arrears
- ✅ Zero failed attempts

### 2. Failed Members (2 per group)
- ❌ Last debit failed (insufficient funds)
- ❌ 1 failed attempt
- ❌ Arrears = 1 month premium
- ❌ Status: failed
- ❌ Next debit scheduled for retry

### 3. Suspended Member (1 per group)
- ⏸️ Too many failed attempts (3+)
- ⏸️ Status: suspended
- ⏸️ Arrears = 2 months premium
- ⏸️ No next debit date (suspended)
- ⏸️ Requires manual intervention

### 4. Pending Member (1 per group)
- ⏳ New member, first debit pending
- ⏳ No payment history yet
- ⏳ Mandate signed
- ⏳ Next debit date scheduled
- ⏳ Zero arrears

### 5. Arrears Member (1 per group)
- 💰 Active but missed 2 payments
- 💰 2 failed attempts
- 💰 Arrears = 2 months premium
- 💰 Status: active (not suspended yet)
- 💰 Next debit scheduled

---

## 💳 Test Data Includes

### Banking Details
- **Banks:** Standard Bank, FNB, ABSA, Nedbank, Capitec
- **Account Numbers:** Realistic 9-digit numbers
- **Branch Codes:** Valid SA branch codes
- **Account Holder Names:** Match member names

### Debit Order Details
- **Debit Days:** 2nd, 10th, 15th, 20th, 26th, 27th of month
- **Premium Amounts:** R325 - R2,262 (realistic Day1Health pricing)
- **Netcash References:** D1-{member_number} format
- **Mandate Dates:** All signed in December 2025

### Member Details
- **Names:** Realistic SA names (Zulu, Xhosa, Afrikaans, English)
- **ID Numbers:** Valid SA ID format (1970-2005 birth years)
- **Email:** firstname.lastname@test.com
- **Mobile:** Valid SA mobile format (082xxxxxxx)
- **Addresses:** Johannesburg, Cape Town, Durban, Pretoria

### Payment History
- **Last Payment Date:** Based on scenario
- **Last Payment Amount:** Matches premium
- **Last Debit Date:** Last attempt date
- **Next Debit Date:** Calculated based on debit_order_day
- **Failed Count:** 0-3 based on scenario
- **Total Arrears:** R0 - R2,524 based on scenario

---

## 📊 Current System Status

### Overall Statistics
- **Total Members:** 900
- **Active Debit Orders:** 819 (91%)
- **Failed Debit Orders:** 38 (4%)
- **Suspended:** 19 (2%)
- **Pending First Debit:** 24 (3%)

### Financial Summary
- **Monthly Premium Income:** R802,887.61
- **Total Arrears:** R139,141.25
- **Average Premium:** R892.10
- **Collection Rate:** 91%

### Bank Distribution
- Standard Bank: 40 members
- FNB: 43 members
- ABSA: 45 members
- Nedbank: 30 members
- Capitec: 35 members

---

## 🧪 Testing Scenarios

### Scenario 1: Process Monthly Debit Run
**Test:** Run debit orders for all active members  
**Expected Results:**
- 819 active members processed
- ~95% success rate (778 successful)
- ~5% failures (41 failed)
- Failed members increment failed_debit_count
- Successful members update last_payment_date

### Scenario 2: Handle Failed Debits
**Test:** Process failed debit orders  
**Expected Results:**
- 38 existing failed members
- Increment failed_debit_count
- Add to total_arrears
- Send failure notifications
- Schedule retry for next month

### Scenario 3: Suspend Members
**Test:** Auto-suspend members with 3+ failures  
**Expected Results:**
- 19 members already suspended
- New failures reaching 3 should auto-suspend
- Status changes to 'suspended'
- next_debit_date set to null
- Send suspension notification

### Scenario 4: Process First-Time Debits
**Test:** Process pending members' first debit  
**Expected Results:**
- 24 pending members
- First debit attempt
- Update debit_order_status based on result
- Set last_payment_date if successful
- Set last_debit_date

### Scenario 5: Arrears Collection
**Test:** Collect arrears from members  
**Expected Results:**
- Identify members with total_arrears > 0
- Attempt to collect arrears + current premium
- Update total_arrears on success
- Send arrears notifications

### Scenario 6: Reinstate Suspended Members
**Test:** Reinstate suspended members after payment  
**Expected Results:**
- 19 suspended members
- Manual payment received
- Clear arrears
- Reset failed_debit_count to 0
- Change status to 'active'
- Calculate new next_debit_date

---

## 🔍 Verification Scripts

### Check Test Data
```bash
cd supabase
node verify-debit-order-test-data.js
```

### Check Specific Broker Group
```bash
cd supabase
node check-all-brokers.js
```

### View Member Details
```sql
SELECT 
  member_number,
  first_name,
  last_name,
  broker_group,
  bank_name,
  monthly_premium,
  debit_order_status,
  payment_status,
  failed_debit_count,
  total_arrears,
  last_payment_date,
  next_debit_date
FROM members
WHERE broker_group = 'D1PAR'
ORDER BY member_number
LIMIT 10;
```

---

## 📋 Next Steps

1. ✅ Test data ready (190 members across 19 groups)
2. ⏳ Build debit order processing system
3. ⏳ Build Netcash API integration
4. ⏳ Build debit order batch creation
5. ⏳ Build payment reconciliation
6. ⏳ Build member payment portal
7. ⏳ Build broker dashboards
8. ⏳ Build financial reporting

---

## 🎯 Ready for Testing

All 190 test members (10 per broker group) now have:
- ✅ Complete banking details
- ✅ Realistic SA names and ID numbers
- ✅ Netcash account references
- ✅ Payment history
- ✅ Debit order status
- ✅ Arrears tracking
- ✅ Failed attempt counts
- ✅ Next debit dates

**System is ready for full debit order testing!**

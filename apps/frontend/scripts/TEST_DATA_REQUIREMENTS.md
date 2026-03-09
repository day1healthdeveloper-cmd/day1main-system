# Test Data Requirements for Daily Operations

## Overview
This document outlines the database columns needed for testing fee collections, commissions, and claims processing.

---

## 1. SA ID Number Format

**Format:** `YYMMDD SSSS C A Z`

- **YY** = Year of birth (2 digits)
- **MM** = Month of birth (01-12)
- **DD** = Day of birth (01-31)
- **SSSS** = Sequence number
  - 0000-4999 = Female
  - 5000-9999 = Male
- **C** = Citizenship (0=SA citizen, 1=permanent resident)
- **A** = Usually 8 (legacy race classifier)
- **Z** = Checksum digit

**Examples:**
- `8501155800084` - Male born 15 Jan 1985
- `9203203456089` - Female born 20 Mar 1992

---

## 2. SA Banking Details Format

### Major Banks & Branch Codes:
- **Standard Bank**: Branch code `051001`
- **FNB**: Branch code `250655`
- **ABSA**: Branch code `632005`
- **Nedbank**: Branch code `198765`
- **Capitec**: Branch code `470010`

### Account Numbers:
- Format: 9-11 digits
- Examples: `1234567890`, `62345678901`

---

## 3. Debit Order & EFT Dates

### Recommended Test Dates:
Spread across month for varied testing:
- **1st** - Start of month
- **7th** - Early month
- **15th** - Mid-month
- **20th** - Late mid-month
- **25th** - End of month
- **28th** - Safe end date (works for all months)

### Collection Methods:
1. `individual_debit_order` - Single member debit orders
2. `group_debit_order` - Bulk company debit orders
3. `eft` - Electronic funds transfer (manual payment)

---

## 4. Columns Required for FEE COLLECTIONS Testing

### Essential Columns:

| Column | Purpose | Example Values |
|--------|---------|----------------|
| `netcash_account_reference` | Unique Netcash reference | `NC00000001`, `NC00000002` |
| `debit_order_day` | Day of month for collection | `1`, `15`, `25` |
| `debit_order_status` | Debit order state | `active`, `pending`, `suspended` |
| `payment_status` | Payment state | `paid`, `pending`, `failed`, `overdue` |
| `last_payment_date` | Last successful payment | `2024-02-15` |
| `next_debit_date` | Next scheduled collection | `2024-03-15` |
| `total_arrears` | Outstanding amount | `0`, `450.00`, `900.00` |
| `collection_method` | How payment is collected | `individual_debit_order`, `group_debit_order`, `eft` |
| `payment_group_id` | Group for bulk collections | UUID or NULL |
| `monthly_premium` | Amount to collect | `450.00`, `750.00` |
| `bank_name` | Member's bank | `Standard Bank`, `FNB` |
| `account_number` | Bank account | `1234567890` |
| `branch_code` | Bank branch | `051001` |

### Testing Scenarios:

1. **Successful Collections**
   - `payment_status = 'paid'`
   - `debit_order_status = 'active'`
   - `total_arrears = 0`

2. **Failed Collections**
   - `payment_status = 'failed'`
   - `debit_order_status = 'active'`
   - `total_arrears > 0`

3. **Overdue Payments**
   - `payment_status = 'overdue'`
   - `last_payment_date` > 30 days ago
   - `total_arrears` = multiple months

4. **Group Collections**
   - `collection_method = 'group_debit_order'`
   - `payment_group_id` = valid group UUID
   - All members in group collected together

5. **EFT Payments**
   - `collection_method = 'eft'`
   - `payment_status = 'pending'`
   - Manual reconciliation required

---

## 5. Columns Required for COMMISSIONS Testing

### Essential Columns:

| Column | Purpose | Example Values |
|--------|---------|----------------|
| `broker_id` | Link to broker | UUID |
| `broker_code` | Broker identifier | `BRK001`, `BRK002` |
| `monthly_premium` | Base for commission calc | `450.00` |
| `payment_status` | Only pay on successful payments | `paid` |
| `last_payment_date` | When commission earned | `2024-02-15` |

### Broker Table Columns:

| Column | Purpose | Example Values |
|--------|---------|----------------|
| `broker_commission_rate` | Broker's commission % | `10.00`, `15.00` |
| `branch_commission_rate` | Branch commission % | `5.00` |
| `agent_commission_rate` | Agent commission % | `3.00` |

### Commission Calculation:
```
Commission = monthly_premium × (broker_commission_rate / 100)
```

### Testing Scenarios:

1. **Standard Commission**
   - Member with `broker_id` assigned
   - `payment_status = 'paid'`
   - Calculate: `450.00 × 10% = R45.00`

2. **No Commission (Failed Payment)**
   - `payment_status = 'failed'`
   - Commission = R0.00

3. **No Commission (No Broker)**
   - `broker_id = NULL`
   - Direct member, no commission

4. **Multi-tier Commission**
   - Broker: 10%
   - Branch: 5%
   - Agent: 3%
   - Total: 18% of premium

---

## 6. Columns Required for CLAIMS Testing

### Essential Columns:

| Column | Purpose | Example Values |
|--------|---------|----------------|
| `id` | Member identifier | UUID |
| `member_number` | Member reference | `MEM001234` |
| `plan_id` | Determines coverage | UUID |
| `monthly_premium` | Verify paid up | `450.00` |
| `payment_status` | Must be active for claims | `paid` |
| `status` | Member must be active | `active` |
| `total_arrears` | Must be 0 for claims | `0` |

### Claims Table Columns Needed:

| Column | Purpose | Example Values |
|--------|---------|----------------|
| `claim_number` | Unique claim ID | `CLM2024001` |
| `member_id` | Link to member | UUID |
| `provider_id` | Healthcare provider | UUID |
| `service_date` | Date of service | `2024-02-15` |
| `claim_type` | Type of claim | `consultation`, `hospital`, `chronic` |
| `claimed_amount` | Amount claimed | `1500.00` |
| `approved_amount` | Amount approved | `1200.00` |
| `status` | Claim status | `pending`, `approved`, `rejected`, `paid` |

### Testing Scenarios:

1. **Valid Claim**
   - Member `status = 'active'`
   - Member `payment_status = 'paid'`
   - Member `total_arrears = 0`
   - Claim within plan limits

2. **Rejected Claim (Arrears)**
   - Member `total_arrears > 0`
   - Claim rejected due to non-payment

3. **Rejected Claim (Inactive)**
   - Member `status = 'suspended'` or `'cancelled'`
   - No coverage

4. **Partial Approval**
   - `claimed_amount = 1500.00`
   - `approved_amount = 1200.00`
   - Member pays difference

---

## 7. Additional Testing Data

### Contact Information:
- **Mobile** (for SMS): `0821234567`, `0739876543`
- **Phone** (landline): `0215551234`, `0115552345`
- Some members have only mobile, some have both

### Payment Groups:
For group testing, create payment groups with:
- `collection_method = 'group_debit_order'` or `'eft'`
- `collection_day` = specific day of month
- Multiple members assigned to same group

### Netcash Integration:
- Each member needs unique `netcash_account_reference`
- Format: `NC00000001`, `NC00000002`, etc.
- Used for tracking in Netcash system

---

## 8. Running the Test Data Script

### Execute the SQL script:

```bash
# Using Supabase CLI
supabase db execute -f apps/frontend/scripts/populate-test-data.sql

# Or using psql
psql -h [host] -U [user] -d [database] -f apps/frontend/scripts/populate-test-data.sql
```

### What the script does:
1. Updates 50 members with valid SA ID numbers
2. Assigns SA bank accounts with proper formats
3. Sets varied debit order dates (1st, 7th, 15th, 20th, 25th, 28th)
4. Assigns collection methods (individual, group, EFT)
5. Sets payment statuses (paid, pending, failed, overdue)
6. Creates arrears scenarios for testing
7. Assigns some members to brokers for commission testing
8. Assigns some members to payment groups
9. Sets mobile and landline numbers

---

## 9. Verification Queries

### Check ID Numbers:
```sql
SELECT member_number, first_name, last_name, id_number 
FROM members 
WHERE id_number ~ '^[0-9]{13}$'
LIMIT 20;
```

### Check Banking Details:
```sql
SELECT member_number, bank_name, account_number, branch_code, debit_order_day
FROM members 
WHERE bank_name IS NOT NULL
LIMIT 20;
```

### Check Payment Status Distribution:
```sql
SELECT payment_status, COUNT(*) 
FROM members 
GROUP BY payment_status;
```

### Check Collection Methods:
```sql
SELECT collection_method, COUNT(*) 
FROM members 
GROUP BY collection_method;
```

### Check Members with Arrears:
```sql
SELECT member_number, monthly_premium, total_arrears, payment_status
FROM members 
WHERE total_arrears > 0
ORDER BY total_arrears DESC;
```

### Check Broker Assignments:
```sql
SELECT m.member_number, m.broker_code, b.name, b.broker_commission_rate
FROM members m
JOIN brokers b ON m.broker_id = b.id
WHERE m.broker_id IS NOT NULL
LIMIT 20;
```

---

## 10. Next Steps for Testing

### Fee Collections:
1. Run debit order batch for specific date
2. Test individual vs group collections
3. Test failed payment handling
4. Test arrears accumulation
5. Test EFT reconciliation

### Commissions:
1. Calculate commissions for paid members
2. Generate commission reports by broker
3. Test multi-tier commission splits
4. Test commission on failed payments (should be 0)

### Claims:
1. Submit test claims for active members
2. Test claim rejection for members with arrears
3. Test claim approval workflow
4. Test partial claim approvals
5. Test claim payment processing

---

## Summary

The test data script populates all necessary columns for comprehensive testing of:
- ✅ Fee collections (individual, group, EFT)
- ✅ Commission calculations
- ✅ Claims processing
- ✅ Payment reconciliation
- ✅ Arrears management

All data uses proper South African formats for ID numbers, bank accounts, and phone numbers.

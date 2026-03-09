# Quick Reference: SA Formats & Test Data

## SA ID Number Format
```
YYMMDD SSSS C A Z
```
- **YY**: Year (85 = 1985)
- **MM**: Month (01-12)
- **DD**: Day (01-31)
- **SSSS**: 0000-4999 (Female), 5000-9999 (Male)
- **C**: 0 (Citizen), 1 (Permanent Resident)
- **A**: 8 (always)
- **Z**: Checksum

**Examples:**
- `8501155800084` - Male, 15 Jan 1985
- `9203203456089` - Female, 20 Mar 1992

---

## SA Bank Details

### Major Banks:
| Bank | Branch Code |
|------|-------------|
| Standard Bank | 051001 |
| FNB | 250655 |
| ABSA | 632005 |
| Nedbank | 198765 |
| Capitec | 470010 |

### Account Numbers:
- 9-11 digits
- Examples: `1234567890`, `62345678901`

---

## Phone Numbers

### Mobile (Cell):
- Format: `082XXXXXXX`, `073XXXXXXX`, `084XXXXXXX`
- Examples: `0821234567`, `0739876543`

### Landline:
- Cape Town: `021XXXXXXX`
- Johannesburg: `011XXXXXXX`
- Examples: `0215551234`, `0115552345`

---

## Critical Columns for Testing

### Fee Collections:
```
✓ netcash_account_reference
✓ debit_order_day (1-28)
✓ debit_order_status (active/pending/suspended)
✓ payment_status (paid/pending/failed/overdue)
✓ last_payment_date
✓ next_debit_date
✓ total_arrears
✓ collection_method (individual_debit_order/group_debit_order/eft)
✓ payment_group_id
✓ monthly_premium
✓ bank_name, account_number, branch_code
```

### Commissions:
```
✓ broker_id
✓ broker_code
✓ monthly_premium
✓ payment_status (only 'paid' earns commission)
✓ broker_commission_rate (in brokers table)
```

### Claims:
```
✓ member_id
✓ plan_id
✓ status (must be 'active')
✓ payment_status (must be 'paid')
✓ total_arrears (must be 0)
✓ Claims table: claim_number, provider_id, service_date, claimed_amount
```

---

## Run Test Data Script

```bash
# Execute SQL script to populate 50 members with test data
supabase db execute -f apps/frontend/scripts/populate-test-data.sql
```

---

## Quick Verification

```sql
-- Check updated members
SELECT member_number, id_number, bank_name, debit_order_day, 
       payment_status, collection_method, broker_code
FROM members 
WHERE netcash_account_reference LIKE 'NC%'
LIMIT 20;
```

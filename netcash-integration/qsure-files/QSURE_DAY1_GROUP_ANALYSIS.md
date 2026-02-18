# QSURE DAY1 Group Analysis - January 2026

## Statement Overview

**Source:** QSURE DAY1 Statement (2026.01).pdf  
**Agreement:** QSURETrustAcc - Life - Day 1 Health  
**Sub Account:** QSURE - Day 1 Debit Orders  
**Collection Period:** January, 2026  
**Report Date:** 2026-02-06

---

## Collections Summary

| Transaction Type | Volume | Value (R) | Notes |
|-----------------|--------|-----------|-------|
| **Collections** | 891 | R 958,043.50 | Successful debit orders |
| **Collection Rejections** | 105 | -R 130,685.00 | Failed debit orders |
| **Total Processed** | 996 | **R 827,358.50** | Net collections |

---

## Key Metrics

### Success Rate
- **Successful:** 891 / 996 = **89.5%**
- **Rejected:** 105 / 996 = **10.5%**

This is significantly higher than the 3% rejection rate mentioned earlier. The 10.5% rejection rate is more typical for debit orders in South Africa.

### Average Premium
- **Per successful member:** R 958,043.50 / 891 = **R 1,075.13**
- **Per total member:** R 827,358.50 / 996 = **R 830.58**

### Member Count
- **Total members in DAY 1 group:** ~996 members (January 2026)

---

## Financial Breakdown

### Gross Collections
```
891 successful transactions × R 1,075 avg = R 958,043.50
```

### Rejections
```
105 failed transactions × R 1,244 avg = R 130,685.00
```

**Note:** Rejected transactions have higher average (R 1,244 vs R 1,075), suggesting higher-premium members have more payment issues.

### Net Collections
```
R 958,043.50 - R 130,685.00 = R 827,358.50
```

---

## Qsure Costs for DAY 1 Group

Based on Qsure pricing structure:

### Monthly Costs
```
Administration Fees:     R 840.00 × 2 accounts = R 1,680.00
Successful Collections:  891 × R 2.26 = R 2,013.66
Rejections:             105 × R 10.24 = R 1,075.20
Payments:               (estimate) × R 6.85 = R TBD

Total Monthly Cost (DAY 1 only): ~R 4,768.86
```

### Annual Costs (DAY 1 Group Only)
```
R 4,768.86 × 12 = R 57,226.32 per year
```

---

## Netcash Comparison for DAY 1 Group

### Netcash Pricing (Single Account)
```
Monthly Fee:            R 500.00 (covers all groups)
Per Transaction:        R 2.50
Successful Collections: 891 × R 2.50 = R 2,227.50
Rejections:            105 × R 2.50 = R 262.50

Total Monthly Cost: R 2,990.00
```

### Annual Savings (DAY 1 Group Portion)
```
Qsure:   R 4,768.86/month
Netcash: R 2,990.00/month
Savings: R 1,778.86/month = R 21,346.32/year
```

**Note:** This is just for DAY 1 group. With all 19 broker groups (3,500 members), savings would be much higher.

---

## Rejection Analysis

### Rejection Rate: 10.5%
This is typical for South African debit orders. Common reasons:
1. **Insufficient funds** (most common - ~70%)
2. **Account closed**
3. **Disputed transaction**
4. **Bank account frozen**
5. **Incorrect bank details**

### Rejection Cost Impact
```
105 rejections × R 10.24 = R 1,075.20 (Qsure)
105 rejections × R 2.50 = R 262.50 (Netcash)

Savings on rejections alone: R 812.70/month
```

---

## DAY 1 Group Characteristics

### What is DAY 1 Group?
- **Direct sales channel** (not through brokers)
- **Day1Health Direct** sales
- **No broker commissions** (saves 5-8% on premiums)
- **996 members** in January 2026

### Policy Number Format
- Likely uses **DAY1xxxx** or **D1Hxxxx** prefix
- Different from broker prefixes (PAR, MAM, ACU, etc.)

### Commission Structure
Since this is direct sales:
- **Broker Commission:** 0% (no broker)
- **Branch Commission:** 0% (no branch)
- **Agent Commission:** 0% (no agent)
- **All revenue retained by Day1Health**

---

## Database Schema Impact

### DAY 1 Broker Record
```sql
INSERT INTO brokers (
  code,
  name,
  broker_commission_rate,
  branch_commission_rate,
  agent_commission_rate,
  policy_prefix,
  status,
  member_count
) VALUES (
  'DAY1',
  'Day1Health Direct',
  0.00, -- No broker commission
  0.00, -- No branch commission
  0.00, -- No agent commission
  'DAY1',
  'active',
  996
);
```

### Member Linking
```sql
-- Link DAY 1 members
UPDATE members
SET broker_id = (SELECT id FROM brokers WHERE code = 'DAY1'),
    broker_code = 'DAY1'
WHERE policy_number LIKE 'DAY1%' OR policy_number LIKE 'D1H%';
```

---

## Operations Dashboard - DAY 1 Group

```
Broker: DAY 1 - Day1Health Direct

Overview:
- Members: 996
- Monthly Premium: R 958,043.50 (gross)
- Net Collections: R 827,358.50
- Success Rate: 89.5%
- Rejection Rate: 10.5%

Commission Breakdown:
- Broker Commission: R 0.00 (0.0%)
- Branch Commission: R 0.00 (0.0%)
- Agent Commission: R 0.00 (0.0%)
- Total Commission: R 0.00

Revenue Retained: R 827,358.50 (100%)

Recent Performance:
- January 2026: 89.5% success (996 members)
- December 2025: TBD
- November 2025: TBD

[View Members] [View Transactions] [Download Report]
```

---

## Comparison: DAY 1 vs Broker Channels

### DAY 1 Direct (No Broker)
- **Members:** 996
- **Gross Premium:** R 958,043.50
- **Commission:** R 0.00 (0%)
- **Net Revenue:** R 827,358.50 (100%)

### Broker Channel Example (D1PAR - Parabellum)
- **Members:** 1,447
- **Gross Premium:** R 1,302,300 (estimated)
- **Commission:** R 104,184 (8% total)
- **Net Revenue:** R 1,198,116 (92%)

### Key Insight
Direct sales (DAY 1) are more profitable per member because there are no broker commissions. However, brokers bring in more volume (1,447 vs 996 members).

---

## Next Steps

### Data Collection
1. ✅ DAY 1 group total: R 827,358.50
2. ✅ DAY 1 member count: 996
3. ✅ DAY 1 success rate: 89.5%
4. ⏳ Get statements for other 18 broker groups
5. ⏳ Get commission rates per broker (Excel Columns Q, R, S)
6. ⏳ Get member counts per broker (Excel Column X)

### Database Setup
1. Create DAY 1 broker record with 0% commission
2. Link 996 members to DAY 1 group
3. Import January 2026 transaction history
4. Set up rejection tracking and retry logic

### Frontend Development
1. DAY 1 performance dashboard
2. Compare DAY 1 vs broker channels
3. Track direct sales vs broker sales
4. Revenue analysis (direct vs broker)

---

## Questions for User

1. **Do you have statements for the other 18 broker groups?** (Similar to this DAY 1 statement)
2. **What are the policy number prefixes for DAY 1 members?** (DAY1xxxx or D1Hxxxx?)
3. **Are there any commission overrides for DAY 1?** (Sales team bonuses, etc.)
4. **What's the target split between direct sales and broker sales?**

---

**Status:** ✅ DAY 1 group analyzed - 996 members, R 827,358.50 net collections  
**Next:** Analyze other 18 broker group statements to get complete picture

# Group Codes DECODED - Day1Health Debit Order Groups

## Complete List of All 19 Broker Channels

Based on user-provided information and Excel analysis:

| Code | Full Company Name | Member Count | Status |
|------|-------------------|--------------|--------|
| **D1PAR** | **Parabellum** | 1447 | ✅ Active - Largest |
| **D1MAM** | Mamela | - | ✅ Active |
| **D1ACU** | Acumen Holdings (PTY) LTD | 6 | ✅ Active |
| **D1AIB** | Assurity Insurance Broker | - | ✅ Active |
| **D1ARC** | ARC BPO | - | ✅ Active |
| **D1AXS** | Accsure | - | ✅ Active |
| **D1BOU** | Boulderson | - | ✅ Active |
| **D1BPO** | Agency BPO | - | ✅ Active |
| **D1CSS** | CSS Credit Solutions Services | - | ✅ Active |
| **D1MED** | Medi-Safu Brokers | 574 | ✅ Active |
| **D1MEM** | Medi-Safu Brokers Montana | - | ✅ Active |
| **D1MKT** | MKT Marketing | 610 | ✅ Active |
| **D1MTS** | All My T | - | ✅ Active |
| **D1NAV** | Day1 Navigator | 381 | ✅ Active |
| **D1RCO** | Right Cover Online | - | ✅ Active |
| **D1TFG** | The Foschini Group | - | ✅ Active |
| **D1THR** | 360 Financial Service | - | ✅ Active |
| **D1TLD** | Teledirect | - | ✅ Active |
| **DAY 1** | Day1Health Direct | - | ✅ Active - Direct Sales |

**Total Members:** ~3,500 across all broker channels

---

## What These Are

### BROKER/DISTRIBUTION CHANNELS
These are **NOT** different product lines or sub-accounts. They are:
- Independent broker partners
- Distribution channels
- Sales agents/agencies
- Each with separate commission structures
- Each requiring separate tracking and reporting

### Why They Must Stay Separate:
1. **Commission tracking** - Each broker has different commission rates (Broker/Branch/Agent)
2. **Reporting** - Each broker needs their own performance reports
3. **Reconciliation** - Payments must be tracked per broker
4. **Legal** - Separate contracts per broker
5. **Performance** - Track which brokers are performing
6. **Staff familiarity** - Team knows these codes (D1PAR, D1MAM, etc.)

---

## Excel Columns Structure

From the debit order file analysis:

| Column | Field | Purpose |
|--------|-------|---------|
| M | Paymethod | Payment method |
| N | Company | Full broker company name |
| O | Personal | Personal details |
| P | Premium | Monthly premium amount |
| Q | Broker Commission | Commission rate for broker |
| R | Branch Commission | Commission rate for branch |
| S | Agent Commission | Commission rate for agent |
| T | Africa Assist | Service provider allocation |
| U | AU Funeral | Service provider allocation |
| V | African Unit | Service provider allocation |
| W | ADMIN | Admin fees |
| X | No of Clients | Member count per broker |
| Y | Payments Check | Payment verification |

---

## Policy Number Prefixes

Each broker has a unique policy number prefix:

| Broker Code | Policy Prefix | Example |
|-------------|---------------|---------|
| D1PAR | PAR10xxx | PAR10001, PAR10002 |
| D1MAM | MAM1xxx | MAM1001, MAM1002 |
| D1ACU | ACU1xxx | ACU1001, ACU1002 |
| D1ARC | ARC1xxx | ARC1001, ARC1002 |
| D1MED | MED1xxx | MED1001, MED1002 |
| D1MKT | MKT1xxx | MKT1001, MKT1002 |
| D1NAV | NAV1xxx | NAV1001, NAV1002 |
| D1TLD | TLD1xxx | TLD1001, TLD1002 |
| ... | ... | ... |

This allows automatic broker identification from policy numbers.

---

## Database Schema Requirements

### Brokers Table
```sql
CREATE TABLE brokers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) UNIQUE NOT NULL, -- D1PAR, D1MAM, etc.
  name VARCHAR(200) NOT NULL, -- Full company name
  broker_commission_rate DECIMAL(5,2), -- Column Q
  branch_commission_rate DECIMAL(5,2), -- Column R
  agent_commission_rate DECIMAL(5,2), -- Column S
  policy_prefix VARCHAR(10), -- PAR, MAM, ACU, etc.
  status VARCHAR(20) DEFAULT 'active',
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Members Table Link
```sql
-- Add broker tracking to members
ALTER TABLE members ADD COLUMN broker_id UUID REFERENCES brokers(id);
ALTER TABLE members ADD COLUMN broker_code VARCHAR(10);
CREATE INDEX idx_members_broker_code ON members(broker_code);
```

### Debit Order Tracking
```sql
-- Track broker per debit order run
ALTER TABLE debit_order_runs ADD COLUMN broker_id UUID REFERENCES brokers(id);
ALTER TABLE debit_order_runs ADD COLUMN broker_code VARCHAR(10);

-- Track broker per transaction
ALTER TABLE debit_order_transactions ADD COLUMN broker_id UUID REFERENCES brokers(id);
ALTER TABLE debit_order_transactions ADD COLUMN broker_code VARCHAR(10);
```

---

## Netcash Strategy - SINGLE ACCOUNT RECOMMENDED

### ✅ Single Netcash Account + Broker Management System

**Why:**
- **Cost effective:** R9,355/month for all 3,500 members vs R10,665/month with Qsure
- **Saves:** R15,720/year
- **Broker tracking:** Database knows which member belongs to which broker
- **Commission calculation:** Automated per broker using rates from Excel
- **Reporting:** Filter by broker code
- **Flexible:** Can batch all together or run per broker
- **Scalable:** Add new brokers without new Netcash accounts

**How It Works:**
1. Create `brokers` table with all 19 brokers
2. Link each member to their broker via policy prefix
3. Operations dashboard shows all brokers separately
4. Can run debit orders for ALL brokers OR select specific ones
5. Commission reports generated per broker automatically
6. Each broker gets their own performance dashboard
7. Staff continue using familiar codes (D1PAR, D1MAM, etc.)

---

## Operations Dashboard Design

```
Debit Order Run - February 2026

Select Brokers to Process:
☑ D1PAR - Parabellum (1,447 members) - R1,302,300
☑ D1MAM - Mamela (TBD members) - R TBD
☑ D1ACU - Acumen Holdings (6 members) - R5,400
☑ D1AIB - Assurity Insurance Broker (TBD members) - R TBD
☑ D1ARC - ARC BPO (TBD members) - R TBD
☑ D1AXS - Accsure (TBD members) - R TBD
☑ D1BOU - Boulderson (TBD members) - R TBD
☑ D1BPO - Agency BPO (TBD members) - R TBD
☑ D1CSS - CSS Credit Solutions (TBD members) - R TBD
☑ D1MED - Medi-Safu Brokers (574 members) - R516,600
☑ D1MEM - Medi-Safu Montana (TBD members) - R TBD
☑ D1MKT - MKT Marketing (610 members) - R549,000
☑ D1MTS - All My T (TBD members) - R TBD
☑ D1NAV - Day1 Navigator (381 members) - R342,900
☑ D1RCO - Right Cover Online (TBD members) - R TBD
☑ D1TFG - The Foschini Group (TBD members) - R TBD
☑ D1THR - 360 Financial Service (TBD members) - R TBD
☑ D1TLD - Teledirect (TBD members) - R TBD
☑ DAY 1 - Day1Health Direct (TBD members) - R TBD

Total Selected: 3,500 members - R3,150,000 (estimated)

[Select All] [Deselect All] [Run Selected] [Preview] [Schedule]
```

---

## Broker Performance Dashboard Design

```
Broker: D1PAR - Parabellum

Overview:
- Members: 1,447
- Monthly Premium: R1,302,300
- Success Rate: 97.2%
- Rejection Rate: 2.8%

Commission Breakdown:
- Broker Commission: R65,115 (5.0%)
- Branch Commission: R26,046 (2.0%)
- Agent Commission: R13,023 (1.0%)
- Total Commission: R104,184

Recent Performance:
- January 2026: 98.1% success
- December 2025: 97.5% success
- November 2025: 96.8% success

[View Members] [View Transactions] [Download Report] [Commission Statement]
```

---

## Next Steps

### Data Collection Needed:
1. ✅ All 19 broker names - **COMPLETE**
2. ⏳ Member counts per broker (Excel Column X)
3. ⏳ Commission rates per broker (Excel Columns Q, R, S)
4. ⏳ Policy prefixes per broker
5. ⏳ Active vs inactive brokers
6. ⏳ Read Word document: `DAY1 DEBIT ORDER PROCESS.docx`

### Database Setup:
1. Create `brokers` table with all 19 brokers
2. Populate broker commission rates from Excel
3. Link existing members to brokers via policy numbers
4. Update debit order tables to track broker per transaction

### Frontend Development:
1. Operations dashboard with broker selection
2. Broker performance dashboards (19 separate views)
3. Commission calculation and reporting
4. Broker-filtered transaction history

---

**Status:** ✅ All 19 broker names confirmed  
**Next:** Get member counts and commission rates from Excel Column X, Q, R, S

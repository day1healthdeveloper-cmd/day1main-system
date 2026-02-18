# Implementation Plan: DAY 1 Group Setup

## Overview

We have the Qsure DAY1 statement PDF with 996 members containing:
- Member initials and surnames
- Debit order date (collection date)
- Policy reference number (within DAY 1 group)
- Premium amount

This is perfect for building the first broker group implementation!

---

## My Opinion & Recommendations

### ✅ EXCELLENT STARTING POINT
1. **Real data** - We have actual member data, not test data
2. **Complete group** - 996 members is substantial enough to test at scale
3. **Direct sales** - No broker commissions simplifies initial implementation
4. **Proven format** - This is the actual Qsure format we'll be replacing

### ✅ DATABASE STRUCTURE - AGREED
Your suggestion to add a `group` column is **CORRECT**. Here's why:

**Option 1: Add `broker_group` column to members** ✅ RECOMMENDED
```sql
ALTER TABLE members ADD COLUMN broker_group VARCHAR(10);
ALTER TABLE members ADD COLUMN broker_id UUID REFERENCES brokers(id);
CREATE INDEX idx_members_broker_group ON members(broker_group);
```

**Why this is better:**
- Simple and fast queries: `WHERE broker_group = 'DAY1'`
- Reporting is straightforward
- Staff familiar with codes (DAY1, D1PAR, D1MAM)
- No complex joins needed for dashboards
- Easy to filter and aggregate

**Option 2: Only use broker_id (foreign key)** ❌ NOT RECOMMENDED
- Requires JOIN on every query
- Slower for reporting
- More complex queries
- Less intuitive for staff

### ✅ POLICY REFERENCE vs MEMBER NUMBER
You're right - the PDF likely has **policy reference** not member number. This is important:

**Policy Reference:** Unique per policy (e.g., DAY10001, DAY10002)
**Member Number:** Unique per person (could have multiple policies)

For now, we should:
1. Use policy reference as primary identifier
2. Link to member record via matching (name + ID number)
3. Store policy reference in members table

---

## Data We Have from PDF

From the Qsure DAY1 statement, we can extract:

| Field | Example | Database Column |
|-------|---------|-----------------|
| **Initials** | J.P. | `first_name` (partial) |
| **Surname** | Smith | `last_name` |
| **Policy Reference** | DAY10001 | `policy_number` |
| **Debit Order Date** | 15th | `debit_order_day` |
| **Premium Amount** | R 1,075.00 | `monthly_premium` |
| **Status** | Success/Rejected | `payment_status` |
| **Broker Group** | DAY1 | `broker_group` (NEW) |

---

## Implementation Steps

### PHASE 1: Database Schema Updates ⏱️ 30 mins

#### Step 1.1: Create Brokers Table
```sql
CREATE TABLE IF NOT EXISTS brokers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  broker_commission_rate DECIMAL(5,2) DEFAULT 0.00,
  branch_commission_rate DECIMAL(5,2) DEFAULT 0.00,
  agent_commission_rate DECIMAL(5,2) DEFAULT 0.00,
  policy_prefix VARCHAR(10),
  status VARCHAR(20) DEFAULT 'active',
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert DAY 1 broker
INSERT INTO brokers (code, name, broker_commission_rate, branch_commission_rate, agent_commission_rate, policy_prefix, member_count)
VALUES ('DAY1', 'Day1Health Direct', 0.00, 0.00, 0.00, 'DAY1', 996);
```

#### Step 1.2: Add Broker Columns to Members Table
```sql
-- Add broker tracking columns
ALTER TABLE members ADD COLUMN IF NOT EXISTS broker_group VARCHAR(10);
ALTER TABLE members ADD COLUMN IF NOT EXISTS broker_id UUID REFERENCES brokers(id);
ALTER TABLE members ADD COLUMN IF NOT EXISTS debit_order_day INTEGER;
ALTER TABLE members ADD COLUMN IF NOT EXISTS monthly_premium DECIMAL(10,2);
ALTER TABLE members ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20);
ALTER TABLE members ADD COLUMN IF NOT EXISTS last_payment_date DATE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS last_payment_amount DECIMAL(10,2);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_members_broker_group ON members(broker_group);
CREATE INDEX IF NOT EXISTS idx_members_broker_id ON members(broker_id);
CREATE INDEX IF NOT EXISTS idx_members_debit_order_day ON members(debit_order_day);
CREATE INDEX IF NOT EXISTS idx_members_payment_status ON members(payment_status);

-- Add comment
COMMENT ON COLUMN members.broker_group IS 'Broker/distribution channel code (DAY1, D1PAR, D1MAM, etc.)';
COMMENT ON COLUMN members.debit_order_day IS 'Day of month for debit order (1-31)';
COMMENT ON COLUMN members.monthly_premium IS 'Monthly premium amount in Rands';
COMMENT ON COLUMN members.payment_status IS 'Current payment status (active, rejected, suspended)';
```

#### Step 1.3: Create Payment History Table
```sql
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  policy_number VARCHAR(50),
  broker_group VARCHAR(10),
  transaction_date DATE NOT NULL,
  debit_order_date DATE,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'success', 'rejected', 'pending'
  rejection_reason TEXT,
  qsure_transaction_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payment_history_member_id ON payment_history(member_id);
CREATE INDEX idx_payment_history_policy_number ON payment_history(policy_number);
CREATE INDEX idx_payment_history_broker_group ON payment_history(broker_group);
CREATE INDEX idx_payment_history_transaction_date ON payment_history(transaction_date);
CREATE INDEX idx_payment_history_status ON payment_history(status);

COMMENT ON TABLE payment_history IS 'Historical payment transactions from Qsure and future Netcash';
```

---

### PHASE 2: Data Import Script ⏱️ 1 hour

#### Step 2.1: Extract PDF Data
We need to parse the PDF and extract the 996 member records. Options:

**Option A: Manual CSV Export** (RECOMMENDED for first time)
- Open PDF in Excel/Google Sheets
- Export as CSV
- Clean data
- Import via script

**Option B: PDF Parser** (More complex)
- Use pdf-parse or similar library
- Extract table data programmatically
- More automated but needs testing

#### Step 2.2: Create Import Script
```javascript
// netcash-integration/scripts/import-day1-members.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parser');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importDAY1Members() {
  console.log('📥 Importing DAY 1 Group Members...');
  
  // Get DAY1 broker ID
  const { data: broker } = await supabase
    .from('brokers')
    .select('id')
    .eq('code', 'DAY1')
    .single();
  
  if (!broker) {
    console.error('❌ DAY1 broker not found!');
    return;
  }
  
  const members = [];
  
  // Read CSV file
  fs.createReadStream('netcash-integration/data/day1-members.csv')
    .pipe(csv())
    .on('data', (row) => {
      members.push({
        // Extract from CSV columns
        first_name: row.initials, // Will need cleaning
        last_name: row.surname,
        policy_number: row.policy_reference,
        broker_group: 'DAY1',
        broker_id: broker.id,
        debit_order_day: parseInt(row.debit_order_date),
        monthly_premium: parseFloat(row.amount),
        payment_status: row.status === 'Success' ? 'active' : 'rejected',
        status: 'active',
        created_at: new Date().toISOString()
      });
    })
    .on('end', async () => {
      console.log(`📊 Found ${members.length} members`);
      
      // Insert in batches of 100
      for (let i = 0; i < members.length; i += 100) {
        const batch = members.slice(i, i + 100);
        const { error } = await supabase
          .from('members')
          .upsert(batch, { onConflict: 'policy_number' });
        
        if (error) {
          console.error(`❌ Batch ${i/100 + 1} failed:`, error);
        } else {
          console.log(`✅ Batch ${i/100 + 1} imported (${batch.length} members)`);
        }
      }
      
      console.log('✅ Import complete!');
    });
}

importDAY1Members();
```

---

### PHASE 3: Backend API Updates ⏱️ 1 hour

#### Step 3.1: Add Broker Endpoints
```typescript
// apps/backend/src/broker/broker.controller.ts

@Get()
async getAllBrokers() {
  return this.brokerService.findAll();
}

@Get(':code')
async getBrokerByCode(@Param('code') code: string) {
  return this.brokerService.findByCode(code);
}

@Get(':code/members')
async getBrokerMembers(@Param('code') code: string) {
  return this.brokerService.getMembersByBroker(code);
}

@Get(':code/stats')
async getBrokerStats(@Param('code') code: string) {
  return this.brokerService.getBrokerStats(code);
}
```

#### Step 3.2: Add Payment History Endpoints
```typescript
// apps/backend/src/payments/payments.controller.ts

@Get('history/:memberId')
async getPaymentHistory(@Param('memberId') memberId: string) {
  return this.paymentsService.getPaymentHistory(memberId);
}

@Get('broker/:brokerCode/history')
async getBrokerPaymentHistory(@Param('brokerCode') brokerCode: string) {
  return this.paymentsService.getBrokerPaymentHistory(brokerCode);
}
```

---

### PHASE 4: Frontend Dashboard ⏱️ 2 hours

#### Step 4.1: Broker Selection Dashboard
```typescript
// apps/frontend/src/app/operations/debit-orders/page.tsx

// Show all 19 brokers with checkboxes
// DAY1 group shows 996 members, R 827,358.50
// Can select which brokers to process
```

#### Step 4.2: DAY1 Broker Dashboard
```typescript
// apps/frontend/src/app/operations/brokers/[code]/page.tsx

// Show DAY1 specific stats:
// - 996 members
// - R 827,358.50 net collections
// - 89.5% success rate
// - 10.5% rejection rate
// - Member list with payment status
```

---

### PHASE 5: Reporting ⏱️ 1 hour

#### Step 5.1: Broker Performance Report
- Success rate per broker
- Rejection rate per broker
- Revenue per broker
- Commission per broker (0% for DAY1)

#### Step 5.2: Payment Status Report
- Active payments
- Rejected payments
- Retry queue
- Debit order calendar (by day of month)

---

## Total Timeline

| Phase | Task | Time | Status |
|-------|------|------|--------|
| 1 | Database schema updates | 30 mins | ⏳ Pending |
| 2 | Data import script | 1 hour | ⏳ Pending |
| 3 | Backend API updates | 1 hour | ⏳ Pending |
| 4 | Frontend dashboard | 2 hours | ⏳ Pending |
| 5 | Reporting | 1 hour | ⏳ Pending |
| **TOTAL** | | **5.5 hours** | |

---

## Risks & Mitigations

### Risk 1: Data Quality
**Risk:** PDF data might have formatting issues, missing fields, duplicates  
**Mitigation:** 
- Manual CSV export first time
- Data validation script
- Dry-run import with rollback

### Risk 2: Member Matching
**Risk:** Existing members in database might not match PDF records  
**Mitigation:**
- Use policy_number as unique key
- Match by name + ID number as fallback
- Flag unmatched records for manual review

### Risk 3: Payment History
**Risk:** We only have January 2026 data, missing historical payments  
**Mitigation:**
- Import January 2026 as baseline
- Request historical statements from Qsure
- Mark as "imported from Qsure" for audit trail

---

## Next Steps - YOUR APPROVAL NEEDED

### Option A: Full Implementation (RECOMMENDED)
1. ✅ Create database migration file
2. ✅ Run migration on Supabase
3. ✅ Export PDF to CSV manually
4. ✅ Create import script
5. ✅ Import DAY1 members
6. ✅ Build backend APIs
7. ✅ Build frontend dashboards

**Timeline:** 5.5 hours  
**Result:** Complete DAY1 group implementation with 996 real members

### Option B: Database Only (Quick Start)
1. ✅ Create database migration file
2. ✅ Run migration on Supabase
3. ⏸️ Skip import (use test data)
4. ⏸️ Skip APIs
5. ⏸️ Skip dashboards

**Timeline:** 30 mins  
**Result:** Database ready, but no data or UI

### Option C: Phased Approach (SAFEST)
1. ✅ Phase 1: Database schema (30 mins)
2. ⏸️ Test and verify
3. ✅ Phase 2: Import script (1 hour)
4. ⏸️ Test and verify
5. ✅ Phase 3-5: APIs and UI (4 hours)

**Timeline:** 5.5 hours (spread over multiple sessions)  
**Result:** Same as Option A, but with checkpoints

---

## My Recommendation

### ✅ GO WITH OPTION C: PHASED APPROACH

**Why:**
1. **Safe** - We can verify each step before proceeding
2. **Real data** - We're working with 996 actual members
3. **Reversible** - Can rollback if issues arise
4. **Learning** - We'll understand the data better as we go
5. **Scalable** - Once DAY1 works, we can replicate for other 18 brokers

**First Step:**
Let me create the database migration file with:
- Brokers table
- Broker columns in members table
- Payment history table
- DAY1 broker record

Then you can review and approve before we run it.

---

## Questions for You

1. **Do you want me to create the migration file now?** (Phase 1)
2. **Can you export the PDF to CSV?** (Or should I try PDF parsing?)
3. **Do you have historical Qsure statements?** (For payment history)
4. **Should we import all 996 members or start with a smaller test batch?** (e.g., 50 members)

---

**Status:** 🟡 Awaiting your approval to proceed  
**Recommended:** Start with Phase 1 (Database schema) - 30 minutes

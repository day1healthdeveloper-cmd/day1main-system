# Netcash Integration Plan - Day1Health Medical Insurer

## What is Netcash?

**Netcash** is South Africa's leading payment gateway and debit order collection system, based in Cape Town. They are:

- ✅ **PCI DSS Compliant** - Secure payment processing
- ✅ **Bank-integrated** - Direct connection to all SA banks
- ✅ **API-driven** - Full developer documentation
- ✅ **Medical scheme ready** - Used by insurance/medical companies
- ✅ **Proven track record** - Integrated with ISPs, schools, billing systems

## Why Netcash is PERFECT for Day1Health

### 1. **Medical Insurance Focus**
- Already used by medical schemes and insurance companies
- Handles recurring monthly premiums
- Supports large member bases
- Compliant with SA financial regulations

### 2. **Debit Order Types**
Netcash offers 3 debit order systems:

**a) Standard Debit Orders** (Traditional)
- Same-day processing (Mon-Sat)
- Two-day processing (Mon-Fri)
- Best for: Regular monthly premiums
- Processing: After 16:00 on action date

**b) DebiCheck** (Modern - Recommended)
- Electronic mandate authorization via bank
- Preferential processing by banks
- Reduced disputes and reversals
- Best for: New members, compliance
- Required: Member authorizes via their bank app

**c) eMandate** (Digital Authorization)
- Web service for electronic mandate requests
- Batch authorization requests
- Best for: Online sign-ups

### 3. **Integration Benefits**
- ✅ API-driven (no manual uploads needed)
- ✅ Real-time status updates
- ✅ Automatic reconciliation
- ✅ Error handling and retry logic
- ✅ Batch processing (1000s of members)
- ✅ Same-day collections available

## Is This a Good Starting Point?

**YES! Absolutely the right place to start because:**

1. **Critical Business Function**
   - Premium collection = cash flow = business survival
   - Must work from Day 1
   - Netcash is proven and reliable

2. **Real Data Integration**
   - You're loading real member file
   - Members have existing bank details
   - Can immediately start processing

3. **Foundation for Everything Else**
   - Once debit orders work → members are paid up
   - Paid members → can submit claims
   - Claims processing → needs payment verification
   - Everything depends on this working

4. **Immediate Value**
   - Operations Manager can run debit orders
   - Finance Manager can reconcile payments
   - Members can see payment status
   - Real business operations start

## Integration Architecture

### Phase 1: Member Import + Debit Order Setup (START HERE)

```
Member Excel File
    ↓
Data Import System (✅ Already built)
    ↓
Supabase Members Table (✅ Already exists)
    ↓
Netcash Debit Order Masterfile
    ↓
Monthly Debit Order Runs
    ↓
Payment Reconciliation
```

### Phase 2: DebiCheck for New Members

```
New Member Application
    ↓
Bank Details Captured
    ↓
DebiCheck Mandate Request (via Netcash API)
    ↓
Member Authorizes via Bank App
    ↓
Mandate Registered
    ↓
Debit Orders Can Process
```

## Technical Implementation

### 1. Netcash File Format (Standard Debit Orders)

**Header Record (H)**
```
H|{ServiceKey}|1|{Instruction}|{BatchName}|{ActionDate}|{VendorKey}
```

**Transaction Record (T)** - Per Member
```
T|{MemberNumber}|{MemberName}|1|{AccountHolderName}|{AccountType}|{BranchCode}|0|{AccountNumber}|{PremiumAmount}
```

**Footer Record (F)**
```
F|{RecordCount}|{TotalAmount}|9999
```

### 2. Database Schema Updates Needed

**Add to `members` table** (already has most fields):
```sql
-- Debit order specific fields
netcash_account_reference VARCHAR(25),  -- Unique ref for Netcash
debit_order_status VARCHAR(20),         -- active, suspended, failed
last_debit_date DATE,                   -- Last successful debit
next_debit_date DATE,                   -- Next scheduled debit
failed_debit_count INT DEFAULT 0,       -- Track failures
debit_order_mandate_date DATE,          -- When mandate was signed
debicheck_mandate_id VARCHAR(50),       -- DebiCheck mandate reference
```

**Create `debit_order_runs` table**:
```sql
CREATE TABLE debit_order_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_date DATE NOT NULL,
  batch_name VARCHAR(100),
  total_members INT,
  total_amount DECIMAL(15,2),
  successful_count INT,
  failed_count INT,
  status VARCHAR(20), -- pending, processing, completed, failed
  netcash_batch_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  created_by UUID REFERENCES users(id)
);
```

**Create `debit_order_transactions` table**:
```sql
CREATE TABLE debit_order_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID REFERENCES debit_order_runs(id),
  member_id UUID REFERENCES members(id),
  member_number VARCHAR(50),
  amount DECIMAL(10,2),
  status VARCHAR(20), -- pending, successful, failed, reversed
  netcash_reference VARCHAR(50),
  bank_reference VARCHAR(50),
  error_message TEXT,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Backend Module Structure

```
apps/backend/src/netcash/
├── netcash.module.ts
├── netcash.controller.ts
├── netcash.service.ts
├── dto/
│   ├── create-debit-run.dto.ts
│   ├── process-debit-run.dto.ts
│   └── reconcile-payments.dto.ts
└── interfaces/
    ├── netcash-config.interface.ts
    └── debit-order.interface.ts
```

### 4. Key API Endpoints to Build

```typescript
// Operations Manager endpoints
POST   /netcash/debit-runs/create          // Create monthly run
POST   /netcash/debit-runs/:id/process     // Submit to Netcash
GET    /netcash/debit-runs/:id/status      // Check status
POST   /netcash/debit-runs/:id/reconcile   // Reconcile results

// Member management
POST   /netcash/members/:id/activate       // Add to masterfile
POST   /netcash/members/:id/suspend        // Suspend debit order
POST   /netcash/members/:id/update         // Update bank details

// DebiCheck (for new members)
POST   /netcash/debicheck/request-mandate  // Request authorization
GET    /netcash/debicheck/mandate-status   // Check authorization
```

### 5. Frontend Components Needed

**Operations Manager Dashboard**:
- Monthly debit order run scheduler
- Member list with payment status
- Run debit order batch button
- View results and reconciliation
- Handle failed payments

**Finance Manager Dashboard**:
- Payment reconciliation view
- Bank statement import
- Match payments to members
- Arrears report

**Member Portal**:
- View payment history
- Update bank details
- Download payment receipts

## Implementation Steps

### Step 1: Setup Netcash Account ✅
- [ ] Get Netcash service key
- [ ] Get debit order service activated
- [ ] Get API credentials
- [ ] Setup test environment

### Step 2: Database Schema ✅
- [ ] Add debit order fields to members table
- [ ] Create debit_order_runs table
- [ ] Create debit_order_transactions table
- [ ] Create indexes for performance

### Step 3: Import Members ✅
- [ ] Load member Excel file via Data Import
- [ ] Verify bank details are complete
- [ ] Generate Netcash account references
- [ ] Create initial masterfile

### Step 4: Build Netcash Module
- [ ] Create backend module
- [ ] Implement file generation (H, T, F records)
- [ ] Build API endpoints
- [ ] Add error handling

### Step 5: Operations Dashboard
- [ ] Create debit order run interface
- [ ] Add member payment status view
- [ ] Build reconciliation screen
- [ ] Add failed payment handling

### Step 6: Testing
- [ ] Test with small batch (10 members)
- [ ] Verify file format
- [ ] Submit to Netcash test environment
- [ ] Process results
- [ ] Reconcile payments

### Step 7: Go Live
- [ ] Submit first production batch
- [ ] Monitor results
- [ ] Handle any failures
- [ ] Setup automated monthly runs

## Netcash Configuration

**Service Types**:
- Standard Debit Orders (immediate)
- DebiCheck (for new members)
- eMandate (for online sign-ups)

**Processing Schedule**:
- Same-day: Authorize before 10:59 AM
- Two-day: Submit 2 business days before
- Saturday service available
- Funds available: 1 business day after

**File Upload Methods**:
1. Manual upload via Netcash portal
2. API submission (recommended)
3. SFTP upload
4. Email submission

## Cost Considerations

Typical Netcash pricing (verify with them):
- Setup fee: R0 - R5,000
- Monthly fee: R200 - R500
- Per transaction: R1.50 - R3.00
- DebiCheck: R2.50 - R4.00 per transaction
- Failed transaction: R0.50 - R1.00

For 1,000 members:
- Monthly cost: ~R2,500 - R3,500
- Very affordable for the value

## Recommended Approach

### Start with Standard Debit Orders
1. Import existing members (they already have mandates)
2. Build file generation
3. Submit first batch
4. Reconcile results
5. Handle failures

### Add DebiCheck for New Members
1. Integrate DebiCheck API
2. Request mandates during sign-up
3. Wait for authorization
4. Add to debit order runs

### Automate Everything
1. Scheduled monthly runs (1st of month)
2. Automatic reconciliation
3. Failed payment retry logic
4. Member notifications

## Next Actions

1. **Get Netcash credentials** from client
2. **Load member file** via Data Import system
3. **Build Netcash module** (backend)
4. **Create Operations dashboard** (frontend)
5. **Test with small batch**
6. **Go live with full member base**

## Why This is the Perfect Starting Point

✅ **Critical business function** - Premium collection is #1 priority
✅ **Real data available** - Member file with bank details exists
✅ **Proven system** - Netcash is reliable and widely used
✅ **Foundation for everything** - Payment status drives all other processes
✅ **Immediate value** - Operations can start running debit orders
✅ **Scalable** - Handles 1,000s of members easily
✅ **Compliant** - PCI DSS, SA banking regulations
✅ **API-driven** - Full automation possible

## Summary

**Netcash is the PERFECT place to start** because:
1. It's the lifeblood of the business (cash flow)
2. You have real member data ready to import
3. It's a proven, reliable system
4. Everything else depends on knowing payment status
5. Operations Manager can immediately start working
6. It provides immediate business value

Let's build the Netcash integration next! 🚀

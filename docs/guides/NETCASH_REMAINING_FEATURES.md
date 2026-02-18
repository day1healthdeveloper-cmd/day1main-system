# Netcash Integration - Remaining Features

## ✅ COMPLETED
1. Batch file generation (TAB-delimited)
2. Batch upload via SOAP API (`BatchFileUpload`)
3. Batch status checking (`RetrieveBatchStatus`)
4. Member management
5. Broker group statistics
6. Submission scheduling
7. Test connection

---

## ❌ TO IMPLEMENT

### 1. REFUNDS & REVERSALS (HIGH PRIORITY)
**Purpose**: Refund payments to members when needed

**Netcash SOAP Methods**:
- `ProcessRefund` - Process a refund for a specific transaction
- `ReverseTransaction` - Reverse a debit order

**Use Cases**:
- Member cancellation - refund unused premium
- Duplicate payment - refund extra amount
- Incorrect amount - refund and reprocess
- Policy cancellation - pro-rata refund

**Database Tables Needed**:
```sql
CREATE TABLE refund_requests (
  id UUID PRIMARY KEY,
  member_id UUID REFERENCES members(id),
  original_transaction_id VARCHAR,
  refund_amount DECIMAL(10,2),
  refund_reason TEXT,
  status VARCHAR, -- pending, processing, completed, failed
  netcash_refund_reference VARCHAR,
  requested_by UUID,
  requested_at TIMESTAMP,
  processed_at TIMESTAMP,
  error_message TEXT
);
```

**API Endpoints**:
- `POST /api/netcash/refunds` - Create refund request
- `GET /api/netcash/refunds` - List refunds
- `GET /api/netcash/refunds/:id` - Get refund status
- `POST /api/netcash/refunds/:id/process` - Process refund

---

### 2. TRANSACTION TRACKING
**Purpose**: Track individual debit order transactions

**Netcash SOAP Methods**:
- `GetTransactionStatus` - Get status of specific transaction
- `GetTransactionHistory` - Get transaction history

**Database Tables Needed**:
```sql
CREATE TABLE debit_order_transactions (
  id UUID PRIMARY KEY,
  run_id UUID REFERENCES debit_order_runs(id),
  member_id UUID REFERENCES members(id),
  transaction_reference VARCHAR,
  amount DECIMAL(10,2),
  status VARCHAR, -- pending, successful, failed, reversed
  netcash_status VARCHAR,
  netcash_response TEXT,
  failure_reason TEXT,
  processed_at TIMESTAMP,
  settled_at TIMESTAMP
);
```

**API Endpoints**:
- `GET /api/netcash/transactions` - List transactions
- `GET /api/netcash/transactions/:id` - Get transaction details
- `POST /api/netcash/transactions/:id/retry` - Retry failed transaction

---

### 3. FAILED PAYMENT HANDLING
**Purpose**: Automatically retry failed payments

**Features**:
- Automatic retry logic (3 attempts)
- Escalation to manual review
- Member notification
- Arrears tracking

**API Endpoints**:
- `GET /api/netcash/failed-payments` - List failed payments
- `POST /api/netcash/failed-payments/:id/retry` - Manual retry
- `POST /api/netcash/failed-payments/:id/suspend` - Suspend member

---

### 4. PAYMENT RECONCILIATION
**Purpose**: Match Netcash payments to member accounts

**Netcash SOAP Methods**:
- `GetSettlementReport` - Download settlement report
- `GetPaymentConfirmation` - Get payment confirmation

**Features**:
- Daily reconciliation job
- Match payments to members
- Identify discrepancies
- Generate reconciliation report

**Database Tables Needed**:
```sql
CREATE TABLE payment_reconciliations (
  id UUID PRIMARY KEY,
  reconciliation_date DATE,
  total_expected DECIMAL(10,2),
  total_received DECIMAL(10,2),
  matched_count INTEGER,
  unmatched_count INTEGER,
  discrepancy_amount DECIMAL(10,2),
  status VARCHAR, -- pending, completed, reviewed
  reconciled_by UUID,
  reconciled_at TIMESTAMP
);

CREATE TABLE payment_discrepancies (
  id UUID PRIMARY KEY,
  reconciliation_id UUID REFERENCES payment_reconciliations(id),
  member_id UUID,
  expected_amount DECIMAL(10,2),
  received_amount DECIMAL(10,2),
  difference DECIMAL(10,2),
  reason TEXT,
  resolved BOOLEAN,
  resolved_at TIMESTAMP
);
```

**API Endpoints**:
- `POST /api/netcash/reconcile` - Run reconciliation
- `GET /api/netcash/reconciliations` - List reconciliations
- `GET /api/netcash/reconciliations/:id` - Get reconciliation details
- `GET /api/netcash/discrepancies` - List discrepancies

---

### 5. DEBICHECK MANDATE MANAGEMENT
**Purpose**: Manage DebiCheck mandates for members

**Netcash SOAP Methods**:
- `CreateMandate` - Create new mandate
- `GetMandateStatus` - Check mandate status
- `CancelMandate` - Cancel mandate

**Database Tables Needed**:
```sql
CREATE TABLE debicheck_mandates (
  id UUID PRIMARY KEY,
  member_id UUID REFERENCES members(id),
  mandate_reference VARCHAR UNIQUE,
  status VARCHAR, -- pending, active, cancelled, expired
  maximum_amount DECIMAL(10,2),
  frequency VARCHAR, -- monthly, quarterly, annual
  start_date DATE,
  end_date DATE,
  netcash_mandate_id VARCHAR,
  created_at TIMESTAMP,
  activated_at TIMESTAMP,
  cancelled_at TIMESTAMP
);
```

**API Endpoints**:
- `POST /api/netcash/mandates` - Create mandate
- `GET /api/netcash/mandates` - List mandates
- `GET /api/netcash/mandates/:id` - Get mandate details
- `POST /api/netcash/mandates/:id/cancel` - Cancel mandate

---

### 6. REPORTING
**Purpose**: Generate reports from Netcash data

**Netcash SOAP Methods**:
- `GetStatementReport` - Download statement
- `GetCollectionReport` - Download collection report

**Reports Needed**:
- Daily collection report
- Monthly settlement report
- Failed payment report
- Refund report
- Reconciliation report

**API Endpoints**:
- `GET /api/netcash/reports/collections` - Collection report
- `GET /api/netcash/reports/settlements` - Settlement report
- `GET /api/netcash/reports/failures` - Failed payments report
- `GET /api/netcash/reports/refunds` - Refunds report

---

### 7. WEBHOOK/CALLBACK HANDLING
**Purpose**: Receive real-time payment notifications from Netcash

**Features**:
- Webhook endpoint for Netcash callbacks
- Signature verification
- Automatic status updates
- Member notifications

**API Endpoints**:
- `POST /api/netcash/webhook` - Receive Netcash callbacks (public)
- `GET /api/netcash/webhook/logs` - View webhook logs

---

## IMPLEMENTATION PRIORITY

### Phase 1: Critical (Week 1)
1. ✅ Refunds & Reversals
2. ✅ Transaction Tracking
3. ✅ Failed Payment Handling

### Phase 2: Important (Week 2)
4. ✅ Payment Reconciliation
5. ✅ Webhook/Callback Handling

### Phase 3: Nice to Have (Week 3)
6. ✅ DebiCheck Mandate Management
7. ✅ Reporting

---

## DATABASE MIGRATIONS NEEDED

1. `009_refund_requests.sql`
2. `010_debit_order_transactions.sql`
3. `011_payment_reconciliations.sql`
4. `012_debicheck_mandates.sql`

---

## NEXT STEPS

1. Create database migrations
2. Implement refund functionality
3. Add transaction tracking
4. Build reconciliation system
5. Set up webhook handling
6. Create reporting endpoints
7. Build frontend UI for each feature


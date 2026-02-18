# Netcash Integration - Complete Testing Checklist

## ✅ COMPLETED
1. **Debit Order Batch Submission** - Successfully sent batch to Netcash

---

## 🔄 PENDING TESTS

### 1. TRANSACTION TRACKING & MONITORING

#### 1.1 View Transactions
- [ ] **GET** `/api/v1/netcash/transactions` - List all transactions
  - Test with no filters
  - Test with status filter (pending, successful, failed)
  - Test with date range filter
  - Test with member ID filter
  - Test pagination (limit/offset)

- [ ] **GET** `/api/v1/netcash/transactions/:id` - Get single transaction details
  - Test with valid transaction ID
  - Test with invalid transaction ID

- [ ] **GET** `/api/v1/netcash/transactions/stats/summary` - Get transaction statistics
  - Test overall stats
  - Test with date range
  - Test with run ID filter

#### 1.2 Transaction Status Updates
- [ ] **PUT** `/api/v1/netcash/transactions/:id/status` - Update transaction status
  - Test status change: pending → successful
  - Test status change: pending → failed
  - Test with Netcash response data

#### 1.3 Transaction Retry
- [ ] **POST** `/api/v1/netcash/transactions/:id/retry` - Retry failed transaction
  - Test retry with valid failed transaction
  - Test retry count increment
  - Test max retry limit (3 attempts)

---

### 2. FAILED PAYMENT MANAGEMENT

#### 2.1 View Failed Payments
- [ ] **GET** `/api/v1/netcash/failed-payments` - List failed payments
  - Test with no filters
  - Test with broker group filter
  - Test with minimum retries filter
  - Test pagination

- [ ] **GET** `/api/v1/netcash/failed-payments/stats/summary` - Get failed payment statistics
  - Test total failed count
  - Test total amount
  - Test retry breakdown (0, 1, 2, 3+ retries)
  - Test failure reason breakdown

- [ ] **GET** `/api/v1/netcash/failed-payments/repeated-failures` - Get members with repeated failures
  - Test with default threshold (3 failures)
  - Test with custom threshold

#### 2.2 Retry Failed Payments
- [ ] **POST** `/api/v1/netcash/failed-payments/auto-retry` - Auto-retry all eligible failed payments
  - Test batch retry for payments with < 3 attempts
  - Verify retry count increments
  - Verify success/failure tracking

- [ ] **POST** `/api/v1/netcash/failed-payments/:id/retry` - Manually retry specific payment
  - Test with valid failed payment
  - Test with notes/comments
  - Verify retry count increment

#### 2.3 Escalation & Member Management
- [ ] **POST** `/api/v1/netcash/failed-payments/:id/escalate` - Escalate payment for manual review
  - Test escalation with reason
  - Test assignment to user
  - Verify escalation record created

- [ ] **POST** `/api/v1/netcash/failed-payments/suspend-member` - Suspend member
  - Test suspension with reason
  - Test suspension with notes
  - Verify member status updated to 'suspended'
  - Verify suspension audit trail

- [ ] **POST** `/api/v1/netcash/failed-payments/notify-member` - Send notification to member
  - Test email notification
  - Test SMS notification
  - Test both email & SMS
  - Verify notification logged

---

### 3. REFUND MANAGEMENT

#### 3.1 Create & View Refunds
- [ ] **POST** `/api/v1/netcash/refunds` - Create refund request
  - Test with valid member ID
  - Test with refund amount
  - Test with different refund reasons:
    - Overpayment
    - Duplicate payment
    - Policy cancellation
    - Incorrect amount
    - Customer request
    - System error
  - Test with notes

- [ ] **GET** `/api/v1/netcash/refunds` - List refund requests
  - Test with no filters
  - Test with status filter (pending, processing, completed, failed, cancelled)
  - Test with member ID filter
  - Test pagination

- [ ] **GET** `/api/v1/netcash/refunds/:id` - Get refund details
  - Test with valid refund ID
  - Test with invalid refund ID

- [ ] **GET** `/api/v1/netcash/refunds/stats/summary` - Get refund statistics
  - Test total refunds by status
  - Test total refund amounts
  - Test with date range filter

#### 3.2 Process Refunds
- [ ] **POST** `/api/v1/netcash/refunds/:id/process` - Process refund
  - Test processing pending refund
  - Verify Netcash API call
  - Verify status update to 'processing' then 'completed'
  - Verify member arrears adjustment

- [ ] **PUT** `/api/v1/netcash/refunds/:id/status` - Update refund status
  - Test manual status updates
  - Test with error messages

- [ ] **POST** `/api/v1/netcash/refunds/:id/cancel` - Cancel refund
  - Test cancellation with reason
  - Verify status updated to 'cancelled'

---

### 4. PAYMENT RECONCILIATION

#### 4.1 Run Reconciliation
- [ ] **POST** `/api/v1/netcash/reconciliation/run` - Run reconciliation for specific date
  - Test with valid date
  - Test with date that has transactions
  - Test with date that has no transactions
  - Verify expected vs received amounts calculated
  - Verify discrepancies identified

- [ ] **POST** `/api/v1/netcash/reconciliation/auto` - Auto-reconcile yesterday's transactions
  - Test automatic reconciliation
  - Verify yesterday's date used
  - Verify reconciliation record created

#### 4.2 View Reconciliation Data
- [ ] **GET** `/api/v1/netcash/reconciliation` - List reconciliations
  - Test with no filters
  - Test with status filter
  - Test with date range
  - Test pagination

- [ ] **GET** `/api/v1/netcash/reconciliation/:id` - Get reconciliation details
  - Test with valid reconciliation ID
  - Verify matched/unmatched counts
  - Verify discrepancy details

- [ ] **GET** `/api/v1/netcash/reconciliation/stats/summary` - Get reconciliation statistics
  - Test total reconciliations
  - Test average match rate
  - Test total discrepancies
  - Test with date range

#### 4.3 Manage Discrepancies
- [ ] **GET** `/api/v1/netcash/reconciliation/discrepancies/list` - List discrepancies
  - Test unresolved discrepancies
  - Test with reconciliation ID filter
  - Test pagination

- [ ] **PUT** `/api/v1/netcash/reconciliation/discrepancies/:id/resolve` - Resolve discrepancy
  - Test with resolution types:
    - Payment received
    - Partial payment
    - Refund issued
    - Write off
    - System error
  - Test with notes
  - Verify discrepancy marked as resolved

---

### 5. WEBHOOK HANDLING

#### 5.1 Receive Webhooks (Netcash → System)
- [ ] **POST** `/api/v1/netcash/webhook` - Receive webhook from Netcash (PUBLIC)
  - Test transaction status update webhook
  - Test batch completion webhook
  - Test payment success webhook
  - Test payment failure webhook
  - Verify signature validation
  - Verify webhook logged
  - Verify automatic status updates

#### 5.2 View Webhook Logs
- [ ] **GET** `/api/v1/netcash/webhook/logs` - List webhook logs
  - Test with no filters
  - Test with processed filter (true/false)
  - Test pagination
  - Verify payload stored
  - Verify processing status

- [ ] **GET** `/api/v1/netcash/webhook/stats/summary` - Get webhook statistics
  - Test total webhooks received
  - Test processed vs failed count
  - Test success rate
  - Test with date range

#### 5.3 Retry Failed Webhooks
- [ ] **POST** `/api/v1/netcash/webhook/:id/retry` - Retry failed webhook
  - Test with failed webhook
  - Verify reprocessing
  - Verify status update

---

### 6. DEBIT ORDER RUNS (Main Controller)

#### 6.1 View Runs & Batches
- [ ] **GET** `/api/v1/netcash/batches` - List debit order batches
  - Test with no filters
  - Test with status filter
  - Test with date range
  - Test pagination

- [ ] **GET** `/api/v1/netcash/summary` - Get debit order summary
  - Test total members
  - Test total premium
  - Test total arrears
  - Test status breakdown

- [ ] **GET** `/api/v1/netcash/groups` - Get broker groups summary
  - Test group list
  - Test member counts per group
  - Test premium totals per group

- [ ] **GET** `/api/v1/netcash/members` - List members with debit orders
  - Test with no filters
  - Test with broker group filter
  - Test with status filter
  - Test with search term
  - Test pagination

---

## 🧪 INTEGRATION TESTS

### Scenario 1: Complete Debit Order Lifecycle
1. ✅ Submit batch to Netcash
2. [ ] Receive webhook confirmation
3. [ ] View transaction status
4. [ ] Handle failed payment
5. [ ] Retry failed payment
6. [ ] Run reconciliation
7. [ ] Resolve discrepancies

### Scenario 2: Refund Process
1. [ ] Create refund request
2. [ ] Process refund via Netcash
3. [ ] Receive webhook confirmation
4. [ ] Verify member arrears adjusted
5. [ ] View refund in history

### Scenario 3: Failed Payment Escalation
1. [ ] Identify failed payment
2. [ ] Retry payment (1st attempt)
3. [ ] Retry payment (2nd attempt)
4. [ ] Retry payment (3rd attempt - max)
5. [ ] Escalate for manual review
6. [ ] Suspend member
7. [ ] Send notification to member

### Scenario 4: Daily Reconciliation
1. [ ] Run auto-reconciliation
2. [ ] View discrepancies
3. [ ] Resolve matched payments
4. [ ] Escalate unmatched payments
5. [ ] Generate reconciliation report

---

## 📊 UI TESTING (Frontend Tabs)

### Transactions Tab
- [ ] View all transactions
- [ ] Filter by status
- [ ] Filter by date range
- [ ] View transaction details
- [ ] Retry failed transaction

### Failed Payments Tab
- [ ] View failed payments list
- [ ] View statistics cards
- [ ] Filter by retry count
- [ ] Auto-retry all eligible
- [ ] Retry individual payment
- [ ] Escalate payment
- [ ] Suspend member
- [ ] Send notification

### Refunds Tab
- [ ] View refunds list
- [ ] View statistics cards
- [ ] Create new refund
- [ ] Search members
- [ ] Process refund
- [ ] Cancel refund
- [ ] View refund details

### Reconciliation Tab
- [ ] View reconciliations list
- [ ] View statistics cards
- [ ] Run manual reconciliation
- [ ] Run auto-reconciliation
- [ ] View discrepancies
- [ ] Resolve discrepancy
- [ ] View reconciliation details

### Webhooks Tab
- [ ] View webhook logs
- [ ] View statistics cards
- [ ] Filter by processed status
- [ ] View webhook payload
- [ ] Retry failed webhook

---

## 🔐 SECURITY TESTS

- [ ] Test all endpoints require authentication (except webhook receiver)
- [ ] Test permission-based access control
- [ ] Test webhook signature validation
- [ ] Test SQL injection prevention
- [ ] Test XSS prevention in UI

---

## 📈 PERFORMANCE TESTS

- [ ] Test batch processing with 1000+ members
- [ ] Test concurrent webhook processing
- [ ] Test reconciliation with large datasets
- [ ] Test pagination performance
- [ ] Test database query optimization

---

## 🐛 ERROR HANDLING TESTS

- [ ] Test Netcash API timeout
- [ ] Test Netcash API error responses
- [ ] Test invalid member ID
- [ ] Test invalid transaction ID
- [ ] Test duplicate refund requests
- [ ] Test invalid webhook signatures
- [ ] Test database connection failures

---

## 📝 NOTES

### Test Data Requirements
- At least 10 test members with active debit orders
- At least 1 failed transaction for retry testing
- At least 1 successful transaction for refund testing
- Mock webhook payloads from Netcash
- Test bank account details

### Environment Setup
- Backend: http://localhost:3000/api/v1
- Frontend: http://localhost:3001
- Database: Supabase (all tables created)
- Netcash API: Test/Sandbox environment

### Testing Tools
- Postman/Insomnia for API testing
- Browser DevTools for UI testing
- Database client for data verification
- Webhook testing tool (webhook.site or similar)

---

## 🎯 PRIORITY ORDER

### HIGH PRIORITY (Test First)
1. Transaction viewing and status updates
2. Failed payment retry (manual & auto)
3. Refund creation and processing
4. Webhook receiving and processing
5. Reconciliation run and discrepancy viewing

### MEDIUM PRIORITY
1. Failed payment escalation
2. Member suspension
3. Discrepancy resolution
4. Webhook retry
5. Statistics endpoints

### LOW PRIORITY
1. Member notifications
2. Advanced filtering
3. Performance optimization
4. Error edge cases

---

## ✅ COMPLETION CRITERIA

- [ ] All HIGH priority tests passing
- [ ] All MEDIUM priority tests passing
- [ ] At least 80% of LOW priority tests passing
- [ ] All 4 integration scenarios completed
- [ ] All UI tabs functional
- [ ] Security tests passing
- [ ] Documentation updated with test results

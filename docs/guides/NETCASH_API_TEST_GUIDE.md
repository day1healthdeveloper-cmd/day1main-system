# Netcash API Testing Guide

## Quick Start Testing Commands

### Prerequisites
```bash
# Backend running on: http://localhost:3000/api/v1
# You need a valid JWT token from login
# Replace {{TOKEN}} with your actual token
```

---

## 1. TRANSACTION TRACKING

### List All Transactions
```bash
curl -X GET "http://localhost:3000/api/v1/netcash/transactions?limit=20" \
  -H "Authorization: Bearer {{TOKEN}}"
```

### Get Transaction by ID
```bash
curl -X GET "http://localhost:3000/api/v1/netcash/transactions/{{TRANSACTION_ID}}" \
  -H "Authorization: Bearer {{TOKEN}}"
```

### Get Transaction Statistics
```bash
curl -X GET "http://localhost:3000/api/v1/netcash/transactions/stats/summary" \
  -H "Authorization: Bearer {{TOKEN}}"
```

### Retry Failed Transaction
```bash
curl -X POST "http://localhost:3000/api/v1/netcash/transactions/{{TRANSACTION_ID}}/retry" \
  -H "Authorization: Bearer {{TOKEN}}" \
  -H "Content-Type: application/json"
```

---

## 2. FAILED PAYMENTS

### List Failed Payments
```bash
curl -X GET "http://localhost:3000/api/v1/netcash/failed-payments?limit=20" \
  -H "Authorization: Bearer {{TOKEN}}"
```

### Get Failed Payment Statistics
```bash
curl -X GET "http://localhost:3000/api/v1/netcash/failed-payments/stats/summary" \
  -H "Authorization: Bearer {{TOKEN}}"
```

### Auto-Retry All Failed Payments
```bash
curl -X POST "http://localhost:3000/api/v1/netcash/failed-payments/auto-retry" \
  -H "Authorization: Bearer {{TOKEN}}" \
  -H "Content-Type: application/json"
```

### Retry Specific Failed Payment
```bash
curl -X POST "http://localhost:3000/api/v1/netcash/failed-payments/{{TRANSACTION_ID}}/retry" \
  -H "Authorization: Bearer {{TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Manual retry attempt"
  }'
```

### Escalate Failed Payment
```bash
curl -X POST "http://localhost:3000/api/v1/netcash/failed-payments/{{TRANSACTION_ID}}/escalate" \
  -H "Authorization: Bearer {{TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "escalationReason": "Maximum retry attempts reached",
    "assignedTo": "{{USER_ID}}"
  }'
```

### Suspend Member
```bash
curl -X POST "http://localhost:3000/api/v1/netcash/failed-payments/suspend-member" \
  -H "Authorization: Bearer {{TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "memberId": "{{MEMBER_ID}}",
    "reason": "repeated_failures",
    "notes": "3+ failed payment attempts"
  }'
```

### Notify Member
```bash
curl -X POST "http://localhost:3000/api/v1/netcash/failed-payments/notify-member" \
  -H "Authorization: Bearer {{TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "memberId": "{{MEMBER_ID}}",
    "notificationType": "email",
    "message": "Your payment has failed. Please update your banking details."
  }'
```

---

## 3. REFUNDS

### Create Refund Request
```bash
curl -X POST "http://localhost:3000/api/v1/netcash/refunds" \
  -H "Authorization: Bearer {{TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "memberId": "{{MEMBER_ID}}",
    "refundAmount": 150.00,
    "refundReason": "overpayment",
    "notes": "Member paid twice this month"
  }'
```

### List Refunds
```bash
curl -X GET "http://localhost:3000/api/v1/netcash/refunds?limit=20" \
  -H "Authorization: Bearer {{TOKEN}}"
```

### Get Refund by ID
```bash
curl -X GET "http://localhost:3000/api/v1/netcash/refunds/{{REFUND_ID}}" \
  -H "Authorization: Bearer {{TOKEN}}"
```

### Get Refund Statistics
```bash
curl -X GET "http://localhost:3000/api/v1/netcash/refunds/stats/summary" \
  -H "Authorization: Bearer {{TOKEN}}"
```

### Process Refund
```bash
curl -X POST "http://localhost:3000/api/v1/netcash/refunds/{{REFUND_ID}}/process" \
  -H "Authorization: Bearer {{TOKEN}}" \
  -H "Content-Type: application/json"
```

### Cancel Refund
```bash
curl -X POST "http://localhost:3000/api/v1/netcash/refunds/{{REFUND_ID}}/cancel" \
  -H "Authorization: Bearer {{TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Member requested cancellation"
  }'
```

---

## 4. RECONCILIATION

### Run Reconciliation for Specific Date
```bash
curl -X POST "http://localhost:3000/api/v1/netcash/reconciliation/run" \
  -H "Authorization: Bearer {{TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-02-14"
  }'
```

### Auto-Reconcile (Yesterday)
```bash
curl -X POST "http://localhost:3000/api/v1/netcash/reconciliation/auto" \
  -H "Authorization: Bearer {{TOKEN}}" \
  -H "Content-Type: application/json"
```

### List Reconciliations
```bash
curl -X GET "http://localhost:3000/api/v1/netcash/reconciliation?limit=20" \
  -H "Authorization: Bearer {{TOKEN}}"
```

### Get Reconciliation by ID
```bash
curl -X GET "http://localhost:3000/api/v1/netcash/reconciliation/{{RECONCILIATION_ID}}" \
  -H "Authorization: Bearer {{TOKEN}}"
```

### Get Reconciliation Statistics
```bash
curl -X GET "http://localhost:3000/api/v1/netcash/reconciliation/stats/summary" \
  -H "Authorization: Bearer {{TOKEN}}"
```

### List Discrepancies
```bash
curl -X GET "http://localhost:3000/api/v1/netcash/reconciliation/discrepancies/list?resolved=false" \
  -H "Authorization: Bearer {{TOKEN}}"
```

### Resolve Discrepancy
```bash
curl -X PUT "http://localhost:3000/api/v1/netcash/reconciliation/discrepancies/{{DISCREPANCY_ID}}/resolve" \
  -H "Authorization: Bearer {{TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "resolution": "payment_received",
    "notes": "Payment confirmed via bank statement"
  }'
```

---

## 5. WEBHOOKS

### Simulate Netcash Webhook (PUBLIC - No Auth)
```bash
curl -X POST "http://localhost:3000/api/v1/netcash/webhook" \
  -H "Content-Type: application/json" \
  -H "x-netcash-signature: {{SIGNATURE}}" \
  -d '{
    "transactionReference": "TXN123456",
    "status": "successful",
    "amount": 150.00,
    "memberReference": "MEM001",
    "timestamp": "2026-02-14T10:30:00Z"
  }'
```

### List Webhook Logs
```bash
curl -X GET "http://localhost:3000/api/v1/netcash/webhook/logs?limit=20" \
  -H "Authorization: Bearer {{TOKEN}}"
```

### Get Webhook Statistics
```bash
curl -X GET "http://localhost:3000/api/v1/netcash/webhook/stats/summary" \
  -H "Authorization: Bearer {{TOKEN}}"
```

### Retry Failed Webhook
```bash
curl -X POST "http://localhost:3000/api/v1/netcash/webhook/{{WEBHOOK_ID}}/retry" \
  -H "Authorization: Bearer {{TOKEN}}" \
  -H "Content-Type: application/json"
```

---

## 6. DEBIT ORDER MANAGEMENT

### Get Summary
```bash
curl -X GET "http://localhost:3000/api/v1/netcash/summary" \
  -H "Authorization: Bearer {{TOKEN}}"
```

### List Batches
```bash
curl -X GET "http://localhost:3000/api/v1/netcash/batches?limit=10" \
  -H "Authorization: Bearer {{TOKEN}}"
```

### List Broker Groups
```bash
curl -X GET "http://localhost:3000/api/v1/netcash/groups" \
  -H "Authorization: Bearer {{TOKEN}}"
```

### List Members
```bash
curl -X GET "http://localhost:3000/api/v1/netcash/members?limit=50" \
  -H "Authorization: Bearer {{TOKEN}}"
```

### Search Members
```bash
curl -X GET "http://localhost:3000/api/v1/netcash/members?search=John&limit=10" \
  -H "Authorization: Bearer {{TOKEN}}"
```

---

## Testing Workflow Examples

### Example 1: Test Failed Payment Retry Flow
```bash
# Step 1: Get failed payments
curl -X GET "http://localhost:3000/api/v1/netcash/failed-payments?limit=1" \
  -H "Authorization: Bearer {{TOKEN}}"

# Step 2: Get the transaction ID from response, then retry
curl -X POST "http://localhost:3000/api/v1/netcash/failed-payments/{{TRANSACTION_ID}}/retry" \
  -H "Authorization: Bearer {{TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Test retry"}'

# Step 3: Check updated status
curl -X GET "http://localhost:3000/api/v1/netcash/transactions/{{TRANSACTION_ID}}" \
  -H "Authorization: Bearer {{TOKEN}}"
```

### Example 2: Test Refund Process
```bash
# Step 1: Create refund
curl -X POST "http://localhost:3000/api/v1/netcash/refunds" \
  -H "Authorization: Bearer {{TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "memberId": "{{MEMBER_ID}}",
    "refundAmount": 100.00,
    "refundReason": "overpayment",
    "notes": "Test refund"
  }'

# Step 2: Get refund ID from response, then process
curl -X POST "http://localhost:3000/api/v1/netcash/refunds/{{REFUND_ID}}/process" \
  -H "Authorization: Bearer {{TOKEN}}" \
  -H "Content-Type: application/json"

# Step 3: Check refund status
curl -X GET "http://localhost:3000/api/v1/netcash/refunds/{{REFUND_ID}}" \
  -H "Authorization: Bearer {{TOKEN}}"
```

### Example 3: Test Reconciliation
```bash
# Step 1: Run reconciliation for today
curl -X POST "http://localhost:3000/api/v1/netcash/reconciliation/run" \
  -H "Authorization: Bearer {{TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{"date": "2026-02-14"}'

# Step 2: Get reconciliation ID from response, then view details
curl -X GET "http://localhost:3000/api/v1/netcash/reconciliation/{{RECONCILIATION_ID}}" \
  -H "Authorization: Bearer {{TOKEN}}"

# Step 3: List any discrepancies
curl -X GET "http://localhost:3000/api/v1/netcash/reconciliation/discrepancies/list?reconciliationId={{RECONCILIATION_ID}}" \
  -H "Authorization: Bearer {{TOKEN}}"
```

---

## Getting Your Auth Token

### Login to get token
```bash
curl -X POST "http://localhost:3000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

Response will include `access_token` - use this as your `{{TOKEN}}`

---

## Common Response Codes

- `200` - Success
- `201` - Created successfully
- `400` - Bad request (invalid data)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `500` - Server error

---

## Tips for Testing

1. **Start with GET requests** to view existing data
2. **Test statistics endpoints** to understand current state
3. **Use small amounts** for refund testing
4. **Check database** after each operation to verify changes
5. **Monitor backend logs** for detailed error messages
6. **Test error cases** (invalid IDs, missing fields, etc.)
7. **Use Postman/Insomnia** for easier testing with collections
8. **Save test IDs** (transaction, refund, reconciliation) for reuse

---

## Next Steps

1. ✅ Review the checklist: `NETCASH_TESTING_CHECKLIST.md`
2. 🧪 Start with HIGH priority tests
3. 📝 Document any issues found
4. 🔄 Test integration scenarios
5. 🎨 Test UI tabs in browser
6. 📊 Generate test reports

# Netcash Webhook Testing Guide

## Overview
Webhooks are HTTP callbacks that Netcash sends to your system when payment events occur. Since we're in test mode and haven't processed real payments yet, we don't have actual webhook data.

## Webhook Flow

```
Netcash Payment Processing
         ↓
Netcash sends webhook to your endpoint
         ↓
POST /api/v1/netcash/webhook (PUBLIC endpoint)
         ↓
System validates signature
         ↓
System processes webhook payload
         ↓
System updates transaction status
         ↓
Webhook logged in database
```

## Webhook Endpoints

### 1. Receive Webhook (PUBLIC - No Auth Required)
```
POST /api/v1/netcash/webhook
```

**Purpose**: Receive payment status updates from Netcash

**Payload Example**:
```json
{
  "event_type": "payment_success",
  "transaction_id": "TXN123456",
  "netcash_reference": "NC789012",
  "amount": 500,
  "status": "successful",
  "timestamp": "2026-02-15T10:30:00Z",
  "signature": "abc123..."
}
```

**Process**:
1. Validate webhook signature
2. Find transaction by reference
3. Update transaction status
4. Log webhook in `netcash_webhook_logs` table
5. Return 200 OK

### 2. View Webhook Logs
```
GET /api/v1/netcash/webhook/logs
```

**Query Parameters**:
- `processed` (boolean): Filter by processing status
- `limit` (number): Results per page
- `offset` (number): Pagination offset

**Response**:
```json
{
  "logs": [
    {
      "id": "uuid",
      "event_type": "payment_success",
      "payload": {...},
      "processed": true,
      "error_message": null,
      "received_at": "2026-02-15T10:30:00Z",
      "processed_at": "2026-02-15T10:30:01Z"
    }
  ],
  "total": 10,
  "limit": 50,
  "offset": 0
}
```

### 3. Webhook Statistics
```
GET /api/v1/netcash/webhook/stats/summary
```

**Response**:
```json
{
  "total": 100,
  "processed": 95,
  "failed": 5,
  "successRate": 95.0
}
```

### 4. Retry Failed Webhook
```
POST /api/v1/netcash/webhook/:id/retry
```

**Purpose**: Reprocess a failed webhook

## Database Schema

### netcash_webhook_logs Table
```sql
CREATE TABLE netcash_webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  signature VARCHAR(500),
  processed BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  received_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Testing Webhooks Without Real Data

Since we're in test mode, here are ways to test webhooks:

### Option 1: Manual Webhook Simulation
Create a script to send test webhooks to your endpoint:

```javascript
// SEND_TEST_WEBHOOK.js
const fetch = require('node-fetch');

const testWebhook = {
  event_type: 'payment_success',
  transaction_id: 'test-txn-123',
  netcash_reference: 'NC-TEST-456',
  amount: 500,
  status: 'successful',
  timestamp: new Date().toISOString()
};

fetch('http://localhost:3000/api/v1/netcash/webhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testWebhook)
})
.then(res => res.json())
.then(data => console.log('Webhook response:', data))
.catch(err => console.error('Error:', err));
```

### Option 2: Use Webhook Testing Tools
- **webhook.site**: Get a temporary URL to inspect webhooks
- **ngrok**: Expose your local server to receive real webhooks
- **Postman**: Send test webhook requests

### Option 3: Wait for Real Payments
Once you process real payments through Netcash:
1. Netcash will send webhooks to your configured endpoint
2. Webhooks will be logged automatically
3. You can view them in the Webhooks tab

## Webhook Security

### Signature Validation
Netcash signs webhooks to prevent tampering:

```javascript
const crypto = require('crypto');

function validateWebhookSignature(payload, signature, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return hash === signature;
}
```

### Best Practices
1. Always validate signatures
2. Use HTTPS in production
3. Log all webhooks for audit trail
4. Handle idempotency (same webhook sent twice)
5. Return 200 OK quickly (process async if needed)
6. Retry failed webhook processing

## Current Status

✅ **Completed**:
- Webhook endpoints defined in backend
- WebhooksTab UI component created
- Database schema ready

⏳ **Pending**:
- Real webhook data (waiting for actual payments)
- Webhook signature validation implementation
- Webhook retry logic

## Next Steps

1. **For Testing Now**: 
   - Webhooks tab shows empty state (no webhooks yet)
   - This is expected since no real payments processed

2. **For Production**:
   - Configure webhook URL in Netcash dashboard
   - Implement signature validation
   - Test with real payment processing
   - Monitor webhook logs for issues

## Webhook Event Types

Netcash may send these event types:
- `payment_success` - Payment processed successfully
- `payment_failed` - Payment failed
- `batch_completed` - Debit order batch completed
- `refund_processed` - Refund completed
- `mandate_updated` - Mandate status changed

## Troubleshooting

### Webhook Not Received
1. Check Netcash dashboard webhook configuration
2. Verify endpoint is publicly accessible
3. Check firewall/security settings
4. Review server logs for errors

### Webhook Processing Failed
1. Check webhook logs for error messages
2. Verify transaction exists in database
3. Check signature validation
4. Use retry endpoint to reprocess

### Duplicate Webhooks
1. Implement idempotency checks
2. Use transaction ID to prevent duplicate processing
3. Log duplicate attempts for monitoring

## Summary

Webhooks are currently in "waiting" state because:
- We're in test mode
- No real payments have been processed yet
- Netcash hasn't sent any webhooks

Once you process real payments, webhooks will start flowing and you'll see them in the Webhooks tab with full statistics and logs.

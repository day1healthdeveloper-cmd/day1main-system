# Netcash API Features Discussion - Technical Requirements

**Date:** [Insert Date]  
**Company:** Day1Health  
**Purpose:** Understand full Netcash API capabilities for insurance platform integration

---

## CURRENT IMPLEMENTATION STATUS

**What We're Using Now:**
- Debit Order API (batch submissions)
- Transaction status polling
- Basic authentication with service key

**What We Need:**
- Complete API feature set for production insurance platform
- Real-time payment processing
- Automated reconciliation
- Member self-service capabilities

---

## 1. DEBIT ORDER API - ADVANCED FEATURES

### Current Usage:
- Submitting batches via `/dss/submitBatch` endpoint
- Polling status with `/dss/getTransactionStatus`

### Questions:

**1.1 Batch Processing**
- What's the maximum batch size per submission?
- Can we submit multiple batches simultaneously?
- Is there a batch scheduling API (submit now, process later)?
- Can we cancel/modify a batch after submission but before processing?
- API endpoint for bulk batch status checks?

**1.2 Transaction Management**
- API to cancel individual transactions before processing?
- API to modify transaction amount before processing?
- Can we tag transactions with custom metadata/reference IDs?
- Maximum length for reference fields?
- API to retrieve transaction history by date range?

**1.3 Retry & Recovery**
- API to automatically retry failed transactions?
- Can we configure retry rules via API?
- API to get list of all failed transactions?
- Bulk retry endpoint?

**1.4 Real-Time Status**
- Webhook API for transaction status changes?
- What events trigger webhooks (submitted, processing, success, failed)?
- Webhook payload format and fields?
- Webhook authentication/signature verification?
- Webhook retry logic if our endpoint fails?

---

## 2. PAYMENT COLLECTION APIs

### Questions:

**2.1 Alternative Payment Methods**
- API for credit/debit card payments?
- Instant EFT API endpoints?
- Payment link generation API (send to members)?
- QR code payment API?
- USSD/mobile payment APIs?

**2.2 Payment Processing**
- API to process immediate one-time payments?
- API for recurring card payments (tokenization)?
- 3D Secure integration for card payments?
- API to store payment methods securely?
- API to retrieve stored payment methods per member?

**2.3 Payment Verification**
- Bank account verification API before first debit?
- API to validate bank account details?
- API to check if account is active/closed?

---

## 3. REFUND & REVERSAL APIs

### Questions:

**3.1 Refund Processing**
- API endpoint to initiate refunds?
- Partial refund support via API?
- Bulk refund API?
- API to check refund status?
- How long until refund API returns final status?

**3.2 Reversal Management**
- API to reverse a transaction?
- Time limit for reversals via API?
- API to track reversal status?

**3.3 Dispute Handling**
- API to retrieve dispute/chargeback notifications?
- API to submit dispute evidence?
- API to track dispute resolution status?

---

## 4. MEMBER/MANDATE MANAGEMENT APIs

### Questions:

**4.1 Mandate Management**
- API to create new debit order mandates?
- API to update existing mandates (amount, frequency)?
- API to cancel mandates?
- API to retrieve mandate status?
- API to get list of all active mandates?

**4.2 Member Account Management**
- API to update member bank account details?
- API to switch payment method for a member?
- API to retrieve member payment history?
- API to get member's current payment method?

**4.3 Bulk Operations**
- Bulk mandate creation API?
- Bulk account update API?
- Bulk mandate cancellation API?

---

## 5. RECONCILIATION & REPORTING APIs

### Questions:

**5.1 Transaction Reporting**
- API to get daily transaction report?
- API to get settlement report?
- API to export transactions by date range?
- Response format (JSON, CSV, XML)?
- Pagination support for large datasets?

**5.2 Financial Reconciliation**
- API to get bank settlement details?
- API to match transactions to bank deposits?
- API to get fee breakdown per transaction?
- API to get monthly statement data?

**5.3 Analytics**
- API to get success/failure rates?
- API to get payment statistics by date range?
- API to get member payment behavior data?

---

## 6. WEBHOOK & NOTIFICATION APIs

### Questions:

**6.1 Webhook Configuration**
- API to register webhook URLs?
- API to update webhook URLs?
- API to test webhook delivery?
- Can we have multiple webhook URLs for different events?
- API to retrieve webhook delivery logs?

**6.2 Webhook Events**
- Complete list of available webhook events?
- Webhook payload schemas for each event?
- Can we filter which events trigger webhooks?
- Webhook retry configuration via API?

**6.3 Notification APIs**
- API to send payment reminders to members?
- API to send payment confirmation notifications?
- API to send failed payment notifications?
- SMS/Email notification APIs?
- Can we customize notification templates via API?

---

## 7. AUTHENTICATION & SECURITY APIs

### Questions:

**7.1 API Authentication**
- Current: Service key authentication - is this production-ready?
- OAuth 2.0 support?
- API key rotation mechanism?
- Multiple API keys per account?
- API to generate/revoke API keys?

**7.2 Security Features**
- API request signing requirements?
- IP whitelisting configuration via API?
- API to retrieve security audit logs?
- Two-factor authentication for API access?

**7.3 Encryption**
- Are API requests/responses encrypted (TLS)?
- Field-level encryption for sensitive data?
- PCI DSS compliance level?

---

## 8. RATE LIMITING & PERFORMANCE

### Questions:

**8.1 API Rate Limits**
- Requests per second/minute/hour limits?
- Different limits for different endpoints?
- Rate limit headers in API responses?
- API to check current rate limit status?
- How to request rate limit increases?

**8.2 Performance**
- Average API response times?
- SLA for API uptime?
- Batch processing time (submission to completion)?
- Maximum concurrent API requests?

**8.3 Throttling**
- How are rate limit violations handled?
- Retry-After headers?
- Exponential backoff recommendations?

---

## 9. ERROR HANDLING & DEBUGGING

### Questions:

**9.1 Error Responses**
- Complete list of error codes and meanings?
- Error response format (JSON structure)?
- Detailed error messages for debugging?
- API to retrieve error logs?

**9.2 Transaction Failures**
- Specific error codes for different failure reasons?
- API to get detailed failure reason per transaction?
- Categorization of failures (bank reject, insufficient funds, account closed, etc.)?

**9.3 Debugging Tools**
- API request/response logging?
- API to retrieve request history?
- Test mode/sandbox API endpoints?
- API to simulate different scenarios (success, failure, timeout)?

---

## 10. SANDBOX & TESTING

### Questions:

**10.1 Test Environment**
- Separate sandbox API endpoints?
- Test credentials provisioning?
- Sandbox data reset API?
- Can we test all payment scenarios in sandbox?

**10.2 Test Data**
- Test bank account numbers for different scenarios?
- Test card numbers for success/failure scenarios?
- API to create test transactions?
- API to simulate webhook events?

**10.3 Testing Tools**
- Postman collection available?
- API documentation with curl examples?
- SDKs available (Node.js, Python, etc.)?

---

## 11. COMPLIANCE & AUDIT APIs

### Questions:

**11.1 Audit Trail**
- API to retrieve complete audit trail per transaction?
- API to get user activity logs?
- API to export compliance reports?
- Data retention period for API logs?

**11.2 Regulatory Compliance**
- POPIA compliance features via API?
- API to handle data deletion requests (right to be forgotten)?
- API to export member data (data portability)?

**11.3 Financial Reporting**
- API for tax reporting data?
- API for regulatory submission reports?
- API to get transaction data in specific formats (SARS, etc.)?

---

## 12. ADVANCED FEATURES

### Questions:

**12.1 Scheduled Payments**
- API to schedule future-dated payments?
- API to create recurring payment schedules?
- API to modify scheduled payments?
- API to cancel scheduled payments?
- API to retrieve upcoming scheduled payments?

**12.2 Payment Plans**
- API to create installment plans?
- API to track installment plan progress?
- API to handle missed installment payments?

**12.3 Multi-Currency**
- API support for multiple currencies?
- Currency conversion APIs?
- Cross-border payment APIs?

**12.4 Split Payments**
- API to split a payment across multiple recipients?
- API to configure split payment rules?

---

## 13. INTEGRATION & MIGRATION

### Questions:

**13.1 Data Migration**
- API to bulk import existing mandates?
- API to migrate historical transaction data?
- Data format requirements for migration?

**13.2 Integration Support**
- Webhook testing tools?
- API request validation tools?
- Integration checklist/certification process?

**13.3 Documentation**
- Complete API reference documentation URL?
- OpenAPI/Swagger specification available?
- Code examples for all endpoints?
- Postman collection?

---

## 14. MONITORING & ALERTING

### Questions:

**14.1 System Status**
- API to check Netcash system status?
- Planned maintenance notification API?
- API uptime monitoring endpoint?

**14.2 Alerts**
- API to configure alert rules?
- API to receive system alerts?
- Alert types available (high failure rate, system issues, etc.)?

**14.3 Health Checks**
- Health check endpoint for our integration?
- API to test connectivity?
- API to validate credentials?

---

## 15. SPECIFIC USE CASES TO VALIDATE

### Use Case 1: New Member Onboarding
**API Flow Needed:**
1. Create mandate via API
2. Verify bank account via API
3. Schedule first payment via API
4. Send confirmation via API

**Questions:**
- Which specific endpoints handle this flow?
- Can this be done in a single API call or multiple?
- Estimated time from mandate creation to first payment?

### Use Case 2: Failed Payment Recovery
**API Flow Needed:**
1. Receive webhook for failed payment
2. Retrieve failure reason via API
3. Schedule retry via API
4. Notify member via API

**Questions:**
- Which endpoints handle this flow?
- Automatic retry configuration via API?
- Best practice for retry timing?

### Use Case 3: Member Cancellation
**API Flow Needed:**
1. Cancel mandate via API
2. Process any pending refunds via API
3. Retrieve final statement via API
4. Archive member data via API

**Questions:**
- Which endpoints handle this flow?
- How to ensure no future charges after cancellation?
- Refund processing time?

### Use Case 4: Daily Reconciliation
**API Flow Needed:**
1. Retrieve all transactions for date via API
2. Get settlement report via API
3. Match transactions to bank deposits via API
4. Flag discrepancies via API

**Questions:**
- Which endpoints handle this flow?
- Best time of day to run reconciliation?
- How to handle timing differences (transaction date vs settlement date)?

---

## 16. PRODUCTION READINESS CHECKLIST

### Questions:

**16.1 Go-Live Requirements**
- [ ] What's required to move from test to production?
- [ ] Production API credentials provisioning process?
- [ ] Production environment differences from sandbox?
- [ ] Certification or approval process?

**16.2 Scaling**
- [ ] API limits for production vs test?
- [ ] How to handle traffic spikes (month-end processing)?
- [ ] Load balancing recommendations?
- [ ] Caching strategies for API responses?

**16.3 Support**
- [ ] API support contact for production issues?
- [ ] SLA for API issue resolution?
- [ ] Emergency escalation process?
- [ ] After-hours support availability?

---

## CRITICAL API ENDPOINTS NEEDED

Please provide documentation and access for:

1. **Debit Order APIs:**
   - Submit batch
   - Get transaction status
   - Cancel transaction
   - Retry failed transaction
   - Get transaction history

2. **Mandate APIs:**
   - Create mandate
   - Update mandate
   - Cancel mandate
   - Get mandate status
   - List all mandates

3. **Refund APIs:**
   - Initiate refund
   - Get refund status
   - List refunds

4. **Webhook APIs:**
   - Register webhook
   - Test webhook
   - Get webhook logs

5. **Reporting APIs:**
   - Daily transaction report
   - Settlement report
   - Failed transaction report
   - Financial summary

6. **Member APIs:**
   - Update bank details
   - Get payment history
   - Get payment methods

---

## DELIVERABLES REQUESTED

1. Complete API documentation (OpenAPI spec preferred)
2. Postman collection with all endpoints
3. Sandbox credentials
4. Production credentials (when ready)
5. Webhook payload examples
6. Error code reference guide
7. Integration best practices guide
8. Code examples (Node.js preferred)
9. Rate limit specifications
10. SLA documentation

---

## ACTION ITEMS

- [ ] Get complete API documentation
- [ ] Provision sandbox credentials
- [ ] Schedule technical deep-dive session
- [ ] Get webhook payload samples
- [ ] Obtain error code reference
- [ ] Review rate limits and scaling options
- [ ] Plan production migration timeline
- [ ] Set up monitoring and alerting

---

**Meeting Prepared By:** Kiro AI Assistant  
**Date Prepared:** February 17, 2026  
**Focus:** Complete API technical capabilities for production insurance platform

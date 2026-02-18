# Netcash Integration Setup Guide

## ⚠️ IMPORTANT: No Sandbox Environment

**Netcash does NOT offer a sandbox/test environment.**

Testing must be done with:
1. **Small test batches** in production with real accounts
2. **Test accounts** with minimal amounts (R1-R10)
3. **Careful validation** before processing

---

## 📋 What You Need from Netcash

### 1. Netcash Account Setup
Contact Netcash to set up your account:
- **Website:** https://netcash.co.za
- **Support:** support@netcash.co.za
- **Sales:** sales@netcash.co.za

### 2. Required Credentials

You will receive these from Netcash:

#### A. Merchant Account ID
- Your unique Netcash account identifier
- Example: `12345678`

#### B. Debit Order Service Key
- Used for debit order batch uploads
- Example: `24ade73c-98cf-47b3-99be-cc7b867b3080`
- **CRITICAL:** Keep this secret!

#### C. Account Service Key (Optional)
- For account management operations
- Example: `a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6`

#### D. Vault Tokenization Service Key (Optional)
- For credit card debit orders
- Only needed if processing card payments

### 3. Service Configuration

Ask Netcash to enable:
- ✅ Same-day debit orders
- ✅ Two-day (dated) debit orders
- ✅ DebiCheck (recommended for new mandates)
- ✅ API access
- ✅ Postback URL for automated responses

---

## 🔧 Integration Methods

### Method 1: File Upload (Recommended for Start)
Upload CSV/text files via:
- Netcash web portal (manual)
- API file upload (automated)

### Method 2: API Integration (Recommended for Production)
Direct API calls for:
- Batch creation
- Transaction submission
- Status checking
- Result retrieval

---

## 📁 File Format Specification

### Debit Order Batch File Structure

```
H{ServiceKey}1{Instruction}{BatchName}{ActionDate}{SoftwareVendorKey}
K101102103104131132133134135136137161162201202281301302303509
T{AccountRef}{AccountName}{Active}{Delete}{BankDetailType}{AccountHolderName}{AccountType}{BranchCode}{Filler}{AccountNumber}{MaskedCard}{Amount}{Amount}{Email}{Mobile}{Group}{Extra1}{Extra2}{Extra3}{Resubmit}
T{AccountRef}{AccountName}{Active}{Delete}{BankDetailType}{AccountHolderName}{AccountType}{BranchCode}{Filler}{AccountNumber}{MaskedCard}{Amount}{Amount}{Email}{Mobile}{Group}{Extra1}{Extra2}{Extra3}{Resubmit}
F{TransactionCount}{TotalAmount}9999
```

### Field Explanations

#### Header Record (H)
- **H** - Record identifier
- **ServiceKey** - Your debit order service key
- **1** - Version number
- **Instruction** - `Sameday`, `TwoDay`, or `Update`
- **BatchName** - Your batch identifier (e.g., "FEB2026_DAY1")
- **ActionDate** - Debit date (CCYYMMDD format, e.g., 20260302)
- **SoftwareVendorKey** - Default: `24ade73c-98cf-47b3-99be-cc7b867b3080`

#### Key Record (K)
Defines which fields are included in transaction records:
- **101** - Account reference (member number)
- **102** - Account name
- **103** - Account active (1=active, 0=inactive)
- **104** - Delete account (0=no, 1=yes)
- **131** - Banking detail type (1=bank account, 2=credit card)
- **132** - Bank account holder name
- **133** - Account type (1=savings, 2=cheque, 3=transmission)
- **134** - Branch code
- **135** - Filler (0 for bank accounts)
- **136** - Account number
- **137** - Masked card number (blank for bank accounts)
- **161** - Default debit amount (in cents)
- **162** - Amount (in cents)
- **201** - Email address
- **202** - Mobile number
- **281** - Debit masterfile group
- **301-303** - Extra fields
- **509** - Resubmit unpaids via PayNow (0 or 1)

#### Transaction Record (T)
One per member, values matching key record fields

#### Footer Record (F)
- **F** - Record identifier
- **TransactionCount** - Number of T records
- **TotalAmount** - Sum of all amounts (in cents)
- **9999** - End-of-file indicator

---

## 📅 Processing Deadlines

### Same-Day Debit Orders
- **Submission:** Before 10:59 AM on action date (Mon-Fri)
- **OR:** Before 11:59 PM one business day prior (for Saturday)
- **Processing:** Banks process after 4:00 PM on action date
- **Funds Available:** One business day after action date
- **Processing Days:** Monday to Saturday

### Two-Day (Dated) Debit Orders
- **Submission:** Before 11:59 PM two business days prior
- **Processing:** Banks process at 12:02 AM on action date
- **Funds Available:** On action date
- **Processing Days:** Monday to Friday

---

## 🔐 Security Requirements

### Service Key Protection
```bash
# Store in environment variables
NETCASH_SERVICE_KEY=your-service-key-here
NETCASH_MERCHANT_ID=your-merchant-id-here
NETCASH_SOFTWARE_VENDOR_KEY=24ade73c-98cf-47b3-99be-cc7b867b3080
```

### Never:
- ❌ Commit service keys to Git
- ❌ Share keys in emails/chat
- ❌ Store keys in frontend code
- ❌ Log keys in application logs

---

## 🧪 Testing Strategy (No Sandbox)

### Phase 1: Validation Testing
1. Generate test files with 1-2 members
2. Validate file format locally
3. Check field lengths and formats
4. Verify calculations (totals, counts)

### Phase 2: Small Batch Testing
1. Create batch with 5 test members
2. Use small amounts (R1-R10)
3. Use your own bank accounts
4. Submit via Netcash portal (manual)
5. Monitor results

### Phase 3: API Testing
1. Test API authentication
2. Upload small test batch via API
3. Check response handling
4. Test error scenarios
5. Verify postback URL

### Phase 4: Production Rollout
1. Start with one broker group (10 members)
2. Monitor for 1 month
3. Gradually add more groups
4. Full rollout after successful testing

---

## 📊 Response Handling

### Success Response
```
###BEGIN
BatchName: FEB2026_DAY1
Result: SUCCESSFUL
Start Time: 09:30 AM
Batch Value: 565000
Action Date: 20260302
###END
End Time: 09:31 AM
```

### Error Response
```
###BEGIN
BatchName: FEB2026_DAY1
Result: UNSUCCESSFUL
Start Time: 09:30 AM
Batch Value: 565000
Action Date: 20260302
D1-DAY1035164 Line: 3 Invalid branch code
D1-DAY1035165 Line: 4 Invalid account number
###END
End Time: 09:31 AM
```

---

## 🔗 API Endpoints

### Production URLs
- **File Upload:** `https://api.netcash.co.za/upload`
- **Status Check:** `https://api.netcash.co.za/status`
- **Results:** `https://api.netcash.co.za/results`

### Documentation
- **Developer Docs:** https://api.netcash.co.za/
- **Debit Orders:** https://api.netcash.co.za/inbound-payments/debit-orders/
- **DebiCheck:** https://api.netcash.co.za/inbound-payments/debi-check/

---

## 📞 Next Steps

### 1. Contact Netcash
Email: support@netcash.co.za

Request:
- Merchant account setup
- Debit order service activation
- Service keys
- API access
- DebiCheck activation

### 2. Receive Credentials
Wait for Netcash to provide:
- Merchant Account ID
- Debit Order Service Key
- Account Service Key
- API documentation

### 3. Configure Environment
Add credentials to `.env` file:
```bash
NETCASH_MERCHANT_ID=your-merchant-id
NETCASH_SERVICE_KEY=your-service-key
NETCASH_API_URL=https://api.netcash.co.za
NETCASH_SOFTWARE_VENDOR_KEY=24ade73c-98cf-47b3-99be-cc7b867b3080
```

### 4. Build Integration
- File generation system
- API client
- Response parser
- Error handler
- Reconciliation system

### 5. Test with Small Batch
- 5 test members
- R1-R10 amounts
- Your own accounts
- Manual upload first

### 6. Production Rollout
- Start with 10 members
- Monitor for 1 month
- Gradually scale up
- Full rollout

---

## ⚠️ Important Notes

1. **No Sandbox:** All testing is in production with real money
2. **Start Small:** Test with minimal amounts and your own accounts
3. **Validate Everything:** Double-check all data before submission
4. **Monitor Closely:** Watch first few batches carefully
5. **Have Rollback Plan:** Be ready to reverse/refund if issues occur
6. **Contact Support:** Netcash support is responsive - use them!

---

## 📋 Checklist

- [ ] Contact Netcash sales/support
- [ ] Request merchant account setup
- [ ] Request debit order service activation
- [ ] Receive service keys
- [ ] Store keys securely in environment variables
- [ ] Build file generation system
- [ ] Build API integration
- [ ] Create test batch (5 members, small amounts)
- [ ] Manual upload test via Netcash portal
- [ ] Verify results
- [ ] Test API upload
- [ ] Test error handling
- [ ] Test reconciliation
- [ ] Production rollout (10 members)
- [ ] Monitor for 1 month
- [ ] Scale up gradually

---

**Status:** Ready to contact Netcash for account setup

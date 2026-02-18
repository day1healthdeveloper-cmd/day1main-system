# Netcash Service Keys - Wabi Sabi Systems

## Account Information
- **Account Name:** Wabi Sabi Systems
- **Merchant ID:** 51498414802
- **Environment:** Test Account

---

## Service Keys

### 1. Account Service Key
```
d7303098-1d4e-45c0-83b5-3a4331d02906
```
**Purpose:** General account management operations

### 2. Debit Order Service Key
```
657eb988-5345-45f7-a5e5-07a1a586155f
```
**Purpose:** Debit order batch uploads and processing
**Used for:** Monthly debit order runs

### 3. Pay Now Service Key
```
6f13a35c-f239-45da-9efc-6bed357746a5
```
**Purpose:** Instant payment processing
**Used for:** Real-time payment collections, online payments

### 4. Creditor Payments Service Key
```
e64c04f0-d8cc-4b5a-9e3b-aa0350fb7591
```
**Purpose:** Making payments to creditors/suppliers
**Used for:** Provider payments, claims payments, refunds

---

## Software Vendor Key (Default)
```
24ade73c-98cf-47b3-99be-cc7b867b3080
```
**Purpose:** Identifies software origin (Netcash default)

---

## Service Capabilities

### Debit Order Service
- ✅ Same-day debit orders
- ✅ Two-day (dated) debit orders
- ✅ DebiCheck mandates
- ✅ Batch file uploads
- ✅ Master file management

### Pay Now Service
- ✅ Instant payments
- ✅ QR code payments
- ✅ Online checkout
- ✅ Payment links
- ✅ Real-time notifications

### Creditor Payments Service
- ✅ Bulk payments to providers
- ✅ Claims settlements
- ✅ Refunds to members
- ✅ Supplier payments
- ✅ Commission payments to brokers

---

## Usage in System

### Current Implementation
- **Debit Order Service:** ✅ Implemented (Monthly debit order runs)
- **Pay Now Service:** ⏳ To be implemented (Member portal payments)
- **Creditor Payments:** ⏳ To be implemented (Provider/claims payments)

### Environment Variables

**Backend (.env):**
```bash
NETCASH_MERCHANT_ID=51498414802
NETCASH_ACCOUNT_SERVICE_KEY=d7303098-1d4e-45c0-83b5-3a4331d02906
NETCASH_SERVICE_KEY=657eb988-5345-45f7-a5e5-07a1a586155f
NETCASH_PAYNOW_SERVICE_KEY=6f13a35c-f239-45da-9efc-6bed357746a5
NETCASH_CREDITOR_PAYMENTS_SERVICE_KEY=e64c04f0-d8cc-4b5a-9e3b-aa0350fb7591
NETCASH_SOFTWARE_VENDOR_KEY=24ade73c-98cf-47b3-99be-cc7b867b3080
```

---

## Security Notes

⚠️ **CRITICAL - Keep These Keys Secret!**

### Never:
- ❌ Commit to Git
- ❌ Share in emails/chat
- ❌ Store in frontend code
- ❌ Log in application logs
- ❌ Share screenshots containing keys

### Always:
- ✅ Store in environment variables
- ✅ Use .env files (gitignored)
- ✅ Restrict access to authorized personnel only
- ✅ Rotate keys if compromised
- ✅ Use separate keys for test/production

---

## Future Services to Enable

### 1. DebiCheck (Recommended)
- Enhanced debit order security
- Bank-level authorization
- Reduced disputes
- Better success rates

### 2. Card Payments
- Credit/debit card processing
- Tokenization for recurring payments
- PCI DSS compliant

### 3. EFT Payments
- Electronic funds transfers
- Bank-to-bank payments
- Lower fees than cards

---

## Support

**Netcash Support:**
- Email: support@netcash.co.za
- Dashboard: https://merchant.netcash.co.za
- Account: Wabi Sabi Systems (51498414802)

**Service Key Management:**
- Generate new keys: Account Profile → Service Keys
- Regenerate if compromised
- Each service has separate key

---

**Status:** All service keys active and ready to use
**Last Updated:** February 9, 2026

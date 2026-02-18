# Day1Health Complete Database Schema
## Logical Flow: Application → Member → Policy → Payment

---

## 📋 STAGE 1: APPLICATION & ONBOARDING

### `applications` Table
**Purpose**: Initial insurance application submission

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| application_number | VARCHAR(50) | Unique application reference (e.g., APP-20260215-000001) |
| contact_id | UUID | FK → contacts.id |
| broker_id | UUID | FK → brokers.id |
| product_id | UUID | FK → products.id |
| status | VARCHAR(50) | pending, under_review, approved, rejected, cancelled |
| submission_date | TIMESTAMP | When application was submitted |
| review_date | TIMESTAMP | When review started |
| decision_date | TIMESTAMP | When approved/rejected |
| decision_by | UUID | FK → users.id (who made decision) |
| rejection_reason | TEXT | If rejected |
| notes | TEXT | Internal notes |
| created_at | TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | Last update |

### `application_dependents` Table
**Purpose**: Dependents included in application

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| application_id | UUID | FK → applications.id |
| first_name | VARCHAR(100) | Dependent first name |
| last_name | VARCHAR(100) | Dependent last name |
| id_number | VARCHAR(20) | SA ID number |
| date_of_birth | DATE | Birth date |
| relationship | VARCHAR(50) | spouse, child, parent, other |
| gender | VARCHAR(20) | male, female, other |
| created_at | TIMESTAMP | Record creation |

---

## 👤 STAGE 2: CONTACT & MEMBER CREATION

### `contacts` Table
**Purpose**: Initial contact information (before becoming member)

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| first_name | VARCHAR(100) | Contact first name |
| last_name | VARCHAR(100) | Contact last name |
| email | VARCHAR(255) | Email address |
| phone | VARCHAR(20) | Phone number |
| id_number | VARCHAR(20) | SA ID number |
| date_of_birth | DATE | Birth date |
| gender | VARCHAR(20) | male, female, other |
| source | VARCHAR(50) | website, broker, call_centre, referral |
| status | VARCHAR(50) | lead, prospect, applicant, member, inactive |
| broker_id | UUID | FK → brokers.id |
| created_at | TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | Last update |

### `members` Table
**Purpose**: Active insurance members (after application approval)

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| member_number | VARCHAR(50) | Unique member ID (e.g., DAY1035164) |
| contact_id | UUID | FK → contacts.id |
| broker_id | UUID | FK → brokers.id |
| broker_group | VARCHAR(100) | Broker group name |
| first_name | VARCHAR(100) | Member first name |
| last_name | VARCHAR(100) | Member last name |
| id_number | VARCHAR(20) | SA ID number |
| date_of_birth | DATE | Birth date |
| gender | VARCHAR(20) | male, female, other |
| email | VARCHAR(255) | Email address |
| phone | VARCHAR(20) | Phone number |
| status | VARCHAR(50) | active, suspended, cancelled, deceased |
| join_date | DATE | When became member |
| cancellation_date | DATE | If cancelled |
| cancellation_reason | TEXT | Why cancelled |
| debit_order_status | VARCHAR(50) | active, suspended, failed, pending |
| debit_order_day | INTEGER | Day of month for debit (1-31) |
| bank_name | VARCHAR(100) | Bank name |
| bank_account_type | VARCHAR(50) | current, savings, transmission |
| bank_account_number | VARCHAR(20) | Account number |
| bank_branch_code | VARCHAR(10) | Branch code |
| bank_account_holder | VARCHAR(200) | Account holder name |
| created_at | TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | Last update |

### `member_dependents` Table
**Purpose**: Dependents covered under member's policy

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| member_id | UUID | FK → members.id |
| first_name | VARCHAR(100) | Dependent first name |
| last_name | VARCHAR(100) | Dependent last name |
| id_number | VARCHAR(20) | SA ID number |
| date_of_birth | DATE | Birth date |
| relationship | VARCHAR(50) | spouse, child, parent, other |
| gender | VARCHAR(20) | male, female, other |
| status | VARCHAR(50) | active, removed |
| added_date | DATE | When added to policy |
| removed_date | DATE | If removed |
| created_at | TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | Last update |

---

## 📜 STAGE 3: POLICY & COVERAGE

### `policies` Table
**Purpose**: Insurance policy details

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| policy_number | VARCHAR(50) | Unique policy reference |
| member_id | UUID | FK → members.id (principal member) |
| product_id | UUID | FK → products.id |
| status | VARCHAR(50) | active, lapsed, cancelled, suspended |
| start_date | DATE | Policy start date |
| end_date | DATE | Policy end date (if applicable) |
| premium_amount | DECIMAL(10,2) | Monthly premium |
| billing_frequency | VARCHAR(50) | monthly, quarterly, annually |
| next_billing_date | DATE | Next payment due |
| arrears_amount | DECIMAL(10,2) | Outstanding amount |
| grace_period_days | INTEGER | Days before lapse (default 30) |
| created_at | TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | Last update |

### `policy_members` Table
**Purpose**: Link members and dependents to policies

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| policy_id | UUID | FK → policies.id |
| member_id | UUID | FK → members.id |
| relationship | VARCHAR(50) | principal, spouse, child, parent |
| status | VARCHAR(50) | active, removed |
| added_date | DATE | When added |
| removed_date | DATE | If removed |
| created_at | TIMESTAMP | Record creation |

### `products` Table
**Purpose**: Insurance product definitions

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| product_code | VARCHAR(50) | Unique product code |
| product_name | VARCHAR(200) | Product name |
| product_type | VARCHAR(50) | funeral, health, life, disability |
| description | TEXT | Product description |
| base_premium | DECIMAL(10,2) | Base monthly premium |
| status | VARCHAR(50) | active, inactive, discontinued |
| created_at | TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | Last update |

---

## 💳 STAGE 4: DEBIT ORDER PROCESSING

### `debit_order_runs` Table
**Purpose**: Batch debit order submissions to Netcash

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| run_number | VARCHAR(50) | Unique run reference (e.g., RUN-20260215-001) |
| run_date | DATE | Date of run |
| broker_group | VARCHAR(100) | Broker group (if filtered) |
| total_members | INTEGER | Number of members in batch |
| total_amount | DECIMAL(12,2) | Total amount to collect |
| status | VARCHAR(50) | pending, submitted, processing, completed, failed |
| netcash_batch_id | VARCHAR(100) | Netcash batch reference |
| submitted_at | TIMESTAMP | When submitted to Netcash |
| completed_at | TIMESTAMP | When processing completed |
| created_by | UUID | FK → users.id |
| created_at | TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | Last update |

### `debit_order_transactions` Table
**Purpose**: Individual debit order transactions

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| run_id | UUID | FK → debit_order_runs.id |
| member_id | UUID | FK → members.id |
| member_number | VARCHAR(50) | Member reference |
| member_name | VARCHAR(200) | Member full name |
| account_reference | VARCHAR(100) | Account reference for Netcash |
| amount | DECIMAL(10,2) | Transaction amount (in cents for Netcash) |
| status | VARCHAR(50) | pending, processing, successful, failed, reversed |
| netcash_reference | VARCHAR(100) | Netcash transaction reference |
| bank_reference | VARCHAR(100) | Bank reference number |
| tracking_number | VARCHAR(100) | Tracking number |
| error_code | VARCHAR(50) | Error code if failed |
| error_message | TEXT | Error message if failed |
| rejection_reason | TEXT | Why payment was rejected |
| retry_count | INTEGER | Number of retry attempts (max 3) |
| last_retry_at | TIMESTAMP | Last retry timestamp |
| processed_at | TIMESTAMP | When processed by bank |
| reversed_at | TIMESTAMP | If reversed |
| created_at | TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | Last update |

---

## 💰 STAGE 5: PAYMENT TRACKING

### `payments` Table
**Purpose**: Successful payment records

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| payment_reference | VARCHAR(100) | Unique payment reference |
| transaction_id | UUID | FK → debit_order_transactions.id |
| member_id | UUID | FK → members.id |
| policy_id | UUID | FK → policies.id |
| amount | DECIMAL(10,2) | Payment amount |
| payment_method | VARCHAR(50) | debit_order, eft, cash, card |
| payment_date | DATE | Date payment received |
| status | VARCHAR(50) | completed, pending, failed, reversed |
| allocated_to_arrears | DECIMAL(10,2) | Amount allocated to arrears |
| allocated_to_premium | DECIMAL(10,2) | Amount allocated to premium |
| created_at | TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | Last update |

### `invoices` Table
**Purpose**: Billing invoices for members

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| invoice_number | VARCHAR(50) | Unique invoice reference |
| policy_id | UUID | FK → policies.id |
| member_id | UUID | FK → members.id |
| invoice_date | DATE | Invoice date |
| due_date | DATE | Payment due date |
| total_amount | DECIMAL(10,2) | Total invoice amount |
| paid_amount | DECIMAL(10,2) | Amount paid |
| outstanding_amount | DECIMAL(10,2) | Amount still owed |
| status | VARCHAR(50) | pending, paid, overdue, cancelled |
| created_at | TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | Last update |

---

## 🔄 STAGE 6: REFUNDS & REVERSALS

### `refunds` Table
**Purpose**: Refund requests and processing

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| refund_reference | VARCHAR(100) | Unique refund reference |
| member_id | UUID | FK → members.id |
| payment_id | UUID | FK → payments.id (if refunding specific payment) |
| amount | DECIMAL(10,2) | Refund amount |
| reason | VARCHAR(100) | overpayment, duplicate, cancellation, error |
| status | VARCHAR(50) | pending, processing, completed, failed, cancelled |
| requested_by | UUID | FK → users.id |
| requested_at | TIMESTAMP | When requested |
| processed_at | TIMESTAMP | When processed |
| netcash_reference | VARCHAR(100) | Netcash refund reference |
| notes | TEXT | Additional notes |
| created_at | TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | Last update |

---

## 📊 STAGE 7: RECONCILIATION

### `reconciliations` Table
**Purpose**: Daily payment reconciliation records

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| reconciliation_date | DATE | Date being reconciled |
| expected_amount | DECIMAL(12,2) | Expected total from transactions |
| received_amount | DECIMAL(12,2) | Actual amount received |
| discrepancy_amount | DECIMAL(12,2) | Difference (expected - received) |
| matched_count | INTEGER | Number of matched transactions |
| unmatched_count | INTEGER | Number of unmatched transactions |
| status | VARCHAR(50) | pending, in_progress, completed, discrepancies |
| reconciled_by | UUID | FK → users.id |
| reconciled_at | TIMESTAMP | When reconciliation completed |
| notes | TEXT | Reconciliation notes |
| created_at | TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | Last update |

### `reconciliation_discrepancies` Table
**Purpose**: Track reconciliation discrepancies

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| reconciliation_id | UUID | FK → reconciliations.id |
| transaction_id | UUID | FK → debit_order_transactions.id |
| discrepancy_type | VARCHAR(50) | missing_payment, duplicate, amount_mismatch |
| expected_amount | DECIMAL(10,2) | Expected amount |
| actual_amount | DECIMAL(10,2) | Actual amount |
| difference | DECIMAL(10,2) | Difference |
| status | VARCHAR(50) | unresolved, investigating, resolved |
| resolution | TEXT | How discrepancy was resolved |
| resolved_by | UUID | FK → users.id |
| resolved_at | TIMESTAMP | When resolved |
| created_at | TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | Last update |

---

## 📡 STAGE 8: WEBHOOK LOGGING

### `netcash_webhook_logs` Table
**Purpose**: Log all webhooks received from Netcash

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| event_type | VARCHAR(100) | payment_success, payment_failed, batch_completed |
| payload | JSONB | Full webhook payload |
| signature | VARCHAR(500) | Webhook signature for validation |
| processed | BOOLEAN | Whether webhook was processed |
| error_message | TEXT | Error if processing failed |
| transaction_id | UUID | FK → debit_order_transactions.id (if linked) |
| received_at | TIMESTAMP | When webhook received |
| processed_at | TIMESTAMP | When webhook processed |
| created_at | TIMESTAMP | Record creation |

---

## 🔐 STAGE 9: AUDIT & COMPLIANCE

### `audit_events` Table
**Purpose**: Audit trail for all system actions

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| event_type | VARCHAR(100) | Type of event |
| entity_type | VARCHAR(100) | Table/entity affected |
| entity_id | UUID | ID of affected record |
| action | VARCHAR(50) | create, update, delete, view |
| user_id | UUID | FK → users.id (who performed action) |
| changes | JSONB | Before/after values |
| ip_address | VARCHAR(50) | User IP address |
| user_agent | TEXT | Browser/client info |
| created_at | TIMESTAMP | When event occurred |

---

## 👥 SUPPORTING TABLES

### `brokers` Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| broker_code | VARCHAR(50) | Unique broker code |
| broker_name | VARCHAR(200) | Broker/company name |
| contact_person | VARCHAR(200) | Contact person name |
| email | VARCHAR(255) | Email address |
| phone | VARCHAR(20) | Phone number |
| commission_rate | DECIMAL(5,2) | Commission percentage |
| status | VARCHAR(50) | active, inactive, suspended |
| created_at | TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | Last update |

### `users` Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | VARCHAR(255) | Login email |
| password_hash | VARCHAR(255) | Hashed password |
| first_name | VARCHAR(100) | First name |
| last_name | VARCHAR(100) | Last name |
| role | VARCHAR(50) | admin, operations, broker, call_centre |
| status | VARCHAR(50) | active, inactive, suspended |
| last_login | TIMESTAMP | Last login time |
| created_at | TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | Last update |

---

## 🔄 COMPLETE FLOW DIAGRAM

```
1. APPLICATION STAGE
   ├─ Contact submits application → applications
   ├─ Dependents added → application_dependents
   └─ Application reviewed → status: approved

2. MEMBER CREATION
   ├─ Contact converted to member → members
   ├─ Dependents linked → member_dependents
   └─ Bank details captured → members (bank fields)

3. POLICY ACTIVATION
   ├─ Policy created → policies
   ├─ Members linked → policy_members
   └─ Premium calculated → policies.premium_amount

4. DEBIT ORDER SETUP
   ├─ Member added to debit order group
   ├─ Debit order day set → members.debit_order_day
   └─ Status: active → members.debit_order_status

5. MONTHLY BILLING
   ├─ Invoice generated → invoices
   ├─ Debit order run created → debit_order_runs
   └─ Transactions created → debit_order_transactions

6. NETCASH SUBMISSION
   ├─ Batch submitted to Netcash
   ├─ Netcash batch ID received → debit_order_runs.netcash_batch_id
   └─ Status: submitted → debit_order_runs.status

7. PAYMENT PROCESSING
   ├─ Netcash processes payments
   ├─ Webhooks received → netcash_webhook_logs
   └─ Transaction status updated → debit_order_transactions.status

8. SUCCESSFUL PAYMENT
   ├─ Payment record created → payments
   ├─ Invoice marked paid → invoices.status = 'paid'
   ├─ Arrears reduced → policies.arrears_amount
   └─ Next billing date updated → policies.next_billing_date

9. FAILED PAYMENT
   ├─ Transaction marked failed → debit_order_transactions.status = 'failed'
   ├─ Rejection reason logged → debit_order_transactions.rejection_reason
   ├─ Retry scheduled (if < 3 attempts)
   └─ Member notified

10. RECONCILIATION
    ├─ Daily reconciliation run → reconciliations
    ├─ Transactions matched
    ├─ Discrepancies identified → reconciliation_discrepancies
    └─ Discrepancies resolved

11. REFUNDS (if needed)
    ├─ Refund requested → refunds
    ├─ Refund processed via Netcash
    ├─ Webhook received
    └─ Member account credited
```

---

## 📈 KEY RELATIONSHIPS

```
contacts (1) ──→ (1) members
members (1) ──→ (many) member_dependents
members (1) ──→ (many) policies
policies (1) ──→ (many) policy_members
members (1) ──→ (many) debit_order_transactions
debit_order_runs (1) ──→ (many) debit_order_transactions
debit_order_transactions (1) ──→ (1) payments
members (1) ──→ (many) invoices
members (1) ──→ (many) refunds
```

---

## 💡 IMPORTANT NOTES

1. **Amount Storage**: Netcash requires amounts in cents (multiply by 100)
2. **Status Flow**: pending → processing → successful/failed
3. **Retry Logic**: Max 3 retry attempts for failed payments
4. **Grace Period**: 30 days before policy lapses for non-payment
5. **Reconciliation**: Run daily to match expected vs received payments
6. **Audit Trail**: All changes logged in audit_events table
7. **Webhooks**: Netcash sends real-time payment status updates

---

This schema supports the complete lifecycle from initial application through to successful payment collection and reconciliation.

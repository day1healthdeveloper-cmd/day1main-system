# Member Administration Filters - Best Practice Reference

## Overview
The Member Administration page now includes comprehensive filtering capabilities to efficiently manage and search through all 3,581+ members in the system.

## Dashboard Statistics (Real-time)
- **Total Members**: All members in the database
- **Active**: Members with 'active' status
- **Pending Onboarding**: Members with 'pending' status
- **Suspended**: Members with 'suspended' status

## Essential Filters Implemented

### 1. Search Filter
**Purpose**: Quick text-based search across multiple fields
**Searches in**:
- Member Number
- First Name
- Last Name
- Email Address

**Usage**: Type search term and press Enter or click Search button

**IMPORTANT**: When you use the search box, the Plan filter is automatically ignored to ensure you can find any member regardless of their plan. Other filters (Status, Broker, Payment Method) still apply during search.

### 2. Status Filter
**Purpose**: Filter members by their account status
**Options**:
- All Statuses (default)
- Active
- Pending
- Suspended
- In Waiting

**Best Practice**: Use this to:
- Monitor active membership base
- Track onboarding pipeline (pending)
- Identify suspended accounts requiring attention
- Review members in waiting period

### 3. Broker Filter
**Purpose**: View members by their assigned broker
**Options**: Dynamically loaded from brokers table
- All Brokers (default)
- Individual broker codes with names (e.g., "PAR - Parabellum")

**Best Practice**: Use this to:
- Review broker performance
- Audit broker-specific member portfolios
- Reconcile broker commissions
- Track broker acquisition channels

### 4. Plan Filter
**Purpose**: Filter members by their insurance plan
**Options**: Dynamically loaded from unique plan names in members table
- All Plans (default)
- DAY1 VALUE PLUS PLAN
- DAY1 EXECUTIVE PLAN
- SENIOR COMPREHENSIVE PLAN
- And all other plan variants

**Best Practice**: Use this to:
- Analyze plan distribution
- Target specific plan members for communications
- Review plan-specific claims patterns
- Manage plan migrations

### 5. Payment Method Filter
**Purpose**: Filter by how members pay their premiums
**Options**:
- All Payment Methods (default)
- A - MAG TAPE (Debit order)
- B - BANK CASH (Manual payment)

**Best Practice**: Use this to:
- Identify payment collection issues
- Monitor debit order success rates
- Track manual payment members
- Reconcile payment batches

### 6. KYC Status Filter
**Purpose**: Filter by Know Your Customer verification status
**Options**:
- All KYC Statuses (default)
- Verified
- Pending
- Failed

**Best Practice**: Use this to:
- Track KYC compliance
- Identify members requiring verification
- Monitor failed KYC cases
- Ensure regulatory compliance

## Member List Display

### Columns Shown:
1. **Member Number** - Unique identifier with join date
2. **Name** - Full name with ID number
3. **Contact** - Email and phone
4. **Broker** - Broker code and name
5. **Plan** - Insurance plan name
6. **Premium** - Monthly premium amount
7. **Payment** - Payment method
8. **Status** - Account status badge
9. **Actions** - View details button

## Filter Combinations (Best Practices)

### Common Use Cases:

1. **Active VALUE PLUS Members**
   - Status: Active
   - Plan: DAY1 VALUE PLUS PLAN
   - Use: Marketing campaigns, plan-specific communications

2. **Suspended Members by Broker**
   - Status: Suspended
   - Broker: Select specific broker
   - Use: Broker performance review, reactivation campaigns

3. **Pending KYC Members**
   - Status: Active
   - KYC Status: Pending
   - Use: Compliance monitoring, follow-up actions

4. **Manual Payment Members**
   - Payment Method: B - BANK CASH
   - Status: Active
   - Use: Payment collection, migration to debit order

5. **Broker-Specific Plan Distribution**
   - Broker: Select broker
   - Plan: Select plan
   - Use: Broker product mix analysis

## Performance Notes

- All filters work server-side for optimal performance
- Real-time statistics update based on actual database counts
- Filter options are dynamically loaded from database
- Search is case-insensitive and uses partial matching
- Multiple filters can be combined for precise results

## Export Functionality

**Export to CSV** button available to export filtered results for:
- Reporting
- Data analysis
- External processing
- Backup purposes

## API Endpoint

**Endpoint**: `/api/admin/members`
**Method**: GET
**Query Parameters**:
- `status` - Filter by status
- `broker` - Filter by broker code
- `plan` - Filter by plan name
- `payment_method` - Filter by payment method
- `search` - Search term

**Response includes**:
- Filtered members array
- Real-time statistics
- Available filter options
- Total count

---

**Last Updated**: February 27, 2026
**Total Members**: 3,581
**Active Filters**: 6 essential filters
**Status**: Production Ready

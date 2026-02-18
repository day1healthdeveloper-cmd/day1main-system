# Marketing Portal - Standalone Application

## Overview
The Marketing Portal is a **separate standalone application** within Day1Main for marketing managers to manage leads, campaigns, and referrals.

## Access

### Login Page
**URL:** http://localhost:3001/marketing/login

### Credentials
```
Email: marketing@day1main.com
Password: marketing123
Role: Marketing Manager
```

## Features

### 1. Dashboard (`/marketing/dashboard`)
- Overview statistics (leads, campaigns, conversion rate, referrals)
- Quick actions (new lead, new campaign, analytics, referrals)
- Recent leads list
- Campaign performance metrics

### 2. Leads Management (`/marketing/leads`)
- Lead capture from multiple sources (web, phone, email, referral, broker)
- Lead assignment to users
- Lead status tracking (new, contacted, qualified, converted, lost)
- Lead conversion to policies
- Source attribution

### 3. Campaigns (`/marketing/campaigns`)
- Campaign creation and management
- Message sending (email, SMS, WhatsApp)
- POPIA-compliant consent verification
- Opt-out processing
- Campaign statistics (sent, delivered, opened, clicked)

### 4. Referrals (`/marketing/referrals`)
- Referral code generation
- Conversion tracking
- Reward calculation (R100 per successful referral)
- Referral statistics

### 5. Analytics (`/marketing/analytics`)
- Performance metrics
- Conversion funnels
- Campaign ROI
- Lead source analysis

## Backend API Endpoints

### Leads (11 endpoints)
- `POST /api/v1/marketing/leads` - Capture lead
- `GET /api/v1/marketing/leads/:leadId` - Get lead
- `GET /api/v1/marketing/leads/status/:status` - Get leads by status
- `GET /api/v1/marketing/leads/assigned/:userId` - Get assigned leads
- `PUT /api/v1/marketing/leads/:leadId/assign` - Assign lead
- `PUT /api/v1/marketing/leads/:leadId/convert` - Convert lead
- `PUT /api/v1/marketing/leads/:leadId/status` - Update status
- `GET /api/v1/marketing/leads/statistics` - Get statistics
- `GET /api/v1/marketing/leads/source/:source` - Get leads by source
- `GET /api/v1/marketing/leads/source/:source/statistics` - Source stats
- `GET /api/v1/marketing/leads/member/:memberId` - Get member's lead

### Campaigns (10 endpoints)
- `POST /api/v1/marketing/campaigns` - Create campaign
- `GET /api/v1/marketing/campaigns/:campaignId` - Get campaign
- `GET /api/v1/marketing/campaigns` - Get all campaigns
- `GET /api/v1/marketing/campaigns/status/:status` - Get by status
- `PUT /api/v1/marketing/campaigns/:campaignId/status` - Update status
- `POST /api/v1/marketing/campaigns/:campaignId/send` - Send message
- `POST /api/v1/marketing/campaigns/opt-out` - Process opt-out
- `GET /api/v1/marketing/campaigns/:campaignId/messages` - Get messages
- `GET /api/v1/marketing/campaigns/:campaignId/statistics` - Get stats
- `GET /api/v1/marketing/campaigns/member/:memberId/messages` - Member messages

### Referrals (7 endpoints)
- `POST /api/v1/marketing/referrals/generate` - Generate code
- `GET /api/v1/marketing/referrals/code/:referralCode` - Get by code
- `POST /api/v1/marketing/referrals/convert` - Track conversion
- `GET /api/v1/marketing/referrals/member/:memberId` - Get referrals
- `GET /api/v1/marketing/referrals/member/:memberId/rewards` - Calculate rewards
- `GET /api/v1/marketing/referrals/statistics` - Get statistics
- `GET /api/v1/marketing/referrals/statistics/:memberId` - Member stats

## Permissions

The `marketing_manager` role has the following permissions:
- `marketing:leads:read` - Read leads
- `marketing:leads:create` - Create leads
- `marketing:leads:update` - Update leads
- `marketing:campaigns:read` - Read campaigns
- `marketing:campaigns:create` - Create campaigns
- `marketing:campaigns:update` - Update campaigns
- `marketing:referrals:read` - Read referrals
- `marketing:referrals:create` - Create referrals
- `marketing:referrals:update` - Update referrals

## Navigation

The marketing portal has its own sidebar navigation:
- 📊 Dashboard
- 👥 Leads
- 📢 Campaigns
- 🔗 Referrals
- 📈 Analytics
- 👤 Profile

## POPIA Compliance

The marketing system is fully POPIA-compliant:
- ✅ Consent verification before sending messages
- ✅ Opt-out processing with consent revocation
- ✅ Message logging for audit trail
- ✅ Marketing consent separate from processing consent

## Files Created

### Backend
- `apps/backend/scripts/seed-marketing-user.ts` - Seed script for marketing user

### Frontend
- `apps/frontend/src/app/marketing/login/page.tsx` - Marketing login page
- `apps/frontend/src/app/marketing/dashboard/page.tsx` - Marketing dashboard
- `apps/frontend/src/components/layout/sidebar-layout.tsx` - Updated with marketing navigation

## Testing

### 1. Test Marketing Login
```bash
# Navigate to marketing login
http://localhost:3001/marketing/login

# Login with:
Email: marketing@day1main.com
Password: marketing123
```

### 2. Verify Navigation
After login, you should see:
- Marketing-specific sidebar (purple theme)
- Dashboard with statistics
- Navigation to Leads, Campaigns, Referrals, Analytics

### 3. Test API Endpoints
```bash
# Get marketing user token first by logging in
# Then test endpoints:

# Get leads
curl http://localhost:3000/api/v1/marketing/leads \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get campaigns
curl http://localhost:3000/api/v1/marketing/campaigns \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get referrals
curl http://localhost:3000/api/v1/marketing/referrals/statistics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Next Steps

To complete the marketing portal, create these pages:
1. `/marketing/leads/page.tsx` - Leads management page
2. `/marketing/campaigns/page.tsx` - Campaigns management page
3. `/marketing/referrals/page.tsx` - Referrals management page
4. `/marketing/analytics/page.tsx` - Analytics dashboard

Each page should:
- Use the `SidebarLayout` component
- Fetch data from the backend API
- Display data in tables/cards
- Provide forms for creating/editing records
- Show statistics and metrics

## Design Theme

The marketing portal uses a **purple theme** to distinguish it from:
- Admin portal (blue theme)
- Member portal (default theme)
- Broker portal (teal theme)
- Finance portal (green theme)

This makes it easy to identify which portal you're in at a glance.

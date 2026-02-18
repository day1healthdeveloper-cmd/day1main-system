# Supabase Connection Guide - Day1Health

## Project Information

**Project ID**: `ldygmpaipxbokxzyzyti`  
**Project URL**: `https://ldygmpaipxbokxzyzyti.supabase.co`  
**Region**: Hosted on Supabase Cloud

---

## Connection Details

### Environment Variables

All applications (frontend, backend, apply) use these credentials:

```env
# Supabase Connection
NEXT_PUBLIC_SUPABASE_URL=https://ldygmpaipxbokxzyzyti.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDc1NjUsImV4cCI6MjA4MTEyMzU2NX0.EGtoHE5B7Zs1lmnrWrVEwtSmPyh_z8_v8Kk-tlBgtnQ
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU0NzU2NSwiZXhwIjoyMDgxMTIzNTY1fQ.swDffWzSySfDnJEDCEPx6rzDSuVUPe21EQmgV2oe_9I
```

### Where to Add These Variables

1. **Frontend**: `apps/frontend/.env.local`
2. **Backend**: `apps/backend/.env`
3. **Apply App**: `apply/.env.local`
4. **Root**: `.env.local` (if needed)

---

## Verification Steps

### Quick Test (Recommended)
```bash
cd supabase
node test-connection.js
```

This will:
- ✅ Test connection to Supabase
- ✅ List all available tables
- ✅ Verify contacts table is accessible
- ✅ Show current record counts

### Manual Tests

#### 1. Check Supabase CLI Version
```bash
supabase --version
```
Expected: `2.72.7` or higher

#### 2. Test Remote Connection
```bash
node -e "fetch('https://ldygmpaipxbokxzyzyti.supabase.co/rest/v1/', {headers: {'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDc1NjUsImV4cCI6MjA4MTEyMzU2NX0.EGtoHE5B7Zs1lmnrWrVEwtSmPyh_z8_v8Kk-tlBgtnQ'}}).then(r => r.json()).then(d => console.log('✅ Connected:', Object.keys(d.definitions).length, 'tables')).catch(e => console.log('❌ Error:', e.message))"
```

---

## Database Schema

### Hybrid Contact Architecture (3-Table System)

#### 1. **contacts** (Master Record)
- Single source of truth for all leads, applicants, and members
- Tracks lifecycle: `is_lead`, `is_applicant`, `is_member`, `is_rejected`
- Marketing consent and POPIA compliance
- Never deleted - preserves data for future campaigns

#### 2. **applications** (Sensitive Data)
- Linked to `contacts` via `contact_id`
- FICA/KYC documents, medical history, banking details
- Status: `submitted` → `under_review` → `approved`/`rejected`

#### 3. **members** (Active Members Only)
- Linked to both `contacts` and `applications`
- Created only after admin approval
- CMS-compliant member records

### Key Tables
- `contacts` - Master contact records
- `applications` - Application submissions
- `application_dependents` - Dependents on applications
- `members` - Active members
- `member_dependents` - Dependents on member policies
- `contact_interactions` - Marketing activity log
- `popia_audit_log` - POPIA compliance audit trail
- `landing_pages` - Marketing landing pages
- `landing_page_leads` - Leads captured from landing pages
- `landing_page_visits` - Landing page analytics
- `users` - User authentication
- `roles` - User roles
- `permissions` - System permissions
- `policies` - Insurance policies
- `claims` - Claims submissions
- `providers` - Healthcare providers
- `products` - Insurance products

---

## Running Migrations

### Apply All Migrations
```bash
cd supabase
supabase db push
```

### Create New Migration
```bash
supabase migration new migration_name
```

### Check Migration Status
```bash
supabase migration list
```

---

## Local Development (Optional)

**Note**: You're using the remote hosted Supabase instance. Local development with Docker is optional.

### Start Local Supabase (requires Docker)
```bash
supabase start
```

### Stop Local Supabase
```bash
supabase stop
```

### Reset Local Database
```bash
supabase db reset
```

---

## Troubleshooting

### Issue: "Account does not have necessary privileges"
**Solution**: You're logged into a different Supabase account. This is fine - use the remote connection instead of linking locally.

### Issue: "Docker not running"
**Solution**: You don't need Docker. The remote Supabase instance is already working.

### Issue: "Cannot find module @supabase/supabase-js"
**Solution**: Install dependencies:
```bash
cd apps/frontend
npm install @supabase/supabase-js

cd ../backend
npm install @supabase/supabase-js
```

### Issue: "Failed to fetch from Supabase"
**Solution**: Check your `.env.local` files have the correct credentials.

---

## Client Usage Examples

### Frontend (Next.js)
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Query contacts
const { data, error } = await supabase
  .from('contacts')
  .select('*')
  .eq('is_lead', true)
```

### Backend (NestJS)
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for admin operations
)

// Insert application
const { data, error } = await supabaseAdmin
  .from('applications')
  .insert({
    contact_id: contactId,
    application_number: 'APP-2026-001',
    // ... other fields
  })
```

---

## Important Notes

1. **Use Remote Instance**: This project uses the hosted Supabase instance at `https://ldygmpaipxbokxzyzyti.supabase.co`
2. **No Local Setup Required**: Docker and local Supabase are optional
3. **Service Role Key**: Only use in backend/server-side code, never expose in frontend
4. **Anon Key**: Safe to use in frontend, has Row Level Security (RLS) restrictions
5. **Migrations**: Located in `supabase/migrations/` folder
6. **POPIA Compliance**: All tables have consent tracking and audit trails

---

## Quick Reference

| What | Where |
|------|-------|
| Project URL | https://ldygmpaipxbokxzyzyti.supabase.co |
| Dashboard | https://supabase.com/dashboard/project/ldygmpaipxbokxzyzyti |
| API Docs | https://ldygmpaipxbokxzyzyti.supabase.co/rest/v1/ |
| Migrations | `supabase/migrations/` |
| Config | `supabase/config.toml` |

---

## Support

If you encounter issues:
1. Check environment variables are set correctly
2. Verify network connection to Supabase
3. Check Supabase dashboard for service status
4. Review migration files for schema changes

---

**Last Updated**: January 23, 2026  
**Verified Working**: ✅ Remote connection tested and operational

# Supabase Connection Guide - Day1Health

This project uses Supabase for authentication, database access, and storage.

## Environment Variables

Use placeholders in tracked documentation. Put real values only in local `.env.local` files or deployment secrets.

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_public_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_server_only_service_role_key
PLUS1_SUPABASE_URL=your_plus1_supabase_url
PLUS1_SUPABASE_SERVICE_ROLE_KEY=your_plus1_server_only_service_role_key
GOOGLE_APPLICATION_CREDENTIALS=path_to_service_account_json_outside_repo
```

## Security Notes

- The anon key is public but must still rely on Row Level Security.
- The service-role key is server-only and bypasses RLS. Never put it in frontend code or public docs.
- Do not commit `.env.local`, service-account JSON files, or credential fixtures.
- Rotate keys if a real key is committed or shared.

## Quick Test

```bash
cd supabase
node test-connection.js
```

## Database Overview

Core tables include:

- `contacts` - master lead/applicant/member record
- `applications` - application submissions and sensitive onboarding data
- `application_dependents` - dependants on applications
- `members` - active member records
- `member_dependents` - dependants on member policies
- `contact_interactions` - marketing activity log
- `users`, `roles`, `permissions` - staff auth and RBAC
- `policies`, `claims`, `providers`, `products` - operating data

## Migrations

Migrations live in `supabase/migrations/`.

```bash
supabase db push
supabase migration list
```

## Local Development

Local Supabase is optional. If using hosted Supabase, configure environment variables in untracked local env files.

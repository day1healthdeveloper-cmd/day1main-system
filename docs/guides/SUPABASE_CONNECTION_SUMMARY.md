# Supabase Connection Summary - Day1Health

## Status

Supabase is used as the hosted auth, database, and storage backend for this project.

## Environment Variables

Tracked documentation must use placeholders only:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_public_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_server_only_service_role_key
PLUS1_SUPABASE_URL=your_plus1_supabase_url
PLUS1_SUPABASE_SERVICE_ROLE_KEY=your_plus1_server_only_service_role_key
GOOGLE_APPLICATION_CREDENTIALS=path_to_service_account_json_outside_repo
```

Real values belong in local `.env.local` files or deployment secret stores, not in docs.

## Documentation Location

Supabase documentation and scripts live in `supabase/`.

## Quick Test

```bash
cd supabase
node test-connection.js
```

## Database Shape

Core tables:

- `contacts` - master record for leads, applicants, and members
- `applications` - application data linked to contacts
- `members` - active member records
- `application_dependents` and `member_dependents`
- `contact_interactions` and `popia_audit_log`
- `users`, `roles`, `permissions`
- `policies`, `claims`, `providers`, `products`

## Security Notes

- Never commit service-role keys.
- Never put service-role keys in frontend code.
- Keep service-account JSON files outside the repo.
- Rotate any key that was committed or shared.

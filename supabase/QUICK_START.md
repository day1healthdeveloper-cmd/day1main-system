# Supabase Quick Start

## Test Connection

```bash
cd supabase
node test-connection.js
```

## Environment Variables

Copy placeholders into your local `.env.local` files and fill real values outside git.

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_public_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_server_only_service_role_key
PLUS1_SUPABASE_URL=your_plus1_supabase_url
PLUS1_SUPABASE_SERVICE_ROLE_KEY=your_plus1_server_only_service_role_key
GOOGLE_APPLICATION_CREDENTIALS=path_to_service_account_json_outside_repo
```

## Key Tables

- `contacts` - master record for leads, applicants, and members
- `applications` - application submissions with KYC/FICA fields
- `members` - active members only
- `application_dependents` - family members on applications
- `landing_pages` - marketing landing pages
- `contact_interactions` - marketing activity log

## Code Example

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

## Safety Reminder

Use the anon key in frontend code only. Use the service-role key only on trusted server/API code or local admin scripts.

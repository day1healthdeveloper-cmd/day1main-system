# Database Operations

## CRITICAL RULE: Always Verify Database Schema

**NEVER guess or assume database structure.** When discussing or working with:
- Database tables
- Table columns
- Column types
- Row Level Security (RLS) policies
- Foreign key relationships
- Indexes
- Constraints
- Existing data

**YOU MUST use Kiro Powers to verify the actual database schema and data.**

## Using Supabase Power for Database Verification

The `supabase-hosted` power is installed and provides direct access to the Supabase database.

### Before Any Database Work

1. **Activate the power** to understand available tools:
```
action="activate", powerName="supabase-hosted"
```

2. **Use appropriate tools** to verify schema:
- List all tables
- Inspect table schema (columns, types, constraints)
- Check RLS policies
- Query existing data to understand structure
- Verify relationships between tables

3. **Never assume** - Always verify:
- ❌ "The claims table probably has a status column"
- ✅ Use Supabase power to inspect claims table schema first

### Common Verification Workflows

**Before creating API routes:**
1. Verify table exists
2. Check column names and types
3. Understand relationships (foreign keys)
4. Review RLS policies that may affect queries

**Before modifying database:**
1. Inspect current schema
2. Check for existing data
3. Verify constraints and indexes
4. Understand impact on related tables

**Before writing queries:**
1. Verify column names (exact spelling, snake_case)
2. Check data types for proper casting
3. Understand table relationships for joins
4. Review RLS policies for access control

## Database Schema Conventions

Based on verified schema patterns in this project:

**Naming**:
- Tables: `snake_case` (e.g., `member_dependants`, `claim_documents`)
- Columns: `snake_case` (e.g., `created_at`, `member_number`)
- Primary keys: `id` (UUID type)
- Foreign keys: `{table}_id` (e.g., `member_id`, `provider_id`)

**Standard Columns**:
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `created_at TIMESTAMP DEFAULT now()`
- `updated_at TIMESTAMP`
- `is_active BOOLEAN DEFAULT true`

**Common Patterns**:
- Soft deletes via `is_active` or `deleted_at`
- Audit trails with `created_by`, `updated_by` (UUID references to users)
- JSONB columns for flexible data (e.g., `ocr_data`, `metadata`)

## Supabase Client Usage

**Client-side queries** (`src/lib/supabase.ts`):
- Use in React components
- Respects RLS policies
- Session-based authentication

**Server-side queries** (`src/lib/supabase-server.ts`):
- Use in API routes
- May bypass RLS with service role (use carefully)
- Better for admin operations

## RLS Policy Verification

Before writing queries that may be affected by RLS:
1. Use Supabase power to check RLS policies on the table
2. Understand which roles have access
3. Verify if service role is needed
4. Test with appropriate user context

## Data Migration Safety

Before running migrations or schema changes:
1. Verify current schema state
2. Check for existing data that may be affected
3. Plan for data preservation
4. Test in development environment first
5. Use transactions for multi-step changes

## Example: Correct Workflow

**Scenario**: Need to create API route for claims

**Wrong approach** ❌:
```typescript
// Assuming claims table structure
const { data } = await supabase
  .from('claims')
  .select('status, amount, member_id') // Guessing column names
```

**Correct approach** ✅:
```typescript
// 1. First, activate supabase-hosted power
// 2. Inspect claims table schema
// 3. Verify exact column names and types
// 4. Check RLS policies
// 5. Then write query with verified schema

const { data } = await supabase
  .from('claims')
  .select('claim_status, claimed_amount, member_id') // Verified names
```

## This Rule Applies To

- All database queries
- Schema modifications
- API route development
- Data migrations
- RLS policy discussions
- Foreign key relationships
- Index optimization
- Performance tuning

## Why This Matters

1. **Accuracy**: Database schema is the source of truth
2. **Avoid errors**: Wrong column names cause runtime failures
3. **RLS compliance**: Policies affect query results
4. **Data integrity**: Understanding constraints prevents violations
5. **Performance**: Knowing indexes helps optimize queries

## Enforcement

This rule applies to:
- All AI assistants working on this project
- All new chat sessions
- All sub-agents
- All database-related tasks

**No exceptions.** Always verify with Kiro Powers before making database assumptions.

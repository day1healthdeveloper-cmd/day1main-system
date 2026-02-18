# Supabase Folder Structure

```
supabase/
├── README.md                    # Complete connection guide and documentation
├── config.toml                  # Supabase project configuration
├── test-connection.js           # Quick connection test script
├── .gitignore                   # Git ignore rules for local files
└── migrations/                  # Database migration files
    ├── .gitkeep
    ├── 20260122_hybrid_contacts.sql              # Hybrid contact database schema
    └── 20260123_add_consent_fields_to_applications.sql  # POPIA consent fields
```

## File Descriptions

### README.md
Complete guide for connecting to Supabase including:
- Project credentials
- Environment variable setup
- Verification steps
- Database schema overview
- Troubleshooting guide
- Code examples

### config.toml
Supabase CLI configuration file containing:
- Project ID
- API ports
- Database settings
- Auth configuration
- Storage settings

### test-connection.js
Quick test script to verify Supabase connection:
```bash
node test-connection.js
```
Shows:
- Connection status
- Available tables (categorized)
- Record counts
- Query test results

### migrations/
Database migration files that define the schema:
- **20260122_hybrid_contacts.sql**: Main schema with 3-table hybrid system
- **20260123_add_consent_fields_to_applications.sql**: POPIA consent fields

## Quick Start

1. **Test Connection**
   ```bash
   cd supabase
   node test-connection.js
   ```

2. **Read Documentation**
   ```bash
   # Open README.md for complete guide
   ```

3. **Apply Migrations** (if needed)
   ```bash
   supabase db push
   ```

## What's NOT Here (Intentionally)

- `.temp/` - Temporary CLI files (gitignored)
- `volumes/` - Local Docker data (not needed, using remote)
- `.branches/` - Branch management (not needed)
- `.env` - Environment variables (stored in app folders)

## Remote vs Local

This project uses **remote Supabase** (hosted):
- ✅ No Docker required
- ✅ No local setup needed
- ✅ Always accessible
- ✅ Shared across team

Local Supabase (optional):
- ❌ Requires Docker Desktop
- ❌ Additional setup
- ❌ Only for testing migrations

## For Other Agents

When working with this project:

1. **Read README.md first** - Has all connection details
2. **Run test-connection.js** - Verify everything works
3. **Check migrations/** - See current database schema
4. **Use remote instance** - No local setup needed

## Support

If you need help:
1. Check README.md troubleshooting section
2. Run test-connection.js to diagnose issues
3. Verify environment variables in app folders
4. Check Supabase dashboard: https://supabase.com/dashboard/project/ldygmpaipxbokxzyzyti

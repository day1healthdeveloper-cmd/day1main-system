# Supabase Quick Start - 30 Second Guide

## ✅ Connection Status
**Project**: ldygmpaipxbokxzyzyti  
**URL**: https://ldygmpaipxbokxzyzyti.supabase.co  
**Status**: ✅ Connected and Working

---

## 🚀 Test Connection (10 seconds)
```bash
cd supabase
node test-connection.js
```

---

## 📋 Environment Variables

Copy these to your `.env.local` files:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ldygmpaipxbokxzyzyti.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDc1NjUsImV4cCI6MjA4MTEyMzU2NX0.EGtoHE5B7Zs1lmnrWrVEwtSmPyh_z8_v8Kk-tlBgtnQ
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkeWdtcGFpcHhib2t4enl6eXRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU0NzU2NSwiZXhwIjoyMDgxMTIzNTY1fQ.swDffWzSySfDnJEDCEPx6rzDSuVUPe21EQmgV2oe_9I
```

---

## 📊 Key Tables

**Core (3-Table Hybrid System)**
- `contacts` - Master record (leads, applicants, members)
- `applications` - Application submissions with FICA/KYC
- `members` - Active members only

**Supporting**
- `application_dependents` - Family members on applications
- `landing_pages` - Marketing landing pages
- `landing_page_leads` - Captured leads
- `contact_interactions` - Marketing activity log

---

## 💻 Code Example

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Fetch leads
const { data } = await supabase
  .from('contacts')
  .select('*')
  .eq('is_lead', true)
```

---

## 📚 Full Documentation

- **README.md** - Complete connection guide
- **FOLDER_STRUCTURE.md** - Folder organization
- **test-connection.js** - Connection test script

---

## 🆘 Troubleshooting

**Connection failed?**
1. Run `node test-connection.js`
2. Check environment variables
3. Verify internet connection

**Need more help?**
- Read `README.md` for detailed guide
- Check Supabase dashboard: https://supabase.com/dashboard/project/ldygmpaipxbokxzyzyti

---

**That's it! You're ready to use Supabase.** 🎉

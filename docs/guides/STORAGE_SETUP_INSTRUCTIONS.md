# Supabase Storage Setup Instructions

## Issue
Storage bucket exists but RLS (Row Level Security) policies are blocking uploads.

## Quick Fix (Manual - 2 minutes)

### Option 1: Disable RLS (Easiest for Development)
1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/ldygmpaipxbokxzyzyti
2. Click **Storage** in left sidebar
3. Click on **applications** bucket
4. Click **Policies** tab
5. Click **New Policy**
6. Select **"For full customization"**
7. Policy name: `Allow all operations`
8. Target roles: `public`
9. Policy definition: `true` (allows everything)
10. Check all operations: SELECT, INSERT, UPDATE, DELETE
11. Click **Save**

### Option 2: Run SQL Policies (Recommended for Production)
1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/ldygmpaipxbokxzyzyti
2. Click **SQL Editor** in left sidebar
3. Click **New Query**
4. Copy and paste the contents of `setup-storage-policies.sql`
5. Click **Run**
6. Verify 4 policies were created

## Verification

After setting up policies, run:
```bash
node test-storage-upload.js
```

Expected output:
```
✅ Upload successful!
✅ File is accessible!
✅ STORAGE UPLOAD TEST PASSED
```

## What This Fixes

Once policies are set up:
- ✅ Voice recordings will upload to storage
- ✅ Digital signatures will upload to storage
- ✅ Documents will upload to storage
- ✅ Files will be accessible via public URLs
- ✅ Admin panel will display voice/signature correctly

## Current Status

- ✅ Storage bucket created
- ✅ Bucket is public
- ✅ MIME type restrictions removed
- ⚠️  RLS policies need to be added (manual step required)
- ✅ Frontend code updated and restarted
- ✅ Storage utility functions ready

## After Setup

Test the complete flow:
1. Go to http://localhost:3001/apply
2. Complete all 6 steps
3. On Step 6:
   - Record voice acceptance
   - Draw and save signature
   - Watch browser console for upload logs
4. Submit application
5. Check database for permanent storage URLs
6. View in admin panel to verify playback/display

---

**Next Action:** Set up storage policies using Option 1 or Option 2 above

# Voice Recording & Signature Testing Checklist

## ✅ Setup Complete

- ✅ Supabase Storage bucket created
- ✅ Storage policies configured (SELECT, INSERT, UPDATE, DELETE)
- ✅ MIME type restrictions removed
- ✅ Upload test passed successfully
- ✅ Frontend server restarted with new code
- ✅ Storage utility functions implemented

## 🧪 Testing Instructions

### Test 1: Voice Recording Upload

1. **Navigate to Application:**
   - Go to http://localhost:3001/apply
   - Complete Steps 1-5 (or use existing data)
   - Navigate to Step 6 (Review & Submit)

2. **Record Voice:**
   - Click "🎤 Start Recording" button
   - Browser will request microphone permission - click "Allow"
   - Speak clearly: "I, [Your Name], accept the terms and conditions of Day1Health"
   - Click "⏹ Stop Recording"

3. **Verify Upload:**
   - Watch for "⏳ Uploading to storage..." message
   - Should change to "✓ Voice recorded" within 2-3 seconds
   - Open browser console (F12) and check for:
     - Upload success message
     - URL starting with `https://ldygmpaipxbokxzyzyti.supabase.co/storage/v1/object/public/applications/voice/`

4. **Test Playback:**
   - Click "🔊 Listen" button
   - Voice recording should play back clearly
   - Duration should show (not 0:00 / 0:00)

5. **Test Re-record:**
   - Click "🗑 Delete" button
   - Record again to verify it works multiple times

### Test 2: Digital Signature Upload

1. **Draw Signature:**
   - On Step 6, scroll to "Digital Signature" section
   - Draw your signature using mouse or finger
   - Make sure it's not empty

2. **Save Signature:**
   - Click "Save Signature" button
   - Watch for "⏳ Uploading..." message
   - Should change to "✓ Signature saved" within 1-2 seconds

3. **Verify Upload:**
   - Open browser console (F12) and check for:
     - Upload success message
     - URL starting with `https://ldygmpaipxbokxzyzyti.supabase.co/storage/v1/object/public/applications/signatures/`

4. **Test Clear:**
   - Click "Clear" button
   - Draw and save again to verify it works multiple times

### Test 3: Complete Application Submission

1. **Complete All Requirements:**
   - ✅ Voice recording saved
   - ✅ Signature saved
   - ✅ Terms checkbox checked
   - ✅ Marketing consent (optional)

2. **Submit Application:**
   - Click "✓ Submit Application" button
   - Wait for submission to complete
   - Should redirect to success page

3. **Verify in Database:**
   ```bash
   node check-applications.js
   ```
   - Check the latest application
   - Verify `voice_recording_url` is a full Supabase Storage URL
   - Verify `signature_url` is a full Supabase Storage URL

### Test 4: Admin Panel Verification

1. **Login as Admin:**
   - Go to http://localhost:3001/login
   - Email: admin@day1main.com
   - Password: admin123

2. **View Application:**
   - Navigate to Admin → Member Applications
   - Click "View Details" on the test application

3. **Verify Voice Recording:**
   - Voice player should show duration (not 0:00 / 0:00)
   - Click play button
   - Audio should play clearly

4. **Verify Signature:**
   - Signature image should display
   - Should be clear and readable
   - Should match what was drawn

## 📊 Expected Results

### Voice Recording:
- ✅ Records audio successfully
- ✅ Uploads to Supabase Storage
- ✅ URL format: `https://ldygmpaipxbokxzyzyti.supabase.co/storage/v1/object/public/applications/voice/TEMP-1234567890.webm`
- ✅ Playback works in application
- ✅ Playback works in admin panel
- ✅ Shows duration (e.g., "0:15 / 0:15")

### Digital Signature:
- ✅ Captures signature on canvas
- ✅ Uploads to Supabase Storage
- ✅ URL format: `https://ldygmpaipxbokxzyzyti.supabase.co/storage/v1/object/public/applications/signatures/TEMP-1234567890.png`
- ✅ Displays in application
- ✅ Displays in admin panel
- ✅ High quality PNG image

## 🐛 Troubleshooting

### Voice Recording Issues:

**Problem:** Microphone permission denied
- **Solution:** Check browser settings → Site permissions → Microphone

**Problem:** "Uploading..." never completes
- **Solution:** Check browser console for errors
- Verify storage policies are active
- Run: `node test-storage-upload.js`

**Problem:** Voice shows 0:00 / 0:00 in admin
- **Solution:** This means blob URL was saved instead of storage URL
- Check browser console during recording
- Verify upload completed before submission

### Signature Issues:

**Problem:** "Uploading..." never completes
- **Solution:** Check browser console for errors
- Verify storage policies are active
- Run: `node test-storage-upload.js`

**Problem:** Signature not displaying in admin
- **Solution:** Check if URL is a data URL (starts with `data:image/png`)
- Should be storage URL (starts with `https://ldygmpaipxbokxzyzyti.supabase.co`)

### General Issues:

**Problem:** Upload fails with 403 error
- **Solution:** Storage policies not set up correctly
- Go to Supabase Dashboard → Storage → applications → Policies
- Verify 4 policies exist for public role

**Problem:** Upload fails with 415 error
- **Solution:** MIME type not allowed
- Run: `node update-storage-bucket.js`

## ✅ Success Criteria

All of these should be true:
- [ ] Voice recording uploads successfully
- [ ] Voice URL is permanent storage URL (not blob:)
- [ ] Voice plays back in application
- [ ] Voice plays back in admin panel
- [ ] Signature uploads successfully
- [ ] Signature URL is permanent storage URL (not data:)
- [ ] Signature displays in application
- [ ] Signature displays in admin panel
- [ ] Application submits successfully
- [ ] Database contains permanent URLs
- [ ] Files are accessible via public URLs

---

**Status:** ✅ Ready for testing  
**Frontend:** Running on http://localhost:3001  
**Backend:** Running on http://localhost:3000  
**Storage:** Configured and tested

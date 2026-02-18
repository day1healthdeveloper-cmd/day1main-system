-- Supabase Storage Policies for Applications Bucket
-- Run this in Supabase SQL Editor

-- 1. Allow public uploads to applications bucket
CREATE POLICY "Allow public uploads"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'applications');

-- 2. Allow public reads from applications bucket
CREATE POLICY "Allow public reads"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'applications');

-- 3. Allow public updates to applications bucket
CREATE POLICY "Allow public updates"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'applications');

-- 4. Allow public deletes from applications bucket
CREATE POLICY "Allow public deletes"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'applications');

-- Verify policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

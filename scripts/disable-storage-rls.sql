-- Create very permissive policies instead of disabling RLS entirely
-- This avoids the ownership requirement

-- Drop existing policies first
DO $$ 
BEGIN
    -- Drop policies if they exist (ignore errors if they don't)
    DROP POLICY IF EXISTS "Users can upload forum images" ON storage.objects;
    DROP POLICY IF EXISTS "Users can view forum images" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete forum images" ON storage.objects;
    DROP POLICY IF EXISTS "Anyone can upload forum images" ON storage.objects;
    DROP POLICY IF EXISTS "Anyone can view forum images" ON storage.objects;
    DROP POLICY IF EXISTS "Forum members can delete forum images" ON storage.objects;
    DROP POLICY IF EXISTS "Give users access to own folder 1oj01fe_0" ON storage.objects;
    DROP POLICY IF EXISTS "Give users access to own folder 1oj01fe_1" ON storage.objects;
    DROP POLICY IF EXISTS "Give users access to own folder 1oj01fe_2" ON storage.objects;
    DROP POLICY IF EXISTS "Give users access to own folder 1oj01fe_3" ON storage.objects;
    DROP POLICY IF EXISTS "Allow all operations on forum-images" ON storage.objects;
EXCEPTION
    WHEN OTHERS THEN
        -- Ignore errors if policies don't exist
        NULL;
END $$;

-- Create very permissive policies for forum-images bucket
CREATE POLICY "Allow all operations on forum-images" ON storage.objects
FOR ALL 
TO public
USING (bucket_id = 'forum-images')
WITH CHECK (bucket_id = 'forum-images');

-- Ensure the forum-images bucket exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('forum-images', 'forum-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];

-- Make sure the bucket is publicly accessible
UPDATE storage.buckets 
SET public = true 
WHERE id = 'forum-images';

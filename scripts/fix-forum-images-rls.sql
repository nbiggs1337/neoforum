-- Drop existing policies on forum-images bucket
DROP POLICY IF EXISTS "Users can upload forum images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view forum images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete forum images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload forum images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view forum images" ON storage.objects;
DROP POLICY IF EXISTS "Forum members can delete forum images" ON storage.objects;

-- Create permissive policies for forum-images bucket
CREATE POLICY "Anyone can upload forum images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'forum-images');

CREATE POLICY "Anyone can view forum images" ON storage.objects
FOR SELECT USING (bucket_id = 'forum-images');

CREATE POLICY "Forum members can delete forum images" ON storage.objects
FOR DELETE USING (bucket_id = 'forum-images');

-- Grant permissions to authenticated and anonymous users
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.objects TO anon;
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.buckets TO anon;

-- Ensure the forum-images bucket exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('forum-images', 'forum-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

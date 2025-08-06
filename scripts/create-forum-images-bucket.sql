-- Create the forum-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'forum-images',
  'forum-images',
  true,
  10485760, -- 10MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for the forum-images bucket
CREATE POLICY "Users can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'forum-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'posts'
);

CREATE POLICY "Images are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'forum-images');

CREATE POLICY "Users can update their own images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'forum-images' 
  AND auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY "Users can delete their own images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'forum-images' 
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create storage policies for user uploads bucket (using CREATE OR REPLACE to avoid conflicts)

-- Allow authenticated users to upload their own files
CREATE OR REPLACE POLICY "Users can upload their own files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-uploads' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to view all files
CREATE OR REPLACE POLICY "Users can view all files" ON storage.objects
FOR SELECT USING (bucket_id = 'user-uploads');

-- Allow users to update their own files
CREATE OR REPLACE POLICY "Users can update their own files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'user-uploads' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own files
CREATE OR REPLACE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'user-uploads' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

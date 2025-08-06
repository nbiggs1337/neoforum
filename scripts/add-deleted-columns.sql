-- Add is_deleted and deleted_at columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Create index for better performance on deleted users queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_deleted ON profiles(is_deleted);

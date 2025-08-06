-- Add deleted columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Create index for better performance when filtering deleted users
CREATE INDEX IF NOT EXISTS idx_profiles_is_deleted ON profiles(is_deleted);

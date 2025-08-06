-- Add ban-related columns to profiles table if they don't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS banned_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ban_reason TEXT;

-- Update existing users to have is_banned = false if null
UPDATE profiles SET is_banned = FALSE WHERE is_banned IS NULL;

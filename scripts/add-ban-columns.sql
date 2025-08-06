-- Add ban-related columns to profiles table if they don't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS banned_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS ban_reason TEXT;

-- Create index for banned users lookup
CREATE INDEX IF NOT EXISTS idx_profiles_is_banned ON profiles(is_banned);

-- Update existing users to have is_banned = false if null
UPDATE profiles SET is_banned = FALSE WHERE is_banned IS NULL;

-- Add ban-related columns to profiles table if they don't exist
DO $$ 
BEGIN
    -- Add is_banned column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'is_banned') THEN
        ALTER TABLE profiles ADD COLUMN is_banned BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add banned_until column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'banned_until') THEN
        ALTER TABLE profiles ADD COLUMN banned_until TIMESTAMPTZ;
    END IF;
    
    -- Add ban_reason column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'ban_reason') THEN
        ALTER TABLE profiles ADD COLUMN ban_reason TEXT;
    END IF;
END $$;

-- Create index for banned users lookup
CREATE INDEX IF NOT EXISTS idx_profiles_is_banned ON profiles(is_banned) WHERE is_banned = TRUE;

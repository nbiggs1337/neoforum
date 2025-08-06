-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON profiles;

-- Create comprehensive RLS policies for profiles table
CREATE POLICY "Enable read access for own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable insert for service role" ON profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- Grant necessary permissions to service role
GRANT ALL ON profiles TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

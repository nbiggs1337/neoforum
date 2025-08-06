-- Remove any existing triggers on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Remove the trigger function
DROP FUNCTION IF EXISTS handle_new_user();

-- Remove any profile creation triggers
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;
DROP FUNCTION IF EXISTS create_user_profile();

-- Check for any other triggers
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' 
AND event_object_table = 'users';

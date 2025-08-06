-- Completely disable RLS on support_messages table since support forms should be accessible to everyone
ALTER TABLE public.support_messages DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to clean up
DROP POLICY IF EXISTS "support_messages_insert_anyone" ON public.support_messages;
DROP POLICY IF EXISTS "support_messages_admin_select" ON public.support_messages;
DROP POLICY IF EXISTS "support_messages_admin_update" ON public.support_messages;
DROP POLICY IF EXISTS "support_messages_user_select" ON public.support_messages;
DROP POLICY IF EXISTS "Anyone can submit support messages" ON public.support_messages;
DROP POLICY IF EXISTS "Users can view their own support messages" ON public.support_messages;
DROP POLICY IF EXISTS "Admins can view all support messages" ON public.support_messages;
DROP POLICY IF EXISTS "Admins can update support messages" ON public.support_messages;
DROP POLICY IF EXISTS "Allow public insert" ON public.support_messages;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.support_messages;
DROP POLICY IF EXISTS "Allow anon insert" ON public.support_messages;

-- Grant full permissions to all roles
GRANT ALL ON public.support_messages TO anon;
GRANT ALL ON public.support_messages TO authenticated;
GRANT ALL ON public.support_messages TO public;

-- Ensure sequence permissions for auto-incrementing ID
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO public;

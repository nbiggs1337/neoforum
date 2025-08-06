-- First, let's check what policies exist and drop them all
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'support_messages' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.support_messages', policy_record.policyname);
    END LOOP;
END $$;

-- Disable RLS completely on support_messages table
ALTER TABLE public.support_messages DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Create a very permissive insert policy that allows anyone to insert
CREATE POLICY "support_messages_insert_anyone" ON public.support_messages
    FOR INSERT 
    TO public, anon, authenticated
    WITH CHECK (true);

-- Allow admins to select all support messages
CREATE POLICY "support_messages_admin_select" ON public.support_messages
    FOR SELECT 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Allow admins to update all support messages
CREATE POLICY "support_messages_admin_update" ON public.support_messages
    FOR UPDATE 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Allow authenticated users to view their own messages
CREATE POLICY "support_messages_user_select" ON public.support_messages
    FOR SELECT 
    TO authenticated
    USING (user_id = auth.uid());

-- Grant necessary permissions to roles
GRANT INSERT ON public.support_messages TO anon;
GRANT INSERT ON public.support_messages TO authenticated;
GRANT SELECT, UPDATE ON public.support_messages TO authenticated;

-- Completely disable RLS on support_messages table since support forms should be accessible to everyone
ALTER TABLE public.support_messages DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to clean up
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

-- Grant full permissions to all roles
GRANT ALL ON public.support_messages TO anon;
GRANT ALL ON public.support_messages TO authenticated;
GRANT ALL ON public.support_messages TO public;

-- Ensure sequence permissions for auto-incrementing ID
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO public;

-- Specifically grant permissions on the support_messages sequence if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'support_messages_id_seq') THEN
        GRANT USAGE, SELECT ON SEQUENCE public.support_messages_id_seq TO anon;
        GRANT USAGE, SELECT ON SEQUENCE public.support_messages_id_seq TO authenticated;
        GRANT USAGE, SELECT ON SEQUENCE public.support_messages_id_seq TO public;
    END IF;
END $$;

-- Ensure the table exists and has proper structure
CREATE TABLE IF NOT EXISTS public.support_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'general',
    priority VARCHAR(20) DEFAULT 'normal',
    status VARCHAR(20) DEFAULT 'open',
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Ensure the table structure is correct
ALTER TABLE public.support_messages 
  ALTER COLUMN id SET DEFAULT nextval('support_messages_id_seq'),
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now(),
  ALTER COLUMN status SET DEFAULT 'open',
  ALTER COLUMN priority SET DEFAULT 'normal';

-- Create or replace the updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_support_messages_updated_at ON public.support_messages;
CREATE TRIGGER update_support_messages_updated_at
    BEFORE UPDATE ON public.support_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

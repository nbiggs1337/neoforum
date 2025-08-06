-- Completely disable RLS on support_messages table since support forms should be accessible to everyone
BEGIN;

ALTER TABLE public.support_messages DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to clean up
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'support_messages'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(policy_record.policyname) || ' ON support_messages';
    END LOOP;
END $$;

-- Grant full permissions to all roles
GRANT ALL ON public.support_messages TO anon;
GRANT ALL ON public.support_messages TO authenticated;
GRANT ALL ON public.support_messages TO public;

-- Ensure sequence permissions for auto-incrementing ID
GRANT USAGE, SELECT ON SEQUENCE public.support_messages_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.support_messages_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.support_messages_id_seq TO public;

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
DO $$
BEGIN
    -- Check if columns exist and add them if they don't
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_messages' AND column_name = 'id') THEN
        ALTER TABLE public.support_messages ADD COLUMN id SERIAL PRIMARY KEY;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_messages' AND column_name = 'name') THEN
        ALTER TABLE public.support_messages ADD COLUMN name TEXT NOT NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_messages' AND column_name = 'email') THEN
        ALTER TABLE public.support_messages ADD COLUMN email TEXT NOT NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_messages' AND column_name = 'category') THEN
        ALTER TABLE public.support_messages ADD COLUMN category TEXT NOT NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_messages' AND column_name = 'subject') THEN
        ALTER TABLE public.support_messages ADD COLUMN subject TEXT NOT NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_messages' AND column_name = 'message') THEN
        ALTER TABLE public.support_messages ADD COLUMN message TEXT NOT NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_messages' AND column_name = 'status') THEN
        ALTER TABLE public.support_messages ADD COLUMN status TEXT DEFAULT 'open';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_messages' AND column_name = 'priority') THEN
        ALTER TABLE public.support_messages ADD COLUMN priority TEXT DEFAULT 'medium';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_messages' AND column_name = 'admin_notes') THEN
        ALTER TABLE public.support_messages ADD COLUMN admin_notes TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_messages' AND column_name = 'created_at') THEN
        ALTER TABLE public.support_messages ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_messages' AND column_name = 'updated_at') THEN
        ALTER TABLE public.support_messages ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

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

COMMIT;

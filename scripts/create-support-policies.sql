-- Enable Row Level Security on support_messages table
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can submit support messages" ON public.support_messages;
DROP POLICY IF EXISTS "Admins can view all support messages" ON public.support_messages;
DROP POLICY IF EXISTS "Admins can update support messages" ON public.support_messages;
DROP POLICY IF EXISTS "Users can view their own support messages" ON public.support_messages;

-- Allow anyone (authenticated or not) to submit support messages
CREATE POLICY "Anyone can submit support messages" ON public.support_messages
    FOR INSERT WITH CHECK (true);

-- Allow admins to view all support messages
CREATE POLICY "Admins can view all support messages" ON public.support_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- Allow admins to update support messages
CREATE POLICY "Admins can update support messages" ON public.support_messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- Allow users to view their own support messages (if they are authenticated)
CREATE POLICY "Users can view their own support messages" ON public.support_messages
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND user_id = auth.uid()
    );

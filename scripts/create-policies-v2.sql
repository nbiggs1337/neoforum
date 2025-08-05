-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
CREATE POLICY "Users can view all profiles" ON public.users
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Forums policies
DROP POLICY IF EXISTS "Anyone can view active public forums" ON public.forums;
CREATE POLICY "Anyone can view active public forums" ON public.forums
    FOR SELECT USING (status = 'active' AND (is_private = false OR owner_id = auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can create forums" ON public.forums;
CREATE POLICY "Authenticated users can create forums" ON public.forums
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = owner_id);

DROP POLICY IF EXISTS "Forum owners can update their forums" ON public.forums;
CREATE POLICY "Forum owners can update their forums" ON public.forums
    FOR UPDATE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Forum owners can delete their forums" ON public.forums;
CREATE POLICY "Forum owners can delete their forums" ON public.forums
    FOR DELETE USING (auth.uid() = owner_id);

-- Forum members policies
DROP POLICY IF EXISTS "Anyone can view forum members" ON public.forum_members;
CREATE POLICY "Anyone can view forum members" ON public.forum_members
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can join forums" ON public.forum_members;
CREATE POLICY "Authenticated users can join forums" ON public.forum_members
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can leave forums" ON public.forum_members;
CREATE POLICY "Users can leave forums" ON public.forum_members
    FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Forum owners and admins can manage members" ON public.forum_members;
CREATE POLICY "Forum owners and admins can manage members" ON public.forum_members
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.forums f 
            WHERE f.id = forum_id AND f.owner_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.forum_members fm 
            WHERE fm.forum_id = forum_members.forum_id 
            AND fm.user_id = auth.uid() 
            AND fm.role = 'admin'
        )
    );

-- Forum moderators policies
DROP POLICY IF EXISTS "Anyone can view forum moderators" ON public.forum_moderators;
CREATE POLICY "Anyone can view forum moderators" ON public.forum_moderators
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Forum owners can manage moderators" ON public.forum_moderators;
CREATE POLICY "Forum owners can manage moderators" ON public.forum_moderators
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.forums f 
            WHERE f.id = forum_id AND f.owner_id = auth.uid()
        )
    );

-- Posts policies
DROP POLICY IF EXISTS "Anyone can view published posts" ON public.posts;
CREATE POLICY "Anyone can view published posts" ON public.posts
    FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
CREATE POLICY "Authenticated users can create posts" ON public.posts
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can update their posts" ON public.posts;
CREATE POLICY "Authors can update their posts" ON public.posts
    FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors and moderators can delete posts" ON public.posts;
CREATE POLICY "Authors and moderators can delete posts" ON public.posts
    FOR DELETE USING (
        auth.uid() = author_id OR
        EXISTS (
            SELECT 1 FROM public.forums f 
            WHERE f.id = forum_id AND f.owner_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.forum_members fm 
            WHERE fm.forum_id = posts.forum_id 
            AND fm.user_id = auth.uid() 
            AND fm.role IN ('admin', 'moderator')
        )
    );

-- Post votes policies
DROP POLICY IF EXISTS "Anyone can view post votes" ON public.post_votes;
CREATE POLICY "Anyone can view post votes" ON public.post_votes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can vote" ON public.post_votes;
CREATE POLICY "Authenticated users can vote" ON public.post_votes
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their votes" ON public.post_votes;
CREATE POLICY "Users can update their votes" ON public.post_votes
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their votes" ON public.post_votes;
CREATE POLICY "Users can delete their votes" ON public.post_votes
    FOR DELETE USING (auth.uid() = user_id);

-- Reports policies
DROP POLICY IF EXISTS "Moderators can view reports" ON public.reports;
CREATE POLICY "Moderators can view reports" ON public.reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.role IN ('moderator', 'admin')
        )
    );

DROP POLICY IF EXISTS "Authenticated users can create reports" ON public.reports;
CREATE POLICY "Authenticated users can create reports" ON public.reports
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Moderators can update reports" ON public.reports;
CREATE POLICY "Moderators can update reports" ON public.reports
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.role IN ('moderator', 'admin')
        )
    );

-- User bans policies
DROP POLICY IF EXISTS "Moderators can view bans" ON public.user_bans;
CREATE POLICY "Moderators can view bans" ON public.user_bans
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.role IN ('moderator', 'admin')
        )
    );

DROP POLICY IF EXISTS "Moderators can create bans" ON public.user_bans;
CREATE POLICY "Moderators can create bans" ON public.user_bans
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.role IN ('moderator', 'admin')
        )
    );

DROP POLICY IF EXISTS "Moderators can update bans" ON public.user_bans;
CREATE POLICY "Moderators can update bans" ON public.user_bans
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.role IN ('moderator', 'admin')
        )
    );

DROP POLICY IF EXISTS "Moderators can delete bans" ON public.user_bans;
CREATE POLICY "Moderators can delete bans" ON public.user_bans
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.role IN ('moderator', 'admin')
        )
    );

-- Audit logs policies
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can create audit logs" ON public.audit_logs;
CREATE POLICY "Admins can create audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    );

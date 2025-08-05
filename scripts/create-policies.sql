-- Enable RLS on all tables
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
CREATE POLICY "Users can view all profiles" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update any user" ON public.users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Forums policies
CREATE POLICY "Anyone can view active forums" ON public.forums
    FOR SELECT USING (status = 'active' OR is_private = false);

CREATE POLICY "Authenticated users can create forums" ON public.forums
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Forum owners can update their forums" ON public.forums
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Admins can update any forum" ON public.forums
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "Forum owners can delete their forums" ON public.forums
    FOR DELETE USING (auth.uid() = owner_id);

-- Forum members policies
CREATE POLICY "Anyone can view forum members" ON public.forum_members
    FOR SELECT USING (true);

CREATE POLICY "Users can join forums" ON public.forum_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave forums" ON public.forum_members
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Forum owners can manage members" ON public.forum_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.forums 
            WHERE id = forum_id AND owner_id = auth.uid()
        )
    );

-- Forum moderators policies
CREATE POLICY "Anyone can view forum moderators" ON public.forum_moderators
    FOR SELECT USING (true);

CREATE POLICY "Forum owners can manage moderators" ON public.forum_moderators
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.forums 
            WHERE id = forum_id AND owner_id = auth.uid()
        )
    );

-- Posts policies
CREATE POLICY "Anyone can view published posts" ON public.posts
    FOR SELECT USING (status = 'published');

CREATE POLICY "Authenticated users can create posts" ON public.posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their posts" ON public.posts
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Moderators can update posts in their forums" ON public.posts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.forum_moderators fm
            JOIN public.forums f ON f.id = fm.forum_id
            WHERE fm.user_id = auth.uid() AND f.id = forum_id
        ) OR
        EXISTS (
            SELECT 1 FROM public.forums 
            WHERE id = forum_id AND owner_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "Authors can delete their posts" ON public.posts
    FOR DELETE USING (auth.uid() = author_id);

-- Post votes policies
CREATE POLICY "Anyone can view post votes" ON public.post_votes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON public.post_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their votes" ON public.post_votes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their votes" ON public.post_votes
    FOR DELETE USING (auth.uid() = user_id);

-- Reports policies
CREATE POLICY "Moderators and admins can view reports" ON public.reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        ) OR
        auth.uid() = reporter_id
    );

CREATE POLICY "Authenticated users can create reports" ON public.reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Moderators can update reports" ON public.reports
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

-- User bans policies
CREATE POLICY "Moderators can view bans" ON public.user_bans
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "Moderators can create bans" ON public.user_bans
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "Moderators can update bans" ON public.user_bans
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "Moderators can delete bans" ON public.user_bans
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

-- Audit logs policies
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can create audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

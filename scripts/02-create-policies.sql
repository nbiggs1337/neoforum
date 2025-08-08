-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Forums policies
CREATE POLICY "Anyone can view active public forums" ON forums
    FOR SELECT USING (status = 'active' AND (is_private = false OR owner_id = auth.uid()));

CREATE POLICY "Authenticated users can create forums" ON forums
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = owner_id);

CREATE POLICY "Forum owners can update their forums" ON forums
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Forum owners can delete their forums" ON forums
    FOR DELETE USING (auth.uid() = owner_id);

-- Forum members policies
CREATE POLICY "Anyone can view forum members" ON forum_members
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join forums" ON forum_members
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can leave forums" ON forum_members
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Forum owners and admins can manage members" ON forum_members
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM forums f 
            WHERE f.id = forum_id AND f.owner_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM forum_members fm 
            WHERE fm.forum_id = forum_members.forum_id 
            AND fm.user_id = auth.uid() 
            AND fm.role = 'admin'
        )
    );

-- Posts policies
CREATE POLICY "Anyone can view published posts" ON posts
    FOR SELECT USING (status = 'published' AND is_deleted = false);

CREATE POLICY "Authenticated users can create posts" ON posts
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = author_id);

CREATE POLICY "Authors can update their posts" ON posts
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors and moderators can delete posts" ON posts
    FOR DELETE USING (
        auth.uid() = author_id OR
        EXISTS (
            SELECT 1 FROM forums f 
            WHERE f.id = forum_id AND f.owner_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM forum_members fm 
            WHERE fm.forum_id = posts.forum_id 
            AND fm.user_id = auth.uid() 
            AND fm.role IN ('admin', 'moderator')
        ) OR
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'moderator')
        )
    );

-- Comments policies
CREATE POLICY "Anyone can view published comments" ON comments
    FOR SELECT USING (is_deleted = false);

CREATE POLICY "Authenticated users can create comments" ON comments
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = author_id);

CREATE POLICY "Authors can update their comments" ON comments
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors and moderators can delete comments" ON comments
    FOR DELETE USING (
        auth.uid() = author_id OR
        EXISTS (
            SELECT 1 FROM posts p 
            JOIN forums f ON f.id = p.forum_id 
            WHERE p.id = post_id AND f.owner_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM posts p 
            JOIN forum_members fm ON fm.forum_id = p.forum_id 
            WHERE p.id = post_id 
            AND fm.user_id = auth.uid() 
            AND fm.role IN ('admin', 'moderator')
        ) OR
        EXISTS (
            SELECT 1 FROM profiles pr 
            WHERE pr.id = auth.uid() AND pr.role IN ('admin', 'moderator')
        )
    );

-- Post votes policies
CREATE POLICY "Anyone can view post votes" ON post_votes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON post_votes
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their votes" ON post_votes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their votes" ON post_votes
    FOR DELETE USING (auth.uid() = user_id);

-- Comment votes policies
CREATE POLICY "Anyone can view comment votes" ON comment_votes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote on comments" ON comment_votes
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their comment votes" ON comment_votes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their comment votes" ON comment_votes
    FOR DELETE USING (auth.uid() = user_id);

-- Forum follows policies
CREATE POLICY "Users can view all follows" ON forum_follows
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own follows" ON forum_follows
    FOR ALL USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Reports policies
CREATE POLICY "Moderators and admins can view reports" ON reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'moderator')
        ) OR
        auth.uid() = reporter_id
    );

CREATE POLICY "Authenticated users can create reports" ON reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Moderators can update reports" ON reports
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'moderator')
        )
    );

-- Support messages policies
CREATE POLICY "Users can view their own support messages" ON support_messages
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "Anyone can create support messages" ON support_messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update support messages" ON support_messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'moderator')
        )
    );

-- Drop all existing tables and functions
DROP TRIGGER IF EXISTS update_forum_stats_trigger ON posts;
DROP TRIGGER IF EXISTS update_user_stats_trigger ON posts;
DROP TRIGGER IF EXISTS update_post_votes_trigger ON post_votes;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_forums_updated_at ON forums;
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;

DROP FUNCTION IF EXISTS update_forum_stats();
DROP FUNCTION IF EXISTS update_user_stats();
DROP FUNCTION IF EXISTS update_post_votes();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS increment_post_views(uuid);

DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS user_bans CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS post_votes CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS forum_members CASCADE;
DROP TABLE IF EXISTS forums CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Enable RLS
ALTER DATABASE postgres SET row_security = on;

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
    reputation INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    is_banned BOOLEAN DEFAULT FALSE,
    banned_until TIMESTAMP WITH TIME ZONE,
    ban_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forums table
CREATE TABLE forums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    subdomain VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    long_description TEXT,
    category VARCHAR(50) NOT NULL,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'suspended')),
    member_count INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    thread_count INTEGER DEFAULT 0,
    is_private BOOLEAN DEFAULT FALSE,
    rules TEXT,
    banner_url TEXT,
    icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum_members table
CREATE TABLE forum_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forum_id UUID REFERENCES forums(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(forum_id, user_id)
);

-- Create posts table
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255),
    content TEXT NOT NULL,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    forum_id UUID REFERENCES forums(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'deleted')),
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create post_votes table
CREATE TABLE post_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    vote_type INTEGER CHECK (vote_type IN (-1, 1)),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Create reports table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
    forum_id UUID REFERENCES forums(id) ON DELETE SET NULL,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    moderator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    moderator_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create user_bans table
CREATE TABLE user_bans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    forum_id UUID REFERENCES forums(id) ON DELETE CASCADE,
    banned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_forums_subdomain ON forums(subdomain);
CREATE INDEX idx_forums_category ON forums(category);
CREATE INDEX idx_forums_owner ON forums(owner_id);
CREATE INDEX idx_forum_members_forum ON forum_members(forum_id);
CREATE INDEX idx_forum_members_user ON forum_members(user_id);
CREATE INDEX idx_posts_forum ON posts(forum_id);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_parent ON posts(parent_id);
CREATE INDEX idx_posts_created ON posts(created_at);
CREATE INDEX idx_post_votes_post ON post_votes(post_id);
CREATE INDEX idx_post_votes_user ON post_votes(user_id);

-- Create functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_forum_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update forum stats when new post is created
        UPDATE forums 
        SET 
            post_count = post_count + 1,
            thread_count = CASE WHEN NEW.parent_id IS NULL THEN thread_count + 1 ELSE thread_count END,
            updated_at = NOW()
        WHERE id = NEW.forum_id;
        
        -- Update parent post comment count if this is a comment
        IF NEW.parent_id IS NOT NULL THEN
            UPDATE posts 
            SET comment_count = comment_count + 1,
                updated_at = NOW()
            WHERE id = NEW.parent_id;
        END IF;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Update forum stats when post is deleted
        UPDATE forums 
        SET 
            post_count = post_count - 1,
            thread_count = CASE WHEN OLD.parent_id IS NULL THEN thread_count - 1 ELSE thread_count END,
            updated_at = NOW()
        WHERE id = OLD.forum_id;
        
        -- Update parent post comment count if this was a comment
        IF OLD.parent_id IS NOT NULL THEN
            UPDATE posts 
            SET comment_count = comment_count - 1,
                updated_at = NOW()
            WHERE id = OLD.parent_id;
        END IF;
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE users 
        SET post_count = post_count + 1,
            updated_at = NOW()
        WHERE id = NEW.author_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE users 
        SET post_count = post_count - 1,
            updated_at = NOW()
        WHERE id = OLD.author_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_post_votes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Add vote
        IF NEW.vote_type = 1 THEN
            UPDATE posts SET upvotes = upvotes + 1, updated_at = NOW() WHERE id = NEW.post_id;
        ELSE
            UPDATE posts SET downvotes = downvotes + 1, updated_at = NOW() WHERE id = NEW.post_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Change vote
        IF OLD.vote_type = 1 AND NEW.vote_type = -1 THEN
            UPDATE posts SET upvotes = upvotes - 1, downvotes = downvotes + 1, updated_at = NOW() WHERE id = NEW.post_id;
        ELSIF OLD.vote_type = -1 AND NEW.vote_type = 1 THEN
            UPDATE posts SET upvotes = upvotes + 1, downvotes = downvotes - 1, updated_at = NOW() WHERE id = NEW.post_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Remove vote
        IF OLD.vote_type = 1 THEN
            UPDATE posts SET upvotes = upvotes - 1, updated_at = NOW() WHERE id = OLD.post_id;
        ELSE
            UPDATE posts SET downvotes = downvotes - 1, updated_at = NOW() WHERE id = OLD.post_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_post_views(post_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE posts 
    SET view_count = view_count + 1,
        updated_at = NOW()
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forums_updated_at BEFORE UPDATE ON forums
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_stats_trigger
    AFTER INSERT OR DELETE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_forum_stats();

CREATE TRIGGER update_user_stats_trigger
    AFTER INSERT OR DELETE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_user_stats();

CREATE TRIGGER update_post_votes_trigger
    AFTER INSERT OR UPDATE OR DELETE ON post_votes
    FOR EACH ROW EXECUTE FUNCTION update_post_votes();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users policies
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Forums policies
CREATE POLICY "Anyone can view active public forums" ON forums FOR SELECT USING (status = 'active' AND is_private = false);
CREATE POLICY "Forum owners can update their forums" ON forums FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Authenticated users can create forums" ON forums FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Forum members policies
CREATE POLICY "Anyone can view forum members" ON forum_members FOR SELECT USING (true);
CREATE POLICY "Users can join forums" ON forum_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave forums" ON forum_members FOR DELETE USING (auth.uid() = user_id);

-- Posts policies
CREATE POLICY "Anyone can view published posts" ON posts FOR SELECT USING (status = 'published');
CREATE POLICY "Authenticated users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update their posts" ON posts FOR UPDATE USING (auth.uid() = author_id);

-- Post votes policies
CREATE POLICY "Anyone can view votes" ON post_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON post_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their votes" ON post_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their votes" ON post_votes FOR DELETE USING (auth.uid() = user_id);

-- Reports policies
CREATE POLICY "Users can view their own reports" ON reports FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Authenticated users can create reports" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- User bans policies
CREATE POLICY "Users can view their own bans" ON user_bans FOR SELECT USING (auth.uid() = user_id);

-- Audit logs policies
CREATE POLICY "Only admins can view audit logs" ON audit_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

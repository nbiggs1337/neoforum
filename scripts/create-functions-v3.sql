-- Function to increment forum member count
CREATE OR REPLACE FUNCTION increment_forum_members(forum_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.forums 
    SET member_count = member_count + 1,
        updated_at = NOW()
    WHERE id = forum_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement forum member count
CREATE OR REPLACE FUNCTION decrement_forum_members(forum_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.forums 
    SET member_count = GREATEST(member_count - 1, 0),
        updated_at = NOW()
    WHERE id = forum_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment post views
CREATE OR REPLACE FUNCTION increment_post_views(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.posts 
    SET view_count = view_count + 1,
        updated_at = NOW()
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update post vote counts
CREATE OR REPLACE FUNCTION update_post_votes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.vote_type = 1 THEN
            UPDATE public.posts SET upvotes = upvotes + 1 WHERE id = NEW.post_id;
        ELSE
            UPDATE public.posts SET downvotes = downvotes + 1 WHERE id = NEW.post_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Remove old vote
        IF OLD.vote_type = 1 THEN
            UPDATE public.posts SET upvotes = upvotes - 1 WHERE id = OLD.post_id;
        ELSE
            UPDATE public.posts SET downvotes = downvotes - 1 WHERE id = OLD.post_id;
        END IF;
        -- Add new vote
        IF NEW.vote_type = 1 THEN
            UPDATE public.posts SET upvotes = upvotes + 1 WHERE id = NEW.post_id;
        ELSE
            UPDATE public.posts SET downvotes = downvotes + 1 WHERE id = NEW.post_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.vote_type = 1 THEN
            UPDATE public.posts SET upvotes = upvotes - 1 WHERE id = OLD.post_id;
        ELSE
            UPDATE public.posts SET downvotes = downvotes - 1 WHERE id = OLD.post_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update comment counts
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.parent_id IS NOT NULL THEN
        UPDATE public.posts 
        SET comment_count = comment_count + 1,
            updated_at = NOW()
        WHERE id = NEW.parent_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' AND OLD.parent_id IS NOT NULL THEN
        UPDATE public.posts 
        SET comment_count = GREATEST(comment_count - 1, 0),
            updated_at = NOW()
        WHERE id = OLD.parent_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update forum post counts
CREATE OR REPLACE FUNCTION update_forum_post_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.parent_id IS NULL THEN
            -- It's a thread
            UPDATE public.forums 
            SET thread_count = thread_count + 1,
                post_count = post_count + 1,
                updated_at = NOW()
            WHERE id = NEW.forum_id;
        ELSE
            -- It's a comment
            UPDATE public.forums 
            SET post_count = post_count + 1,
                updated_at = NOW()
            WHERE id = NEW.forum_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.parent_id IS NULL THEN
            -- It's a thread
            UPDATE public.forums 
            SET thread_count = GREATEST(thread_count - 1, 0),
                post_count = GREATEST(post_count - 1, 0),
                updated_at = NOW()
            WHERE id = OLD.forum_id;
        ELSE
            -- It's a comment
            UPDATE public.forums 
            SET post_count = GREATEST(post_count - 1, 0),
                updated_at = NOW()
            WHERE id = OLD.forum_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to get trending forums
CREATE OR REPLACE FUNCTION get_trending_forums(limit_count INTEGER DEFAULT 5)
RETURNS TABLE(
    id UUID,
    name VARCHAR(100),
    subdomain VARCHAR(50),
    description TEXT,
    category VARCHAR(50),
    member_count INTEGER,
    post_count INTEGER,
    thread_count INTEGER,
    created_at TIMESTAMPTZ,
    trend_score NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id,
        f.name,
        f.subdomain,
        f.description,
        f.category,
        f.member_count,
        f.post_count,
        f.thread_count,
        f.created_at,
        -- Simple trending algorithm based on recent activity and member count
        (f.member_count * 0.3 + f.post_count * 0.5 + f.thread_count * 0.2)::NUMERIC as trend_score
    FROM public.forums f
    WHERE f.status = 'active' AND f.is_private = false
    ORDER BY trend_score DESC, f.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_post_votes ON public.post_votes;
CREATE TRIGGER trigger_update_post_votes
    AFTER INSERT OR UPDATE OR DELETE ON public.post_votes
    FOR EACH ROW EXECUTE FUNCTION update_post_votes();

DROP TRIGGER IF EXISTS trigger_update_comment_count ON public.posts;
CREATE TRIGGER trigger_update_comment_count
    AFTER INSERT OR DELETE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION update_comment_count();

DROP TRIGGER IF EXISTS trigger_update_forum_post_count ON public.posts;
CREATE TRIGGER trigger_update_forum_post_count
    AFTER INSERT OR DELETE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION update_forum_post_count();

-- Function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at triggers for all tables
DROP TRIGGER IF EXISTS trigger_users_updated_at ON public.users;
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_forums_updated_at ON public.forums;
CREATE TRIGGER trigger_forums_updated_at
    BEFORE UPDATE ON public.forums
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_posts_updated_at ON public.posts;
CREATE TRIGGER trigger_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

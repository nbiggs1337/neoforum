-- Function to increment forum member count
CREATE OR REPLACE FUNCTION increment_forum_members(forum_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE forums 
    SET member_count = member_count + 1,
        updated_at = NOW()
    WHERE id = forum_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement forum member count
CREATE OR REPLACE FUNCTION decrement_forum_members(forum_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE forums 
    SET member_count = GREATEST(member_count - 1, 0),
        updated_at = NOW()
    WHERE id = forum_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update post vote counts
CREATE OR REPLACE FUNCTION update_post_votes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.vote_type = 'upvote' THEN
            UPDATE posts SET upvotes = upvotes + 1 WHERE id = NEW.post_id;
        ELSE
            UPDATE posts SET downvotes = downvotes + 1 WHERE id = NEW.post_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Remove old vote
        IF OLD.vote_type = 'upvote' THEN
            UPDATE posts SET upvotes = upvotes - 1 WHERE id = OLD.post_id;
        ELSE
            UPDATE posts SET downvotes = downvotes - 1 WHERE id = OLD.post_id;
        END IF;
        -- Add new vote
        IF NEW.vote_type = 'upvote' THEN
            UPDATE posts SET upvotes = upvotes + 1 WHERE id = NEW.post_id;
        ELSE
            UPDATE posts SET downvotes = downvotes + 1 WHERE id = NEW.post_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.vote_type = 'upvote' THEN
            UPDATE posts SET upvotes = upvotes - 1 WHERE id = OLD.post_id;
        ELSE
            UPDATE posts SET downvotes = downvotes - 1 WHERE id = OLD.post_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update comment vote counts
CREATE OR REPLACE FUNCTION update_comment_votes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.vote_type = 'upvote' THEN
            UPDATE comments SET upvotes = upvotes + 1 WHERE id = NEW.comment_id;
        ELSE
            UPDATE comments SET downvotes = downvotes + 1 WHERE id = NEW.comment_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Remove old vote
        IF OLD.vote_type = 'upvote' THEN
            UPDATE comments SET upvotes = upvotes - 1 WHERE id = OLD.comment_id;
        ELSE
            UPDATE comments SET downvotes = downvotes - 1 WHERE id = OLD.comment_id;
        END IF;
        -- Add new vote
        IF NEW.vote_type = 'upvote' THEN
            UPDATE comments SET upvotes = upvotes + 1 WHERE id = NEW.comment_id;
        ELSE
            UPDATE comments SET downvotes = downvotes + 1 WHERE id = NEW.comment_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.vote_type = 'upvote' THEN
            UPDATE comments SET upvotes = upvotes - 1 WHERE id = OLD.comment_id;
        ELSE
            UPDATE comments SET downvotes = downvotes - 1 WHERE id = OLD.comment_id;
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
    IF TG_OP = 'INSERT' THEN
        UPDATE posts 
        SET comment_count = comment_count + 1,
            updated_at = NOW()
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts 
        SET comment_count = GREATEST(comment_count - 1, 0),
            updated_at = NOW()
        WHERE id = OLD.post_id;
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
        UPDATE forums 
        SET post_count = post_count + 1,
            thread_count = thread_count + 1,
            updated_at = NOW()
        WHERE id = NEW.forum_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE forums 
        SET post_count = GREATEST(post_count - 1, 0),
            thread_count = GREATEST(thread_count - 1, 0),
            updated_at = NOW()
        WHERE id = OLD.forum_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to get forum by subdomain (case-insensitive)
CREATE OR REPLACE FUNCTION get_forum_by_subdomain(subdomain_param TEXT)
RETURNS TABLE(
    id UUID,
    name TEXT,
    subdomain TEXT,
    description TEXT,
    long_description TEXT,
    category TEXT,
    owner_id UUID,
    status TEXT,
    is_private BOOLEAN,
    member_count INTEGER,
    post_count INTEGER,
    thread_count INTEGER,
    rules TEXT,
    banner_url TEXT,
    icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT f.id, f.name, f.subdomain, f.description, f.long_description, f.category, 
           f.owner_id, f.status, f.is_private, f.member_count, f.post_count, 
           f.thread_count, f.rules, f.banner_url, f.icon_url, f.created_at, f.updated_at
    FROM forums f
    WHERE LOWER(f.subdomain) = LOWER(subdomain_param);
END;
$$ LANGUAGE plpgsql;

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
    user_id_param UUID,
    type_param TEXT,
    title_param TEXT,
    message_param TEXT,
    link_param TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (user_id_param, type_param, title_param, message_param, link_param)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_post_votes ON post_votes;
CREATE TRIGGER trigger_update_post_votes
    AFTER INSERT OR UPDATE OR DELETE ON post_votes
    FOR EACH ROW EXECUTE FUNCTION update_post_votes();

DROP TRIGGER IF EXISTS trigger_update_comment_votes ON comment_votes;
CREATE TRIGGER trigger_update_comment_votes
    AFTER INSERT OR UPDATE OR DELETE ON comment_votes
    FOR EACH ROW EXECUTE FUNCTION update_comment_votes();

DROP TRIGGER IF EXISTS trigger_update_comment_count ON comments;
CREATE TRIGGER trigger_update_comment_count
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_comment_count();

DROP TRIGGER IF EXISTS trigger_update_forum_post_count ON posts;
CREATE TRIGGER trigger_update_forum_post_count
    AFTER INSERT OR DELETE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_forum_post_count();

-- Create updated_at triggers for all tables
DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_forums_updated_at ON forums;
CREATE TRIGGER trigger_forums_updated_at
    BEFORE UPDATE ON forums
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_posts_updated_at ON posts;
CREATE TRIGGER trigger_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_comments_updated_at ON comments;
CREATE TRIGGER trigger_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_support_messages_updated_at ON support_messages;
CREATE TRIGGER trigger_support_messages_updated_at
    BEFORE UPDATE ON support_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

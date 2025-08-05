-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, username, display_name, avatar_url, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1), 'user_' || substr(NEW.id::text, 1, 8)),
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1), 'User'),
        NEW.raw_user_meta_data->>'avatar_url',
        'user'
    );
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- User already exists, just return
        RETURN NEW;
    WHEN OTHERS THEN
        -- Log the error but don't fail the auth process
        RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update forum member count
CREATE OR REPLACE FUNCTION public.increment_forum_member_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.forums 
    SET member_count = member_count + 1 
    WHERE id = NEW.forum_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrement_forum_member_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.forums 
    SET member_count = member_count - 1 
    WHERE id = OLD.forum_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for forum member count
DROP TRIGGER IF EXISTS update_forum_member_count_insert ON public.forum_members;
CREATE TRIGGER update_forum_member_count_insert
    AFTER INSERT ON public.forum_members
    FOR EACH ROW EXECUTE FUNCTION public.increment_forum_member_count();

DROP TRIGGER IF EXISTS update_forum_member_count_delete ON public.forum_members;
CREATE TRIGGER update_forum_member_count_delete
    AFTER DELETE ON public.forum_members
    FOR EACH ROW EXECUTE FUNCTION public.decrement_forum_member_count();

-- Function to update forum post count
CREATE OR REPLACE FUNCTION public.increment_forum_post_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.forums 
    SET post_count = post_count + 1,
        thread_count = CASE WHEN NEW.parent_id IS NULL THEN thread_count + 1 ELSE thread_count END
    WHERE id = NEW.forum_id;
    
    -- Update user post count
    UPDATE public.users 
    SET post_count = post_count + 1 
    WHERE id = NEW.author_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrement_forum_post_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.forums 
    SET post_count = post_count - 1,
        thread_count = CASE WHEN OLD.parent_id IS NULL THEN thread_count - 1 ELSE thread_count END
    WHERE id = OLD.forum_id;
    
    -- Update user post count
    UPDATE public.users 
    SET post_count = post_count - 1 
    WHERE id = OLD.author_id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for forum post count
DROP TRIGGER IF EXISTS update_forum_post_count_insert ON public.posts;
CREATE TRIGGER update_forum_post_count_insert
    AFTER INSERT ON public.posts
    FOR EACH ROW EXECUTE FUNCTION public.increment_forum_post_count();

DROP TRIGGER IF EXISTS update_forum_post_count_delete ON public.posts;
CREATE TRIGGER update_forum_post_count_delete
    AFTER DELETE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION public.decrement_forum_post_count();

-- Function to update post comment count
CREATE OR REPLACE FUNCTION public.update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.parent_id IS NOT NULL THEN
        UPDATE public.posts 
        SET comment_count = comment_count + 1 
        WHERE id = NEW.parent_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' AND OLD.parent_id IS NOT NULL THEN
        UPDATE public.posts 
        SET comment_count = comment_count - 1 
        WHERE id = OLD.parent_id;
        RETURN OLD;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for post comment count
DROP TRIGGER IF EXISTS post_comment_count ON public.posts;
CREATE TRIGGER post_comment_count
    AFTER INSERT OR DELETE ON public.posts
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_post_comment_count();

-- Function to handle post votes
CREATE OR REPLACE FUNCTION public.update_post_vote_counts()
RETURNS TRIGGER AS $$
DECLARE
    author_id_var UUID;
BEGIN
    -- Get the author of the post for reputation updates
    SELECT author_id INTO author_id_var FROM public.posts WHERE id = COALESCE(NEW.post_id, OLD.post_id);
    
    IF TG_OP = 'INSERT' THEN
        IF NEW.vote_type = 1 THEN
            UPDATE public.posts SET upvotes = upvotes + 1 WHERE id = NEW.post_id;
            UPDATE public.users SET reputation = reputation + 1 WHERE id = author_id_var;
        ELSE
            UPDATE public.posts SET downvotes = downvotes + 1 WHERE id = NEW.post_id;
            UPDATE public.users SET reputation = reputation - 1 WHERE id = author_id_var;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Remove old vote
        IF OLD.vote_type = 1 THEN
            UPDATE public.posts SET upvotes = upvotes - 1 WHERE id = OLD.post_id;
            UPDATE public.users SET reputation = reputation - 1 WHERE id = author_id_var;
        ELSE
            UPDATE public.posts SET downvotes = downvotes - 1 WHERE id = OLD.post_id;
            UPDATE public.users SET reputation = reputation + 1 WHERE id = author_id_var;
        END IF;
        -- Add new vote
        IF NEW.vote_type = 1 THEN
            UPDATE public.posts SET upvotes = upvotes + 1 WHERE id = NEW.post_id;
            UPDATE public.users SET reputation = reputation + 1 WHERE id = author_id_var;
        ELSE
            UPDATE public.posts SET downvotes = downvotes + 1 WHERE id = NEW.post_id;
            UPDATE public.users SET reputation = reputation - 1 WHERE id = author_id_var;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.vote_type = 1 THEN
            UPDATE public.posts SET upvotes = upvotes - 1 WHERE id = OLD.post_id;
            UPDATE public.users SET reputation = reputation - 1 WHERE id = author_id_var;
        ELSE
            UPDATE public.posts SET downvotes = downvotes - 1 WHERE id = OLD.post_id;
            UPDATE public.users SET reputation = reputation + 1 WHERE id = author_id_var;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for post votes
DROP TRIGGER IF EXISTS handle_post_vote_insert ON public.post_votes;
CREATE TRIGGER handle_post_vote_insert
    AFTER INSERT ON public.post_votes
    FOR EACH ROW EXECUTE FUNCTION public.update_post_vote_counts();

DROP TRIGGER IF EXISTS handle_post_vote_update ON public.post_votes;
CREATE TRIGGER handle_post_vote_update
    AFTER UPDATE ON public.post_votes
    FOR EACH ROW EXECUTE FUNCTION public.update_post_vote_counts();

DROP TRIGGER IF EXISTS handle_post_vote_delete ON public.post_votes;
CREATE TRIGGER handle_post_vote_delete
    AFTER DELETE ON public.post_votes
    FOR EACH ROW EXECUTE FUNCTION public.update_post_vote_counts();

-- Function to automatically add forum owner as admin member
CREATE OR REPLACE FUNCTION public.add_forum_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.forum_members (forum_id, user_id, role)
    VALUES (NEW.id, NEW.owner_id, 'admin')
    ON CONFLICT (forum_id, user_id) DO UPDATE SET role = 'admin';
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the forum creation
        RAISE WARNING 'Failed to add forum owner as member: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to add forum owner as member
DROP TRIGGER IF EXISTS add_forum_owner_as_member_trigger ON public.forums;
CREATE TRIGGER add_forum_owner_as_member_trigger
    AFTER INSERT ON public.forums
    FOR EACH ROW EXECUTE FUNCTION public.add_forum_owner_as_member();

-- Function to increment post view count
CREATE OR REPLACE FUNCTION public.increment_post_views(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.posts 
    SET view_count = view_count + 1 
    WHERE id = post_id;
EXCEPTION
    WHEN OTHERS THEN
        -- Silently ignore errors for view count updates
        NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is banned
CREATE OR REPLACE FUNCTION public.is_user_banned(user_id UUID, forum_id UUID DEFAULT NULL)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_bans
        WHERE user_bans.user_id = is_user_banned.user_id
        AND (forum_id IS NULL OR user_bans.forum_id = is_user_banned.forum_id OR user_bans.forum_id IS NULL)
        AND (expires_at IS NULL OR expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get trending forums
CREATE OR REPLACE FUNCTION public.get_trending_forums(limit_count INTEGER DEFAULT 5)
RETURNS TABLE (
    id UUID,
    name VARCHAR(100),
    subdomain VARCHAR(50),
    description TEXT,
    category VARCHAR(50),
    member_count INTEGER,
    post_count INTEGER,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT f.id, f.name, f.subdomain, f.description, f.category, f.member_count, f.post_count, f.created_at
    FROM public.forums f
    WHERE f.status = 'active'
    ORDER BY (f.member_count * 0.6 + f.post_count * 0.4) DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to ensure user profile exists
CREATE OR REPLACE FUNCTION public.ensure_user_profile(user_uuid UUID, user_email TEXT DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
    profile_id UUID;
BEGIN
    -- Check if profile exists
    SELECT id INTO profile_id FROM public.users WHERE id = user_uuid;
    
    IF profile_id IS NULL THEN
        -- Create the profile
        INSERT INTO public.users (id, username, display_name, role)
        VALUES (
            user_uuid,
            COALESCE(split_part(user_email, '@', 1), 'user_' || substr(user_uuid::text, 1, 8)),
            COALESCE(split_part(user_email, '@', 1), 'User'),
            'user'
        )
        RETURNING id INTO profile_id;
    END IF;
    
    RETURN profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

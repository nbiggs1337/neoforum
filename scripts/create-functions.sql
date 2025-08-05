-- Function to increment forum post count
CREATE OR REPLACE FUNCTION increment_forum_post_count(forum_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.forums 
  SET post_count = post_count + 1,
      thread_count = CASE 
        WHEN (SELECT parent_id FROM public.posts WHERE id = forum_id) IS NULL 
        THEN thread_count + 1 
        ELSE thread_count 
      END
  WHERE id = forum_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment post view count
CREATE OR REPLACE FUNCTION increment_post_views(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.posts 
  SET view_count = view_count + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update post vote counts
CREATE OR REPLACE FUNCTION update_post_votes(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.posts 
  SET 
    upvotes = (SELECT COUNT(*) FROM public.post_votes WHERE post_votes.post_id = posts.id AND vote_type = 1),
    downvotes = (SELECT COUNT(*) FROM public.post_votes WHERE post_votes.post_id = posts.id AND vote_type = -1)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update user reputation based on votes
CREATE OR REPLACE FUNCTION update_user_reputation()
RETURNS trigger AS $$
BEGIN
  -- Update author's reputation when their post gets voted
  UPDATE public.users 
  SET reputation = (
    SELECT COALESCE(SUM(
      CASE 
        WHEN pv.vote_type = 1 THEN 10  -- +10 for upvote
        WHEN pv.vote_type = -1 THEN -2 -- -2 for downvote
        ELSE 0
      END
    ), 0)
    FROM public.post_votes pv
    JOIN public.posts p ON pv.post_id = p.id
    WHERE p.author_id = users.id
  )
  WHERE id = (
    SELECT p.author_id 
    FROM public.posts p 
    WHERE p.id = COALESCE(NEW.post_id, OLD.post_id)
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update reputation when votes change
CREATE TRIGGER update_reputation_on_vote
  AFTER INSERT OR UPDATE OR DELETE ON public.post_votes
  FOR EACH ROW EXECUTE FUNCTION update_user_reputation();

-- Function to update comment count
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.parent_id IS NOT NULL THEN
    UPDATE public.posts 
    SET comment_count = comment_count + 1
    WHERE id = NEW.parent_id;
  ELSIF TG_OP = 'DELETE' AND OLD.parent_id IS NOT NULL THEN
    UPDATE public.posts 
    SET comment_count = comment_count - 1
    WHERE id = OLD.parent_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update comment count
CREATE TRIGGER update_comment_count_trigger
  AFTER INSERT OR DELETE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION update_comment_count();

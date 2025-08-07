-- Create function to increment comment count
CREATE OR REPLACE FUNCTION increment_comment_count(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts 
  SET comment_count = COALESCE(comment_count, 0) + 1,
      updated_at = NOW()
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to decrement comment count
CREATE OR REPLACE FUNCTION decrement_comment_count(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts 
  SET comment_count = GREATEST(COALESCE(comment_count, 0) - 1, 0),
      updated_at = NOW()
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically update comment counts
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment comment count when a comment is added
    PERFORM increment_comment_count(NEW.post_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement comment count when a comment is deleted (only if not soft deleted)
    IF OLD.is_deleted = false OR OLD.is_deleted IS NULL THEN
      PERFORM decrement_comment_count(OLD.post_id);
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle soft delete toggle
    IF OLD.is_deleted = false AND NEW.is_deleted = true THEN
      -- Comment was soft deleted
      PERFORM decrement_comment_count(NEW.post_id);
    ELSIF OLD.is_deleted = true AND NEW.is_deleted = false THEN
      -- Comment was restored
      PERFORM increment_comment_count(NEW.post_id);
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_post_comment_count ON comments;

-- Create the trigger
CREATE TRIGGER trigger_update_post_comment_count
  AFTER INSERT OR UPDATE OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comment_count();

-- Fix existing comment counts by recalculating them
UPDATE posts 
SET comment_count = (
  SELECT COUNT(*)
  FROM comments 
  WHERE comments.post_id = posts.id 
    AND (comments.is_deleted = false OR comments.is_deleted IS NULL)
);

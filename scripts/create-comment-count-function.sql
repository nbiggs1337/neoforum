-- Create function to increment comment count
CREATE OR REPLACE FUNCTION increment_comment_count(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts 
  SET comment_count = COALESCE(comment_count, 0) + 1,
      updated_at = NOW()
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to decrement comment count
CREATE OR REPLACE FUNCTION decrement_comment_count(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts 
  SET comment_count = GREATEST(COALESCE(comment_count, 0) - 1, 0),
      updated_at = NOW()
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to automatically update comment counts
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Only count non-deleted comments
    IF NEW.is_deleted IS NOT TRUE THEN
      UPDATE posts 
      SET comment_count = (
        SELECT COUNT(*) 
        FROM comments 
        WHERE post_id = NEW.post_id 
        AND (is_deleted IS NOT TRUE OR is_deleted IS NULL)
      ),
      updated_at = NOW()
      WHERE id = NEW.post_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle soft delete changes
    IF OLD.is_deleted IS DISTINCT FROM NEW.is_deleted THEN
      UPDATE posts 
      SET comment_count = (
        SELECT COUNT(*) 
        FROM comments 
        WHERE post_id = NEW.post_id 
        AND (is_deleted IS NOT TRUE OR is_deleted IS NULL)
      ),
      updated_at = NOW()
      WHERE id = NEW.post_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts 
    SET comment_count = (
      SELECT COUNT(*) 
      FROM comments 
      WHERE post_id = OLD.post_id 
      AND (is_deleted IS NOT TRUE OR is_deleted IS NULL)
    ),
    updated_at = NOW()
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_post_comment_count ON comments;

-- Create the trigger
CREATE TRIGGER trigger_update_post_comment_count
  AFTER INSERT OR UPDATE OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comment_count();

-- Fix existing comment counts (one-time operation)
UPDATE posts 
SET comment_count = (
  SELECT COUNT(*) 
  FROM comments 
  WHERE comments.post_id = posts.id 
  AND (comments.is_deleted IS NOT TRUE OR comments.is_deleted IS NULL)
);

-- Fix comment count doubling issue
-- Drop existing trigger and function to avoid conflicts
DROP TRIGGER IF EXISTS update_comment_count_trigger ON comments;
DROP FUNCTION IF EXISTS update_comment_count();

-- Create a more reliable comment count update function
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Always recalculate the exact count from the database
  -- This prevents any doubling issues from incremental updates
  IF TG_OP = 'INSERT' THEN
    UPDATE posts 
    SET comment_count = (
      SELECT COUNT(*) 
      FROM comments 
      WHERE post_id = NEW.post_id 
      AND (is_deleted IS NULL OR is_deleted = false)
    )
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Only update if the is_deleted status changed
    IF OLD.is_deleted IS DISTINCT FROM NEW.is_deleted THEN
      UPDATE posts 
      SET comment_count = (
        SELECT COUNT(*) 
        FROM comments 
        WHERE post_id = NEW.post_id 
        AND (is_deleted IS NULL OR is_deleted = false)
      )
      WHERE id = NEW.post_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts 
    SET comment_count = (
      SELECT COUNT(*) 
      FROM comments 
      WHERE post_id = OLD.post_id 
      AND (is_deleted IS NULL OR is_deleted = false)
    )
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger with more specific conditions
CREATE TRIGGER update_comment_count_trigger
  AFTER INSERT OR UPDATE OF is_deleted OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_count();

-- Recalculate all existing comment counts to fix any that are currently wrong
UPDATE posts 
SET comment_count = (
  SELECT COUNT(*) 
  FROM comments 
  WHERE comments.post_id = posts.id 
  AND (comments.is_deleted IS NULL OR comments.is_deleted = false)
);

-- Drop existing trigger and function to avoid conflicts
DROP TRIGGER IF EXISTS update_comment_count_trigger ON comments;
DROP FUNCTION IF EXISTS update_comment_count();

-- Create a simple function that recalculates comment count
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Always recalculate the exact count from the database
  UPDATE posts 
  SET comment_count = (
    SELECT COUNT(*) 
    FROM comments 
    WHERE post_id = COALESCE(NEW.post_id, OLD.post_id)
    AND is_deleted = false
  )
  WHERE id = COALESCE(NEW.post_id, OLD.post_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger that only fires on INSERT, DELETE, or UPDATE of is_deleted
CREATE TRIGGER update_comment_count_trigger
  AFTER INSERT OR DELETE OR UPDATE OF is_deleted ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_count();

-- Fix any existing incorrect comment counts
UPDATE posts 
SET comment_count = (
  SELECT COUNT(*) 
  FROM comments 
  WHERE post_id = posts.id 
  AND is_deleted = false
);

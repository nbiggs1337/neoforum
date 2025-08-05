-- Function to update post vote counts
CREATE OR REPLACE FUNCTION update_post_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update upvotes and downvotes count
  UPDATE posts 
  SET 
    upvotes = (
      SELECT COUNT(*) 
      FROM post_votes 
      WHERE post_id = COALESCE(NEW.post_id, OLD.post_id) 
      AND vote_type = 1
    ),
    downvotes = (
      SELECT COUNT(*) 
      FROM post_votes 
      WHERE post_id = COALESCE(NEW.post_id, OLD.post_id) 
      AND vote_type = -1
    )
  WHERE id = COALESCE(NEW.post_id, OLD.post_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for vote counting
DROP TRIGGER IF EXISTS update_post_votes_on_insert ON post_votes;
CREATE TRIGGER update_post_votes_on_insert
  AFTER INSERT ON post_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_vote_counts();

DROP TRIGGER IF EXISTS update_post_votes_on_update ON post_votes;
CREATE TRIGGER update_post_votes_on_update
  AFTER UPDATE ON post_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_vote_counts();

DROP TRIGGER IF EXISTS update_post_votes_on_delete ON post_votes;
CREATE TRIGGER update_post_votes_on_delete
  AFTER DELETE ON post_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_vote_counts();

-- Function to update comment vote counts
CREATE OR REPLACE FUNCTION update_comment_vote_count(comment_id UUID, vote_difference INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE comments 
  SET 
    upvotes = CASE 
      WHEN vote_difference > 0 THEN upvotes + vote_difference
      ELSE upvotes
    END,
    downvotes = CASE 
      WHEN vote_difference < 0 THEN downvotes + ABS(vote_difference)
      ELSE downvotes
    END,
    updated_at = NOW()
  WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

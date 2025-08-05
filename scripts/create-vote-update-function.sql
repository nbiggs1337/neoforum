-- Function to update post vote counts
CREATE OR REPLACE FUNCTION update_post_vote_counts(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts 
  SET 
    upvotes = (
      SELECT COUNT(*) 
      FROM post_votes 
      WHERE post_votes.post_id = update_post_vote_counts.post_id 
      AND vote_type = 1
    ),
    downvotes = (
      SELECT COUNT(*) 
      FROM post_votes 
      WHERE post_votes.post_id = update_post_vote_counts.post_id 
      AND vote_type = -1
    )
  WHERE id = update_post_vote_counts.post_id;
END;
$$ LANGUAGE plpgsql;

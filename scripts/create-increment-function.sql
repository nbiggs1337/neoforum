-- Create a function to increment post views
CREATE OR REPLACE FUNCTION increment_post_views(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts 
  SET view_count = COALESCE(view_count, 0) + 1 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

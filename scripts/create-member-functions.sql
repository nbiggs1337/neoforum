-- Function to update forum member count
CREATE OR REPLACE FUNCTION update_forum_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment member count
    UPDATE forums 
    SET member_count = member_count + 1
    WHERE id = NEW.forum_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement member count
    UPDATE forums 
    SET member_count = GREATEST(member_count - 1, 0)
    WHERE id = OLD.forum_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for member count
DROP TRIGGER IF EXISTS update_member_count_on_insert ON forum_members;
CREATE TRIGGER update_member_count_on_insert
  AFTER INSERT ON forum_members
  FOR EACH ROW
  EXECUTE FUNCTION update_forum_member_count();

DROP TRIGGER IF EXISTS update_member_count_on_delete ON forum_members;
CREATE TRIGGER update_member_count_on_delete
  AFTER DELETE ON forum_members
  FOR EACH ROW
  EXECUTE FUNCTION update_forum_member_count();

-- Function to update forum post count
CREATE OR REPLACE FUNCTION update_forum_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment post count
    UPDATE forums 
    SET post_count = post_count + 1
    WHERE id = NEW.forum_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement post count
    UPDATE forums 
    SET post_count = GREATEST(post_count - 1, 0)
    WHERE id = OLD.forum_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for post count
DROP TRIGGER IF EXISTS update_post_count_on_insert ON posts;
CREATE TRIGGER update_post_count_on_insert
  AFTER INSERT ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_forum_post_count();

DROP TRIGGER IF EXISTS update_post_count_on_delete ON posts;
CREATE TRIGGER update_post_count_on_delete
  AFTER DELETE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_forum_post_count();

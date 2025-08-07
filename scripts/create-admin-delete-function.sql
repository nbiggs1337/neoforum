-- Create a function to delete comments as admin (bypasses RLS)
CREATE OR REPLACE FUNCTION delete_comment_admin(comment_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM comments WHERE id = comment_id;
  
  IF FOUND THEN
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_comment_admin(UUID) TO authenticated;

-- Create a function to soft delete comments as admin (bypasses RLS)
CREATE OR REPLACE FUNCTION soft_delete_comment_admin(comment_id UUID, admin_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE comments 
  SET 
    is_deleted = true,
    deleted_at = NOW(),
    deleted_by = admin_user_id
  WHERE id = comment_id;
  
  IF FOUND THEN
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION soft_delete_comment_admin(UUID, UUID) TO authenticated;

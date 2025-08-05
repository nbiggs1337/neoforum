-- Function to automatically assign admin role to first 2 users
CREATE OR REPLACE FUNCTION assign_admin_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is one of the first 2 users
  IF (SELECT COUNT(*) FROM users) <= 2 THEN
    NEW.role = 'admin';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run the function
DROP TRIGGER IF EXISTS assign_admin_role_trigger ON users;
CREATE TRIGGER assign_admin_role_trigger
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION assign_admin_role();

-- Make the first two users admin users
UPDATE users 
SET role = 'admin' 
WHERE id IN (
  SELECT id 
  FROM users 
  ORDER BY created_at ASC 
  LIMIT 2
);

-- Also update any specific user by email if needed
-- UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';

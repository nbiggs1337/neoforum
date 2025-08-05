-- Make nbiggs1337 an admin
UPDATE profiles 
SET role = 'admin' 
WHERE username = 'nbiggs1337';

-- Verify the update
SELECT id, username, role FROM profiles WHERE username = 'nbiggs1337';

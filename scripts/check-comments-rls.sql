-- Check if RLS is enabled on comments table and what policies exist
SELECT schemaname, tablename, rowsecurity, enablerls 
FROM pg_tables 
JOIN pg_class ON pg_class.relname = pg_tables.tablename 
WHERE tablename = 'comments';

-- Check existing RLS policies on comments table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'comments';

-- Check if the comment exists
SELECT id, content, author_id, created_at 
FROM comments 
WHERE id = 'badccbba-971b-4e45-aff1-5bf9b701f82e';

-- Add view_count column to posts table if it doesn't exist
ALTER TABLE posts ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Update existing posts to have a default view count of 0
UPDATE posts SET view_count = 0 WHERE view_count IS NULL;

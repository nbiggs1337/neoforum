-- Add soft delete columns to comments table
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES profiles(id);

-- Create index for better performance on soft delete queries
CREATE INDEX IF NOT EXISTS idx_comments_is_deleted ON comments(is_deleted);
CREATE INDEX IF NOT EXISTS idx_comments_deleted_at ON comments(deleted_at);

-- Update existing comments to have is_deleted = false
UPDATE comments SET is_deleted = FALSE WHERE is_deleted IS NULL;

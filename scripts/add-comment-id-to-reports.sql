-- Add comment_id column to reports table to store comment reports
ALTER TABLE reports ADD COLUMN comment_id UUID;

-- Add a foreign key constraint to link to the comments table
ALTER TABLE reports ADD CONSTRAINT reports_comment_id_fkey
  FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE;

-- Add an index for faster lookups on comment_id
CREATE INDEX idx_reports_comment_id ON reports(comment_id);

-- Drop the old unique constraint that only covered posts
DROP INDEX IF EXISTS idx_reports_unique_user_post;

-- Add a check constraint to ensure a report targets EITHER a post OR a comment, but not both
ALTER TABLE reports ADD CONSTRAINT chk_report_target
  CHECK ( (post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL) );

-- Create a unique index for post reports to prevent duplicates from the same user
CREATE UNIQUE INDEX idx_reports_unique_user_post_report
ON reports(reporter_id, post_id)
WHERE comment_id IS NULL;

-- Create a unique index for comment reports to prevent duplicates from the same user
CREATE UNIQUE INDEX idx_reports_unique_user_comment_report
ON reports(reporter_id, comment_id)
WHERE post_id IS NULL;

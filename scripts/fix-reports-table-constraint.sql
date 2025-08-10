-- Make the post_id column nullable to allow for comment reports
ALTER TABLE reports ALTER COLUMN post_id DROP NOT NULL;

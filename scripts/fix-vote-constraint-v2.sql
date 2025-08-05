-- Drop the existing constraint if it exists
ALTER TABLE post_votes DROP CONSTRAINT IF EXISTS post_votes_vote_type_check;

-- Convert vote_type column from text to integer
ALTER TABLE post_votes ALTER COLUMN vote_type TYPE integer USING vote_type::integer;

-- Add the correct constraint for integer values
ALTER TABLE post_votes ADD CONSTRAINT post_votes_vote_type_check CHECK (vote_type IN (1, -1));

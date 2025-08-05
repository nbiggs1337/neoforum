-- Drop the existing check constraint that's causing issues
ALTER TABLE post_votes DROP CONSTRAINT IF EXISTS post_votes_vote_type_check;

-- Add a new check constraint that allows 1 and -1
ALTER TABLE post_votes ADD CONSTRAINT post_votes_vote_type_check 
CHECK (vote_type IN (1, -1));

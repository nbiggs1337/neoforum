-- Add image_urls column to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS image_urls JSONB;

-- Add constraint to ensure image_urls is an array if not null
ALTER TABLE posts 
ADD CONSTRAINT posts_image_urls_is_array 
CHECK (image_urls IS NULL OR jsonb_typeof(image_urls) = 'array');

-- Create index for efficient querying of posts with images
CREATE INDEX IF NOT EXISTS idx_posts_image_urls 
ON posts USING GIN (image_urls) 
WHERE image_urls IS NOT NULL;

-- Update existing posts to have null image_urls
UPDATE posts 
SET image_urls = NULL 
WHERE image_urls IS NOT DISTINCT FROM '[]'::jsonb;

-- Create forum_follows table
CREATE TABLE IF NOT EXISTS forum_follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  forum_id UUID NOT NULL REFERENCES forums(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(forum_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_forum_follows_forum_id ON forum_follows(forum_id);
CREATE INDEX IF NOT EXISTS idx_forum_follows_user_id ON forum_follows(user_id);

-- Enable RLS
ALTER TABLE forum_follows ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all follows" ON forum_follows
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own follows" ON forum_follows
  FOR ALL USING (auth.uid() = user_id);

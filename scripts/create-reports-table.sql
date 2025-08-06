-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  reporter_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT
);

-- Add foreign key constraints if the referenced tables exist
DO $$
BEGIN
  -- Add foreign key to posts table if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'reports_post_id_fkey' 
                   AND table_name = 'reports') THEN
      ALTER TABLE reports ADD CONSTRAINT reports_post_id_fkey 
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;
    END IF;
  END IF;

  -- Add foreign key to profiles table if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'reports_reporter_id_fkey' 
                   AND table_name = 'reports') THEN
      ALTER TABLE reports ADD CONSTRAINT reports_reporter_id_fkey 
        FOREIGN KEY (reporter_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'reports_reviewed_by_fkey' 
                   AND table_name = 'reports') THEN
      ALTER TABLE reports ADD CONSTRAINT reports_reviewed_by_fkey 
        FOREIGN KEY (reviewed_by) REFERENCES profiles(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_post_id ON reports(post_id);
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);

-- Prevent duplicate reports from the same user for the same post
CREATE UNIQUE INDEX IF NOT EXISTS idx_reports_unique_user_post 
ON reports(post_id, reporter_id);

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own reports" ON reports
  FOR SELECT USING (reporter_id = auth.uid());

CREATE POLICY "Users can create reports" ON reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Admins can view all reports" ON reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can update reports" ON reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Update trigger
CREATE OR REPLACE FUNCTION update_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_reports_updated_at();

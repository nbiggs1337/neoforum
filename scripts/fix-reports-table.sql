-- Check if reports table exists and add missing columns
DO $$
BEGIN
    -- Add details column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reports' AND column_name = 'details'
    ) THEN
        ALTER TABLE reports ADD COLUMN details TEXT;
    END IF;

    -- Add admin_notes column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reports' AND column_name = 'admin_notes'
    ) THEN
        ALTER TABLE reports ADD COLUMN admin_notes TEXT;
    END IF;

    -- Add reviewed_by column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reports' AND column_name = 'reviewed_by'
    ) THEN
        ALTER TABLE reports ADD COLUMN reviewed_by UUID;
    END IF;

    -- Add reviewed_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reports' AND column_name = 'reviewed_at'
    ) THEN
        ALTER TABLE reports ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

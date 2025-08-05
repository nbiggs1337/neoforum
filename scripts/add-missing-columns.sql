-- Add missing columns to forums table
ALTER TABLE forums ADD COLUMN IF NOT EXISTS rules TEXT;
ALTER TABLE forums ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE forums ADD COLUMN IF NOT EXISTS icon_url TEXT;

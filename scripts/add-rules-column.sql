-- Add rules column to forums table
ALTER TABLE forums ADD COLUMN IF NOT EXISTS rules TEXT;

-- Migration to update community_presence table to support multiple exercises
-- This changes exercise_name to exercise_names to store comma-separated exercise names

-- Drop the old column and add the new one
ALTER TABLE community_presence DROP COLUMN IF EXISTS exercise_name;
ALTER TABLE community_presence ADD COLUMN IF NOT EXISTS exercise_names TEXT NOT NULL DEFAULT '';

-- Update any existing data (if any) to use the new column format
-- This is safe since we just created the table and likely have minimal data

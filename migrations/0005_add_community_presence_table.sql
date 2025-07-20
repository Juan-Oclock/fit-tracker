-- Create community_presence table for real-time community activity tracking
CREATE TABLE IF NOT EXISTS public.community_presence (
  user_id TEXT PRIMARY KEY,
  username TEXT NOT NULL DEFAULT '',
  profile_image_url TEXT,
  workout_name TEXT NOT NULL DEFAULT '',
  exercise_name TEXT NOT NULL DEFAULT '',
  last_active TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.community_presence ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all community presence data
-- (this is public community data that users have opted into sharing)
CREATE POLICY "Authenticated users can view community presence" ON public.community_presence
  FOR SELECT USING (auth.role() = 'authenticated');

-- Users can only insert/update their own presence data
CREATE POLICY "Users can manage own community presence" ON public.community_presence
  FOR ALL USING (auth.uid()::text = user_id);

-- Create index for efficient querying by last_active time
CREATE INDEX IF NOT EXISTS idx_community_presence_last_active 
  ON public.community_presence (last_active DESC);

-- Create index for efficient querying by user_id
CREATE INDEX IF NOT EXISTS idx_community_presence_user_id 
  ON public.community_presence (user_id);

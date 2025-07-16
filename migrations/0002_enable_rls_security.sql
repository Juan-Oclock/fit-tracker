-- Enable Row Level Security on all public tables
-- This addresses the security issues reported by Supabase

-- 1. Enable RLS on sessions table (Replit Auth)
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Sessions should only be accessible by the system/auth service
-- No user-level policies needed as this is handled by the auth system

-- 2. Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can only access their own profile data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid()::text = id);

-- 3. Enable RLS on categories table
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Categories are shared data - all authenticated users can read
CREATE POLICY "Authenticated users can view categories" ON public.categories
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only allow inserts/updates in development or by admin users
-- For production, you might want to restrict this further
CREATE POLICY "Authenticated users can manage categories" ON public.categories
  FOR ALL USING (auth.role() = 'authenticated');

-- 4. Enable RLS on quotes table
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Quotes are shared data - all authenticated users can read active quotes
CREATE POLICY "Authenticated users can view active quotes" ON public.quotes
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

-- Allow authenticated users to manage quotes (for admin functionality)
CREATE POLICY "Authenticated users can manage quotes" ON public.quotes
  FOR ALL USING (auth.role() = 'authenticated');

-- 5. Enable RLS on exercises table
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Exercises are shared data - all authenticated users can read
CREATE POLICY "Authenticated users can view exercises" ON public.exercises
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to manage exercises (for admin functionality)
CREATE POLICY "Authenticated users can manage exercises" ON public.exercises
  FOR ALL USING (auth.role() = 'authenticated');

-- 6. Enable RLS on workouts table
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

-- Users can only access their own workouts
CREATE POLICY "Users can view own workouts" ON public.workouts
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own workouts" ON public.workouts
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own workouts" ON public.workouts
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own workouts" ON public.workouts
  FOR DELETE USING (auth.uid()::text = user_id);

-- 7. Enable RLS on workout_exercises table
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;

-- Users can only access workout_exercises for their own workouts
CREATE POLICY "Users can view own workout exercises" ON public.workout_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workouts 
      WHERE workouts.id = workout_exercises.workout_id 
      AND workouts.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert own workout exercises" ON public.workout_exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workouts 
      WHERE workouts.id = workout_exercises.workout_id 
      AND workouts.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update own workout exercises" ON public.workout_exercises
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.workouts 
      WHERE workouts.id = workout_exercises.workout_id 
      AND workouts.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete own workout exercises" ON public.workout_exercises
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.workouts 
      WHERE workouts.id = workout_exercises.workout_id 
      AND workouts.user_id = auth.uid()::text
    )
  );

-- 8. Enable RLS on personal_records table
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;

-- Users can only access their own personal records
CREATE POLICY "Users can view own personal records" ON public.personal_records
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own personal records" ON public.personal_records
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own personal records" ON public.personal_records
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own personal records" ON public.personal_records
  FOR DELETE USING (auth.uid()::text = user_id);

-- 9. Enable RLS on goal_photos table
ALTER TABLE public.goal_photos ENABLE ROW LEVEL SECURITY;

-- Users can only access their own goal photos
CREATE POLICY "Users can view own goal photos" ON public.goal_photos
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own goal photos" ON public.goal_photos
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own goal photos" ON public.goal_photos
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own goal photos" ON public.goal_photos
  FOR DELETE USING (auth.uid()::text = user_id);

-- 10. Enable RLS on monthly_goals table
ALTER TABLE public.monthly_goals ENABLE ROW LEVEL SECURITY;

-- Users can only access their own monthly goals
CREATE POLICY "Users can view own monthly goals" ON public.monthly_goals
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own monthly goals" ON public.monthly_goals
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own monthly goals" ON public.monthly_goals
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own monthly goals" ON public.monthly_goals
  FOR DELETE USING (auth.uid()::text = user_id);
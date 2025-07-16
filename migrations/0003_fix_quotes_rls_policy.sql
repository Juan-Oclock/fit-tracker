-- Fix quotes RLS policy to allow public read access to active quotes
-- This allows the admin dashboard to display quotes without authentication

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Authenticated users can view active quotes" ON public.quotes;

-- Create a new policy that allows public read access to active quotes
CREATE POLICY "Public can view active quotes" ON public.quotes
  FOR SELECT USING (is_active = true);

-- Keep the management policy for authenticated users (for admin functionality)
-- This policy already exists and doesn't need to be changed
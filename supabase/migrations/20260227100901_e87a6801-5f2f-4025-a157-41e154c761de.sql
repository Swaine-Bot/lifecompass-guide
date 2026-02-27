
-- Remove the duplicate/redundant SELECT policy on profiles
DROP POLICY IF EXISTS "Users can view profiles with privacy controls" ON public.profiles;

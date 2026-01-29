-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create a new policy that allows users to view their own profile AND friends to view basic info
CREATE POLICY "Users can view own profile and friends can view profiles"
ON public.profiles FOR SELECT
USING (
  auth.uid() = user_id
  OR
  are_friends(auth.uid(), user_id)
);
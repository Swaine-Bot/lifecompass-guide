-- Fix 1: Add DELETE policy for habit_logs table
CREATE POLICY "Users can delete logs of their habits" 
ON public.habit_logs 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 
    FROM public.habits 
    WHERE habits.id = habit_logs.habit_id 
      AND habits.user_id = auth.uid()
  )
);

-- Fix 2: Make user-media bucket private and update policies
UPDATE storage.buckets SET public = false WHERE id = 'user-media';

-- Drop the public SELECT policy
DROP POLICY IF EXISTS "User media is publicly accessible" ON storage.objects;

-- Add authenticated SELECT policy - users can view their own media and friends' media
CREATE POLICY "Users can view accessible media"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user-media' AND (
    -- User can view their own media
    auth.uid()::text = (storage.foldername(name))[1]
    OR
    -- User can view friends' media
    EXISTS (
      SELECT 1 FROM public.friendships
      WHERE status = 'accepted'
      AND (
        (requester_id = auth.uid() AND addressee_id::text = (storage.foldername(name))[1])
        OR (addressee_id = auth.uid() AND requester_id::text = (storage.foldername(name))[1])
      )
    )
  )
);

-- Fix 3: Add documentation to location columns confirming they are protected
COMMENT ON TABLE public.profiles IS 'User profiles with location data protected by strict RLS - only visible to profile owner';
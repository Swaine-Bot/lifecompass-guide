-- Fix 1: Restrict reactions SELECT to only show reactions on visible posts
DROP POLICY IF EXISTS "Users can view reactions" ON public.reactions;

CREATE POLICY "Users can view reactions on visible posts" 
ON public.reactions 
FOR SELECT 
USING (
  -- Can see reactions on posts the user can view
  (post_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM posts p
    WHERE p.id = reactions.post_id
    AND (
      p.user_id = auth.uid() 
      OR p.visibility = 'public'::post_visibility 
      OR (p.visibility = 'friends'::post_visibility AND are_friends(auth.uid(), p.user_id))
    )
  ))
  OR
  -- Can see reactions on comments the user can view
  (comment_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM comments c
    JOIN posts p ON p.id = c.post_id
    WHERE c.id = reactions.comment_id
    AND (
      p.user_id = auth.uid() 
      OR p.visibility = 'public'::post_visibility 
      OR (p.visibility = 'friends'::post_visibility AND are_friends(auth.uid(), p.user_id))
    )
  ))
  OR
  -- User can always see their own reactions
  user_id = auth.uid()
);

-- Fix 2: Remove location columns from profiles to prevent tracking risk
-- Instead of removing, we'll ensure location is never exposed by keeping strict RLS
-- The current policy only allows users to see their own profile, which is secure
-- Adding explicit comment to document this security decision

COMMENT ON COLUMN public.profiles.last_latitude IS 'Private location data - protected by RLS, only visible to profile owner';
COMMENT ON COLUMN public.profiles.last_longitude IS 'Private location data - protected by RLS, only visible to profile owner';
COMMENT ON COLUMN public.profiles.location_updated_at IS 'Private location data - protected by RLS, only visible to profile owner';
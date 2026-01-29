-- Fix the storage policies to allow avatars path structure
-- The current policies expect user_id as first folder, but avatars use avatars/{user_id}/...
-- We need to update the policies to handle this path structure

-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload their own media" ON storage.objects;
DROP POLICY IF EXISTS "Users can view accessible media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own media" ON storage.objects;

-- Create new policies that handle both direct user folder and avatars subfolder
-- For INSERT: Allow users to upload to their folder or avatars/{user_id}
CREATE POLICY "Users can upload their own media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-media' AND (
    (auth.uid())::text = (storage.foldername(name))[1]
    OR (
      (storage.foldername(name))[1] = 'avatars' 
      AND (auth.uid())::text = (storage.foldername(name))[2]
    )
  )
);

-- For SELECT: Allow users to view their own media and friends' media
CREATE POLICY "Users can view accessible media"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user-media' AND (
    -- Own files in direct folder
    (auth.uid())::text = (storage.foldername(name))[1]
    -- Own files in avatars subfolder
    OR (
      (storage.foldername(name))[1] = 'avatars' 
      AND (auth.uid())::text = (storage.foldername(name))[2]
    )
    -- Friends' files in direct folder
    OR EXISTS (
      SELECT 1 FROM friendships
      WHERE friendships.status = 'accepted'
      AND (
        (friendships.requester_id = auth.uid() AND (friendships.addressee_id)::text = (storage.foldername(objects.name))[1])
        OR (friendships.addressee_id = auth.uid() AND (friendships.requester_id)::text = (storage.foldername(objects.name))[1])
      )
    )
    -- Friends' avatars
    OR (
      (storage.foldername(name))[1] = 'avatars' 
      AND EXISTS (
        SELECT 1 FROM friendships
        WHERE friendships.status = 'accepted'
        AND (
          (friendships.requester_id = auth.uid() AND (friendships.addressee_id)::text = (storage.foldername(objects.name))[2])
          OR (friendships.addressee_id = auth.uid() AND (friendships.requester_id)::text = (storage.foldername(objects.name))[2])
        )
      )
    )
  )
);

-- For UPDATE: Allow users to update their own media
CREATE POLICY "Users can update their own media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-media' AND (
    (auth.uid())::text = (storage.foldername(name))[1]
    OR (
      (storage.foldername(name))[1] = 'avatars' 
      AND (auth.uid())::text = (storage.foldername(name))[2]
    )
  )
);

-- For DELETE: Allow users to delete their own media
CREATE POLICY "Users can delete their own media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-media' AND (
    (auth.uid())::text = (storage.foldername(name))[1]
    OR (
      (storage.foldername(name))[1] = 'avatars' 
      AND (auth.uid())::text = (storage.foldername(name))[2]
    )
  )
);
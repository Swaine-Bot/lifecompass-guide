
ALTER TABLE public.mentor_messages
  ADD COLUMN IF NOT EXISTS image_url text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS image_metadata jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS moderation_status text DEFAULT NULL;

INSERT INTO storage.buckets (id, name, public)
VALUES ('mentor-images', 'mentor-images', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload mentor images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'mentor-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can read own mentor images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'mentor-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own mentor images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'mentor-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

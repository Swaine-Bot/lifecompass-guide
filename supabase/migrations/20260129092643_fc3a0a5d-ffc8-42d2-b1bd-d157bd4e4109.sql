-- Configure user-media bucket with security restrictions
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm'],
    file_size_limit = 10485760  -- 10MB per file
WHERE id = 'user-media';
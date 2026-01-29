-- ====================================
-- SOCIAL FEATURES & LIFE EVENTS SCHEMA
-- ====================================

-- Create storage bucket for user media
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-media', 'user-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for user media
CREATE POLICY "Users can upload their own media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'user-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'user-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own media"
ON storage.objects FOR DELETE
USING (bucket_id = 'user-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "User media is publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-media');

-- ====================================
-- FRIENDSHIP SYSTEM
-- ====================================

CREATE TYPE public.friendship_status AS ENUM ('pending', 'accepted', 'declined', 'blocked');

CREATE TABLE public.friendships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status friendship_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id != addressee_id)
);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own friendships"
ON public.friendships FOR SELECT
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can send friend requests"
ON public.friendships FOR INSERT
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update friendships they're part of"
ON public.friendships FOR UPDATE
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can delete their own friendships"
ON public.friendships FOR DELETE
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- ====================================
-- SOCIAL POSTS
-- ====================================

CREATE TYPE public.post_visibility AS ENUM ('public', 'friends', 'private');

CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  media_urls JSONB DEFAULT '[]'::jsonb,
  visibility post_visibility NOT NULL DEFAULT 'friends',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Helper function to check friendship
CREATE OR REPLACE FUNCTION public.are_friends(user1_id UUID, user2_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.friendships
    WHERE status = 'accepted'
    AND ((requester_id = user1_id AND addressee_id = user2_id)
         OR (requester_id = user2_id AND addressee_id = user1_id))
  )
$$;

CREATE POLICY "Users can view posts based on visibility"
ON public.posts FOR SELECT
USING (
  user_id = auth.uid() 
  OR visibility = 'public'
  OR (visibility = 'friends' AND public.are_friends(auth.uid(), user_id))
);

CREATE POLICY "Users can create their own posts"
ON public.posts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
ON public.posts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
ON public.posts FOR DELETE
USING (auth.uid() = user_id);

-- ====================================
-- COMMENTS
-- ====================================

CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments on visible posts"
ON public.comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.posts p 
    WHERE p.id = post_id
    AND (p.user_id = auth.uid() OR p.visibility = 'public' OR (p.visibility = 'friends' AND public.are_friends(auth.uid(), p.user_id)))
  )
);

CREATE POLICY "Users can comment on visible posts"
ON public.comments FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.posts p 
    WHERE p.id = post_id
    AND (p.user_id = auth.uid() OR p.visibility = 'public' OR (p.visibility = 'friends' AND public.are_friends(auth.uid(), p.user_id)))
  )
);

CREATE POLICY "Users can update their own comments"
ON public.comments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.comments FOR DELETE
USING (auth.uid() = user_id);

-- ====================================
-- REACTIONS
-- ====================================

CREATE TYPE public.reaction_type AS ENUM ('like', 'love', 'celebrate', 'support', 'insightful');

CREATE TABLE public.reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction reaction_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(post_id, user_id),
  UNIQUE(comment_id, user_id),
  CHECK ((post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL))
);

ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reactions"
ON public.reactions FOR SELECT
USING (true);

CREATE POLICY "Users can add reactions"
ON public.reactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reactions"
ON public.reactions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions"
ON public.reactions FOR DELETE
USING (auth.uid() = user_id);

-- ====================================
-- LIFE EVENTS (for mentor nudges)
-- ====================================

CREATE TYPE public.event_type AS ENUM ('birthday', 'anniversary', 'deadline', 'milestone', 'custom');

CREATE TABLE public.life_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type event_type NOT NULL DEFAULT 'custom',
  event_date DATE NOT NULL,
  recurring BOOLEAN DEFAULT false,
  reminder_days_before INTEGER[] DEFAULT '{7, 1}'::INTEGER[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.life_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own life events"
ON public.life_events FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own life events"
ON public.life_events FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own life events"
ON public.life_events FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own life events"
ON public.life_events FOR DELETE
USING (auth.uid() = user_id);

-- ====================================
-- USER PRIVACY SETTINGS
-- ====================================

CREATE TABLE public.privacy_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  terms_accepted BOOLEAN DEFAULT false,
  terms_accepted_at TIMESTAMP WITH TIME ZONE,
  privacy_policy_accepted BOOLEAN DEFAULT false,
  privacy_policy_accepted_at TIMESTAMP WITH TIME ZONE,
  profile_visibility post_visibility DEFAULT 'friends',
  show_activity_status BOOLEAN DEFAULT true,
  allow_friend_requests BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own privacy settings"
ON public.privacy_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own privacy settings"
ON public.privacy_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own privacy settings"
ON public.privacy_settings FOR UPDATE
USING (auth.uid() = user_id);

-- Add avatar_url to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create trigger to add privacy settings on new user
CREATE OR REPLACE FUNCTION public.handle_new_user_extended()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.privacy_settings (user_id, terms_accepted, privacy_policy_accepted)
  VALUES (NEW.id, false, false)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_privacy
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_extended();
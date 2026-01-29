-- Add guide_completed column to profiles table to track if user has seen the guide
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS guide_completed boolean DEFAULT false;
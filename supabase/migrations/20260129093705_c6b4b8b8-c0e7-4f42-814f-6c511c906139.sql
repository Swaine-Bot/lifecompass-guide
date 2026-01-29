-- Drop the existing vulnerable function
DROP FUNCTION IF EXISTS public.increment_micro_moves(uuid);

-- Create a secure version that uses auth.uid() instead of a parameter
CREATE OR REPLACE FUNCTION public.increment_micro_moves()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  -- Verify user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Only allow users to increment their own counter
  UPDATE profiles 
  SET micro_moves_count = micro_moves_count + 1
  WHERE user_id = auth.uid()
  RETURNING micro_moves_count INTO new_count;
  
  RETURN new_count;
END;
$$;
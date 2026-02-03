-- Create a function in the public schema that can securely access auth.users
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(p_user_email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER -- Allows the function to run with the permissions of the definer (postgres)
-- Set a secure search path for the function
SET search_path = public, auth
AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Select the id from auth.users based on the provided email (case-insensitive)
  SELECT id INTO user_id 
  FROM auth.users 
  WHERE lower(email) = lower(p_user_email); -- Compare in lowercase
  
  -- Return the found user_id (will be null if not found)
  RETURN user_id;
END;
$$;

-- Re-grant execute permission just in case (doesn't hurt)
GRANT EXECUTE ON FUNCTION public.get_user_id_by_email(text) TO service_role;
REVOKE EXECUTE ON FUNCTION public.get_user_id_by_email(text) FROM anon; 
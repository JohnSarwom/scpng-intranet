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
  -- Select the id from auth.users based on the provided email
  SELECT id INTO user_id FROM auth.users WHERE email = p_user_email;
  
  -- Return the found user_id (will be null if not found)
  RETURN user_id;
END;
$$;

-- Grant execute permission to the service_role (used by admin client in functions)
-- Adjust 'service_role' if your service key role name is different
GRANT EXECUTE ON FUNCTION public.get_user_id_by_email(text) TO service_role;

-- Grant execute permission to authenticated users if needed (though the function uses service_role)
-- GRANT EXECUTE ON FUNCTION public.get_user_id_by_email(text) TO authenticated;

-- Revoke execute permission from anon users for security
REVOKE EXECUTE ON FUNCTION public.get_user_id_by_email(text) FROM anon; 
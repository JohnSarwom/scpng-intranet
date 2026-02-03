CREATE OR REPLACE FUNCTION delete_user_by_email(target_email TEXT)
RETURNS void AS $$
DECLARE
  current_user_email TEXT;
  current_user_role TEXT;
  user_id UUID;
BEGIN
  -- Attempt to get the email directly from the JWT claims
  SELECT INTO current_user_email current_setting('request.jwt.claims', TRUE)::json->>'email';

  -- If email is not found, try to get user ID and then fetch email from auth.users
  IF current_user_email IS NULL THEN
    SELECT INTO user_id (current_setting('request.jwt.claims', TRUE)::json->>'sub')::UUID;
    IF user_id IS NOT NULL THEN
      SELECT INTO current_user_email email FROM auth.users WHERE id = user_id;
    END IF;
  END IF;

  -- Check if current_user_email was successfully determined
  IF current_user_email IS NULL THEN
    RAISE EXCEPTION 'Authentication error: Could not determine requesting user''s email from JWT.';
  END IF;

  -- Get the role of the user making the request
  SELECT INTO current_user_role ur.role_name
  FROM public.user_roles_summary ur
  WHERE ur.user_email = current_user_email;

  -- Check if the current user is a 'super_admin'
  IF current_user_role = 'super_admin' THEN
    -- Delete from user_roles first due to foreign key constraints
    DELETE FROM public.user_roles
    WHERE user_email = target_email;

    -- Then delete from staff_members
    DELETE FROM public.staff_members
    WHERE email = target_email;
  ELSE
    RAISE EXCEPTION 'Permission denied: Only super_admins can delete users.';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- QUICK FIX: Function Type Mismatch Correction
-- ============================================================================
-- This script fixes the return type mismatch in the get_user_role_info function
-- Run this immediately to fix the current login issue
-- ============================================================================

-- Fix the main function causing the login issue
CREATE OR REPLACE FUNCTION get_user_role_info(user_email_input TEXT)
RETURNS TABLE (
  user_email VARCHAR(255),
  role_name VARCHAR(50),
  role_id UUID,
  division_id VARCHAR(100),
  division_name VARCHAR(255),
  permissions JSONB,
  is_admin BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ur.user_email,
    r.name as role_name,
    r.id as role_id,
    ur.division_id,
    COALESCE(d.name, ''::VARCHAR(255)) as division_name,
    r.permissions,
    CASE 
      WHEN r.name IN ('super_admin', 'system_admin') THEN true 
      ELSE false 
    END as is_admin
  FROM public.user_roles ur
  JOIN public.roles r ON ur.role_id = r.id
  LEFT JOIN public.divisions d ON ur.division_id = d.id
  WHERE ur.user_email = user_email_input 
    AND ur.is_active = true
  ORDER BY r.name = 'super_admin' DESC, r.created_at ASC
  LIMIT 1;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_role_info(TEXT) TO authenticated;

-- Test the function (optional - you can comment this out)
-- SELECT * FROM get_user_role_info('jsarwom@scpng.gov.pg'); 
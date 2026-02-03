-- ============================================================================
-- DROP EXISTING FUNCTIONS - RUN THIS FIRST
-- ============================================================================
-- This script drops existing functions that might conflict with the migration
-- Run this BEFORE running the complete migration script
-- ============================================================================

-- Drop existing functions that might have type conflicts
DROP FUNCTION IF EXISTS get_user_role_info(text);
DROP FUNCTION IF EXISTS get_user_role_info(varchar);
DROP FUNCTION IF EXISTS check_user_permission(varchar, varchar, varchar);
DROP FUNCTION IF EXISTS check_user_permission(text, text, text);
DROP FUNCTION IF EXISTS get_user_permissions(varchar);
DROP FUNCTION IF EXISTS get_user_permissions(text);
DROP FUNCTION IF EXISTS assign_user_role(varchar, uuid, varchar, varchar);
DROP FUNCTION IF EXISTS assign_user_role(text, uuid, text, text);
DROP FUNCTION IF EXISTS get_role_id_by_name(varchar);
DROP FUNCTION IF EXISTS get_role_id_by_name(text);

SELECT 'Existing functions dropped successfully. Now run the complete migration script.' as status; 
-- ============================================================================
-- QUICK FIX: Resolve Trigger Conflicts
-- ============================================================================
-- This script resolves the trigger conflict errors when running the RBAC migration
-- Run this BEFORE running the main migration script if you get trigger errors
-- ============================================================================

-- Drop existing triggers that might conflict
DROP TRIGGER IF EXISTS update_roles_updated_at ON public.roles;
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON public.user_roles;
DROP TRIGGER IF EXISTS audit_user_roles ON public.user_roles;
DROP TRIGGER IF EXISTS audit_roles ON public.roles;

-- Also drop the function if it exists to avoid conflicts
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS audit_trigger();

-- Now you can safely run the complete migration script
-- Or run this as part of the migration - the triggers will be recreated properly

SELECT 'Trigger conflicts resolved. Safe to run migration script.' as status; 
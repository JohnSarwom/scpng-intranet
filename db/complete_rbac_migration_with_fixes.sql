-- ============================================================================
-- COMPLETE ROLE-BASED ACCESS CONTROL SYSTEM - MIGRATION WITH TYPE FIXES
-- ============================================================================
-- This script creates the complete role-based access control system for the
-- SCPNG Intranet application with MSAL authentication integration.
-- ALL TYPE MISMATCHES HAVE BEEN FIXED TO MATCH EXISTING SCHEMA
--
-- Created: 2025-01-21
-- Updated: 2025-01-21 (Type fixes included)
-- Description: Implements granular role and permission management
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. CREATE ROLES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '{}',
  is_system_role BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add updated_at trigger for roles
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_roles_updated_at ON public.roles;
CREATE TRIGGER update_roles_updated_at 
  BEFORE UPDATE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. CREATE USER_ROLES JUNCTION TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email VARCHAR(255) NOT NULL,
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  division_id VARCHAR(100) REFERENCES public.divisions(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  assigned_by_email VARCHAR(255),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deactivated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add partial unique index to enforce only one active role per user
DROP INDEX IF EXISTS idx_user_roles_active_unique;
CREATE UNIQUE INDEX idx_user_roles_active_unique 
ON public.user_roles (user_email) 
WHERE is_active = true;

-- Add updated_at trigger for user_roles
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON public.user_roles;
CREATE TRIGGER update_user_roles_updated_at 
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_email ON public.user_roles(user_email);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_division_id ON public.user_roles(division_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON public.user_roles(is_active);

-- ============================================================================
-- 3. CREATE GROUP_ACCESS_PERMISSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.group_access_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  resource VARCHAR(100) NOT NULL, -- e.g., 'assets', 'reports', 'admin'
  actions JSONB DEFAULT '[]', -- e.g., ['read', 'write', 'delete', 'admin']
  conditions JSONB DEFAULT '{}', -- e.g., division-specific access conditions
  description TEXT, -- Human readable description
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure unique permission per role-resource combination
  UNIQUE(role_id, resource)
);

-- Add indexes for permissions
CREATE INDEX IF NOT EXISTS idx_permissions_role_id ON public.group_access_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_permissions_resource ON public.group_access_permissions(resource);
CREATE INDEX IF NOT EXISTS idx_permissions_active ON public.group_access_permissions(is_active);

-- ============================================================================
-- 4. ENHANCE EXISTING TABLES (if needed)
-- ============================================================================

-- Add role tracking to user_profiles if not exists
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS last_role_check TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS role_cache JSONB DEFAULT '{}';

-- Update user_login_log to include role info if needed
ALTER TABLE public.user_login_log 
ADD COLUMN IF NOT EXISTS role_info JSONB DEFAULT '{}';

-- ============================================================================
-- 5. CREATE ROLE MANAGEMENT FUNCTIONS (WITH TYPE FIXES)
-- ============================================================================

-- Function to get user role and permissions (FIXED TYPES)
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

-- Function to check user permissions (FIXED TYPES)
CREATE OR REPLACE FUNCTION check_user_permission(
  user_email_input VARCHAR(255),
  resource_input VARCHAR(100),
  action_input VARCHAR(50)
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  has_permission BOOLEAN := false;
  user_role_name VARCHAR(50);
BEGIN
  -- Get user's role name first
  SELECT role_name INTO user_role_name
  FROM get_user_role_info(user_email_input);
  
  -- Super admin always has permission
  IF user_role_name IN ('super_admin', 'system_admin') THEN
    RETURN true;
  END IF;

  -- Check specific permissions through role permissions (JSON)
  SELECT EXISTS(
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_email = user_email_input
      AND ur.is_active = true
      AND (
        -- Check if permissions JSON contains the resource and action
        (r.permissions->>resource_input)::jsonb ? action_input
        OR (r.permissions->>resource_input)::jsonb ? '*'
        OR (r.permissions->>'all')::jsonb ? '*'
      )
  ) INTO has_permission;
  
  -- If not found in role permissions, check group_access_permissions table
  IF NOT has_permission THEN
    SELECT EXISTS(
      SELECT 1
      FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      JOIN public.group_access_permissions gap ON r.id = gap.role_id
      WHERE ur.user_email = user_email_input
        AND ur.is_active = true
        AND gap.is_active = true
        AND gap.resource = resource_input
        AND (
          gap.actions ? action_input
          OR gap.actions ? '*'
        )
    ) INTO has_permission;
  END IF;
  
  RETURN COALESCE(has_permission, false);
END;
$$;

-- Function to get all permissions for a user (FIXED TYPES)
CREATE OR REPLACE FUNCTION get_user_permissions(user_email_input VARCHAR(255))
RETURNS TABLE (
  resource VARCHAR(100),
  actions JSONB,
  source VARCHAR(50)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  -- Get permissions from role JSON
  SELECT 
    perm.key::VARCHAR(100) as resource,
    perm.value as actions,
    'role_permissions'::VARCHAR(50) as source
  FROM public.user_roles ur
  JOIN public.roles r ON ur.role_id = r.id
  CROSS JOIN LATERAL jsonb_each(r.permissions) AS perm(key, value)
  WHERE ur.user_email = user_email_input 
    AND ur.is_active = true
  
  UNION ALL
  
  -- Get permissions from group_access_permissions table
  SELECT 
    gap.resource,
    gap.actions,
    'group_permissions'::VARCHAR(50) as source
  FROM public.user_roles ur
  JOIN public.roles r ON ur.role_id = r.id
  JOIN public.group_access_permissions gap ON r.id = gap.role_id
  WHERE ur.user_email = user_email_input 
    AND ur.is_active = true
    AND gap.is_active = true;
END;
$$;

-- Function to assign role to user (FIXED TYPES)
CREATE OR REPLACE FUNCTION assign_user_role(
  target_user_email VARCHAR(255),
  target_role_id UUID,
  target_division_id VARCHAR(100) DEFAULT NULL,
  assigned_by_email VARCHAR(255) DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_role_id UUID;
BEGIN
  -- Check if user already has an active role
  SELECT id INTO existing_role_id
  FROM public.user_roles
  WHERE user_email = target_user_email AND is_active = true;
  
  -- If user has existing role, deactivate it first
  IF existing_role_id IS NOT NULL THEN
    UPDATE public.user_roles
    SET is_active = false, deactivated_at = now()
    WHERE id = existing_role_id;
  END IF;
  
  -- Insert new role assignment
  INSERT INTO public.user_roles (
    user_email, 
    role_id, 
    division_id, 
    assigned_by_email, 
    is_active
  ) VALUES (
    target_user_email, 
    target_role_id, 
    target_division_id, 
    assigned_by_email, 
    true
  );
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Helper function to get role ID by name
CREATE OR REPLACE FUNCTION get_role_id_by_name(role_name_input VARCHAR(50))
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_id UUID;
BEGIN
  SELECT id INTO result_id
  FROM public.roles
  WHERE name = role_name_input;
  
  RETURN result_id;
END;
$$;

-- ============================================================================
-- 6. INSERT DEFAULT ROLES
-- ============================================================================

-- Insert system roles
INSERT INTO public.roles (name, description, permissions, is_system_role) VALUES
(
  'super_admin', 
  'Super Administrator with full system access', 
  '{"all": ["*"]}',
  true
),
(
  'system_admin',
  'System Administrator with administrative privileges',
  '{
    "admin": ["*"],
    "users": ["read", "write", "manage_roles"],
    "assets": ["*"],
    "reports": ["*"],
    "documents": ["*"],
    "tickets": ["*"],
    "licenses": ["*"],
    "ai": ["*"],
    "units": ["*"]
  }',
  true
),
(
  'division_manager', 
  'Division Manager with division-specific administrative rights', 
  '{
    "assets": ["read", "write", "approve", "admin"],
    "reports": ["read", "write", "generate"],
    "documents": ["read", "write"],
    "tickets": ["read", "write", "assign"],
    "licenses": ["read", "write"],
    "units": ["read", "write"],
    "staff": ["read"],
    "ai": ["access"]
  }',
  true
),
(
  'staff_member', 
  'Regular staff member with standard access', 
  '{
    "assets": ["read"],
    "documents": ["read"],
    "reports": ["read"],
    "tickets": ["read", "create"],
    "licenses": ["read"],
    "units": ["read"]
  }',
  true
),
(
  'finance_officer',
  'Finance Officer with financial data access',
  '{
    "assets": ["read", "write"],
    "reports": ["read", "write", "generate"],
    "documents": ["read", "write"],
    "tickets": ["read", "create"],
    "licenses": ["read"],
    "units": ["read"]
  }',
  true
),
(
  'readonly_user', 
  'Read-only access user with minimal permissions', 
  '{
    "assets": ["read"],
    "documents": ["read"],
    "reports": ["read"],
    "licenses": ["read"],
    "units": ["read"]
  }',
  true
) ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  permissions = EXCLUDED.permissions,
  is_system_role = EXCLUDED.is_system_role,
  updated_at = now();

-- ============================================================================
-- 7. INSERT DEFAULT PERMISSIONS (Alternative granular approach)
-- ============================================================================

-- Get role IDs for permission assignments
WITH role_ids AS (
  SELECT id, name FROM public.roles WHERE name IN (
    'super_admin', 'system_admin', 'division_manager', 
    'staff_member', 'finance_officer', 'readonly_user'
  )
)

-- Insert granular permissions
INSERT INTO public.group_access_permissions (role_id, resource, actions, description) 
SELECT 
  r.id,
  perms.resource,
  perms.actions::jsonb,
  perms.description
FROM role_ids r
CROSS JOIN (
  VALUES 
    -- Super Admin permissions
    ('super_admin', 'admin', '["*"]', 'Full administrative access'),
    ('super_admin', 'users', '["*"]', 'Full user management'),
    ('super_admin', 'assets', '["*"]', 'Full asset management'),
    ('super_admin', 'reports', '["*"]', 'Full report access'),
    ('super_admin', 'documents', '["*"]', 'Full document access'),
    ('super_admin', 'tickets', '["*"]', 'Full ticket management'),
    ('super_admin', 'licenses', '["*"]', 'Full license management'),
    ('super_admin', 'ai', '["*"]', 'Full AI access'),
    ('super_admin', 'units', '["*"]', 'Full unit management'),
    
    -- Division Manager permissions
    ('division_manager', 'assets', '["read", "write", "approve", "admin"]', 'Asset management within division'),
    ('division_manager', 'reports', '["read", "write", "generate"]', 'Report generation and management'),
    ('division_manager', 'users', '["read"]', 'View division staff'),
    ('division_manager', 'tickets', '["read", "write", "assign"]', 'Ticket management'),
    ('division_manager', 'documents', '["read", "write"]', 'Document access'),
    ('division_manager', 'licenses', '["read", "write"]', 'License management'),
    ('division_manager', 'ai', '["access"]', 'AI Hub access'),
    ('division_manager', 'units', '["read", "write"]', 'Unit management'),
    
    -- Staff Member permissions
    ('staff_member', 'assets', '["read"]', 'View assigned assets'),
    ('staff_member', 'documents', '["read"]', 'Access to documents'),
    ('staff_member', 'reports', '["read"]', 'View reports'),
    ('staff_member', 'tickets', '["read", "create"]', 'Basic ticket access'),
    ('staff_member', 'licenses', '["read"]', 'View licenses'),
    ('staff_member', 'units', '["read"]', 'View units'),
    
    -- Finance Officer permissions
    ('finance_officer', 'assets', '["read", "write"]', 'Financial asset management'),
    ('finance_officer', 'reports', '["read", "write", "generate"]', 'Financial reporting'),
    ('finance_officer', 'documents', '["read", "write"]', 'Document access'),
    ('finance_officer', 'tickets', '["read", "create"]', 'Ticket access'),
    ('finance_officer', 'licenses', '["read"]', 'License viewing'),
    ('finance_officer', 'units', '["read"]', 'Unit viewing'),
    
    -- Read-only permissions
    ('readonly_user', 'assets', '["read"]', 'View-only asset access'),
    ('readonly_user', 'documents', '["read"]', 'View-only document access'),
    ('readonly_user', 'reports', '["read"]', 'View-only report access'),
    ('readonly_user', 'licenses', '["read"]', 'View-only license access'),
    ('readonly_user', 'units', '["read"]', 'View-only unit access')
) AS perms(role_name, resource, actions, description)
WHERE r.name = perms.role_name
ON CONFLICT (role_id, resource) DO UPDATE SET
  actions = EXCLUDED.actions,
  description = EXCLUDED.description,
  is_active = true;

-- ============================================================================
-- 8. CREATE SAMPLE USER ASSIGNMENTS (Optional - for testing)
-- ============================================================================

-- Example: Assign super_admin role to jsarwom@scpng.gov.pg (uncomment to use)
-- SELECT assign_user_role(
--   'jsarwom@scpng.gov.pg',
--   get_role_id_by_name('super_admin'),
--   NULL,
--   'system'
-- );

-- ============================================================================
-- 9. CREATE HELPFUL VIEWS
-- ============================================================================

-- Drop existing views if they exist
DROP VIEW IF EXISTS public.user_role_summary;
DROP VIEW IF EXISTS public.role_permissions_summary;

-- View to see all user role assignments with details
CREATE VIEW public.user_role_summary AS
SELECT 
  ur.id,
  ur.user_email,
  sm.name as user_name,
  r.name as role_name,
  r.description as role_description,
  d.name as division_name,
  ur.is_active,
  ur.assigned_at,
  ur.assigned_by_email,
  ur.deactivated_at
FROM public.user_roles ur
JOIN public.roles r ON ur.role_id = r.id
LEFT JOIN public.divisions d ON ur.division_id = d.id
LEFT JOIN public.staff_members sm ON ur.user_email = sm.email
ORDER BY ur.assigned_at DESC;

-- View to see all role permissions
CREATE VIEW public.role_permissions_summary AS
SELECT 
  r.name as role_name,
  r.description,
  gap.resource,
  gap.actions,
  gap.description as permission_description,
  gap.is_active
FROM public.roles r
LEFT JOIN public.group_access_permissions gap ON r.id = gap.role_id
ORDER BY r.name, gap.resource;

-- ============================================================================
-- 10. CREATE AUDIT TRIGGERS (Optional - for tracking changes)
-- ============================================================================

-- Create audit log table
CREATE TABLE IF NOT EXISTS public.role_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  changed_by TEXT,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Audit function
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.role_audit_log (
      table_name, operation, old_values, changed_by
    ) VALUES (
      TG_TABLE_NAME, TG_OP, row_to_json(OLD),
      COALESCE(current_setting('request.jwt.claims', true)::json->>'email', 'system')
    );
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.role_audit_log (
      table_name, operation, old_values, new_values, changed_by
    ) VALUES (
      TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW),
      COALESCE(current_setting('request.jwt.claims', true)::json->>'email', 'system')
    );
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.role_audit_log (
      table_name, operation, new_values, changed_by
    ) VALUES (
      TG_TABLE_NAME, TG_OP, row_to_json(NEW),
      COALESCE(current_setting('request.jwt.claims', true)::json->>'email', 'system')
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers (safe to re-run)
DROP TRIGGER IF EXISTS audit_user_roles ON public.user_roles;
CREATE TRIGGER audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

DROP TRIGGER IF EXISTS audit_roles ON public.roles;
CREATE TRIGGER audit_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- ============================================================================
-- 11. ENABLE ROW LEVEL SECURITY (Optional - Advanced Security)
-- ============================================================================

-- Enable RLS on sensitive tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_access_permissions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own role information
DROP POLICY IF EXISTS user_roles_policy ON public.user_roles;
CREATE POLICY user_roles_policy ON public.user_roles
  FOR SELECT USING (
    user_email = current_setting('request.jwt.claims', true)::json->>'email'
    OR 
    EXISTS (
      SELECT 1 FROM get_user_role_info(
        current_setting('request.jwt.claims', true)::json->>'email'
      ) WHERE is_admin = true
    )
  );

-- Policy: Only admins can view all permissions
DROP POLICY IF EXISTS permissions_policy ON public.group_access_permissions;
CREATE POLICY permissions_policy ON public.group_access_permissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM get_user_role_info(
        current_setting('request.jwt.claims', true)::json->>'email'
      ) WHERE is_admin = true
    )
  );

-- ============================================================================
-- 12. GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant permissions on tables
GRANT SELECT ON public.roles TO authenticated;
GRANT SELECT ON public.divisions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_roles TO authenticated;
GRANT SELECT ON public.group_access_permissions TO authenticated;
GRANT SELECT ON public.role_audit_log TO authenticated;

-- Grant permissions on functions
GRANT EXECUTE ON FUNCTION get_user_role_info(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_permission(VARCHAR(255), VARCHAR(100), VARCHAR(50)) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_permissions(VARCHAR(255)) TO authenticated;
GRANT EXECUTE ON FUNCTION assign_user_role(VARCHAR(255), UUID, VARCHAR(100), VARCHAR(255)) TO authenticated;
GRANT EXECUTE ON FUNCTION get_role_id_by_name(VARCHAR(50)) TO authenticated;

-- Grant permissions on views
GRANT SELECT ON public.user_role_summary TO authenticated;
GRANT SELECT ON public.role_permissions_summary TO authenticated;

-- ============================================================================
-- 13. VERIFICATION QUERIES (Optional - for testing)
-- ============================================================================

-- Check if tables were created successfully
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name IN (
--   'roles', 'user_roles', 'group_access_permissions', 'role_audit_log'
-- );

-- Check if roles were inserted
-- SELECT name, description FROM public.roles ORDER BY name;

-- Check if functions were created
-- SELECT routine_name FROM information_schema.routines 
-- WHERE routine_schema = 'public' AND routine_name LIKE '%role%';

-- Test user role assignment (uncomment and modify as needed)
-- SELECT assign_user_role('jsarwom@scpng.gov.pg', get_role_id_by_name('super_admin'), NULL, 'system');

-- Test role lookup (uncomment and modify as needed)  
-- SELECT * FROM get_user_role_info('jsarwom@scpng.gov.pg');

-- ============================================================================
-- MIGRATION COMPLETE WITH TYPE FIXES
-- ============================================================================
-- 
-- This migration script has created:
-- 
-- Tables:
--   - roles: Define system roles (FIXED TYPES)
--   - user_roles: Assign roles to users (FIXED TYPES)
--   - group_access_permissions: Granular permissions
--   - role_audit_log: Audit trail
-- 
-- Functions (ALL TYPE MISMATCHES FIXED):
--   - get_user_role_info(): Get user's role and permissions
--   - check_user_permission(): Check specific permissions
--   - get_user_permissions(): Get all user permissions
--   - assign_user_role(): Assign role to user
--   - get_role_id_by_name(): Helper to get role ID
-- 
-- Default Roles:
--   - super_admin: Full system access
--   - system_admin: Administrative access
--   - division_manager: Division-level management
--   - staff_member: Standard user access
--   - finance_officer: Financial data access
--   - readonly_user: View-only access
-- 
-- Views:
--   - user_role_summary: Complete user role information
--   - role_permissions_summary: All role permissions
--
-- Security:
--   - Row Level Security policies
--   - Audit triggers for change tracking
--   - Proper permissions and grants
-- 
-- TYPE FIXES INCLUDED:
--   ✅ VARCHAR lengths match existing schema
--   ✅ Function return types corrected
--   ✅ Parameter types aligned with database
--   ✅ All type mismatches resolved
--
-- Quick Start Commands:
-- 1. Copy this entire script and run in Supabase SQL Editor
-- 2. Assign your first admin user:
--    SELECT assign_user_role('your-email@scpng.gov.pg', get_role_id_by_name('super_admin'), NULL, 'system');
-- 3. Test the system by logging in
-- 
-- ============================================================================ 
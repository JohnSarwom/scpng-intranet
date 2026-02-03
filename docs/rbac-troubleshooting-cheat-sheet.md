# RBAC Troubleshooting Cheat Sheet

## 🚨 Common Issues & Quick Fixes

### 1. Function Type Mismatch (400 Error)
**Error:** `structure of query does not match function result type`

**Quick Fix:**
```sql
-- Drop dependencies first
DROP POLICY IF EXISTS user_roles_policy ON public.user_roles;
DROP POLICY IF EXISTS permissions_policy ON public.group_access_permissions;

-- Drop and recreate function  
DROP FUNCTION IF EXISTS get_user_role_info(text) CASCADE;

-- Then run the corrected function from: db/fix_function_types.sql
```

### 2. No Role Found Warning  
**Error:** `WARNING: [useRoleBasedAuth] No role found for user`

**Quick Fix:**
```sql
-- Check what roles exist
SELECT name FROM public.roles;

-- Assign basic staff role
INSERT INTO public.user_roles (user_email, role_id, is_active)
SELECT 'user@email.com', r.id, true 
FROM public.roles r WHERE r.name = 'staff_member';
```

### 3. Login Logging Errors (401/500)
**Error:** `POST .../user_login_log 401 (Unauthorized)`

**Quick Fix:**
```sql
-- Fix table permissions
ALTER TABLE public.user_login_log DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.user_login_log TO authenticated;
```

### 4. Edge Function 500 Errors
**Error:** `Edge Function returned a non-2xx status code`

**Quick Fix:** **Already disabled for optimal performance** ✅
- Edge Function logging is disabled in `Login.tsx`
- Role-based auth handles all logging efficiently

### 5. Missing Tables
**Error:** `relation "roles" does not exist`

**Quick Fix:**
```sql
-- Run complete migration
-- Copy contents of: db/complete_rbac_migration_final.sql
-- Paste into Supabase SQL Editor and execute
```

## 🔍 Debug Console Commands

### Check User Role
```javascript
// In browser console
console.log(window.localStorage.getItem('sb-project-auth-token'));
```

### Verify Database Connection
```sql  
-- In Supabase SQL Editor
SELECT 'Database connected!' as status;
SELECT count(*) as role_count FROM public.roles;
```

### Test Function Directly
```sql
-- Replace with actual email
SELECT * FROM get_user_role_info('your-email@scpng.gov.pg');
```

## 📊 Health Check Queries

### System Status
```sql
-- Check all core tables exist with data
SELECT 'roles' as table_name, count(*) as count FROM public.roles
UNION ALL  
SELECT 'user_roles', count(*) FROM public.user_roles
UNION ALL
SELECT 'divisions', count(*) FROM public.divisions;
```

### User Status  
```sql
-- Check specific user setup
SELECT 
  ur.user_email,
  r.name as role,
  ur.is_active,
  d.name as division
FROM public.user_roles ur
JOIN public.roles r ON ur.role_id = r.id  
LEFT JOIN public.divisions d ON ur.division_id = d.id
WHERE ur.user_email = 'your-email@scpng.gov.pg';
```

## 🎯 Quick Role Assignment

### Make Someone Admin
```sql
-- Emergency admin assignment
INSERT INTO public.user_roles (user_email, role_id, is_active)
SELECT 'emergency-admin@scpng.gov.pg', r.id, true
FROM public.roles r WHERE r.name = 'super_admin'
ON CONFLICT DO NOTHING;
```

### Create Custom Role  
```sql
-- Add new role
INSERT INTO public.roles (name, description, permissions) VALUES
('custom_role', 'Custom Role Description', '{"assets": ["read", "write"]}');

-- Assign to user  
INSERT INTO public.user_roles (user_email, role_id, is_active)
SELECT 'user@email.com', r.id, true
FROM public.roles r WHERE r.name = 'custom_role';
```

## 🔧 Reset Commands

### Reset User Role
```sql
-- Deactivate all roles for user
UPDATE public.user_roles 
SET is_active = false, deactivated_at = now()
WHERE user_email = 'user@email.com';

-- Assign new role
INSERT INTO public.user_roles (user_email, role_id, is_active)
SELECT 'user@email.com', r.id, true
FROM public.roles r WHERE r.name = 'staff_member';
```

### Clear Login Logs
```sql
-- Clean old login logs (optional)
DELETE FROM public.user_login_log 
WHERE login_timestamp < (CURRENT_TIMESTAMP - INTERVAL '30 days');
```

## 🚀 Success Indicators

### What Good Logs Look Like
```
✅ SUCCESS: ✅ USER ROLE LOADED SUCCESSFULLY
🔐 ROLE AUTHENTICATION SUCCESS
👤 User: john@scpng.gov.pg  
🎭 Role: super_admin
👑 Admin Status: ✅ YES
```

### What Functions Should Return
```sql
-- get_user_role_info should return:
user_email    | role_name    | is_admin | permissions
john@scpng... | super_admin  | true     | {"all": ["*"]}
```

## 📞 When All Else Fails

### Nuclear Reset (Last Resort)
```sql
-- ⚠️ WARNING: This deletes all role data
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;  
-- Then re-run: db/complete_rbac_migration_final.sql
```

### Disable All Security Temporarily  
```sql
-- For debugging only - DON'T use in production
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_login_log DISABLE ROW LEVEL SECURITY;
```

---

## 💡 Pro Tips

1. **Always check browser console first** - detailed error messages
2. **Test database functions directly** in SQL Editor  
3. **Verify environment variables** in Supabase project settings
4. **Check MSAL token expiry** if auth suddenly stops working
5. **Use the migration scripts** rather than manual table creation

**Most issues resolve with a simple role assignment!** 🎯

---

*For detailed explanations, see: [role-based-authentication-system.md](./role-based-authentication-system.md)* 
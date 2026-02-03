import { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { logger } from '@/lib/supabaseClient'; // Keeping logger for now
import { loginRequest } from '../authConfig';
import { UserSharePointService, UserRole } from '@/services/userSharePointService';
import { getGraphClient } from '@/services/graphService';

interface RoleBasedAuth {
  user: UserRole | null;
  loading: boolean;
  error: string | null;
  hasPermission: (resource: string, action: string) => boolean;
  isAdmin: boolean;
  refreshRole: () => Promise<void>;
  checkResourceAccess: (resource: string, actions?: string[]) => boolean;
}

export const useRoleBasedAuth = (): RoleBasedAuth => {
  const { instance, accounts } = useMsal();
  const [user, setUser] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchUserRole = async (emailInput: string, force: boolean = false) => {
    const email = emailInput.toLowerCase();

    // Skip fetch if we already have user data and it's not a forced refresh
    if (!force && user && user.user_email === email) {
      logger.info('[useRoleBasedAuth] User data already loaded, skipping fetch');
      return;
    }

    try {
      // Only set loading if this is the initial fetch (no user data exists yet)
      // This prevents full-page reload flash on navigation
      if (!user || force) {
        setLoading(true);
      }
      setError(null);
      logger.info('[useRoleBasedAuth] Fetching user role for email:', { email });

      const graphClient = await getGraphClient(instance);
      if (!graphClient) {
        throw new Error("Failed to initialize Graph Client");
      }
      const userService = new UserSharePointService(graphClient);
      const userData = await userService.getUser(email);

      if (userData) {
        setUser(userData);
        setHasFetched(true);

        logger.success('✅ USER ROLE LOADED SUCCESSFULLY', {
          user_email: userData.user_email,
          role_name: userData.role_name,
          division_name: userData.division_name || 'No Division',
          is_admin: userData.is_admin,
          permissions: userData.permissions,
        });

      } else {
        // User has no role assigned
        logger.warn('[useRoleBasedAuth] No role found for user:', { email });
        setError('Account pending role assignment. Contact your administrator.');
        setUser(null);
        setHasFetched(true);
      }
    } catch (err: any) {
      logger.error('[useRoleBasedAuth] Error fetching user role:', err);
      setError(err.message || 'Failed to fetch user role');
      setUser(null);
      setHasFetched(true);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (resource: string, action: string): boolean => {
    if (!user) {
      return false;
    }

    // Super admin has all permissions
    if (user.is_admin) {
      return true;
    }

    // Check specific permissions
    const permissions = user.permissions || {};

    // Check if user has "all" permissions (wildcard)
    if (permissions.all?.includes('*')) {
      return true;
    }

    // Check specific resource permissions
    const hasAccess = permissions[resource]?.includes(action) ||
      permissions[resource]?.includes('*') ||
      false;

    return hasAccess;
  };

  const checkResourceAccess = (resource: string, actions: string[] = ['read']): boolean => {
    return actions.every(action => hasPermission(resource, action));
  };

  const refreshRole = async () => {
    if (accounts[0]?.username) {
      await fetchUserRole(accounts[0].username, true); // Force refresh
    }
  };

  useEffect(() => {
    const currentEmail = accounts[0]?.username?.toLowerCase();

    // Only fetch if we haven't fetched before
    if (currentEmail && !hasFetched) {
      fetchUserRole(currentEmail);
    } else if (!currentEmail) {
      // No account available
      setLoading(false);
      setUser(null);
    } else if (hasFetched && currentEmail) {
      // Already fetched for this account, ensure loading is false
      // This prevents loading state from being stuck
      if (loading) {
        setLoading(false);
      }
    }
  }, [accounts, hasFetched]);

  return {
    user,
    loading,
    error,
    hasPermission,
    isAdmin: user?.is_admin || false,
    refreshRole,
    checkResourceAccess
  };
};

export default useRoleBasedAuth;

import { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { logger } from '@/lib/supabaseClient'; // Keeping logger for now
import { loginRequest } from '@/integrations/microsoft/msalConfig';
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
  const { instance, accounts, inProgress } = useMsal();
  const [user, setUser] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchUserRole = async (emailInput: string, force: boolean = false) => {
    const email = emailInput.toLowerCase();
    const cacheKey = `scpng_user_role_${email}`;

    // Skip fetch if we already have user data and it's not a forced refresh
    if (!force && user && user.user_email === email) {
      logger.info('[useRoleBasedAuth] User data already loaded, skipping fetch');
      // Ensure loading is false if we have data
      if (loading) setLoading(false);
      return;
    }

    try {
      // Only set loading if this is the initial fetch (no user data exists yet)
      // This prevents full-page reload flash on navigation
      if (!user || force) {
        // If we have cached data, use it immediately to prevent loading state
        const cached = localStorage.getItem(cacheKey);
        if (cached && !force) {
          try {
            const parsedUser = JSON.parse(cached);
            setUser(parsedUser);
            // We set loading false immediately to show cached content
            setLoading(false);
            logger.info('[useRoleBasedAuth] User loaded from cache', { email });
            // We still continue to fetch in background to revalidate, but we don't block
          } catch (e) {
            console.warn('Failed to parse cached user role', e);
            setLoading(true);
          }
        } else {
          setLoading(true);
        }
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

        // Save to cache
        localStorage.setItem(cacheKey, JSON.stringify(userData));

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
      // Don't overwrite existing user data on error if we have it (e.g. from cache)
      if (!user) {
        setError(err.message || 'Failed to fetch user role');
        setUser(null);
      }
      setHasFetched(true);
    } finally {
      if (loading) setLoading(false);
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
    const activeAccount = instance.getActiveAccount() || accounts[0];
    if (activeAccount?.username) {
      await fetchUserRole(activeAccount.username, true); // Force refresh
    }
  };

  useEffect(() => {
    // Wait for MSAL to define accounts
    if (inProgress !== InteractionStatus.None) {
      // Still initializing or handling redirect, keep loading true
      // unless we already have a user from cache which we might have set above
      if (!user) setLoading(true);
      return;
    }

    const currentAccounts = accounts.length > 0 ? accounts : instance.getAllAccounts();
    const activeAccount = instance.getActiveAccount() || currentAccounts[0];
    const currentEmail = activeAccount?.username?.toLowerCase();

    // Only fetch if we haven't fetched before
    if (currentEmail) {
      if (!hasFetched || (user && user.user_email !== currentEmail)) {
        fetchUserRole(currentEmail);
      } else {
        // We have fetched and emails match, make sure loading is off
        if (loading) setLoading(false);
      }
    } else {
      // No account available and MSAL is done
      setLoading(false);
      setUser(null);
    }
  }, [accounts, inProgress, instance, hasFetched, user]);

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

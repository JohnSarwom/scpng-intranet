import { useSupabaseAuth } from './useSupabaseAuth';
import { User as SupabaseUser } from '@supabase/supabase-js';

// Re-export the User type with additional properties
export interface User extends SupabaseUser {
  role?: 'admin' | 'manager' | 'user';
  unitId?: string;
  unitName?: string;
  name?: string;
}

export type UserRole = 'admin' | 'manager' | 'user';

// Re-export the hook with additional properties
export const useAuth = () => {
  const auth = useSupabaseAuth();

  // Add any missing properties used in the existing code
  return {
    ...auth,
    isAdmin: auth.user?.app_metadata?.role === 'admin',
    // Provide backwards compatibility
    isAuthenticated: auth.isAuthenticated
  };
};

export default useAuth; 
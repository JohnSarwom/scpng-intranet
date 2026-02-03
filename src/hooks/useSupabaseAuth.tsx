import { useState, useEffect, createContext, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import { toast } from 'sonner';
import { User, Session } from '@supabase/supabase-js';
import { useMsal } from '@azure/msal-react';
import {
    signInWithProvider,
    signInWithEmail,
    signOut,
    getCurrentUser,
    getCurrentSession,
    setupAuthStateListener
} from '@/integrations/supabase/supabaseAuth';
import { AccountInfo } from '@azure/msal-browser';
import { supabase, logger } from '@/lib/supabaseClient';

// Define the structure of the user profile from Microsoft Graph
export interface UserProfile {
    displayName?: string;
    mail?: string;
    jobTitle?: string;
    department?: string;
    [key: string]: any; // Allow other properties
}

// Auth context type
interface SupabaseAuthContextType {
    user: User | null;
    session: Session | null;
    profile: UserProfile | null; // Add profile to the context
    isAuthenticated: boolean;
    isLoading: boolean;
    isSyncingSession: boolean; // New state for session syncing
    loginWithEmail: (email: string, password: string) => Promise<void>;
    loginWithProvider: (provider: 'google' | 'github' | 'azure') => Promise<void>;
    logout: () => Promise<void>;
    error: string | null;
    setUser: Dispatch<SetStateAction<User | null>>;
}

// Create context
const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

// Provider component
export const SupabaseAuthProvider = ({ children }: { children: ReactNode }) => {
    const { accounts } = useMsal();
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null); // State for user profile
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncingSession, setIsSyncingSession] = useState(false); // New state
    const [error, setError] = useState<string | null>(null);

    // Function to fetch user profile from Microsoft Graph
    const fetchUserProfile = async (accessToken: string) => {
        try {
            const response = await fetch('https://graph.microsoft.com/v1.0/me', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch user profile from Microsoft Graph');
            }
            const userProfile = await response.json();
            console.log('User Profile from MS Graph:', userProfile); // Log the user profile
            setProfile(userProfile);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
                toast.error(`Failed to fetch profile: ${err.message}`);
            }
        }
    };

    // Effect to sync Supabase session with MSAL state
    useEffect(() => {
        const syncSupabaseSession = async () => {
            if (accounts && accounts.length > 0) {
                setIsSyncingSession(true);
                logger.info('[SupabaseAuthProvider] MSAL account detected. Starting Supabase session sync.');
                try {
                    const currentSession = await getCurrentSession();
                    logger.info('[SupabaseAuthProvider] Sync Supabase session result:', { sessionExists: !!currentSession, session: currentSession });
                    setSession(currentSession);
                    if (currentSession) {
                        const currentUser = await getCurrentUser();
                        setUser(currentUser);
                        if (currentSession.provider_token) {
                            logger.info('[SupabaseAuthProvider] Fetching user profile with provider token.');
                            await fetchUserProfile(currentSession.provider_token);
                        } else {
                            logger.warn('[SupabaseAuthProvider] No provider token found for MSAL account.');
                        }
                    } else {
                        logger.warn('[SupabaseAuthProvider] No active Supabase session found after MSAL account detection.');
                    }
                } catch (err) {
                    logger.error('[SupabaseAuthProvider] Error syncing Supabase session with MSAL:', err);
                    setSession(null);
                    setUser(null);
                    setProfile(null);
                } finally {
                    setIsSyncingSession(false);
                    logger.info('[SupabaseAuthProvider] Supabase session sync finished.');
                }
            } else {
                logger.info('[SupabaseAuthProvider] No MSAL account detected. Clearing Supabase session and profile.');
                setSession(null);
                setUser(null);
                setProfile(null);
            }
        };
        syncSupabaseSession();
    }, [accounts]);

    // Initialize authentication state and listener
    useEffect(() => {
        setIsLoading(true);
        setError(null);

        const subscription = setupAuthStateListener(async (event, session) => {
            logger.info(`[SupabaseAuthProvider] Auth event received: ${event}`, { event, sessionExists: !!session, session });
            setSession(session);
            setUser(session?.user || null);

            if (session?.provider_token) {
                logger.info('[SupabaseAuthProvider] Auth state change: Fetching user profile with provider token.');
                await fetchUserProfile(session.provider_token);
            } else {
                logger.info('[SupabaseAuthProvider] Auth state change: Clearing profile on sign out or no provider token.');
                setProfile(null); // Clear profile on sign out
            }

            switch (event) {
                case 'SIGNED_IN':
                    toast.success('Signed in successfully');
                    logger.info('[SupabaseAuthProvider] User signed in.');
                    break;
                case 'SIGNED_OUT':
                    toast.info('Signed out');
                    logger.info('[SupabaseAuthProvider] User signed out.');
                    break;
                case 'USER_UPDATED':
                    toast.info('User information updated');
                    logger.info('[SupabaseAuthProvider] User information updated.');
                    if (session?.provider_token) {
                        logger.info('[SupabaseAuthProvider] User updated: Fetching user profile with provider token.');
                        await fetchUserProfile(session.provider_token);
                    }
                    break;
                case 'TOKEN_REFRESHED':
                    logger.info('[SupabaseAuthProvider] Supabase token refreshed.');
                    if (session?.provider_token) {
                        logger.info('[SupabaseAuthProvider] Token refreshed: Fetching user profile with provider token.');
                        await fetchUserProfile(session.provider_token);
                    }
                    break;
                default:
                    logger.info(`[SupabaseAuthProvider] Unhandled auth event: ${event}`);
                    break;
            }
        });

        setIsLoading(false);

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    // Login with email and password
    const loginWithEmail = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const data = await signInWithEmail(email, password);
            setSession(data.session);
            setUser(data.user);

            return Promise.resolve();
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
                toast.error(`Login failed: ${err.message}`);
            } else {
                setError('An unknown error occurred');
                toast.error('Login failed. Please try again.');
            }
            return Promise.reject(err);
        } finally {
            setIsLoading(false);
        }
    };

    // Login with a provider
    const loginWithProvider = async (provider: 'google' | 'github' | 'azure') => {
        try {
            setIsLoading(true);
            setError(null);

            await signInWithProvider(provider);

            // The authentication will happen through the redirect flow,
            // so we don't update state here

            return Promise.resolve();
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
                toast.error(`Login failed: ${err.message}`);
            } else {
                setError('An unknown error occurred');
                toast.error('Login failed. Please try again.');
            }
            setIsLoading(false);
            return Promise.reject(err);
        }
    };

    // Logout
    const logout = async () => {
        try {
            setIsLoading(true);
            setError(null);

            await signOut();
            setSession(null);
            setUser(null);

            return Promise.resolve();
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
                toast.error(`Logout failed: ${err.message}`);
            } else {
                setError('An unknown error occurred');
                toast.error('Logout failed. Please try again.');
            }
            return Promise.reject(err);
        } finally {
            setIsLoading(false);
        }
    };

    // Context value
    const value: SupabaseAuthContextType = {
        user,
        session,
        profile, // Expose profile in the context
        isAuthenticated: !!user,
        isLoading,
        isSyncingSession,
        loginWithEmail,
        loginWithProvider,
        logout,
        error,
        setUser
    };

    return (
        <SupabaseAuthContext.Provider value={value}>
            {children}
        </SupabaseAuthContext.Provider>
    );
};

// Hook for using the auth context
export const useSupabaseAuth = () => {
    const context = useContext(SupabaseAuthContext);

    if (context === undefined) {
        throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
    }

    return context;
};

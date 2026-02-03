import React, { useEffect, useState, createContext, useContext } from 'react';
import {
  PublicClientApplication,
  EventType,
  EventMessage,
  AuthenticationResult,
  AccountInfo,
  IPublicClientApplication
} from '@azure/msal-browser';
import { MsalProvider as MsalReactProvider } from '@azure/msal-react';
import msalConfig, { updateMsalConfig, loginRequest } from './msalConfig';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth.tsx';
import { toast } from 'sonner';
import { getUserProfile, setMsalInstance, getAccount } from './msalService';
import microsoftAuthConfig from '@/config/microsoft-auth';
import { supabase } from '@/lib/supabaseClient'; // Keep for invoking edge function if needed here
import { Loader2 } from 'lucide-react';

// Define admin emails that match the ones in useAuth.tsx
const ADMIN_EMAILS = ['geosyncsurvey@gmail.com', 'admin@scpng.com'];

// Create a context for the MSAL instance
interface MsalContextValue {
  msalInstance: IPublicClientApplication | null;
  isInitialized: boolean;
  isInitializing: boolean;
  authError: Error | null;
}

export const MsalContext = createContext<MsalContextValue>({
  msalInstance: null,
  isInitialized: false,
  isInitializing: false,
  authError: null
});

// Hook to access the MSAL instance directly
export const useMsalContext = () => useContext(MsalContext);

// Component to wrap the application with the MSAL provider
export const MsalAuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Attempt to call useSupabaseAuth hook very early, after state hooks if any that affect its call.
  // For now, to be safe, let's place it before useState hooks if its call isn't dependent on them,
  // or immediately after if it is. Given it provides a context, it should be high up.

  let supabaseAuthContextData = null;
  let setUserFunction: ((user: any | null) => void) | undefined = undefined; // Renamed to avoid conflict if setUser was a prop
  try {
    supabaseAuthContextData = useSupabaseAuth();
    if (supabaseAuthContextData) {
      setUserFunction = supabaseAuthContextData.setUser;
      console.log('[MsalAuthProvider] Successfully accessed SupabaseAuthContext very early.');
    } else {
      console.warn('[MsalAuthProvider] useSupabaseAuth() returned undefined very early, but did not throw.');
    }
  } catch (error: any) {
    console.error('[MsalAuthProvider] Error calling useSupabaseAuth() very early:', error.message);
  }

  const [msalInstance, setMsalInstanceState] = useState<PublicClientApplication | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [authError, setAuthError] = useState<Error | null>(null);
  const [forceSignIn, setForceSignIn] = useState(false);
  const [pendingMsalAccount, setPendingMsalAccount] = useState<AccountInfo | null>(null);

  // The original location of useSupabaseAuth call is now removed.
  // console.log('[MsalAuthProvider] No longer directly accessing SupabaseAuthContext here.');

  useEffect(() => {
    // If setUserFunction is needed here, it can be accessed from the outer scope.
    // Example: if (setUserFunction) { /* use it */ }
    const initializeMsal = async () => {
      if (isInitializing || isInitialized) return;

      try {
        setIsInitializing(true);

        // Clear any stale MSAL state on initialization
        if (typeof window !== 'undefined') {
          try {
            Object.keys(sessionStorage)
              .filter(key => key.startsWith('msal.'))
              .forEach(key => sessionStorage.removeItem(key));
            sessionStorage.removeItem('msal.interaction.status');
            sessionStorage.removeItem('msal.interaction.error');
          } catch (e) {
            console.warn('Unable to clean session storage:', e);
          }
          localStorage.removeItem('msalLoginAttempts');
        }

        const configToUse = updateMsalConfig({ ...microsoftAuthConfig });
        console.log('Initializing MSAL with config:', configToUse);
        const instance = new PublicClientApplication(configToUse);

        instance.addEventCallback((event: EventMessage) => {
          if (event.eventType === EventType.LOGIN_SUCCESS) {
            console.log('[MsalAuthProvider] MSAL Login success event detected');
            const result = event.payload as AuthenticationResult;
            if (result && result.account) {
              instance.setActiveAccount(result.account);
              // The Login.tsx component should handle invoking the Supabase Edge Function
              // after this MSAL login success.
            }
          } else if (event.eventType === EventType.LOGIN_FAILURE) {
            console.error('[MsalAuthProvider] MSAL Login failure event detected:', event.error);
          } else if (event.eventType === EventType.HANDLE_REDIRECT_START) {
            console.log('[MsalAuthProvider] MSAL Starting redirect handling...');
          } else if (event.eventType === EventType.HANDLE_REDIRECT_END) {
            console.log('[MsalAuthProvider] MSAL Finished redirect handling');
          }
        });

        await instance.initialize();
        console.log('[MsalAuthProvider] MSAL initialized successfully');

        setMsalInstanceState(instance);
        setMsalInstance(instance); // For msalService
        setIsInitialized(true);
        if (typeof window !== 'undefined') { (window as any).msalInstance = instance; }

        // Simplified redirect handling: MSAL handles its state.
        // The crucial part is that after MSAL login, the app (e.g., Login.tsx or a callback)
        // should trigger the Supabase session creation (e.g., via your Edge Function).
        try {
          console.log('[MsalAuthProvider] Attempting to handle redirect promise...');
          const response = await instance.handleRedirectPromise();
          if (response && response.account) {
            console.log('[MsalAuthProvider] MSAL Redirect response processed, account set active.', response.account.username);
            instance.setActiveAccount(response.account);
            // Again, the bridge to Supabase session should happen elsewhere (e.g. Login.tsx)
          } else {
            const accounts = instance.getAllAccounts();
            if (accounts.length > 0) {
              console.log('[MsalAuthProvider] MSAL Existing accounts found, setting active account:', accounts[0].username);
              instance.setActiveAccount(accounts[0]);
            } else {
              console.log('[MsalAuthProvider] MSAL No redirect response and no existing accounts.');
            }
          }
        } catch (redirectError: any) {
          console.error('[MsalAuthProvider] MSAL Error during handleRedirectPromise:', redirectError.message);
          setAuthError(redirectError instanceof Error ? redirectError : new Error(String(redirectError)));
          setForceSignIn(true);
        }

      } catch (err: any) {
        console.error('[MsalAuthProvider] Error initializing MSAL:', err.message);
        setAuthError(err instanceof Error ? err : new Error(String(err)));
        toast.error('Failed to initialize Microsoft authentication.');
      } finally {
        setIsInitializing(false);
      }
    };

    if (!isInitialized && !isInitializing) {
      initializeMsal();
    }
    // Removed setUser from dependency array as it's no longer used directly here
    // The msalInstance dependency might cause re-runs if its reference changes, which is fine.
  }, [isInitialized, isInitializing, msalInstance]);

  const contextValue = {
    msalInstance,
    isInitialized,
    isInitializing,
    authError
  };

  if (isInitializing || !isInitialized || !msalInstance) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-600">Initializing Authentication Library...</span>
      </div>
    );
  }

  const renderFallbackContent = () => {
    if (authError || forceSignIn) {
      return (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Authentication Issue Detected</h2>
            <p className="mb-4">
              We're having trouble logging you in automatically. Please try clicking the button below.
            </p>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  Object.keys(sessionStorage)
                    .filter(key => key.startsWith('msal.'))
                    .forEach(key => sessionStorage.removeItem(key));
                  localStorage.removeItem('msalLoginAttempts');
                }
                try {
                  if (msalInstance) {
                    msalInstance.loginRedirect({
                      scopes: microsoftAuthConfig.permissions || [],
                      redirectUri: microsoftAuthConfig.redirectUri,
                      prompt: 'select_account'
                    });
                  } else {
                    console.error('[MsalAuthProvider] msalInstance is null, cannot loginRedirect.');
                    toast.error("Authentication library not ready. Please refresh.");
                  }
                } catch (error) {
                  console.error('[MsalAuthProvider] Manual login redirect failed:', error);
                  alert('Login failed. Please refresh the page and try again.');
                }
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
            >
              Sign in with Microsoft
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <MsalContext.Provider value={contextValue}>
      <MsalReactProvider instance={msalInstance}>
        {renderFallbackContent()}
        {children}
      </MsalReactProvider>
    </MsalContext.Provider>
  );
};

export default MsalAuthProvider; 
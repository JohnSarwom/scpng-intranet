import { 
  PopupRequest, 
  RedirectRequest, 
  AuthenticationResult, 
  SilentRequest,
  AccountInfo,
  PublicClientApplication,
  IPublicClientApplication,
  InteractionRequiredAuthError
} from '@azure/msal-browser';
import { loginRequest } from './msalConfig';
import microsoftAuthConfig from '@/config/microsoft-auth';
import { supabase } from '@/lib/supabaseClient';

// MSAL instance cache
let msalInstanceRef: IPublicClientApplication | null = null;

/**
 * Set the MSAL instance reference
 */
export const setMsalInstance = (instance: IPublicClientApplication) => {
  msalInstanceRef = instance;
};

/**
 * Get the MSAL instance, either from the reference or the window object (legacy support)
 */
export const getMsalInstance = (): IPublicClientApplication | null => {
  // First try to get the instance from our module-level reference
  if (msalInstanceRef) {
    return msalInstanceRef;
  }
  
  // Fallback to window for backward compatibility
  if (typeof window !== 'undefined' && (window as any).msalInstance) {
    return (window as any).msalInstance;
  }
  
  console.error('MSAL instance not found. Make sure MsalProvider is initialized.');
  return null;
};

/**
 * Get the current signed-in account
 */
export const getAccount = (msalInstance?: IPublicClientApplication): AccountInfo | null => {
  const instance = msalInstance || getMsalInstance();
  if (!instance) return null;
  
  // Get active account first
  const activeAccount = instance.getActiveAccount();
  if (activeAccount) return activeAccount;
  
  // Fallback to first account in cache
  const accounts = instance.getAllAccounts();
  return accounts.length > 0 ? accounts[0] : null;
};

/**
 * Acquire a token silently, with interaction fallback if needed
 */
export const getAccessToken = async (
  scopes: string[] = microsoftAuthConfig.permissions || [],
  msalInstance?: IPublicClientApplication
): Promise<string | null> => {
  try {
    const instance = msalInstance || getMsalInstance();
    if (!instance) {
      throw new Error('MSAL instance not available. Ensure you are within the MsalProvider context.');
    }

    const account = getAccount(instance);
    if (!account) {
      console.log('No account found, redirecting to login...');
      await loginRedirect();
      return null;
    }

    const request = {
      scopes,
      account,
      forceRefresh: false
    };

    try {
      console.log('Attempting silent token acquisition...');
      const response = await instance.acquireTokenSilent(request);
      console.log('Token acquired silently.');
      return response.accessToken;
    } catch (error) {
      console.warn('Silent token acquisition failed:', error);
      
      if (error instanceof InteractionRequiredAuthError) {
        console.log('Interaction required, attempting redirect flow...');
        try {
          await instance.acquireTokenRedirect(request);
          // This will redirect, so we won't reach this point
          return null;
        } catch (redirectError) {
          console.error('Redirect authentication failed:', redirectError);
          throw redirectError;
        }
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Token acquisition failed:', error);
    return null;
  }
};

/**
 * Initiate login via redirect flow
 */
export const loginRedirect = async (msalInstance?: IPublicClientApplication): Promise<void> => {
  const instance = msalInstance || getMsalInstance();
  if (!instance) {
    throw new Error('MSAL instance not available.');
  }
  
  try {
    // Use the exact redirect URI from config that matches what's registered in Azure
    const redirectUri = microsoftAuthConfig.redirectUri;
    console.log(`Using redirectUri: ${redirectUri}`);
    
    // Clear any existing state that might interfere with new login attempt
    if (typeof window !== 'undefined') {
      // Clear any stale interaction status
      sessionStorage.removeItem('msal.interaction.status');
      sessionStorage.removeItem('msal.interaction.error');
      // Remove counter for login attempts if exists
      localStorage.removeItem('msalLoginAttempts');
    }
    
    await instance.loginRedirect({
      scopes: microsoftAuthConfig.permissions || [],
      redirectUri: redirectUri 
    });
  } catch (error) {
    console.error('Login redirect failed:', error);
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
  }
};

/**
 * Log out the current user
 */
export const logout = async (msalInstance?: IPublicClientApplication): Promise<void> => {
  const instance = msalInstance || getMsalInstance();
  if (!instance) {
    console.warn('MSAL instance not available. Unable to logout.');
    return;
  }
  
  try {
    const account = getAccount(instance);
    // Use the exact URI from config
    const postLogoutUri = microsoftAuthConfig.redirectUri;
    
    await instance.logoutRedirect({
      account,
      postLogoutRedirectUri: postLogoutUri
    });
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
};

/**
 * Call Microsoft Graph API
 */
export const callMsGraphApi = async (
  endpoint: string,
  msalInstance?: IPublicClientApplication
): Promise<any> => {
  try {
    const accessToken = await getAccessToken(microsoftAuthConfig.permissions || [], msalInstance);
    if (!accessToken) {
      throw new Error('Unable to acquire access token for Graph API call.');
    }
    
    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Graph API returned ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling Microsoft Graph API:', error);
    throw error;
  }
};

/**
 * Get the user profile from Microsoft Graph API
 */
export const getUserProfile = async (
  msalInstance?: IPublicClientApplication,
  endpoint: string = microsoftAuthConfig.apiEndpoint
): Promise<any> => {
  try {
    const token = await getAccessToken(microsoftAuthConfig.permissions || [], msalInstance);
    if (!token) {
      throw new Error('Unable to acquire access token for user profile.');
    }
    
    const response = await fetch(`${endpoint}/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Graph API returned ${response.status}: ${errorText}`);
    }
    
    const profile = await response.json();
    
    // Try to get profile photo if available
    try {
      console.log('Attempting to fetch user profile photo...');
      const photoResponse = await fetch(`${endpoint}/me/photo/$value`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (photoResponse.ok) {
        console.log('Profile photo response OK.');
        const photoBlob = await photoResponse.blob();
        profile.photo = URL.createObjectURL(photoBlob);
        console.log('Profile photo set successfully.');
      } else {
        console.warn(`Failed to fetch profile photo, status: ${photoResponse.status}`);
        profile.photo = null;
      }
    } catch (photoError) {
      console.error('Error fetching profile photo:', photoError);
      profile.photo = null;
    }
    
    return profile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Handle redirect response after login
 */
export const handleRedirectResponse = async (
  msalInstance?: IPublicClientApplication
): Promise<AuthenticationResult | null> => {
  try {
    const instance = msalInstance || getMsalInstance();
    if (!instance) {
      console.error('MSAL instance not available during redirect handling');
      return null;
    }

    console.log('Starting redirect response handling...');
    
    // Check if there are auth parameters in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlHash = window.location.hash;
    const hasAuthParams = urlParams.has('code') || urlParams.has('error') || 
                          urlHash.includes('access_token') || urlHash.includes('id_token');
    
    console.log('URL contains auth parameters:', hasAuthParams);
    console.log('Current URL hash:', urlHash ? urlHash : '[EMPTY]');
    console.log('Current URL search:', window.location.search);
    
    // Clear storage state to ensure a clean state
    if (hasAuthParams) {
      console.log('Auth parameters detected in URL, clearing any stale state before processing');
      sessionStorage.removeItem('msal.interaction.status');
    }

    // Process the redirect with detailed logging
    console.log('Calling handleRedirectPromise() to process auth response...');
    
    // Set a timeout to detect hanging redirect
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => {
        console.log('Redirect handling timed out after 10 seconds');
        resolve(null);
      }, 10000); // 10 second timeout
    });
    
    // Race between the redirect handling and timeout
    const response = await Promise.race([
      instance.handleRedirectPromise().then(response => {
        console.log('Redirect handling completed with result:', response ? 'Success' : 'No response');
        return response;
      }),
      timeoutPromise
    ]);
    
    if (response) {
      console.log('Authentication successful via redirect');
      console.log('Account:', response.account.username);
      
      // Set the account as active
      instance.setActiveAccount(response.account);
      
      return response;
    } else {
      // Check if there are any accounts we can use
      const accounts = instance.getAllAccounts();
      if (accounts.length > 0) {
        console.log('No redirect response, but found existing account:', accounts[0].username);
        instance.setActiveAccount(accounts[0]);
      } else {
        console.log('No accounts found after redirect handling');
      }
      
      return null;
    }
  } catch (error) {
    console.error('Error handling redirect response:', error);
    
    // Enhanced error reporting
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // Check for specific errors that might help diagnose the issue
      if (error.message.includes('interaction_in_progress')) {
        console.error('There is already an interaction in progress. Clear browser state and try again.');
        // Try to clear the interaction state
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.removeItem('msal.interaction.status');
        }
      }
    }
    
    return null;
  }
};

/**
 * Diagnose common authentication issues
 */
export const diagnoseMsalIssues = (): {
  issues: string[];
  recommendations: string[];
} => {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  try {
    // Check if MSAL instance exists
    const instance = getMsalInstance();
    if (!instance) {
      issues.push('MSAL instance not found');
      recommendations.push('Make sure MSAL is properly initialized before attempting login');
      return { issues, recommendations };
    }
    
    // Check environment
    if (typeof window === 'undefined') {
      issues.push('Running in server-side environment');
      recommendations.push('MSAL authentication should be performed client-side only');
    }
    
    // Check current URL vs configured redirect URI
    const currentOrigin = window.location.origin;
    const redirectUri = microsoftAuthConfig.redirectUri;
    
    console.log('Diagnosis - Current origin:', currentOrigin);
    console.log('Diagnosis - Configured redirectUri:', redirectUri);
    
    if (!redirectUri.startsWith(currentOrigin)) {
      issues.push(`Current origin (${currentOrigin}) doesn't match redirect URI origin`);
      recommendations.push(`Update redirect URI to match the current application origin`);
    }
    
    // Check for redirect loop possibility
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('error')) {
      const error = urlParams.get('error');
      const errorDesc = urlParams.get('error_description');
      
      issues.push(`Auth error in URL: ${error}`);
      if (errorDesc) {
        issues.push(`Error description: ${errorDesc}`);
      }
      
      if (error === 'redirect_uri_mismatch') {
        recommendations.push('The redirect URI configured in Azure AD does not match the URI used by the application');
        recommendations.push(`Ensure the exact URI "${redirectUri}" is added to the Azure portal`);
      }
    }
    
    // Check configured scopes
    const scopes = microsoftAuthConfig.permissions || [];
    if (!scopes.includes('User.Read')) {
      issues.push('Basic User.Read scope is missing from permissions');
      recommendations.push('Add User.Read to the permissions list for basic profile access');
    }
    
    // Check existing accounts
    const accounts = instance.getAllAccounts();
    console.log('Diagnosis - Accounts in cache:', accounts.length);
    
    // Check browser storage
    let storageIssue = false;
    try {
      localStorage.setItem('msal_test', 'test');
      localStorage.removeItem('msal_test');
    } catch (e) {
      storageIssue = true;
      issues.push('Unable to access localStorage');
      recommendations.push('Check browser privacy settings or incognito mode');
    }
    
    try {
      sessionStorage.setItem('msal_test', 'test');
      sessionStorage.removeItem('msal_test');
    } catch (e) {
      storageIssue = true;
      issues.push('Unable to access sessionStorage');
      recommendations.push('Check browser privacy settings or incognito mode');
    }
    
    // If no specific issues found but still not working
    if (issues.length === 0) {
      recommendations.push('Clear browser cache and cookies, then try again');
      recommendations.push('Check Azure AD configuration for correct redirect URI');
      recommendations.push('Ensure the tenant ID and client ID are correct');
    }
    
    return { issues, recommendations };
  } catch (error) {
    issues.push('Error running diagnostics');
    if (error instanceof Error) {
      issues.push(`Diagnostic error: ${error.message}`);
    }
    recommendations.push('Check browser console for detailed error messages');
    return { issues, recommendations };
  }
};

/**
 * Login with Microsoft using best practices
 */
export const loginWithMicrosoft = async (instance: IPublicClientApplication): Promise<void> => {
  try {
    // Ensure we have a valid MSAL instance
    if (!instance) {
      throw new Error('MSAL instance not available for login');
    }
    
    // Try popup login first as it's more reliable
    console.log('Attempting login with popup');
    
    // Clear any existing login attempt counters
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('msalLoginAttempts');
    }
    
    // Get all existing accounts first
    const accounts = instance.getAllAccounts();
    console.log('Existing accounts:', accounts.length);
    
    // Use the proper redirect URI from config
    const redirectUri = microsoftAuthConfig.redirectUri;
    console.log('Starting login with redirectUri:', redirectUri);
    
    // Try popup login with error handling
    try {
      const response = await instance.loginPopup({
        scopes: microsoftAuthConfig.permissions || ['User.Read'],
        redirectUri: redirectUri
      });
      
      console.log('Login success:', response.account?.username);
      
      // Set the account as active
      if (response.account) {
        instance.setActiveAccount(response.account);
        
        // Force browser to clear hash to prevent redirect issues on refresh
        if (window.location.hash && 
            (window.location.hash.includes('access_token') || 
             window.location.hash.includes('error') || 
             window.location.hash.includes('code'))) {
          window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
        }
      }
      
      return;
    } catch (popupError) {
      console.error('Popup login failed, attempting redirect:', popupError);
      
      // If popup fails, fall back to redirect
      // This could happen in browsers that block popups
      
      // Set a flag to track login attempts
      localStorage.setItem('msalLoginAttempts', '1');
      
      await instance.loginRedirect({
        scopes: microsoftAuthConfig.permissions || ['User.Read'],
        redirectUri: redirectUri
      });
    }
  } catch (error) {
    console.error('Microsoft login failed:', error);
    throw error;
  }
};

export default {
  getMsalInstance,
  setMsalInstance,
  getAccount,
  getAccessToken,
  loginRedirect,
  logout,
  callMsGraphApi,
  getUserProfile,
  handleRedirectResponse
}; 
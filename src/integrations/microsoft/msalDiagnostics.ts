import { AuthenticationResult, IPublicClientApplication, InteractionRequiredAuthError } from '@azure/msal-browser';
import microsoftAuthConfig from '@/config/microsoft-auth';
import { getMsalInstance } from './msalService';

interface DiagnosticResult {
  success: boolean;
  issues: string[];
  recommendations: string[];
  details: Record<string, any>;
}

/**
 * Run comprehensive diagnostics on MSAL authentication setup
 */
export const runMsalDiagnostics = async (): Promise<DiagnosticResult> => {
  const issues: string[] = [];
  const recommendations: string[] = [];
  const details: Record<string, any> = {};
  
  try {
    console.log('Starting MSAL authentication diagnostics...');
    
    // Check if running in browser
    if (typeof window === 'undefined') {
      issues.push('Running in server environment');
      recommendations.push('MSAL authentication must run in browser environment');
      return { 
        success: false, 
        issues, 
        recommendations, 
        details: { environment: 'server' } 
      };
    }
    
    // Check for MSAL instance
    const msalInstance = getMsalInstance();
    if (!msalInstance) {
      issues.push('MSAL instance not found');
      recommendations.push('Ensure MSAL is properly initialized before using authentication');
      return { 
        success: false, 
        issues, 
        recommendations, 
        details: { msalInitialized: false } 
      };
    }
    
    details.msalInitialized = true;
    
    // Check configuration
    details.config = {
      clientId: microsoftAuthConfig.clientId,
      redirectUri: microsoftAuthConfig.redirectUri,
      authority: microsoftAuthConfig.authorityUrl,
      scopes: microsoftAuthConfig.permissions
    };
    
    // Check for redirect URI mismatch
    const currentOrigin = window.location.origin;
    details.currentOrigin = currentOrigin;
    
    if (!microsoftAuthConfig.redirectUri.startsWith(currentOrigin)) {
      issues.push(`Redirect URI mismatch - current: ${currentOrigin}, configured: ${microsoftAuthConfig.redirectUri}`);
      recommendations.push(`Update configured redirectUri to match current origin or use the correct URL`);
    }
    
    // Check local storage access
    try {
      localStorage.setItem('msal_test', 'test');
      localStorage.removeItem('msal_test');
      details.localStorage = 'available';
    } catch (e) {
      issues.push('Cannot access localStorage');
      recommendations.push('Check browser privacy settings or try a different browser');
      details.localStorage = 'unavailable';
    }
    
    // Check session storage access
    try {
      sessionStorage.setItem('msal_test', 'test');
      sessionStorage.removeItem('msal_test');
      details.sessionStorage = 'available';
    } catch (e) {
      issues.push('Cannot access sessionStorage');
      recommendations.push('Check browser privacy settings or try a different browser');
      details.sessionStorage = 'unavailable';
    }
    
    // Check for accounts
    const accounts = msalInstance.getAllAccounts();
    details.accounts = accounts.length;
    
    if (accounts.length > 0) {
      console.log(`Found ${accounts.length} accounts in MSAL cache`);
      details.accountNames = accounts.map(a => a.username);
      
      // Try silent token acquisition
      try {
        const silentRequest = {
          scopes: ['User.Read'],
          account: accounts[0]
        };
        
        const response = await msalInstance.acquireTokenSilent(silentRequest);
        details.silentAuth = 'success';
        details.accessToken = `${response.accessToken.substring(0, 10)}...`;
        
        return {
          success: true,
          issues,
          recommendations,
          details
        };
      } catch (error) {
        details.silentAuth = 'failed';
        
        if (error instanceof InteractionRequiredAuthError) {
          details.interactionRequired = true;
          recommendations.push('User needs to re-authenticate. Try logging in with popup or redirect.');
        } else {
          issues.push('Silent token acquisition failed');
          recommendations.push('Try clearing browser cache and cookies');
        }
      }
    } else {
      details.silentAuth = 'no accounts';
      recommendations.push('No accounts found. User needs to log in first.');
    }
    
    // Check for error parameters in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('error')) {
      const error = urlParams.get('error');
      const errorDesc = urlParams.get('error_description');
      
      issues.push(`Auth error in URL: ${error}`);
      if (errorDesc) {
        issues.push(`Error description: ${errorDesc}`);
      }
      
      details.urlError = error;
      details.urlErrorDescription = errorDesc;
      
      if (error === 'redirect_uri_mismatch') {
        recommendations.push('The redirect URI in Azure AD does not match the application URI');
        recommendations.push(`Configure exact URI "${microsoftAuthConfig.redirectUri}" in Azure portal`);
      }
    }
    
    // Check for stale interaction state
    if (sessionStorage.getItem('msal.interaction.status')) {
      issues.push('Stale interaction state detected');
      recommendations.push('Clear browser cache or sessionStorage and try again');
      details.staleInteraction = true;
    }
    
    // If no specific issues found
    if (issues.length === 0) {
      recommendations.push('Configuration appears correct. Try signing in with popup method.');
    }
    
    return {
      success: issues.length === 0,
      issues,
      recommendations,
      details
    };
  } catch (error) {
    console.error('Error running diagnostics:', error);
    
    // Capture error details
    if (error instanceof Error) {
      issues.push(`Diagnostic error: ${error.message}`);
      details.error = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    } else {
      issues.push('Unknown diagnostic error');
    }
    
    return {
      success: false,
      issues,
      recommendations: ['Check browser console for detailed error information'],
      details
    };
  }
};

/**
 * Try to fix common MSAL authentication issues
 */
export const fixCommonMsalIssues = async (): Promise<boolean> => {
  try {
    console.log('Attempting to fix common MSAL issues...');
    
    // Clear interaction state
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('msal.interaction.status');
      sessionStorage.removeItem('msal.interaction.error');
    }
    
    // Clear MSAL-related items from session storage
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage)
        .filter(key => key.startsWith('msal.'))
        .forEach(key => {
          console.log(`Removing stale session storage item: ${key}`);
          sessionStorage.removeItem(key);
        });
    }
    
    // Get MSAL instance
    const msalInstance = getMsalInstance();
    if (!msalInstance) {
      console.error('Cannot fix MSAL issues: instance not found');
      return false;
    }
    
    // Clear MSAL cache to force fresh login
    msalInstance.clearCache();
    
    return true;
  } catch (error) {
    console.error('Error fixing MSAL issues:', error);
    return false;
  }
};

/**
 * Try to login with popup as a more reliable alternative to redirect
 */
export const attemptPopupLogin = async (): Promise<AuthenticationResult | null> => {
  try {
    const msalInstance = getMsalInstance();
    if (!msalInstance) {
      throw new Error('MSAL instance not found');
    }
    
    // Fix any existing issues first
    await fixCommonMsalIssues();
    
    // Try popup login with minimal parameters
    const popupRequest = {
      scopes: ['User.Read'],
      prompt: 'select_account'
    };
    
    console.log('Attempting login with popup...');
    const response = await msalInstance.loginPopup(popupRequest);
    
    console.log('Popup login successful:', response.account.username);
    return response;
  } catch (error) {
    console.error('Popup login failed:', error);
    return null;
  }
}; 
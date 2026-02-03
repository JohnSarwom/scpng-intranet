import { Configuration, PopupRequest, RedirectRequest } from '@azure/msal-browser';
import microsoftAuthConfig from '@/config/microsoft-auth';

// Default configuration for MSAL
const defaultConfig = {
  auth: {
    clientId: microsoftAuthConfig.clientId,
    authority: microsoftAuthConfig.authorityUrl,
    redirectUri: microsoftAuthConfig.redirectUri,
    postLogoutRedirectUri: microsoftAuthConfig.redirectUri,
    navigateToLoginRequestUrl: true // Changed to true to ensure proper navigation after login
  },
  cache: {
    cacheLocation: 'sessionStorage', // Use sessionStorage for better security
    storeAuthStateInCookie: true // Enable cookies as backup for storage
  },
  system: {
    allowRedirectInIframe: true, // Allow redirects in iframes
    windowHashTimeout: 60000, // Increase timeout for hash processing (1 minute)
    iframeHashTimeout: 60000,
    loadFrameTimeout: 60000,
    loggerOptions: {
      loggerCallback: (level: any, message: string, containsPii: boolean) => {
        if (containsPii) {
          return;
        }
        
        // Filter out repetitive token-related logs
        if (message.includes('CacheManager:getIdToken') || 
            message.includes('CacheManager:getAccessToken')) {
          return;
        }
        
        switch (level) {
          case 0:
            console.error(message);
            return;
          case 1:
            console.warn(message);
            return;
          case 2:
            console.info(message);
            return;
          case 3:
            console.debug(message);
            return;
          default:
            console.log(message);
            return;
        }
      },
      piiLoggingEnabled: false
    }
  }
};

// Get current origin to compare with configured redirectUri
const getCurrentOrigin = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
};

// Function to update the configuration with custom values
export const updateMsalConfig = (config: any): Configuration => {
  console.log('Updating MSAL config with:', config);
  
  // Create a copy of the default config
  const updatedConfig = { ...defaultConfig };
  
  // Update the client ID if provided
  if (config.clientId) {
    updatedConfig.auth.clientId = config.clientId;
  }
  
  // Update the authority if provided
  if (config.authorityUrl) {
    updatedConfig.auth.authority = config.authorityUrl;
  }
  
  // Update the redirect URI if provided - ensure exact match with Azure configuration
  if (config.redirectUri) {
    console.log('Using redirectUri:', config.redirectUri);
    updatedConfig.auth.redirectUri = config.redirectUri;
    updatedConfig.auth.postLogoutRedirectUri = config.redirectUri;
    
    // Check for potential URI mismatch issues
    const currentOrigin = getCurrentOrigin();
    if (currentOrigin && !config.redirectUri.startsWith(currentOrigin)) {
      console.warn('⚠️ MSAL CONFIGURATION WARNING ⚠️');
      console.warn(`Configured redirectUri (${config.redirectUri}) does not match current origin (${currentOrigin})`);
      console.warn('This may cause authentication failures. Update Azure AD app registration or use the correct URL.');
    }
  }
  
  // Print the final configuration for debugging
  console.log('Updated MSAL config:', {
    clientId: updatedConfig.auth.clientId,
    authority: updatedConfig.auth.authority,
    redirectUri: updatedConfig.auth.redirectUri,
    postLogoutRedirectUri: updatedConfig.auth.postLogoutRedirectUri,
  });
  
  return updatedConfig;
};

// Helper to create proper popup request
export const createPopupRequest = (scopes: string[] = microsoftAuthConfig.permissions): PopupRequest => {
  return {
    scopes,
    prompt: 'select_account'
  };
};

// Helper to create proper redirect request
export const createRedirectRequest = (scopes: string[] = microsoftAuthConfig.permissions): RedirectRequest => {
  return {
    scopes,
    redirectUri: microsoftAuthConfig.redirectUri,
    prompt: 'select_account'
  };
};

// Default login request configuration
export const loginRequest = {
  scopes: microsoftAuthConfig.permissions || ['User.Read']
};

// Default configuration
const msalConfig: Configuration = defaultConfig;

export default msalConfig; 
import { Configuration, LogLevel } from '@azure/msal-browser';

// Find your Client ID and Tenant ID in the Azure portal under App registrations -> your app -> Overview
const clientId = "28deadd7-2b9d-4fd1-9d64-2f16cab6d65c"; // Replace with your actual Client ID
const tenantId = "b173aac7-6781-4d49-a037-d874bd4a09ab"; // Replace with your actual Tenant ID or use 'common'/'organizations'/'consumers'

// Ensure this redirectUri matches exactly what's configured in your Azure app registration under Authentication -> Web
const redirectUri = window.location.origin; 

export const msalConfig: Configuration = {
  auth: {
    clientId: clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: redirectUri,
    postLogoutRedirectUri: redirectUri, // Optional: Where to redirect after logout
  },
  cache: {
    cacheLocation: 'localStorage', // Use 'sessionStorage' for session-based cache
    storeAuthStateInCookie: false, // Set to true for IE11 or if using SSR and encountering cookie issues
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          // Do not log messages containing Personally Identifiable Information (PII)
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(`MSAL Error: ${message}`);
            return;
          case LogLevel.Info:
            // console.info(`MSAL Info: ${message}`); // Uncomment for info logs
            return;
          case LogLevel.Verbose:
            // console.debug(`MSAL Verbose: ${message}`); // Uncomment for verbose logs
            return;
          case LogLevel.Warning:
            console.warn(`MSAL Warning: ${message}`);
            return;
        }
      },
      // Log level can be set to Error, Warning, Info, or Verbose
      logLevel: LogLevel.Verbose // Uncomment for detailed MSAL logs during development
    },
  },
};

// Define the scopes needed for your application
// These scopes will be requested during login or token acquisition
export const loginRequest = {
    scopes: [
        "User.Read",
        "Files.ReadWrite",
        "Calendars.Read",
        "Calendars.ReadWrite",
        "Calendars.Read.Shared"
    ] // Add other scopes like "openid", "profile", "offline_access" if needed
};

// Add scopes here for specific Graph API requests (if needed)
// export const graphConfig = {
//     graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
//     graphFilesEndpoint: "https://graph.microsoft.com/v1.0/me/drive/root/children",
// }; 
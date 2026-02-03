// Microsoft Graph API configuration
const microsoftAuthConfig = {
  clientId: "648a96d7-e3f5-4e13-8084-ba0b74dbb56f",
  tenantId: "b173aac7-6781-4d49-a037-d874bd4a09ab",
  confirmed: true,
  apiEndpoint: "https://graph.microsoft.com/v1.0",
  last_tested: "2025-04-07T08:19:35.145Z",
  permissions: [
    "User.Read",
    "People.Read",
    "Directory.Read.All",
    "Files.Read.All",
    "Files.ReadWrite.All",
    "Sites.Read.All",
    "Sites.ReadWrite.All",
    "Calendars.Read",
    "Calendars.ReadWrite",
    "Calendars.Read.Shared"
  ],
  // HARDCODED APPROVED URI - this MUST match exactly what's in Azure AD
  redirectUri: typeof window !== 'undefined' ? window.location.origin : 'https://localhost:3000',
  approvedRedirectUris: [
    "https://unitopia-hub.vercel.app/",
    "https://unitopia-hub.vercel.app",
    "http://localhost:8080/",
    "https://unitopia-hub.vercel.app/login",
    "https://lovable.dev/projects/3816f188-bb84-4c3d-963d-5a30c86f087c"
  ],
  authorityUrl: `https://login.microsoftonline.com/b173aac7-6781-4d49-a037-d874bd4a09ab`,
  test_success: true,
  last_confirmed: "2025-04-07T08:19:35.145Z"
};

// Log configuration information
if (typeof window !== 'undefined') {
  console.log('Microsoft Auth Config loaded');
  
  // DO NOT MODIFY THE REDIRECT URI - Use exactly what's configured above
  console.log('Using redirect URI:', microsoftAuthConfig.redirectUri);
  console.log('Current window origin:', window.location.origin);
  
  // Log the final MSAL config that will be used
  console.log('Using MSAL config:', {
    clientId: microsoftAuthConfig.clientId,
    authority: microsoftAuthConfig.authorityUrl,
    redirectUri: microsoftAuthConfig.redirectUri, 
    postLogoutRedirectUri: microsoftAuthConfig.redirectUri
  });
}

export default microsoftAuthConfig; 
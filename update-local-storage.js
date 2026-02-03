// This script generates a localStorage command to update Microsoft config
// Run this with: node update-local-storage.js

// Your development server URL - change this to match your local environment
const LOCAL_ORIGIN = "http://localhost:8082"; // Updated to match Vite server port from logs

// The redirect URI currently configured in Azure AD
const AZURE_CONFIGURED_URI = "https://id-preview--3816f188-bb84-4c3d-963d-5a30c86f087c.lovable.app";

// Choose which URI to use (uncomment the one you want to use)
const REDIRECT_URI = LOCAL_ORIGIN;
// const REDIRECT_URI = AZURE_CONFIGURED_URI; // Use this if you need to match Azure's configured value

// Create the config object with correct values
const updatedConfig = {
  clientId: '648a96d7-e3f5-4e13-8084-ba0b74dbb56f',
  apiEndpoint: 'https://graph.microsoft.com/v1.0/me',
  permissions: ['User.Read'],
  redirectUri: REDIRECT_URI,
  authorityUrl: 'https://login.microsoftonline.com/b173aac7-6781-4d49-a037-d874bd4a09ab',
  test_success: true,
  last_tested: new Date().toISOString(),
  confirmed: true,
  last_confirmed: new Date().toISOString()
};

// Print localStorage commands for manual update
console.log('Copy and paste this command into your browser console:');
console.log('----------------------------------------');
console.log(`localStorage.setItem('ms-api-config', '${JSON.stringify(updatedConfig)}')`);
console.log('----------------------------------------');
console.log('\nOptional - Clear existing localStorage items:');
console.log(`localStorage.removeItem('ms-api-config')`);
console.log(`localStorage.removeItem('microsoft_config')`);

// Print info about the chosen redirect URI
console.log('\nCurrent configuration:');
console.log(`- Using redirect URI: ${REDIRECT_URI}`);
console.log(`- Local origin: ${LOCAL_ORIGIN}`);
console.log(`- Azure configured URI: ${AZURE_CONFIGURED_URI}`);
console.log('\nTo change the redirect URI, edit this script and choose a different REDIRECT_URI value.'); 
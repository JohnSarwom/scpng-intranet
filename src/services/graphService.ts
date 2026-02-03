import { Client } from '@microsoft/microsoft-graph-client';
import { IPublicClientApplication, InteractionStatus, InteractionRequiredAuthError, AccountInfo } from '@azure/msal-browser';

/**
 * Acquires an access token for Microsoft Graph.
 * Handles silent acquisition and falls back to popup if needed.
 * @param msalInstance The MSAL public client application instance.
 * @returns A promise that resolves to the access token.
 */
export const getAccessToken = async (msalInstance: IPublicClientApplication): Promise<string> => {
  console.log('🔐 [getAccessToken] Starting token acquisition...');

  if (msalInstance.getActiveAccount()) {
    console.log('   ✅ Active account found:', msalInstance.getActiveAccount()?.username);
  } else {
    console.log('   ⚠️  No active account, checking all accounts...');
    const allAccounts = msalInstance.getAllAccounts();
    if (allAccounts.length > 0) {
      console.log(`   ✅ Found ${allAccounts.length} account(s), setting first as active`);
      console.log('   Account:', allAccounts[0].username);
      msalInstance.setActiveAccount(allAccounts[0]);
    } else {
      console.error('   ❌ No accounts found!');
      throw new Error('No MSAL accounts found. Please log in.');
    }
  }

  // Note: We can't check interaction status here as it's handled by the hook
  // The MSAL instance doesn't have getInProgress() method
  // Interaction status should be checked in the React component using useMsal hook

  const activeAccount = msalInstance.getActiveAccount();
  if (!activeAccount) {
    console.error('   ❌ No active account after check');
    throw new Error('No active MSAL account found.');
  }

  const scopes = ['Sites.ReadWrite.All', 'Files.ReadWrite.All', 'User.Read.All'];
  console.log('   📋 Requesting scopes:', scopes.join(', '));

  try {
    console.log('   🔄 Attempting silent token acquisition...');
    const response = await msalInstance.acquireTokenSilent({
      scopes,
      account: activeAccount,
    });
    console.log('   ✅ Token acquired silently');
    return response.accessToken;
  } catch (e) {
    if (e instanceof InteractionRequiredAuthError) {
      console.log('   ⚠️  Silent acquisition failed, showing popup...');
      const response = await msalInstance.acquireTokenPopup({ scopes });
      console.log('   ✅ Token acquired via popup');
      return response.accessToken;
    }
    console.error('   ❌ Token acquisition failed:', e);
    throw e;
  }
};

/**
 * Initializes and returns a Microsoft Graph client instance.
 * @param msalInstance The MSAL public client application instance.
 * @returns A promise that resolves to the Graph client instance, or null if initialization fails.
 */
export const getGraphClient = async (msalInstance: IPublicClientApplication): Promise<Client | null> => {
  try {
    console.log('🌐 [getGraphClient] Initializing Microsoft Graph client...');

    const accessToken = await getAccessToken(msalInstance);
    console.log('   ✅ Access token obtained (length:', accessToken?.length, 'chars)');

    const client = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });

    console.log('   ✅ Graph client initialized successfully');
    return client;
  } catch (e: any) {
    console.error('❌ [getGraphClient] Failed to initialize Microsoft Graph client');
    console.error('   Error:', e);
    console.error('   Message:', e.message);
    console.error('   Stack:', e.stack);
    // Optionally, use a logging service or toast notification here
    return null;
  }
};

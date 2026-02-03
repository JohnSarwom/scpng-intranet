# Fetching User Profiles with Microsoft Graph

This document outlines the process of fetching user profile information from Microsoft Graph after a user authenticates via MSAL (Microsoft Authentication Library).

## Overview

The primary logic for handling authentication and fetching user data is located in the `src/hooks/useRoleBasedAuth.ts` hook. This hook manages the user's session, retrieves their assigned role from Supabase, and fetches their detailed profile from Microsoft Graph.

## Authentication Flow

1.  **MSAL Login**: The user initiates a login, which is handled by the `@azure/msal-react` library.
2.  **Hook Activation**: Upon successful login, the `useRoleBasedAuth` hook is activated. The `useEffect` hook within it detects the presence of an authenticated user account.
3.  **Graph Profile Fetch**: The `fetchGraphProfile` function is called. This function is responsible for communicating with the Microsoft Graph API.

## The `fetchGraphProfile` Function

This asynchronous function performs the following steps:

1.  **Acquire Access Token**: It uses `instance.acquireTokenSilent` to securely obtain an access token for the Microsoft Graph API. This method attempts to get a token from the cache without prompting the user.
2.  **API Request**: It makes a `fetch` request to the Microsoft Graph API's `/me` endpoint.
3.  **Log Profile**: If the request is successful, the user's full profile object is logged to the browser's developer console.

### Code Snippet:

```typescript
// src/hooks/useRoleBasedAuth.ts

const fetchGraphProfile = async () => {
  if (accounts[0]) {
    try {
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      });
      const res = await fetch('https://graph.microsoft.com/v1.0/me?$select=businessPhones,displayName,givenName,jobTitle,mail,mobilePhone,officeLocation,preferredLanguage,surname,userPrincipalName,department,id', {
        headers: { Authorization: `Bearer ${response.accessToken}` },
      });
      if (res.ok) {
        const userProfile = await res.json();
        console.log('User Profile from MS Graph:', userProfile);
        logger.success('Successfully fetched user profile from MS Graph', userProfile);
      } else {
        logger.error('Failed to fetch user profile from MS Graph', { status: res.status });
      }
    } catch (e) {
      logger.error('MSAL acquireTokenSilent error', e);
    }
  }
};
```

## Customizing the Fetched Data

The specific user profile fields returned by the Graph API can be customized using the `$select` OData query parameter in the `fetch` request URL.

By default, the API returns a basic set of properties. To include additional fields like `department`, you must explicitly add them to the `$select` list.

**Example:**

To fetch the user's `displayName`, `mail`, and `department`, the URL would be:

`https://graph.microsoft.com/v1.0/me?$select=displayName,mail,department`

Simply modify the URL in the `fetchGraphProfile` function to add or remove the fields you need. A full list of available user properties can be found in the [Microsoft Graph API documentation](https://docs.microsoft.com/en-us/graph/api/resources/user?view=graph-rest-1.0).

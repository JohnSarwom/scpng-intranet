# Microsoft Graph User Data Fetcher

This file contains a standalone HTML page that allows you to authenticate with Azure Active Directory and fetch user data from the Microsoft Graph API. You can then copy the data to your clipboard as a JSON object.

## How to Use

1.  Copy the HTML code below.
2.  Save it as an `.html` file (e.g., `fetcher.html`).
3.  Open the file in your web browser.
4.  Click the "Login" button and sign in with your Microsoft account.
5.  Click the "Fetch User Data" button to retrieve your profile information.
6.  Click the "Copy to Clipboard" button to copy the JSON data.

**Note:** For this to work, the application must be registered in Azure AD, and the redirect URI must be configured correctly. Since this script uses the same `clientId` as your main application, you may need to run it from the same domain or configure `localhost` as a valid redirect URI in your Azure app registration.

---

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Microsoft Graph User Data Fetcher</title>
    <script src="https://alcdn.msauth.net/browser/2.14.2/js/msal-browser.min.js"></script>
    <style>
        body { font-family: sans-serif; padding: 20px; }
        button { margin: 5px; padding: 10px; }
        pre { background-color: #f4f4f4; padding: 15px; border: 1px solid #ddd; white-space: pre-wrap; word-wrap: break-word; }
    </style>
</head>
<body>

    <h1>Microsoft Graph User Data Fetcher</h1>
    <button id="loginBtn">Login</button>
    <button id="fetchBtn" disabled>Fetch User Data</button>
    <button id="copyBtn" disabled>Copy to Clipboard</button>
    <h3>User Data:</h3>
    <pre id="userData">Not fetched yet.</pre>

    <script>
        const clientId = "28deadd7-2b9d-4fd1-9d64-2f16cab6d65c";
        const tenantId = "b173aac7-6781-4d49-a037-d874bd4a09ab";

        const msalConfig = {
            auth: {
                clientId: clientId,
                authority: `https://login.microsoftonline.com/${tenantId}`,
                redirectUri: window.location.origin,
            },
            cache: {
                cacheLocation: "localStorage",
            }
        };

        const msalInstance = new msal.PublicClientApplication(msalConfig);

        const loginRequest = {
            scopes: ["User.Read"]
        };

        const loginBtn = document.getElementById("loginBtn");
        const fetchBtn = document.getElementById("fetchBtn");
        const copyBtn = document.getElementById("copyBtn");
        const userDataEl = document.getElementById("userData");

        let account = null;

        loginBtn.addEventListener("click", async () => {
            try {
                const loginResponse = await msalInstance.loginPopup(loginRequest);
                account = loginResponse.account;
                loginBtn.disabled = true;
                fetchBtn.disabled = false;
                console.log("Login successful:", account);
            } catch (error) {
                console.error("Login failed:", error);
            }
        });

        fetchBtn.addEventListener("click", async () => {
            if (!account) {
                alert("Please log in first.");
                return;
            }

            try {
                const tokenResponse = await msalInstance.acquireTokenSilent({
                    ...loginRequest,
                    account: account
                });

                const headers = new Headers();
                const bearer = `Bearer ${tokenResponse.accessToken}`;
                headers.append("Authorization", bearer);

                const options = {
                    method: "GET",
                    headers: headers
                };

                const graphEndpoint = "https://graph.microsoft.com/v1.0/me?$select=businessPhones,displayName,givenName,jobTitle,mail,mobilePhone,officeLocation,preferredLanguage,surname,userPrincipalName,department,id";

                const response = await fetch(graphEndpoint, options);
                const data = await response.json();

                userDataEl.textContent = JSON.stringify(data, null, 2);
                copyBtn.disabled = false;

            } catch (error) {
                console.error("Failed to fetch user data:", error);
                userDataEl.textContent = "Error fetching data. See console for details.";
            }
        });

        copyBtn.addEventListener("click", () => {
            navigator.clipboard.writeText(userDataEl.textContent).then(() => {
                alert("Copied to clipboard!");
            }, (err) => {
                alert("Failed to copy.");
                console.error("Clipboard copy failed:", err);
            });
        });
    </script>

</body>
</html>

# Documentation for App.tsx SharePoint Image Uploader

This document explains the functionality and structure of the `App.tsx` React component, which provides a user interface for uploading images directly to a specified SharePoint 'Asset Images' library or folder.

## Overview

The application leverages the Microsoft Authentication Library (MSAL) for React (`@azure/msal-react`) to handle user authentication against Azure Active Directory (Azure AD) / Microsoft Entra ID. Once authenticated, users can select an image file, see a preview, and upload it to a pre-configured SharePoint Online site and library/folder. The application provides user feedback throughout the process, including upload progress, success messages with a direct link to the uploaded file in SharePoint, and error handling.

## Key Features

*   **Microsoft Authentication:** Uses MSAL for secure login via Microsoft accounts associated with the specified Azure AD tenant.
*   **File Selection & Preview:** Allows users to select an image file from their local machine and displays a preview for image types before uploading.
*   **SharePoint Upload:** Uploads the selected file to a specific SharePoint document library ("Asset Images"). It includes a fallback mechanism to upload to a folder of the same name if the library isn't accessible as expected.
*   **Direct Link Generation:** After a successful upload, it retrieves and displays the direct web URL for the uploaded file in SharePoint.
*   **Copy Link Functionality:** Provides a button to easily copy the generated SharePoint link to the clipboard.
*   **User Feedback:** Displays informative messages about the upload status (starting, in progress, success, error).
*   **Responsive Styling:** Uses inline CSS-in-JS with a Dribbble-inspired aesthetic for a clean user interface.
*   **State Management:** Uses React hooks (`useState`, `useRef`, `useEffect`) to manage component state, including file selection, authentication status, upload progress, messages, and preview URLs.
*   **Resource Management:** Includes cleanup logic (`useEffect`) to revoke temporary object URLs created for image previews, preventing memory leaks.

## Configuration (`microsoftAuthConfig`)

The `microsoftAuthConfig` object holds the necessary Azure AD application details:

*   `clientId`: Your application's unique Client ID registered in Azure AD.
*   `tenantId`: Your organization's Azure AD Tenant ID.
*   `permissions`: An array of Microsoft Graph API permissions required by the application (e.g., `User.Read`, `Files.ReadWrite.All`, `Sites.ReadWrite.All`).
*   `redirectUri`: The URL where users are redirected after authentication (typically the application's origin).
*   `authorityUrl`: The Microsoft identity platform endpoint URL, constructed using the `tenantId`.

## MSAL Setup

A `PublicClientApplication` instance (`msalInstance`) is configured using the `clientId`, `authorityUrl`, and `redirectUri`. It's set up to use `sessionStorage` for caching authentication tokens. The entire application is wrapped with the `MsalProvider` component, making the MSAL instance and authentication state available to child components via hooks (`useMsal`, `useIsAuthenticated`).

## Styling (`styles`, `mergeStyles`)

Inline styles are defined in the `styles` object for various UI elements (container, card, buttons, messages, preview). A helper function `mergeStyles` is used to conditionally combine base styles with hover or disabled states.

## Core Component (`FileUploader`)

This is the main functional component containing the UI and logic:

*   **State Variables:** Manages selected file (`file`), user messages (`message`), upload status (`isUploading`), the URL of the uploaded file (`uploadedFileUrl`), clipboard status (`copyButtonText`), local image preview URL (`localPreviewUrl`), and hover states for buttons.
*   **Refs:** Uses `useRef` (`fileInputRef`) to programmatically trigger the hidden file input element.
*   **Authentication Hooks:** `useMsal` provides access to the MSAL `instance` and authenticated `accounts`. `useIsAuthenticated` provides a boolean flag.
*   **`useEffect` Hooks:**
    *   Cleans up previously generated `localPreviewUrl` using `URL.revokeObjectURL` when the component unmounts or the preview URL changes.
    *   Resets component state (file, message, URLs) when the authenticated user account changes.
*   **`handleLogin`:** Initiates the MSAL login popup flow.
*   **`handleFileChange`:** Handles the selection of a file. It revokes any existing preview URL, sets the new `file` state, and creates/sets a new `localPreviewUrl` if the selected file is an image.
*   **`handleLabelClick`:** Triggers a click on the hidden file input when the custom file selection button is clicked.
*   **`getFileWebUrl`:** An asynchronous function that fetches the metadata of the uploaded file using the Microsoft Graph API to retrieve its `webUrl`. Requires the access token, site ID, drive ID (optional), and file path.
*   **`uploadToSharePoint`:** The core upload logic:
    1.  Acquires an access token silently using `instance.acquireTokenSilent`.
    2.  Fetches the SharePoint `siteId` using the site hostname and path.
    3.  Attempts to get the `driveId` corresponding to the "Asset Images" document library.
    4.  **Primary Upload Path:** Tries to upload the file directly to the root of the "Asset Images" library drive using the Graph API's PUT endpoint (`/sites/{siteId}/drives/{driveId}/root:/{fileName}:/content`).
    5.  **Fallback Upload Path:** If accessing the library drive fails, it attempts to upload the file to a *folder* named "Asset Images" within the site's default drive (`/sites/{siteId}/drive/root:/{libraryName}/{fileName}:/content`).
    6.  If the upload (either primary or fallback) is successful, it calls `getFileWebUrl` to get the link.
    7.  Updates the `message` and `uploadedFileUrl` state accordingly.
    8.  Handles errors gracefully at each step (token acquisition, site lookup, drive lookup, upload, link retrieval).
    9.  Resets the file input after successful processing.
    10. Manages the `isUploading` state and clears the preview URL (`localPreviewUrl`) specifically on failures.
*   **`handleCopyLink`:** Copies the `uploadedFileUrl` to the clipboard using the `navigator.clipboard` API.
*   **Rendering:**
    *   Conditionally renders a login view if `isAuthenticated` is false.
    *   If authenticated, renders the file input button, selected file name (if any), upload button, status messages, and the result area (including image preview and link) upon successful upload.
    *   Uses the `mergeStyles` helper to apply dynamic styles (e.g., hover effects, disabled states).

## Main Application (`App`)

A simple wrapper component that provides the `MsalProvider` to the `FileUploader`, enabling the MSAL context.

## Full Code (`App.tsx`)

```typescript
import React, { useState, useRef, useEffect } from "react";
import { PublicClientApplication } from "@azure/msal-browser";
import {
    MsalProvider,
    useMsal,
    useIsAuthenticated,
} from "@azure/msal-react";
import axios from "axios";

// --- Configuration (Keep yours) ---
const microsoftAuthConfig = {
    clientId: "648a96d7-e3f5-4e13-8084-ba0b74dbb56f", // Your actual Client ID
    tenantId: "b173aac7-6781-4d49-a037-d874bd4a09ab", // Your actual Tenant ID
    permissions: [
        "User.Read",
        "Files.ReadWrite.All",
        "Sites.ReadWrite.All",
    ],
    redirectUri: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
    authorityUrl: `https://login.microsoftonline.com/b173aac7-6781-4d49-a037-d874bd4a09ab`,
};

// --- MSAL Instance ---
const msalInstance = new PublicClientApplication({
    auth: {
        clientId: microsoftAuthConfig.clientId,
        authority: microsoftAuthConfig.authorityUrl,
        redirectUri: microsoftAuthConfig.redirectUri,
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
    },
});

// --- Dribbble-Inspired Styles ---
const styles = {
    // ...(Keep all existing styles from the previous version)...
    pageContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: '20px',
    } as React.CSSProperties,
    card: {
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
        padding: '40px 50px',
        maxWidth: '550px', // Slightly wider to accommodate preview
        width: '100%',
        textAlign: 'center',
        fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
    } as React.CSSProperties,
    title: {
        color: '#333',
        marginBottom: '15px',
        fontWeight: 600,
        fontSize: '24px',
    } as React.CSSProperties,
    subtitle: {
        color: '#667',
        marginBottom: '35px',
        fontSize: '16px',
        lineHeight: 1.5,
    } as React.CSSProperties,
    button: {
        padding: '14px 30px',
        fontSize: '16px',
        fontWeight: 600,
        color: '#fff',
        backgroundColor: '#0078d4',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 15px rgba(0, 120, 212, 0.2)',
        display: 'inline-block',
        margin: '10px 0',
        width: '100%',
        maxWidth: '300px',
    } as React.CSSProperties,
    buttonHover: {
        backgroundColor: '#005a9e',
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(0, 90, 158, 0.3)',
    } as React.CSSProperties,
    buttonDisabled: {
        backgroundColor: '#cccccc',
        color: '#888888',
        cursor: 'not-allowed',
        boxShadow: 'none',
        transform: 'none',
    } as React.CSSProperties,
    fileInputButton: {
        padding: '12px 25px',
        fontSize: '15px',
        fontWeight: 500,
        color: '#0078d4',
        backgroundColor: '#ffffff',
        border: '2px dashed #0078d4',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        margin: '15px 0',
        display: 'block',
        marginInline: 'auto',
        width: '100%',
        maxWidth: '300px',
    } as React.CSSProperties,
    fileInputButtonHover: {
        backgroundColor: '#f0f8ff',
        borderColor: '#005a9e',
        color: '#005a9e',
    } as React.CSSProperties,
    fileName: {
        marginTop: '15px',
        marginBottom: '20px',
        fontSize: '14px',
        color: '#555',
        wordBreak: 'break-all',
        background: '#f9f9f9',
        padding: '8px 12px',
        borderRadius: '6px',
        border: '1px solid #eee',
    } as React.CSSProperties,
    message: {
        marginTop: '25px',
        fontSize: '15px',
        fontWeight: 500,
        padding: '10px 15px',
        borderRadius: '8px',
        border: '1px solid transparent',
    } as React.CSSProperties,
    messageSuccess: {
        color: '#107c10',
        backgroundColor: '#dff6dd',
        borderColor: '#c3e6cb',
    } as React.CSSProperties,
    messageError: {
        color: '#d83b01',
        backgroundColor: '#fdf1ed',
        borderColor: '#f5c6cb',
    } as React.CSSProperties,
    messageInfo: {
        color: '#005a9e',
        backgroundColor: '#e7f3fe',
        borderColor: '#b8dcfd',
    } as React.CSSProperties,
    uploadResultArea: {
        marginTop: '25px',
        padding: '20px',
        background: '#f8f9fa',
        borderRadius: '10px',
        border: '1px solid #e9ecef',
    } as React.CSSProperties,
    uploadedLink: {
        display: 'block',
        color: '#0078d4',
        textDecoration: 'none',
        fontWeight: 500,
        marginBottom: '15px',
        wordBreak: 'break-all',
        '&:hover': {
            textDecoration: 'underline',
            color: '#005a9e',
        }
    } as React.CSSProperties,
    copyButton: {
        padding: '10px 20px',
        fontSize: '14px',
        fontWeight: 500,
        backgroundColor: '#28a745',
        marginTop: '10px',
        maxWidth: '150px',
    } as React.CSSProperties,
    copyButtonHover: {
        backgroundColor: '#218838',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 10px rgba(40, 167, 69, 0.3)',
    } as React.CSSProperties,

    // Style for the image preview
    imagePreview: {
        maxWidth: '100%',
        maxHeight: '250px', // Limit preview height
        marginTop: '20px',
        marginBottom: '15px',
        borderRadius: '8px', // Rounded corners for the image
        border: '1px solid #ddd', // Light border
        objectFit: 'contain', // Ensure aspect ratio is maintained
    } as React.CSSProperties,
};

// --- Helper to merge styles conditionally ---
const mergeStyles = (...styleObjects: (React.CSSProperties | undefined | null | false)[]): React.CSSProperties => {
    return styleObjects.reduce((acc, style) => {
        if (style) {
            return { ...acc, ...style };
        }
        return acc;
    }, {}) as React.CSSProperties;
};


// --- File Uploader Component ---
const FileUploader = () => {
    const { instance, accounts } = useMsal();
    const isAuthenticated = useIsAuthenticated();
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState<{ text: string; type: 'info' | 'success' | 'error' } | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
    const [copyButtonText, setCopyButtonText] = useState("Copy Link");
    const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null); // State for image preview URL
    const [isHoveringLogin, setIsHoveringLogin] = useState(false);
    const [isHoveringUpload, setIsHoveringUpload] = useState(false);
    const [isHoveringFileInput, setIsHoveringFileInput] = useState(false);
    const [isHoveringCopy, setIsHoveringCopy] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- Effect for cleaning up object URLs ---
    useEffect(() => {
        // This is a cleanup function that runs when the component unmounts
        // or BEFORE the effect runs again if localPreviewUrl changes.
        const currentPreviewUrl = localPreviewUrl; // Capture the URL for the cleanup closure
        return () => {
            if (currentPreviewUrl) {
                URL.revokeObjectURL(currentPreviewUrl);
                console.log("Revoked object URL:", currentPreviewUrl); // For debugging
            }
        };
    }, [localPreviewUrl]); // Depend on localPreviewUrl to trigger cleanup when it changes

    // --- Reset state on account change ---
     useEffect(() => {
        setUploadedFileUrl(null);
        setFile(null);
        setMessage(null);
        setLocalPreviewUrl(null); // Also clear preview URL
        setCopyButtonText("Copy Link");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, [accounts]);

    const handleLogin = () => {
        setMessage(null);
        setUploadedFileUrl(null);
        setLocalPreviewUrl(null);
        instance.loginPopup({
            scopes: microsoftAuthConfig.permissions,
        }).catch(e => {
            console.error("Login failed:", e);
            setMessage({ text: "Login failed. Please check pop-up blocker or try again.", type: 'error' });
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(null);
        setUploadedFileUrl(null);
        setCopyButtonText("Copy Link");

        // --- Manage local preview URL ---
        // Revoke previous URL if it exists, before setting a new one or clearing
        if (localPreviewUrl) {
             URL.revokeObjectURL(localPreviewUrl);
             setLocalPreviewUrl(null); // Clear state immediately after revoke call
        }

        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);

            // Create and set preview URL only if it's an image
            if (selectedFile.type.startsWith("image/")) {
                 const previewUrl = URL.createObjectURL(selectedFile);
                 setLocalPreviewUrl(previewUrl);
                 console.log("Created object URL:", previewUrl); // For debugging
            } else {
                // If not an image, don't create a preview URL
                setLocalPreviewUrl(null);
            }
        } else {
            setFile(null);
            // Ensure preview URL is cleared if no file is selected
            setLocalPreviewUrl(null);
        }
    };


    const handleLabelClick = () => {
        fileInputRef.current?.click();
    };

    // --- getFileWebUrl function (keep as is) ---
    const getFileWebUrl = async (accessToken: string, siteId: string, driveId: string | null, filePath: string): Promise<string | null> => {
        let metadataUrl: string;
        if (driveId) {
            metadataUrl = `https://graph.microsoft.com/v1.0/sites/${siteId}/drives/${driveId}/root:/${filePath}`;
        } else {
             metadataUrl = `https://graph.microsoft.com/v1.0/sites/${siteId}/drive/root:/${filePath}`;
        }
        console.log("Fetching metadata from URL:", metadataUrl);
        try {
            const response = await axios.get(metadataUrl, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            console.log("Metadata Response:", response.data);
            return response.data.webUrl || null;
        } catch (error: any) {
            console.error("Failed to get file metadata:", error.response?.data || error.message);
            setMessage(prev => ({
                 text: `${prev?.text ?? ""} Failed to retrieve file link after upload. (${error.response?.data?.error?.message || error.message})`,
                 type: 'error'
            }));
            return null;
        }
    };

    // --- uploadToSharePoint function (keep mostly as is, ensure states are cleared on error/finally) ---
    const uploadToSharePoint = async () => {
        if (!file || !accounts.length || isUploading) return;

        setIsUploading(true);
        setMessage({ text: "Starting upload...", type: 'info' });
        setUploadedFileUrl(null); // Clear previous URL
        setCopyButtonText("Copy Link");
        // Keep localPreviewUrl, we want to show it if upload succeeds

        let siteId = '';
        let driveId: string | null = null;
        let finalFilePath = '';
        let uploadSuccessful = false;

        try {
            const tokenResponse = await instance.acquireTokenSilent({
                scopes: microsoftAuthConfig.permissions,
                account: accounts[0],
            });
            const accessToken = tokenResponse.accessToken;
            setMessage({ text: "Acquired authorization...", type: 'info' });

            // --- Get Site ID ---
            const siteHostname = "scpng1.sharepoint.com";
            const sitePath = "/sites/scpngintranet";
            const siteInfoUrl = `https://graph.microsoft.com/v1.0/sites/${siteHostname}:${sitePath}`;
            try {
                const siteInfoResponse = await axios.get(siteInfoUrl, { headers: { Authorization: `Bearer ${accessToken}` }});
                siteId = siteInfoResponse.data.id;
                setMessage({ text: "Found SharePoint site...", type: 'info' });
            } catch (siteError: any) {
                 console.error("Failed to get Site ID:", siteError.response?.data || siteError.message);
                 setMessage({ text: `Upload failed: Could not find SharePoint site (${siteError.response?.data?.error?.message || siteError.message})`, type: 'error' });
                 setIsUploading(false);
                 setLocalPreviewUrl(null); // Clear preview on failure
                 return;
            }

            // --- Get Drive ID & Upload Logic (Primary & Fallback) ---
             const libraryName = "Asset Images";
             const driveInfoUrl = `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${libraryName}/drive`;
             try {
                 // Try primary path (library)
                 const driveInfoResponse = await axios.get(driveInfoUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
                 driveId = driveInfoResponse.data.id;
                 setMessage({ text: `Found target library '${libraryName}'...`, type: 'info' });

                 const encodedFileName = encodeURIComponent(file.name);
                 finalFilePath = `${encodedFileName}`;
                 const uploadUrl = `https://graph.microsoft.com/v1.0/sites/${siteId}/drives/${driveId}/root:/${encodedFileName}:/content`;
                 setMessage({ text: `Uploading ${file.name} to '${libraryName}'...`, type: 'info' });

                 await axios.put(uploadUrl, file, { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": file.type } });
                 uploadSuccessful = true;

             } catch (driveError: any) {
                 // Try fallback path (folder)
                 setMessage({ text: "Could not use 'Asset Images' library, attempting fallback...", type: 'info' });
                 const encodedFileNameFallback = encodeURIComponent(file.name);
                 finalFilePath = `${libraryName}/${encodedFileNameFallback}`;
                 const uploadUrlFallback = `https://graph.microsoft.com/v1.0/sites/${siteId}/drive/root:/${libraryName}/${encodedFileNameFallback}:/content`;
                 try {
                     await axios.put(uploadUrlFallback, file, { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": file.type }});
                     uploadSuccessful = true;
                     driveId = null; // Indicate fallback used
                 } catch (fallbackError: any) {
                     // Both failed
                     console.error("Fallback upload attempt failed:", fallbackError.response?.data || fallbackError.message);
                     const errorMsg = fallbackError.response?.data?.error?.message || fallbackError.message;
                     setMessage({ text: `Upload failed: Both library and folder attempts for '${libraryName}' failed. (${errorMsg})`, type: 'error' });
                     setIsUploading(false);
                     setLocalPreviewUrl(null); // Clear preview on failure
                     return;
                 }
             }

             // --- Get Web URL if Upload Succeeded ---
             if (uploadSuccessful) {
                setMessage({ text: "Upload successful! Retrieving file link...", type: 'info' });
                const webUrl = await getFileWebUrl(accessToken, siteId, driveId, finalFilePath);

                if (webUrl) {
                    setUploadedFileUrl(webUrl);
                    // Keep localPreviewUrl - upload is successful
                    setMessage({ text: "Upload complete! Link and preview ready.", type: 'success' });
                } else {
                    setMessage(prev => ({
                        text: `Upload completed but failed to retrieve the direct link. File should be in SharePoint.`,
                        type: 'error'
                    }));
                     setLocalPreviewUrl(null); // Clear preview if link retrieval failed post-upload
                }

                // Clear file input state (file selection) after successful processing
                setFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }

        } catch (err: any) {
             // Catch errors from token acquisition, site ID lookup, or unexpected issues
             console.error("Overall upload process error:", err);
             let detailedMessage = "Upload failed.";
             if (err.response) { detailedMessage = `Upload failed: ${err.response.data?.error?.message || 'Server error'} (Status: ${err.response.status})`; }
             else if (err.request) { detailedMessage = "Upload failed: No response received from server."; }
             else { detailedMessage = `Upload failed: ${err.message}`; }
              setMessage({ text: detailedMessage, type: 'error' });
              setUploadedFileUrl(null);
              setLocalPreviewUrl(null); // Clear preview on failure
        } finally {
            setIsUploading(false);
            // Don't clear file/preview here if successful, only if error occurred or new file selected
        }
    };


    // --- Copy Link Handler (keep as is) ---
    const handleCopyLink = async () => {
        if (!uploadedFileUrl) return;
        try {
            await navigator.clipboard.writeText(uploadedFileUrl);
            setCopyButtonText("Copied!");
            setTimeout(() => setCopyButtonText("Copy Link"), 2000);
        } catch (err) {
            console.error("Failed to copy link: ", err);
            setCopyButtonText("Failed to copy");
            setTimeout(() => setCopyButtonText("Copy Link"), 2000);
        }
    };


    // --- Dynamic Styles (keep as is) ---
    const loginButtonStyle = mergeStyles(styles.button, isHoveringLogin && styles.buttonHover);
    const fileInputButtonStyle = mergeStyles(styles.fileInputButton, isUploading && styles.buttonDisabled, isHoveringFileInput && !isUploading && styles.fileInputButtonHover);
    const uploadButtonStyle = mergeStyles(styles.button, (isUploading || !file) && styles.buttonDisabled, isHoveringUpload && !isUploading && file && styles.buttonHover);
    const copyButtonStyle = mergeStyles(styles.button, styles.copyButton, isHoveringCopy && styles.copyButtonHover);
    const messageStyle = mergeStyles(styles.message, message?.type === 'success' && styles.messageSuccess, message?.type === 'error' && styles.messageError, message?.type === 'info' && styles.messageInfo );

    // --- JSX Rendering ---
    return (
        <div style={styles.pageContainer}>
            <div style={styles.card}>
                <h2 style={styles.title}>SharePoint Image Upload</h2>

                {!isAuthenticated ? (
                     // --- Login View ---
                    <>
                        <p style={styles.subtitle}>
                            Please log in with your Microsoft account to upload files to the 'Asset Images' library.
                        </p>
                        <button
                            style={loginButtonStyle}
                            onClick={handleLogin}
                            onMouseEnter={() => setIsHoveringLogin(true)}
                            onMouseLeave={() => setIsHoveringLogin(false)}
                        >
                            Login with Microsoft
                        </button>
                         {message && message.type === 'error' && <p style={messageStyle}>{message.text}</p>}
                    </>
                ) : (
                     // --- Authenticated View ---
                    <>
                        <p style={styles.subtitle}>
                            Choose an image file to upload to the Asset Images library in SharePoint.
                        </p>

                        {/* Hidden file input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            disabled={isUploading}
                            accept="image/*" // Encourage image selection
                        />

                        {/* File selection button */}
                        <button
                             style={fileInputButtonStyle}
                             onClick={handleLabelClick}
                             onMouseEnter={() => setIsHoveringFileInput(true)}
                             onMouseLeave={() => setIsHoveringFileInput(false)}
                             disabled={isUploading}
                        >
                             {/* Show preview directly below choose button if available before upload */}
                             {localPreviewUrl && !uploadedFileUrl && !message && (
                                <img src={localPreviewUrl} alt="Preview" style={{...styles.imagePreview, maxHeight: '80px', margin: '10px auto 5px auto'}} />
                             )}
                             {file ? "Change File" : "Choose Image File"}
                        </button>

                        {/* Display selected file name */}
                        {file && !message && <p style={styles.fileName}>Selected: {file.name}</p>}

                        {/* Upload Button */}
                        <button
                            style={uploadButtonStyle}
                            onClick={uploadToSharePoint}
                            disabled={!file || isUploading}
                            onMouseEnter={() => setIsHoveringUpload(true)}
                            onMouseLeave={() => setIsHoveringUpload(false)}
                        >
                            {isUploading ? "Uploading..." : "Upload to SharePoint"}
                        </button>

                        {/* Status Message */}
                        {message && <p style={messageStyle}>{message.text}</p>}

                        {/* --- Display Results on Success --- */}
                        {uploadedFileUrl && message?.type === 'success' && (
                            <div style={styles.uploadResultArea}>
                                {/* Image Preview using Local Object URL */}
                                {localPreviewUrl && (
                                    <img
                                        src={localPreviewUrl}
                                        alt="Preview of uploaded image"
                                        style={styles.imagePreview}
                                    />
                                )}

                                {/* Link to SharePoint file */}
                                <a
                                    href={uploadedFileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={styles.uploadedLink}
                                    onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline', e.currentTarget.style.color = styles.buttonHover.backgroundColor!)}
                                    onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none', e.currentTarget.style.color = styles.uploadedLink.color!)}
                                >
                                    View Uploaded File in SharePoint
                                </a>

                                {/* Copy Link Button */}
                                <button
                                    style={copyButtonStyle}
                                    onClick={handleCopyLink}
                                    onMouseEnter={() => setIsHoveringCopy(true)}
                                    onMouseLeave={() => setIsHoveringCopy(false)}
                                >
                                    {copyButtonText}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// --- App Component (Wraps with MsalProvider) ---
const App = () => (
    <MsalProvider instance={msalInstance}>
        <FileUploader />
    </MsalProvider>
);

export default App;

```

</rewritten_file> 
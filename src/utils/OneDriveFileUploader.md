# OneDrive File Uploader Utility

This utility provides a TypeScript class for seamless OneDrive integration in web applications.

## Features

- Microsoft Authentication flow with both silent and interactive token acquisition
- Direct file uploads to OneDrive using Microsoft Graph API
- CSV conversion utility for structured data
- Folder creation and management
- Comprehensive error handling and retry logic

## Installation

Make sure you have the required dependencies:

```bash
npm install @azure/msal-browser
```

## Basic Usage

### Initialization

```typescript
import OneDriveFileUploader from '@/utils/OneDriveFileUploader';

// Initialize with your Microsoft app configuration
const oneDriveUploader = new OneDriveFileUploader({
  clientId: "your-application-client-id",
  authority: "https://login.microsoftonline.com/your-tenant-id", // Use 'common' for multi-tenant
  redirectUri: window.location.origin
});

// Initialize the authentication system
await oneDriveUploader.initialize();
```

### Authentication

```typescript
// Check if already authenticated
if (!oneDriveUploader.isAuthenticated()) {
  try {
    // This will open a popup for user login if needed
    await oneDriveUploader.login();
    console.log("User authenticated successfully");
  } catch (error) {
    console.error("Authentication failed:", error);
  }
}
```

### Uploading Files

```typescript
// Example: Upload a text file
const result = await oneDriveUploader.uploadFile({
  fileName: "example.txt",
  content: "This is the content of my file",
  contentType: "text/plain"
});

if (result.success) {
  console.log(`File uploaded successfully. Access it at: ${result.webUrl}`);
} else {
  console.error("Upload failed:", result.error);
}
```

### Working with CSV Data

```typescript
// Sample data
const myData = [
  { id: 1, name: "Item 1", description: "First item" },
  { id: 2, name: "Item 2", description: "Second item" }
];

// Convert to CSV
const csvContent = oneDriveUploader.convertToCsv(
  myData,
  ["id", "name", "description"]
);

// Upload CSV file to specific folder
const uploadResult = await oneDriveUploader.uploadFile({
  fileName: "data.csv",
  content: csvContent,
  contentType: "text/csv",
  folderId: "folder-id-from-onedrive", // Optional: specific folder ID
  overwrite: true // Overwrite if file exists
});
```

### Folder Management

```typescript
// Get available folders
const folders = await oneDriveUploader.getFolders();
console.log("Available folders:", folders);

// Create a new folder
const newFolder = await oneDriveUploader.createFolder("My New Folder");
console.log("Created folder:", newFolder);

// Create a subfolder
const subFolder = await oneDriveUploader.createFolder(
  "Subfolder", 
  newFolder.id
);
```

## Error Handling

The utility includes comprehensive error handling:

```typescript
try {
  const result = await oneDriveUploader.uploadFile({
    fileName: "important.txt",
    content: "Critical data"
  });
  
  if (!result.success) {
    // Handle specific error from result
    console.error("Upload error:", result.error);
  }
} catch (error) {
  // Handle unexpected errors
  console.error("Unexpected error:", error);
}
```

## Integration Tips

1. **Token Caching**: The utility stores tokens in session storage by default for better user experience.

2. **UI Integration**: Consider using a loading indicator during uploads:
   ```typescript
   // Show loading state
   setIsUploading(true);
   
   try {
     const result = await oneDriveUploader.uploadFile({...});
     // Handle result
   } finally {
     // Hide loading state
     setIsUploading(false);
   }
   ```

3. **Batch Uploads**: For multiple files, process them sequentially:
   ```typescript
   const results = [];
   for (const file of files) {
     results.push(await oneDriveUploader.uploadFile({
       fileName: file.name,
       content: file.content
     }));
   }
   ```

## Microsoft Graph API References

This utility uses the following Microsoft Graph API endpoints:

- Files upload: `https://graph.microsoft.com/v1.0/me/drive/items/{folder-id}:/{filename}:/content`
- Folder creation: `https://graph.microsoft.com/v1.0/me/drive/root/children`
- Folder listing: `https://graph.microsoft.com/v1.0/me/drive/root/children?$filter=folder ne null`

For more advanced Graph API operations, refer to the [Microsoft Graph API documentation](https://learn.microsoft.com/en-us/graph/api/overview). 
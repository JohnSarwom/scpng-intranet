# Apps SharePoint List Setup Guide

This guide will help you set up the SharePoint list to manage applications in your Unitopia Hub intranet.

## Overview

The Apps feature allows you to manage and display organizational applications with categories, icons/images, descriptions, and links. All data is stored in SharePoint for easy management.

## SharePoint List Schema

### List Name
**`Applications`**

### Columns to Create

Create the following columns in your SharePoint list:

| Column Name | Internal Name | Type | Required | Description |
|------------|--------------|------|----------|-------------|
| Title | Title | Single line of text | Yes | Application name (e.g., "Outlook", "Teams") |
| App ID | AppId | Single line of text | Yes | Unique identifier (e.g., "outlook", "teams") - use lowercase with no spaces |
| Description | Description | Multiple lines of text | No | Brief description of the application |
| Icon | Icon | Hyperlink or Picture | No | URL to app icon/image or emoji |
| App URL | AppUrl | Hyperlink or Picture | Yes | Link to the application |
| Category | Category | Choice | Yes | Application category |
| Is External | IsExternal | Yes/No | No | Whether the app opens in a new tab |
| Display Order | DisplayOrder | Number | No | Order to display the app (lower numbers first) |
| Is Active | IsActive | Yes/No | No | Whether to show this app (default: Yes) |
| Created By | Created By | Person or Group | Auto | Auto-populated |
| Modified By | Modified By | Person or Group | Auto | Auto-populated |

### Category Choices

Set up the following choices for the **Category** column:
- Microsoft 365
- Productivity
- Communication
- Utilities
- Custom
- HR Systems
- Finance Systems
- External Services

You can add more categories as needed.

## Step-by-Step Setup Instructions

### 1. Create the SharePoint List

1. Navigate to your SharePoint site: `https://scpng1.sharepoint.com/sites/scpngintranet`
2. Click on **Settings (gear icon)** → **Site contents**
3. Click **New** → **List**
4. Choose **Blank list**
5. Name it **`Applications`**
6. Click **Create**

### 2. Add Custom Columns

For each column (except Title which already exists):

#### App ID Column
1. Click **Add column** → **Single line of text**
2. Name: `App ID`
3. Internal Name: `AppId`
4. Check **Require that this column contains information**
5. Click **Save**

#### Description Column
1. Click **Add column** → **Multiple lines of text**
2. Name: `Description`
3. Internal Name: `Description`
4. Number of lines: 3
5. Click **Save**

#### Icon Column
1. Click **Add column** → **Hyperlink or Picture**
2. Name: `Icon`
3. Internal Name: `Icon`
4. Format URL as: **Hyperlink**
5. Click **Save**

#### App URL Column
1. Click **Add column** → **Hyperlink or Picture**
2. Name: `App URL`
3. Internal Name: `AppUrl`
4. Format URL as: **Hyperlink**
5. Check **Require that this column contains information**
6. Click **Save**

#### Category Column
1. Click **Add column** → **Choice**
2. Name: `Category`
3. Internal Name: `Category`
4. Enter choices (one per line):
   ```
   Microsoft 365
   Productivity
   Communication
   Utilities
   Custom
   HR Systems
   Finance Systems
   External Services
   ```
5. Default value: `Custom`
6. Check **Require that this column contains information**
7. Click **Save**

#### Is External Column
1. Click **Add column** → **Yes/No**
2. Name: `Is External`
3. Internal Name: `IsExternal`
4. Default value: **Yes**
5. Click **Save**

#### Display Order Column
1. Click **Add column** → **Number**
2. Name: `Display Order`
3. Internal Name: `DisplayOrder`
4. Minimum value: 0
5. Maximum value: 1000
6. Default value: 100
7. Click **Save**

#### Is Active Column
1. Click **Add column** → **Yes/No**
2. Name: `Is Active`
3. Internal Name: `IsActive`
4. Default value: **Yes**
5. Click **Save**

### 3. Add Sample Data

Here's sample data for Microsoft 365 apps:

| Title | App ID | Description | Icon | App URL | Category | Is External | Display Order | Is Active |
|-------|--------|-------------|------|---------|----------|-------------|---------------|-----------|
| Outlook | outlook | Email, schedule, and set tasks | 📧 | https://outlook.office.com | Microsoft 365 | Yes | 1 | Yes |
| Teams | teams | Chat, meetings, and collaboration | 👥 | https://teams.microsoft.com | Microsoft 365 | Yes | 2 | Yes |
| Word | word | Create and edit documents | 📝 | https://office.com/launch/word | Microsoft 365 | Yes | 3 | Yes |
| Excel | excel | Create and edit spreadsheets | 📊 | https://office.com/launch/excel | Microsoft 365 | Yes | 4 | Yes |
| PowerPoint | powerpoint | Create presentations | 📽️ | https://office.com/launch/powerpoint | Microsoft 365 | Yes | 5 | Yes |
| OneDrive | onedrive | Cloud storage and file sharing | ☁️ | https://onedrive.live.com | Microsoft 365 | Yes | 6 | Yes |
| SharePoint | sharepoint | Team sites and content management | 🔷 | https://www.office.com/launch/sharepoint | Microsoft 365 | Yes | 7 | Yes |

**To add each app:**
1. Click **New** in the list
2. Fill in all the fields
3. For the **Icon** field, you can either:
   - Enter an emoji (📧, 👥, etc.)
   - Enter a URL to an icon image
4. Click **Save**

### 4. Set List Permissions (Optional)

By default, all users with site access can view the list. To customize:

1. Go to **List settings** → **Permissions for this list**
2. Click **Stop Inheriting Permissions**
3. Set custom permissions as needed:
   - **All authenticated users**: Read access
   - **IT/Admin team**: Full control

### 5. Using Custom Icons/Images

Instead of emojis, you can use custom icons:

1. Upload icon images to a SharePoint document library (e.g., `/sites/scpngintranet/SiteAssets/AppIcons/`)
2. Get the direct URL to each image
3. Enter the URL in the **Icon** field

**Recommended icon specifications:**
- Format: PNG or SVG
- Size: 64x64 pixels or 128x128 pixels
- Transparent background

## Verification

After setup, verify:
1. ✅ List named "Applications" exists
2. ✅ All columns are created with correct types
3. ✅ Category choices are configured
4. ✅ Sample data is added
5. ✅ List is accessible via Graph API

## Testing the Connection

Once the list is set up, the application will automatically:
1. Connect to SharePoint via Microsoft Graph API
2. Fetch all active applications
3. Display them grouped by category
4. Sort by Display Order

## Adding New Applications

To add a new application:

1. Go to the **Applications** list in SharePoint
2. Click **New**
3. Fill in:
   - **Title**: Application name
   - **App ID**: Unique lowercase ID (e.g., "power-bi")
   - **Description**: What the app does
   - **Icon**: Emoji or icon URL
   - **App URL**: Link to the application
   - **Category**: Select appropriate category
   - **Is External**: Yes if opens in new tab
   - **Display Order**: Number for sorting
   - **Is Active**: Yes to show, No to hide
4. Click **Save**

The app will appear automatically on the Apps page!

## Troubleshooting

### Apps not showing?
- Check that **Is Active** is set to **Yes**
- Verify the SharePoint list name is exactly **`Applications`**
- Check browser console for errors

### Icons not displaying?
- Verify the Icon URL is publicly accessible
- Try using emojis instead of URLs
- Check that the image URL uses HTTPS

### Permission errors?
- Ensure users have Read access to the list
- Verify the app has Graph API permissions:
  - `Sites.Read.All`
  - `Sites.ReadWrite.All`

## Next Steps

After completing this setup:
1. The application code will automatically fetch apps from SharePoint
2. Apps will be displayed on the `/apps` page
3. Categories will be auto-generated based on data
4. Users can click apps to open them

## Maintenance

To maintain the apps:
- **Add new apps**: Create new items in the SharePoint list
- **Update apps**: Edit existing items
- **Hide apps**: Set **Is Active** to **No**
- **Reorder apps**: Change **Display Order** values
- **Add categories**: Update the Category column choices

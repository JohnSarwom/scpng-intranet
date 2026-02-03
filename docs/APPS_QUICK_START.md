# Apps SharePoint Integration - Quick Start Guide

This guide provides a quick overview of the Apps SharePoint integration implementation.

## What Was Implemented

The Apps feature has been migrated to use SharePoint as the data source instead of static configuration files. This allows administrators to manage applications through SharePoint's user-friendly interface.

## Key Features

✅ **Dynamic App Management** - Add, edit, and remove apps via SharePoint
✅ **Category Support** - Organize apps into custom categories
✅ **Icon/Image Support** - Use emojis or custom image URLs
✅ **Display Order Control** - Sort apps within categories
✅ **Active/Inactive Toggle** - Show or hide apps without deleting
✅ **Real-time Updates** - Changes in SharePoint reflect immediately
✅ **Fallback Support** - Uses static data if SharePoint is unavailable

## Files Created/Modified

### New Files
1. **`docs/APPS_SHAREPOINT_SETUP.md`** - Detailed SharePoint setup instructions
2. **`docs/APPS_QUICK_START.md`** - This quick start guide
3. **`src/services/appsSharePointService.ts`** - SharePoint API service
4. **`src/hooks/useApps.ts`** - React hook for fetching apps

### Modified Files
1. **`src/types/apps.ts`** - Updated to support SharePoint data structure
2. **`src/components/dashboard/AppsSection.tsx`** - Updated to use SharePoint data
3. **`src/components/layout/PageLayout.tsx`** - Added Apps icon to top nav
4. **`src/components/layout/MainSidebar.tsx`** - Removed Apps from sidebar

## SharePoint List Schema (Quick Reference)

**List Name:** `Applications`

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| Title | Text | Yes | App name |
| App ID | Text | Yes | Unique ID (lowercase) |
| Description | Multi-line text | No | App description |
| Icon | Hyperlink | No | Emoji or image URL |
| App URL | Hyperlink | Yes | App link |
| Category | Choice | Yes | App category |
| Is External | Yes/No | No | Opens in new tab |
| Display Order | Number | No | Sort order |
| Is Active | Yes/No | No | Show/hide app |

## Setup Steps (Summary)

1. **Create SharePoint List**
   - Navigate to: `https://scpng1.sharepoint.com/sites/scpngintranet`
   - Create list named `Applications`
   - Add all columns per schema above

2. **Add Sample Data**
   ```
   Title: Outlook
   App ID: outlook
   Description: Email, schedule, and set tasks
   Icon: 📧
   App URL: https://outlook.office.com
   Category: Microsoft 365
   Is External: Yes
   Display Order: 1
   Is Active: Yes
   ```

3. **Test the Integration**
   - Navigate to `/apps` in your application
   - Apps should load from SharePoint
   - Try filtering by category
   - Click refresh to reload data

## How It Works

```
User visits /apps
    ↓
AppsSection component loads
    ↓
useApps hook fetches data
    ↓
AppsSharePointService calls Graph API
    ↓
SharePoint returns Applications list items
    ↓
Data is mapped to AppLink format
    ↓
Apps are displayed grouped by category
```

## Usage Examples

### Adding a New App in SharePoint

1. Go to Applications list
2. Click "New"
3. Fill in:
   - Title: Power BI
   - App ID: powerbi
   - Description: Business analytics dashboards
   - Icon: 📊
   - App URL: https://app.powerbi.com
   - Category: Microsoft 365
   - Is External: Yes
   - Display Order: 10
   - Is Active: Yes
4. Click Save
5. App appears immediately on the Apps page

### Using Custom Icons

Instead of emojis, upload custom icons:

```
1. Upload icon to: /sites/scpngintranet/SiteAssets/AppIcons/powerbi.png
2. Get URL: https://scpng1.sharepoint.com/sites/scpngintranet/SiteAssets/AppIcons/powerbi.png
3. Enter URL in Icon field
```

### Hiding an App Temporarily

1. Edit the app in SharePoint
2. Set "Is Active" to "No"
3. Click Save
4. App is hidden from users

## Component Usage

### In Your React Components

```typescript
import { useApps } from '@/hooks/useApps';

function MyComponent() {
  const { apps, categories, loading, error, refetch } = useApps();

  if (loading) return <div>Loading apps...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Available Apps ({apps.length})</h2>
      {apps.map(app => (
        <div key={app.appId}>
          <h3>{app.icon} {app.title}</h3>
          <p>{app.description}</p>
          <a href={app.appUrl}>Open App</a>
        </div>
      ))}
    </div>
  );
}
```

### Filtering by Category

```typescript
const { getAppsByCategory } = useApps();
const microsoft365Apps = getAppsByCategory('Microsoft 365');
```

### Getting a Specific App

```typescript
const { getAppById } = useApps();
const outlookApp = getAppById('outlook');
```

## API Reference

### AppsSharePointService

```typescript
const service = new AppsSharePointService(graphClient);

// Initialize service
await service.initialize();

// Get all apps
const apps = await service.getApplications();

// Get apps by category
const categoryApps = await service.getApplicationsByCategory('Microsoft 365');

// Get categories
const categories = await service.getCategories();

// Add app (admin)
await service.addApplication({
  appId: 'teams',
  title: 'Teams',
  description: 'Collaboration platform',
  appUrl: 'https://teams.microsoft.com',
  category: 'Microsoft 365',
  icon: '👥',
  isExternal: true,
});

// Update app (admin)
await service.updateApplication(itemId, {
  description: 'Updated description',
  displayOrder: 5,
});

// Delete app (admin)
await service.deleteApplication(itemId);
```

### useApps Hook

```typescript
const {
  apps,           // SharePointApp[] - All active apps
  categories,     // string[] - Unique categories
  loading,        // boolean - Loading state
  error,          // string | null - Error message
  refetch,        // () => Promise<void> - Reload apps
  getAppsByCategory, // (category: string) => SharePointApp[]
  getAppById,     // (appId: string) => SharePointApp | undefined
} = useApps();
```

## Troubleshooting

### Apps Not Loading?

**Check:**
1. SharePoint list exists: `Applications`
2. List has data with `Is Active = Yes`
3. User has Read permissions on the list
4. Graph API permissions are granted:
   - `Sites.Read.All` or `Sites.ReadWrite.All`

**Console Errors:**
- Open browser DevTools → Console
- Look for errors starting with `[AppsSharePointService]`
- Check the error message for details

### Icons Not Showing?

**If using emojis:** Should work automatically
**If using URLs:**
- Verify URL is publicly accessible
- Use HTTPS URLs
- Check image file exists
- Try uploading to SharePoint and using that URL

### Categories Not Showing?

**Check:**
1. Category column is a "Choice" field
2. Categories are spelled consistently
3. Apps have categories assigned
4. At least one app with that category has `Is Active = Yes`

### Permission Errors?

**Fix:**
1. Go to SharePoint list settings
2. Check permissions
3. Ensure "All authenticated users" have Read access
4. Or add specific user groups

## Performance Considerations

- **Caching**: Apps are fetched once on page load
- **Refresh**: Use the Refresh button to reload
- **Automatic Updates**: Apps auto-refresh when navigating back to the page
- **Sorting**: Apps are sorted by `Display Order` within categories
- **Filtering**: Category filtering happens client-side for instant response

## Next Steps

1. ✅ Complete SharePoint list setup (see APPS_SHAREPOINT_SETUP.md)
2. ✅ Add your organization's apps
3. ✅ Test the Apps page
4. 🔲 Consider adding admin UI for managing apps
5. 🔲 Add search functionality
6. 🔲 Add favorites/pinning feature
7. 🔲 Add usage analytics

## Support

For detailed SharePoint setup instructions, see:
- **[APPS_SHAREPOINT_SETUP.md](./APPS_SHAREPOINT_SETUP.md)** - Complete setup guide

For issues or questions:
- Check browser console for errors
- Verify SharePoint list structure
- Ensure proper permissions
- Test with sample data first

## Example Data Import

Here's a CSV template for bulk importing apps:

```csv
Title,App ID,Description,Icon,App URL,Category,Is External,Display Order,Is Active
Outlook,outlook,Email and calendar,📧,https://outlook.office.com,Microsoft 365,Yes,1,Yes
Teams,teams,Chat and meetings,👥,https://teams.microsoft.com,Microsoft 365,Yes,2,Yes
Word,word,Document editor,📝,https://office.com/launch/word,Microsoft 365,Yes,3,Yes
Excel,excel,Spreadsheet editor,📊,https://office.com/launch/excel,Microsoft 365,Yes,4,Yes
PowerPoint,powerpoint,Presentation creator,📽️,https://office.com/launch/powerpoint,Microsoft 365,Yes,5,Yes
OneDrive,onedrive,Cloud storage,☁️,https://onedrive.live.com,Microsoft 365,Yes,6,Yes
SharePoint,sharepoint,Team sites,🔷,https://www.office.com/launch/sharepoint,Microsoft 365,Yes,7,Yes
```

Save as CSV and import via SharePoint's "Import from Excel" feature.

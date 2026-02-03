# Market News SharePoint Integration - Complete Implementation Guide

## Overview
This guide provides complete instructions for connecting the Market Data page to SharePoint for dynamic news management.

---

## 🎯 What We've Built

### Frontend Components
1. **SharePoint Service** - [src/services/marketNewsSharePointService.ts](src/services/marketNewsSharePointService.ts)
2. **React Hook** - [src/hooks/useMarketNews.ts](src/hooks/useMarketNews.ts)
3. **Updated Market Data Page** - [src/pages/MarketData.tsx](src/pages/MarketData.tsx)

### Backend Setup
- **SharePoint List**: `MarketNews`
- **Documentation**: [MARKET_NEWS_SHAREPOINT_SETUP.md](MARKET_NEWS_SHAREPOINT_SETUP.md)

---

## 📋 Implementation Steps

### Step 1: Create SharePoint List (Backend)

Follow the detailed guide in [MARKET_NEWS_SHAREPOINT_SETUP.md](MARKET_NEWS_SHAREPOINT_SETUP.md) to:

1. **Create the list** named `MarketNews` in your SharePoint site
2. **Add all required columns**:
   - Title (text)
   - PublishDate (date/time)
   - Category (choice)
   - RelatedCompany (multi-choice)
   - Priority (choice)
   - IsActive (yes/no)
   - ExpiryDate (date)
   - LinkURL (hyperlink)
   - Source (text)
   - Summary (multi-line text)

3. **Add sample data** (at least 10-15 news items for testing)

**Estimated time**: 30-45 minutes

---

### Step 2: Verify Azure AD Permissions

Ensure your Azure AD app registration has the required Microsoft Graph API permissions:

#### Required Permissions:
- `Sites.Read.All` - To read SharePoint list data
- `Sites.ReadWrite.All` - (Optional) If you want to add/edit news from the app

#### How to Check/Add Permissions:
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Find your app (e.g., "SCPNG Intranet App")
4. Click **API permissions**
5. Verify the permissions listed above exist
6. If not, click **+ Add a permission** > **Microsoft Graph** > **Delegated permissions**
7. Search for and add the required permissions
8. Click **Grant admin consent**

**Estimated time**: 5-10 minutes

---

### Step 3: Test the Integration

#### Option A: Using the Application

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Navigate to Market Data page**:
   - Open your browser to the Market Data page
   - Look at the "Market News" section in the right sidebar

4. **Expected behavior**:
   - Loading spinner appears initially
   - News items from SharePoint display with:
     - Time ago (e.g., "2 hours ago")
     - Breaking badge for High priority news
     - Category badges
     - News title
     - Summary (if provided)
     - Source (if provided)
   - Refresh button to reload news
   - Click on news items with LinkURL opens in new tab

#### Option B: Check Browser Console

1. Open DevTools (F12)
2. Go to Console tab
3. Look for any errors related to:
   - Microsoft Graph authentication
   - SharePoint list access
   - Data fetching

#### Common Issues:

**Issue: "Market News list 'MarketNews' not found"**
- Solution: Verify the list name is exactly `MarketNews` (case-sensitive)
- Check that you're looking in the correct SharePoint site

**Issue: "Permission denied" or 403 errors**
- Solution: Check Azure AD permissions and SharePoint list permissions
- Ensure you're logged in with appropriate credentials

**Issue: "No news available"**
- Solution: Check that news items have:
  - `IsActive` = Yes
  - `PublishDate` is not in the future
  - `ExpiryDate` has not passed (if set)

**Estimated time**: 10-15 minutes

---

## 🔧 Code Architecture

### Service Layer (marketNewsSharePointService.ts)

```typescript
// Main service class
MarketNewsSharePointService
  - initialize() // Gets site and list IDs
  - getAllNews() // Fetches all active news
  - getNewsByCategory() // Filter by category
  - getNewsByCompany() // Filter by company
  - getHighPriorityNews() // High priority only
  - createNewsItem() // Add new news
  - updateNewsItem() // Update existing
  - deleteNewsItem() // Soft delete (sets IsActive=false)

// Convenience functions
getAllMarketNews(client)
getNewsByCompany(client, symbol)
getHighPriorityNews(client)
```

### Hook Layer (useMarketNews.ts)

```typescript
// Main hook - fetches all news
useMarketNews()
  Returns: { news, isLoading, error, refetch }

// Filter by company
useCompanyNews(companySymbol)
  Returns: { news, isLoading, error, refetch }

// High priority only
useHighPriorityNews()
  Returns: { news, isLoading, error, refetch }
```

### Component Integration (MarketData.tsx)

```typescript
// Usage in component
const { news: marketNews, isLoading: newsLoading, error: newsError, refetch: refetchNews } = useMarketNews();

// Displays:
// - Loading state
// - Error state with retry button
// - Empty state
// - News list with rich formatting
```

---

## 🎨 Features Implemented

### Frontend Features:
1. ✅ **Loading State** - Spinner while fetching data
2. ✅ **Error Handling** - User-friendly error messages with retry
3. ✅ **Empty State** - Message when no news available
4. ✅ **Refresh Button** - Manual reload of news
5. ✅ **Priority Badges** - "Breaking" badge for high priority
6. ✅ **Category Tags** - Visual category indicators
7. ✅ **Time Ago** - Human-readable timestamps
8. ✅ **Clickable Links** - Open external URLs in new tab
9. ✅ **Summary Display** - Show brief summary if available
10. ✅ **Source Attribution** - Display news source

### Backend Features:
1. ✅ **Active/Inactive Toggle** - Control news visibility
2. ✅ **Priority Sorting** - High priority news show first
3. ✅ **Date Filtering** - Respect publish and expiry dates
4. ✅ **Category System** - Organize news by type
5. ✅ **Company Tagging** - Link news to specific companies
6. ✅ **Rich Content** - Support for summaries and links

---

## 🚀 Advanced Usage

### Filtering News by Company

Want to show only news related to a specific company?

```typescript
// In your component
import { useCompanyNews } from '@/hooks/useMarketNews';

const { news, isLoading, error } = useCompanyNews('BSP');
// Returns only news tagged with BSP
```

### High Priority News Only

Show only breaking/important news:

```typescript
import { useHighPriorityNews } from '@/hooks/useMarketNews';

const { news, isLoading, error } = useHighPriorityNews();
// Returns only High priority news
```

### Creating News from the App (Optional)

If you want to add news programmatically:

```typescript
import { useMicrosoftGraph } from '@/hooks/useMicrosoftGraph';
import { MarketNewsSharePointService } from '@/services/marketNewsSharePointService';

const { client } = useMicrosoftGraph();
const service = new MarketNewsSharePointService(client);

await service.createNewsItem({
  title: "New market development",
  publishDate: new Date().toISOString(),
  category: "Market Activity",
  priority: "High",
  isActive: true,
  relatedCompany: ["BSP", "PNGX"],
  summary: "Details about the development...",
  source: "PNGX Official"
});
```

---

## 📊 Data Flow

```
SharePoint List (MarketNews)
        ↓
Microsoft Graph API
        ↓
marketNewsSharePointService.ts
        ↓
useMarketNews() hook
        ↓
MarketData.tsx component
        ↓
User sees news in sidebar
```

---

## 🔒 Security Considerations

1. **Authentication**: Uses Microsoft Graph OAuth
2. **Permissions**: Read-only by default (Sites.Read.All)
3. **Data Validation**: All fields validated in service layer
4. **XSS Protection**: React automatically escapes content
5. **HTTPS Only**: All SharePoint API calls use HTTPS

---

## 📝 Content Management Workflow

### For Content Editors:

1. **Adding News**:
   - Go to SharePoint site > MarketNews list
   - Click "+ New"
   - Fill in required fields (Title, PublishDate, Category, Priority)
   - Set IsActive to "Yes"
   - Click "Save"

2. **Editing News**:
   - Find the news item in the list
   - Click on it to open details
   - Click "Edit"
   - Make changes
   - Click "Save"

3. **Removing News**:
   - Open the news item
   - Set IsActive to "No"
   - Or set an ExpiryDate in the past
   - Click "Save"

4. **Organizing News**:
   - Use Categories for grouping
   - Tag RelatedCompany for company-specific news
   - Set Priority to "High" for breaking news
   - Use ExpiryDate for time-sensitive announcements

---

## 🧪 Testing Checklist

- [ ] SharePoint list created with all columns
- [ ] At least 10 sample news items added
- [ ] Azure AD permissions configured
- [ ] App builds without errors
- [ ] Market Data page loads
- [ ] News section shows "Loading..." initially
- [ ] News items display correctly
- [ ] "Breaking" badge shows for High priority
- [ ] Category badges display
- [ ] Time ago calculation is correct
- [ ] Refresh button works
- [ ] Click on news with LinkURL opens new tab
- [ ] Error handling works (test by disabling network)
- [ ] Empty state shows when no news

---

## 🐛 Troubleshooting

### News Not Showing

**Check:**
1. Browser console for errors
2. SharePoint list name is exactly `MarketNews`
3. News items have `IsActive = Yes`
4. `PublishDate` is not in the future
5. Azure AD permissions are granted
6. You're authenticated with Microsoft

### Authentication Errors

**Check:**
1. Microsoft Graph client is initialized
2. User is logged in
3. Permissions in Azure AD
4. Token hasn't expired (refresh the page)

### Performance Issues

**Solutions:**
1. Limit news items to 50-100 active items
2. Use ExpiryDate to auto-hide old news
3. Set old news to IsActive=No regularly
4. Consider pagination if > 100 items

---

## 🎓 Next Steps

### Enhancements You Can Add:

1. **News Search** - Add search functionality
2. **Category Filter** - Filter news by category dropdown
3. **Company Filter** - Show news for selected company only
4. **Pagination** - Load more button for older news
5. **Favorites** - Let users bookmark news items
6. **Notifications** - Alert users of breaking news
7. **Admin Panel** - Manage news from within the app
8. **Analytics** - Track which news items are most viewed

---

## 📚 Related Documentation

- [MARKET_NEWS_SHAREPOINT_SETUP.md](MARKET_NEWS_SHAREPOINT_SETUP.md) - Detailed SharePoint setup
- [Microsoft Graph API Docs](https://docs.microsoft.com/en-us/graph/api/resources/list)
- [SharePoint Lists REST API](https://docs.microsoft.com/en-us/sharepoint/dev/sp-add-ins/working-with-lists-and-list-items-with-rest)

---

## ✅ Summary

You've successfully:
1. ✅ Created a SharePoint service for Market News
2. ✅ Built React hooks for data fetching
3. ✅ Integrated SharePoint data into Market Data page
4. ✅ Replaced mock data with live SharePoint content
5. ✅ Added error handling and loading states
6. ✅ Implemented rich news display with badges and formatting

The Market Data page now pulls real-time news from SharePoint, allowing content editors to manage news without touching code!

---

**Document Version**: 1.0
**Last Updated**: December 2025
**Author**: IT Unit - SCPNG

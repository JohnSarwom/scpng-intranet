# Market News SharePoint Setup Guide

## Overview
This document provides step-by-step instructions to create and configure a SharePoint list for Market News that will replace the hardcoded news data in the Market Data page.

---

## Step 1: Create the SharePoint List

1. Navigate to your SharePoint site: `https://scpng1.sharepoint.com/sites/scpngintranet`
2. Click on **Settings (gear icon)** > **Site contents**
3. Click **+ New** > **List**
4. Choose **Blank list**
5. Name: `MarketNews`
6. Description: `PNGX and Capital Market news articles`
7. Click **Create**

---

## Step 2: Configure List Columns

After creating the list, add the following columns:

### Column 1: Title (Already exists)
- **Type**: Single line of text
- **Description**: News headline
- **Required**: Yes
- **Example**: "BSP announces quarterly dividend of K 0.45"

### Column 2: PublishDate
1. Click **+ Add column** > **Date and time**
2. Name: `PublishDate`
3. Description: Date and time the news was published
4. Date and Time format: **Date and Time**
5. Default value: **Today's date**
6. Required: Yes

### Column 3: Category
1. Click **+ Add column** > **Choice**
2. Name: `Category`
3. Description: News category
4. Choices (enter each on a new line):
   ```
   Market Activity
   Company Announcement
   Regulatory
   Mining Sector
   Financial Sector
   Energy Sector
   Agriculture Sector
   General Market
   ```
5. Default value: `General Market`
6. Required: Yes

### Column 4: RelatedCompany
1. Click **+ Add column** > **Choice** (Allow multiple selections)
2. Name: `RelatedCompany`
3. Description: Companies mentioned in the news
4. Choices:
   ```
   BSP
   CCP
   CGA
   CPL
   KAM
   KSL
   NEM
   NGP
   NIU
   SST
   STO
   PNGX
   Other
   ```
5. Allow multiple selections: **Yes**
6. Required: No

### Column 5: Priority
1. Click **+ Add column** > **Choice**
2. Name: `Priority`
3. Choices:
   ```
   High
   Normal
   Low
   ```
4. Default value: `Normal`
5. Required: Yes

### Column 6: IsActive
1. Click **+ Add column** > **Yes/No**
2. Name: `IsActive`
3. Description: Whether the news should be displayed
4. Default value: **Yes**
5. Required: Yes

### Column 7: ExpiryDate
1. Click **+ Add column** > **Date and time**
2. Name: `ExpiryDate`
3. Description: Date when news should stop displaying (optional)
4. Date and Time format: **Date only**
5. Required: No

### Column 8: LinkURL
1. Click **+ Add column** > **Hyperlink**
2. Name: `LinkURL`
3. Description: Optional link to full article or external source
4. Required: No

### Column 9: Source
1. Click **+ Add column** > **Single line of text**
2. Name: `Source`
3. Description: News source (e.g., PNGX, Company Press Release)
4. Required: No

### Column 10: Summary
1. Click **+ Add column** > **Multiple lines of text**
2. Name: `Summary`
3. Description: Brief summary or full text of the news
4. Number of lines: 6
5. Required: No

---

## Step 3: Configure List Views

### Create "Active News" View
1. Click on **All Items** dropdown > **Create new view**
2. View Name: `Active News`
3. Make this the default view: **Yes**
4. Filter: Show items only when **IsActive** is equal to **Yes**
5. Sort: **PublishDate** (Descending)
6. Columns to display:
   - Title
   - PublishDate
   - Category
   - RelatedCompany
   - Priority
   - Source
7. Click **Create**

---

## Step 4: Add Sample Data

Add the following sample news items to test the integration:

### News Item 1
- **Title**: PNGX records highest trading volume in Q4
- **PublishDate**: [2 hours ago from current time]
- **Category**: Market Activity
- **RelatedCompany**: PNGX
- **Priority**: High
- **IsActive**: Yes
- **Source**: PNGX Official
- **Summary**: The Papua New Guinea Stock Exchange recorded its highest trading volume in the fourth quarter, reflecting increased investor confidence.

### News Item 2
- **Title**: BSP announces quarterly dividend of K 0.45
- **PublishDate**: [5 hours ago from current time]
- **Category**: Company Announcement
- **RelatedCompany**: BSP
- **Priority**: High
- **IsActive**: Yes
- **Source**: BSP Press Release
- **Summary**: Bank South Pacific announces a quarterly dividend of K 0.45 per share to shareholders.

### News Item 3
- **Title**: Mining sector leads market gains on commodity prices
- **PublishDate**: [Yesterday's date]
- **Category**: Mining Sector
- **RelatedCompany**: NEM, CGA
- **Priority**: Normal
- **IsActive**: Yes
- **Source**: Market Analysis
- **Summary**: Mining stocks outperform as global commodity prices surge, with Newmont and Crater Gold seeing significant gains.

### News Item 4
- **Title**: Kina Securities reports strong financial performance
- **PublishDate**: [1 day ago]
- **Category**: Company Announcement
- **RelatedCompany**: KSL
- **Priority**: Normal
- **IsActive**: Yes
- **Source**: KSL Financial Report

### News Item 5
- **Title**: CPL Group expands operations in Lae industrial zone
- **PublishDate**: [1 day ago]
- **Category**: Company Announcement
- **RelatedCompany**: CPL
- **Priority**: Normal
- **IsActive**: Yes
- **Source**: CPL Media Release

### Continue adding more sample data...
- Santos Limited announces new LNG shipment schedule (STO)
- Credit Corporation PNG opens three new branches (CCP)
- Steamships Trading Company increases freight capacity (SST)
- Newmont Corporation reports record gold production (NEM)
- NGIP Agmark signs major coffee export deal (NGP)
- Kina Asset Management launches new investment fund (KAM)
- Market regulator announces new transparency measures (PNGX)

---

## Step 5: Configure Permissions

1. Click on **Settings (gear icon)** > **List settings**
2. Under **Permissions and Management**, click **Permissions for this list**
3. Ensure the following permissions:
   - **All authenticated users** can **Read** the list
   - **SCPNG Admins/Content Editors** can **Edit** and **Add** items
   - **Market Data Team** can **Add** and **Edit** items (if you have this group)

---

## Step 6: API Permissions Required

For the application to access this SharePoint list via Microsoft Graph API, ensure the following permissions are configured in Azure AD:

### Required Microsoft Graph API Permissions:
- `Sites.Read.All` - Read items in all site collections
- `Sites.ReadWrite.All` - Read and write items in all site collections (if you want to add news from the app)

These should already be configured if you're using other SharePoint lists in your application.

---

## Step 7: Verify List Setup

1. Ensure the list is named exactly: `MarketNews`
2. Verify all columns exist with correct internal names
3. Add at least 10-15 sample news items for testing
4. Check that the "Active News" view filters correctly
5. Test that news items with `IsActive = No` don't show in the default view

---

## Step 8: Get List Information

After creating the list, you'll need to reference it in your code. The list will be accessible at:

**List Display Name**: `MarketNews`
**Site Path**: `/sites/scpngintranet`
**Site Domain**: `scpng1.sharepoint.com`

---

## Data Management Tips

### Regular Maintenance
1. **Archiving Old News**: Set `IsActive` to `No` for old news or use `ExpiryDate`
2. **Review Frequency**: Review news weekly to keep content fresh
3. **Priority Usage**: Use "High" priority sparingly for breaking news
4. **Categories**: Keep categories consistent for better filtering

### Best Practices
- Always set appropriate `PublishDate` for chronological ordering
- Use `RelatedCompany` to tag relevant companies
- Add `LinkURL` when referencing external sources
- Keep `Title` concise (under 100 characters)
- Use `Summary` for additional context when needed

---

## Troubleshooting

### Issue: List not found error
- Verify the list name is exactly `MarketNews`
- Check that the list is in the correct site

### Issue: Permission denied
- Verify API permissions in Azure AD
- Check SharePoint list permissions
- Ensure user is authenticated

### Issue: No data showing
- Check that items have `IsActive` set to `Yes`
- Verify `PublishDate` is not in the future
- Check if `ExpiryDate` has passed

---

## Next Steps

After completing this setup:
1. Test the SharePoint list by adding/editing items manually
2. Verify the frontend integration (see code implementation)
3. Train content editors on how to add news items
4. Set up a content review workflow (optional)

---

## Column Summary Table

| Column Name | Type | Required | Description |
|-------------|------|----------|-------------|
| Title | Text | Yes | News headline |
| PublishDate | DateTime | Yes | When news was published |
| Category | Choice | Yes | News category |
| RelatedCompany | Multiple Choice | No | Associated companies |
| Priority | Choice | Yes | High/Normal/Low |
| IsActive | Yes/No | Yes | Display toggle |
| ExpiryDate | Date | No | Optional expiry date |
| LinkURL | Hyperlink | No | External link |
| Source | Text | No | News source |
| Summary | Multi-line Text | No | News details |

---

**Document Version**: 1.0
**Last Updated**: December 2025
**Maintained By**: IT Unit - SCPNG

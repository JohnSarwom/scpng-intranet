# Information Slideshows SharePoint List Setup

## Overview
This document describes the SharePoint list configuration for three information slideshow categories on the dashboard:
1. **MS Office 365 Tips** - Guidance on using Microsoft 365 applications
2. **Capital Market News** - Global securities commission and capital market news
3. **Capital Market Acts** - PNG capital market regulations and acts

## SharePoint List: Information Slideshows

### List Name
`InformationSlideshows`

### List Columns

| Column Name | Type | Required | Description |
|------------|------|----------|-------------|
| **Title** | Single line of text | Yes | Slide title/headline |
| **Description** | Multiple lines of text | Yes | Detailed content/body text |
| **Category** | Choice | Yes | Type of slide: "MS Office 365 Tips", "Capital Market News", "Capital Market Acts" |
| **ImageURL** | Hyperlink | No | URL to slide image (optional) |
| **Priority** | Choice | No | Display priority: "Normal", "High" |
| **PublishDate** | Date and Time | Yes | When the slide should start appearing |
| **ExpiryDate** | Date and Time | No | When the slide should stop appearing (optional) |
| **IsActive** | Yes/No | Yes | Whether the slide is currently active (default: Yes) |
| **Author** | Single line of text | No | Content author/department |
| **LinkURL** | Hyperlink | No | Optional link for "Read More" functionality |
| **OrderIndex** | Number | No | Custom sort order within category (lower = first) |

### Choice Field Details

#### Category Choices
- MS Office 365 Tips
- Capital Market News
- Capital Market Acts

#### Priority Choices
- Normal (default)
- High

### Default View Settings
- Sort by: Category (ascending), then OrderIndex (ascending), then PublishDate (descending)
- Filter: IsActive = Yes AND PublishDate <= Today AND (ExpiryDate >= Today OR ExpiryDate is blank)

## SharePoint Site Structure

### Site Location
`https://[your-sharepoint-domain]/sites/SCPNGIntranet`

### List Location
`https://[your-sharepoint-domain]/sites/SCPNGIntranet/Lists/InformationSlideshows`

## Sample Data

### MS Office 365 Tips - Sample 1
```
Title: Mastering Outlook Email Management
Description: Learn how to organize your inbox with folders, rules, and quick steps. Set up focused inbox to prioritize important emails. Use categories and flags to track action items efficiently.
Category: MS Office 365 Tips
ImageURL: [URL to relevant image]
Priority: Normal
PublishDate: 2024-12-01
IsActive: Yes
Author: IT Department
OrderIndex: 1
```

### MS Office 365 Tips - Sample 2
```
Title: Microsoft Teams Best Practices
Description: Maximize your collaboration with Teams. Create channels for projects, use @mentions effectively, schedule meetings with calendar integration, and share files directly in conversations.
Category: MS Office 365 Tips
ImageURL: [URL to relevant image]
Priority: High
PublishDate: 2024-12-01
IsActive: Yes
Author: IT Department
OrderIndex: 2
```

### Capital Market News - Sample 1
```
Title: IOSCO Publishes New Guidelines on Digital Assets
Description: The International Organization of Securities Commissions (IOSCO) has released comprehensive guidelines for regulating digital assets and crypto-asset service providers globally.
Category: Capital Market News
ImageURL: [URL to relevant image]
Priority: High
PublishDate: 2024-11-28
IsActive: Yes
Author: Research Department
LinkURL: https://www.iosco.org/
```

### Capital Market Acts - Sample 1
```
Title: Securities Act 1997 - Key Provisions
Description: The Securities Act 1997 establishes the regulatory framework for securities markets in PNG. It covers licensing requirements, disclosure obligations, and market conduct rules for all market participants.
Category: Capital Market Acts
ImageURL: [URL to relevant image]
Priority: Normal
PublishDate: 2024-12-01
IsActive: Yes
Author: Legal & Compliance
OrderIndex: 1
```

## Power Automate Workflow Integration

### Workflow Purpose
Automatically generate slideshow content based on templates and scheduled triggers.

### Trigger Options
1. **Scheduled Recurrence** - Generate new content weekly/monthly
2. **Manual Trigger** - Admin request via SharePoint button
3. **Item Created in Request List** - Content request submitted

### Workflow Actions
1. Get template based on category
2. Generate or fetch content (could integrate with external APIs for capital market news)
3. Create new item in InformationSlideshows list
4. Set appropriate metadata (category, dates, priority)
5. Send notification to approver

### Example Flow Structure
```
Trigger: Recurrence (Weekly)
  ↓
Condition: Check Category Schedule
  ↓
Branch 1: MS Office 365 Tips
  - Get random tip from template library
  - Create new slideshow item
  ↓
Branch 2: Capital Market News
  - Fetch latest news from configured sources
  - Create slideshow items for each news item
  ↓
Branch 3: Capital Market Acts
  - Rotate through acts library
  - Create educational slide
  ↓
Send summary email to admin
```

## Permissions

### List Permissions
- **Contribute**: IT Admin, Content Managers
- **Read**: All authenticated users
- **Full Control**: IT Department, Site Owners

### Item-Level Permissions
- Draft items visible only to creators and approvers
- Published items (IsActive=Yes) visible to all users

## API Access Configuration

### SharePoint REST API Endpoint
```
GET https://[your-domain]/sites/SCPNGIntranet/_api/web/lists/getbytitle('InformationSlideshows')/items
?$filter=IsActive eq true and PublishDate le datetime'[now]' and (ExpiryDate ge datetime'[now]' or ExpiryDate eq null)
&$orderby=Category,OrderIndex,PublishDate desc
&$select=Id,Title,Description,Category,ImageURL,Priority,PublishDate,Author,LinkURL,OrderIndex
```

### Graph API Endpoint (Alternative)
```
GET https://graph.microsoft.com/v1.0/sites/{site-id}/lists/{list-id}/items
?$filter=fields/IsActive eq true
&$expand=fields
&$orderby=fields/Category,fields/OrderIndex,fields/PublishDate desc
```

## Implementation Notes

1. **Image Storage**: Store images in SharePoint document library (e.g., `/sites/SCPNGIntranet/SiteAssets/SlideshowImages/`)
2. **Content Approval**: Consider enabling content approval workflow for sensitive categories
3. **Archive Strategy**: Items with IsActive=No should be retained for audit purposes
4. **Performance**: Index the Category and IsActive columns for faster queries
5. **Caching**: Frontend should cache slideshow data for 15 minutes to reduce API calls

## Maintenance

### Regular Tasks
- Monthly review of expired slides
- Quarterly update of MS Office 365 tips
- Weekly check for new capital market regulations
- Bi-weekly review of international securities news

### Content Guidelines
- Keep titles under 80 characters
- Descriptions should be 150-300 characters for optimal display
- Images should be 1200x675px (16:9 aspect ratio)
- Test all external links before publishing
- Use clear, professional language appropriate for all staff levels

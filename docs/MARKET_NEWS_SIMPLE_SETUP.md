# Market News SharePoint - Simple Setup

## Quick Column Reference

Your SharePoint list `MarketNews` needs **4 columns total**:

| Column Name | Type | Required |
|-------------|------|----------|
| **Title** | Single line of text | ✅ (default) |
| **Company** | Single line of text | ✅ |
| **URL** | Single line of text | ✅ |
| **DatePublished** | Date and time | ✅ |

---

## Setup Steps

### 1. Create the List (2 min)
1. Go to: `https://scpng1.sharepoint.com/sites/scpngintranet`
2. Click **Settings** → **Site contents** → **+ New** → **List**
3. Name: `MarketNews`
4. Click **Create**

### 2. Add Columns (3 min)

**Column 1: Company**
- Click **+ Add column** → **Single line of text**
- Name: `Company`
- Click **Save**

**Column 2: URL**
- Click **+ Add column** → **Single line of text**
- Name: `URL`
- Click **Save**

**Column 3: DatePublished**
- Click **+ Add column** → **Date and time**
- Name: `DatePublished`
- Include time: **Yes**
- Default value: **Today's date**
- Click **Save**

---

## Your Sample Data Entry

Based on your data, here's how to enter one item:

### Example 1:
- **Title**: `Substantial Shareholder`
- **Company**: `KAM`
- **URL**: `https://www.pngx.com.pg/kam-substantial-shareholder/`
- **DatePublished**: `December 2, 2025` (select from calendar)

### Example 2:
- **Title**: `Form 144 as filed – Bruce Brook`
- **Company**: `NEM`
- **URL**: `https://www.pngx.com.pg/nem-form-144-as-filed-bruce-brook-8/`
- **DatePublished**: `December 2, 2025`

### Example 3:
- **Title**: `Appendix 10B`
- **Company**: `KAM`
- **URL**: `https://www.pngx.com.pg/kam-appendix-10b/`
- **DatePublished**: `December 1, 2025`

---

## Bulk Import Option (Fast Method)

If you have all your data ready, you can:

1. **Open the list in Excel**:
   - Click **Integrate** → **Export to Excel**
   - Open the downloaded file
   - Enable editing

2. **Paste your data**:
   - Copy your data from your source
   - Paste into Excel columns: Company, Title, URL, DatePublished
   - Save the file

3. **Sync back to SharePoint**:
   - Changes sync automatically
   - Or click **Refresh** in Excel to upload

---

## How It Will Display

In the Market Data page, each news item will show:

```
[KAM] Just now
Substantial Shareholder
```

Clicking on it will open the URL in a new tab.

---

## Company Codes

Based on your data, use these company codes:
- **KAM** - Kina Asset Management
- **NEM** - Newmont Corporation
- **CGA** - Crater Gold Mining (PNG Air)
- **BSP** - Bank South Pacific
- **KSL** - Kina Securities Limited
- **CPL** - CPL Group
- **SST** - Steamships Trading
- **STO** - Santos Limited
- **CCP** - Credit Corporation PNG

---

## Testing

After adding data:
1. Run `npm run dev`
2. Go to Market Data page
3. Check the "Market News" sidebar (right side)
4. You should see your news items sorted by date
5. Click any item → Opens URL in new tab

---

## Troubleshooting

**No news showing?**
- Check column names are **exactly**: `Company`, `Title`, `URL`, `DatePublished` (case-sensitive)
- Verify dates are valid
- Refresh the page

**Wrong data?**
- Check SharePoint column internal names match
- Verify data types are correct

**Errors in console?**
- Check Azure AD permissions (`Sites.Read.All`)
- Verify you're authenticated with Microsoft

---

**That's it!** Your setup is complete with just 4 simple columns.

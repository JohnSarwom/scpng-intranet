# Market News SharePoint Integration - Quick Start

## 🚀 5-Minute Setup Guide

### Step 1: Create SharePoint List (10 min)
1. Go to: `https://scpng1.sharepoint.com/sites/scpngintranet`
2. Click **Settings** → **Site contents** → **+ New** → **List**
3. Name: `MarketNews`
4. Click **Create**

### Step 2: Add Columns (15 min)
Click **+ Add column** for each:

| Column Name | Type | Required | Choices |
|------------|------|----------|---------|
| Title | Text | ✅ | (exists) |
| PublishDate | Date & Time | ✅ | - |
| Category | Choice | ✅ | Market Activity, Company Announcement, Regulatory, Mining Sector, Financial Sector, Energy Sector, Agriculture Sector, General Market |
| RelatedCompany | Multiple Choice | ❌ | BSP, CCP, CGA, CPL, KAM, KSL, NEM, NGP, NIU, SST, STO, PNGX, Other |
| Priority | Choice | ✅ | High, Normal, Low |
| IsActive | Yes/No | ✅ | - |
| ExpiryDate | Date | ❌ | - |
| LinkURL | Hyperlink | ❌ | - |
| Source | Text | ❌ | - |
| Summary | Multi-line Text | ❌ | - |

### Step 3: Add Sample Data (5 min)
Add at least 5 test news items:

```
Title: BSP announces quarterly dividend
PublishDate: [Today]
Category: Company Announcement
RelatedCompany: BSP
Priority: High
IsActive: Yes
```

### Step 4: Test (2 min)
1. Run: `npm run dev`
2. Go to Market Data page
3. Check sidebar for news

---

## ✅ Success Checklist
- [ ] List named exactly `MarketNews`
- [ ] All 10 columns created
- [ ] 5+ sample news items added
- [ ] Items have IsActive = Yes
- [ ] App running and news displays

---

## 🆘 Quick Troubleshooting

### No news showing?
- Check: IsActive = Yes
- Check: PublishDate not in future
- Refresh page (F5)

### Permission error?
- Verify Azure AD has `Sites.Read.All`
- Check you're logged in with Microsoft

### List not found?
- Verify list name is `MarketNews` (exact)
- Check correct SharePoint site

---

## 📖 Full Documentation
- [Complete Setup Guide](MARKET_NEWS_SHAREPOINT_SETUP.md)
- [Implementation Guide](MARKET_NEWS_IMPLEMENTATION_GUIDE.md)

---

## 🎯 What's New on Frontend
Files created/updated:
- `src/services/marketNewsSharePointService.ts` (NEW)
- `src/hooks/useMarketNews.ts` (NEW)
- `src/pages/MarketData.tsx` (UPDATED)

No npm install needed - uses existing dependencies!

---

**Quick Help**: If stuck, see full guide or contact IT Unit

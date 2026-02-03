# Market Data SharePoint Backend Setup Guide

This document provides the complete SharePoint list structure for the Market Data dashboard.

---

## SharePoint Lists Required

### 1. **Market_Companies** (Main Company List)
### 2. **Market_PriceHistory** (Historical Price Data)
### 3. **Market_Settings** (Dashboard Settings)

---

## 1. Market_Companies List

### Purpose
Stores information about listed companies on the PNG Stock Exchange.

### Columns

| Column Name | Type | Required | Description | Example |
|------------|------|----------|-------------|---------|
| **Title** | Single line of text | Yes | Company symbol/ticker | BSP |
| **CompanyName** | Single line of text | Yes | Full company name | Bank South Pacific |
| **Sector** | Choice | Yes | Industry sector | Financials, Mining, Energy, etc. |
| **LastPrice** | Number | Yes | Most recent trading price | 28.75 |
| **PreviousClose** | Number | Yes | Previous day's closing price | 28.20 |
| **ChangePercent** | Number | Yes | Percentage change | 1.95 |
| **Volume** | Number | Yes | Trading volume | 10200 |
| **MarketCap** | Single line of text | Yes | Market capitalization | K 60.2B |
| **CompanyLogo** | Image | No | Company logo (optional) | [Image URL or upload] |
| **PrimaryColor** | Single line of text | Yes | Primary brand color (hex) | #0066cc |
| **SecondaryColor** | Single line of text | Yes | Secondary brand color (hex) | #0099ff |
| **IsActive** | Yes/No | Yes | Whether company is actively traded | Yes |
| **DisplayOrder** | Number | No | Sort order in UI | 1, 2, 3... |
| **ListedDate** | Date | No | Date company was listed | 1/1/2020 |
| **Website** | Hyperlink | No | Company website | https://bsp.com.pg |
| **Description** | Multiple lines of text | No | Company description | Leading bank in PNG... |

### Choice Field Options

**Sector:**
- Financials
- Mining
- Energy
- Industrial
- Agriculture
- Asset Management
- Conglomerate
- Other

---

## 2. Market_PriceHistory List

### Purpose
Stores historical OHLCV (Open, High, Low, Close, Volume) data for each company.

### Columns

| Column Name | Type | Required | Description | Example |
|------------|------|----------|-------------|---------|
| **Title** | Single line of text | Yes | Auto-generated ID | BSP_2024-12-03 |
| **CompanySymbol** | Lookup | Yes | Links to Market_Companies (Title) | BSP |
| **TradeDate** | Date and Time | Yes | Trading date/time | 12/3/2024 9:30 AM |
| **OpenPrice** | Number | Yes | Opening price | 28.50 |
| **HighPrice** | Number | Yes | Highest price of the day | 28.85 |
| **LowPrice** | Number | Yes | Lowest price of the day | 28.35 |
| **ClosePrice** | Number | Yes | Closing price | 28.75 |
| **Volume** | Number | Yes | Trading volume | 15000 |
| **Value** | Currency | No | Total value traded | K 431,250 |
| **NumberOfTrades** | Number | No | Number of trades executed | 156 |

### Indexing Recommendations
- Create index on **CompanySymbol** + **TradeDate** (for fast queries)
- Set list threshold to 5000+ items
- Enable versioning: No (to save space)

### Views to Create

**Default View:**
- Filter: Last 60 days
- Sort: TradeDate descending
- Group by: CompanySymbol

**Company History View:**
- Filter by CompanySymbol parameter
- Sort: TradeDate ascending

---

## 3. Market_Settings List

### Purpose
Stores global dashboard settings and user preferences.

### Columns

| Column Name | Type | Required | Description | Example |
|------------|------|----------|-------------|---------|
| **Title** | Single line of text | Yes | Setting name | DefaultTimeRange |
| **SettingKey** | Single line of text | Yes | Unique identifier | default_time_range |
| **SettingValue** | Multiple lines of text | Yes | Setting value | 2M |
| **SettingType** | Choice | Yes | Data type | String, Number, Boolean, JSON |
| **Category** | Choice | Yes | Setting category | General, Display, Data |
| **Description** | Multiple lines of text | No | What this setting does | Default chart time range |
| **IsActive** | Yes/No | Yes | Whether setting is active | Yes |
| **ModifiedBy** | Person or Group | Auto | Last modified by | Admin |

### Choice Field Options

**SettingType:**
- String
- Number
- Boolean
- JSON
- Color

**Category:**
- General
- Display
- Data
- Colors
- Performance

### Pre-populate with Default Settings

```json
[
  {
    "Title": "Default Time Range",
    "SettingKey": "default_time_range",
    "SettingValue": "2M",
    "SettingType": "String",
    "Category": "General",
    "Description": "Default chart time range on page load"
  },
  {
    "Title": "Live Updates Enabled",
    "SettingKey": "live_updates_enabled",
    "SettingValue": "true",
    "SettingType": "Boolean",
    "Category": "General",
    "Description": "Enable real-time price updates"
  },
  {
    "Title": "Auto Cycle Enabled",
    "SettingKey": "auto_cycle_enabled",
    "SettingValue": "false",
    "SettingType": "Boolean",
    "Category": "General",
    "Description": "Auto-cycle through companies"
  },
  {
    "Title": "Cycle Interval",
    "SettingKey": "cycle_interval",
    "SettingValue": "5000",
    "SettingType": "Number",
    "Category": "General",
    "Description": "Auto-cycle interval in milliseconds"
  },
  {
    "Title": "Update Interval",
    "SettingKey": "update_interval",
    "SettingValue": "2000",
    "SettingType": "Number",
    "Category": "Data",
    "Description": "Live data update interval in milliseconds"
  },
  {
    "Title": "Chart Animation Duration",
    "SettingKey": "chart_animation_duration",
    "SettingValue": "800",
    "SettingType": "Number",
    "Category": "Display",
    "Description": "Chart animation duration in milliseconds"
  },
  {
    "Title": "Max Data Points",
    "SettingKey": "max_data_points",
    "SettingValue": "100",
    "SettingType": "Number",
    "Category": "Performance",
    "Description": "Maximum data points to keep in memory"
  }
]
```

---

## SharePoint List Creation Steps

### Step 1: Create Market_Companies List

1. Go to **Site Contents** → **New** → **List**
2. Name: `Market_Companies`
3. Create the list
4. Add all columns from the schema above
5. Configure column settings:
   - **LastPrice, PreviousClose, ChangePercent:** Number with 2 decimals
   - **Volume:** Number with 0 decimals
   - **PrimaryColor, SecondaryColor:** Single line of text
   - **CompanyLogo:** Image (allow multiple: No)

### Step 2: Create Market_PriceHistory List

1. Go to **Site Contents** → **New** → **List**
2. Name: `Market_PriceHistory`
3. Create the list
4. Add all columns from the schema above
5. Configure column settings:
   - **CompanySymbol:** Lookup to Market_Companies → Title
   - **OpenPrice, HighPrice, LowPrice, ClosePrice:** Number with 2 decimals
   - **Volume, NumberOfTrades:** Number with 0 decimals
   - **Value:** Currency (PNG Kina)

6. Create indexes:
   - **Settings** → **Indexed columns** → **Create new index**
   - Index 1: CompanySymbol
   - Index 2: TradeDate
   - Compound Index: CompanySymbol + TradeDate

### Step 3: Create Market_Settings List

1. Go to **Site Contents** → **New** → **List**
2. Name: `Market_Settings`
3. Create the list
4. Add all columns from the schema above
5. Add default settings (see JSON above)

---

## Sample Data - Market_Companies

```csv
Title,CompanyName,Sector,LastPrice,PreviousClose,ChangePercent,Volume,MarketCap,PrimaryColor,SecondaryColor,IsActive,DisplayOrder
BSP,Bank South Pacific,Financials,28.75,28.20,1.95,10200,K 60.2B,#0066cc,#0099ff,Yes,1
CCP,Credit Corporation PNG,Financials,2.12,2.06,2.91,15000,K 8.5B,#2a9d8f,#40c9b4,Yes,2
CGA,Crater Gold Mining,Mining,0.15,0.15,0.00,0,K 120M,#d97706,#f59e0b,Yes,3
CPL,CPL Group,Industrial,0.68,0.67,1.49,4200,K 3.2B,#7c3aed,#a78bfa,Yes,4
KAM,Kina Asset Management,Asset Management,0.90,0.89,1.12,3200,K 2.1B,#9b5de5,#c77dff,Yes,5
KSL,Kina Securities Limited,Financials,3.20,3.27,-2.14,8500,K 12.3B,#e63946,#ff6b6b,Yes,6
NEM,Newmont Corporation,Mining,44.94,43.01,4.49,25000,K 95.4B,#f59e0b,#fbbf24,Yes,7
NGP,NGIP Agmark,Agriculture,0.42,0.42,-0.95,5600,K 1.8B,#65a30d,#84cc16,Yes,8
NIU,Niuminco Group,Mining,0.02,0.02,0.00,0,K 50M,#78716c,#a8a29e,Yes,9
SST,Steamships Trading,Conglomerate,2.35,2.34,0.43,7800,K 15.6B,#0891b2,#22d3ee,Yes,10
STO,Santos Limited,Energy,6.78,6.64,2.11,12000,K 35.2B,#dc2626,#ef4444,Yes,11
```

---

## Sample Data - Market_PriceHistory (BSP Example)

```csv
Title,CompanySymbol,TradeDate,OpenPrice,HighPrice,LowPrice,ClosePrice,Volume,NumberOfTrades
BSP_2024-12-03,BSP,12/3/2024,28.50,28.85,28.35,28.75,15234,156
BSP_2024-12-02,BSP,12/2/2024,28.10,28.55,28.05,28.20,12456,142
BSP_2024-12-01,BSP,12/1/2024,28.00,28.20,27.85,28.10,10567,128
BSP_2024-11-30,BSP,11/30/2024,27.85,28.10,27.75,28.00,11234,135
```

*Note: Repeat for all companies and extend back 400+ days for full year coverage*

---

## Permissions Setup

### Market_Companies
- **Read:** All authenticated users
- **Edit:** Market Data Admins
- **Contribute:** Market Data Contributors

### Market_PriceHistory
- **Read:** All authenticated users
- **Edit:** Data Import Service Account
- **Contribute:** Market Data Contributors

### Market_Settings
- **Read:** All authenticated users
- **Edit:** System Administrators only

---

## API Endpoints Structure

### Get Companies
```
GET /_api/web/lists/getbytitle('Market_Companies')/items
?$select=Title,CompanyName,Sector,LastPrice,PreviousClose,ChangePercent,Volume,MarketCap,CompanyLogo,PrimaryColor,SecondaryColor,IsActive
&$filter=IsActive eq 1
&$orderby=DisplayOrder
```

### Get Price History (Last N days)
```
GET /_api/web/lists/getbytitle('Market_PriceHistory')/items
?$select=CompanySymbol/Title,TradeDate,OpenPrice,HighPrice,LowPrice,ClosePrice,Volume
&$expand=CompanySymbol
&$filter=CompanySymbol/Title eq 'BSP' and TradeDate ge datetime'2024-11-01T00:00:00Z'
&$orderby=TradeDate asc
```

### Get Settings
```
GET /_api/web/lists/getbytitle('Market_Settings')/items
?$select=SettingKey,SettingValue,SettingType
&$filter=IsActive eq 1
```

---

## Data Import Considerations

### Automated Data Import
- Use Power Automate or Azure Function to fetch daily price data
- Schedule: After market close (e.g., 5:00 PM PGT)
- Source: PNG Stock Exchange API or data feed
- Update both **Market_Companies** (latest prices) and **Market_PriceHistory** (daily OHLCV)

### Manual Import
- Create Power Apps form for manual data entry
- CSV import template for bulk historical data upload
- Data validation rules to ensure OHLC integrity

### Data Retention
- Keep at least 400 days of historical data
- Archive older data to separate list/database
- Set up scheduled cleanup job for data older than 2 years

---

## Company Logo Guidelines

### Logo Specifications
- **Format:** PNG with transparent background (preferred) or JPG
- **Size:** 200x200px to 400x400px (square aspect ratio)
- **File Size:** Max 200KB per image
- **Naming:** Use company symbol (e.g., `BSP.png`)

### Logo Fallback Behavior
- If **CompanyLogo** is empty → Display colored square with company symbol (current behavior)
- If **CompanyLogo** has value → Display logo image with subtle border/shadow

### Logo Storage Options
1. **SharePoint Image Column** (Recommended for small number of companies)
2. **Separate Document Library** with lookup
3. **Azure Blob Storage** with URL reference

---

## Implementation Checklist

- [ ] Create Market_Companies list
- [ ] Create Market_PriceHistory list
- [ ] Create Market_Settings list
- [ ] Add all required columns with correct types
- [ ] Set up indexes on Market_PriceHistory
- [ ] Configure permissions
- [ ] Import initial company data
- [ ] Import historical price data (400+ days)
- [ ] Add default settings
- [ ] Upload company logos (optional)
- [ ] Test API endpoints
- [ ] Create SharePoint service file
- [ ] Update frontend to use SharePoint data
- [ ] Test all time range filters
- [ ] Test live updates
- [ ] Verify color customization

---

## Next Steps

1. **Create TypeScript Service File** - Build `marketDataSharePointService.ts`
2. **Create React Hook** - Build `useMarketData.ts` hook
3. **Update MarketData.tsx** - Replace mock data with SharePoint data
4. **Add Loading States** - Implement proper loading/error handling
5. **Test Integration** - Verify all features work with real data

---

*Last Updated: December 3, 2024*

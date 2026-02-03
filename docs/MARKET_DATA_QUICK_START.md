# Market Data Quick Start Checklist

Step-by-step guide to get the Market Data dashboard running with SharePoint.

---

## Prerequisites

- [ ] SharePoint Online access
- [ ] Site collection with list creation permissions
- [ ] MSAL configured for authentication
- [ ] Access to company logos (optional)

---

## Phase 1: SharePoint Setup (30-45 minutes)

### 1. Create Market_Companies List

1. Go to your SharePoint site
2. Click **Site Contents** → **New** → **List**
3. Name: `Market_Companies`
4. Click **Create**

5. Add columns (Settings → List Settings → Create Column):

| Column | Type | Settings |
|--------|------|----------|
| CompanyName | Single line of text | Required |
| Sector | Choice | Options: Financials, Mining, Energy, Industrial, Agriculture, Asset Management, Conglomerate, Other |
| LastPrice | Number | 2 decimals, Required |
| PreviousClose | Number | 2 decimals, Required |
| ChangePercent | Number | 2 decimals, Required |
| Volume | Number | 0 decimals, Required |
| MarketCap | Single line of text | Required |
| CompanyLogo | Image | Optional |
| PrimaryColor | Single line of text | Required, Default: #0066cc |
| SecondaryColor | Single line of text | Required, Default: #0099ff |
| IsActive | Yes/No | Required, Default: Yes |
| DisplayOrder | Number | 0 decimals |
| Website | Hyperlink | Optional |
| Description | Multiple lines of text | Optional, Plain text |

### 2. Create Market_PriceHistory List

1. **Site Contents** → **New** → **List**
2. Name: `Market_PriceHistory`
3. Click **Create**

4. Add columns:

| Column | Type | Settings |
|--------|------|----------|
| CompanySymbol | Lookup | Get from: Market_Companies, Column: Title, Required |
| TradeDate | Date and Time | Include time, Required |
| OpenPrice | Number | 2 decimals, Required |
| HighPrice | Number | 2 decimals, Required |
| LowPrice | Number | 2 decimals, Required |
| ClosePrice | Number | 2 decimals, Required |
| Volume | Number | 0 decimals, Required |
| NumberOfTrades | Number | 0 decimals |
| Value | Currency | PNG Kina |

5. Create indexes (Settings → Indexed Columns):
   - Create index on: **CompanySymbol**
   - Create index on: **TradeDate**
   - Create compound index on: **CompanySymbol** + **TradeDate**

### 3. Create Market_Settings List

1. **Site Contents** → **New** → **List**
2. Name: `Market_Settings`
3. Click **Create**

4. Add columns:

| Column | Type | Settings |
|--------|------|----------|
| SettingKey | Single line of text | Required, Unique |
| SettingValue | Multiple lines of text | Required, Plain text |
| SettingType | Choice | Options: String, Number, Boolean, JSON, Color |
| Category | Choice | Options: General, Display, Data, Colors, Performance |
| Description | Multiple lines of text | Plain text |
| IsActive | Yes/No | Required, Default: Yes |

---

## Phase 2: Import Sample Data (15-20 minutes)

### Import Companies

Copy this to Excel and import to Market_Companies:

```
Title,CompanyName,Sector,LastPrice,PreviousClose,ChangePercent,Volume,MarketCap,PrimaryColor,SecondaryColor,IsActive,DisplayOrder
BSP,Bank South Pacific,Financials,28.75,28.20,1.95,10200,K 60.2B,#0066cc,#0099ff,Yes,1
CCP,Credit Corporation PNG,Financials,2.12,2.06,2.91,15000,K 8.5B,#2a9d8f,#40c9b4,Yes,2
CGA,Crater Gold Mining,Mining,0.15,0.15,0.00,0,K 120M,#d97706,#f59e0b,Yes,3
CPL,CPL Group,Industrial,0.68,0.67,1.49,4200,K 3.2B,#7c3aed,#a78bfa,Yes,4
KAM,Kina Asset Management,Asset Management,0.90,0.89,1.12,3200,K 2.1B,#9b5de5,#c77dff,Yes,5
KSL,Kina Securities Limited,Financials,3.20,3.27,-2.14,8500,K 12.3B,#e63946,#ff6b6b,Yes,6
NEM,Newmont Corporation,Mining,44.94,43.01,4.49,25000,K 95.4B,#f59e0b,#fbbf24,Yes,7
```

**Steps:**
1. Copy data above
2. Paste into Excel
3. Save as CSV
4. In SharePoint list → **Integrate** → **Excel** → **Import**
5. Map columns correctly
6. Import

### Import Settings

Manually add these items to Market_Settings:

1. **Default Time Range**
   - SettingKey: `default_time_range`
   - SettingValue: `2M`
   - SettingType: String
   - Category: General
   - IsActive: Yes

2. **Live Updates Enabled**
   - SettingKey: `live_updates_enabled`
   - SettingValue: `true`
   - SettingType: Boolean
   - Category: General
   - IsActive: Yes

3. **Auto Cycle Enabled**
   - SettingKey: `auto_cycle_enabled`
   - SettingValue: `false`
   - SettingType: Boolean
   - Category: General
   - IsActive: Yes

4. **Cycle Interval**
   - SettingKey: `cycle_interval`
   - SettingValue: `5000`
   - SettingType: Number
   - Category: General
   - IsActive: Yes

5. **Update Interval**
   - SettingKey: `update_interval`
   - SettingValue: `2000`
   - SettingType: Number
   - Category: Data
   - IsActive: Yes

6. **Max Data Points**
   - SettingKey: `max_data_points`
   - SettingValue: `100`
   - SettingType: Number
   - Category: Performance
   - IsActive: Yes

### Import Price History (Use Script)

Due to volume (400 days × 7 companies = 2,800 records), use PowerShell or Power Automate to generate historical data.

**Option 1: Quick Test Data (Manual)**
Add 5-10 recent records per company manually to test the integration.

**Option 2: Automated Import (Recommended)**
Use the data generation script (see `MARKET_DATA_SHAREPOINT_SETUP.md` for details).

---

## Phase 3: Code Integration (10-15 minutes)

### 1. Update Environment Variables

Add to `.env`:
```env
VITE_SHAREPOINT_SITE_URL=https://yourtenant.sharepoint.com/sites/yoursite
VITE_USE_SHAREPOINT=true
```

### 2. Test Service Connection

Create a test file `src/test-market-data.ts`:

```typescript
import { getCompanies } from './services/marketDataSharePointService';

async function test() {
  try {
    const companies = await getCompanies();
    console.log('✓ Companies fetched:', companies.length);
    console.log('First company:', companies[0]);
  } catch (error) {
    console.error('✗ Error:', error);
  }
}

test();
```

Run: `npm run dev` and check console for results.

### 3. Update MarketData.tsx (Optional - Keep Mock for Now)

For initial testing, keep mock data and add SharePoint as feature flag:

```typescript
const USE_SHAREPOINT = import.meta.env.VITE_USE_SHAREPOINT === 'true';

// At top of component
const {
    companies: spCompanies,
    settings: spSettings,
    isLoading,
    error
} = USE_SHAREPOINT ? useMarketData() : {
    companies: [],
    settings: null,
    isLoading: false,
    error: null
};

const companies = USE_SHAREPOINT ? spCompanies : initializeCompanies();
```

---

## Phase 4: Testing (15-20 minutes)

### Test Checklist

- [ ] Navigate to `/market-data`
- [ ] Page loads without errors
- [ ] Companies display (either mock or SharePoint)
- [ ] Charts render correctly
- [ ] Time range filters work
  - [ ] 1 Day
  - [ ] 1 Week
  - [ ] 1 Month
  - [ ] 6 Months
  - [ ] 1 Year
  - [ ] Custom range
- [ ] Settings dialog opens
- [ ] Color picker works
- [ ] Live updates toggle works
- [ ] Auto-cycle toggle works
- [ ] Search filter works
- [ ] Company selection works
- [ ] Export CSV works
- [ ] Fullscreen mode works

### SharePoint Data Testing (if enabled)

- [ ] Companies load from SharePoint
- [ ] Price history displays
- [ ] Settings apply from SharePoint
- [ ] Color changes save to SharePoint
- [ ] No console errors
- [ ] Loading states show correctly
- [ ] Error states handle gracefully

---

## Phase 5: Production Deployment (10 minutes)

### 1. Final Checks

- [ ] All SharePoint lists populated
- [ ] Permissions configured
- [ ] Environment variables set
- [ ] Feature flag set to use SharePoint
- [ ] All tests passing

### 2. Build

```bash
npm run build
```

### 3. Deploy

Deploy `dist/` folder to your hosting platform.

### 4. Post-Deployment

- [ ] Test in production
- [ ] Monitor for errors
- [ ] Verify data loads
- [ ] Check performance

---

## Troubleshooting

### Companies Not Loading

**Check:**
1. SharePoint list name is exactly `Market_Companies`
2. IsActive field is set to Yes
3. User has Read permissions
4. VITE_SHAREPOINT_SITE_URL is correct

**Test:**
```typescript
console.log('Site URL:', import.meta.env.VITE_SHAREPOINT_SITE_URL);
```

### Price History Empty

**Check:**
1. Market_PriceHistory list has data
2. CompanySymbol lookup is correct
3. TradeDate is within last 400 days
4. Indexes are created

**Test:**
```typescript
const history = await getPriceHistory('BSP', 30);
console.log('History length:', history.length);
```

### Settings Not Applying

**Check:**
1. Market_Settings list exists
2. SettingKey values match exactly
3. IsActive is Yes
4. SettingValue format is correct

**Test:**
```typescript
const settings = await getMarketSettings();
console.log('Settings:', settings);
```

### Authentication Errors

**Check:**
1. MSAL is configured
2. User is signed in
3. SharePoint permissions
4. Token not expired

**Test:**
```typescript
const accounts = msalInstance.getAllAccounts();
console.log('Accounts:', accounts);
```

---

## Optional Enhancements

### Add Company Logos

1. Prepare logos (200x200px PNG)
2. In Market_Companies list, edit each company
3. Upload logo to CompanyLogo field
4. Save

### Populate More Historical Data

Use Power Automate or script to:
1. Generate realistic OHLCV data
2. Insert into Market_PriceHistory
3. Ensure 400+ days coverage

### Customize Colors

1. Open Market Data page
2. Click Settings
3. Scroll to Company Colors
4. Pick new colors
5. Changes save to SharePoint

---

## Success Criteria

✅ **Basic Setup Complete When:**
- All 3 SharePoint lists created
- Sample companies imported
- Settings configured
- Page loads without errors

✅ **Integration Complete When:**
- Data loads from SharePoint
- Charts display correctly
- Time filters work
- Settings apply

✅ **Production Ready When:**
- All features tested
- Performance acceptable
- Error handling works
- Users can access

---

## Next Steps

After completing this quick start:

1. **Review** [MARKET_DATA_ARCHITECTURE.md](./MARKET_DATA_ARCHITECTURE.md) - Understand system design
2. **Read** [MARKET_DATA_INTEGRATION_GUIDE.md](./MARKET_DATA_INTEGRATION_GUIDE.md) - Deep dive into integration
3. **Reference** [MARKET_DATA_SHAREPOINT_SETUP.md](./MARKET_DATA_SHAREPOINT_SETUP.md) - Complete schema details
4. **Implement** real-time data import from PNG Stock Exchange
5. **Add** advanced features (alerts, analytics, export)

---

## Support

If you encounter issues:

1. Check console for errors
2. Verify SharePoint list schemas
3. Test API endpoints directly
4. Review documentation
5. Check permissions

---

**Estimated Total Time: 1.5 - 2 hours**

*Last Updated: December 3, 2024*

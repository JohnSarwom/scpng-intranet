# Market Data SharePoint Integration Guide

This guide explains how to integrate the Market Data dashboard with SharePoint backend.

---

## Overview

The Market Data system consists of:
1. **SharePoint Lists** - Data storage (companies, price history, settings)
2. **Service Layer** - `marketDataSharePointService.ts` - API communication
3. **React Hook** - `useMarketData.ts` - Data management and state
4. **UI Component** - `MarketData.tsx` - Dashboard display

---

## Files Created

### 1. SharePoint Setup Documentation
**File:** `docs/MARKET_DATA_SHAREPOINT_SETUP.md`

Contains:
- Complete SharePoint list schemas
- Column definitions and types
- Sample data
- API endpoint examples
- Permissions setup

### 2. SharePoint Service
**File:** `src/services/marketDataSharePointService.ts`

Functions:
- `getCompanies()` - Fetch all active companies
- `getPriceHistory(symbol, days)` - Fetch price history for one company
- `getAllPriceHistory(days)` - Fetch price history for all companies
- `getMarketSettings()` - Fetch dashboard settings
- `updateCompanyColors(symbol, primary, secondary)` - Update company colors
- `getLatestPrice(symbol)` - Get most recent trade

### 3. React Hook
**File:** `src/hooks/useMarketData.ts`

Exports:
- `useMarketData()` - Main hook for fetching market data
- `useLiveMarketUpdates()` - Simulates live price updates

---

## Integration Steps

### Step 1: Set Up SharePoint Lists

Follow the instructions in `MARKET_DATA_SHAREPOINT_SETUP.md`:

1. Create **Market_Companies** list
2. Create **Market_PriceHistory** list
3. Create **Market_Settings** list
4. Import sample data or real data

### Step 2: Update Environment Variables

Add to your `.env` file:

```env
VITE_SHAREPOINT_SITE_URL=https://yourtenant.sharepoint.com/sites/yoursite
```

### Step 3: Update MarketData.tsx

Replace the mock data initialization with SharePoint data:

**Current (Mock Data):**
```typescript
const [companies, setCompanies] = useState<Company[]>(() => initializeCompanies());
```

**Updated (SharePoint Data):**
```typescript
import { useMarketData, useLiveMarketUpdates } from '@/hooks/useMarketData';

const MarketData = () => {
    // Fetch data from SharePoint
    const {
        companies: spCompanies,
        settings: spSettings,
        isLoading: dataLoading,
        error: dataError,
        refetch,
        updateCompanyColors: updateColorsInSharePoint
    } = useMarketData();

    // Settings State - Initialize from SharePoint
    const [isLiveUpdates, setIsLiveUpdates] = useState(spSettings?.liveUpdatesEnabled ?? true);
    const [isAutoCycle, setIsAutoCycle] = useState(spSettings?.autoCycleEnabled ?? false);
    const [cycleInterval, setCycleInterval] = useState(spSettings?.cycleInterval ?? 5000);
    const [timeRange, setTimeRange] = useState<TimeRange>(spSettings?.defaultTimeRange as TimeRange ?? '2M');

    // Apply live updates simulation
    const companies = useLiveMarketUpdates(
        spCompanies,
        isLiveUpdates,
        spSettings?.updateInterval ?? 2000
    );

    // ... rest of component
};
```

### Step 4: Update Color Management

Replace local color update function:

**Current:**
```typescript
const updateCompanyColor = (symbol: string, type: 'primary' | 'secondary', color: string) => {
    setCompanies(prev => prev.map(c => {
        // ... local state update
    }));
};
```

**Updated:**
```typescript
const updateCompanyColor = async (symbol: string, type: 'primary' | 'secondary', color: string) => {
    try {
        const company = companies.find(c => c.symbol === symbol);
        if (!company) return;

        const primary = type === 'primary' ? color : company.colors.primary;
        const secondary = type === 'secondary' ? color : company.colors.secondary;

        await updateColorsInSharePoint(symbol, primary, secondary);
    } catch (error) {
        console.error('Failed to update colors:', error);
        // Show error toast/notification
    }
};
```

### Step 5: Add Loading States

Add loading and error handling to the UI:

```typescript
if (dataLoading) {
    return (
        <PageLayout>
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading market data...</p>
                </div>
            </div>
        </PageLayout>
    );
}

if (dataError) {
    return (
        <PageLayout>
            <div className="flex items-center justify-center h-screen">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Failed to Load Market Data</h2>
                    <p className="text-muted-foreground mb-4">{dataError}</p>
                    <Button onClick={refetch}>Try Again</Button>
                </div>
            </div>
        </PageLayout>
    );
}
```

### Step 6: Handle Company Logos

Update the company logo display logic:

```typescript
{/* Company Logo with Fallback */}
<div className="flex items-center gap-4">
    {selectedCompany.logo ? (
        <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-border shadow-lg">
            <img
                src={selectedCompany.logo}
                alt={selectedCompany.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                    // Fallback to colored square if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
            />
            <div
                className="hidden w-16 h-16 rounded-xl flex items-center justify-center font-bold text-lg text-primary-foreground"
                style={{
                    background: `linear-gradient(135deg, ${selectedCompany.colors.primary}, ${selectedCompany.colors.secondary})`,
                }}
            >
                {selectedCompany.symbol}
            </div>
        </div>
    ) : (
        <div
            className="company-logo"
            style={{
                background: `linear-gradient(135deg, ${selectedCompany.colors.primary}, ${selectedCompany.colors.secondary})`,
                boxShadow: `0 0 40px ${selectedCompany.colors.glow}`
            }}
        >
            {selectedCompany.symbol}
        </div>
    )}
    {/* ... rest of header */}
</div>
```

---

## Logo Implementation Details

### Option 1: SharePoint Image Column (Recommended)

**Pros:**
- Easy to manage through SharePoint UI
- No additional storage needed
- Integrated with permissions

**Cons:**
- Limited to smaller images
- Slower for many images

**Setup:**
1. In Market_Companies list, add Image column named "CompanyLogo"
2. Upload images directly in SharePoint list
3. Images are automatically served with authentication

### Option 2: Document Library

**Pros:**
- Better for larger images
- Can organize in folders
- Version history

**Cons:**
- Need lookup column
- More complex setup

**Setup:**
1. Create Document Library: `Market_CompanyLogos`
2. Upload logos with naming: `{Symbol}.png` (e.g., `BSP.png`)
3. Add Lookup column in Market_Companies pointing to file name
4. Update service to construct URL from lookup

### Option 3: Azure Blob Storage

**Pros:**
- Best performance
- CDN support
- Unlimited size

**Cons:**
- Additional cost
- External dependency
- Need to manage separately

**Setup:**
1. Create Azure Storage Account
2. Create container: `company-logos`
3. Upload logos
4. Store URLs in CompanyLogo column as text

---

## Company Logo Guidelines for Users

### Image Requirements
- **Format:** PNG (transparent background) or JPG
- **Dimensions:** 200x200px to 400x400px (square)
- **File Size:** Maximum 200KB
- **Naming:** Company symbol (e.g., `BSP.png`)

### Logo Fallback Behavior
1. If logo URL exists and loads → Display logo image
2. If logo URL exists but fails to load → Show colored square with symbol
3. If no logo URL → Show colored square with symbol

### Uploading Logos (SharePoint UI)
1. Go to Market_Companies list
2. Click on a company item
3. Click "Edit"
4. Upload image to "CompanyLogo" field
5. Save

---

## Data Refresh Strategy

### Initial Load
- Fetch all companies
- Fetch 400 days of price history for all companies
- Fetch dashboard settings

### Live Updates
- Use `useLiveMarketUpdates` hook
- Simulates price changes every 2 seconds (configurable)
- Keeps last 100 data points in memory

### Manual Refresh
- User clicks refresh button
- Calls `refetch()` from hook
- Re-fetches all data from SharePoint

### Automatic Refresh (Future Enhancement)
```typescript
// Refresh every 5 minutes
useEffect(() => {
    const interval = setInterval(() => {
        refetch();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
}, [refetch]);
```

---

## Performance Optimization

### 1. Data Caching
The hook caches data in component state. Only refetches when:
- Component mounts
- User manually refreshes
- Error occurs

### 2. Parallel Requests
All initial data fetches happen in parallel:
```typescript
const [companiesData, historyMap, settingsData] = await Promise.all([
    getCompanies(),
    getAllPriceHistory(400),
    getMarketSettings(),
]);
```

### 3. Indexed Queries
SharePoint lists use compound indexes:
- CompanySymbol + TradeDate
- Faster filtering and sorting

### 4. Limited History
- Keep 400 days in SharePoint
- Keep last 100 points in memory during live updates
- Older data archived separately

---

## Testing Checklist

### SharePoint Setup
- [ ] All three lists created
- [ ] All columns added with correct types
- [ ] Indexes created on Market_PriceHistory
- [ ] Permissions configured
- [ ] Sample data imported

### Service Layer
- [ ] Companies fetch successfully
- [ ] Price history fetches for single company
- [ ] Price history fetches for all companies
- [ ] Settings fetch with defaults
- [ ] Color updates work
- [ ] Error handling works

### React Hook
- [ ] Initial data loads
- [ ] Loading states display correctly
- [ ] Error states display correctly
- [ ] Live updates work when enabled
- [ ] Color updates reflect in UI
- [ ] Refetch works

### UI Integration
- [ ] Companies display from SharePoint
- [ ] Price history charts render
- [ ] Time range filters work with real data
- [ ] Settings from SharePoint apply
- [ ] Company logos display (if uploaded)
- [ ] Fallback works when logo missing
- [ ] Color customization saves to SharePoint

---

## Troubleshooting

### Issue: "No companies found"
**Solution:**
- Check IsActive field is set to Yes/True
- Verify list name is exactly "Market_Companies"
- Check SharePoint permissions

### Issue: "Price history empty"
**Solution:**
- Verify Market_PriceHistory has data
- Check CompanySymbol lookup is correct
- Verify date filters (need data within 400 days)

### Issue: "Settings not loading"
**Solution:**
- Check Market_Settings list exists
- Verify SettingKey values match expected keys
- Check IsActive field is Yes/True
- Hook returns defaults if settings fail

### Issue: "Company logos not displaying"
**Solution:**
- Check image URL is valid
- Verify image column name is "CompanyLogo"
- Test image URL directly in browser
- Check image permissions

### Issue: "Authentication errors"
**Solution:**
- Verify MSAL configuration
- Check SharePoint site URL in .env
- Ensure user has permissions
- Try re-authenticating

---

## Migration Plan: Mock to SharePoint

### Phase 1: Parallel Running (Recommended)
1. Keep mock data as fallback
2. Add feature flag to switch between mock/SharePoint
3. Test with SharePoint data
4. Fix issues
5. Remove mock data

```typescript
const USE_SHAREPOINT = import.meta.env.VITE_USE_SHAREPOINT === 'true';

const companies = USE_SHAREPOINT
    ? spCompanies
    : initializeCompanies();
```

### Phase 2: Direct Replacement
1. Remove mock data generation functions
2. Replace with SharePoint hooks
3. Test thoroughly
4. Deploy

---

## Future Enhancements

### 1. Real-time Updates via SignalR
- Push price updates from server
- No polling needed
- True real-time experience

### 2. Historical Data Export
- Export to Excel
- Custom date ranges
- Multiple companies

### 3. Alerts & Notifications
- Price alerts
- Volume alerts
- Custom conditions

### 4. Advanced Analytics
- Technical indicators
- Moving averages
- Trend analysis

### 5. User Preferences
- Per-user settings
- Saved views
- Custom watchlists

---

*Last Updated: December 3, 2024*

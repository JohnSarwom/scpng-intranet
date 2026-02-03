# Market Data System Architecture

Visual overview of the Market Data system components and data flow.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE                          │
│                        MarketData.tsx                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  • Main Chart (Price History)                            │   │
│  │  • Comparison Chart (Performance)                        │   │
│  │  • Market Table (All Companies)                          │   │
│  │  • Settings Dialog (Time Range, Colors, Preferences)    │   │
│  │  • Live Price Display                                    │   │
│  │  • Market Heatmap                                        │   │
│  │  • Volume Bars                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                        REACT HOOKS LAYER                         │
│                     useMarketData.ts                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  useMarketData()                                         │   │
│  │  • Fetch companies with history                         │   │
│  │  • Fetch settings                                       │   │
│  │  • Update company colors                                │   │
│  │  • Error handling                                       │   │
│  │  • Loading states                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  useLiveMarketUpdates()                                  │   │
│  │  • Simulate price changes                               │   │
│  │  • Add new data points                                  │   │
│  │  • Manage memory (100 points max)                       │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                               │
│              marketDataSharePointService.ts                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  API Functions:                                          │   │
│  │  • getCompanies()                                        │   │
│  │  • getPriceHistory(symbol, days)                        │   │
│  │  • getAllPriceHistory(days)                             │   │
│  │  • getMarketSettings()                                  │   │
│  │  • updateCompanyColors(symbol, colors)                  │   │
│  │  • getLatestPrice(symbol)                               │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Utilities:                                              │   │
│  │  • Authentication (MSAL)                                 │   │
│  │  • Data transformation                                   │   │
│  │  • Error handling                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                    SHAREPOINT REST API                           │
│                   /_api/web/lists/...                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  • OAuth 2.0 Authentication                              │   │
│  │  • OData v3 Protocol                                     │   │
│  │  • JSON Response Format                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      SHAREPOINT LISTS                            │
│  ┌──────────────┐  ┌──────────────────┐  ┌─────────────────┐   │
│  │   Market_    │  │    Market_       │  │    Market_      │   │
│  │  Companies   │  │  PriceHistory    │  │   Settings      │   │
│  │              │  │                  │  │                 │   │
│  │ • Symbol     │  │ • Symbol         │  │ • SettingKey    │   │
│  │ • Name       │  │ • Date           │  │ • SettingValue  │   │
│  │ • Sector     │  │ • Open           │  │ • Type          │   │
│  │ • Price      │  │ • High           │  │ • Category      │   │
│  │ • Volume     │  │ • Low            │  │                 │   │
│  │ • Colors     │  │ • Close          │  │                 │   │
│  │ • Logo       │  │ • Volume         │  │                 │   │
│  └──────────────┘  └──────────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### Initial Page Load

```
1. User navigates to /market-data
         ↓
2. MarketData component mounts
         ↓
3. useMarketData() hook executes
         ↓
4. Three parallel API calls:
   ├─→ getCompanies()
   ├─→ getAllPriceHistory(400)
   └─→ getMarketSettings()
         ↓
5. Each function:
   ├─→ Get access token (MSAL)
   ├─→ Call SharePoint REST API
   ├─→ Parse OData response
   └─→ Transform data to app format
         ↓
6. Hook merges companies + history
         ↓
7. Component receives data via hook
         ↓
8. UI renders with SharePoint data
         ↓
9. useLiveMarketUpdates() starts (if enabled)
         ↓
10. Chart.js renders visualizations
```

### Live Updates Flow

```
Every 2 seconds (configurable):
         ↓
1. useLiveMarketUpdates timer fires
         ↓
2. For each company:
   ├─→ Calculate random price movement
   ├─→ Create new PricePoint
   ├─→ Add to history array
   └─→ Remove oldest if > 100 points
         ↓
3. State updates trigger re-render
         ↓
4. Charts update with new data
```

### User Changes Company Color

```
1. User picks new color in Settings
         ↓
2. updateCompanyColor() called
         ↓
3. Calls updateColorsInSharePoint()
         ↓
4. Hook calls service function
         ↓
5. Service:
   ├─→ Get access token
   ├─→ Find item ID
   ├─→ MERGE request to SharePoint
   └─→ Wait for response
         ↓
6. On success, update local state
         ↓
7. UI reflects new colors immediately
         ↓
8. SharePoint has persistent change
```

### User Changes Time Range

```
1. User selects "1 Week" in Settings
         ↓
2. setTimeRange('1W') updates state
         ↓
3. getFilteredHistory() recalculates
         ↓
4. Filter: last 7 days of data
         ↓
5. Charts re-render with filtered data
         ↓
6. Volume bars update
         ↓
7. X-axis labels adjust
```

---

## Component Structure

```
MarketData.tsx
│
├─ State Management
│  ├─ companies (from useMarketData)
│  ├─ settings (from useMarketData)
│  ├─ selectedSymbol
│  ├─ timeRange
│  ├─ customStartDate / customEndDate
│  ├─ isLiveUpdates
│  ├─ isAutoCycle
│  └─ isFullscreen
│
├─ Computed Values
│  ├─ selectedCompany
│  ├─ filteredHistory (based on timeRange)
│  ├─ topGainer
│  └─ totalVolume
│
├─ Chart Instances (refs)
│  ├─ mainChartInstance
│  └─ compareChartInstance
│
├─ Effects
│  ├─ Initialize charts
│  ├─ Update chart data on changes
│  ├─ Live updates simulation
│  ├─ Auto-cycle companies
│  ├─ Clock update
│  └─ Theme change listener
│
└─ UI Sections
   ├─ Header (Logo, Status, Search, Settings)
   ├─ KPI Cards (Market Cap, Volume, Trades, Top Gainer)
   ├─ Ticker Strip (Company buttons)
   ├─ Main Content
   │  ├─ Main Chart Card
   │  │  ├─ Company Header
   │  │  ├─ Price Chart (Chart.js)
   │  │  └─ Volume Bars
   │  └─ Market Table
   └─ Sidebar
      ├─ Live Price Card
      ├─ Market Heatmap
      └─ News Feed
```

---

## Data Models

### Company (Frontend)

```typescript
{
  symbol: string;          // "BSP"
  name: string;            // "Bank South Pacific"
  sector: string;          // "Financials"
  last: number;            // 28.75
  change: number;          // 1.95 (percentage)
  vol: number;             // 10200
  mcap: string;            // "K 60.2B"
  logo?: string;           // URL or undefined
  colors: {
    primary: string;       // "#0066cc"
    secondary: string;     // "#0099ff"
    glow: string;          // "rgba(0, 102, 204, 0.3)"
  };
  website?: string;        // URL
  description?: string;    // Text
  history: PricePoint[];   // Array of historical data
}
```

### PricePoint (Frontend)

```typescript
{
  time: number;      // Unix timestamp (milliseconds)
  open: number;      // Opening price
  high: number;      // Highest price
  low: number;       // Lowest price
  close: number;     // Closing price
  volume: number;    // Trading volume
}
```

### SPCompany (SharePoint)

```typescript
{
  Id: number;
  Title: string;                    // Symbol
  CompanyName: string;
  Sector: string;
  LastPrice: number;
  PreviousClose: number;
  ChangePercent: number;
  Volume: number;
  MarketCap: string;
  CompanyLogo?: {
    Url: string;
    Description: string;
  };
  PrimaryColor: string;
  SecondaryColor: string;
  IsActive: boolean;
  DisplayOrder?: number;
  Website?: { Url: string; };
  Description?: string;
}
```

### SPPriceHistory (SharePoint)

```typescript
{
  Id: number;
  Title: string;              // Auto-generated
  CompanySymbol: string;      // Lookup
  TradeDate: string;          // ISO date
  OpenPrice: number;
  HighPrice: number;
  LowPrice: number;
  ClosePrice: number;
  Volume: number;
  NumberOfTrades?: number;
  Value?: number;
}
```

---

## Settings Configuration

### Time Range Options

| Value | Label | Days | Use Case |
|-------|-------|------|----------|
| 1D | 1 Day | 1 | Intraday trading |
| 3D | 3 Days | 3 | Short-term trends |
| 1W | 1 Week | 7 | Weekly analysis |
| 2W | 2 Weeks | 14 | Bi-weekly review |
| 1M | 1 Month | 30 | Monthly performance |
| 2M | 2 Months | 60 | Quarterly trends (default) |
| 6M | 6 Months | 180 | Half-year analysis |
| 1Y | 1 Year | 365 | Annual performance |
| CUSTOM | Custom Range | 0 | User-defined dates |

### Default Settings (from SharePoint)

```typescript
{
  defaultTimeRange: '2M',
  liveUpdatesEnabled: true,
  autoCycleEnabled: false,
  cycleInterval: 5000,
  updateInterval: 2000,
  chartAnimationDuration: 800,
  maxDataPoints: 100
}
```

---

## Performance Metrics

### Initial Load
- **Companies Fetch:** ~500ms
- **Price History (All):** ~1-2s (depends on data volume)
- **Settings Fetch:** ~200ms
- **Total Initial Load:** ~2-3s

### Live Updates
- **Frequency:** Every 2 seconds
- **Overhead:** ~5-10ms per update
- **Memory:** ~50-100KB per company (100 data points)

### Chart Rendering
- **Initial Render:** ~300-500ms
- **Update:** ~50-100ms (with animation)
- **Instant Update:** ~10-20ms (no animation)

---

## Security Considerations

### Authentication
- **MSAL (Microsoft Authentication Library)** for OAuth 2.0
- Token-based authentication
- Silent token refresh
- Popup fallback for expired tokens

### Permissions
- **Read:** All authenticated users
- **Edit Companies:** Market Data Admins only
- **Edit History:** Data Import Service Account
- **Edit Settings:** System Administrators only

### Data Validation
- Input sanitization
- Type checking
- Range validation for prices
- Date validation

---

## Error Handling Strategy

### Network Errors
```typescript
try {
  const data = await fetchData();
} catch (error) {
  // Show user-friendly error
  // Log to console for debugging
  // Provide retry option
}
```

### Data Errors
- Missing companies → Show empty state
- No price history → Show "No data available"
- Invalid dates → Fall back to default range
- Missing settings → Use hardcoded defaults

### UI Errors
- Chart fails to render → Show fallback message
- Image fails to load → Show colored square
- API timeout → Show retry button

---

## Monitoring & Logging

### Client-Side
- Console errors for debugging
- Performance timing
- User actions tracking

### Server-Side (Future)
- API call success/failure rates
- Response times
- Error patterns
- Usage analytics

---

*Last Updated: December 3, 2024*

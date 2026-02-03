# Market News Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│                     (Market Data Page)                           │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Market News Sidebar                                      │  │
│  │  - Loading spinner                                        │  │
│  │  - Error messages                                         │  │
│  │  - News list with badges                                 │  │
│  │  - Refresh button                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      REACT HOOKS LAYER                           │
│                   (src/hooks/useMarketNews.ts)                   │
│                                                                   │
│  useMarketNews()          - Fetch all news                       │
│  useCompanyNews(symbol)   - Filter by company                    │
│  useHighPriorityNews()    - High priority only                   │
│                                                                   │
│  Returns: { news, isLoading, error, refetch }                   │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                     SERVICE LAYER                                │
│            (src/services/marketNewsSharePointService.ts)         │
│                                                                   │
│  MarketNewsSharePointService                                     │
│  ├─ initialize()           - Get site & list IDs                │
│  ├─ getAllNews()           - Fetch active news                  │
│  ├─ getNewsByCategory()    - Filter by category                 │
│  ├─ getNewsByCompany()     - Filter by company                  │
│  ├─ getHighPriorityNews()  - High priority filter               │
│  ├─ createNewsItem()       - Add news                           │
│  ├─ updateNewsItem()       - Edit news                          │
│  └─ deleteNewsItem()       - Soft delete                        │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                   MICROSOFT GRAPH API                            │
│                  (Microsoft Graph Client)                        │
│                                                                   │
│  - OAuth Authentication                                          │
│  - Sites.Read.All permission                                     │
│  - RESTful API calls                                             │
│  - JSON responses                                                │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      SHAREPOINT ONLINE                           │
│             (scpng1.sharepoint.com/sites/scpngintranet)          │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  MarketNews List                                          │  │
│  │  ├─ Title                 (News headline)                │  │
│  │  ├─ PublishDate           (When published)               │  │
│  │  ├─ Category              (News type)                    │  │
│  │  ├─ RelatedCompany        (Tagged companies)             │  │
│  │  ├─ Priority              (High/Normal/Low)              │  │
│  │  ├─ IsActive              (Visibility toggle)            │  │
│  │  ├─ ExpiryDate            (Auto-hide date)               │  │
│  │  ├─ LinkURL               (External link)                │  │
│  │  ├─ Source                (News source)                  │  │
│  │  └─ Summary               (News details)                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. Page Load
```
User opens Market Data page
       ↓
useMarketNews() hook initializes
       ↓
Sets isLoading = true
       ↓
Calls getAllMarketNews(client)
       ↓
MarketNewsSharePointService.getAllNews()
       ↓
Fetches from SharePoint via Graph API
       ↓
Transforms data & filters (IsActive, dates)
       ↓
Sorts by priority & date
       ↓
Returns news array to hook
       ↓
Hook updates state: { news, isLoading: false }
       ↓
Component re-renders with news
       ↓
User sees news list
```

### 2. Manual Refresh
```
User clicks refresh button
       ↓
Calls refetch()
       ↓
Repeats fetch process
       ↓
Updates UI with latest news
```

### 3. Error Handling
```
API call fails
       ↓
Error caught in service layer
       ↓
Error propagated to hook
       ↓
Hook sets error state
       ↓
Component shows error UI
       ↓
User can retry
```

---

## Component Structure

```
MarketData.tsx
├─ Header
│  ├─ Logo & Title
│  ├─ Market Status
│  └─ Search & Settings
├─ KPI Row
│  └─ Market statistics
├─ Main Content
│  ├─ Left Column
│  │  ├─ Chart
│  │  └─ Market Table
│  └─ Right Column (Sidebar)
│     ├─ Live Price Card
│     ├─ Market Heatmap
│     └─ Market News Section ← INTEGRATED HERE
│        ├─ Header with refresh button
│        ├─ Loading state
│        ├─ Error state
│        ├─ Empty state
│        └─ News list
│           └─ News items
│              ├─ Time badge
│              ├─ Priority badge
│              ├─ Category badge
│              ├─ Title
│              ├─ Summary
│              └─ Source
└─ Comparison Chart
```

---

## Data Model

### SharePoint Fields → Frontend Model

```typescript
SharePoint List Item          TypeScript Interface
┌─────────────────┐          ┌──────────────────┐
│ Id              │ ────────→│ id               │
│ Title           │ ────────→│ title            │
│ PublishDate     │ ────────→│ publishDate      │
│ Category        │ ────────→│ category         │
│ RelatedCompany  │ ────────→│ relatedCompany   │
│ Priority        │ ────────→│ priority         │
│ IsActive        │ ────────→│ isActive         │
│ ExpiryDate      │ ────────→│ expiryDate       │
│ LinkURL         │ ────────→│ linkUrl          │
│ Source          │ ────────→│ source           │
│ Summary         │ ────────→│ summary          │
│                 │          │ timeAgo          │ (computed)
└─────────────────┘          └──────────────────┘
```

### Types Hierarchy

```typescript
NewsCategory (union type)
├─ 'Market Activity'
├─ 'Company Announcement'
├─ 'Regulatory'
├─ 'Mining Sector'
├─ 'Financial Sector'
├─ 'Energy Sector'
├─ 'Agriculture Sector'
└─ 'General Market'

NewsPriority (union type)
├─ 'High'      → Shows "Breaking" badge
├─ 'Normal'    → Standard display
└─ 'Low'       → Standard display

MarketNewsItem (interface)
├─ id: string
├─ title: string
├─ publishDate: string
├─ category: NewsCategory
├─ relatedCompany?: string[]
├─ priority: NewsPriority
├─ isActive: boolean
├─ expiryDate?: string
├─ linkUrl?: string
├─ source?: string
├─ summary?: string
└─ timeAgo?: string
```

---

## Authentication Flow

```
┌──────────────┐
│ User         │
└──────┬───────┘
       │ Opens app
       ↓
┌──────────────────────┐
│ Microsoft OAuth      │
│ - User logs in       │
│ - Gets access token  │
└──────┬───────────────┘
       │ Token stored
       ↓
┌──────────────────────┐
│ Graph Client         │
│ - Token attached     │
│ - API calls          │
└──────┬───────────────┘
       │ Authorized
       ↓
┌──────────────────────┐
│ SharePoint Access    │
│ - Read MarketNews    │
│ - Fetch items        │
└──────────────────────┘
```

---

## Performance Optimization

### Caching Strategy
```
First Load:
- Fetch from SharePoint
- Cache in component state
- Display to user

Subsequent Renders:
- Use cached data
- No API calls needed

Manual Refresh:
- Clear cache
- Fetch fresh data
- Update state
```

### Data Filtering Pipeline
```
Raw SharePoint Data
       ↓
Filter: IsActive = true
       ↓
Filter: PublishDate ≤ now
       ↓
Filter: ExpiryDate ≥ now (if set)
       ↓
Sort: Priority (High → Normal → Low)
       ↓
Sort: Date (newest first)
       ↓
Transform: Add timeAgo
       ↓
Final Data to Display
```

---

## Error Boundaries

```
Try-Catch Hierarchy:

Service Layer
├─ Catches network errors
├─ Catches API errors
└─ Throws with descriptive messages
       ↓
Hook Layer
├─ Catches service errors
├─ Sets error state
└─ Allows retry
       ↓
Component Layer
├─ Displays error UI
├─ Shows retry button
└─ Graceful degradation
```

---

## State Management

```
Component State:
├─ companies (array)        - Market data
├─ selectedSymbol (string)  - Selected company
├─ searchQuery (string)     - Search input
├─ currentTime (string)     - Clock
├─ isFullscreen (boolean)   - Fullscreen mode
└─ settings (object)        - User preferences

Hook State:
├─ news (array)             - News items
├─ isLoading (boolean)      - Loading indicator
├─ error (string | null)    - Error message
└─ Internal:
    ├─ client              - Graph client
    └─ isAuthenticated     - Auth status
```

---

## Security Model

```
┌─────────────────────┐
│ User Authentication │
│ (Microsoft OAuth)   │
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│ Azure AD Permissions│
│ - Sites.Read.All    │
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│ SharePoint Perms    │
│ - Read list items   │
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│ Data Access         │
│ - Only active items │
│ - Published only    │
│ - Non-expired only  │
└─────────────────────┘
```

---

## Scalability Considerations

### Current Implementation (Small Scale)
- Up to 100 news items
- Fetch all at once
- Client-side filtering
- Single API call

### Future Enhancements (Large Scale)
```
If > 500 items:
├─ Implement pagination
├─ Server-side filtering
├─ Virtual scrolling
└─ Incremental loading

If > 1000 items:
├─ Add caching layer (Redis)
├─ Implement CDN
├─ Database indexing
└─ Archive old news
```

---

## Testing Strategy

### Unit Tests
```
Service Layer:
├─ Test transformNewsItem()
├─ Test getTimeAgo()
├─ Test filtering logic
└─ Mock Graph API

Hook Layer:
├─ Test data fetching
├─ Test error handling
├─ Test refetch
└─ Mock service

Component:
├─ Test loading state
├─ Test error state
├─ Test news rendering
└─ Test interactions
```

### Integration Tests
```
End-to-End:
├─ Create test list
├─ Add test data
├─ Fetch via API
├─ Verify display
└─ Clean up
```

---

## Monitoring & Logging

```
Console Logs:
├─ Service initialization
├─ API call start/end
├─ Data transformations
├─ Errors with stack traces
└─ Performance metrics

Error Tracking:
├─ Network failures
├─ Permission issues
├─ Data validation errors
└─ Unexpected states
```

---

## Deployment Checklist

- [ ] SharePoint list created
- [ ] Columns configured
- [ ] Sample data added
- [ ] Azure AD permissions set
- [ ] Code committed to git
- [ ] Tests passing
- [ ] Build succeeds
- [ ] Documentation updated
- [ ] Content editors trained
- [ ] Monitoring enabled

---

**Reference**: See [MARKET_NEWS_IMPLEMENTATION_GUIDE.md](MARKET_NEWS_IMPLEMENTATION_GUIDE.md) for details

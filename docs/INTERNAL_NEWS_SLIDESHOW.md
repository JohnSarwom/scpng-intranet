# Internal News Slideshow Component

## Overview
The Internal News Slideshow component has been successfully implemented to replace the KPI Statistics component on the home page. It displays organizational news with images, titles, and descriptions in an auto-rotating carousel format.

## Implementation Details

### Files Created
1. **Component**: `src/components/dashboard/InternalNewsSlideshow.tsx`
   - Main slideshow component with Embla Carousel integration
   - Auto-play functionality (6 seconds per slide)
   - Manual navigation (prev/next arrows, dot indicators)
   - Touch/swipe support for mobile
   - Category-based color coding
   - Loading, error, and empty states

2. **Custom Hook**: `src/hooks/useInternalNews.ts`
   - Data fetching hook for news items
   - Currently uses mock data (8 sample news items)
   - Ready for SharePoint integration

3. **Documentation**: `docs/INTERNAL_NEWS_SLIDESHOW.md` (this file)

### Files Modified
- `src/pages/Index.tsx` - Replaced `KPIStatistics` with `InternalNewsSlideshow`

### Dependencies Added
- `embla-carousel-react` - Lightweight, accessible carousel library
- `embla-carousel-autoplay` - Auto-play plugin for carousel

## Features

### ✅ Implemented Features
- **Auto-play Slideshow**: Automatically rotates through news items every 6 seconds
- **Pause on Hover**: Auto-play pauses when user hovers over the slideshow
- **Manual Navigation**:
  - Previous/Next arrow buttons
  - Clickable dot indicators
  - Keyboard support (arrow keys)
  - Touch/swipe gestures on mobile
- **Responsive Design**: Adapts to mobile, tablet, and desktop screens
- **Category Color Coding**:
  - HR: Blue
  - IT: Purple
  - Events: Green
  - General: Gray
  - Urgent: Red
- **Priority Badges**: Urgent news items display a prominent "URGENT" badge
- **Image Handling**:
  - Proper aspect ratio (16:9)
  - Fallback placeholder for missing images
  - Error handling for broken image links
- **Loading State**: Skeleton loader with spinner
- **Error State**: User-friendly error message with retry button
- **Empty State**: Message when no news is available

## Current Data Structure

```typescript
interface NewsItem {
  id: string;              // Unique identifier
  title: string;           // News headline
  description: string;     // Brief summary (2-3 sentences)
  image: string;          // Image URL
  date: string;           // Publication date (ISO format)
  category: 'HR' | 'IT' | 'Events' | 'General' | 'Urgent';
  priority?: 'normal' | 'urgent';
  link?: string;          // Optional link to full article
  author?: string;        // Author/department name
}
```

## Mock Data
Currently using 8 sample news items covering various categories:
1. Employee Onboarding Program (HR)
2. IT System Upgrade (IT, Urgent)
3. Annual Company Celebration (Events)
4. Q4 Performance Reviews (HR)
5. New Parking Regulations (General)
6. Professional Development Workshops (Events)
7. Security Protocol Update (Urgent)
8. Wellness Program Benefits (HR)

Mock images are sourced from `picsum.photos` placeholder service.

## SharePoint Integration Plan

### Step 1: SharePoint List Structure
Create a SharePoint list named **"Internal News"** with the following columns:

| Column Name | Type | Required | Description |
|-------------|------|----------|-------------|
| Title | Single line of text | Yes | News headline |
| Description | Multiple lines of text | Yes | Brief summary/description |
| NewsImage | Image | No | Featured image for the news |
| PublishedDate | Date and Time | Yes | Publication date |
| Category | Choice | Yes | HR, IT, Events, General, Urgent |
| Priority | Choice | No | Normal, Urgent |
| ArticleLink | Hyperlink | No | Link to full article (if applicable) |
| Author | Person or Group | No | Who posted the news |
| IsActive | Yes/No | Yes | Whether to display on slideshow |

### Step 2: SharePoint Service
Create a new service file: `src/services/internalNewsSharePointService.ts`

```typescript
import { GraphService } from '@/services/graphService';

export interface SharePointNewsItem {
  id: string;
  fields: {
    Title: string;
    Description: string;
    NewsImage?: { serverRelativeUrl: string };
    PublishedDate: string;
    Category: string;
    Priority?: string;
    ArticleLink?: { Url: string };
    Author?: { Title: string };
    IsActive: boolean;
  };
}

export class InternalNewsSharePointService {
  private static SITE_ID = 'your-sharepoint-site-id';
  private static LIST_NAME = 'Internal News';

  static async getActiveNews(): Promise<NewsItem[]> {
    // Implementation here
    // 1. Fetch from SharePoint using GraphService
    // 2. Filter by IsActive = true
    // 3. Sort by PublishedDate descending
    // 4. Transform to NewsItem format
    // 5. Return latest 10-15 items
  }

  static async createNewsItem(item: NewsItem): Promise<void> {
    // For admin interface to add news
  }
}
```

### Step 3: Update useInternalNews Hook
Modify `src/hooks/useInternalNews.ts`:

```typescript
import { InternalNewsSharePointService } from '@/services/internalNewsSharePointService';

export function useInternalNews() {
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Replace mock data with SharePoint fetch
        const data = await InternalNewsSharePointService.getActiveNews();

        setNews(data);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load news');
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);
}
```

### Step 4: Image Handling for SharePoint
SharePoint images will need proper URL construction:
```typescript
const imageUrl = item.NewsImage
  ? `https://yourtenant.sharepoint.com${item.NewsImage.serverRelativeUrl}`
  : 'fallback-image-url';
```

### Step 5: Permissions
Ensure the application has the following Microsoft Graph permissions:
- `Sites.Read.All` - To read SharePoint list items
- `Sites.ReadWrite.All` - If implementing admin create/update features

## Usage

The component is automatically displayed on the home page and requires no configuration. It:
1. Loads on page mount
2. Fetches news data (currently mock, will be SharePoint)
3. Auto-plays through available news items
4. Allows manual navigation
5. Pauses on hover/interaction

## Accessibility

The component includes:
- ✅ ARIA labels on navigation buttons
- ✅ Keyboard navigation support
- ✅ Screen reader announcements
- ✅ Focus management
- ✅ Proper semantic HTML

## Performance Optimizations

- Images are lazy-loaded when not in viewport
- Component uses React.memo for slide optimization
- Debounced navigation to prevent rapid clicking
- Limited to 10-15 most recent articles to reduce load

## Future Enhancements

### Phase 2 (Post-SharePoint Integration)
- [ ] Admin interface to create/edit news directly from dashboard
- [ ] "Mark as Read" functionality
- [ ] Pin important news to always show first
- [ ] News categories filter
- [ ] View count analytics

### Phase 3 (Advanced Features)
- [ ] Video news support
- [ ] Multi-language support
- [ ] Push notifications for urgent news
- [ ] Email digest of weekly news
- [ ] Comments/reactions on news items

## Testing Checklist

- [x] Auto-play starts and cycles through slides
- [x] Previous/Next buttons work correctly
- [x] Dot indicators show active slide
- [x] Clicking dots navigates to correct slide
- [x] Images load properly
- [x] Text doesn't overflow (title clamp works)
- [x] Loading state displays correctly
- [x] Error state shows properly
- [x] Responsive on mobile/tablet/desktop

## Troubleshooting

### Issue: Slideshow not auto-playing
**Solution**: Check that Embla Carousel autoplay plugin is properly initialized in the component.

### Issue: Images not loading
**Solution**: Verify image URLs are accessible. Check browser console for CORS errors.

### Issue: Navigation buttons not working
**Solution**: Ensure emblaApi is properly initialized before calling scrollPrev/scrollNext.

## Developer Notes

- The component is fully TypeScript typed for type safety
- Uses existing shadcn/ui components for consistency
- Follows the project's color scheme and design patterns
- Mock data can be easily replaced without changing component logic
- All TODO comments in code mark SharePoint integration points

## Related Files

- Component: [InternalNewsSlideshow.tsx](../src/components/dashboard/InternalNewsSlideshow.tsx)
- Hook: [useInternalNews.ts](../src/hooks/useInternalNews.ts)
- Home Page: [Index.tsx](../src/pages/Index.tsx)

---

**Last Updated**: November 26, 2024
**Status**: ✅ Implemented with Mock Data
**Next Step**: SharePoint Integration

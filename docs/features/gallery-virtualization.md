# Gallery Virtualization

This document outlines the implementation of UI virtualization in the media gallery to address performance issues related to choppy scrolling.

## The Problem

The media gallery experienced choppy scrolling and performance degradation, especially when displaying a large number of photos. This was caused by the rendering of a large number of DOM elements at once, which overwhelmed the browser and caused expensive layout and style recalculations during scrolling.

## The Solution

To solve this issue, we implemented UI virtualization using the **TanStack Virtual** library (`@tanstack/react-virtual`). Virtualization is a technique that renders only the items that are currently visible on the screen, plus a small buffer. This keeps the number of DOM elements small and constant, regardless of the total number of photos in the gallery, resulting in a smooth scrolling experience.

## Implementation Details

The implementation involved the following changes to the `src/pages/Gallery.tsx` component:

1.  **Installation of TanStack Virtual**: The `@tanstack/react-virtual` library was added to the project's dependencies.

2.  **Creation of the `VirtualizedEventGrid` Component**: A new component, `VirtualizedEventGrid`, was created to handle the virtualized rendering of the images. This component uses the `useVirtualizer` hook from TanStack Virtual to calculate which items should be visible and renders only those items.

3.  **Dynamic Column Calculation**: The number of columns in the grid is now dynamically calculated based on the window width, making the gallery responsive.

## Visual Enhancements

To improve the visual appeal of the gallery, the following changes were made:

-   **Rounded Image Corners**: The images within the gallery cards now have rounded corners to match the card's border-radius. This was achieved by adding `rounded-lg` and `overflow-hidden` classes to the image container and `rounded-lg` to the `img` element itself.

## Refinements and Fixes

### The Problem: Double Scrollbar and Inefficient Scrolling

A subsequent issue was identified where the gallery displayed a double scrollbar—one for the main page and another for the gallery content itself. This was caused by a fixed height and `overflow-y-auto` style on the `TabsContent` component, which created a nested scroll container. This setup not only created a confusing UI but also made the virtualization less effective, leading to choppy scrolling.

### The Solution: Unified Page Scrolling

To resolve this, the nested scroll container was eliminated, and the virtualizer was configured to use the main browser window for scrolling.

1.  **Removed Nested Scrolling**: The `h-[800px]` and `overflow-y-auto` classes were removed from the `TabsContent` component, allowing it to expand naturally with its content.
2.  **Updated Virtualizer**: The `useVirtualizer` hook in the `VirtualizedEventGrid` component was updated to use `document.documentElement` as the scroll element. This makes the entire page the single source of scrolling truth, resulting in a smoother and more intuitive user experience.

## Key Code Snippets

### `VirtualizedEventGrid` Component (Updated)

```tsx
const VirtualizedEventGrid = ({
  event,
  isSelectMode,
  selectedPhotos,
  handleSelectPhoto,
  handleImageClick,
  openEditModal,
  openDeleteConfirm,
}: {
  event: GalleryEventWithPhotos;
  isSelectMode: boolean;
  selectedPhotos: Set<string>;
  handleSelectPhoto: (photoId: string) => void;
  handleImageClick: (image: GalleryImage, event: GalleryEventWithPhotos, index: number) => void;
  openEditModal: (photo: GalleryPhoto, e: React.MouseEvent) => void;
  openDeleteConfirm: (image: GalleryImage, e: React.MouseEvent) => void;
}) => {
  const getColumns = () => (window.innerWidth >= 1024 ? 4 : window.innerWidth >= 768 ? 3 : 2);
  const [columns, setColumns] = useState(getColumns());

  useEffect(() => {
    const handleResize = () => {
      setColumns(getColumns());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(event.images.length / columns),
    getScrollElement: () => document.documentElement,
    estimateSize: () => 350,
    overscan: 5,
  });

  return (
    <div
      style={{
        height: `${rowVirtualizer.getTotalSize()}px`,
        width: '100%',
        position: 'relative',
      }}
    >
      {/* ... mapping over virtual items ... */}
    </div>
  );
};
```

### Usage in the `Gallery` Component (Updated)

```tsx
<TabsContent
  key={year}
  value={year}
  className="space-y-8"
>
  {galleryData[year].map((event) => (
    <div key={event.id} className="space-y-4">
      {/* ... event title and description ... */}
      
      {event.images.length > 0 ? (
        <VirtualizedEventGrid
          event={event}
          isSelectMode={isSelectMode}
          selectedPhotos={selectedPhotos}
          handleSelectPhoto={handleSelectPhoto}
          handleImageClick={handleImageClick}
          openEditModal={openEditModal}
          openDeleteConfirm={openDeleteConfirm}
        />
      ) : (
        {/* ... no photos message ... */}
      )}
    </div>
  ))}
</TabsContent>

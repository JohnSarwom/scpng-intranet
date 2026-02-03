import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { useInternalNews, NewsItem } from '@/hooks/useInternalNews';

// Category color mapping
const CATEGORY_COLORS = {
  HR: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  IT: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  Events: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  General: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  Urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'SCPNG News': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  Internal: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200',
};

interface NewsSlideProps {
  item: NewsItem;
  onReadMore?: (item: NewsItem) => void;
}

const NewsSlide: React.FC<NewsSlideProps> = ({ item, onReadMore }) => {
  return (
    <div className="flex-[0_0_100%] min-w-0 relative">
      <div className="px-4">
        {/* Image Container */}
        <div className="relative w-full h-[240px] mb-4 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/800x450/83002A/FFFFFF?text=SCPNG+News';
            }}
          />
          {item.priority === 'urgent' && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-red-600 text-white font-semibold">
                URGENT
              </Badge>
            </div>
          )}
        </div>

        {/* Content Container */}
        <div className="space-y-3">
          {/* Category and Date */}
          <div className="flex justify-between items-center">
            <Badge
              variant="outline"
              className={`${CATEGORY_COLORS[item.category]} border-0 text-xs font-medium uppercase`}
            >
              {item.category}
            </Badge>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(item.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold leading-tight line-clamp-2 dark:text-white">
            {item.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
            {item.description}
          </p>

          {/* Author */}
          {item.author && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              By {item.author}
            </p>
          )}

          {/* Read More Button */}
          <div className="pt-2">
            <Button
              variant="link"
              className="p-0 h-auto text-intranet-primary hover:text-intranet-accent dark:text-intranet-accent-light font-medium"
              onClick={() => onReadMore?.(item)}
            >
              Read more →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InternalNewsSlideshow: React.FC = () => {
  const { news, isLoading, error, refetch } = useInternalNews();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const autoplayOptions = {
    delay: 6000,
    stopOnInteraction: true,
    stopOnMouseEnter: true,
  };

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'center',
      skipSnaps: false,
    },
    [Autoplay(autoplayOptions)]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  const handleReadMore = (item: NewsItem) => {
    // TODO: Implement modal or navigation to full article
    console.log('Read more clicked for:', item.title);
    // Could open a modal here or navigate to news page with specific article
  };

  // Loading State
  if (isLoading) {
    return (
      <Card className="shadow-sm animate-fade-in rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-lg font-semibold">Internal News & Updates</CardTitle>
          <Badge variant="outline" className="bg-intranet-primary/10 text-intranet-primary font-medium">
            Latest
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[420px] space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-intranet-primary" />
            <p className="text-gray-500 dark:text-gray-400">Loading latest news...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error State
  if (error) {
    return (
      <Card className="shadow-sm animate-fade-in rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-lg font-semibold">Internal News & Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[420px] space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <p className="text-red-600 dark:text-red-400">Unable to load news</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
            <Button onClick={refetch} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No News State
  if (!news || news.length === 0) {
    return (
      <Card className="shadow-sm animate-fade-in rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-lg font-semibold">Internal News & Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[420px] space-y-4">
            <p className="text-gray-500 dark:text-gray-400">📰 No recent news available. Check back later!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Main Slideshow
  return (
    <Card className="bg-white rounded-xl shadow-sm animate-fade-in">
      {/* Header with Navigation */}
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-lg font-semibold">Internal News & Updates</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-intranet-primary/10 text-intranet-primary font-medium">
            Latest
          </Badge>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={scrollPrev}
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={scrollNext}
              aria-label="Next slide"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="h-[580px] flex flex-col">
        {/* Embla Carousel */}
        <div className="overflow-hidden flex-1" ref={emblaRef}>
          <div className="flex touch-pan-y h-full">
            {news.map((item) => (
              <NewsSlide key={item.id} item={item} onReadMore={handleReadMore} />
            ))}
          </div>
        </div>

        {/* Dot Indicators */}
        <div className="flex justify-center items-center gap-2 mt-6 flex-shrink-0">
          {news.map((_, index) => (
            <button
              key={index}
              className={`h-2 rounded-full transition-all ${index === selectedIndex
                ? 'w-8 bg-intranet-primary'
                : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
              onClick={() => scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default InternalNewsSlideshow;

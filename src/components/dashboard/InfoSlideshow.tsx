/**
 * Reusable Information Slideshow Component
 * Base component for displaying categorized information slides
 */

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { SlideshowItem, SlideshowCategory } from '@/types/slideshow.types';

interface InfoSlideshowProps {
  title: string;
  category: SlideshowCategory;
  slides: SlideshowItem[];
  isLoading: boolean;
  error: string | null;
  onRefetch: () => void;
  badgeText?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  icon?: React.ReactNode;
}

interface SlideProps {
  item: SlideshowItem;
  onReadMore?: (item: SlideshowItem) => void;
}

const Slide: React.FC<SlideProps> = ({ item, onReadMore }) => {
  return (
    <div className="flex-[0_0_100%] min-w-0 relative">
      <div className="px-4">
        {/* Image Container */}
        {item.imageUrl && (
          <div className="relative w-full h-[200px] mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-intranet-primary/10 to-intranet-accent/10">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src =
                  'https://via.placeholder.com/1200x675/83002A/FFFFFF?text=SCPNG';
              }}
            />
            {item.priority === 'High' && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-red-600 text-white font-semibold shadow-lg">
                  HIGH PRIORITY
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Content Container */}
        <div className="space-y-3">
          {/* Title */}
          <h3 className="text-lg font-bold leading-tight line-clamp-2 dark:text-white">
            {item.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-4">
            {item.description}
          </p>

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2">
            {item.author && <span>By {item.author}</span>}
            {item.publishDate && (
              <span>
                {new Date(item.publishDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>

          {/* Read More Button */}
          {item.linkUrl && (
            <div className="pt-2">
              <Button
                variant="link"
                className="p-0 h-auto text-intranet-primary hover:text-intranet-accent dark:text-intranet-accent-light font-medium"
                onClick={() => {
                  if (item.linkUrl) {
                    window.open(item.linkUrl, '_blank', 'noopener,noreferrer');
                  } else {
                    onReadMore?.(item);
                  }
                }}
              >
                Learn more <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoSlideshow: React.FC<InfoSlideshowProps> = ({
  title,
  category,
  slides,
  isLoading,
  error,
  onRefetch,
  badgeText = 'Info',
  badgeVariant = 'outline',
  icon,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const autoplayOptions = {
    delay: 8000, // 8 seconds per slide
    stopOnInteraction: true,
    stopOnMouseEnter: true,
  };

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: slides.length > 1,
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

  const handleReadMore = (item: SlideshowItem) => {
    console.log('Read more clicked for:', item.title);
    // Could implement modal or detailed view here
  };

  // Loading State
  if (isLoading) {
    return (
      <Card className="shadow-sm animate-fade-in rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          </div>
          <Badge variant={badgeVariant} className="font-medium">
            {badgeText}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[350px] space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-intranet-primary" />
            <p className="text-gray-500 dark:text-gray-400">Loading content...</p>
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
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[350px] space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <p className="text-red-600 dark:text-red-400">Unable to load content</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
              {error}
            </p>
            <Button onClick={onRefetch} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No Slides State
  if (!slides || slides.length === 0) {
    return (
      <Card className="shadow-sm animate-fade-in rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[350px] space-y-4">
            <p className="text-gray-500 dark:text-gray-400">
              📋 No content available. Check back later!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Main Slideshow
  return (
    <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm animate-fade-in">
      {/* Header with Navigation */}
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={badgeVariant} className="font-medium">
            {badgeText}
          </Badge>
          {slides.length > 1 && (
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
          )}
        </div>
      </CardHeader>

      <CardContent className="h-[420px] flex flex-col">
        {/* Embla Carousel */}
        <div className="overflow-hidden flex-1" ref={emblaRef}>
          <div className="flex touch-pan-y h-full">
            {slides.map((item) => (
              <Slide key={item.id} item={item} onReadMore={handleReadMore} />
            ))}
          </div>
        </div>

        {/* Dot Indicators */}
        {slides.length > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6 flex-shrink-0">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === selectedIndex
                    ? 'w-8 bg-intranet-primary'
                    : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
                onClick={() => scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InfoSlideshow;

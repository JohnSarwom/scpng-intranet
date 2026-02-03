import React from 'react';
import GallerySlideshow from './GallerySlideshow';
import { useSlideshow } from '@/contexts/SlideshowContext';

interface WelcomeBannerProps {
  imageUrl?: string;
  name: string;
  date: string;
  greeting?: string;
  location?: string;
}

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  imageUrl = "https://picsum.photos/id/1033/1200/300", // Default banner image
  name,
  date,
  greeting,
  location
}) => {
  const { isSlideshowVisible } = useSlideshow();

  return (
    <div className="relative w-full h-36 sm:h-48 lg:h-60 rounded-xl overflow-hidden mb-6 animate-fade-in shadow-md">
      <img
        src={imageUrl}
        alt="SCPNG Welcome Banner"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-intranet-primary/95 via-intranet-primary/70 to-transparent flex items-center px-6 md:px-10">
        <div className={`grid ${isSlideshowVisible ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1'} w-full gap-4 items-center h-full py-4`}>
          <div className={`${isSlideshowVisible ? 'md:col-span-2' : ''} text-white z-10`}>
            <div className="text-sm font-light mb-1 sm:mb-2">{date}</div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">Good Day, {name}!</h1>
            {greeting && <p className="text-sm sm:text-base opacity-90 mb-1 sm:mb-2">{greeting}</p>}
            {location && <p className="text-xs sm:text-sm opacity-80">{location}</p>}
          </div>

          {isSlideshowVisible && (
            <div className="hidden md:block h-full w-full max-w-sm ml-auto z-10 p-2">
              <GallerySlideshow />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;

/**
 * MS Office 365 Tips Slideshow
 * Displays helpful tips for using Microsoft 365 applications
 */

import React from 'react';
import { BookOpen } from 'lucide-react';
import InfoSlideshow from './InfoSlideshow';
import { useMSOffice365Tips } from '@/hooks/useSlideshows';

const MSOffice365Slideshow: React.FC = () => {
  const { slides, isLoading, error, refetch } = useMSOffice365Tips();

  return (
    <InfoSlideshow
      title="MS Office 365 Tips"
      category="MS Office 365 Tips"
      slides={slides}
      isLoading={isLoading}
      error={error}
      onRefetch={refetch}
      badgeText="How-To"
      badgeVariant="outline"
      icon={<BookOpen className="h-5 w-5 text-blue-600" />}
    />
  );
};

export default MSOffice365Slideshow;

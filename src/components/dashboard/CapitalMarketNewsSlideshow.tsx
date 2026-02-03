/**
 * Capital Market News Slideshow
 * Displays global securities commission and capital market news
 */

import React from 'react';
import { TrendingUp } from 'lucide-react';
import InfoSlideshow from './InfoSlideshow';
import { useCapitalMarketNews } from '@/hooks/useSlideshows';

const CapitalMarketNewsSlideshow: React.FC = () => {
  const { slides, isLoading, error, refetch } = useCapitalMarketNews();

  return (
    <InfoSlideshow
      title="Capital Market News"
      category="Capital Market News"
      slides={slides}
      isLoading={isLoading}
      error={error}
      onRefetch={refetch}
      badgeText="Latest"
      badgeVariant="outline"
      icon={<TrendingUp className="h-5 w-5 text-green-600" />}
    />
  );
};

export default CapitalMarketNewsSlideshow;

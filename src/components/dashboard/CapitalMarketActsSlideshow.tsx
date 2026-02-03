/**
 * Capital Market Acts Slideshow
 * Displays information about PNG capital market regulations and acts
 */

import React from 'react';
import { Scale } from 'lucide-react';
import InfoSlideshow from './InfoSlideshow';
import { useCapitalMarketActs } from '@/hooks/useSlideshows';

const CapitalMarketActsSlideshow: React.FC = () => {
  const { slides, isLoading, error, refetch } = useCapitalMarketActs();

  return (
    <InfoSlideshow
      title="Capital Market Acts"
      category="Capital Market Acts"
      slides={slides}
      isLoading={isLoading}
      error={error}
      onRefetch={refetch}
      badgeText="Regulatory"
      badgeVariant="outline"
      icon={<Scale className="h-5 w-5 text-intranet-primary" />}
    />
  );
};

export default CapitalMarketActsSlideshow;

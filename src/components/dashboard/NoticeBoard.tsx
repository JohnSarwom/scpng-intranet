
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Bell, Calendar, ExternalLink, Pin, Loader2, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useNoticeBoard } from '@/hooks/useNoticeBoard';
import { IAnnouncement } from '@/types';

const NewsCarousel: React.FC = () => {
  const newsImages = [
    "https://picsum.photos/id/1033/800/400",
    "https://picsum.photos/id/1025/800/400",
    "https://picsum.photos/id/1015/800/400",
    "https://picsum.photos/id/1018/800/400"
  ];

  return (
    <Carousel className="w-full mb-4">
      <CarouselContent>
        {newsImages.map((image, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <div className="overflow-hidden rounded-md">
                <img
                  src={image}
                  alt={`News image ${index + 1}`}
                  className="h-48 w-full object-cover transition-all hover:scale-105"
                />
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex justify-center mt-2">
        <CarouselPrevious className="relative static left-0 translate-y-0 mr-2" />
        <CarouselNext className="relative static right-0 translate-y-0" />
      </div>
    </Carousel>
  );
};

const NoticeBoard = () => {
  const { announcements, loading, error } = useNoticeBoard();
  const [selectedNotice, setSelectedNotice] = React.useState<IAnnouncement | null>(null);

  // Get category badge color and icon
  const getCategoryDetails = (category: IAnnouncement['category']) => {
    switch (category) {
      case 'Announcement':
        return { color: 'bg-blue-500', icon: <Bell size={14} /> };
      case 'Event':
        return { color: 'bg-green-500', icon: <Calendar size={14} /> };
      case 'Update':
        return { color: 'bg-yellow-500', icon: <ExternalLink size={14} /> };
      case 'Alert':
        return { color: 'bg-red-500', icon: <Bell size={14} /> };
      default:
        return { color: 'bg-gray-500', icon: <Bell size={14} /> };
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <>
      <Card className="bg-white rounded-xl shadow-sm animate-fade-in">
        <CardHeader className="pb-2 space-y-0">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Bell className="h-5 w-5 text-intranet-primary" />
            SCPNG Notice Board
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[580px] flex flex-col">
          <NewsCarousel />
          <div className="space-y-3 flex-1 overflow-y-auto scrollbar-thin pr-2">
            {loading && (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-intranet-primary" />
              </div>
            )}
            {error && (
              <div className="flex flex-col items-center justify-center h-full text-red-500">
                <AlertTriangle className="h-8 w-8 mb-2" />
                <p className="text-sm">Failed to load notices.</p>
                <p className="text-xs">{error.message}</p>
              </div>
            )}
            {!loading && !error && announcements.map((notice) => (
              <div
                key={notice.id}
                onClick={() => setSelectedNotice(notice)}
                className={`p-2.5 rounded-lg border border-border hover:border-intranet-primary/50 transition-colors duration-300 cursor-pointer
                  ${notice.isPinned ? 'border-intranet-primary/50 bg-intranet-primary/5' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-sm flex items-center gap-1">
                    {notice.isPinned && <Pin size={12} className="text-intranet-primary animate-pulse" />}
                    {notice.title}
                  </h3>
                  <Badge
                    variant="outline"
                    className={`flex items-center gap-1 text-white text-xs px-1.5 py-0.5 ${getCategoryDetails(notice.category).color}`}
                  >
                    {getCategoryDetails(notice.category).icon}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-1 line-clamp-2">{notice.content}</p>
                <div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(notice.createdDate)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedNotice} onOpenChange={(open) => !open && setSelectedNotice(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center justify-between mr-4">
              <Badge
                variant="outline"
                className={`flex items-center gap-1 text-white mb-2 ${selectedNotice ? getCategoryDetails(selectedNotice.category).color : ''}`}
              >
                {selectedNotice && getCategoryDetails(selectedNotice.category).icon}
                {selectedNotice?.category}
              </Badge>
              {selectedNotice?.isPinned && (
                <Badge variant="secondary" className="mb-2 flex items-center gap-1">
                  <Pin size={12} /> Pinned
                </Badge>
              )}
            </div>
            <DialogTitle className="text-xl">{selectedNotice?.title}</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Posted on {selectedNotice && formatDate(selectedNotice.createdDate)}
              {selectedNotice?.author && ` by ${selectedNotice.author}`}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed break-words">
              {selectedNotice?.content}
            </div>

            {selectedNotice?.sourceEmail && (
              <div className="mt-6 pt-4 border-t text-xs text-gray-500">
                Source: {selectedNotice.sourceEmail}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NoticeBoard;

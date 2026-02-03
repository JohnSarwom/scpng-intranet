import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  ExternalLink,
  Mail,
  FileText,
  Tag,
  Video,
  Edit,
  Trash2,
  Loader2,
} from 'lucide-react';
import { CalendarEvent, deleteCalendarEvent } from '@/services/calendarService';
import { useMsal } from '@azure/msal-react';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';

interface CalendarEventModalProps {
  event: CalendarEvent | null;
  open: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: () => void;
}

const CalendarEventModal: React.FC<CalendarEventModalProps> = ({
  event,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}) => {
  const { instance: msalInstance } = useMsal();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = React.useState(false);

  if (!event) return null;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    setIsDeleting(true);
    try {
      await deleteCalendarEvent(msalInstance, event.id);
      toast({
        title: 'Event Deleted',
        description: 'The event has been successfully deleted.',
      });
      onOpenChange(false);
      if (onDelete) onDelete();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete the event. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDateTime = (dateTime: string, timeZone: string) => {
    try {
      // Parse the date string as local time (no timezone conversion)
      // Microsoft Graph returns: "2025-12-04T13:54:00.0000000"
      // We want to treat this as local time, not UTC
      const cleanDateTime = dateTime.replace(/\.\d+$/, ''); // Remove milliseconds
      const parts = cleanDateTime.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);

      if (!parts) {
        return 'Invalid date';
      }

      // Create date using local timezone (no conversion)
      const date = new Date(
        parseInt(parts[1]), // year
        parseInt(parts[2]) - 1, // month (0-indexed)
        parseInt(parts[3]), // day
        parseInt(parts[4]), // hours
        parseInt(parts[5]), // minutes
        parseInt(parts[6])  // seconds
      );

      return format(date, 'EEEE, MMMM d, yyyy • h:mm a');
    } catch {
      return 'Invalid date';
    }
  };

  const formatTime = (dateTime: string) => {
    try {
      const cleanDateTime = dateTime.replace(/\.\d+$/, '');
      const parts = cleanDateTime.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);

      if (!parts) {
        return 'Invalid time';
      }

      const date = new Date(
        parseInt(parts[1]),
        parseInt(parts[2]) - 1,
        parseInt(parts[3]),
        parseInt(parts[4]),
        parseInt(parts[5]),
        parseInt(parts[6])
      );

      return format(date, 'h:mm a');
    } catch {
      return 'Invalid time';
    }
  };

  const formatDate = (dateTime: string) => {
    try {
      const cleanDateTime = dateTime.replace(/\.\d+$/, '');
      const parts = cleanDateTime.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);

      if (!parts) {
        return 'Invalid date';
      }

      const date = new Date(
        parseInt(parts[1]),
        parseInt(parts[2]) - 1,
        parseInt(parts[3]),
        parseInt(parts[4]),
        parseInt(parts[5]),
        parseInt(parts[6])
      );

      return format(date, 'EEEE, MMMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const getDuration = () => {
    try {
      // Parse both dates without timezone conversion
      const parseLocalDate = (dateTime: string) => {
        const cleanDateTime = dateTime.replace(/\.\d+$/, '');
        const parts = cleanDateTime.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
        if (!parts) return null;
        return new Date(
          parseInt(parts[1]),
          parseInt(parts[2]) - 1,
          parseInt(parts[3]),
          parseInt(parts[4]),
          parseInt(parts[5]),
          parseInt(parts[6])
        );
      };

      const start = parseLocalDate(event.start.dateTime);
      const end = parseLocalDate(event.end.dateTime);

      if (!start || !end) {
        return 'Unknown duration';
      }

      const diffMs = end.getTime() - start.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 60) {
        return `${diffMins} minutes`;
      } else {
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
      }
    } catch {
      return 'Unknown duration';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold pr-8">
            {event.subject}
          </DialogTitle>
          {event.bodyPreview && (
            <DialogDescription className="text-sm text-gray-600 mt-2">
              {event.bodyPreview}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Date and Time Section */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Date & Time</p>
                {event.isAllDay ? (
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDate(event.start.dateTime)}
                    {formatDate(event.start.dateTime) !== formatDate(event.end.dateTime) && (
                      <> to {formatDate(event.end.dateTime)}</>
                    )}
                    <Badge variant="secondary" className="ml-2">All Day</Badge>
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDateTime(event.start.dateTime, event.start.timeZone)}
                    </p>
                    <p className="text-sm text-gray-600">
                      to {
                        // Check if end date is different from start date (multi-day event)
                        (() => {
                          const startDateStr = event.start.dateTime.substring(0, 10); // "2025-12-04"
                          const endDateStr = event.end.dateTime.substring(0, 10);     // "2025-12-19"
                          return startDateStr !== endDateStr
                            ? formatDateTime(event.end.dateTime, event.end.timeZone) // Multi-day
                            : formatTime(event.end.dateTime); // Same day
                        })()
                      }
                    </p>
                  </>
                )}
              </div>
            </div>

            {!event.isAllDay && (
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">Duration</p>
                  <p className="text-sm text-gray-600 mt-1">{getDuration()}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Location */}
          {event.location?.displayName && (
            <>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">Location</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {event.location.displayName}
                  </p>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Organizer */}
          {event.organizer && (
            <>
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">Organizer</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-gray-600">
                      {event.organizer.emailAddress.name}
                    </p>
                    <a
                      href={`mailto:${event.organizer.emailAddress.address}`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {event.organizer.emailAddress.address}
                    </a>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Attendees */}
          {event.attendees && event.attendees.length > 0 && (
            <>
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Attendees ({event.attendees.length})
                  </p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {event.attendees.map((attendee, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-md"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="h-8 w-8 rounded-full bg-intranet-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-intranet-primary">
                              {attendee.emailAddress.name
                                .split(' ')
                                .map(n => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2)}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-700 truncate">
                              {attendee.emailAddress.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {attendee.emailAddress.address}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="flex-shrink-0 text-xs">
                          {attendee.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Categories */}
          {event.categories && event.categories.length > 0 && (
            <>
              <div className="flex items-start gap-3">
                <Tag className="h-5 w-5 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 mb-2">Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {event.categories.map((category, index) => (
                      <Badge key={index} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Event Status */}
          {event.isCancelled && (
            <>
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                <Badge variant="destructive">Cancelled</Badge>
                <p className="text-sm text-red-700">This event has been cancelled</p>
              </div>
              <Separator />
            </>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            {event.webLink && (
              <Button
                variant="default"
                size="sm"
                onClick={() => window.open(event.webLink, '_blank')}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open in Outlook
              </Button>
            )}

            {event.organizer && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(`mailto:${event.organizer?.emailAddress.address}`, '_blank')
                }
                className="gap-2"
              >
                <Mail className="h-4 w-4" />
                Email Organizer
              </Button>
            )}

            {event.location?.displayName && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      event.location?.displayName || ''
                    )}`,
                    '_blank'
                  )
                }
                className="gap-2"
              >
                <MapPin className="h-4 w-4" />
                View on Map
              </Button>
            )}
          </div>

          {/* Edit/Delete Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit && onEdit(event)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Event
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete Event
            </Button>
          </div>

          {/* Event Details Footer */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                <span>Event ID: {event.id.slice(0, 12)}...</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Timezone: {event.start.timeZone}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CalendarEventModal;


import React, { useState, useMemo } from 'react';
import { ChevronDown, Calendar as CalendarIcon, MapPin, Users, Clock, ExternalLink, Loader2, Plus, Briefcase, CheckCircle, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import StatCircle from './StatCircle';
import { useUpcomingCalendarEvents } from '@/hooks/useCalendarEvents';
import { CalendarEvent } from '@/services/calendarService';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import CalendarEventModal from './CalendarEventModal';
import AddEventModal from './AddEventModal';

interface EventStat {
  count: number;
  label: string;
  icon?: React.ElementType;
  color?: string;
  bg?: string;
}

const StatRow: React.FC<{ icon: React.ElementType, count: number, label: string, color: string, bg: string }> = ({
  icon: Icon,
  count,
  label,
  color,
  bg
}) => (
  <div className="flex items-center p-3 bg-white rounded-xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
    <div className={`p-2.5 rounded-lg ${bg} mr-3`}>
      <Icon className={`h-5 w-5 ${color}`} />
    </div>
    <div>
      <div className="text-lg font-bold text-slate-800 leading-none mb-1">{count}</div>
      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{label}</div>
    </div>
  </div>
);

interface ScheduledEventsProps {
  businessPercentage?: number;
  stats?: EventStat[];
}

const ScheduledEvents: React.FC<ScheduledEventsProps> = ({
  businessPercentage,
  stats
}) => {
  const [daysFilter, setDaysFilter] = useState<number>(7);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const { events, loading, error, refetch } = useUpcomingCalendarEvents(daysFilter, true);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleEventCreated = () => {
    // Refresh the events list after creating a new event
    refetch();
    setEventToEdit(null);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEventToEdit(event);
    setIsModalOpen(false);
    setIsAddEventModalOpen(true);
  };

  const handleDeleteEvent = () => {
    refetch();
    setIsModalOpen(false);
  };

  // Calculate event statistics from real calendar data
  const calculatedStats = useMemo(() => {
    if (!events || events.length === 0) {
      return stats || [
        { count: 0, label: "Meetings", icon: Briefcase, color: "text-intranet-primary", bg: "bg-intranet-primary/10" },
        { count: 0, label: "Tasks Due", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
        { count: 0, label: "Training", icon: GraduationCap, color: "text-purple-600", bg: "bg-purple-50" }
      ];
    }

    // Count meetings (events with attendees)
    const meetings = events.filter(event =>
      event.attendees && event.attendees.length > 0
    ).length;

    // Count all-day events (could be tasks/deadlines)
    const tasksDue = events.filter(event => event.isAllDay).length;

    // Count events with "training" in the subject or categories
    const trainingSessions = events.filter(event =>
      event.subject?.toLowerCase().includes('training') ||
      event.categories?.some(cat => cat.toLowerCase().includes('training'))
    ).length;

    return [
      { count: meetings, label: "Meetings", icon: Briefcase, color: "text-intranet-primary", bg: "bg-intranet-primary/10" },
      { count: tasksDue, label: "All-Day", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
      { count: trainingSessions, label: "Training", icon: GraduationCap, color: "text-purple-600", bg: "bg-purple-50" }
    ];
  }, [events, stats]);

  // Calculate business percentage based on event types
  const calculatedPercentage = useMemo(() => {
    if (!events || events.length === 0) {
      return businessPercentage || 75;
    }

    const businessEvents = events.filter(event => {
      const subject = event.subject?.toLowerCase() || '';
      return subject.includes('meeting') ||
        subject.includes('business') ||
        subject.includes('client') ||
        subject.includes('project');
    }).length;

    return Math.round((businessEvents / events.length) * 100);
  }, [events, businessPercentage]);

  const formatEventTime = (start: string, end: string) => {
    try {
      // Manual parsing to avoid timezone conversion
      // Microsoft Graph returns: "2025-12-04T13:54:00.0000000"
      const parseLocalDate = (dateTime: string) => {
        const cleanDateTime = dateTime.replace(/\.\d+$/, ''); // Remove milliseconds
        const parts = cleanDateTime.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
        if (!parts) return null;

        return new Date(
          parseInt(parts[1]), // year
          parseInt(parts[2]) - 1, // month (0-indexed)
          parseInt(parts[3]), // day
          parseInt(parts[4]), // hours
          parseInt(parts[5]), // minutes
          parseInt(parts[6])  // seconds
        );
      };

      const startDate = parseLocalDate(start);
      const endDate = parseLocalDate(end);

      if (!startDate || !endDate) {
        return 'Time not available';
      }

      return `${format(startDate, 'h:mm a')} - ${format(endDate, 'h:mm a')}`;
    } catch {
      return 'Time not available';
    }
  };

  const formatEventDate = (dateTime: string) => {
    try {
      // Manual parsing to avoid timezone conversion
      const cleanDateTime = dateTime.replace(/\.\d+$/, '');
      const parts = cleanDateTime.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);

      if (!parts) {
        return 'Date not available';
      }

      const date = new Date(
        parseInt(parts[1]),
        parseInt(parts[2]) - 1,
        parseInt(parts[3]),
        parseInt(parts[4]),
        parseInt(parts[5]),
        parseInt(parts[6])
      );

      if (isToday(date)) return 'Today';
      if (isTomorrow(date)) return 'Tomorrow';
      return format(date, 'MMM d, yyyy');
    } catch {
      return 'Date not available';
    }
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm animate-fade-in">
      <CardHeader>
        <div className="flex justify-between items-center gap-3">
          <CardTitle className="text-lg font-semibold">MY SCHEDULED EVENTS</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setEventToEdit(null);
                setIsAddEventModalOpen(true);
              }}
              size="sm"
              variant="outline"
              className="h-8 border-dashed text-slate-600 hover:text-primary hover:border-primary"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Event
            </Button>
            <Select value={daysFilter.toString()} onValueChange={(value) => setDaysFilter(Number(value))}>
              <SelectTrigger className="w-[120px] h-8">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Today</SelectItem>
                <SelectItem value="7">Next 7 days</SelectItem>
                <SelectItem value="14">Next 14 days</SelectItem>
                <SelectItem value="30">Next 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-intranet-primary" />
            <span className="ml-2 text-gray-500">Loading events...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">Failed to load calendar events</p>
            <Button onClick={refetch} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Stats Section - Summary Dashboard */}
              <div className="flex flex-col lg:w-1/3 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div className="mb-6 flex justify-center">
                  <StatCircle
                    percentage={calculatedPercentage}
                    label="BUSINESS"
                    gradientColors={['#FF6B6B', '#83002A', '#6A5ACD']}
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 w-full mt-auto">
                  {calculatedStats.map((stat, index) => (
                    <StatRow
                      key={index}
                      icon={stat.icon || Users}
                      count={stat.count}
                      label={stat.label}
                      color={stat.color || "text-slate-600"}
                      bg={stat.bg || "bg-slate-100"}
                    />
                  ))}
                </div>
              </div>

              {/* Events List - Timeline */}
              <div className="lg:w-2/3 relative">
                {/* Vertical Timeline Line */}
                <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-100 hidden sm:block"></div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {events.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p className="font-medium">No upcoming events</p>
                      <p className="text-sm mt-1">Enjoy your free time!</p>
                    </div>
                  ) : (
                    events.slice(0, 10).map((event, index) => {
                      // Determine category color
                      const isTraining = event.subject?.toLowerCase().includes('training') || event.categories?.some(c => c.toLowerCase().includes('training'));
                      const borderClass = isTraining ? 'border-l-emerald-500' : 'border-l-intranet-primary';

                      return (
                        <div
                          key={event.id || index}
                          className={`relative pl-0 sm:pl-10 group`}
                          onClick={() => handleEventClick(event)}
                        >
                          {/* Timeline Dot */}
                          <div className={`absolute left-[14px] top-4 h-3 w-3 rounded-full border-2 border-white shadow-sm z-10 hidden sm:block ${isTraining ? 'bg-emerald-500' : 'bg-intranet-primary'}`}></div>

                          <div className={`p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 ${borderClass}`}>
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    {formatEventTime(event.start.dateTime, event.end.dateTime)}
                                  </span>
                                  {event.isAllDay && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">ALL DAY</span>
                                  )}
                                </div>

                                <h4 className="font-bold text-slate-800 text-base mb-2 group-hover:text-primary transition-colors">{event.subject}</h4>

                                <div className="flex flex-wrap gap-3">
                                  <div className="flex items-center text-xs text-slate-500 font-medium">
                                    <CalendarIcon className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                                    <span>{formatEventDate(event.start.dateTime)}</span>
                                  </div>

                                  {event.location?.displayName && (
                                    <div className="flex items-center text-xs text-slate-500 font-medium">
                                      <MapPin className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                                      <span className="truncate max-w-[150px]">{event.location.displayName}</span>
                                    </div>
                                  )}

                                  {event.attendees && event.attendees.length > 0 && (
                                    <div className="flex items-center text-xs text-slate-500 font-medium">
                                      <Users className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                                      <span>{event.attendees.length}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {event.webLink && (
                                <a
                                  href={event.webLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-slate-100">
                                    <ExternalLink className="h-4 w-4 text-slate-400" />
                                  </Button>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>

      {/* Calendar Event Modal */}
      <CalendarEventModal
        event={selectedEvent}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
      />

      {/* Add Event Modal */}
      <AddEventModal
        open={isAddEventModalOpen}
        onOpenChange={(open) => {
          setIsAddEventModalOpen(open);
          if (!open) setEventToEdit(null);
        }}
        onEventCreated={handleEventCreated}
        eventToEdit={eventToEdit}
      />
    </Card>
  );
};

export default ScheduledEvents;

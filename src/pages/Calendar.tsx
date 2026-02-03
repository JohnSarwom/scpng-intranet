
import React, { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { format, isSameDay } from 'date-fns';
import { Plus, ChevronLeft, ChevronRight, Clock, Users, MapPin, Calendar as CalendarIcon } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  date: Date;
  time: string;
  location: string;
  attendees: number;
  type: 'meeting' | 'deadline' | 'appointment' | 'reminder';
}

const Calendar = () => {
  const [date, setDate] = useState<Date>(new Date());
  
  // Mock events data
  const events: Event[] = [
    {
      id: 1,
      title: 'Executive Team Meeting',
      date: new Date(2023, 4, 15),
      time: '10:00 AM - 11:30 AM',
      location: 'Conference Room A',
      attendees: 8,
      type: 'meeting'
    },
    {
      id: 2,
      title: 'Project Deadline: Phase 1',
      date: new Date(2023, 4, 18),
      time: '5:00 PM',
      location: 'N/A',
      attendees: 12,
      type: 'deadline'
    },
    {
      id: 3,
      title: 'Client Presentation',
      date: new Date(2023, 4, 20),
      time: '2:00 PM - 3:30 PM',
      location: 'Virtual Meeting Room',
      attendees: 15,
      type: 'meeting'
    },
    {
      id: 4,
      title: 'HR Interview: Senior Developer',
      date: new Date(2023, 4, 22),
      time: '11:00 AM - 12:00 PM',
      location: 'Meeting Room B',
      attendees: 4,
      type: 'appointment'
    },
    {
      id: 5,
      title: 'Team Building Event',
      date: new Date(2023, 4, 25),
      time: '3:00 PM - 6:00 PM',
      location: 'City Park',
      attendees: 24,
      type: 'appointment'
    },
    {
      id: 6,
      title: 'Quarterly Review',
      date: new Date(2023, 4, 28),
      time: '9:00 AM - 12:00 PM',
      location: 'Main Conference Room',
      attendees: 18,
      type: 'meeting'
    },
    {
      id: 7,
      title: 'IT System Maintenance',
      date: new Date(2023, 4, 15),
      time: '7:00 PM - 9:00 PM',
      location: 'Server Room',
      attendees: 3,
      type: 'reminder'
    },
    {
      id: 8,
      title: 'Budget Planning Session',
      date: new Date(2023, 4, 15),
      time: '2:00 PM - 4:00 PM',
      location: 'Finance Department',
      attendees: 5,
      type: 'meeting'
    },
  ];
  
  const selectedDateEvents = events.filter(event => isSameDay(event.date, date));
  
  const getDateClassname = (day: Date) => {
    const hasEvent = events.some(event => isSameDay(event.date, day));
    return hasEvent ? 'bg-intranet-primary/20 rounded-full text-intranet-primary font-bold' : '';
  };
  
  const getEventTypeColor = (type: string) => {
    switch(type) {
      case 'meeting':
        return 'bg-blue-500';
      case 'deadline':
        return 'bg-red-500';
      case 'appointment':
        return 'bg-green-500';
      case 'reminder':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <PageLayout>
      <div className="mb-6 flex justify-between items-center animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold mb-2">Calendar</h1>
          <p className="text-gray-500">Manage your schedule and events</p>
        </div>
        
        <Button className="btn-hover-effect animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <Plus size={16} className="mr-1" />
          Add Event
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-intranet-primary" />
              <span>Events Calendar</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md p-4">
              <CalendarUI
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                className="rounded-md"
                modifiersClassNames={{
                  selected: 'bg-intranet-primary text-white hover:bg-intranet-primary hover:text-white',
                }}
                modifiers={{
                  booked: events.map(event => event.date),
                }}
                modifiersStyles={{
                  booked: { fontWeight: 'bold' }
                }}
                components={{
                  DayContent: ({ date: day }) => (
                    <div className={`relative h-9 w-9 p-0 flex items-center justify-center ${getDateClassname(day)}`}>
                      <span>{format(day, 'd')}</span>
                      {events.some(event => isSameDay(event.date, day)) && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                          {events.filter(event => isSameDay(event.date, day)).slice(0, 3).map((event, i) => (
                            <div key={i} className={`h-1 w-1 rounded-full ${getEventTypeColor(event.type)}`}></div>
                          ))}
                          {events.filter(event => isSameDay(event.date, day)).length > 3 && (
                            <div className="h-1 w-1 rounded-full bg-gray-400"></div>
                          )}
                        </div>
                      )}
                    </div>
                  ),
                }}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>Events for {format(date, 'MMMM d, yyyy')}</CardTitle>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8 p-0 icon-hover-effect">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8 p-0 icon-hover-effect">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map((event, index) => (
                  <div 
                    key={event.id} 
                    className="p-3 border rounded-md hover:bg-accent/50 transition-colors animate-fade-in"
                    style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                  >
                    <div className="flex gap-3 items-start">
                      <div className={`h-4 w-1 rounded-full mt-1 ${getEventTypeColor(event.type)}`}></div>
                      <div className="flex-1">
                        <h3 className="font-medium">{event.title}</h3>
                        
                        <div className="mt-2 space-y-1 text-sm">
                          <div className="flex items-center text-gray-500">
                            <Clock className="h-3.5 w-3.5 mr-2" />
                            <span>{event.time}</span>
                          </div>
                          
                          {event.location !== 'N/A' && (
                            <div className="flex items-center text-gray-500">
                              <MapPin className="h-3.5 w-3.5 mr-2" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center text-gray-500">
                            <Users className="h-3.5 w-3.5 mr-2" />
                            <span>{event.attendees} attendees</span>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex justify-end">
                          <Button variant="ghost" size="sm" className="text-xs icon-hover-effect">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 animate-fade-in">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>No events scheduled for this day</p>
                  <Button variant="outline" size="sm" className="mt-4 btn-hover-effect">
                    <Plus size={14} className="mr-1" />
                    Add Event
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Calendar;


import React, { useState } from 'react';
import { 
  ChevronDown,
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CalendarProps {
  events: {
    time: string;
    title: string;
  }[];
}

const Calendar: React.FC<CalendarProps> = ({ events }) => {
  const [currentMonth, setCurrentMonth] = useState('April');
  const [selectedDay, setSelectedDay] = useState(13);
  
  const days = [
    { day: 'Sun', date: 12 },
    { day: 'Mon', date: 13 },
    { day: 'Tue', date: 14 },
    { day: 'Wed', date: 15 },
    { day: 'Thu', date: 16 },
    { day: 'Fri', date: 17 },
    { day: 'Sat', date: 18 },
  ];

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">MY CALENDAR</h2>
        
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-gray-400"
          >
            <ChevronLeft size={16} />
          </Button>
          
          <Select defaultValue={currentMonth}>
            <SelectTrigger className="w-[90px] h-8 border-none">
              <SelectValue placeholder={currentMonth} />
            </SelectTrigger>
            <SelectContent>
              {months.map(month => (
                <SelectItem key={month} value={month}>{month}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-gray-400"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2 mb-4">
        {days.map((day, index) => (
          <div key={index} className="text-center">
            <p className="text-xs text-gray-500 mb-2">{day.day}</p>
            <Button 
              variant="ghost"
              className={`w-full aspect-square rounded-lg ${
                selectedDay === day.date 
                  ? 'bg-intranet-primary text-white' 
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => setSelectedDay(day.date)}
            >
              {day.date}
            </Button>
          </div>
        ))}
      </div>
      
      <div className="border-t pt-3">
        <div className="flex justify-between items-center mb-3">
          <p className="font-semibold text-sm">APRIL {selectedDay}</p>
          <Button variant="ghost" size="sm" className="h-6 text-sm">
            <ChevronDown size={14} className="mr-1" />
            More
          </Button>
        </div>
        
        <div className="space-y-3">
          {events.map((event, index) => (
            <div key={index} className="flex items-center">
              <div className="text-xs font-medium text-gray-500 w-16">
                {event.time}
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-intranet-primary mr-2"></div>
                <p className="text-sm">{event.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;

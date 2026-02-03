import React, { useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarUi } from '@/components/ui/calendar';
import { 
  Calendar, 
  Filter, 
  Briefcase, // Using Briefcase for 'Employee' as UserTie isn't standard in lucide
  Building, 
  Plus, 
  Search, 
  CalendarDays, // Using CalendarDays for Day view icon
  CalendarRange, // Using CalendarRange for Week view icon
  List, 
  ChevronLeft, 
  ChevronRight, 
  Printer, 
  Download, 
  Pencil, // lucide icon for pencil
  MoreVertical, // lucide icon for ellipsis-v
  Clock, 
  User, 
  Utensils,
  MapPin // Using MapPin for Location
} from 'lucide-react';
import { 
  format, 
  isSameDay, 
  startOfDay, 
  endOfDay, 
  isBefore, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  getDay, 
  getDaysInMonth, 
  getDate, 
  addDays, 
  subDays, 
  startOfWeek,
  endOfWeek,
  eachDayOfInterval
} from 'date-fns';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import DateRangePicker from '@/components/ui/DateRangePicker';
import { Badge } from "@/components/ui/badge";

// Define the shape of appointment data
interface AppointmentData {
  id: string;
  title: string;
  host: string;
  location: string;
  description: string;
  dateRange?: DateRange;
  startTime: string;
  endTime: string;
  attendees: string[];
  status: 'scheduled' | 'completed' | 'canceled';
}

// Expanded Sample Appointment Data
const today = new Date();
const sampleAppointments: AppointmentData[] = [
  // --- Completed Appointments (Past) ---
  {
    id: 'appt-1',
    title: 'Marketing Strategy Meeting',
    host: 'Alice Smith',
    location: 'Room A',
    description: 'Discuss Q3 marketing plan results',
    dateRange: { from: subDays(today, 15), to: subDays(today, 15) }, // 15 days ago
    startTime: '09:00',
    endTime: '10:30',
    attendees: ['Bob', 'Charlie', 'david.m@example.com'],
    status: 'completed' 
  },
  {
    id: 'appt-2',
    title: 'Client Onboarding - Beta Inc',
    host: 'Robert Chen',
    location: 'Meeting Room 3',
    description: 'Onboard new client Beta Inc',
    dateRange: { from: subDays(today, 8), to: subDays(today, 8) }, // 8 days ago
    startTime: '11:00',
    endTime: '12:00',
    attendees: ['David'],
    status: 'completed'
  },
  {
    id: 'appt-6',
    title: 'Product Demo - Old Version',
    host: 'Emily Rodriguez',
    location: 'Demo Room',
    description: 'Showcase deprecated features',
    dateRange: { from: subDays(today, 30), to: subDays(today, 30) }, // 30 days ago
    startTime: '14:00',
    endTime: '15:30',
    attendees: ['Guest1', 'Guest2'],
    status: 'completed'
  },
  {
    id: 'appt-7',
    title: 'Weekly Team Sync - Last Month',
    host: 'David Kim',
    location: 'Main Conference Room',
    description: 'Regular team update from last month',
    dateRange: { from: subMonths(today, 1), to: subMonths(today, 1) }, // Last month
    startTime: '16:00',
    endTime: '17:00',
    attendees: ['Alice', 'Bob', 'Charlie', 'Emily'],
    status: 'completed'
  },
  // --- Scheduled Appointments (Today & Future) ---
  {
    id: 'appt-3',
    title: 'Team Sync - Today',
    host: 'Jennifer Lee',
    location: 'Online',
    description: 'Weekly team sync meeting',
    dateRange: { from: today, to: today }, // Today
    startTime: '09:00',
    endTime: '09:30',
    attendees: ['Alice', 'Bob', 'Charlie', 'David'],
    status: 'scheduled'
  },
  {
    id: 'appt-4',
    title: 'Interview Candidate - John Smith',
    host: 'David Miller',
    location: 'Interview Room 1',
    description: 'Interview John Smith for Software Engineer role',
    dateRange: { from: today, to: today }, // Today
    startTime: '11:00',
    endTime: '12:00',
    attendees: ['Alice'],
    status: 'scheduled'
  },
  {
    id: 'appt-8',
    title: 'Project Kickoff - Phoenix Project',
    host: 'Alice Smith',
    location: 'Conference Room B',
    description: 'Initial meeting for the Phoenix Project',
    dateRange: { from: addDays(today, 3), to: addDays(today, 3) }, // 3 days from now
    startTime: '13:00',
    endTime: '14:00',
    attendees: ['Robert', 'Jennifer', 'David K'],
    status: 'scheduled'
  },
   {
    id: 'appt-9',
    title: 'Client Check-in - Gamma LLC',
    host: 'Robert Chen',
    location: 'Online',
    description: 'Quarterly check-in with Gamma LLC',
    dateRange: { from: addDays(today, 7), to: addDays(today, 7) }, // 1 week from now
    startTime: '10:00',
    endTime: '10:45',
    attendees: ['client@gamma.com'],
    status: 'scheduled'
  },
  // --- Canceled Appointments ---
  {
    id: 'appt-5',
    title: 'Company Retreat Planning (Canceled)',
    host: 'Sophia Garcia',
    location: 'Conference Room Main',
    description: 'Finalize retreat details - Postponed',
    dateRange: { from: addDays(today, 1), to: addDays(today, 1) }, // Was tomorrow
    startTime: '14:00',
    endTime: '15:30',
    attendees: ['Robert', 'Jennifer'],
    status: 'canceled'
  },
  {
    id: 'appt-10',
    title: 'Supplier Meeting (Canceled)',
    host: 'David Kim',
    location: 'Meeting Room 2',
    description: 'Meeting with packaging supplier - Rescheduled',
    dateRange: { from: subDays(today, 2), to: subDays(today, 2) }, // Was 2 days ago
    startTime: '10:00',
    endTime: '11:00',
    attendees: ['supplier@example.com'],
    status: 'canceled'
  },
];

// Type for ViewMode
type ViewMode = 'month' | 'day' | 'list' | 'week';

// Function to generate time slots
const generateTimeSlots = (startHour: number, endHour: number, interval: number = 60) => {
  const slots = [];
  let currentTime = new Date();
  currentTime.setHours(startHour, 0, 0, 0); // Start at the beginning of the hour

  const endTime = new Date();
  endTime.setHours(endHour, 0, 0, 0); // End at the beginning of the hour

  while (currentTime <= endTime) {
    slots.push(format(currentTime, 'h:mm a'));
    currentTime.setMinutes(currentTime.getMinutes() + interval);
  }
  return slots;
};

const AppointmentView: React.FC = () => {
  // Placeholder data - replace with actual state and logic
  // const currentMonth = "April 2023"; // Remove hardcoded month string
  // const today = 1; // Remove hardcoded day

  // State for the modal
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const initialAppointmentState: AppointmentData = {
    id: '',
    title: '',
    host: '',
    location: '',
    description: '',
    dateRange: undefined,
    startTime: '',
    endTime: '',
    attendees: [],
    status: 'scheduled',
  };
  const [newAppointmentData, setNewAppointmentData] = useState<AppointmentData>(initialAppointmentState);
  const [appointments, setAppointments] = useState<AppointmentData[]>(sampleAppointments);
  const [activeAppointmentFilter, setActiveAppointmentFilter] = useState<'all' | 'upcoming' | 'completed' | 'canceled'>('all');
  const [editingAppointment, setEditingAppointment] = useState<AppointmentData | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('day'); // Default to day view
  const [currentDisplayDate, setCurrentDisplayDate] = useState(new Date()); // State for displayed day/week/month
  const [searchQuery, setSearchQuery] = useState(''); // State for search

  // --- Modal Handlers --- 
  const handleAppointmentFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewAppointmentData(prev => ({ ...prev, [id]: value }));
  };

  const handleAppointmentSelectChange = (value: string, field: keyof AppointmentData) => {
    setNewAppointmentData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleDateRangeChange = (range: DateRange | undefined) => {
     setNewAppointmentData(prev => ({ ...prev, dateRange: range }));
  };

  // Basic placeholder for creating/updating the appointment
  const handleAppointmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAppointment) {
      // Update logic
      console.log("Updating Appointment:", newAppointmentData);
      setAppointments(prev => prev.map(appt => 
        appt.id === editingAppointment.id ? { ...newAppointmentData, id: appt.id } : appt
      ));
      // TODO: Add API call for update
    } else {
      // Create logic
      console.log("Creating Appointment:", newAppointmentData);
      const newId = `appt-${Date.now()}`;
      const appointmentToAdd: AppointmentData = { 
        ...newAppointmentData, 
        id: newId, 
        status: 'scheduled' // Default status for new
      };
      setAppointments(prev => [...prev, appointmentToAdd]);
      // TODO: Add API call for create
    }
    setIsAppointmentModalOpen(false); // Close modal on submit
    // Resetting form state happens in onOpenChange
  };
  
  // Handler to open modal for editing
  const handleEditAppointment = (appointment: AppointmentData) => {
    setEditingAppointment(appointment);
    setIsAppointmentModalOpen(true);
  };

  // Placeholder host options
  const hostOptions = ["Alice Smith", "Robert Chen", "Jennifer Lee"];

  // --- Navigation Handlers ---
  const goToToday = () => {
    // setCurrentDisplayMonth(startOfMonth(new Date()));
    setCurrentDisplayDate(new Date());
  };

  // --- Filtering Logic ---
  const filteredAppointments = useMemo(() => {
    let filtered = appointments.filter(appt => appt.status === activeAppointmentFilter);

    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(appt => 
        appt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appt.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appt.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (appt.attendees && appt.attendees.some(att => att.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    }
    
    // Further filter based on the current view (Day/Week/Month)
    if (viewMode === 'day') {
        filtered = filtered.filter(appt => 
            appt.dateRange?.from && isSameDay(appt.dateRange.from, currentDisplayDate)
        );
    } else if (viewMode === 'month') {
        const monthStart = startOfMonth(currentDisplayDate);
        const monthEnd = endOfMonth(currentDisplayDate);
        filtered = filtered.filter(appt => 
            appt.dateRange?.from && appt.dateRange.from >= monthStart && appt.dateRange.from <= monthEnd
        );
    } else if (viewMode === 'week') {
        const weekStart = startOfWeek(currentDisplayDate, { weekStartsOn: 1 }); // Assuming week starts on Monday
        const weekEnd = endOfWeek(currentDisplayDate, { weekStartsOn: 1 });
        filtered = filtered.filter(appt => 
            appt.dateRange?.from && appt.dateRange.from >= weekStart && appt.dateRange.from <= weekEnd
        );
    } // List view shows all filtered appointments regardless of date range in the current view

    return filtered;
  }, [appointments, activeAppointmentFilter, searchQuery, viewMode, currentDisplayDate]);

  // --- Week View Specific Logic ---
  const weekDays = useMemo(() => {
    const weekStartsOn = 1; // Start week on Monday
    const start = startOfWeek(currentDisplayDate, { weekStartsOn });
    const end = endOfWeek(currentDisplayDate, { weekStartsOn });
    return eachDayOfInterval({ start, end });
  }, [currentDisplayDate]);

  // --- Month View Specific Logic ---
  const monthDays = useMemo(() => {
    const start = startOfMonth(currentDisplayDate);
    const end = endOfMonth(currentDisplayDate);
    const daysInMonth = getDaysInMonth(currentDisplayDate);
    const startDayOfWeek = getDay(start); // 0 = Sunday, 1 = Monday...

    const days = [];
    // Add days from previous month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ date: null, isCurrentMonth: false });
    }
    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(currentDisplayDate.getFullYear(), currentDisplayDate.getMonth(), i), isCurrentMonth: true });
    }
    // Add days from next month if needed to complete the grid
    const remainingSlots = 35 - days.length; // Assuming a 5-row grid, adjust if needed
    const nextMonthStart = addMonths(start, 1);
    for (let i = 1; i <= remainingSlots && days.length < 42; i++) { // Allow up to 6 rows
       days.push({ date: new Date(nextMonthStart.getFullYear(), nextMonthStart.getMonth(), i), isCurrentMonth: false });
    }

    return days;
  }, [currentDisplayDate]);
  
  // Day View Time Slots (8 AM to 5 PM)
  const dayTimeSlots = useMemo(() => generateTimeSlots(8, 17), []); // 8 AM to 5 PM (17:00)

  // Get appointments for a specific time slot in Day View
  const getAppointmentsForSlot = (timeSlot: string) => {
    return filteredAppointments.filter(appt => {
      if (!appt.dateRange?.from || !isSameDay(appt.dateRange.from, currentDisplayDate)) {
        return false;
      }
      // Basic check if start time matches the slot - refine if needed for overlapping
      return appt.startTime === timeSlot.replace(/ AM| PM/, ''); // Match "HH:MM" format
    });
  };

  // --- useEffect to update form data when editing --- 
  useEffect(() => {
    if (editingAppointment) {
        setNewAppointmentData({
            ...editingAppointment,
            dateRange: editingAppointment.dateRange ? {
                from: editingAppointment.dateRange.from ? new Date(editingAppointment.dateRange.from) : undefined,
                to: editingAppointment.dateRange.to ? new Date(editingAppointment.dateRange.to) : undefined
            } : undefined
        });
    } else {
        setNewAppointmentData(initialAppointmentState);
    }
  }, [editingAppointment]);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Restore original Tabs and View Options Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 border border-gray-200 dark:border-gray-700">
         <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
           <div className="overflow-x-auto">
             <div className="flex border-b border-gray-200 dark:border-gray-700">
               {/* Update buttons to set filter state */}
               <button 
                 className={cn("px-4 py-2 font-medium whitespace-nowrap", activeAppointmentFilter === 'all' ? 'text-primary border-b-2 border-primary' : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white border-b-2 border-transparent')}
                 onClick={() => setActiveAppointmentFilter('all')}
               >
                 All Appointments
               </button>
               <button 
                 className={cn("px-4 py-2 font-medium whitespace-nowrap", activeAppointmentFilter === 'upcoming' ? 'text-primary border-b-2 border-primary' : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white border-b-2 border-transparent')}
                 onClick={() => setActiveAppointmentFilter('upcoming')}
               >
                 Upcoming
               </button>
               <button 
                 className={cn("px-4 py-2 font-medium whitespace-nowrap", activeAppointmentFilter === 'completed' ? 'text-primary border-b-2 border-primary' : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white border-b-2 border-transparent')}
                 onClick={() => setActiveAppointmentFilter('completed')}
               >
                 Completed
               </button>
               <button // Restored original class attribute
                 className={cn("px-4 py-2 font-medium whitespace-nowrap", activeAppointmentFilter === 'canceled' ? 'text-primary border-b-2 border-primary' : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white border-b-2 border-transparent')}
                 onClick={() => setActiveAppointmentFilter('canceled')}
               >
                 Canceled
               </button>
             </div>
           </div>
           <div className="flex items-center gap-2">
             {/* Search Input */}
             <div className="relative">
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
               <Input 
                 type="text" 
                 placeholder="Search appointments..." 
                 className="pl-9 w-full md:w-64 h-9" // Restored original width
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
             </div>
             {/* View Switcher Buttons */}
             <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
               <Button 
                  variant={viewMode === "day" ? "default" : "ghost"} // Restored original variant logic
                  size="sm" 
                  onClick={() => setViewMode('day')} 
                  className="rounded-none border-r border-gray-300 dark:border-gray-600">
                 <CalendarDays className="h-4 w-4" /> {/* Restored original icon margin */}
                 <span className="ml-1 hidden sm:inline">Day</span>
               </Button>
               {/* Week Button Placeholder */}
               <Button 
                  variant={viewMode === "week" ? "default" : "ghost"} 
                  size="sm" 
                  onClick={() => setViewMode('week')} 
                  className="rounded-none border-r border-gray-300 dark:border-gray-600">
                 <CalendarRange className="h-4 w-4" /> {/* Restored original icon margin & removed text */}
               </Button>
               <Button 
                  variant={viewMode === "month" ? "default" : "ghost"} 
                  size="sm" 
                  onClick={() => setViewMode('month')} 
                  className="rounded-none border-r border-gray-300 dark:border-gray-600">
                 <Calendar className="h-4 w-4" /> {/* Restored original icon margin */}
                 <span className="ml-1 hidden sm:inline">Month</span>
               </Button>
               <Button 
                  variant={viewMode === "list" ? "default" : "ghost"} 
                  size="sm" 
                  onClick={() => setViewMode('list')} 
                  className="rounded-none"> {/* Restored original class */}
                 <List className="h-4 w-4" /> {/* Restored original icon margin & removed text */}
               </Button>
             </div>
             {/* New Appointment Button */}
             <Button 
               className="bg-primary text-white hover:bg-primary/90 flex items-center" 
               size="sm"
               onClick={() => {
                 setEditingAppointment(null); // Ensure we are creating
                 setIsAppointmentModalOpen(true);
               }} 
             >
               <Plus className="mr-2 h-4 w-4" />
               <span>New Appointment</span>
             </Button>
             {/* Today button - now primarily for quick jump to Today in Day view */}
             {viewMode !== 'day' && ( // Restore original Today button position
               <Button 
                  variant="outline" 
                  size="sm"
                  onClick={goToToday} 
                >
                  Today
                </Button>
             )}
           </div>
         </div>
       </div>

      {/* Calendar View Section - Container */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 border border-gray-200 dark:border-gray-700">
        {/* Header for Calendar/Day View - Restored */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Month Navigation */}
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentDisplayDate(viewMode === 'month' ? subMonths(currentDisplayDate, 1) : subDays(currentDisplayDate, viewMode === 'week' ? 7 : 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-semibold">{format(currentDisplayDate, 'MMMM yyyy')}</h3> {/* Restored original format */}
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentDisplayDate(viewMode === 'month' ? addMonths(currentDisplayDate, 1) : addDays(currentDisplayDate, viewMode === 'week' ? 7 : 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          {/* Action Buttons - Restored original Print/Export */} 
          <div className="flex items-center space-x-2">
            {/* Hide Print/Export in Day view for now */}
            {viewMode !== 'day' && (
              <>
                <Button variant="outline" size="sm">
                  <Printer className="mr-1 h-4 w-4" /> Print
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-1 h-4 w-4" /> Export
                </Button>
              </>
            )}
          </div>
        </div>
        {/* --- End Header --- */} 

        {/* --- Conditional Views --- */} 
        {viewMode === 'month' && (
          <div>
             {/* Header for days of the week */}
             <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
               {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
             </div>
             {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((dayInfo, index) => {
                 const dayNumber = dayInfo.date ? getDate(dayInfo.date) : null;
                 const isCurrentMonth = dayInfo.isCurrentMonth;
                 const isToday = dayInfo.date && isSameDay(dayInfo.date, new Date());
                 
                 // Filter appointments for THIS specific day
                 const dayAppointments = dayInfo.date ? filteredAppointments.filter(appt => 
                   appt.dateRange?.from && isSameDay(new Date(appt.dateRange.from), dayInfo.date as Date)
                 ) : [];

                return (
                  <div 
                    key={index} 
                    className={`calendar-day p-1 flex flex-col ${ isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500'} ${isToday ? 'bg-red-50 dark:bg-red-900/30' : ''}`}
                    style={{ minHeight: '120px' }}
                  >
                    <div className={`text-right p-1 text-xs ${isToday ? 'font-bold text-primary' : ''}`}>
                      {dayNumber}
                    </div>
                    {isCurrentMonth && dayAppointments.length > 0 && (
                      <div className="mt-1 space-y-1 overflow-hidden flex-grow">
                        {dayAppointments.map(appt => (
                           <button 
                              key={appt.id}
                              onClick={() => handleEditAppointment(appt)} 
                              className={cn(
                                "w-full text-left text-[10px] sm:text-xs p-1 rounded truncate block",
                                appt.status === 'scheduled' && "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200",
                                appt.status === 'completed' && "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200",
                                appt.status === 'canceled' && "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 line-through opacity-70"
                              )}
                              title={appt.title}
                            >
                              {appt.startTime ? `${format(new Date(`1970-01-01T${appt.startTime}`), 'h:mm a')} ` : ''}{appt.title}
                            </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === 'day' && (
          <div> {/* Container for Day View */} 
             {/* Day View Header (Optional) */}
             {/* <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
               <h3 className="text-lg font-semibold">Today's Appointments</h3>
              <Button variant="outline" size="sm">
                <Plus className="mr-1 h-4 w-4" /> Add Time Block
               </Button>
             </div> */} 
             <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
              <div className="grid grid-cols-1 divide-y divide-gray-200 dark:divide-gray-700">
                {/* Time Slot Rendering Logic - Filter from already filteredAppointments */} 
                 {dayTimeSlots.map((slot, index) => {
                    const today = new Date();
                    // Filter the already filtered list for today
                    const todaysAppointments = filteredAppointments.filter(appt => 
                        appt.dateRange?.from && isSameDay(new Date(appt.dateRange.from), today) &&
                        appt.status !== 'canceled'
                    );
                    // Filter for the current time slot
                    const slotAppointments = todaysAppointments.filter(appt => 
                         appt.startTime && appt.startTime.startsWith(slot.split(':')[0]) // Basic match
                    );
                    
                   return (
                      <div key={slot} className="time-slot relative flex" style={{ minHeight: '60px' }}>
                        <div className="w-20 flex-shrink-0 h-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                          {slot}
                        </div>
                        <div className="flex-grow h-full p-2 space-y-2">
                          {slotAppointments.map(appt => (
                             <div key={appt.id} className="appointment-card bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 p-2 sm:p-3 rounded-md shadow-sm cursor-pointer" onClick={() => handleEditAppointment(appt)}>
                               <div className="flex justify-between items-start gap-2">
                                 <div>
                                   <h4 className="font-medium text-blue-800 dark:text-blue-200 text-sm sm:text-base">{appt.title}</h4>
                                   <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-300">{appt.location}</p>
                                 </div>
                                 <div className="flex space-x-1 flex-shrink-0">
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-blue-500 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900">
                                      <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-blue-500 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900">
                                      <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </Button>
                                  </div>
                               </div>
                               <div className="flex items-center mt-1 text-xs sm:text-sm flex-wrap gap-x-3">
                                 <div className="flex items-center text-blue-700 dark:text-blue-300">
                                   <Clock className="mr-1 h-3 w-3" />
                                   <span>{appt.startTime ? format(new Date(`1970-01-01T${appt.startTime}`), 'h:mm a') : ''} - {appt.endTime ? format(new Date(`1970-01-01T${appt.endTime}`), 'h:mm a') : ''}</span>
                                 </div>
                                 <div className="flex items-center text-blue-700 dark:text-blue-300">
                                   <User className="mr-1 h-3 w-3" />
                                   <span>{appt.host}</span>
                                 </div>
                               </div>
                             </div>
                           ))}
                           {slot === '12:00 PM' && slotAppointments.length === 0 && (
                             <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-4 h-full flex items-center justify-center">
                              <Utensils className="mr-1 h-4 w-4" /> Lunch
                             </div>
                           )}
                        </div>
                      </div>
                   );
                  })}
              </div>
            </div>
          </div> 
        )}

        {/* --- List View Implementation --- */}
        {viewMode === 'list' && (
          <div className="space-y-4"> {/* Use space-y for vertical spacing */}
            {filteredAppointments
              .sort((a, b) => { // Sort appointments chronologically
                const dateA = a.dateRange?.from ? new Date(a.dateRange.from).getTime() : 0;
                const dateB = b.dateRange?.from ? new Date(b.dateRange.from).getTime() : 0;
                if (dateA !== dateB) return dateA - dateB;
                // If dates are the same, sort by start time
                const timeA = a.startTime ? a.startTime.replace(':', '') : '0';
                const timeB = b.startTime ? b.startTime.replace(':', '') : '0';
                return parseInt(timeA) - parseInt(timeB);
              })
              .map(appt => (
                 <div 
                    key={appt.id} 
                    className={cn(
                      "appointment-list-item flex flex-col sm:flex-row justify-between items-start gap-4 p-4 border rounded-lg shadow-sm",
                      appt.status === 'scheduled' && "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800/50",
                      appt.status === 'completed' && "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800/50",
                      appt.status === 'canceled' && "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800/50 opacity-80"
                    )}
                 >
                    <div className="flex-grow space-y-1">
                       <h4 className={cn(
                          "font-semibold text-base sm:text-lg",
                          appt.status === 'scheduled' && "text-blue-800 dark:text-blue-200",
                          appt.status === 'completed' && "text-green-800 dark:text-green-200",
                          appt.status === 'canceled' && "text-red-800 dark:text-red-200 line-through"
                       )}>
                         {appt.title}
                       </h4>
                       <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex-wrap gap-x-3 gap-y-1">
                         {appt.dateRange?.from && (
                           <div className="flex items-center">
                             <CalendarDays className="mr-1 h-3.5 w-3.5" /> 
                             <span>{format(new Date(appt.dateRange.from), 'EEE, MMM d, yyyy')}</span>
                           </div>
                         )}
                         {(appt.startTime || appt.endTime) && (
                            <div className="flex items-center">
                              <Clock className="mr-1 h-3.5 w-3.5" />
                              <span>
                                {appt.startTime ? format(new Date(`1970-01-01T${appt.startTime}`), 'h:mm a') : ''}
                                {appt.startTime && appt.endTime ? ' - ' : ''}
                                {appt.endTime ? format(new Date(`1970-01-01T${appt.endTime}`), 'h:mm a') : ''}
                              </span>
                            </div>
                         )}
                         {appt.host && (
                           <div className="flex items-center">
                             <User className="mr-1 h-3.5 w-3.5" />
                             <span>{appt.host}</span>
                           </div>
                         )}
                         {appt.location && (
                           <div className="flex items-center">
                             <MapPin className="mr-1 h-3.5 w-3.5" />
                             <span>{appt.location}</span>
                           </div>
                         )}
                       </div>
                       {appt.description && (
                         <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 pt-1">{appt.description}</p>
                       )}
                       {/* Display attendees if needed */}
                       {/* {appt.attendees && appt.attendees.length > 0 && (
                         <div className="flex flex-wrap gap-1 pt-1">
                           <span className="text-xs text-gray-500">Attendees:</span>
                           {appt.attendees.map((attendee, i) => (
                             <Badge key={i} variant="secondary" className="text-xs">{attendee}</Badge>
                           ))}
                         </div>
                       )} */} 
                    </div>
                    {/* Action Buttons */} 
                     <div className="flex space-x-1 flex-shrink-0 self-start sm:self-center">
                        <Button 
                           variant="ghost" 
                           size="icon" 
                           className="h-7 w-7 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                           onClick={() => handleEditAppointment(appt)} 
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {/* Add more actions like delete or view details if needed */}
                        {/* <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50">
                          <Trash2 className="h-4 w-4" />
                        </Button> */} 
                      </div>
                 </div>
              ))
            }
             {/* Optional: Message if no appointments match filters */}
             {filteredAppointments.length === 0 && (
                <div className="text-center p-10 text-gray-500 dark:text-gray-400">
                  No appointments found matching your criteria.
                </div>
             )}
          </div>
        )}
        {/* --- Week View Implementation --- */}
        {viewMode === 'week' && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            {/* Header for days of the week */}
            <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-900 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
              {weekDays.map(day => (
                <div key={day.toISOString()} className="py-2 border-b border-r border-gray-200 dark:border-gray-700">
                  <div>{format(day, 'EEE')}</div> {/* Short day name: Mon */} 
                  <div className={`text-lg font-semibold ${isSameDay(day, new Date()) ? 'text-primary' : 'text-gray-800 dark:text-gray-200'}`}>
                    {format(day, 'd')} {/* Day number */} 
                  </div>
                </div>
              ))}
            </div>
            {/* Week grid content area */}
            <div className="grid grid-cols-7 min-h-[500px]"> {/* Ensure minimum height */}
              {weekDays.map((day, index) => {
                const isToday = isSameDay(day, new Date());
                // Filter appointments for THIS specific day within the week
                const dayAppointments = filteredAppointments.filter(appt => 
                  appt.dateRange?.from && isSameDay(new Date(appt.dateRange.from), day)
                );

                return (
                  <div 
                    key={day.toISOString()} 
                    className={`week-day-column p-1 border-r border-gray-200 dark:border-gray-700 ${isToday ? 'bg-red-50 dark:bg-red-900/20' : 'bg-white dark:bg-gray-800'}`}
                    style={{ minHeight: '100px' }} // Minimum height for each day cell
                  >
                    <div className="mt-1 space-y-1 overflow-auto h-full"> {/* Allow scrolling within day */}
                      {dayAppointments.length > 0 ? (
                        dayAppointments.map(appt => (
                          <button 
                            key={appt.id}
                            onClick={() => handleEditAppointment(appt)} 
                            className={cn(
                              "w-full text-left text-[10px] sm:text-xs p-1 rounded truncate block mb-1",
                              appt.status === 'scheduled' && "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200",
                              appt.status === 'completed' && "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200",
                              appt.status === 'canceled' && "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 line-through opacity-70"
                            )}
                            title={`${appt.title} at ${appt.startTime}`}
                          >
                            {appt.startTime ? `${format(new Date(`1970-01-01T${appt.startTime}`), 'h:mma')} ` : ''}{appt.title}
                          </button>
                        ))
                      ) : (
                        <div className="text-xs text-center text-gray-400 dark:text-gray-500 pt-4"></div> // Empty state for the day
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* --- End Conditional Views --- */}
      </div> 

      {/* --- Add/Edit Appointment Modal --- */}
      <Dialog open={isAppointmentModalOpen} onOpenChange={(isOpen) => {
        if (!isOpen) {
          // Reset both editing state and form data on close
          setEditingAppointment(null); 
          setNewAppointmentData(initialAppointmentState); 
        }
        setIsAppointmentModalOpen(isOpen);
      }}>
        <DialogContent className="sm:max-w-2xl p-0 flex flex-col max-h-[90vh]">
          <DialogHeader className="p-6 pb-4 border-b border-gray-200 dark:border-gray-700/50 flex-shrink-0">
            {/* Update title based on editing state */}
            <DialogTitle className="text-2xl font-semibold">
              {editingAppointment ? 'Edit Appointment' : 'Create New Appointment'}
            </DialogTitle>
            <DialogDescription>
              {editingAppointment ? 'Update the appointment details.' : 'Fill in the details for the new appointment.'}
            </DialogDescription>
          </DialogHeader>
          
          {/* Update onSubmit handler */}
          <form onSubmit={handleAppointmentSubmit} id="appointment-form" className="flex-grow overflow-y-auto px-6 pt-4">
             {/* Form content remains largely the same, but useEffect will handle pre-filling */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 pb-4">
              {/* Form Fields - Adapted from Visitor Management */}
              <div className="sm:col-span-2 space-y-1">
                <Label htmlFor="title">Appointment Title*</Label>
                <Input 
                  id="title" 
                  placeholder="e.g., Project Kickoff Meeting" 
                  value={newAppointmentData.title} 
                  onChange={handleAppointmentFormChange} 
                  className="py-3 px-4 rounded-lg" 
                  required 
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="host">Host*</Label>
                 <Select value={newAppointmentData.host} onValueChange={(value) => handleAppointmentSelectChange(value, 'host')}>
                    <SelectTrigger id="host" className="py-3 px-4 rounded-lg">
                      <SelectValue placeholder="Select a host" />
                    </SelectTrigger>
                    <SelectContent>
                      {hostOptions.map(host => (
                        <SelectItem key={host} value={host}>{host}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>
              
               <div className="space-y-1">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  placeholder="e.g., Conference Room B" 
                  value={newAppointmentData.location} 
                  onChange={handleAppointmentFormChange} 
                  className="py-3 px-4 rounded-lg" 
                />
              </div>
              
               <div className="sm:col-span-2 space-y-1">
                <Label htmlFor="dateRange">Date Range*</Label>
                <DateRangePicker
                  id="dateRange"
                  selectedRange={newAppointmentData.dateRange}
                  onSelectRange={handleDateRangeChange}
                  placeholder="Pick a date range"
                  numberOfMonths={2}
                  className="py-3 px-4 rounded-lg"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="startTime">Start Time*</Label>
                <Input 
                  id="startTime" 
                  type="time" 
                  value={newAppointmentData.startTime} 
                  onChange={handleAppointmentFormChange} 
                  className="py-3 px-4 rounded-lg" 
                  required 
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="endTime">End Time*</Label>
                <Input 
                  id="endTime" 
                  type="time" 
                  value={newAppointmentData.endTime} 
                  onChange={handleAppointmentFormChange} 
                  className="py-3 px-4 rounded-lg" 
                  required 
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <Label htmlFor="description">Description / Agenda</Label>
                <Textarea 
                  id="description" 
                  placeholder="Add details about the appointment..." 
                  value={newAppointmentData.description} 
                  onChange={handleAppointmentFormChange} 
                  className="py-3 px-4 rounded-lg" 
                  rows={4}
                />
              </div>
              
              {/* Placeholder for Attendees - needs more complex implementation */}
              <div className="sm:col-span-2 space-y-1">
                <Label htmlFor="attendees">Attendees</Label>
                <Input 
                  id="attendees-input" // Temp ID, not linked to state directly
                  placeholder="Add attendees (e.g., email addresses - comma separated)" 
                  className="py-3 px-4 rounded-lg" 
                  // Basic handling - needs proper parsing/state update
                  // value={newAppointmentData.attendees.join(', ')}
                  // onChange={(e) => handleAppointmentSelectChange(e.target.value.split(',').map(s => s.trim()), 'attendees')} 
                />
                {/* Display added attendees below (simplified) - Uses Badge */}
                {newAppointmentData.attendees.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {newAppointmentData.attendees.map((attendee, index) => (
                       <Badge key={index} variant="secondary">{attendee}</Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Status dropdown (optional for edit) */}
              {editingAppointment && (
                 <div className="sm:col-span-2 space-y-1">
                   <Label htmlFor="status">Status</Label>
                   <Select 
                     value={newAppointmentData.status}
                     onValueChange={(value) => handleAppointmentSelectChange(value as AppointmentData['status'], 'status')}
                   >
                     <SelectTrigger id="status" className="py-3 px-4 rounded-lg">
                       <SelectValue placeholder="Select status" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="scheduled">Scheduled</SelectItem>
                       <SelectItem value="completed">Completed</SelectItem>
                       <SelectItem value="canceled">Canceled</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
               )}
            </div>
          </form>

          <DialogFooter className="px-6 py-4 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-700/50 flex-shrink-0">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsAppointmentModalOpen(false)} 
              className="px-6 py-2 rounded-lg"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              form="appointment-form" 
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg"
            >
              {/* Update button text based on editing state */}
              {editingAppointment ? 'Save Changes' : 'Create Appointment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentView; 
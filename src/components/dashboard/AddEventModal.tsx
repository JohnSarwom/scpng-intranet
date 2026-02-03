import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Clock, MapPin, Users, Video, X, Loader2, Plus } from 'lucide-react';
import { useMsal } from '@azure/msal-react';
import { createCalendarEvent, updateCalendarEvent, CreateEventInput, CalendarEvent } from '@/services/calendarService';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface AddEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventCreated?: () => void;
  eventToEdit?: CalendarEvent | null;
}

const AddEventModal: React.FC<AddEventModalProps> = ({
  open,
  onOpenChange,
  onEventCreated,
  eventToEdit,
}) => {
  const { instance: msalInstance } = useMsal();
  const { toast } = useToast();

  // Form state
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [isOnlineMeeting, setIsOnlineMeeting] = useState(false);
  const [attendeeInput, setAttendeeInput] = useState('');
  const [attendees, setAttendees] = useState<Array<{ email: string; type: 'required' | 'optional' }>>([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  // Populate form when eventToEdit changes
  React.useEffect(() => {
    if (eventToEdit) {
      setSubject(eventToEdit.subject);
      setDescription(eventToEdit.bodyPreview || '');

      // Parse dates (assuming they are in local time as returned by the service now)
      const start = new Date(eventToEdit.start.dateTime);
      const end = new Date(eventToEdit.end.dateTime);

      setStartDate(format(start, 'yyyy-MM-dd'));
      setStartTime(format(start, 'HH:mm'));
      setEndDate(format(end, 'yyyy-MM-dd'));
      setEndTime(format(end, 'HH:mm'));

      setLocation(eventToEdit.location?.displayName || '');
      setIsAllDay(eventToEdit.isAllDay);

      // Map attendees
      if (eventToEdit.attendees) {
        setAttendees(eventToEdit.attendees.map(a => ({
          email: a.emailAddress.address,
          type: a.type as 'required' | 'optional'
        })));
      }

      // Map categories
      if (eventToEdit.categories && eventToEdit.categories.length > 0) {
        setCategory(eventToEdit.categories[0]);
      }
    } else {
      resetForm();
    }
  }, [eventToEdit, open]);

  const resetForm = () => {
    setSubject('');
    setDescription('');
    setStartDate('');
    setStartTime('');
    setEndDate('');
    setEndTime('');
    setLocation('');
    setIsAllDay(false);
    setIsOnlineMeeting(false);
    setAttendeeInput('');
    setAttendees([]);
    setCategory('');
  };

  const addAttendee = () => {
    if (attendeeInput.trim() && attendeeInput.includes('@')) {
      setAttendees([...attendees, { email: attendeeInput.trim(), type: 'required' }]);
      setAttendeeInput('');
    } else {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
    }
  };

  const removeAttendee = (index: number) => {
    setAttendees(attendees.filter((_, i) => i !== index));
  };

  const toggleAttendeeType = (index: number) => {
    const newAttendees = [...attendees];
    newAttendees[index].type = newAttendees[index].type === 'required' ? 'optional' : 'required';
    setAttendees(newAttendees);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim()) {
      toast({
        title: 'Subject Required',
        description: 'Please enter an event subject',
        variant: 'destructive',
      });
      return;
    }

    if (!startDate || (!isAllDay && !startTime)) {
      toast({
        title: 'Start Time Required',
        description: 'Please enter a start date and time',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Get user's timezone
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Format start date/time
      let startDateTime: string;
      if (isAllDay) {
        startDateTime = `${startDate}T00:00:00`;
      } else {
        startDateTime = `${startDate}T${startTime}:00`;
      }

      // Format end date/time
      let endDateTime: string;
      if (isAllDay) {
        const effectiveEndDate = endDate || startDate;
        endDateTime = `${effectiveEndDate}T23:59:59`;
      } else {
        const effectiveEndDate = endDate || startDate;
        const effectiveEndTime = endTime || startTime;
        endDateTime = `${effectiveEndDate}T${effectiveEndTime}:00`;
      }

      // Build event data
      const eventData: CreateEventInput = {
        subject: subject.trim(),
        start: {
          dateTime: startDateTime,
          timeZone: timeZone,
        },
        end: {
          dateTime: endDateTime,
          timeZone: timeZone,
        },
        isAllDay: isAllDay,
      };

      // Add optional fields
      if (description.trim()) {
        eventData.body = {
          contentType: 'Text',
          content: description.trim(),
        };
      }

      if (location.trim()) {
        eventData.location = {
          displayName: location.trim(),
        };
      }

      if (attendees.length > 0) {
        eventData.attendees = attendees.map(att => ({
          emailAddress: {
            address: att.email,
          },
          type: att.type,
        }));
      }

      if (category.trim()) {
        eventData.categories = [category.trim()];
      }

      if (isOnlineMeeting) {
        eventData.isOnlineMeeting = true;
        eventData.onlineMeetingProvider = 'teamsForBusiness';
      }

      if (eventToEdit) {
        await updateCalendarEvent(msalInstance, eventToEdit.id, eventData);
        toast({
          title: 'Event Updated',
          description: 'Your calendar event has been updated successfully',
        });
      } else {
        await createCalendarEvent(msalInstance, eventData);
        toast({
          title: 'Event Created',
          description: 'Your calendar event has been created successfully',
        });
      }

      resetForm();
      onOpenChange(false);

      // Notify parent to refresh events
      if (onEventCreated) {
        onEventCreated();
      }
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: `Failed to ${eventToEdit ? 'Update' : 'Create'} Event`,
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{eventToEdit ? 'Edit Event' : 'Create New Event'}</DialogTitle>
          <DialogDescription>
            {eventToEdit ? 'Update your event details' : 'Add a new event to your Microsoft 365 calendar'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="required">Subject *</Label>
            <Input
              id="subject"
              placeholder="Event title"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Event details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <Label htmlFor="allDay" className="cursor-pointer mb-0">All Day Event</Label>
            </div>
            <Switch
              id="allDay"
              checked={isAllDay}
              onCheckedChange={setIsAllDay}
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            {!isAllDay && (
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required={!isAllDay}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
              />
            </div>

            {!isAllDay && (
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="location"
                placeholder="Meeting room or address"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Online Meeting Toggle */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-gray-500" />
              <Label htmlFor="onlineMeeting" className="cursor-pointer mb-0">Teams Meeting</Label>
            </div>
            <Switch
              id="onlineMeeting"
              checked={isOnlineMeeting}
              onCheckedChange={setIsOnlineMeeting}
            />
          </div>

          {/* Attendees */}
          <div className="space-y-2">
            <Label>Attendees</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Email address"
                  value={attendeeInput}
                  onChange={(e) => setAttendeeInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addAttendee();
                    }
                  }}
                  className="pl-10"
                />
              </div>
              <Button type="button" onClick={addAttendee} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {attendees.length > 0 && (
              <div className="space-y-2 mt-3">
                {attendees.map((attendee, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                  >
                    <span className="text-sm">{attendee.email}</span>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={attendee.type === 'required' ? 'default' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() => toggleAttendeeType(index)}
                      >
                        {attendee.type}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttendee(index)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Meeting">Meeting</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="Personal">Personal</SelectItem>
                <SelectItem value="Training">Training</SelectItem>
                <SelectItem value="Project">Project</SelectItem>
                <SelectItem value="Client">Client</SelectItem>
                <SelectItem value="Review">Review</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                eventToEdit ? 'Update Event' : 'Create Event'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEventModal;

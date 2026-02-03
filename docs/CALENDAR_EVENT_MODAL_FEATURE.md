# Calendar Event Modal Feature

## Overview

Users can now click on any calendar event in the "MY SCHEDULED EVENTS" section to view detailed information in a beautiful, comprehensive modal dialog.

---

## How to Use

### Opening the Modal

1. Navigate to the **Home page**
2. Scroll to the **"MY SCHEDULED EVENTS"** section
3. **Click on any event card** in the list
4. The detailed event modal will open

### Modal Features

The modal displays comprehensive event information including:

#### 📅 Date & Time Information
- **Full date** - Day of week, month, date, year
- **Time range** - Start and end times
- **Duration** - Calculated duration (e.g., "1h 30m")
- **All-day badge** - For all-day events
- **Timezone** - Event timezone information

#### 📍 Location Details
- **Location name** - Meeting room, address, or virtual meeting link
- **Map integration** - "View on Map" button opens Google Maps

#### 👤 Organizer Information
- **Organizer name** - Person who created the event
- **Email address** - Clickable email link
- **Email organizer** - Quick email button

#### 👥 Attendee List
- **Attendee count** - Total number of participants
- **Attendee details** - Name, email, and type (required/optional)
- **Avatar initials** - Visual representation of attendees
- **Scrollable list** - For events with many attendees

#### 🏷️ Event Categories
- **Category tags** - Color-coded badges
- **Multiple categories** - Supports multiple event categories

#### ⚠️ Event Status
- **Cancellation notice** - Red banner for cancelled events
- **Status badges** - Visual indicators for event state

---

## Modal Actions

### Primary Actions

**Open in Outlook**
- Opens the event in Outlook Web or desktop app
- Full event details and response options
- Allows accepting/declining invitations

**Email Organizer**
- Opens default email client
- Pre-populated with organizer's email
- Quick way to ask questions or provide updates

**View on Map**
- Opens Google Maps with location search
- Helps attendees find physical meeting locations
- Works for addresses and venue names

---

## Technical Implementation

### Component Structure

**CalendarEventModal** ([CalendarEventModal.tsx](../src/components/dashboard/CalendarEventModal.tsx))
- Reusable modal component
- Accepts CalendarEvent object as prop
- Controlled open/close state
- Responsive design for mobile and desktop

### Integration

**ScheduledEvents Component** ([ScheduledEvents.tsx](../src/components/dashboard/ScheduledEvents.tsx))
- Added click handler to event cards
- State management for selected event
- Modal visibility control
- Prevented event bubbling on external link clicks

### Event Data

The modal displays data from the Microsoft Graph Calendar API:

```typescript
interface CalendarEvent {
  id: string;
  subject: string;              // Event title
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: {
    displayName: string;        // Meeting location
  };
  attendees?: Array<{
    emailAddress: {
      name: string;
      address: string;
    };
    type: string;              // required/optional
  }>;
  isAllDay: boolean;           // All-day event flag
  webLink: string;             // Outlook web link
  bodyPreview?: string;        // Event description
  organizer?: {
    emailAddress: {
      name: string;
      address: string;
    };
  };
  categories?: string[];       // Event categories
  isCancelled?: boolean;       // Cancellation status
}
```

---

## UI/UX Design

### Layout

**Header Section**
- Large, bold event title
- Event description preview
- Close button (top right)

**Content Sections**
- Organized with icons for visual clarity
- Separated by horizontal dividers
- Consistent spacing and typography
- Scrollable for long content

**Footer Section**
- Action buttons (primary and secondary)
- Event metadata (ID, timezone)
- Clean, accessible design

### Responsive Design

**Desktop (Large Screens)**
- Max width: 2xl (672px)
- Comfortable reading width
- All sections visible

**Mobile (Small Screens)**
- Full width with margins
- Vertical scrolling
- Touch-friendly buttons
- Responsive font sizes

### Colors & Styling

- **Primary color** - Intranet brand colors
- **Gray tones** - For secondary text
- **Status colors** - Red for cancelled, blue for links
- **Hover states** - Interactive feedback
- **Shadows** - Subtle depth

---

## Accessibility Features

✅ **Keyboard Navigation**
- Tab through focusable elements
- Escape key to close modal
- Enter to activate buttons

✅ **Screen Reader Support**
- Proper ARIA labels
- Semantic HTML structure
- Dialog role and descriptions

✅ **Visual Hierarchy**
- Clear headings
- Icon + text labels
- Color contrast compliance

---

## User Benefits

### Quick Information Access
- No need to open Outlook for basic details
- All event info in one glance
- Faster decision making

### Better Context
- See who's attending before joining
- Check location before leaving
- Verify time and duration

### Seamless Actions
- One-click to open full event
- Quick email to organizer
- Map lookup for locations

### Mobile Friendly
- Works on all devices
- Touch-optimized
- Responsive layout

---

## Examples

### Meeting Event Modal
```
Title: "Quarterly Business Review"
Date: Wednesday, December 4, 2025 • 2:00 PM
Duration: 2 hours
Location: Conference Room A
Organizer: John Smith (john.smith@company.com)
Attendees: 15 people
Categories: Business, Quarterly Review

[Open in Outlook] [Email Organizer] [View on Map]
```

### All-Day Event Modal
```
Title: "Annual Company Retreat"
Date: Friday, December 20, 2025 • All Day
Location: Beach Resort
Organizer: HR Department
Attendees: 50 people
Categories: Team Building, Annual Event

[Open in Outlook] [Email Organizer] [View on Map]
```

### Virtual Meeting Modal
```
Title: "Sprint Planning"
Date: Today • 10:00 AM - 11:00 AM
Duration: 1 hour
Location: Microsoft Teams Meeting
Organizer: Sarah Johnson
Attendees: 8 people
Categories: Development, Sprint

[Open in Outlook] [Email Organizer]
```

---

## Closing the Modal

The modal can be closed by:
- Clicking the **X** button (top right)
- Clicking **outside** the modal
- Pressing the **Escape** key
- Clicking any action button (after action completes)

---

## Future Enhancements

Potential improvements for the modal:

1. **Response Actions** - Accept/Decline/Tentative buttons
2. **Add to Calendar** - Export to other calendar apps
3. **Meeting Notes** - View/add notes for the event
4. **Join Meeting** - Direct link to Teams/Zoom meetings
5. **Related Events** - Show recurring event series
6. **Attachments** - View event attachments
7. **Edit Event** - Quick edit for organizers
8. **Share Event** - Share event details with others
9. **Reminders** - Set custom reminders
10. **Availability** - Show free/busy status

---

## Troubleshooting

### Modal Not Opening

**Check 1: Event Data**
- Ensure events are loading successfully
- Check browser console for errors

**Check 2: Click Handler**
- Verify onClick is attached to event cards
- Check for conflicting event handlers

**Check 3: State Management**
- Verify selectedEvent state is updating
- Check isModalOpen state changes

### Missing Information

**Check 1: API Permissions**
- Ensure proper Graph API scopes
- Verify event data includes all fields

**Check 2: Incomplete Events**
- Some events may not have all fields
- Modal gracefully handles missing data

### Styling Issues

**Check 1: CSS Loading**
- Verify Tailwind classes are applied
- Check for CSS conflicts

**Check 2: Responsive Layout**
- Test on different screen sizes
- Check mobile viewport

---

## Performance Considerations

✅ **Optimized Rendering**
- Modal only renders when open
- Event data passed by reference
- No unnecessary re-renders

✅ **Lazy Loading**
- Modal component loaded on-demand
- Minimal impact on initial page load

✅ **Smooth Animations**
- CSS transitions for open/close
- Hardware-accelerated animations

---

## Code Example

### Using the Modal in Your Component

```typescript
import CalendarEventModal from '@/components/dashboard/CalendarEventModal';
import { CalendarEvent } from '@/services/calendarService';

function MyComponent() {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  return (
    <>
      {/* Your event list */}
      <div onClick={() => handleEventClick(event)}>
        {event.subject}
      </div>

      {/* Modal */}
      <CalendarEventModal
        event={selectedEvent}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
}
```

---

## Summary

The Calendar Event Modal provides a rich, detailed view of calendar events without leaving the home page. It enhances the user experience by:

- **Reducing clicks** - No need to open Outlook for details
- **Improving context** - All information in one place
- **Enabling actions** - Quick email, map, and Outlook access
- **Supporting mobile** - Works seamlessly on all devices

Users can now efficiently manage their schedules directly from the intranet portal!

---

**Last Updated:** December 4, 2025
**Version:** 1.0.0
**Component:** CalendarEventModal
**Status:** ✅ Complete and Ready

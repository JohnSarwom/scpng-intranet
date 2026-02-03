# Add Calendar Event Feature

## Overview

Users can now create new calendar events directly from the Unitopia Hub home page without opening Outlook. The new "Add Event" button in the "MY SCHEDULED EVENTS" section opens a comprehensive event creation modal.

---

## Features

✅ **Quick Event Creation** - Create events without leaving the intranet
✅ **Full Event Details** - Subject, description, dates, times, location
✅ **Attendee Management** - Add and manage event attendees
✅ **Teams Integration** - Automatically create Teams meetings
✅ **All-Day Events** - Support for all-day events
✅ **Event Categories** - Organize events with categories
✅ **Auto-Refresh** - Event list updates after creation
✅ **Form Validation** - Prevents invalid event creation
✅ **User-Friendly** - Clean, intuitive interface

---

## How to Use

### Opening the Add Event Modal

1. Navigate to the **Home page**
2. Scroll to **"MY SCHEDULED EVENTS"** section
3. Click the **"Add Event"** button (top right, next to the date filter)
4. The event creation modal will open

### Creating an Event

#### Required Fields

**Subject*** (Required)
- Event title/name
- Example: "Team Meeting", "Client Presentation"

**Start Date*** (Required)
- Date when the event starts
- Calendar date picker

**Start Time*** (Required for non-all-day events)
- Time when the event starts
- 24-hour or 12-hour format

#### Optional Fields

**Description**
- Detailed event information
- Agenda, notes, or any relevant details
- Multi-line text area

**End Date**
- Date when the event ends
- Defaults to start date if not specified
- For multi-day events

**End Time**
- Time when the event ends
- Defaults to start time if not specified

**Location**
- Physical meeting location
- Meeting room name or address
- Example: "Conference Room A", "123 Main St"

**All Day Event Toggle**
- Switch to make this an all-day event
- Hides time pickers when enabled
- Useful for holidays, deadlines, etc.

**Teams Meeting Toggle**
- Automatically create a Microsoft Teams meeting
- Adds Teams link to the event
- Attendees can join with one click

**Attendees**
- Add people to invite to the event
- Enter email addresses one at a time
- Toggle between "required" and "optional"
- Remove attendees by clicking the X button
- Press Enter to add an attendee

**Category**
- Classify the event type
- Options: Meeting, Business, Personal, Training, Project, Client, Review
- Helps with filtering and organization

---

## Step-by-Step Example

### Creating a Team Meeting

1. **Click "Add Event"**

2. **Fill in basic details:**
   - Subject: "Weekly Team Sync"
   - Description: "Discuss project updates and blockers"

3. **Set date and time:**
   - Start Date: Select today
   - Start Time: 10:00 AM
   - End Time: 11:00 AM

4. **Add location:**
   - Location: "Conference Room B"

5. **Enable Teams Meeting:**
   - Toggle "Teams Meeting" ON
   - A Teams link will be automatically created

6. **Add attendees:**
   - Enter: john.doe@company.com (press Enter)
   - Enter: jane.smith@company.com (press Enter)
   - Both default to "required"

7. **Set category:**
   - Select "Meeting" from dropdown

8. **Click "Create Event"**
   - Event is created in your calendar
   - List refreshes automatically
   - Success notification appears

---

## Event Types

### Regular Meeting
- Subject: "Project Review"
- Date/Time: Specific start and end times
- Location: Physical or virtual
- Attendees: Team members
- Category: Meeting

### All-Day Event
- Subject: "Annual Company Retreat"
- Toggle "All Day Event" ON
- Date: Single day or multi-day
- No specific times
- Category: Business

### Teams Online Meeting
- Subject: "Remote Standup"
- Toggle "Teams Meeting" ON
- Automatically creates Teams link
- Attendees get join link in invitation
- Category: Meeting

### Training Session
- Subject: "New Software Training"
- Date/Time: Specific times
- Location: "Training Room"
- Category: Training
- Add trainer and trainees as attendees

---

## Field Validation

The form includes smart validation:

### Subject
- ❌ Cannot be empty
- ❌ Cannot be just whitespace
- ✅ Must have actual text

### Dates
- ❌ Cannot be empty
- ❌ End date cannot be before start date
- ✅ End date defaults to start date

### Times
- ❌ Required for non-all-day events
- ✅ Can be equal (instant events)
- ✅ End time can be later than start

### Attendees
- ❌ Must be valid email format
- ❌ Must contain @ symbol
- ✅ Can add multiple attendees
- ✅ Can be empty (no attendees)

### Location
- ✅ Optional field
- ✅ Can be empty
- ✅ Any text allowed

---

## Technical Implementation

### Service Function

**createCalendarEvent** ([calendarService.ts](../src/services/calendarService.ts:271-318))
- Creates events via Microsoft Graph API
- POST request to `/me/calendar/events`
- Requires `Calendars.ReadWrite` permission
- Returns created event object

```typescript
const event = await createCalendarEvent(msalInstance, {
  subject: 'Team Meeting',
  start: {
    dateTime: '2025-12-04T10:00:00',
    timeZone: 'Pacific Standard Time'
  },
  end: {
    dateTime: '2025-12-04T11:00:00',
    timeZone: 'Pacific Standard Time'
  },
  location: {
    displayName: 'Conference Room A'
  },
  attendees: [
    {
      emailAddress: { address: 'john@company.com' },
      type: 'required'
    }
  ],
  isOnlineMeeting: true,
  onlineMeetingProvider: 'teamsForBusiness'
});
```

### Component

**AddEventModal** ([AddEventModal.tsx](../src/components/dashboard/AddEventModal.tsx))
- Full-featured event creation form
- Real-time validation
- Loading states
- Error handling
- Auto-refresh on success

### Integration

**ScheduledEvents Component** ([ScheduledEvents.tsx](../src/components/dashboard/ScheduledEvents.tsx))
- "Add Event" button in header
- Modal state management
- Automatic refresh after creation
- Seamless user experience

---

## Timezone Handling

Events are created using the user's local timezone:

```typescript
const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
// Example: "America/Los_Angeles", "Pacific/Port_Moresby"
```

The event will display correctly for all attendees regardless of their timezone.

---

## Teams Meeting Integration

When "Teams Meeting" is enabled:

1. Microsoft Graph automatically creates a Teams meeting
2. A unique meeting link is generated
3. The link is added to the event details
4. Attendees receive the link in their invitation
5. One-click join from Outlook or Teams

**API Configuration:**
```typescript
{
  isOnlineMeeting: true,
  onlineMeetingProvider: 'teamsForBusiness'
}
```

---

## Error Handling

### Common Errors and Solutions

**"No authenticated accounts found"**
- User not logged in
- Solution: Refresh page and log in again

**"Failed to create calendar event: 403"**
- Missing permissions
- Solution: Admin must grant `Calendars.ReadWrite` permission

**"Invalid email address"**
- Attendee email format is wrong
- Solution: Enter valid email with @ symbol

**"Start date required"**
- Missing start date
- Solution: Select a date from the calendar picker

**"Network error"**
- No internet connection or API down
- Solution: Check connection and retry

---

## User Experience

### Before Clicking "Add Event"
- User sees their scheduled events
- Wants to add a new meeting
- Looks for easy way to create event

### After Clicking "Add Event"
- Clean modal opens instantly
- All fields clearly labeled
- Helpful placeholder text
- Easy-to-use date/time pickers

### While Filling Form
- Real-time validation feedback
- Required fields marked with *
- Helpful error messages
- Toggle switches for options

### After Clicking "Create Event"
- Loading indicator shows progress
- Success toast notification
- Modal closes automatically
- Event list refreshes with new event
- New event visible immediately

---

## Attendee Management

### Adding Attendees

1. Type email address in attendee field
2. Press Enter or click Plus button
3. Attendee added to list below
4. Default type: "required"

### Managing Attendees

**Change Type:**
- Click the badge (required/optional)
- Toggles between required and optional
- Visual feedback with color change

**Remove Attendee:**
- Click X button next to attendee
- Immediately removed from list
- No confirmation needed

**Multiple Attendees:**
- Add as many as needed
- Scrollable list for many attendees
- Each shows email and type

---

## Accessibility

✅ **Keyboard Navigation**
- Tab through all form fields
- Enter to submit form
- Escape to close modal
- Space to toggle switches

✅ **Screen Reader Support**
- All fields properly labeled
- Required fields announced
- Error messages read aloud
- Success notifications announced

✅ **Visual Indicators**
- Required fields marked with *
- Error states in red
- Success states in green
- Clear focus indicators

---

## Mobile Support

The Add Event modal is fully responsive:

**Small Screens (Mobile)**
- Full-width modal
- Stacked form fields
- Large touch targets
- Scrollable content

**Medium Screens (Tablet)**
- Comfortable modal width
- Two-column date/time layout
- Easy tap interactions

**Large Screens (Desktop)**
- Optimal modal size
- Multi-column layouts
- Hover states
- Keyboard shortcuts

---

## Performance

✅ **Fast Loading**
- Modal renders instantly
- No API calls on open
- Lightweight component

✅ **Efficient Validation**
- Client-side validation
- Prevents invalid submissions
- No unnecessary API calls

✅ **Smart Defaults**
- End date = start date
- End time = start time + 1 hour
- Current timezone
- Reduces user input

---

## Security

✅ **Permission-Based**
- Requires `Calendars.ReadWrite` scope
- User must consent to permissions
- Cannot create without authorization

✅ **Email Validation**
- Prevents invalid attendee emails
- Client-side format checking
- Server-side validation by Graph API

✅ **Token Security**
- Uses secure MSAL tokens
- Tokens automatically refreshed
- Never exposed to client

---

## Best Practices

### Creating Effective Events

**Good Subject Lines:**
- ✅ "Q4 Planning Meeting"
- ✅ "Client Presentation - ACME Corp"
- ✅ "Training: New Software System"

**Poor Subject Lines:**
- ❌ "meeting"
- ❌ "important"
- ❌ "see description"

### Using Descriptions

Include:
- Meeting agenda
- Preparation required
- Documents to review
- Dial-in information (if not Teams)

### Selecting Categories

Use categories consistently:
- **Meeting** - Regular team meetings
- **Business** - Business-critical events
- **Training** - Learning sessions
- **Client** - External client meetings
- **Project** - Project-specific events

---

## Limitations

Current limitations:

1. **Recurring Events**
   - Not yet supported
   - Each event is one-time only
   - Create separate events for series

2. **Reminders**
   - Use default Outlook reminders
   - Cannot customize in this modal
   - Edit in Outlook for custom reminders

3. **Rich Text Description**
   - Plain text only
   - No formatting options
   - Edit in Outlook for rich text

4. **Attachments**
   - Cannot attach files
   - Add attachments in Outlook after creation

5. **Busy Status**
   - Uses default (Busy)
   - Cannot set to Free/Tentative/Out of Office
   - Modify in Outlook if needed

---

## Future Enhancements

Potential improvements:

1. **Recurring Events** - Create event series
2. **Rich Text Editor** - Format descriptions
3. **File Attachments** - Add documents
4. **Custom Reminders** - Set reminder times
5. **Busy Status** - Choose availability
6. **Color Coding** - Select event colors
7. **Room Finder** - Search available rooms
8. **Suggested Times** - AI-powered scheduling
9. **Template Library** - Save event templates
10. **Calendar Selection** - Choose which calendar

---

## Troubleshooting

### Event Not Appearing

**Check 1: Permissions**
- Ensure `Calendars.ReadWrite` is granted
- Check admin consent in Azure

**Check 2: Date Range**
- Event might be outside current filter
- Change filter to "Next 30 days"

**Check 3: Success Message**
- Look for success toast notification
- If missing, creation may have failed

### Can't Add Attendees

**Check 1: Email Format**
- Must include @ symbol
- Must be valid email address
- No spaces before/after

**Check 2: Organization Domain**
- Some orgs restrict external attendees
- Try internal email addresses first

### Teams Meeting Not Created

**Check 1: Permissions**
- Requires OnlineMeetings.ReadWrite scope
- May need additional admin consent

**Check 2: License**
- User must have Teams license
- Check Microsoft 365 subscription

---

## Support

For issues with the Add Event feature:

1. **Check browser console** - Look for error messages
2. **Verify permissions** - Ensure calendar write access
3. **Test with simple event** - Minimal fields first
4. **Check Microsoft Graph status** - https://status.dev.microsoft.com/

---

## API Reference

### Microsoft Graph Endpoint

**Create Event:**
```
POST https://graph.microsoft.com/v1.0/me/calendar/events
```

**Request Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "subject": "Team Meeting",
  "body": {
    "contentType": "Text",
    "content": "Discuss project updates"
  },
  "start": {
    "dateTime": "2025-12-04T10:00:00",
    "timeZone": "Pacific Standard Time"
  },
  "end": {
    "dateTime": "2025-12-04T11:00:00",
    "timeZone": "Pacific Standard Time"
  },
  "location": {
    "displayName": "Conference Room A"
  },
  "attendees": [
    {
      "emailAddress": {
        "address": "john@company.com",
        "name": "John Doe"
      },
      "type": "required"
    }
  ],
  "isAllDay": false,
  "isOnlineMeeting": true,
  "onlineMeetingProvider": "teamsForBusiness",
  "categories": ["Meeting"]
}
```

**Response:**
- Status: 201 Created
- Body: Created event object with ID

---

## Summary

The Add Event feature empowers users to:

- ✅ Create calendar events without leaving the intranet
- ✅ Schedule meetings with full details
- ✅ Invite attendees directly
- ✅ Create Teams meetings automatically
- ✅ Organize events with categories
- ✅ See new events immediately

**Result:** Faster, more efficient calendar management directly from the Unitopia Hub home page!

---

**Last Updated:** December 4, 2025
**Version:** 1.0.0
**Component:** AddEventModal
**Status:** ✅ Complete and Ready

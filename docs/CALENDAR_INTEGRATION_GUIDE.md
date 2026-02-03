# Calendar Integration Guide

## Overview

This guide explains how the Microsoft Graph Calendar integration works in the Unitopia Hub application. Users can now see their personal and shared calendar events directly on the home page.

## Features

✅ **Real-time Calendar Events** - Fetches events from Microsoft 365 Calendar
✅ **Shared Calendars Support** - Displays events from shared calendars
✅ **Date Range Filtering** - View events for today, next 7/14/30 days
✅ **Event Statistics** - Automatically calculates meetings, all-day events, and training sessions
✅ **Business Percentage** - Shows percentage of business-related events
✅ **Event Details** - Displays time, location, attendees, and more
✅ **Direct Links** - Click to open events in Outlook/Teams

---

## Azure AD Configuration

### Required Permissions

The following Microsoft Graph API permissions have been configured:

**Delegated Permissions:**
- `Calendars.Read` - Read user calendars
- `Calendars.ReadWrite` - Read and write user calendars
- `Calendars.Read.Shared` - Read shared calendars

### Application Details

- **Application (Client) ID:** `648a96d7-e3f5-4e13-8084-ba0b74dbb56f`
- **Tenant ID:** `b173aac7-6781-4d49-a037-d874bd4a09ab`

### Admin Consent

⚠️ **IMPORTANT:** Admin consent must be granted for calendar permissions to work.

To grant admin consent:
1. Go to **Azure Portal** → **App registrations**
2. Select your app
3. Go to **API permissions**
4. Click **"Grant admin consent for [Your Organization]"**
5. Verify green checkmarks appear next to all permissions

---

## Implementation Architecture

### Files Created/Modified

#### 1. **Calendar Service** (`src/services/calendarService.ts`)
The main service that communicates with Microsoft Graph API to fetch calendar events.

**Key Functions:**
- `fetchCalendarEvents()` - Fetches events within a date range
- `getTodaysEvents()` - Fetches today's events only
- `getUpcomingEvents()` - Fetches events for the next N days
- `fetchSharedCalendarEvents()` - Fetches events from shared calendars

**Example Usage:**
```typescript
import { getTodaysEvents } from '@/services/calendarService';
import { useMsal } from '@azure/msal-react';

const { instance } = useMsal();
const events = await getTodaysEvents(instance, true); // includes shared calendars
```

#### 2. **Calendar Hooks** (`src/hooks/useCalendarEvents.ts`)
React hooks that make it easy to fetch and manage calendar events in components.

**Available Hooks:**
- `useCalendarEvents()` - General-purpose calendar hook with options
- `useTodaysCalendarEvents()` - Specifically for today's events
- `useUpcomingCalendarEvents()` - Specifically for upcoming events

**Example Usage:**
```typescript
import { useUpcomingCalendarEvents } from '@/hooks/useCalendarEvents';

function MyComponent() {
  const { events, loading, error, refetch } = useUpcomingCalendarEvents(7, true);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {events.map(event => (
        <div key={event.id}>{event.subject}</div>
      ))}
    </div>
  );
}
```

#### 3. **Scheduled Events Component** (`src/components/dashboard/ScheduledEvents.tsx`)
Updated to display real calendar events instead of mock data.

**Features:**
- Automatically fetches upcoming events
- Dropdown to filter by date range (Today, 7 days, 14 days, 30 days)
- Displays event details: date, time, location, attendees
- Calculates statistics dynamically from real events
- Links to open events in Outlook/Teams

#### 4. **Configuration Updates**

**microsoft-auth.ts:**
```typescript
permissions: [
  "User.Read",
  "People.Read",
  "Directory.Read.All",
  "Files.Read.All",
  "Files.ReadWrite.All",
  "Sites.Read.All",
  "Sites.ReadWrite.All",
  "Calendars.Read",              // NEW
  "Calendars.ReadWrite",          // NEW
  "Calendars.Read.Shared"         // NEW
]
```

**authConfig.ts:**
```typescript
export const loginRequest = {
  scopes: [
    "User.Read",
    "Files.ReadWrite",
    "Calendars.Read",              // NEW
    "Calendars.ReadWrite",          // NEW
    "Calendars.Read.Shared"         // NEW
  ]
};
```

---

## How It Works

### 1. User Authentication
When a user logs in via Microsoft/Azure AD, the application requests calendar permissions.

### 2. Token Acquisition
The `calendarService.ts` uses MSAL to acquire an access token with calendar scopes:
```typescript
const response = await msalInstance.acquireTokenSilent({
  scopes: ['Calendars.Read', 'Calendars.Read.Shared'],
  account: accounts[0],
});
```

### 3. API Request
With the access token, the service makes a request to Microsoft Graph API:
```
GET https://graph.microsoft.com/v1.0/me/calendar/events
```

**Query Parameters:**
- `$filter` - Filter by date range
- `$orderby` - Sort by start date/time
- `$top` - Limit number of results
- `$select` - Select specific fields to reduce payload size

### 4. Shared Calendars
The service also fetches shared calendars:
1. First, get list of all calendars: `GET /me/calendars`
2. Filter for non-default calendars (shared ones)
3. Fetch events from each shared calendar
4. Merge with user's own calendar events

### 5. Data Display
The `ScheduledEvents` component uses the `useUpcomingCalendarEvents` hook to:
- Fetch events based on selected date range
- Calculate statistics (meetings, all-day events, training)
- Calculate business percentage
- Display events with formatted dates and times

---

## Event Data Structure

Each calendar event returned from Microsoft Graph has this structure:

```typescript
interface CalendarEvent {
  id: string;
  subject: string;
  start: {
    dateTime: string;  // ISO 8601 format
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: {
    displayName: string;
  };
  attendees?: Array<{
    emailAddress: {
      name: string;
      address: string;
    };
    type: string;
  }>;
  isAllDay: boolean;
  webLink: string;
  bodyPreview?: string;
  organizer?: {
    emailAddress: {
      name: string;
      address: string;
    };
  };
  categories?: string[];
  isCancelled?: boolean;
}
```

---

## Statistics Calculation

The component automatically calculates event statistics:

### Meetings
Events with one or more attendees:
```typescript
const meetings = events.filter(event =>
  event.attendees && event.attendees.length > 0
).length;
```

### All-Day Events (Tasks Due)
Events marked as all-day:
```typescript
const tasksDue = events.filter(event => event.isAllDay).length;
```

### Training Sessions
Events with "training" in subject or categories:
```typescript
const trainingSessions = events.filter(event =>
  event.subject?.toLowerCase().includes('training') ||
  event.categories?.some(cat => cat.toLowerCase().includes('training'))
).length;
```

### Business Percentage
Percentage of business-related events:
```typescript
const businessEvents = events.filter(event => {
  const subject = event.subject?.toLowerCase() || '';
  return subject.includes('meeting') ||
         subject.includes('business') ||
         subject.includes('client') ||
         subject.includes('project');
}).length;

const percentage = Math.round((businessEvents / events.length) * 100);
```

---

## User Experience

### On the Home Page

Users will see the **"MY SCHEDULED EVENTS"** section with:

1. **Date Range Selector** - Dropdown to choose:
   - Today
   - Next 7 days
   - Next 14 days
   - Next 30 days

2. **Business Statistics Circle** - Shows percentage of business events

3. **Event Counts** - Three statistics:
   - Meetings (with attendees)
   - All-Day Events
   - Training Sessions

4. **Event List** - Up to 10 upcoming events showing:
   - Event subject/title
   - Date (displays "Today", "Tomorrow", or formatted date)
   - Time (for non-all-day events)
   - Location (if specified)
   - Number of attendees (if any)
   - Link to open in Outlook/Teams

### Loading States

- **Loading:** Shows spinner with "Loading events..." message
- **Error:** Shows error message with "Try Again" button
- **No Events:** Shows calendar icon with "No upcoming events" message

---

## Troubleshooting

### Events Not Showing

**Check 1: Admin Consent**
- Verify admin consent was granted in Azure Portal
- API permissions should show green checkmarks

**Check 2: Browser Console**
- Open browser DevTools (F12)
- Look for authentication or API errors
- Check for CORS errors

**Check 3: Token Scopes**
- Verify the acquired token includes calendar scopes
- Check the console logs for token acquisition

### Shared Calendars Not Showing

**Check 1: Permissions**
- Ensure `Calendars.Read.Shared` permission is granted
- Verify the calendar is actually shared with the user in Outlook

**Check 2: Calendar Sharing Settings**
- In Outlook, verify the calendar sharing permissions
- Ensure user has at least "Can view all details" permission

### Date/Time Formatting Issues

**Check 1: Time Zones**
- Events include timezone information
- The app uses the event's timezone for display

**Check 2: Date Parsing**
- Uses `date-fns` library for parsing and formatting
- Dates are in ISO 8601 format from Microsoft Graph

---

## Testing

### Manual Testing Steps

1. **Login to the application**
   - Use your Microsoft 365 account
   - Grant calendar permissions when prompted

2. **Navigate to Home Page**
   - Verify "MY SCHEDULED EVENTS" section appears
   - Should see loading spinner initially

3. **Check Event Display**
   - Verify your real calendar events appear
   - Check if event details are correct (time, location, etc.)

4. **Test Date Range Filter**
   - Select "Today" - should show only today's events
   - Select "Next 7 days" - should show events for next week
   - Verify event count changes appropriately

5. **Test Shared Calendars**
   - If you have shared calendars, verify those events appear
   - Check if they're mixed with your personal events

6. **Test Event Link**
   - Click the external link icon on an event
   - Should open the event in Outlook Web or Teams

### Test with Mock Data

To test without calendar permissions, you can temporarily modify the hook to return mock data:

```typescript
// In useCalendarEvents.ts - for testing only
const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    subject: 'Team Meeting',
    start: { dateTime: new Date().toISOString(), timeZone: 'UTC' },
    end: { dateTime: new Date(Date.now() + 3600000).toISOString(), timeZone: 'UTC' },
    isAllDay: false,
    webLink: 'https://outlook.office.com',
    attendees: [
      { emailAddress: { name: 'John Doe', address: 'john@example.com' }, type: 'required' }
    ]
  }
];
```

---

## Future Enhancements

Potential improvements for the calendar integration:

1. **Event Creation** - Allow users to create calendar events directly from the app
2. **Event Editing** - Edit existing events (requires write permissions)
3. **Calendar Sync** - Real-time updates when events change
4. **Event Reminders** - Desktop notifications for upcoming events
5. **Multi-Calendar View** - Separate views for different calendars
6. **Export Events** - Export events to CSV or PDF
7. **Event Search** - Search through calendar events
8. **Recurring Events** - Better display of recurring event series
9. **Event Categories** - Filter by event categories/colors
10. **Integration with Tasks** - Connect with Microsoft To-Do

---

## API Rate Limits

Microsoft Graph API has rate limits:
- **Per-user limits:** 10,000 requests per 10 minutes
- **Per-app limits:** 150,000 requests per 10 minutes

The current implementation is well within these limits:
- Events are fetched once on component mount
- Events can be manually refreshed
- Optional auto-refresh interval (disabled by default)

To enable auto-refresh:
```typescript
const { events } = useUpcomingCalendarEvents(7, true, {
  refreshInterval: 300000 // Refresh every 5 minutes
});
```

---

## Security Considerations

✅ **Delegated Permissions** - Users only see their own events
✅ **Secure Token Storage** - MSAL handles token storage securely
✅ **HTTPS Only** - All API calls use HTTPS
✅ **Token Expiration** - Tokens automatically refresh
✅ **Minimal Scopes** - Only requests necessary permissions

⚠️ **Do not:**
- Log access tokens or event details to console in production
- Store tokens in localStorage manually (MSAL handles this)
- Share calendar data with unauthorized users

---

## Support

For issues or questions:
1. Check browser console for errors
2. Verify Azure AD permissions
3. Check Microsoft Graph API status: https://status.dev.microsoft.com/
4. Review MSAL authentication logs

---

## References

- [Microsoft Graph Calendar API](https://learn.microsoft.com/en-us/graph/api/resources/calendar)
- [MSAL.js Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js)
- [Azure AD App Registration](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [Microsoft Graph Permissions](https://learn.microsoft.com/en-us/graph/permissions-reference)

---

**Last Updated:** December 4, 2025
**Version:** 1.0.0

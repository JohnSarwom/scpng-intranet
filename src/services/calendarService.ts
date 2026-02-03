import { PublicClientApplication } from '@azure/msal-browser';
import microsoftAuthConfig from '@/config/microsoft-auth';

export interface CalendarEvent {
  id: string;
  subject: string;
  start: {
    dateTime: string;
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

export interface CalendarEventsResponse {
  value: CalendarEvent[];
  '@odata.nextLink'?: string;
}

export interface CreateEventInput {
  subject: string;
  body?: {
    contentType: 'HTML' | 'Text';
    content: string;
  };
  start: {
    dateTime: string;
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
      address: string;
      name?: string;
    };
    type: 'required' | 'optional';
  }>;
  isAllDay?: boolean;
  categories?: string[];
  isOnlineMeeting?: boolean;
  onlineMeetingProvider?: 'teamsForBusiness';
}

/**
 * Fetch calendar events from Microsoft Graph API
 * @param msalInstance - MSAL instance for authentication
 * @param startDate - Optional start date for filtering events
 * @param endDate - Optional end date for filtering events
 * @param includeShared - Whether to include shared calendars (default: true)
 * @returns Promise with array of calendar events
 */
export const fetchCalendarEvents = async (
  msalInstance: PublicClientApplication,
  startDate?: Date,
  endDate?: Date,
  includeShared: boolean = true
): Promise<CalendarEvent[]> => {
  try {
    const accounts = msalInstance.getAllAccounts();

    if (accounts.length === 0) {
      console.warn('No authenticated accounts found');
      return [];
    }

    // Get access token with calendar permissions
    const response = await msalInstance.acquireTokenSilent({
      scopes: ['Calendars.Read', 'Calendars.Read.Shared'],
      account: accounts[0],
    });

    const accessToken = response.accessToken;

    // Build query parameters
    const params = new URLSearchParams();

    // Set default date range if not provided (next 30 days)
    const now = new Date();
    const defaultEndDate = new Date();
    defaultEndDate.setDate(now.getDate() + 30);

    const filterStartDate = startDate || now;
    const filterEndDate = endDate || defaultEndDate;

    // Format dates for OData filter
    const startDateTime = filterStartDate.toISOString();
    const endDateTime = filterEndDate.toISOString();

    // Use proper date range filter to catch events that overlap with the date range
    // This will show events that:
    // - Start within the range, OR
    // - End within the range, OR
    // - Span across the entire range
    params.append('$filter', `start/dateTime lt '${endDateTime}' and end/dateTime gt '${startDateTime}'`);
    params.append('$orderby', 'start/dateTime');
    params.append('$top', '100'); // Increased limit to show more events
    params.append('$select', 'id,subject,start,end,location,attendees,isAllDay,webLink,bodyPreview,organizer,categories,isCancelled');

    // Fetch events from user's calendar
    const apiUrl = `${microsoftAuthConfig.apiEndpoint}/me/calendar/events?${params.toString()}`;

    const graphResponse = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Prefer': `outlook.timezone="${Intl.DateTimeFormat().resolvedOptions().timeZone}"`
      },
    });

    if (!graphResponse.ok) {
      throw new Error(`Failed to fetch calendar events: ${graphResponse.status} ${graphResponse.statusText}`);
    }

    const data: CalendarEventsResponse = await graphResponse.json();

    let allEvents = data.value || [];

    console.log(`Fetched ${allEvents.length} events from primary calendar`);
    console.log('Date range:', {
      start: startDateTime,
      end: endDateTime,
      filterStartDate: filterStartDate.toLocaleDateString(),
      filterEndDate: filterEndDate.toLocaleDateString()
    });

    // Optionally fetch shared calendars
    if (includeShared) {
      try {
        const sharedEvents = await fetchSharedCalendarEvents(accessToken, filterStartDate, filterEndDate);
        allEvents = [...allEvents, ...sharedEvents];
      } catch (error) {
        console.warn('Could not fetch shared calendar events:', error);
        // Continue with user's own events even if shared calendar fetch fails
      }
    }

    // Sort all events by start time
    allEvents.sort((a, b) => {
      const dateA = new Date(a.start.dateTime);
      const dateB = new Date(b.start.dateTime);
      return dateA.getTime() - dateB.getTime();
    });

    return allEvents;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw error;
  }
};

/**
 * Fetch events from shared calendars
 */
const fetchSharedCalendarEvents = async (
  accessToken: string,
  startDate: Date,
  endDate: Date
): Promise<CalendarEvent[]> => {
  try {
    // First, get list of calendars (including shared ones)
    const calendarsUrl = `${microsoftAuthConfig.apiEndpoint}/me/calendars`;
    const calendarsResponse = await fetch(calendarsUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!calendarsResponse.ok) {
      throw new Error('Failed to fetch calendars list');
    }

    const calendarsData = await calendarsResponse.json();
    const calendars = calendarsData.value || [];

    // Filter for shared calendars (those that aren't the default calendar)
    const sharedCalendars = calendars.filter((cal: any) => !cal.isDefaultCalendar);

    // Fetch events from each shared calendar
    const sharedEventsPromises = sharedCalendars.map(async (calendar: any) => {
      try {
        const params = new URLSearchParams();
        const startDateTime = startDate.toISOString();
        const endDateTime = endDate.toISOString();

        // Use proper date range filter to catch overlapping events
        params.append('$filter', `start/dateTime lt '${endDateTime}' and end/dateTime gt '${startDateTime}'`);
        params.append('$orderby', 'start/dateTime');
        params.append('$top', '50');
        params.append('$select', 'id,subject,start,end,location,attendees,isAllDay,webLink,bodyPreview,organizer,categories,isCancelled');

        const eventsUrl = `${microsoftAuthConfig.apiEndpoint}/me/calendars/${calendar.id}/events?${params.toString()}`;

        const response = await fetch(eventsUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Prefer': `outlook.timezone="${Intl.DateTimeFormat().resolvedOptions().timeZone}"`
          },
        });

        if (response.ok) {
          const data = await response.json();
          return data.value || [];
        }
        return [];
      } catch (error) {
        console.warn(`Could not fetch events from calendar ${calendar.name}:`, error);
        return [];
      }
    });

    const sharedEventsArrays = await Promise.all(sharedEventsPromises);
    return sharedEventsArrays.flat();
  } catch (error) {
    console.error('Error fetching shared calendars:', error);
    return [];
  }
};

/**
 * Get today's calendar events
 */
export const getTodaysEvents = async (
  msalInstance: PublicClientApplication,
  includeShared: boolean = true
): Promise<CalendarEvent[]> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return fetchCalendarEvents(msalInstance, today, tomorrow, includeShared);
};

/**
 * Get upcoming events (next 7 days)
 */
export const getUpcomingEvents = async (
  msalInstance: PublicClientApplication,
  days: number = 7,
  includeShared: boolean = true
): Promise<CalendarEvent[]> => {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + days);

  return fetchCalendarEvents(msalInstance, startDate, endDate, includeShared);
};

/**
 * Create a new calendar event
 * @param msalInstance - MSAL instance for authentication
 * @param eventData - Event data to create
 * @returns Promise with the created calendar event
 */
export const createCalendarEvent = async (
  msalInstance: PublicClientApplication,
  eventData: CreateEventInput
): Promise<CalendarEvent> => {
  try {
    const accounts = msalInstance.getAllAccounts();

    if (accounts.length === 0) {
      throw new Error('No authenticated accounts found');
    }

    // Get access token with calendar write permissions
    const response = await msalInstance.acquireTokenSilent({
      scopes: ['Calendars.ReadWrite'],
      account: accounts[0],
    });

    const accessToken = response.accessToken;

    // Create event via Microsoft Graph API
    const apiUrl = `${microsoftAuthConfig.apiEndpoint}/me/calendar/events`;

    const graphResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    if (!graphResponse.ok) {
      const errorData = await graphResponse.json().catch(() => ({}));
      throw new Error(
        `Failed to create calendar event: ${graphResponse.status} ${graphResponse.statusText}. ${errorData.error?.message || ''
        }`
      );
    }

    const createdEvent: CalendarEvent = await graphResponse.json();
    console.log('Event created successfully:', createdEvent);
    return createdEvent;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
};

/**
 * Update an existing calendar event
 */
export const updateCalendarEvent = async (
  msalInstance: PublicClientApplication,
  eventId: string,
  eventData: Partial<CreateEventInput>
): Promise<CalendarEvent> => {
  try {
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length === 0) throw new Error('No authenticated accounts found');

    const response = await msalInstance.acquireTokenSilent({
      scopes: ['Calendars.ReadWrite'],
      account: accounts[0],
    });

    const apiUrl = `${microsoftAuthConfig.apiEndpoint}/me/calendar/events/${eventId}`;

    const graphResponse = await fetch(apiUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${response.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    if (!graphResponse.ok) {
      throw new Error(`Failed to update event: ${graphResponse.statusText}`);
    }

    return await graphResponse.json();
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

/**
 * Delete a calendar event
 */
export const deleteCalendarEvent = async (
  msalInstance: PublicClientApplication,
  eventId: string
): Promise<void> => {
  try {
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length === 0) throw new Error('No authenticated accounts found');

    const response = await msalInstance.acquireTokenSilent({
      scopes: ['Calendars.ReadWrite'],
      account: accounts[0],
    });

    const apiUrl = `${microsoftAuthConfig.apiEndpoint}/me/calendar/events/${eventId}`;

    const graphResponse = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${response.accessToken}`,
      },
    });

    if (!graphResponse.ok) {
      throw new Error(`Failed to delete event: ${graphResponse.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

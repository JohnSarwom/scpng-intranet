import { useState, useEffect, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import {
  fetchCalendarEvents,
  getTodaysEvents,
  getUpcomingEvents,
  CalendarEvent
} from '@/services/calendarService';

export interface UseCalendarEventsOptions {
  autoFetch?: boolean;
  includeShared?: boolean;
  startDate?: Date;
  endDate?: Date;
  refreshInterval?: number; // in milliseconds
}

export interface UseCalendarEventsReturn {
  events: CalendarEvent[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  fetchToday: () => Promise<void>;
  fetchUpcoming: (days?: number) => Promise<void>;
}

/**
 * Custom hook to fetch and manage calendar events from Microsoft Graph
 */
export const useCalendarEvents = (
  options: UseCalendarEventsOptions = {}
): UseCalendarEventsReturn => {
  const {
    autoFetch = true,
    includeShared = true,
    startDate,
    endDate,
    refreshInterval,
  } = options;

  const { instance: msalInstance } = useMsal();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const fetchedEvents = await fetchCalendarEvents(
        msalInstance,
        startDate,
        endDate,
        includeShared
      );
      setEvents(fetchedEvents);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch calendar events');
      setError(error);
      console.error('Error in useCalendarEvents:', error);
    } finally {
      setLoading(false);
    }
  }, [msalInstance, startDate, endDate, includeShared]);

  const fetchToday = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const todayEvents = await getTodaysEvents(msalInstance, includeShared);
      setEvents(todayEvents);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch today\'s events');
      setError(error);
      console.error('Error fetching today\'s events:', error);
    } finally {
      setLoading(false);
    }
  }, [msalInstance, includeShared]);

  const fetchUpcoming = useCallback(async (days: number = 7) => {
    setLoading(true);
    setError(null);

    try {
      const upcomingEvents = await getUpcomingEvents(msalInstance, days, includeShared);
      setEvents(upcomingEvents);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch upcoming events');
      setError(error);
      console.error('Error fetching upcoming events:', error);
    } finally {
      setLoading(false);
    }
  }, [msalInstance, includeShared]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchEvents();
    }
  }, [autoFetch, fetchEvents]);

  // Set up refresh interval if specified
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const intervalId = setInterval(() => {
        fetchEvents();
      }, refreshInterval);

      return () => clearInterval(intervalId);
    }
  }, [refreshInterval, fetchEvents]);

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
    fetchToday,
    fetchUpcoming,
  };
};

/**
 * Hook specifically for today's events
 */
export const useTodaysCalendarEvents = (includeShared: boolean = true) => {
  const { instance: msalInstance } = useMsal();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchToday = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const todayEvents = await getTodaysEvents(msalInstance, includeShared);
      setEvents(todayEvents);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch today\'s events');
      setError(error);
      console.error('Error fetching today\'s events:', error);
    } finally {
      setLoading(false);
    }
  }, [msalInstance, includeShared]);

  useEffect(() => {
    fetchToday();
  }, [fetchToday]);

  return {
    events,
    loading,
    error,
    refetch: fetchToday,
  };
};

/**
 * Hook specifically for upcoming events
 */
export const useUpcomingCalendarEvents = (days: number = 7, includeShared: boolean = true) => {
  const { instance: msalInstance } = useMsal();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUpcoming = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const upcomingEvents = await getUpcomingEvents(msalInstance, days, includeShared);
      setEvents(upcomingEvents);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch upcoming events');
      setError(error);
      console.error('Error fetching upcoming events:', error);
    } finally {
      setLoading(false);
    }
  }, [msalInstance, days, includeShared]);

  useEffect(() => {
    fetchUpcoming();
  }, [fetchUpcoming]);

  return {
    events,
    loading,
    error,
    refetch: fetchUpcoming,
  };
};

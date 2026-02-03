/**
 * Hook for fetching and managing Market News from SharePoint
 */

import { useState, useEffect, useCallback } from 'react';
import { useMicrosoftGraph } from './useMicrosoftGraph';
import {
  MarketNewsItem,
  getAllMarketNews,
  getNewsByCompany,
  getHighPriorityNews,
} from '@/services/marketNewsSharePointService';

interface UseMarketNewsReturn {
  news: MarketNewsItem[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch all active market news
 */
export function useMarketNews(): UseMarketNewsReturn {
  const { client, isAuthenticated } = useMicrosoftGraph();
  const [news, setNews] = useState<MarketNewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    if (!client || !isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllMarketNews(client);
      setNews(data);
    } catch (err) {
      console.error('Error fetching market news:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch market news');
    } finally {
      setIsLoading(false);
    }
  }, [client, isAuthenticated]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return {
    news,
    isLoading,
    error,
    refetch: fetchNews,
  };
}

/**
 * Hook to fetch news for a specific company
 */
export function useCompanyNews(companySymbol: string): UseMarketNewsReturn {
  const { client, isAuthenticated } = useMicrosoftGraph();
  const [news, setNews] = useState<MarketNewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    if (!client || !isAuthenticated || !companySymbol) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await getNewsByCompany(client, companySymbol);
      setNews(data);
    } catch (err) {
      console.error(`Error fetching news for ${companySymbol}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to fetch company news');
    } finally {
      setIsLoading(false);
    }
  }, [client, isAuthenticated, companySymbol]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return {
    news,
    isLoading,
    error,
    refetch: fetchNews,
  };
}

/**
 * Hook to fetch high priority news only
 */
export function useHighPriorityNews(): UseMarketNewsReturn {
  const { client, isAuthenticated } = useMicrosoftGraph();
  const [news, setNews] = useState<MarketNewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    if (!client || !isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await getHighPriorityNews(client);
      setNews(data);
    } catch (err) {
      console.error('Error fetching high priority news:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch high priority news');
    } finally {
      setIsLoading(false);
    }
  }, [client, isAuthenticated]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return {
    news,
    isLoading,
    error,
    refetch: fetchNews,
  };
}

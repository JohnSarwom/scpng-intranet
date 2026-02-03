/**
 * Custom hooks for Information Slideshows
 * Manages fetching and state for three slideshow categories
 */

import { useState, useEffect, useCallback } from 'react';
import { SlideshowItem, SlideshowHookReturn } from '@/types/slideshow.types';

// Mock data for development/fallback
const MOCK_MS_OFFICE_TIPS: SlideshowItem[] = [
  {
    id: '1',
    title: 'Mastering Outlook Email Management',
    description:
      'Learn how to organize your inbox with folders, rules, and quick steps. Set up focused inbox to prioritize important emails. Use categories and flags to track action items efficiently.',
    category: 'MS Office 365 Tips',
    imageUrl: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=1200&h=675&fit=crop',
    priority: 'Normal',
    publishDate: new Date().toISOString(),
    isActive: true,
    author: 'IT Department',
    orderIndex: 1,
  },
  {
    id: '2',
    title: 'Microsoft Teams Best Practices',
    description:
      'Maximize your collaboration with Teams. Create channels for projects, use @mentions effectively, schedule meetings with calendar integration, and share files directly in conversations.',
    category: 'MS Office 365 Tips',
    imageUrl: 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=1200&h=675&fit=crop',
    priority: 'High',
    publishDate: new Date().toISOString(),
    isActive: true,
    author: 'IT Department',
    orderIndex: 2,
  },
  {
    id: '3',
    title: 'OneDrive File Sharing & Collaboration',
    description:
      'Share files securely with OneDrive. Set permissions for view-only or edit access. Track document versions and restore previous versions when needed. Sync files for offline access.',
    category: 'MS Office 365 Tips',
    imageUrl: 'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=1200&h=675&fit=crop',
    priority: 'Normal',
    publishDate: new Date().toISOString(),
    isActive: true,
    author: 'IT Department',
    orderIndex: 3,
  },
];

const MOCK_CAPITAL_MARKET_NEWS: SlideshowItem[] = [
  {
    id: '4',
    title: 'IOSCO Publishes New Guidelines on Digital Assets',
    description:
      'The International Organization of Securities Commissions (IOSCO) has released comprehensive guidelines for regulating digital assets and crypto-asset service providers globally, setting new standards for market oversight.',
    category: 'Capital Market News',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=675&fit=crop',
    priority: 'High',
    publishDate: new Date().toISOString(),
    isActive: true,
    author: 'Research Department',
    linkUrl: 'https://www.iosco.org/',
    orderIndex: 1,
  },
  {
    id: '5',
    title: 'Asia-Pacific Securities Markets Show Strong Growth',
    description:
      'Regional securities markets demonstrate resilience with increased trading volumes and new listings. PNG stock exchange sees growing investor participation in line with global trends.',
    category: 'Capital Market News',
    imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&h=675&fit=crop',
    priority: 'Normal',
    publishDate: new Date().toISOString(),
    isActive: true,
    author: 'Market Analysis Team',
    orderIndex: 2,
  },
  {
    id: '6',
    title: 'New ESG Reporting Requirements for Listed Companies',
    description:
      'Securities regulators across the region are implementing enhanced Environmental, Social, and Governance (ESG) disclosure requirements to promote sustainable investing and corporate transparency.',
    category: 'Capital Market News',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=675&fit=crop',
    priority: 'Normal',
    publishDate: new Date().toISOString(),
    isActive: true,
    author: 'Compliance Department',
    orderIndex: 3,
  },
];

const MOCK_CAPITAL_MARKET_ACTS: SlideshowItem[] = [
  {
    id: '7',
    title: 'Securities Act 1997 - Key Provisions',
    description:
      'The Securities Act 1997 establishes the regulatory framework for securities markets in PNG. It covers licensing requirements, disclosure obligations, and market conduct rules for all market participants.',
    category: 'Capital Market Acts',
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&h=675&fit=crop',
    priority: 'Normal',
    publishDate: new Date().toISOString(),
    isActive: true,
    author: 'Legal & Compliance',
    orderIndex: 1,
  },
  {
    id: '8',
    title: 'Companies Act 1997 - Corporate Governance',
    description:
      'Understanding corporate governance requirements under the Companies Act. Covers director duties, shareholder rights, financial reporting obligations, and corporate structure requirements for listed entities.',
    category: 'Capital Market Acts',
    imageUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&h=675&fit=crop',
    priority: 'Normal',
    publishDate: new Date().toISOString(),
    isActive: true,
    author: 'Legal & Compliance',
    orderIndex: 2,
  },
  {
    id: '9',
    title: 'Market Conduct Rules & Insider Trading',
    description:
      'Market integrity provisions prohibit insider trading, market manipulation, and false or misleading statements. Know your obligations to maintain fair and transparent capital markets.',
    category: 'Capital Market Acts',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&h=675&fit=crop',
    priority: 'High',
    publishDate: new Date().toISOString(),
    isActive: true,
    author: 'Legal & Compliance',
    orderIndex: 3,
  },
];

/**
 * Hook for fetching all slideshows
 */
export function useAllSlideshows(): SlideshowHookReturn {
  const [slides, setSlides] = useState<SlideshowItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSlides = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to fetch from SharePoint
      const data = await getAllSlideshows();
      setSlides(data);
    } catch (err) {
      console.error('Error fetching all slideshows:', err);
      setError(err instanceof Error ? err.message : 'Failed to load slideshows');

      // Fallback to mock data
      setSlides([...MOCK_MS_OFFICE_TIPS, ...MOCK_CAPITAL_MARKET_NEWS, ...MOCK_CAPITAL_MARKET_ACTS]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  return { slides, isLoading, error, refetch: fetchSlides };
}

/**
 * Hook for MS Office 365 Tips slideshows
 */
export function useMSOffice365Tips(): SlideshowHookReturn {
  const [slides, setSlides] = useState<SlideshowItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSlides = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate network delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 500));

      // TODO: Integrate with SharePoint when list is created
      // For now, use mock data
      // const client = await getAuthenticatedClient();
      // const data = await getMSOffice365Tips(client);
      // setSlides(data);

      setSlides(MOCK_MS_OFFICE_TIPS);
    } catch (err) {
      console.error('Error fetching MS Office 365 tips:', err);
      setError(err instanceof Error ? err.message : 'Failed to load MS Office 365 tips');

      // Fallback to mock data
      setSlides(MOCK_MS_OFFICE_TIPS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  return { slides, isLoading, error, refetch: fetchSlides };
}

/**
 * Hook for Capital Market News slideshows
 */
export function useCapitalMarketNews(): SlideshowHookReturn {
  const [slides, setSlides] = useState<SlideshowItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSlides = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      await new Promise((resolve) => setTimeout(resolve, 500));

      // TODO: Integrate with SharePoint when list is created
      // const client = await getAuthenticatedClient();
      // const data = await getCapitalMarketNews(client);
      // setSlides(data);

      setSlides(MOCK_CAPITAL_MARKET_NEWS);
    } catch (err) {
      console.error('Error fetching capital market news:', err);
      setError(err instanceof Error ? err.message : 'Failed to load capital market news');

      // Fallback to mock data
      setSlides(MOCK_CAPITAL_MARKET_NEWS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  return { slides, isLoading, error, refetch: fetchSlides };
}

/**
 * Hook for Capital Market Acts slideshows
 */
export function useCapitalMarketActs(): SlideshowHookReturn {
  const [slides, setSlides] = useState<SlideshowItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSlides = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      await new Promise((resolve) => setTimeout(resolve, 500));

      // TODO: Integrate with SharePoint when list is created
      // const client = await getAuthenticatedClient();
      // const data = await getCapitalMarketActs(client);
      // setSlides(data);

      setSlides(MOCK_CAPITAL_MARKET_ACTS);
    } catch (err) {
      console.error('Error fetching capital market acts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load capital market acts');

      // Fallback to mock data
      setSlides(MOCK_CAPITAL_MARKET_ACTS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  return { slides, isLoading, error, refetch: fetchSlides };
}

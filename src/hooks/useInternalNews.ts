import { useState, useEffect } from 'react';
import { useMicrosoftGraph } from '@/hooks/useMicrosoftGraph';
import { NewsSharePointService } from '@/services/newsSharePointService';

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  category: string; // broadened to string to accept dynamic SharePoint categories
  priority?: 'normal' | 'urgent';
  link?: string;
  author?: string;
}

// Mock data for demonstration - will be replaced with SharePoint integration
const MOCK_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'New Employee Onboarding Program Launch',
    description: 'We are excited to announce our enhanced onboarding program designed to welcome new team members and accelerate their integration into SCPNG.',
    image: 'https://picsum.photos/seed/onboarding/800/450',
    date: new Date(2024, 10, 20).toLocaleDateString('en-CA'),
    category: 'HR',
    priority: 'normal',
    author: 'HR Department',
  },
  {
    id: '2',
    title: 'IT System Upgrade Scheduled for This Weekend',
    description: 'Core IT infrastructure maintenance will occur Saturday 10 PM to Sunday 6 AM. Some services may be temporarily unavailable during this period.',
    image: 'https://picsum.photos/seed/it-upgrade/800/450',
    date: new Date(2024, 10, 22).toLocaleDateString('en-CA'),
    category: 'IT',
    priority: 'urgent',
    author: 'IT Department',
  },
  {
    id: '3',
    title: 'Annual Company Celebration - Save the Date',
    description: 'Join us for our annual company celebration on December 15th at the Port Moresby Yacht Club. An evening of recognition, entertainment, and networking awaits!',
    image: 'https://picsum.photos/seed/celebration/800/450',
    date: new Date(2024, 10, 15).toLocaleDateString('en-CA'),
    category: 'Events',
    priority: 'normal',
    author: 'Events Committee',
  },
  {
    id: '4',
    title: 'Q4 Performance Reviews Now Open',
    description: 'Performance review submissions are now open in the portal. Please complete your self-assessments by November 30th. Guidelines available in the HR section.',
    image: 'https://picsum.photos/seed/performance/800/450',
    date: new Date(2024, 10, 18).toLocaleDateString('en-CA'),
    category: 'HR',
    priority: 'normal',
    author: 'HR Department',
  },
  {
    id: '5',
    title: 'New Parking Regulations Effective December 1st',
    description: 'Updated parking policies will take effect next month. All staff members are required to register their vehicles with security. Details in the General Information section.',
    image: 'https://picsum.photos/seed/parking/800/450',
    date: new Date(2024, 10, 25).toLocaleDateString('en-CA'),
    category: 'General',
    priority: 'normal',
    author: 'Administration',
  },
  {
    id: '6',
    title: 'Professional Development Workshop Series',
    description: 'December workshop series now open for registration: Leadership Excellence, Project Management, and Technical Skills Enhancement. Limited seats available.',
    image: 'https://picsum.photos/seed/workshop/800/450',
    date: new Date(2024, 10, 12).toLocaleDateString('en-CA'),
    category: 'Events',
    priority: 'normal',
    author: 'Training & Development',
  },
  {
    id: '7',
    title: 'Critical: Security Protocol Update Required',
    description: 'All staff must complete the updated security awareness training by November 30th. This is mandatory for continued system access. Login to the training portal today.',
    image: 'https://picsum.photos/seed/security/800/450',
    date: new Date(2024, 10, 26).toLocaleDateString('en-CA'),
    category: 'Urgent',
    priority: 'urgent',
    author: 'Security Team',
  },
  {
    id: '8',
    title: 'New Wellness Program Benefits Available',
    description: 'Explore our enhanced wellness benefits including gym memberships, mental health support, and flexible work arrangements. Visit HR portal for details.',
    image: 'https://picsum.photos/seed/wellness/800/450',
    date: new Date(2024, 10, 10).toLocaleDateString('en-CA'),
    category: 'HR',
    priority: 'normal',
    author: 'HR Department',
  },
];

export function useInternalNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getClient } = useMicrosoftGraph();

  const fetchNews = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const client = await getClient();
      if (!client) {
        // If no client (not logged in?), maybe fallback or just return empty.
        // For now, let's just log and return.
        console.warn('Graph client not available for internal news.');
        setNews([]);
        setIsLoading(false);
        return;
      }

      const service = new NewsSharePointService(client);
      const allNews = await service.getAllNews();

      // Filter for 'SCPNG News' or 'Internal' and take top 7
      const scpngNews = allNews
        .filter(item => {
          const cat = (item.category || '').toLowerCase();
          return cat.includes('scpng') || cat.includes('internal');
        })
        .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
        .slice(0, 7)
        .map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          image: item.imageUrl || 'https://via.placeholder.com/800x450/83002A/FFFFFF?text=SCPNG+News', // Fallback image
          date: item.publishDate,
          category: item.category || 'SCPNG News',
          priority: 'normal' as const, // Default, logic could be added if SharePoint has priority
          link: item.sourceUrl,
          author: item.sourceName || 'SCPNG'
        }));

      setNews(scpngNews);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error fetching internal news:', err);
      // Fallback to empty if error, or show error state
      setError(err.message || 'Failed to load news');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [getClient]); // Re-fetch if client availability changes

  const refetch = () => {
    fetchNews();
  };

  return { news, isLoading, error, refetch };
}

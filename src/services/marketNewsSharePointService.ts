/**
 * SharePoint Service for Market News
 * Fetches market news from SharePoint MarketNews list
 * Uses Microsoft Graph API
 *
 * SharePoint Columns: Company, Title, URL, Date Published
 */

import { Client } from '@microsoft/microsoft-graph-client';

const SITE_PATH = '/sites/scpngintranet';
const SITE_DOMAIN = 'scpng1.sharepoint.com';
const LIST_NAME = 'MarketNews';

export interface MarketNewsItem {
  id: string;
  company: string;
  title: string;
  url: string;
  datePublished: string;
  timeAgo?: string; // Computed field for display
}

interface SharePointNewsField {
  Id: number;
  Company: string;
  Title: string;
  Url: string; // Note: SharePoint column name is 'Url' not 'URL'
  DatePublished: string;
}

interface SharePointListItem {
  id: string;
  fields: SharePointNewsField;
}

interface SharePointListResponse {
  value: SharePointListItem[];
}

/**
 * Calculate "time ago" string from date
 */
function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
  } else if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 14) {
    return '1 week ago';
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)} weeks ago`;
  } else {
    return `${Math.floor(diffDays / 30)} months ago`;
  }
}

/**
 * Transforms SharePoint item to application MarketNewsItem type
 */
function transformNewsItem(item: SharePointListItem): MarketNewsItem {
  const fields = item.fields;

  // SharePoint column is named 'Url' (not 'URL')
  const url = fields.Url || '';

  // Debug log to verify URL
  console.log('News item URL:', {
    title: fields.Title,
    url: url
  });

  return {
    id: item.id,
    company: fields.Company || '',
    title: fields.Title || '',
    url,
    datePublished: fields.DatePublished || new Date().toISOString(),
    timeAgo: getTimeAgo(fields.DatePublished || new Date().toISOString()),
  };
}

export class MarketNewsSharePointService {
  private client: Client;
  private siteId: string = '';
  private listId: string = '';

  constructor(client: Client) {
    this.client = client;
  }

  /**
   * Initialize service: get site ID and list ID
   */
  async initialize(): Promise<void> {
    try {
      // Get Site ID
      const site = await this.client.api(`/sites/${SITE_DOMAIN}:${SITE_PATH}`).get();
      this.siteId = site.id;

      // Get List ID
      const lists = await this.client
        .api(`/sites/${this.siteId}/lists`)
        .filter(`displayName eq '${LIST_NAME}'`)
        .get();

      if (lists.value.length === 0) {
        throw new Error(
          `Market News list '${LIST_NAME}' not found. Please create it in SharePoint first.`
        );
      }

      this.listId = lists.value[0].id;
    } catch (error) {
      console.error('Error initializing market news service:', error);
      throw error;
    }
  }

  /**
   * Fetches all market news from SharePoint, sorted by date (newest first)
   */
  async getAllNews(): Promise<MarketNewsItem[]> {
    try {
      if (!this.siteId || !this.listId) {
        await this.initialize();
      }

      const response: SharePointListResponse = await this.client
        .api(`/sites/${this.siteId}/lists/${this.listId}/items`)
        .expand('fields')
        .top(100)
        .get();

      // Debug: Log the first item's fields to see what's available
      if (response.value.length > 0) {
        console.log('First item fields:', response.value[0].fields);
      }

      // Transform items and sort manually (since DatePublished is not indexed)
      const items = response.value
        .map(transformNewsItem)
        .filter((item) => {
          // Only include items with a valid date
          const publishDate = new Date(item.datePublished);
          return !isNaN(publishDate.getTime());
        })
        .sort((a, b) => {
          // Sort by date descending (newest first)
          const dateA = new Date(a.datePublished).getTime();
          const dateB = new Date(b.datePublished).getTime();
          return dateB - dateA;
        });

      return items;
    } catch (error) {
      console.error('Error fetching market news from SharePoint:', error);
      throw error;
    }
  }

  /**
   * Fetches news for a specific company
   */
  async getNewsByCompany(companySymbol: string): Promise<MarketNewsItem[]> {
    try {
      const allNews = await this.getAllNews();
      return allNews.filter((news) =>
        news.company.toUpperCase().includes(companySymbol.toUpperCase())
      );
    } catch (error) {
      console.error(`Error fetching news for ${companySymbol}:`, error);
      throw error;
    }
  }

  /**
   * Creates a new market news item
   */
  async createNewsItem(item: Omit<MarketNewsItem, 'id' | 'timeAgo'>): Promise<MarketNewsItem> {
    try {
      if (!this.siteId || !this.listId) {
        await this.initialize();
      }

      const body = {
        fields: {
          Company: item.company,
          Title: item.title,
          Url: item.url,
          DatePublished: item.datePublished,
        },
      };

      const response = await this.client
        .api(`/sites/${this.siteId}/lists/${this.listId}/items`)
        .post(body);

      return transformNewsItem(response);
    } catch (error) {
      console.error('Error creating news item:', error);
      throw error;
    }
  }

  /**
   * Updates an existing news item
   */
  async updateNewsItem(
    id: string,
    updates: Partial<Omit<MarketNewsItem, 'id' | 'timeAgo'>>
  ): Promise<void> {
    try {
      if (!this.siteId || !this.listId) {
        await this.initialize();
      }

      const body: any = { fields: {} };

      if (updates.company) body.fields.Company = updates.company;
      if (updates.title) body.fields.Title = updates.title;
      if (updates.url) body.fields.Url = updates.url;
      if (updates.datePublished) body.fields.DatePublished = updates.datePublished;

      await this.client
        .api(`/sites/${this.siteId}/lists/${this.listId}/items/${id}`)
        .patch(body);
    } catch (error) {
      console.error('Error updating news item:', error);
      throw error;
    }
  }

  /**
   * Deletes a news item
   */
  async deleteNewsItem(id: string): Promise<void> {
    try {
      if (!this.siteId || !this.listId) {
        await this.initialize();
      }

      await this.client
        .api(`/sites/${this.siteId}/lists/${this.listId}/items/${id}`)
        .delete();
    } catch (error) {
      console.error('Error deleting news item:', error);
      throw error;
    }
  }
}

// Convenience functions that create a service instance
export async function getAllMarketNews(client: Client): Promise<MarketNewsItem[]> {
  const service = new MarketNewsSharePointService(client);
  return service.getAllNews();
}

export async function getNewsByCompany(
  client: Client,
  companySymbol: string
): Promise<MarketNewsItem[]> {
  const service = new MarketNewsSharePointService(client);
  return service.getNewsByCompany(companySymbol);
}

export async function getHighPriorityNews(client: Client): Promise<MarketNewsItem[]> {
  const service = new MarketNewsSharePointService(client);
  const allNews = await service.getAllNews();
  // Return most recent 10 items as "high priority"
  return allNews.slice(0, 10);
}

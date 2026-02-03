/**
 * SharePoint Service for Information Slideshows
 * Fetches slideshow content from SharePoint InformationSlideshows list
 * Uses Microsoft Graph API
 */

import { Client } from '@microsoft/microsoft-graph-client';
import { SlideshowItem, SlideshowCategory } from '@/types/slideshow.types';

const SITE_PATH = '/sites/scpngintranet';
const SITE_DOMAIN = 'scpng1.sharepoint.com';
const LIST_NAME = 'InformationSlideshows';

interface SharePointSlideshowField {
  Id: number;
  Title: string;
  Description?: string;
  Category?: SlideshowCategory;
  ImageURL?: string;
  Priority?: string;
  PublishDate?: string;
  ExpiryDate?: string;
  IsActive?: boolean;
  Author0?: string;
  LinkURL?: string;
  OrderIndex?: number;
}

interface SharePointListItem {
  id: string;
  fields: SharePointSlideshowField;
}

interface SharePointListResponse {
  value: SharePointListItem[];
}

/**
 * Transforms SharePoint item to application SlideshowItem type
 */
function transformSlideshowItem(item: SharePointListItem): SlideshowItem {
  const fields = item.fields;
  return {
    id: item.id,
    title: fields.Title || '',
    description: fields.Description || '',
    category: fields.Category || 'MS Office 365 Tips',
    imageUrl: fields.ImageURL,
    priority: fields.Priority === 'High' ? 'High' : 'Normal',
    publishDate: fields.PublishDate || new Date().toISOString(),
    expiryDate: fields.ExpiryDate,
    isActive: fields.IsActive !== false,
    author: fields.Author0,
    linkUrl: fields.LinkURL,
    orderIndex: fields.OrderIndex || 0,
  };
}

export class SlideshowSharePointService {
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
          `Information Slideshows list '${LIST_NAME}' not found. Please create it in SharePoint first.`
        );
      }

      this.listId = lists.value[0].id;
    } catch (error) {
      console.error('Error initializing slideshow service:', error);
      throw error;
    }
  }

  /**
   * Fetches all active slideshows from SharePoint
   */
  async getAllSlideshows(): Promise<SlideshowItem[]> {
    try {
      if (!this.siteId || !this.listId) {
        await this.initialize();
      }

      const now = new Date().toISOString();

      // Build filter for active items
      const filter = `fields/IsActive eq true`;

      const response: SharePointListResponse = await this.client
        .api(`/sites/${this.siteId}/lists/${this.listId}/items`)
        .expand('fields')
        .filter(filter)
        .top(100)
        .get();

      // Transform and filter by date
      const items = response.value
        .map(transformSlideshowItem)
        .filter((item) => {
          const publishDate = new Date(item.publishDate);
          const currentDate = new Date(now);
          const isPublished = publishDate <= currentDate;

          if (item.expiryDate) {
            const expiryDate = new Date(item.expiryDate);
            return isPublished && expiryDate >= currentDate;
          }

          return isPublished;
        })
        .sort((a, b) => {
          // Sort by category, then orderIndex, then publishDate
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
          }
          if ((a.orderIndex || 0) !== (b.orderIndex || 0)) {
            return (a.orderIndex || 0) - (b.orderIndex || 0);
          }
          return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
        });

      return items;
    } catch (error) {
      console.error('Error fetching slideshows from SharePoint:', error);
      throw error;
    }
  }

  /**
   * Fetches slideshows filtered by category
   */
  async getSlideshowsByCategory(category: SlideshowCategory): Promise<SlideshowItem[]> {
    try {
      const allSlides = await this.getAllSlideshows();
      return allSlides.filter((slide) => slide.category === category);
    } catch (error) {
      console.error(`Error fetching ${category} slideshows:`, error);
      throw error;
    }
  }

  /**
   * Creates a new slideshow item
   */
  async createSlideshowItem(item: Omit<SlideshowItem, 'id'>): Promise<SlideshowItem> {
    try {
      if (!this.siteId || !this.listId) {
        await this.initialize();
      }

      const body = {
        fields: {
          Title: item.title,
          Description: item.description,
          Category: item.category,
          ImageURL: item.imageUrl || null,
          Priority: item.priority || 'Normal',
          PublishDate: item.publishDate,
          ExpiryDate: item.expiryDate || null,
          IsActive: item.isActive,
          Author0: item.author || null,
          LinkURL: item.linkUrl || null,
          OrderIndex: item.orderIndex || 0,
        },
      };

      const response = await this.client
        .api(`/sites/${this.siteId}/lists/${this.listId}/items`)
        .post(body);

      return transformSlideshowItem(response);
    } catch (error) {
      console.error('Error creating slideshow item:', error);
      throw error;
    }
  }

  /**
   * Updates an existing slideshow item
   */
  async updateSlideshowItem(
    id: string,
    updates: Partial<Omit<SlideshowItem, 'id'>>
  ): Promise<void> {
    try {
      if (!this.siteId || !this.listId) {
        await this.initialize();
      }

      const body: any = { fields: {} };

      if (updates.title) body.fields.Title = updates.title;
      if (updates.description) body.fields.Description = updates.description;
      if (updates.category) body.fields.Category = updates.category;
      if (updates.imageUrl !== undefined) body.fields.ImageURL = updates.imageUrl;
      if (updates.priority) body.fields.Priority = updates.priority;
      if (updates.publishDate) body.fields.PublishDate = updates.publishDate;
      if (updates.expiryDate !== undefined) body.fields.ExpiryDate = updates.expiryDate;
      if (updates.isActive !== undefined) body.fields.IsActive = updates.isActive;
      if (updates.author !== undefined) body.fields.Author0 = updates.author;
      if (updates.linkUrl !== undefined) body.fields.LinkURL = updates.linkUrl;
      if (updates.orderIndex !== undefined) body.fields.OrderIndex = updates.orderIndex;

      await this.client
        .api(`/sites/${this.siteId}/lists/${this.listId}/items/${id}`)
        .patch(body);
    } catch (error) {
      console.error('Error updating slideshow item:', error);
      throw error;
    }
  }

  /**
   * Deletes a slideshow item (sets IsActive to false)
   */
  async deleteSlideshowItem(id: string): Promise<void> {
    return this.updateSlideshowItem(id, { isActive: false });
  }
}

// Convenience functions that create a service instance
// Note: In production, you should pass the authenticated Graph client from your hook

export async function getAllSlideshows(client: Client): Promise<SlideshowItem[]> {
  const service = new SlideshowSharePointService(client);
  return service.getAllSlideshows();
}

export async function getMSOffice365Tips(client: Client): Promise<SlideshowItem[]> {
  const service = new SlideshowSharePointService(client);
  return service.getSlideshowsByCategory('MS Office 365 Tips');
}

export async function getCapitalMarketNews(client: Client): Promise<SlideshowItem[]> {
  const service = new SlideshowSharePointService(client);
  return service.getSlideshowsByCategory('Capital Market News');
}

export async function getCapitalMarketActs(client: Client): Promise<SlideshowItem[]> {
  const service = new SlideshowSharePointService(client);
  return service.getSlideshowsByCategory('Capital Market Acts');
}

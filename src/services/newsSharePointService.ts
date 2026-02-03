/**
 * SharePoint Service for News Articles
 * Fetches and manages news content from SharePoint NewsArticles list
 * Uses Microsoft Graph API
 */

import { Client } from '@microsoft/microsoft-graph-client';

const SITE_PATH = '/sites/scpngintranet';
const SITE_DOMAIN = 'scpng1.sharepoint.com';
const LIST_NAME = 'NewsArticles';

export interface SharePointNewsItem {
    id: string;
    title: string;
    description: string;
    category: string;
    imageUrl?: string;
    publishDate: string;
    sourceName?: string;
    sourceUrl?: string;
    aiSummary?: string;
    country?: string;
    isActive: boolean;
    articleId: string;
    created?: string;
    createdBy?: any; // Person or Group
    modified?: string;
    modifiedBy?: any; // Person or Group
}

interface SharePointNewsField {
    Id: number;
    Title: string;
    Description?: string;
    Category?: string;
    ImageURL?: string;
    PublishDate?: string;
    SourceName?: string;
    SourceURL?: string;
    AiSummary?: string;
    Country?: string;
    IsActive?: boolean;
    ArticleID?: string;
    Created?: string;
    Author?: any; // Created By
    Modified?: string;
    Editor?: any; // Modified By
}

interface SharePointListItem {
    id: string;
    fields: SharePointNewsField;
}

interface SharePointListResponse {
    value: SharePointListItem[];
}

/**
 * Transforms SharePoint item to application NewsItem type
 */
function transformNewsItem(item: SharePointListItem): SharePointNewsItem {
    const fields = item.fields;
    return {
        id: item.id,
        title: fields.Title || '',
        description: fields.Description || '',
        category: fields.Category || 'General',
        imageUrl: fields.ImageURL,
        publishDate: fields.PublishDate || fields.Created || new Date().toISOString(),
        sourceName: fields.SourceName,
        sourceUrl: fields.SourceURL,
        aiSummary: fields.AiSummary,
        country: fields.Country,
        isActive: fields.IsActive !== false,
        articleId: fields.ArticleID || item.id,
        created: fields.Created,
        createdBy: fields.Author,
        modified: fields.Modified,
        modifiedBy: fields.Editor
    };
}

export class NewsSharePointService {
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
                    `News list '${LIST_NAME}' not found. Please create it in SharePoint first.`
                );
            }

            this.listId = lists.value[0].id;
        } catch (error) {
            console.error('Error initializing news service:', error);
            throw error;
        }
    }

    /**
     * Fetches all active news from SharePoint
     */
    async getAllNews(): Promise<SharePointNewsItem[]> {
        try {
            if (!this.siteId || !this.listId) {
                await this.initialize();
            }

            // Build filter for active items
            // Note: OData filter for boolean might vary, usually 'fields/IsActive eq true' works if column exists
            // If IsActive is not set on some items, we might need to handle nulls or just filter in memory
            const response: SharePointListResponse = await this.client
                .api(`/sites/${this.siteId}/lists/${this.listId}/items`)
                .expand('fields')
                .top(100) // Adjust limit as needed
                .get();

            // Transform and filter in memory to be safe with boolean fields
            const items = response.value
                .map(transformNewsItem)
                .filter((item) => item.isActive)
                .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());

            return items;
        } catch (error) {
            console.error('Error fetching news from SharePoint:', error);
            throw error;
        }
    }

    /**
     * Creates a new news item
     */
    async createNewsItem(item: Omit<SharePointNewsItem, 'id'>): Promise<SharePointNewsItem> {
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
                    PublishDate: item.publishDate,
                    SourceName: item.sourceName || null,
                    SourceURL: item.sourceUrl || null,
                    AiSummary: item.aiSummary || null,
                    Country: item.country || null,
                    // IsActive: item.isActive, // Column missing in SharePoint
                    // ArticleID: item.articleId, // Column missing in SharePoint
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
}

// Convenience function
export async function getAllNews(client: Client): Promise<SharePointNewsItem[]> {
    const service = new NewsSharePointService(client);
    return service.getAllNews();
}

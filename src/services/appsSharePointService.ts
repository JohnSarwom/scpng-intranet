/**
 * Apps SharePoint Service
 * Handles all SharePoint operations for Applications module
 */

import { Client } from '@microsoft/microsoft-graph-client';

const SITE_PATH = '/sites/scpngintranet';
const SITE_DOMAIN = 'scpng1.sharepoint.com';
const APPS_LIST_NAME = 'Applications';
const APP_IMAGES_FOLDER = '/sites/scpngintranet/Asset Images/AppImages';

// Application type definition matching SharePoint structure
export interface SharePointApp {
  id?: string;
  appId: string;
  title: string;
  description?: string;
  icon?: string;
  appUrl: string;
  category: string;
  isExternal?: boolean;
  displayOrder?: number;
  isActive?: boolean;
  createdBy?: string;
  createdDateTime?: string;
  modifiedBy?: string;
  modifiedDateTime?: string;
}

export class AppsSharePointService {
  private client: Client;
  private siteId: string | null = null;
  private listId: string | null = null;

  constructor(client: Client) {
    this.client = client;
    console.log('🔧 [AppsSharePointService] Service initialized');
  }

  /**
   * Initialize service by getting site and list IDs
   */
  async initialize(): Promise<void> {
    try {
      console.log('🔄 [AppsSharePointService] Starting initialization...');

      // Get Site ID
      const site = await this.client
        .api(`/sites/${SITE_DOMAIN}:${SITE_PATH}`)
        .get();

      if (!site || !site.id) {
        throw new Error(`Site not found at ${SITE_DOMAIN}:${SITE_PATH}`);
      }

      this.siteId = site.id;
      console.log('✅ [AppsSharePointService] Site ID obtained:', this.siteId);

      // Get Applications List ID
      const lists = await this.client
        .api(`/sites/${this.siteId}/lists`)
        .filter(`displayName eq '${APPS_LIST_NAME}'`)
        .get();

      if (!lists.value || lists.value.length === 0) {
        throw new Error(`List '${APPS_LIST_NAME}' not found. Please create it first.`);
      }

      this.listId = lists.value[0].id;
      console.log('✅ [AppsSharePointService] Applications List ID obtained:', this.listId);

      console.log('✅ [AppsSharePointService] Initialization complete!');
    } catch (error) {
      console.error('❌ [AppsSharePointService] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Get all applications from SharePoint
   */
  async getApplications(): Promise<SharePointApp[]> {
    try {
      if (!this.siteId || !this.listId) {
        await this.initialize();
      }

      console.log('🔄 [AppsSharePointService] Fetching applications...');

      const response = await this.client
        .api(`/sites/${this.siteId}/lists/${this.listId}/items`)
        .expand('fields')
        .get();

      if (!response || !response.value) {
        console.warn('⚠️ [AppsSharePointService] No applications found');
        return [];
      }

      console.log(`✅ [AppsSharePointService] Found ${response.value.length} applications`);

      const apps: SharePointApp[] = response.value
        .map((item: any) => this.mapSharePointItemToApp(item))
        .filter((app: SharePointApp | null) => app !== null) as SharePointApp[];

      // Sort by display order
      apps.sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));

      console.log('✅ [AppsSharePointService] Applications mapped and sorted');

      return apps;
    } catch (error) {
      console.error('❌ [AppsSharePointService] Error fetching applications:', error);
      throw error;
    }
  }

  /**
   * Get applications filtered by category
   */
  async getApplicationsByCategory(category: string): Promise<SharePointApp[]> {
    const allApps = await this.getApplications();
    return allApps.filter(app =>
      app.category?.toLowerCase() === category.toLowerCase() &&
      app.isActive !== false
    );
  }

  /**
   * Get all unique categories
   */
  async getCategories(): Promise<string[]> {
    const allApps = await this.getApplications();
    const categories = new Set(
      allApps
        .filter(app => app.isActive !== false && app.category)
        .map(app => app.category)
    );
    return Array.from(categories).sort();
  }

  /**
   * Get a single application by ID
   */
  async getApplicationById(appId: string): Promise<SharePointApp | null> {
    const allApps = await this.getApplications();
    return allApps.find(app => app.appId === appId) || null;
  }

  /**
   * Upload an image to SharePoint AppImages folder
   */
  /**
   * Upload an image to SharePoint AppImages folder
   */
  async uploadAppImage(file: File, appId: string, accessToken?: string): Promise<string> {
    try {
      if (!this.siteId) {
        await this.initialize();
      }

      console.log('🔄 [AppsSharePointService] Uploading image for:', appId);
      console.log('📁 [AppsSharePointService] File details:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      // Create unique filename
      const fileExtension = file.name.split('.').pop();
      const fileName = `${appId}-${Date.now()}.${fileExtension}`;
      const folderPath = 'Asset Images/AppImages';

      console.log('📤 [AppsSharePointService] Uploading to:', `${folderPath}/${fileName}`);

      // Use provided token or attempt to retrieve from client (legacy/fallback)
      let tokenToUse = accessToken;

      if (!tokenToUse) {
        // Attempt to get access token from the client's auth provider (legacy method)
        // This is fragile and depends on specific Graph Client configuration
        try {
          const authProvider = (this.client as any).config?.authProvider;
          if (typeof authProvider === 'function') {
            await new Promise<void>((resolve) => {
              authProvider((error: any, token: string) => {
                if (!error && token) {
                  tokenToUse = token;
                }
                resolve();
              });
            });
          } else {
            console.warn('⚠️ [AppsSharePointService] Auth provider is not a function, cannot retrieve token automatically.');
          }
        } catch (e) {
          console.warn('⚠️ [AppsSharePointService] Failed to retrieve token from client internals:', e);
        }
      }

      if (!tokenToUse) {
        throw new Error('Failed to get access token. Please provide it explicitly.');
      }

      // Upload using native fetch API to avoid Graph client's Buffer dependency
      const uploadUrl = `https://graph.microsoft.com/v1.0/sites/${this.siteId}/drive/root:/${folderPath}/${fileName}:/content`;

      console.log('🔑 [AppsSharePointService] Using fetch API for upload');

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${tokenToUse}`,
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file, // Send the File object directly
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Upload failed: ${uploadResponse.statusText} - ${errorText}`);
      }

      const uploadResult = await uploadResponse.json();
      console.log('✅ [AppsSharePointService] Image uploaded successfully, ID:', uploadResult.id);

      // Get the web URL of the uploaded file
      const fileItem = await this.client
        .api(`/sites/${this.siteId}/drive/items/${uploadResult.id}`)
        .select('webUrl,name')
        .get();

      const imageUrl = fileItem.webUrl;
      console.log('✅ [AppsSharePointService] Image URL:', imageUrl);

      return imageUrl;
    } catch (error: any) {
      console.error('❌ [AppsSharePointService] Error uploading image:', error);
      console.error('❌ [AppsSharePointService] Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      throw new Error(`Failed to upload image: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Add a new application (Admin only)
   * Matches your actual SharePoint schema with string fields
   */
  async addApplication(app: Omit<SharePointApp, 'id'>): Promise<SharePointApp> {
    try {
      if (!this.siteId || !this.listId) {
        await this.initialize();
      }

      console.log('🔄 [AppsSharePointService] Adding new application:', app.title);

      // First, get the actual column internal names
      const columns = await this.client
        .api(`/sites/${this.siteId}/lists/${this.listId}/columns`)
        .select('name,displayName')
        .get();

      console.log('📋 [AppsSharePointService] Available columns:');
      columns.value.forEach((col: any) => {
        console.log(`  - Display: "${col.displayName}" → Internal: "${col.name}"`);
      });

      // Find the internal name for "IsExternal" (you renamed it to remove space)
      const isExternalColumn = columns.value.find((col: any) =>
        col.displayName === 'IsExternal' || col.displayName === 'Is External'
      );
      const isExternalFieldName = isExternalColumn?.name || 'IsExternal';

      console.log(`✅ Using field name for IsExternal: ${isExternalFieldName}`);

      // Build the item data
      // Start with basic fields first, then add Icon if present
      const fields: any = {
        Title: app.title,
        App_ID: app.appId,
        Description: app.description || '',
        AppUrl: app.appUrl, // The actual application URL (matches SharePoint column name)
        Category: app.category || 'Custom',
        [isExternalFieldName]: app.isExternal ? 'Yes' : 'No',
        Display_Order: (app.displayOrder || 100).toString(),
        Is_Active: (app.isActive !== false) ? 'Yes' : 'No',
      };

      // Handle Icon field - Now it's a simple text field (not Hyperlink or Picture)
      // This accepts both URLs and emojis as plain text
      if (app.icon) {
        fields.Icon = app.icon;
        console.log('📸 [AppsSharePointService] Icon set as text:', fields.Icon);
      }

      const itemData = { fields };

      console.log('📤 [AppsSharePointService] Sending data:', JSON.stringify(itemData, null, 2));

      const response = await this.client
        .api(`/sites/${this.siteId}/lists/${this.listId}/items`)
        .header('Prefer', 'return=representation')
        .post(itemData);

      console.log('✅ [AppsSharePointService] Application added successfully');

      return this.mapSharePointItemToApp(response)!;
    } catch (error: any) {
      console.error('❌ [AppsSharePointService] Error adding application:', error);

      // Log detailed error information
      if (error.body) {
        console.error('❌ [AppsSharePointService] Error body:', JSON.stringify(error.body, null, 2));
      }
      if (error.statusCode) {
        console.error('❌ [AppsSharePointService] Status code:', error.statusCode);
      }
      if (error.message) {
        console.error('❌ [AppsSharePointService] Error message:', error.message);
      }

      throw error;
    }
  }

  /**
   * Update an existing application (Admin only)
   */
  async updateApplication(itemId: string, updates: Partial<SharePointApp>): Promise<SharePointApp> {
    try {
      if (!this.siteId || !this.listId) {
        await this.initialize();
      }

      console.log('🔄 [AppsSharePointService] Updating application:', itemId);

      // Get the IsExternal column internal name (same as in addApplication)
      const columns = await this.client
        .api(`/sites/${this.siteId}/lists/${this.listId}/columns`)
        .select('name,displayName')
        .get();

      const isExternalColumn = columns.value.find((col: any) =>
        col.displayName === 'IsExternal' || col.displayName === 'Is External'
      );
      const isExternalFieldName = isExternalColumn?.name || 'IsExternal';

      const fields: any = {};

      // Map updates to correct SharePoint field names
      if (updates.title !== undefined) fields.Title = updates.title;
      if (updates.appId !== undefined) fields.App_ID = updates.appId;
      if (updates.description !== undefined) fields.Description = updates.description;
      if (updates.icon !== undefined) fields.Icon = updates.icon;
      if (updates.appUrl !== undefined) fields.AppUrl = updates.appUrl;
      if (updates.category !== undefined) fields.Category = updates.category;
      if (updates.isExternal !== undefined) fields[isExternalFieldName] = updates.isExternal ? 'Yes' : 'No';
      if (updates.displayOrder !== undefined) fields.Display_Order = updates.displayOrder.toString();
      if (updates.isActive !== undefined) fields.Is_Active = updates.isActive ? 'Yes' : 'No';

      const itemData = { fields };

      console.log('📤 [AppsSharePointService] Updating with data:', JSON.stringify(itemData, null, 2));

      const response = await this.client
        .api(`/sites/${this.siteId}/lists/${this.listId}/items/${itemId}`)
        .header('Prefer', 'return=representation')
        .update(itemData);

      console.log('✅ [AppsSharePointService] Application updated successfully');

      // Fetch the updated item
      const updatedItem = await this.client
        .api(`/sites/${this.siteId}/lists/${this.listId}/items/${itemId}`)
        .expand('fields')
        .get();

      return this.mapSharePointItemToApp(updatedItem)!;
    } catch (error: any) {
      console.error('❌ [AppsSharePointService] Error updating application:', error);

      // Log detailed error information
      if (error.body) {
        console.error('❌ [AppsSharePointService] Error body:', JSON.stringify(error.body, null, 2));
      }
      if (error.statusCode) {
        console.error('❌ [AppsSharePointService] Status code:', error.statusCode);
      }
      if (error.message) {
        console.error('❌ [AppsSharePointService] Error message:', error.message);
      }

      throw error;
    }
  }

  /**
   * Delete an application (Admin only)
   */
  async deleteApplication(itemId: string): Promise<void> {
    try {
      if (!this.siteId || !this.listId) {
        await this.initialize();
      }

      console.log('🔄 [AppsSharePointService] Deleting application:', itemId);

      await this.client
        .api(`/sites/${this.siteId}/lists/${this.listId}/items/${itemId}`)
        .delete();

      console.log('✅ [AppsSharePointService] Application deleted successfully');
    } catch (error) {
      console.error('❌ [AppsSharePointService] Error deleting application:', error);
      throw error;
    }
  }

  /**
   * Map SharePoint list item to App object
   * Updated to match your actual schema with string fields
   */
  private mapSharePointItemToApp(item: any): SharePointApp | null {
    try {
      if (!item || !item.fields) {
        console.warn('⚠️ [AppsSharePointService] Invalid item structure:', item);
        return null;
      }

      const fields = item.fields;

      // Required fields validation - using your actual column names
      if (!fields.Title || !fields.App_ID) {
        console.warn('⚠️ [AppsSharePointService] Missing required fields:', fields);
        return null;
      }

      // Helper function to convert string Yes/No to boolean
      const parseYesNo = (value: string | undefined): boolean => {
        return value?.toLowerCase() === 'yes' || value === 'true' || value === '1';
      };

      const app: SharePointApp = {
        id: item.id,
        appId: fields.App_ID?.trim() || '',
        title: fields.Title?.trim() || '',
        description: fields.Description?.trim() || '',
        icon: fields.Icon?.trim() || '',
        appUrl: fields.AppUrl?.trim() || '', // The actual application URL (matches SharePoint column name)
        category: fields.Category?.trim() || 'Custom',
        isExternal: parseYesNo(fields.IsExternal), // Now just IsExternal (no space)
        displayOrder: parseInt(fields.Display_Order || '100'),
        isActive: parseYesNo(fields.Is_Active),
        createdDateTime: fields.Created,
        modifiedDateTime: fields.Modified,
      };

      // Add creator/modifier info if available
      if (fields.Author) {
        app.createdBy = fields.Author.Email || fields.Author.DisplayName || '';
      }
      if (fields.Editor) {
        app.modifiedBy = fields.Editor.Email || fields.Editor.DisplayName || '';
      }

      return app;
    } catch (error) {
      console.error('❌ [AppsSharePointService] Error mapping item:', error, item);
      return null;
    }
  }

  /**
   * Debug: Get list columns to verify field names
   */
  async getListColumns(): Promise<void> {
    try {
      if (!this.siteId || !this.listId) {
        await this.initialize();
      }

      const columns = await this.client
        .api(`/sites/${this.siteId}/lists/${this.listId}/columns`)
        .get();

      console.log('📋 [AppsSharePointService] List columns:');
      columns.value.forEach((col: any) => {
        console.log(`  - ${col.displayName} (${col.name}): ${col.type}`);
        if (col.name === 'Icon') {
          console.log('    📸 Icon column details:', JSON.stringify(col, null, 2));
        }
      });
    } catch (error) {
      console.error('❌ [AppsSharePointService] Error fetching columns:', error);
    }
  }

  /**
   * Debug: Get detailed Icon column information
   */
  async getIconColumnDetails(): Promise<void> {
    try {
      if (!this.siteId || !this.listId) {
        await this.initialize();
      }

      const column = await this.client
        .api(`/sites/${this.siteId}/lists/${this.listId}/columns`)
        .filter("name eq 'Icon'")
        .get();

      console.log('🔍 [AppsSharePointService] Icon column full details:');
      console.log(JSON.stringify(column, null, 2));
    } catch (error) {
      console.error('❌ [AppsSharePointService] Error fetching Icon column:', error);
    }
  }
}

export default AppsSharePointService;

/**
 * Assets SharePoint Service
 * Handles all SharePoint operations for Assets module
 * Includes comprehensive logging for data mapping validation
 */

import { Client } from '@microsoft/microsoft-graph-client';

const SITE_PATH = '/sites/scpngintranet';
const SITE_DOMAIN = 'scpng1.sharepoint.com';
const ASSETS_LIST_NAME = 'Assets';

// Asset type definition matching your Supabase structure
export interface Asset {
  id?: string;
  name: string;
  type: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  condition?: string;
  assigned_to?: string;
  assigned_to_email?: string;
  assigned_date?: string;
  unit?: string;
  division?: string;
  division_id?: string;
  description?: string;
  purchase_date?: string;
  purchase_cost?: number;
  depreciated_value?: number;
  vendor?: string;
  warranty_expiry_date?: string;
  expiry_date?: string;
  life_expectancy_years?: number;
  ytd_usage?: string;
  notes?: string;
  admin_comments?: string;
  invoice_url?: string;
  barcode_url?: string;
  image_url?: string;
  is_deleted?: boolean;
  deleted_at?: string;
  deleted_by?: string;
  created_at?: string;
  created_by?: string;
  last_updated?: string;
  last_updated_by?: string;
}

export class AssetsSharePointService {
  private client: Client;
  private siteId: string | null = null;
  private listId: string | null = null;

  constructor(client: Client) {
    this.client = client;
    console.log('🔧 [AssetsSharePointService] Service initialized');
  }

  /**
   * Initialize service by getting site and list IDs
   */
  async initialize(): Promise<void> {
    try {
      console.log('🔄 [AssetsSharePointService] Starting initialization...');

      // Get Site ID
      const site = await this.client
        .api(`/sites/${SITE_DOMAIN}:${SITE_PATH}`)
        .get();

      if (!site || !site.id) {
        throw new Error(`Site not found at ${SITE_DOMAIN}:${SITE_PATH}`);
      }

      this.siteId = site.id;
      console.log('✅ [AssetsSharePointService] Site ID obtained:', this.siteId);

      // Get Assets List ID
      const lists = await this.client
        .api(`/sites/${this.siteId}/lists`)
        .filter(`displayName eq '${ASSETS_LIST_NAME}'`)
        .get();

      if (!lists.value || lists.value.length === 0) {
        throw new Error(`List '${ASSETS_LIST_NAME}' not found. Please create it first.`);
      }

      this.listId = lists.value[0].id;
      console.log('✅ [AssetsSharePointService] Assets List ID obtained:', this.listId);

      // Debug: List all columns to verify internal names
      await this.getListColumns();

      console.log('✅ [AssetsSharePointService] Initialization complete!');
    } catch (error) {
      console.error('❌ [AssetsSharePointService] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Map Supabase asset field names to SharePoint column names
   */
  private mapToSharePointFields(asset: Partial<Asset>): any {
    console.log('\n📋 [DATA MAPPING] Converting Supabase format to SharePoint format...');
    console.log('📥 [INPUT] Original asset data from frontend:', JSON.stringify(asset, null, 2));

    const mapped: any = {};

    // Field mapping: Supabase → SharePoint
    // IMPORTANT: Mapping based on ACTUAL SharePoint list structure (mostly text fields)
    const fieldMapping = {
      // Basic Info
      'name': 'Title',                          // Single line of text (required)
      'id': 'AssetID',                         // Single line of text
      'type': 'Types',                         // Single line of text - INTERNAL NAME is "Types" (see screenshot URL)
      'brand': 'Brand',                        // Single line of text
      'model': 'Model',                        // Single line of text
      'serial_number': 'SerialNumber',         // Single line of text
      'condition': 'Condition',                // Single line of text

      // Assignment
      'assigned_to': 'AssignedTo',             // Single line of text (NOT Person!)
      'assigned_to_email': 'AssignedToEmail',  // Single line of text
      'assigned_date': 'AssignedDate',         // Single line of text (NOT Date!)

      // Organization
      'unit': 'Unit',                          // Single line of text (NOT Choice!)
      'division': 'Division',                  // Single line of text (NOT Choice!)
      'division_id': 'DivisionID',             // Single line of text

      // Details
      'description': 'Description',            // Multiple lines of text

      // Financial
      'purchase_date': 'PurchaseDate',         // Single line of text (NOT Date!)
      'purchase_cost': 'PurchaseCost',         // Single line of text (NOT Number!)
      'depreciated_value': 'DepreciatedValue', // Single line of text (NOT Number!)
      'vendor': 'Vendor',                      // Single line of text

      // Lifecycle
      'warranty_expiry_date': 'WarrantyExpiryDate', // Date and Time (actual date field!)
      'expiry_date': 'ExpiryDate',             // Single line of text (NOT Date!)
      'life_expectancy_years': 'LifeExpectancyYears', // Single line of text (NOT Number!)
      'ytd_usage': 'YTDUsage',                 // Single line of text

      // Notes
      'notes': 'Notes',                        // Multiple lines of text
      'admin_comments': 'AdminComments',       // Multiple lines of text

      // URLs
      'invoice_url': 'InvoiceURL',             // Single line of text
      'barcode_url': 'BarcodeURL',             // Single line of text
      'image_url': 'ImageURL',                 // Single line of text (changed from Hyperlink)

      // Soft Delete
      'is_deleted': 'IsDeleted',               // Yes/No (Boolean)
      'deleted_at': 'DeletedAt',               // Date and Time
      'deleted_by': 'DeletedBy',               // Person or Group

      // Note: SharePoint auto-handles Created/Modified fields, so we don't map created_by/last_updated_by
    };

    console.log('\n🔄 [FIELD MAPPING] Processing each field...');

    // ACTUAL Date and Time type fields in SharePoint (only these two!)
    const dateFields = ['WarrantyExpiryDate', 'DeletedAt'];

    // Person or Group fields - these need special handling
    const personFields = ['DeletedBy']; // Only DeletedBy is Person field; AssignedTo is text!

    for (const [supabaseField, sharePointField] of Object.entries(fieldMapping)) {
      const value = asset[supabaseField as keyof Asset];

      if (value !== null && value !== undefined && value !== '') {
        // Special handling for boolean fields
        if (sharePointField === 'IsDeleted') {
          mapped[sharePointField] = Boolean(value);
          console.log(`  ✓ ${supabaseField} → ${sharePointField}: ${Boolean(value)} [BOOLEAN]`);
        }
        // Special handling for Date and Time fields (only WarrantyExpiryDate and DeletedAt)
        else if (dateFields.includes(sharePointField)) {
          // SharePoint Date fields need ISO 8601 format with time
          const dateValue = typeof value === 'string' && !value.includes('T')
            ? `${value}T00:00:00Z`
            : value;
          mapped[sharePointField] = dateValue;
          console.log(`  ✓ ${supabaseField} → ${sharePointField}: "${dateValue}" [DATE]`);
        }
        // Person or Group fields - skip for now as they need special handling
        else if (personFields.includes(sharePointField)) {
          // Skip Person/Group fields for now
          console.log(`  ⊗ ${supabaseField} → ${sharePointField}: (Person field - skipped for now)`);
        }
        // All other fields are text - convert everything to string for safety
        else {
          mapped[sharePointField] = String(value);
          console.log(`  ✓ ${supabaseField} → ${sharePointField}: "${String(value)}" [TEXT]`);
        }
      } else {
        console.log(`  ⊗ ${supabaseField} → ${sharePointField}: (empty/null - skipped)`);
      }
    }

    console.log('\n📤 [OUTPUT] Mapped SharePoint fields:', JSON.stringify(mapped, null, 2));
    console.log('✅ [DATA MAPPING] Conversion complete!\n');

    return mapped;
  }

  /**
   * Map SharePoint fields back to Supabase format
   */
  private mapFromSharePointFields(spItem: any): Asset {
    console.log('🔄 [REVERSE MAPPING] Converting SharePoint format to frontend format...');
    console.log('   RAW SharePoint Item:', JSON.stringify(spItem, null, 2));

    const fields = spItem.fields || spItem;
    console.log('   Extracted fields:', JSON.stringify(fields, null, 2));

    const asset: Asset = {
      id: fields.AssetID || spItem.id?.toString(),
      name: fields.Title || '',
      type: fields.Types || '',                          // Internal name is "Types" (see screenshot URL)
      brand: fields.Brand,
      model: fields.Model,
      serial_number: fields.SerialNumber,
      condition: fields.Condition,
      assigned_to: fields.AssignedTo || '',  // Text field, not Person
      assigned_to_email: fields.AssignedToEmail,
      assigned_date: fields.AssignedDate,
      unit: fields.Unit,
      division: fields.Division,
      division_id: fields.DivisionID,
      description: fields.Description,
      purchase_date: fields.PurchaseDate,
      purchase_cost: fields.PurchaseCost ? parseFloat(fields.PurchaseCost) : undefined,
      depreciated_value: fields.DepreciatedValue ? parseFloat(fields.DepreciatedValue) : undefined,
      vendor: fields.Vendor,
      warranty_expiry_date: fields.WarrantyExpiryDate,
      expiry_date: fields.ExpiryDate,
      life_expectancy_years: fields.LifeExpectancyYears ? parseInt(fields.LifeExpectancyYears) : undefined,
      ytd_usage: fields.YTDUsage,
      notes: fields.Notes,
      admin_comments: fields.AdminComments,
      invoice_url: fields.InvoiceURL,
      barcode_url: fields.BarcodeURL,
      image_url: fields.ImageURL || '', // ImageURL is now a text field
      is_deleted: fields.IsDeleted || false,
      deleted_at: fields.DeletedAt,
      deleted_by: fields.DeletedBy?.Title || fields.DeletedBy, // Can be Person/Group or text
      created_at: fields.Created || spItem.createdDateTime,
      created_by: fields.Author?.Title || fields.Author,
      last_updated: fields.Modified || spItem.lastModifiedDateTime,
      last_updated_by: fields.Editor?.Title || fields.Editor,
    };

    console.log('✅ [REVERSE MAPPING] Conversion complete');
    return asset;
  }

  /**
   * Debug helper: Get all column names from SharePoint list
   */
  async getListColumns(): Promise<any> {
    if (!this.siteId || !this.listId) await this.initialize();

    try {
      console.log('\n🔍 [DEBUG] Fetching SharePoint list columns...');
      const columns = await this.client
        .api(`/sites/${this.siteId}/lists/${this.listId}/columns`)
        .get();

      console.log('\n📋 [COLUMNS] SharePoint list has the following columns:');
      console.log('   Display Name → Internal Name (Type)');
      console.log('   ' + '='.repeat(60));
      columns.value.forEach((col: any) => {
        console.log(`   ${col.displayName} → ${col.name} (${col.type || col.columnGroup || 'unknown'})`);
      });

      // Highlight the Type/AssetType column specifically
      const typeColumn = columns.value.find((col: any) =>
        col.displayName === 'Type' ||
        col.displayName === 'AssetType' ||
        col.name === 'Type' ||
        col.name === 'Types' ||
        col.name === 'AssetType'
      );

      if (typeColumn) {
        console.log('\n🎯 [FOUND ASSET TYPE COLUMN]:');
        console.log('   Display Name:', typeColumn.displayName);
        console.log('   Internal Name:', typeColumn.name);
        console.log('   Type:', typeColumn.type);
        console.log('   Full object:', JSON.stringify(typeColumn, null, 2));
      } else {
        console.warn('⚠️  [WARNING] Could not find Type/AssetType column!');
      }

      return columns.value;
    } catch (error) {
      console.error('❌ [DEBUG] Error fetching columns:', error);
      throw error;
    }
  }

  /**
   * Get all assets (with optional user filtering)
   */
  async getAssets(userEmail?: string, isAdmin: boolean = false): Promise<Asset[]> {
    if (!this.siteId || !this.listId) await this.initialize();

    try {
      console.log('\n📊 [GET ASSETS] Fetching assets from SharePoint...');
      console.log(`   User Email: ${userEmail || 'N/A'}`);
      console.log(`   Is Admin: ${isAdmin}`);

      const response = await this.client
        .api(`/sites/${this.siteId}/lists/${this.listId}/items`)
        .expand('fields')
        .top(5000)
        .get();

      console.log(`✅ [GET ASSETS] Retrieved ${response.value?.length || 0} total items from SharePoint`);

      let assets = response.value.map((item: any) => this.mapFromSharePointFields(item));

      // Filter out soft-deleted assets
      assets = assets.filter((asset: Asset) => !asset.is_deleted);
      console.log(`   Active assets (not deleted): ${assets.length}`);

      // Apply user-level filtering (client-side)
      if (!isAdmin && userEmail) {
        console.log(`   🔍 Filtering assets for non-admin user: ${userEmail}`);
        console.log(`   📋 Assets before filter:`, assets.map(a => ({
          name: a.name,
          assigned_to_email: a.assigned_to_email
        })));

        assets = assets.filter((asset: Asset) =>
          asset.assigned_to_email?.toLowerCase() === userEmail.toLowerCase()
        );
        console.log(`   ✂️ Filtered to user's assets: ${assets.length}`);
        console.log(`   📋 Assets after filter:`, assets.map(a => ({
          name: a.name,
          assigned_to_email: a.assigned_to_email
        })));
      } else {
        console.log(`   👑 Admin user - showing all assets (no filtering)`);
      }

      console.log(`✅ [GET ASSETS] Returning ${assets.length} assets to frontend\n`);
      return assets;
    } catch (error) {
      console.error('❌ [GET ASSETS] Error fetching assets:', error);
      throw error;
    }
  }

  /**
   * Get single asset by ID
   */
  async getAssetById(id: string): Promise<Asset | null> {
    if (!this.siteId || !this.listId) await this.initialize();

    try {
      console.log(`\n🔍 [GET ASSET] Fetching asset ID: ${id}`);

      const response = await this.client
        .api(`/sites/${this.siteId}/lists/${this.listId}/items/${id}`)
        .expand('fields')
        .get();

      const asset = this.mapFromSharePointFields(response);
      console.log(`✅ [GET ASSET] Asset found: ${asset.name}\n`);
      return asset;
    } catch (error) {
      console.error(`❌ [GET ASSET] Error fetching asset ${id}:`, error);
      return null;
    }
  }

  /**
   * Add a new asset
   */
  async addAsset(asset: Partial<Asset>): Promise<Asset> {
    if (!this.siteId || !this.listId) await this.initialize();

    console.log('\n' + '='.repeat(80));
    console.log('🆕 [ADD ASSET] Creating new asset in SharePoint...');
    console.log('='.repeat(80));

    // Map fields with detailed logging
    const sharePointFields = this.mapToSharePointFields(asset);

    try {

      console.log('\n📤 [API REQUEST] Sending to SharePoint...');
      console.log(`   Site ID: ${this.siteId}`);
      console.log(`   List ID: ${this.listId}`);
      console.log(`   Endpoint: /sites/${this.siteId}/lists/${this.listId}/items`);
      console.log(`   Full URL: https://graph.microsoft.com/v1.0/sites/${this.siteId}/lists/${this.listId}/items`);
      console.log(`   Method: POST`);
      console.log(`   Payload:`, JSON.stringify({ fields: sharePointFields }, null, 2));
      console.log(`\n🔍 [FIELD COUNT] Sending ${Object.keys(sharePointFields).length} fields to SharePoint`);

      // Strategy: Create with ONLY Title, then PATCH all other fields one by one
      const initialFields: any = {};

      // Start with ONLY the required field (Title)
      if (sharePointFields.Title) {
        initialFields.Title = sharePointFields.Title;
      }

      // CRITICAL: Ensure IsDeleted is explicitly set to false for new assets
      initialFields.IsDeleted = false;

      console.log('\n⚠️  [STEP 1] Creating item with ONLY Title field');
      console.log('   Initial payload:', JSON.stringify(initialFields, null, 2));

      const response = await this.client
        .api(`/sites/${this.siteId}/lists/${this.listId}/items`)
        .post({
          fields: initialFields
        });

      console.log('\n✅ [API RESPONSE] Item created with ID:', response.id);

      // Now PATCH all the other fields (ImageURL is now just a text field, so include it)
      console.log('\n⚠️  [STEP 2] Updating all other fields via PATCH...');

      // Remove Title and IsDeleted since we already set them
      const fieldsToUpdate: any = { ...sharePointFields };
      delete fieldsToUpdate.Title;
      delete fieldsToUpdate.IsDeleted; // Don't override the false we just set

      console.log(`   📝 Updating ${Object.keys(fieldsToUpdate).length} additional fields...`);
      console.log('   Fields to update:', Object.keys(fieldsToUpdate).join(', '));

      if (Object.keys(fieldsToUpdate).length > 0) {
        try {
          await this.client
            .api(`/sites/${this.siteId}/lists/${this.listId}/items/${response.id}`)
            .patch({
              fields: fieldsToUpdate
            });
          console.log('   ✅ All fields updated successfully (including ImageURL)!');
        } catch (patchError: any) {
          console.error('   ❌ Failed to update fields:', patchError.message);
          console.error('   Error details:', JSON.stringify(patchError, null, 2));
          throw patchError; // Re-throw to show this is a real error
        }
      }

      // Fetch the final item to get all fields properly
      console.log('\n🔄 [FETCH] Getting final item state from SharePoint...');
      const finalItem = await this.client
        .api(`/sites/${this.siteId}/lists/${this.listId}/items/${response.id}`)
        .expand('fields')
        .get();

      const createdAsset = this.mapFromSharePointFields(finalItem);

      console.log('\n✅ [ADD ASSET] Asset creation complete!');
      console.log(`   SharePoint Item ID: ${response.id}`);
      console.log(`   Asset Name: ${createdAsset.name}`);
      console.log(`   Image URL: ${createdAsset.image_url || '(none)'}`);
      console.log('='.repeat(80) + '\n');

      return createdAsset;
    } catch (error: any) {
      console.error('\n' + '❌'.repeat(40));
      console.error('❌ [ADD ASSET] FAILED to create asset');
      console.error('❌'.repeat(40));
      console.error('🔍 [DEBUG] Error Details:', error);
      console.error('🔍 [DEBUG] Error Message:', error.message);
      console.error('🔍 [DEBUG] Error Code:', error.code);
      console.error('🔍 [DEBUG] Error Status Code:', error.statusCode);
      console.error('🔍 [DEBUG] Error Response:', error.response);
      console.error('🔍 [DEBUG] Error Body:', error.body);
      console.error('🔍 [DEBUG] Request Payload that FAILED:', JSON.stringify({ fields: sharePointFields }, null, 2));

      // Try to extract more detailed error info
      if (error.body) {
        try {
          const errorBody = typeof error.body === 'string' ? JSON.parse(error.body) : error.body;
          console.error('Parsed Error Body:', JSON.stringify(errorBody, null, 2));
        } catch (e) {
          console.error('Could not parse error body');
        }
      }

      console.error('❌'.repeat(40) + '\n');

      // Create a more helpful error message
      let userFriendlyMessage = error.message;
      if (error.statusCode === 500) {
        userFriendlyMessage = 'SharePoint server error. This usually means a field value doesn\'t match the column type (e.g., Choice field with invalid option). Check console for details.';
      }

      throw new Error(userFriendlyMessage);
    }
  }

  /**
   * Update an existing asset
   */
  async updateAsset(id: string, updates: Partial<Asset>): Promise<Asset> {
    if (!this.siteId || !this.listId) await this.initialize();

    try {
      console.log('\n' + '='.repeat(80));
      console.log(`✏️  [UPDATE ASSET] Updating asset ID: ${id}`);
      console.log('='.repeat(80));

      const sharePointFields = this.mapToSharePointFields(updates);

      console.log(`\n📤 [API REQUEST] Sending update to SharePoint...`);
      console.log(`   Item ID: ${id}`);
      console.log(`   Updates:`, JSON.stringify(sharePointFields, null, 2));

      const response = await this.client
        .api(`/sites/${this.siteId}/lists/${this.listId}/items/${id}`)
        .patch({
          fields: sharePointFields
        });

      console.log('\n✅ [API RESPONSE] Update successful');
      console.log(JSON.stringify(response, null, 2));

      // Fetch the updated item
      const updatedAsset = await this.getAssetById(id);

      console.log('\n✅ [UPDATE ASSET] Asset updated successfully!');
      console.log('='.repeat(80) + '\n');

      return updatedAsset!;
    } catch (error: any) {
      console.error('\n❌ [UPDATE ASSET] Failed to update asset:', error);
      throw error;
    }
  }

  /**
   * Delete an asset (soft delete)
   */
  async deleteAsset(id: string, userEmail: string): Promise<boolean> {
    if (!this.siteId || !this.listId) await this.initialize();

    try {
      console.log(`\n🗑️  [DELETE ASSET] Soft deleting asset ID: ${id}`);
      console.log(`   Deleted by: ${userEmail}`);

      const deleteData: Partial<Asset> = {
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: userEmail,
      };

      await this.updateAsset(id, deleteData);

      console.log('✅ [DELETE ASSET] Asset soft-deleted successfully\n');
      return true;
    } catch (error) {
      console.error('❌ [DELETE ASSET] Failed to delete asset:', error);
      throw error;
    }
  }

  /**
   * Restore a soft-deleted asset
   */
  async restoreAsset(id: string): Promise<Asset> {
    if (!this.siteId || !this.listId) await this.initialize();

    try {
      console.log(`\n♻️  [RESTORE ASSET] Restoring asset ID: ${id}`);

      const restoreData: Partial<Asset> = {
        is_deleted: false,
        deleted_at: undefined,
        deleted_by: undefined,
      };

      const restoredAsset = await this.updateAsset(id, restoreData);

      console.log('✅ [RESTORE ASSET] Asset restored successfully\n');
      return restoredAsset;
    } catch (error) {
      console.error('❌ [RESTORE ASSET] Failed to restore asset:', error);
      throw error;
    }
  }

  /**
   * Hard delete an asset (permanent - admin only)
   */
  async hardDeleteAsset(id: string): Promise<boolean> {
    if (!this.siteId || !this.listId) await this.initialize();

    try {
      console.log(`\n⚠️  [HARD DELETE] Permanently deleting asset ID: ${id}`);

      await this.client
        .api(`/sites/${this.siteId}/lists/${this.listId}/items/${id}`)
        .delete();

      console.log('✅ [HARD DELETE] Asset permanently deleted\n');
      return true;
    } catch (error) {
      console.error('❌ [HARD DELETE] Failed to hard delete asset:', error);
      throw error;
    }
  }
}

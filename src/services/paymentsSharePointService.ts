/**
 * Payments SharePoint Service
 * Handles all CRUD operations for payments stored in SharePoint
 */

import { Client } from '@microsoft/microsoft-graph-client';
import type { Payment } from '@/types/payment.types';
import { SHAREPOINT_CONFIG } from '@/constants/paymentConstants';

const { SITE_PATH, SITE_DOMAIN, PAYMENTS_LIST_NAME } = SHAREPOINT_CONFIG;

export class PaymentsSharePointService {
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
    console.log('================================================================================');
    console.log('🔧 [PaymentsService] Initializing SharePoint connection...');
    console.log('================================================================================');

    try {
      // 1. Get Site ID
      console.log(`📍 [SITE] Fetching site: ${SITE_DOMAIN}:${SITE_PATH}`);
      const site = await this.client.api(`/sites/${SITE_DOMAIN}:${SITE_PATH}`).get();
      this.siteId = site.id;
      console.log(`✅ [SITE] Site ID obtained: ${this.siteId}`);

      // 2. Get Payments List ID
      console.log(`📋 [LIST] Searching for list: "${PAYMENTS_LIST_NAME}"`);
      const lists = await this.client
        .api(`/sites/${this.siteId}/lists`)
        .filter(`displayName eq '${PAYMENTS_LIST_NAME}'`)
        .get();

      if (lists.value.length === 0) {
        throw new Error(
          `Payments list '${PAYMENTS_LIST_NAME}' not found. Please create it first.`
        );
      }

      this.listId = lists.value[0].id;
      console.log(`✅ [LIST] List ID obtained: ${this.listId}`);

      // 3. Debug: List all columns
      await this.getListColumns();

      console.log('✅ [PaymentsService] Initialization complete!');
      console.log('================================================================================');
    } catch (error: any) {
      console.error('❌ [PaymentsService] Initialization FAILED');
      console.error('🔍 [DEBUG] Error Details:', error);
      throw error;
    }
  }

  /**
   * Get all list columns (for debugging)
   */
  private async getListColumns(): Promise<void> {
    try {
      const columns = await this.client
        .api(`/sites/${this.siteId}/lists/${this.listId}/columns`)
        .get();

      console.log(`📊 [COLUMNS] Found ${columns.value.length} columns in list`);
      console.log(
        '🔍 [COLUMNS] Column names:',
        columns.value.map((c: any) => c.name).join(', ')
      );
    } catch (error) {
      console.warn('⚠️  [COLUMNS] Could not fetch columns (non-critical)');
    }
  }

  /**
   * CREATE - Add new payment
   */
  async addPayment(payment: Partial<Payment>): Promise<Payment> {
    console.log('================================================================================');
    console.log('🆕 [ADD PAYMENT] Creating new payment in SharePoint...');
    console.log('================================================================================');

    try {
      // Step 1: Map fields
      console.log('📋 [DATA MAPPING] Converting to SharePoint format...');
      console.log('📥 [INPUT] Payment data:', payment);

      const sharePointFields = this.mapToSharePointFields(payment);
      console.log('📤 [OUTPUT] Mapped SharePoint fields:', sharePointFields);

      // Step 2: Create with minimal required fields first
      console.log('⚠️  [STEP 1] Creating item with minimal required fields...');
      const minimalFields = {
        Title: sharePointFields.Title || 'Untitled Payment',
        PaymentDate: sharePointFields.PaymentDate || new Date().toISOString(),
        Amount: sharePointFields.Amount || 0,
        Currency: sharePointFields.Currency || 'USD',
        PayeeName: sharePointFields.PayeeName || '',
        PayeeType: sharePointFields.PayeeType || 'Other',
        PaymentCategory: sharePointFields.PaymentCategory || 'Other',
        PaymentMethod: sharePointFields.PaymentMethod || 'Other',
        PaymentType: sharePointFields.PaymentType || 'One-Time',
        Unit: sharePointFields.Unit || 'Other',
        BudgetYear: sharePointFields.BudgetYear || new Date().getFullYear().toString(),
        PaymentStatus: sharePointFields.PaymentStatus || 'Draft',
        IsDeleted: false,
      };

      const response = await this.client
        .api(`/sites/${this.siteId}/lists/${this.listId}/items`)
        .post({ fields: minimalFields });

      const itemId = response.id;
      console.log(`✅ [API RESPONSE] Item created with ID: ${itemId}`);

      // Step 3: Patch additional fields
      console.log('⚠️  [STEP 2] Updating all other fields via PATCH...');
      const fieldsToUpdate = { ...sharePointFields };
      // Remove fields already set
      delete fieldsToUpdate.Title;
      delete fieldsToUpdate.IsDeleted;

      if (Object.keys(fieldsToUpdate).length > 0) {
        await this.client
          .api(`/sites/${this.siteId}/lists/${this.listId}/items/${itemId}`)
          .patch({ fields: fieldsToUpdate });
        console.log('✅ [PATCH] Additional fields updated');
      }

      // Step 4: Fetch and return final item
      console.log('📥 [FETCH] Retrieving complete payment record...');
      const finalItem = await this.getPaymentById(itemId);

      if (!finalItem) {
        throw new Error('Failed to retrieve created payment');
      }

      console.log('✅ [ADD PAYMENT] Payment creation complete!');
      console.log(`   SharePoint Item ID: ${itemId}`);
      console.log(`   Payment Title: ${finalItem.title}`);
      console.log('================================================================================');

      return finalItem;
    } catch (error: any) {
      console.error('❌ [ADD PAYMENT] FAILED to create payment');
      console.error('🔍 [DEBUG] Error Details:', error);
      console.error('🔍 [DEBUG] Error Status Code:', error.statusCode);
      throw error;
    }
  }

  /**
   * READ - Get all payments
   */
  async getPayments(
    userEmail?: string,
    isAdmin: boolean = false,
    roleLevel?: string
  ): Promise<Payment[]> {
    console.log('📥 [GET PAYMENTS] Fetching payments from SharePoint...');
    console.log(`   User Email: ${userEmail}`);
    console.log(`   Is Admin: ${isAdmin}`);
    console.log(`   Role Level: ${roleLevel}`);

    try {
      const response = await this.client
        .api(`/sites/${this.siteId}/lists/${this.listId}/items`)
        .expand('fields')
        .top(5000)
        .get();

      console.log(`✅ [GET PAYMENTS] Fetched ${response.value.length} items from SharePoint`);

      let payments = response.value.map((item: any) => this.mapFromSharePointFields(item));

      // Filter soft-deleted
      const beforeDeleteFilter = payments.length;
      payments = payments.filter((p: Payment) => !p.is_deleted);
      console.log(
        `🗑️  [FILTER] Removed ${beforeDeleteFilter - payments.length} soft-deleted payments`
      );

      // Role-based filtering
      if (!isAdmin && userEmail) {
        const beforeRoleFilter = payments.length;
        payments = this.filterPaymentsByRole(payments, userEmail, roleLevel);
        console.log(
          `🔒 [FILTER] Role-based filtering: ${beforeRoleFilter} → ${payments.length} payments`
        );
      }

      console.log(`✅ [GET PAYMENTS] Returning ${payments.length} payments`);
      return payments;
    } catch (error: any) {
      console.error('❌ [GET PAYMENTS] FAILED to fetch payments');
      console.error('🔍 [DEBUG] Error:', error);
      throw error;
    }
  }

  /**
   * READ - Get single payment by ID
   */
  async getPaymentById(id: string): Promise<Payment | null> {
    console.log(`📥 [GET PAYMENT] Fetching payment with ID: ${id}`);

    try {
      const item = await this.client
        .api(`/sites/${this.siteId}/lists/${this.listId}/items/${id}`)
        .expand('fields')
        .get();

      const payment = this.mapFromSharePointFields(item);
      console.log(`✅ [GET PAYMENT] Payment found: ${payment.title}`);
      return payment;
    } catch (error: any) {
      console.error(`❌ [GET PAYMENT] Payment ${id} not found`);
      console.error('🔍 [DEBUG] Error:', error);
      return null;
    }
  }

  /**
   * UPDATE - Update existing payment
   */
  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment> {
    console.log('================================================================================');
    console.log(`📝 [UPDATE PAYMENT] Updating payment ID: ${id}`);
    console.log('================================================================================');

    try {
      console.log('📥 [INPUT] Updates:', updates);

      const sharePointFields = this.mapToSharePointFields(updates);
      console.log('📤 [OUTPUT] Mapped SharePoint fields:', sharePointFields);

      await this.client
        .api(`/sites/${this.siteId}/lists/${this.listId}/items/${id}`)
        .patch({ fields: sharePointFields });

      console.log('✅ [PATCH] Payment updated successfully');

      const updatedPayment = await this.getPaymentById(id);
      if (!updatedPayment) {
        throw new Error('Failed to retrieve updated payment');
      }

      console.log('✅ [UPDATE PAYMENT] Update complete!');
      console.log('================================================================================');

      return updatedPayment;
    } catch (error: any) {
      console.error('❌ [UPDATE PAYMENT] FAILED to update payment');
      console.error('🔍 [DEBUG] Error:', error);
      throw error;
    }
  }

  /**
   * DELETE - Soft delete payment
   */
  async deletePayment(id: string, userEmail: string): Promise<boolean> {
    console.log(`🗑️  [DELETE PAYMENT] Soft deleting payment ID: ${id}`);

    try {
      const deleteData: Partial<Payment> = {
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: userEmail,
      };

      await this.updatePayment(id, deleteData);
      console.log('✅ [DELETE PAYMENT] Payment soft deleted successfully');
      return true;
    } catch (error: any) {
      console.error('❌ [DELETE PAYMENT] FAILED to delete payment');
      console.error('🔍 [DEBUG] Error:', error);
      return false;
    }
  }

  /**
   * RESTORE - Restore soft-deleted payment
   */
  async restorePayment(id: string): Promise<Payment> {
    console.log(`♻️  [RESTORE PAYMENT] Restoring payment ID: ${id}`);

    try {
      const restoreData: Partial<Payment> = {
        is_deleted: false,
        deleted_at: undefined,
        deleted_by: undefined,
      };

      const restoredPayment = await this.updatePayment(id, restoreData);
      console.log('✅ [RESTORE PAYMENT] Payment restored successfully');
      return restoredPayment;
    } catch (error: any) {
      console.error('❌ [RESTORE PAYMENT] FAILED to restore payment');
      console.error('🔍 [DEBUG] Error:', error);
      throw error;
    }
  }

  /**
   * APPROVE - Approve payment
   */
  async approvePayment(
    id: string,
    approverEmail: string,
    approverName: string
  ): Promise<Payment> {
    console.log(`✅ [APPROVE PAYMENT] Approving payment ID: ${id}`);
    console.log(`   Approver: ${approverName} (${approverEmail})`);

    try {
      const approvalData: Partial<Payment> = {
        payment_status: 'Approved',
        approval_status: 'Approved',
        approved_by: approverEmail,
        approved_by_name: approverName,
        approval_date: new Date().toISOString(),
      };

      const approvedPayment = await this.updatePayment(id, approvalData);
      console.log('✅ [APPROVE PAYMENT] Payment approved successfully');
      return approvedPayment;
    } catch (error: any) {
      console.error('❌ [APPROVE PAYMENT] FAILED to approve payment');
      console.error('🔍 [DEBUG] Error:', error);
      throw error;
    }
  }

  /**
   * REJECT - Reject payment
   */
  async rejectPayment(id: string, reason: string, rejectorEmail: string): Promise<Payment> {
    console.log(`❌ [REJECT PAYMENT] Rejecting payment ID: ${id}`);
    console.log(`   Reason: ${reason}`);

    try {
      const rejectionData: Partial<Payment> = {
        payment_status: 'Rejected',
        approval_status: 'Rejected',
        rejection_reason: reason,
        rejection_date: new Date().toISOString(),
      };

      const rejectedPayment = await this.updatePayment(id, rejectionData);
      console.log('✅ [REJECT PAYMENT] Payment rejected successfully');
      return rejectedPayment;
    } catch (error: any) {
      console.error('❌ [REJECT PAYMENT] FAILED to reject payment');
      console.error('🔍 [DEBUG] Error:', error);
      throw error;
    }
  }

  /**
   * MARK AS PAID
   */
  async markAsPaid(id: string): Promise<Payment> {
    console.log(`💰 [MARK AS PAID] Marking payment ID: ${id} as paid`);

    try {
      const paidData: Partial<Payment> = {
        payment_status: 'Paid',
      };

      const paidPayment = await this.updatePayment(id, paidData);
      console.log('✅ [MARK AS PAID] Payment marked as paid successfully');
      return paidPayment;
    } catch (error: any) {
      console.error('❌ [MARK AS PAID] FAILED to mark payment as paid');
      console.error('🔍 [DEBUG] Error:', error);
      throw error;
    }
  }

  /**
   * Map Supabase/App fields to SharePoint fields
   */
  private mapToSharePointFields(payment: Partial<Payment>): any {
    const fieldMapping: Record<string, string> = {
      // Core
      title: 'Title',
      payment_id: 'PaymentID',
      payment_date: 'PaymentDate',
      due_date: 'DueDate',
      amount: 'Amount',
      currency: 'Currency',
      exchange_rate: 'ExchangeRate',
      amount_in_usd: 'AmountInUSD',

      // Payee
      payee_name: 'PayeeName',
      payee_email: 'PayeeEmail',
      payee_type: 'PayeeType',
      vendor_id: 'VendorID',
      bank_account_number: 'BankAccountNumber',
      tax_id: 'TaxID',

      // Classification
      payment_category: 'PaymentCategory',
      subcategory: 'Subcategory',
      payment_method: 'PaymentMethod',
      payment_type: 'PaymentType',
      is_recurring: 'IsRecurring',
      recurrence_pattern: 'RecurrencePattern',
      next_payment_date: 'NextPaymentDate',
      recurrence_end_date: 'RecurrenceEndDate',

      // Organization
      unit: 'Unit',
      division: 'Division',
      division_id: 'DivisionID',
      cost_center: 'CostCenter',
      project_code: 'ProjectCode',
      budget_year: 'BudgetYear',

      // Invoice
      invoice_number: 'InvoiceNumber',
      invoice_date: 'InvoiceDate',
      invoice_amount: 'InvoiceAmount',
      invoice_url: 'InvoiceURL',
      receipt_url: 'ReceiptURL',
      purchase_order_number: 'PurchaseOrderNumber',

      // Approval
      payment_status: 'PaymentStatus',
      approval_status: 'ApprovalStatus',
      approved_by: 'ApprovedBy',
      approved_by_name: 'ApprovedByName',
      approval_date: 'ApprovalDate',
      rejection_reason: 'RejectionReason',
      rejection_date: 'RejectionDate',

      // Asset
      related_asset_id: 'RelatedAssetID',
      related_asset_name: 'RelatedAssetName',
      creates_asset: 'CreatesAsset',

      // Metadata
      description: 'Description',
      notes: 'Notes',
      admin_comments: 'AdminComments',

      // Soft delete
      is_deleted: 'IsDeleted',
      deleted_at: 'DeletedAt',
      deleted_by: 'DeletedBy',
    };

    const mapped: any = {};

    console.log('🔄 [FIELD MAPPING] Processing each field...');

    for (const [appField, spField] of Object.entries(fieldMapping)) {
      const value = payment[appField as keyof Payment];

      if (value !== null && value !== undefined && value !== '') {
        // Boolean fields
        if (['IsDeleted', 'IsRecurring', 'CreatesAsset'].includes(spField)) {
          mapped[spField] = Boolean(value);
          console.log(`  ✓ ${appField} → ${spField}: ${mapped[spField]} [BOOLEAN]`);
        }
        // Number fields
        else if (['Amount', 'ExchangeRate', 'AmountInUSD', 'InvoiceAmount'].includes(spField)) {
          mapped[spField] = Number(value);
          console.log(`  ✓ ${appField} → ${spField}: ${mapped[spField]} [NUMBER]`);
        }
        // Date fields (actual Date and Time columns in SharePoint)
        else if (
          [
            'PaymentDate',
            'DueDate',
            'NextPaymentDate',
            'RecurrenceEndDate',
            'InvoiceDate',
            'ApprovalDate',
            'RejectionDate',
            'DeletedAt',
          ].includes(spField)
        ) {
          const dateValue = typeof value === 'string' && !value.includes('T')
            ? `${value}T00:00:00Z`
            : value;
          mapped[spField] = dateValue;
          console.log(`  ✓ ${appField} → ${spField}: ${dateValue} [DATE]`);
        }
        // All other fields as text
        else {
          mapped[spField] = String(value);
          console.log(`  ✓ ${appField} → ${spField}: "${mapped[spField]}" [TEXT]`);
        }
      } else {
        console.log(`  ⊗ ${appField} → ${spField}: (empty - skipped)`);
      }
    }

    return mapped;
  }

  /**
   * Map SharePoint fields to Supabase/App fields
   */
  private mapFromSharePointFields(spItem: any): Payment {
    const fields = spItem.fields || spItem;

    return {
      id: spItem.id?.toString() || fields.ID?.toString(),
      payment_id: fields.PaymentID,
      title: fields.Title || '',
      payment_date: fields.PaymentDate,
      due_date: fields.DueDate,
      amount: fields.Amount,
      currency: fields.Currency,
      exchange_rate: fields.ExchangeRate,
      amount_in_usd: fields.AmountInUSD,

      payee_name: fields.PayeeName,
      payee_email: fields.PayeeEmail,
      payee_type: fields.PayeeType,
      vendor_id: fields.VendorID,
      bank_account_number: fields.BankAccountNumber,
      tax_id: fields.TaxID,

      payment_category: fields.PaymentCategory,
      subcategory: fields.Subcategory,
      payment_method: fields.PaymentMethod,
      payment_type: fields.PaymentType,
      is_recurring: fields.IsRecurring || false,
      recurrence_pattern: fields.RecurrencePattern,
      next_payment_date: fields.NextPaymentDate,
      recurrence_end_date: fields.RecurrenceEndDate,

      unit: fields.Unit,
      division: fields.Division,
      division_id: fields.DivisionID,
      cost_center: fields.CostCenter,
      project_code: fields.ProjectCode,
      budget_year: fields.BudgetYear,

      invoice_number: fields.InvoiceNumber,
      invoice_date: fields.InvoiceDate,
      invoice_amount: fields.InvoiceAmount,
      invoice_url: fields.InvoiceURL,
      receipt_url: fields.ReceiptURL,
      purchase_order_number: fields.PurchaseOrderNumber,

      payment_status: fields.PaymentStatus,
      approval_status: fields.ApprovalStatus,
      approved_by: fields.ApprovedBy,
      approved_by_name: fields.ApprovedByName,
      approval_date: fields.ApprovalDate,
      rejection_reason: fields.RejectionReason,
      rejection_date: fields.RejectionDate,

      related_asset_id: fields.RelatedAssetID,
      related_asset_name: fields.RelatedAssetName,
      creates_asset: fields.CreatesAsset || false,

      description: fields.Description,
      notes: fields.Notes,
      admin_comments: fields.AdminComments,

      is_deleted: fields.IsDeleted || false,
      deleted_at: fields.DeletedAt,
      deleted_by: fields.DeletedBy,

      created_at: fields.Created || spItem.createdDateTime,
      created_by: fields.Author?.Title || fields.Author,
      last_updated: fields.Modified || spItem.lastModifiedDateTime,
      last_updated_by: fields.Editor?.Title || fields.Editor,
    };
  }

  /**
   * Role-based filtering
   */
  private filterPaymentsByRole(
    payments: Payment[],
    userEmail: string,
    roleLevel?: string
  ): Payment[] {
    console.log(`🔒 [ROLE FILTER] Filtering for role: ${roleLevel}`);

    switch (roleLevel) {
      case 'Admin':
      case 'Finance Manager':
      case 'Finance Staff':
        // See all payments
        return payments;

      case 'Department Head':
        // See department payments (would need integration with employee directory)
        // For now, return all payments
        console.log('⚠️  [ROLE FILTER] Department Head - showing all (TODO: integrate with HR)');
        return payments;

      case 'Unit Manager':
        // See unit payments
        console.log('⚠️  [ROLE FILTER] Unit Manager - showing all (TODO: integrate with HR)');
        return payments;

      default:
        // Regular employees see only their own payments
        return payments.filter(
          (p) =>
            p.payee_email?.toLowerCase() === userEmail.toLowerCase() ||
            p.created_by?.toLowerCase() === userEmail.toLowerCase()
        );
    }
  }
}

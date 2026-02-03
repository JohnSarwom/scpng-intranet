/**
 * Payment Type Definitions
 * Comprehensive TypeScript interfaces for the Payments management system
 */

export type PaymentStatus =
  | 'Draft'
  | 'Pending Approval'
  | 'Approved'
  | 'Rejected'
  | 'Paid'
  | 'Cancelled'
  | 'On Hold';

export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';

export type PaymentCategory =
  | 'Subscription'
  | 'IT Equipment'
  | 'Operational Expense'
  | 'Vendor Payment'
  | 'Employee Reimbursement'
  | 'Utilities'
  | 'Office Supplies'
  | 'Professional Services'
  | 'Travel'
  | 'Training'
  | 'Marketing'
  | 'Other';

export type PayeeType =
  | 'Vendor'
  | 'Employee'
  | 'Contractor'
  | 'Government Agency'
  | 'Other';

export type PaymentMethod =
  | 'Bank Transfer'
  | 'Credit Card'
  | 'Check'
  | 'Cash'
  | 'PayPal'
  | 'Wire Transfer'
  | 'ACH'
  | 'Other';

export type PaymentType =
  | 'One-Time'
  | 'Recurring Monthly'
  | 'Recurring Quarterly'
  | 'Recurring Annually';

export type Currency = 'USD' | 'PHP' | 'EUR' | 'GBP' | 'JPY' | 'SGD' | 'AUD';

export type Unit =
  | 'IT'
  | 'HR'
  | 'Finance'
  | 'Operations'
  | 'Administration'
  | 'Legal'
  | 'Procurement'
  | 'Marketing'
  | 'Sales'
  | 'Other';

export interface Payment {
  // System fields
  id: string;

  // Core payment information
  payment_id?: string;
  title: string;
  payment_date: string;
  due_date?: string;
  amount: number;
  currency: Currency;
  exchange_rate?: number;
  amount_in_usd?: number;

  // Payee information
  payee_name: string;
  payee_email?: string;
  payee_type: PayeeType;
  vendor_id?: string;
  bank_account_number?: string; // Last 4 digits only
  tax_id?: string;

  // Payment classification
  payment_category: PaymentCategory;
  subcategory?: string;
  payment_method: PaymentMethod;
  payment_type: PaymentType;
  is_recurring?: boolean;
  recurrence_pattern?: string;
  next_payment_date?: string;
  recurrence_end_date?: string;

  // Organizational assignment
  unit: Unit;
  division?: string;
  division_id?: string;
  cost_center?: string;
  project_code?: string;
  budget_year: string;

  // Invoice & documentation
  invoice_number?: string;
  invoice_date?: string;
  invoice_amount?: number;
  invoice_url?: string;
  receipt_url?: string;
  purchase_order_number?: string;

  // Approval workflow
  payment_status: PaymentStatus;
  approval_status?: ApprovalStatus;
  approved_by?: string;
  approved_by_name?: string;
  approval_date?: string;
  rejection_reason?: string;
  rejection_date?: string;

  // Asset linkage
  related_asset_id?: string;
  related_asset_name?: string;
  creates_asset?: boolean;

  // Additional metadata
  description?: string;
  notes?: string;
  admin_comments?: string;

  // Soft delete
  is_deleted?: boolean;
  deleted_at?: string;
  deleted_by?: string;

  // Audit trail (auto-generated)
  created_at?: string;
  created_by?: string;
  last_updated?: string;
  last_updated_by?: string;
}

/**
 * Form data type for creating/editing payments
 * Makes some fields optional that will be auto-populated
 */
export interface PaymentFormData extends Partial<Payment> {
  title: string;
  amount: number;
  currency: Currency;
  payee_name: string;
  payee_type: PayeeType;
  payment_category: PaymentCategory;
  payment_method: PaymentMethod;
  payment_type: PaymentType;
  payment_date: string;
  unit: Unit;
  budget_year: string;
}

/**
 * Filter options for payments table
 */
export interface PaymentFilters {
  searchText?: string;
  status?: PaymentStatus[];
  category?: PaymentCategory[];
  payeeType?: PayeeType[];
  unit?: Unit[];
  currency?: Currency[];
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  showDeleted?: boolean;
}

/**
 * Sort configuration for payments table
 */
export interface PaymentSort {
  field: keyof Payment;
  direction: 'asc' | 'desc';
}

/**
 * Statistics for dashboard
 */
export interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  pendingApprovals: number;
  pendingApprovalsAmount: number;
  paidThisMonth: number;
  paidThisMonthAmount: number;
  paidThisYear: number;
  paidThisYearAmount: number;
  overduePayments: number;
  overduePaymentsAmount: number;
  byCategory: Record<PaymentCategory, { count: number; amount: number }>;
  byStatus: Record<PaymentStatus, { count: number; amount: number }>;
  byUnit: Record<string, { count: number; amount: number }>;
  byMonth: Array<{ month: string; amount: number; count: number }>;
  topVendors: Array<{ vendor: string; amount: number; count: number }>;
}

/**
 * Approval threshold configuration
 */
export interface ApprovalThreshold {
  maxAmount: number;
  requiredRole: string;
  requiresMultipleApprovals?: boolean;
}

/**
 * User role for payments
 */
export type PaymentRole =
  | 'Admin'
  | 'Finance Manager'
  | 'Finance Staff'
  | 'Department Head'
  | 'Unit Manager'
  | 'Employee';

/**
 * Permission check result
 */
export interface PaymentPermissions {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canReject: boolean;
  canMarkAsPaid: boolean;
  approvalLimit?: number;
}

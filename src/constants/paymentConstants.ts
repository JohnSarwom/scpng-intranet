/**
 * Payment System Constants
 * Centralized constants for the Payments management system
 */

import type {
  PaymentStatus,
  PaymentCategory,
  PayeeType,
  PaymentMethod,
  PaymentType,
  Currency,
  Unit,
  ApprovalThreshold,
} from '@/types/payment.types';

/**
 * Payment Statuses
 */
export const PAYMENT_STATUSES: PaymentStatus[] = [
  'Draft',
  'Pending Approval',
  'Approved',
  'Rejected',
  'Paid',
  'Cancelled',
  'On Hold',
];

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  'Draft': 'bg-gray-100 text-gray-800',
  'Pending Approval': 'bg-yellow-100 text-yellow-800',
  'Approved': 'bg-green-100 text-green-800',
  'Rejected': 'bg-red-100 text-red-800',
  'Paid': 'bg-blue-100 text-blue-800',
  'Cancelled': 'bg-gray-100 text-gray-600',
  'On Hold': 'bg-orange-100 text-orange-800',
};

/**
 * Payment Categories
 */
export const PAYMENT_CATEGORIES: PaymentCategory[] = [
  'Subscription',
  'IT Equipment',
  'Operational Expense',
  'Vendor Payment',
  'Employee Reimbursement',
  'Utilities',
  'Office Supplies',
  'Professional Services',
  'Travel',
  'Training',
  'Marketing',
  'Other',
];

export const PAYMENT_CATEGORY_ICONS: Record<PaymentCategory, string> = {
  'Subscription': '📅',
  'IT Equipment': '💻',
  'Operational Expense': '⚙️',
  'Vendor Payment': '🏢',
  'Employee Reimbursement': '👤',
  'Utilities': '💡',
  'Office Supplies': '📎',
  'Professional Services': '🎓',
  'Travel': '✈️',
  'Training': '📚',
  'Marketing': '📢',
  'Other': '📦',
};

export const PAYMENT_CATEGORY_DESCRIPTIONS: Record<PaymentCategory, string> = {
  'Subscription': 'Recurring software licenses, cloud services, memberships',
  'IT Equipment': 'Hardware purchases for organizational use',
  'Operational Expense': 'Day-to-day business operations costs',
  'Vendor Payment': 'Payments to external service providers',
  'Employee Reimbursement': 'Reimbursing employees for business expenses',
  'Utilities': 'Regular utility bills (electricity, internet, etc.)',
  'Office Supplies': 'Consumables and office materials',
  'Professional Services': 'Expert services and consulting',
  'Travel': 'Business travel expenses',
  'Training': 'Employee development and training',
  'Marketing': 'Marketing and advertising expenses',
  'Other': 'Miscellaneous payments',
};

/**
 * Payee Types
 */
export const PAYEE_TYPES: PayeeType[] = [
  'Vendor',
  'Employee',
  'Contractor',
  'Government Agency',
  'Other',
];

/**
 * Payment Methods
 */
export const PAYMENT_METHODS: PaymentMethod[] = [
  'Bank Transfer',
  'Credit Card',
  'Check',
  'Cash',
  'PayPal',
  'Wire Transfer',
  'ACH',
  'Other',
];

/**
 * Payment Types
 */
export const PAYMENT_TYPES: PaymentType[] = [
  'One-Time',
  'Recurring Monthly',
  'Recurring Quarterly',
  'Recurring Annually',
];

/**
 * Currencies
 */
export const CURRENCIES: Currency[] = ['USD', 'PHP', 'EUR', 'GBP', 'JPY', 'SGD', 'AUD'];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  PHP: '₱',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  SGD: 'S$',
  AUD: 'A$',
};

/**
 * Units/Departments
 */
export const UNITS: Unit[] = [
  'IT',
  'HR',
  'Finance',
  'Operations',
  'Administration',
  'Legal',
  'Procurement',
  'Marketing',
  'Sales',
  'Other',
];

/**
 * Budget Years
 */
export const BUDGET_YEARS = ['2023', '2024', '2025', '2026', '2027'];

/**
 * Approval Thresholds (in USD)
 */
export const APPROVAL_THRESHOLDS: ApprovalThreshold[] = [
  {
    maxAmount: 500,
    requiredRole: 'Unit Manager',
  },
  {
    maxAmount: 2000,
    requiredRole: 'Department Head',
  },
  {
    maxAmount: 5000,
    requiredRole: 'Department Head',
    requiresMultipleApprovals: true, // Requires Finance Staff too
  },
  {
    maxAmount: 10000,
    requiredRole: 'Finance Manager',
  },
  {
    maxAmount: Infinity,
    requiredRole: 'Finance Manager',
    requiresMultipleApprovals: true, // Requires Admin too
  },
];

/**
 * Role-based permissions
 */
export const ROLE_PERMISSIONS = {
  Admin: {
    canViewAll: true,
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canApprove: true,
    canReject: true,
    canMarkAsPaid: true,
    approvalLimit: Infinity,
  },
  'Finance Manager': {
    canViewAll: true,
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canApprove: true,
    canReject: true,
    canMarkAsPaid: true,
    approvalLimit: 10000,
  },
  'Finance Staff': {
    canViewAll: true,
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canApprove: false,
    canReject: false,
    canMarkAsPaid: true,
    approvalLimit: 0,
  },
  'Department Head': {
    canViewAll: false, // Only department
    canCreate: true,
    canEdit: false,
    canDelete: false,
    canApprove: true,
    canReject: true,
    canMarkAsPaid: false,
    approvalLimit: 5000,
  },
  'Unit Manager': {
    canViewAll: false, // Only unit
    canCreate: true,
    canEdit: false,
    canDelete: false,
    canApprove: true,
    canReject: true,
    canMarkAsPaid: false,
    approvalLimit: 2000,
  },
  Employee: {
    canViewAll: false, // Only own
    canCreate: true, // Only reimbursements
    canEdit: true, // Only own drafts
    canDelete: false,
    canApprove: false,
    canReject: false,
    canMarkAsPaid: false,
    approvalLimit: 0,
  },
};

/**
 * Table configuration
 */
export const ITEMS_PER_PAGE = 15;

export const DEFAULT_PAYMENT_COLUMNS = [
  'payment_id',
  'title',
  'payee_name',
  'amount',
  'currency',
  'payment_date',
  'payment_category',
  'payment_status',
  'unit',
];

/**
 * Recurrence patterns (cron-like)
 */
export const RECURRENCE_PATTERNS = {
  'Recurring Monthly': '0 0 1 * *', // 1st of every month
  'Recurring Quarterly': '0 0 1 */3 *', // 1st of every 3rd month
  'Recurring Annually': '0 0 1 1 *', // 1st of January every year
};

/**
 * Date ranges for filtering
 */
export const DATE_RANGES = [
  { label: 'Today', value: 'today' },
  { label: 'Last 7 days', value: 'last7days' },
  { label: 'Last 30 days', value: 'last30days' },
  { label: 'This Month', value: 'thisMonth' },
  { label: 'Last Month', value: 'lastMonth' },
  { label: 'This Quarter', value: 'thisQuarter' },
  { label: 'This Year', value: 'thisYear' },
  { label: 'Custom Range', value: 'custom' },
];

/**
 * Chart colors for analytics
 */
export const CHART_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#a855f7', // purple
  '#84cc16', // lime
];

/**
 * Export formats
 */
export const EXPORT_FORMATS = [
  { label: 'CSV', value: 'csv', icon: '📄' },
  { label: 'Excel', value: 'xlsx', icon: '📊' },
  { label: 'PDF', value: 'pdf', icon: '📑' },
];

/**
 * SharePoint configuration
 */
export const SHAREPOINT_CONFIG = {
  SITE_PATH: '/sites/scpngintranet',
  SITE_DOMAIN: 'scpng1.sharepoint.com',
  PAYMENTS_LIST_NAME: 'Payments',
  INVOICES_LIBRARY_NAME: 'Payment Documents',
};

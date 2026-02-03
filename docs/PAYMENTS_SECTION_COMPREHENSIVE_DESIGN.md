# Payments Section - Comprehensive Design Document

## Executive Summary

This document outlines the complete design and technical specification for the **Payments Management Section** of the Unitopia Hub intranet system. The Payments section will be positioned directly under the Assets section in the navigation sidebar and will use **SharePoint as the exclusive backend**, following the same proven architecture patterns established in the Assets module.

---

## Table of Contents

1. [Business Requirements](#1-business-requirements)
2. [User Roles & Permissions](#2-user-roles--permissions)
3. [SharePoint List Architecture](#3-sharepoint-list-architecture)
4. [Data Model & Field Definitions](#4-data-model--field-definitions)
5. [Payment Categories & Types](#5-payment-categories--types)
6. [Workflow & Payment Lifecycle](#6-workflow--payment-lifecycle)
7. [Technical Architecture](#7-technical-architecture)
8. [Service Layer Design](#8-service-layer-design)
9. [React Hook Design](#9-react-hook-design)
10. [UI/UX Components](#10-uiux-components)
11. [Security & Audit Trail](#11-security--audit-trail)
12. [Reporting & Analytics](#12-reporting--analytics)
13. [Integration Points](#13-integration-points)
14. [Implementation Roadmap](#14-implementation-roadmap)

---

## 1. Business Requirements

### 1.1 Purpose

The Payments section serves as a centralized financial tracking and management system for recording, monitoring, and reporting all organizational payments including:

- **Subscriptions** (Software licenses, cloud services, memberships)
- **IT Equipment Purchases** (Computers, servers, networking gear)
- **Operational Expenses** (Office supplies, utilities, maintenance)
- **Vendor Payments** (Contractors, consultants, service providers)
- **Employee Reimbursements** (Travel, training, business expenses)
- **Recurring Payments** (Monthly/annual commitments)

### 1.2 Core Objectives

1. **Centralized Financial Tracking**: Single source of truth for all organizational payments
2. **Approval Workflow**: Multi-level approval process for payment authorization
3. **Budget Management**: Track expenditures against departmental budgets
4. **Vendor Management**: Maintain vendor database and payment history
5. **Compliance & Audit**: Complete audit trail for financial compliance
6. **Reporting & Analytics**: Real-time insights into spenqding patterns
7. **Integration with Assets**: Link payments to asset acuisitions

### 1.3 Key Features

- ✅ Payment creation with rich metadata (payee, amount, category, approval status)
- ✅ Multi-currency support (USD, PHP, EUR, etc.)
- ✅ Recurring payment scheduling and tracking
- ✅ Approval workflow (Pending → Approved → Paid)
- ✅ Document attachment (invoices, receipts, purchase orders)
- ✅ Budget allocation and tracking per department/project
- ✅ Payment status tracking (Draft, Pending Approval, Approved, Rejected, Paid, Cancelled)
- ✅ Soft delete with restore capability
- ✅ Advanced filtering (date range, payee, status, amount)
- ✅ Export capabilities (CSV, Excel, PDF reports)
- ✅ Dashboard with spending analytics

---

## 2. User Roles & Permissions

### 2.1 Role Definitions

| Role | Permissions | Access Level |
|------|-------------|--------------|
| **Admin** | Full access to all payments, approve/reject any payment, delete payments, access all reports | All payments across all units |
| **Finance Manager** | Create payments, approve payments up to $10,000, view all payments, generate reports | All payments |
| **Finance Staff** | Create and edit payments, submit for approval, view payments they created | Own payments + department payments |
| **Department Head** | View department payments, approve department payments up to $5,000 | Own department payments |
| **Unit Manager** | View unit payments, approve unit payments up to $2,000 | Own unit payments |
| **Regular Employee** | Create reimbursement requests, view own payments | Own payments only |

### 2.2 Permission Matrix

| Action | Admin | Finance Manager | Finance Staff | Dept Head | Unit Manager | Employee |
|--------|-------|-----------------|---------------|-----------|--------------|----------|
| View all payments | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View department payments | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| View own payments | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create payment | ✅ | ✅ | ✅ | ✅ | ✅ | ✅* |
| Edit payment | ✅ | ✅ | ✅** | ❌ | ❌ | ✅** |
| Approve payment | ✅ | ✅*** | ❌ | ✅*** | ✅*** | ❌ |
| Reject payment | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| Mark as paid | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete payment | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Restore payment | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Generate reports | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Export data | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

\* *Employee can only create reimbursement requests*
\*\* *Can only edit own payments in Draft status*
\*\*\* *Subject to approval limits*

### 2.3 Approval Thresholds

| Amount (USD) | Required Approver(s) |
|--------------|---------------------|
| $0 - $500 | Unit Manager |
| $501 - $2,000 | Department Head |
| $2,001 - $5,000 | Department Head + Finance Staff |
| $5,001 - $10,000 | Finance Manager |
| $10,001+ | Finance Manager + Admin |

---

## 3. SharePoint List Architecture

### 3.1 List Configuration

**SharePoint Site**: `scpng1.sharepoint.com/sites/scpngintranet`
**List Name**: `Payments`
**List Type**: Custom List
**Versioning**: Enabled (Major versions only)
**Checkout Required**: No
**Content Approval**: No (using custom approval workflow)
**Item-Level Permissions**: No (using role-based filtering in application)

### 3.2 Design Principles

Following the proven Assets architecture:

1. **Standalone Design**: No lookup columns or dependencies on other lists
2. **Text Field Strategy**: Use text fields for flexibility where strict validation isn't critical
3. **Minimal Required Fields**: Only critical fields marked as required to avoid creation errors
4. **Soft Delete Pattern**: Never permanently delete items; use IsDeleted flag
5. **Comprehensive Audit Trail**: Track all creation, modification, approval, and deletion events
6. **Self-Documenting**: Clear field names with descriptions

---

## 4. Data Model & Field Definitions

### 4.1 Complete Field List (48 Columns)

#### **Core Payment Information** (8 fields)

| Field Name | SharePoint Internal Name | Field Type | Required | Description |
|------------|-------------------------|------------|----------|-------------|
| Title | Title | Single line of text | ✅ Yes | Payment title/description (e.g., "Microsoft 365 Subscription - January 2025") |
| Payment ID | PaymentID | Single line of text | ❌ No | Unique payment identifier (auto-generated: PAY-2025-001) |
| Payment Date | PaymentDate | Date and Time | ✅ Yes | Date payment was made or scheduled |
| Due Date | DueDate | Date and Time | ❌ No | Payment deadline |
| Amount | Amount | Number (2 decimals) | ✅ Yes | Payment amount |
| Currency | Currency | Choice | ✅ Yes | Currency code (USD, PHP, EUR, GBP, JPY, SGD, AUD) |
| Exchange Rate | ExchangeRate | Number (4 decimals) | ❌ No | Exchange rate to base currency (if applicable) |
| Amount in USD | AmountInUSD | Number (2 decimals) | ❌ No | Converted amount in USD for reporting |

#### **Payee Information** (6 fields)

| Field Name | SharePoint Internal Name | Field Type | Required | Description |
|------------|-------------------------|------------|----------|-------------|
| Payee Name | PayeeName | Single line of text | ✅ Yes | Name of person/company receiving payment |
| Payee Email | PayeeEmail | Single line of text | ❌ No | Payee email address |
| Payee Type | PayeeType | Choice | ✅ Yes | Vendor, Employee, Contractor, Government Agency, Other |
| Vendor ID | VendorID | Single line of text | ❌ No | Vendor identification number |
| Bank Account Number | BankAccountNumber | Single line of text | ❌ No | Payee bank account (last 4 digits only for security) |
| Tax ID | TaxID | Single line of text | ❌ No | Tax identification number (if applicable) |

#### **Payment Classification** (8 fields)

| Field Name | SharePoint Internal Name | Field Type | Required | Description |
|------------|-------------------------|------------|----------|-------------|
| Payment Category | PaymentCategory | Choice | ✅ Yes | Subscription, IT Equipment, Operational Expense, Vendor Payment, Employee Reimbursement, Utilities, Office Supplies, Professional Services, Travel, Training, Marketing, Other |
| Subcategory | Subcategory | Single line of text | ❌ No | More specific category (e.g., "Cloud Storage" under Subscription) |
| Payment Method | PaymentMethod | Choice | ✅ Yes | Bank Transfer, Credit Card, Check, Cash, PayPal, Wire Transfer, ACH, Other |
| Payment Type | PaymentType | Choice | ✅ Yes | One-Time, Recurring Monthly, Recurring Quarterly, Recurring Annually |
| Is Recurring | IsRecurring | Yes/No | ❌ No | Boolean flag for recurring payments |
| Recurrence Pattern | RecurrencePattern | Single line of text | ❌ No | Cron-like pattern for recurring payments (e.g., "0 0 1 * *" = 1st of every month) |
| Next Payment Date | NextPaymentDate | Date and Time | ❌ No | Next scheduled payment date for recurring payments |
| Recurrence End Date | RecurrenceEndDate | Date and Time | ❌ No | When recurring payment ends |

#### **Organizational Assignment** (6 fields)

| Field Name | SharePoint Internal Name | Field Type | Required | Description |
|------------|-------------------------|------------|----------|-------------|
| Unit | Unit | Choice | ✅ Yes | IT, HR, Finance, Operations, Administration, Legal, Procurement, Marketing, Sales, Other |
| Division | Division | Choice | ❌ No | Organizational division |
| Division ID | DivisionID | Single line of text | ❌ No | Division code |
| Cost Center | CostCenter | Single line of text | ❌ No | Cost center code for accounting |
| Project Code | ProjectCode | Single line of text | ❌ No | Project code if payment is project-related |
| Budget Year | BudgetYear | Choice | ✅ Yes | 2023, 2024, 2025, 2026, 2027 |

#### **Invoice & Documentation** (6 fields)

| Field Name | SharePoint Internal Name | Field Type | Required | Description |
|------------|-------------------------|------------|----------|-------------|
| Invoice Number | InvoiceNumber | Single line of text | ❌ No | Vendor invoice number |
| Invoice Date | InvoiceDate | Date and Time | ❌ No | Date on invoice |
| Invoice Amount | InvoiceAmount | Number (2 decimals) | ❌ No | Total invoice amount (may differ from payment if partial) |
| Invoice URL | InvoiceURL | Hyperlink | ❌ No | Link to invoice document in SharePoint |
| Receipt URL | ReceiptURL | Hyperlink | ❌ No | Link to payment receipt |
| Purchase Order Number | PurchaseOrderNumber | Single line of text | ❌ No | PO number if applicable |

#### **Approval Workflow** (7 fields)

| Field Name | SharePoint Internal Name | Field Type | Required | Description |
|------------|-------------------------|------------|----------|-------------|
| Payment Status | PaymentStatus | Choice | ✅ Yes | Draft, Pending Approval, Approved, Rejected, Paid, Cancelled, On Hold |
| Approval Status | ApprovalStatus | Choice | ❌ No | Pending, Approved, Rejected |
| Approved By | ApprovedBy | Single line of text | ❌ No | Email of person who approved |
| Approved By Name | ApprovedByName | Single line of text | ❌ No | Name of approver |
| Approval Date | ApprovalDate | Date and Time | ❌ No | When payment was approved |
| Rejection Reason | RejectionReason | Multiple lines of text | ❌ No | Reason for rejection |
| Rejection Date | RejectionDate | Date and Time | ❌ No | When payment was rejected |

#### **Asset Linkage** (3 fields)

| Field Name | SharePoint Internal Name | Field Type | Required | Description |
|------------|-------------------------|------------|----------|-------------|
| Related Asset ID | RelatedAssetID | Single line of text | ❌ No | Asset ID if payment is for asset purchase |
| Related Asset Name | RelatedAssetName | Single line of text | ❌ No | Asset name for quick reference |
| Creates Asset | CreatesAsset | Yes/No | ❌ No | Flag indicating if this payment should trigger asset creation |

#### **Additional Metadata** (3 fields)

| Field Name | SharePoint Internal Name | Field Type | Required | Description |
|------------|-------------------------|------------|----------|-------------|
| Description | Description | Multiple lines of text | ❌ No | Detailed payment description |
| Notes | Notes | Multiple lines of text | ❌ No | Additional notes |
| Admin Comments | AdminComments | Multiple lines of text | ❌ No | Internal admin comments (not visible to regular users) |

#### **Soft Delete** (3 fields)

| Field Name | SharePoint Internal Name | Field Type | Required | Description |
|------------|-------------------------|------------|----------|-------------|
| Is Deleted | IsDeleted | Yes/No | ❌ No | Soft delete flag (default: No) |
| Deleted At | DeletedAt | Date and Time | ❌ No | When item was deleted |
| Deleted By | DeletedBy | Single line of text | ❌ No | Email of person who deleted |

#### **System Fields** (Auto-Generated by SharePoint)

| Field Name | SharePoint Internal Name | Field Type | Description |
|------------|-------------------------|------------|-------------|
| ID | ID | Counter | Auto-increment unique ID |
| Created | Created | Date and Time | Creation timestamp |
| Created By | Author | Person or Group | Creator |
| Modified | Modified | Date and Time | Last modification timestamp |
| Modified By | Editor | Person or Group | Last modifier |

**Total Fields: 48 custom fields + 5 system fields = 53 total columns**

### 4.2 Field Validation Rules

| Field | Validation Rule |
|-------|-----------------|
| Amount | Must be greater than 0 |
| Payment Date | Cannot be more than 1 year in future |
| Due Date | Must be after or equal to Payment Date |
| Email fields | Must match email format (validated client-side) |
| Bank Account Number | Max 4 characters (last 4 digits only) |
| Amount in USD | Auto-calculated if Currency ≠ USD and ExchangeRate provided |

---

## 5. Payment Categories & Types

### 5.1 Payment Categories (with Examples)

#### **1. Subscription**
*Recurring software licenses, cloud services, memberships*

Examples:
- Microsoft 365 Business Premium
- Adobe Creative Cloud
- AWS Cloud Hosting
- LinkedIn Premium
- Zoom Pro Plan
- GitHub Enterprise
- Slack Business Tier

**Typical Fields**:
- Payment Type: Recurring Monthly/Annually
- Is Recurring: Yes
- Next Payment Date: Auto-calculated

#### **2. IT Equipment**
*Hardware purchases for organizational use*

Examples:
- Dell Latitude 5520 Laptop
- HP LaserJet Pro Printer
- Cisco Network Switch
- External Hard Drives
- Monitors and peripherals

**Typical Fields**:
- Creates Asset: Yes
- Related Asset ID: (linked after asset creation)
- Invoice URL: Required

#### **3. Operational Expense**
*Day-to-day business operations costs*

Examples:
- Office cleaning services
- Security services
- Maintenance and repairs
- Facility management
- Equipment rentals

**Typical Fields**:
- Cost Center: Required
- Payment Type: Usually One-Time or Recurring Monthly

#### **4. Vendor Payment**
*Payments to external service providers*

Examples:
- Website development agency
- Marketing consultant
- Legal firm retainer
- Accounting services
- IT support contractor

**Typical Fields**:
- Payee Type: Vendor
- Vendor ID: Required
- Tax ID: May be required

#### **5. Employee Reimbursement**
*Reimbursing employees for business expenses*

Examples:
- Travel expenses
- Training course fees
- Home office equipment
- Business meal expenses
- Mileage reimbursement

**Typical Fields**:
- Payee Type: Employee
- Payee Email: Required
- Receipt URL: Required

#### **6. Utilities**
*Regular utility bills*

Examples:
- Electricity bill
- Water bill
- Internet service
- Telephone service
- Cloud storage fees

**Typical Fields**:
- Payment Type: Recurring Monthly
- Is Recurring: Yes

#### **7. Office Supplies**
*Consumables and office materials*

Examples:
- Printer paper
- Pens and stationery
- Coffee and pantry supplies
- Cleaning supplies
- Furniture

**Typical Fields**:
- Invoice Number: Required
- Unit: Usually Administration

#### **8. Professional Services**
*Expert services and consulting*

Examples:
- Management consulting
- Technical training
- Certification exams
- Professional memberships
- Industry conferences

**Typical Fields**:
- Project Code: Often required
- Vendor ID: Required

#### **9. Travel**
*Business travel expenses*

Examples:
- Flight tickets
- Hotel accommodations
- Car rentals
- Visa fees
- Travel insurance

**Typical Fields**:
- Receipt URL: Required
- Payee Type: Employee or Vendor

#### **10. Training**
*Employee development and training*

Examples:
- Online courses (Udemy, Coursera)
- Certification programs
- Conference tickets
- Workshop fees
- Books and learning materials

**Typical Fields**:
- Payee Type: Employee (if reimbursement) or Vendor
- Description: Should include course/program name

#### **11. Marketing**
*Marketing and advertising expenses*

Examples:
- Social media ads (Facebook, LinkedIn)
- Google Ads campaigns
- Print materials
- Event sponsorships
- Promotional items

**Typical Fields**:
- Project Code: Campaign code
- Cost Center: Marketing

#### **12. Other**
*Miscellaneous payments not fitting other categories*

Examples:
- Charitable donations
- Government fees
- Penalties or fines
- Emergency expenses

**Typical Fields**:
- Description: Required (explain the payment)

---

## 6. Workflow & Payment Lifecycle

### 6.1 Payment Status Flow

```
┌──────────┐
│  Draft   │ ─────────────────────────────────────┐
└────┬─────┘                                       │
     │ Submit for Approval                        │
     ▼                                             │
┌─────────────────┐                               │
│ Pending Approval│ ◄─────────┐                   │
└────┬────────────┘           │                   │
     │                        │                   │
     ├──► Approve             │ Return for       │
     │                        │ Revision         │
     ▼                        │                   │
┌──────────┐                 │                   │
│ Approved │ ─────────────┬──┘                   │
└────┬─────┘              │                       │
     │                    │                       │
     │ Mark as Paid       │                       │
     ▼                    │                       │
┌──────────┐              │                       │
│   Paid   │              │                       │
└──────────┘              │                       │
                          │                       │
     ┌────────────────────┘                       │
     │ Reject                                     │
     ▼                                             │
┌──────────┐                                      │
│ Rejected │                                      │
└──────────┘                                      │
                                                  │
     ┌────────────────────────────────────────────┘
     │ Cancel (any status)
     ▼
┌───────────┐
│ Cancelled │
└───────────┘
                          ┌──────────┐
                          │ On Hold  │ ◄─── Can be set from any active status
                          └──────────┘
```

### 6.2 Status Definitions

| Status | Description | Who Can Set | Allowed Actions |
|--------|-------------|-------------|-----------------|
| **Draft** | Payment created but not submitted | Creator | Edit, Delete, Submit for Approval, Cancel |
| **Pending Approval** | Submitted and awaiting approval | System (on submit) | Approve, Reject, Return for Revision, Place On Hold |
| **Approved** | Approved and ready for payment | Approver | Mark as Paid, Cancel |
| **Rejected** | Payment request denied | Approver | None (final state, can only view) |
| **Paid** | Payment completed | Finance Staff | None (final state, can only view) |
| **Cancelled** | Payment cancelled by creator or admin | Creator/Admin | None (final state, can only view) |
| **On Hold** | Temporarily suspended | Admin/Approver | Resume (return to previous status) |

### 6.3 Automated Workflows

#### **6.3.1 Recurring Payment Generation**

**Trigger**: Daily scheduled task (runs at 00:00 UTC)

**Logic**:
```
FOR EACH payment WHERE IsRecurring = Yes AND IsDeleted = No:
  IF TODAY >= NextPaymentDate:
    1. Clone payment as new item
    2. Set Payment Date = NextPaymentDate
    3. Set Payment Status = Pending Approval
    4. Increment Payment ID (e.g., PAY-2025-001 → PAY-2025-002)
    5. Update original payment's NextPaymentDate based on RecurrencePattern
    6. Send notification to Finance Staff
```

#### **6.3.2 Approval Escalation**

**Trigger**: Payment in "Pending Approval" status for > 3 business days

**Logic**:
```
IF Payment Status = Pending Approval AND Days Since Submission > 3:
  1. Send reminder email to assigned approver
  2. If no response after 5 days, escalate to next approval level
  3. Log escalation in Admin Comments
```

#### **6.3.3 Overdue Payment Alerts**

**Trigger**: Daily scheduled task

**Logic**:
```
FOR EACH payment WHERE Payment Status IN (Approved, Pending Approval):
  IF Due Date < TODAY AND Due Date IS NOT NULL:
    1. Flag as overdue (add visual indicator)
    2. Send alert to Finance Manager
    3. Increment overdue counter in dashboard
```

#### **6.3.4 Asset Creation Trigger**

**Trigger**: Payment marked as "Paid" with CreatesAsset = Yes

**Logic**:
```
IF Payment Status changed to Paid AND CreatesAsset = Yes:
  1. Check if Related Asset ID exists
  2. If no asset exists:
     a. Pre-populate asset creation form with payment data
     b. Prompt Finance Staff to create asset
     c. Link payment to newly created asset
  3. Update Related Asset ID in payment record
```

---

## 7. Technical Architecture

### 7.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                          │
│  ┌────────────────┐  ┌──────────────────┐  ┌─────────────────┐ │
│  │ PaymentsPage   │  │ Payment Modals   │  │ Reports & Charts│ │
│  │   (Main UI)    │  │ (CRUD Dialogs)   │  │   (Analytics)   │ │
│  └────────┬───────┘  └────────┬─────────┘  └────────┬────────┘ │
│           │                   │                      │          │
│           └───────────────────┼──────────────────────┘          │
│                               │                                 │
│                    ┌──────────▼──────────┐                      │
│                    │ usePaymentsSharePoint│                      │
│                    │   (React Hook)      │                      │
│                    └──────────┬──────────┘                      │
└───────────────────────────────┼─────────────────────────────────┘
                                │
                    ┌───────────▼────────────┐
                    │ Service Layer          │
                    │ ┌────────────────────┐ │
                    │ │ PaymentsSharePoint │ │
                    │ │     Service        │ │
                    │ └──────┬─────────────┘ │
                    └─────────┼───────────────┘
                              │
                    ┌─────────▼──────────┐
                    │ Microsoft Graph API │
                    │  (Authentication)   │
                    └─────────┬───────────┘
                              │
                    ┌─────────▼──────────────┐
                    │  SharePoint Online     │
                    │  ┌──────────────────┐  │
                    │  │  Payments List   │  │
                    │  │  (53 columns)    │  │
                    │  └──────────────────┘  │
                    │  ┌──────────────────┐  │
                    │  │ Document Library │  │
                    │  │  (Invoices)      │  │
                    │  └──────────────────┘  │
                    └────────────────────────┘
```

### 7.2 File Structure

```
src/
├── services/
│   └── paymentsSharePointService.ts      # SharePoint CRUD operations
├── hooks/
│   └── usePaymentsSharePoint.ts          # React hook for state management
├── components/
│   └── payments/
│       ├── PaymentsPage.tsx              # Main payments interface
│       ├── PaymentsDashboard.tsx         # Analytics dashboard
│       ├── PaymentModals.tsx             # CRUD modals
│       │   ├── AddPaymentModal.tsx
│       │   ├── EditPaymentModal.tsx
│       │   ├── ViewPaymentModal.tsx
│       │   └── ApprovalModal.tsx
│       ├── PaymentTable.tsx              # Table view component
│       ├── PaymentCard.tsx               # Card view component
│       └── filters/
│           ├── PaymentFilters.tsx        # Filter panel
│           └── DateRangePicker.tsx       # Date range selector
├── types/
│   └── payment.types.ts                  # TypeScript interfaces
├── constants/
│   └── paymentConstants.ts               # Choice field values, categories
└── utils/
    └── paymentHelpers.ts                 # Utility functions (formatting, calculations)
```

### 7.3 Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend Framework** | React 18 with TypeScript |
| **State Management** | React Hooks (useState, useCallback, useEffect) |
| **UI Components** | shadcn/ui (following Assets pattern) |
| **Authentication** | MSAL (Microsoft Authentication Library) |
| **API Client** | Microsoft Graph SDK (@microsoft/microsoft-graph-client) |
| **Backend** | SharePoint Online (Lists + Document Library) |
| **Date Handling** | date-fns or native Date |
| **Charts & Analytics** | recharts (same as Assets) |
| **Export** | xlsx (Excel export), jsPDF (PDF reports) |
| **Notifications** | Toast notifications (shadcn/ui) |

---

## 8. Service Layer Design

### 8.1 PaymentsSharePointService.ts

**File**: `src/services/paymentsSharePointService.ts`

**Class Structure**:

```typescript
import { Client } from '@microsoft/microsoft-graph-client';
import { Payment } from '@/types/payment.types';

const SITE_PATH = '/sites/scpngintranet';
const SITE_DOMAIN = 'scpng1.sharepoint.com';
const PAYMENTS_LIST_NAME = 'Payments';

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
    // 1. Get Site ID
    const site = await this.client
      .api(`/sites/${SITE_DOMAIN}:${SITE_PATH}`)
      .get();
    this.siteId = site.id;

    // 2. Get Payments List ID
    const lists = await this.client
      .api(`/sites/${this.siteId}/lists`)
      .filter(`displayName eq '${PAYMENTS_LIST_NAME}'`)
      .get();

    if (lists.value.length === 0) {
      throw new Error(`Payments list '${PAYMENTS_LIST_NAME}' not found`);
    }

    this.listId = lists.value[0].id;

    console.log('✅ [PaymentsService] Initialized', {
      siteId: this.siteId,
      listId: this.listId,
    });
  }

  /**
   * CRUD Operations
   */

  // CREATE
  async addPayment(payment: Partial<Payment>): Promise<Payment> {
    const sharePointFields = this.mapToSharePointFields(payment);

    // Step 1: Create with minimal required fields
    const response = await this.client
      .api(`/sites/${this.siteId}/lists/${this.listId}/items`)
      .post({
        fields: {
          Title: sharePointFields.Title,
          PaymentDate: sharePointFields.PaymentDate,
          Amount: sharePointFields.Amount,
          Currency: sharePointFields.Currency,
          PayeeName: sharePointFields.PayeeName,
          PayeeType: sharePointFields.PayeeType,
          PaymentCategory: sharePointFields.PaymentCategory,
          PaymentMethod: sharePointFields.PaymentMethod,
          PaymentType: sharePointFields.PaymentType,
          Unit: sharePointFields.Unit,
          BudgetYear: sharePointFields.BudgetYear,
          PaymentStatus: sharePointFields.PaymentStatus || 'Draft',
          IsDeleted: false,
        },
      });

    // Step 2: Patch additional fields
    const itemId = response.id;
    const fieldsToUpdate = { ...sharePointFields };
    delete fieldsToUpdate.Title; // Already set

    await this.client
      .api(`/sites/${this.siteId}/lists/${this.listId}/items/${itemId}`)
      .patch({ fields: fieldsToUpdate });

    // Step 3: Fetch and return final item
    const finalItem = await this.getPaymentById(itemId);
    return finalItem!;
  }

  // READ (All)
  async getPayments(
    userEmail?: string,
    isAdmin: boolean = false,
    roleLevel?: string
  ): Promise<Payment[]> {
    const response = await this.client
      .api(`/sites/${this.siteId}/lists/${this.listId}/items`)
      .expand('fields')
      .top(5000)
      .get();

    let payments = response.value.map((item: any) =>
      this.mapFromSharePointFields(item)
    );

    // Filter soft-deleted
    payments = payments.filter((p: Payment) => !p.is_deleted);

    // Role-based filtering
    if (!isAdmin && userEmail) {
      payments = this.filterPaymentsByRole(payments, userEmail, roleLevel);
    }

    return payments;
  }

  // READ (Single)
  async getPaymentById(id: string): Promise<Payment | null> {
    try {
      const item = await this.client
        .api(`/sites/${this.siteId}/lists/${this.listId}/items/${id}`)
        .expand('fields')
        .get();

      return this.mapFromSharePointFields(item);
    } catch (error) {
      console.error(`Payment ${id} not found`, error);
      return null;
    }
  }

  // UPDATE
  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment> {
    const sharePointFields = this.mapToSharePointFields(updates);

    await this.client
      .api(`/sites/${this.siteId}/lists/${this.listId}/items/${id}`)
      .patch({ fields: sharePointFields });

    const updatedPayment = await this.getPaymentById(id);
    return updatedPayment!;
  }

  // SOFT DELETE
  async deletePayment(id: string, userEmail: string): Promise<boolean> {
    const deleteData: Partial<Payment> = {
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      deleted_by: userEmail,
    };

    await this.updatePayment(id, deleteData);
    return true;
  }

  // RESTORE
  async restorePayment(id: string): Promise<Payment> {
    const restoreData: Partial<Payment> = {
      is_deleted: false,
      deleted_at: undefined,
      deleted_by: undefined,
    };

    return await this.updatePayment(id, restoreData);
  }

  /**
   * Approval Operations
   */

  async approvePayment(
    id: string,
    approverEmail: string,
    approverName: string
  ): Promise<Payment> {
    const approvalData: Partial<Payment> = {
      payment_status: 'Approved',
      approval_status: 'Approved',
      approved_by: approverEmail,
      approved_by_name: approverName,
      approval_date: new Date().toISOString(),
    };

    return await this.updatePayment(id, approvalData);
  }

  async rejectPayment(
    id: string,
    reason: string
  ): Promise<Payment> {
    const rejectionData: Partial<Payment> = {
      payment_status: 'Rejected',
      approval_status: 'Rejected',
      rejection_reason: reason,
      rejection_date: new Date().toISOString(),
    };

    return await this.updatePayment(id, rejectionData);
  }

  async markAsPaid(id: string): Promise<Payment> {
    const paidData: Partial<Payment> = {
      payment_status: 'Paid',
    };

    return await this.updatePayment(id, paidData);
  }

  /**
   * Field Mapping
   */

  private mapToSharePointFields(payment: Partial<Payment>): any {
    const fieldMapping = {
      // Core
      'title': 'Title',
      'payment_id': 'PaymentID',
      'payment_date': 'PaymentDate',
      'due_date': 'DueDate',
      'amount': 'Amount',
      'currency': 'Currency',
      'exchange_rate': 'ExchangeRate',
      'amount_in_usd': 'AmountInUSD',

      // Payee
      'payee_name': 'PayeeName',
      'payee_email': 'PayeeEmail',
      'payee_type': 'PayeeType',
      'vendor_id': 'VendorID',
      'bank_account_number': 'BankAccountNumber',
      'tax_id': 'TaxID',

      // Classification
      'payment_category': 'PaymentCategory',
      'subcategory': 'Subcategory',
      'payment_method': 'PaymentMethod',
      'payment_type': 'PaymentType',
      'is_recurring': 'IsRecurring',
      'recurrence_pattern': 'RecurrencePattern',
      'next_payment_date': 'NextPaymentDate',
      'recurrence_end_date': 'RecurrenceEndDate',

      // Organization
      'unit': 'Unit',
      'division': 'Division',
      'division_id': 'DivisionID',
      'cost_center': 'CostCenter',
      'project_code': 'ProjectCode',
      'budget_year': 'BudgetYear',

      // Invoice
      'invoice_number': 'InvoiceNumber',
      'invoice_date': 'InvoiceDate',
      'invoice_amount': 'InvoiceAmount',
      'invoice_url': 'InvoiceURL',
      'receipt_url': 'ReceiptURL',
      'purchase_order_number': 'PurchaseOrderNumber',

      // Approval
      'payment_status': 'PaymentStatus',
      'approval_status': 'ApprovalStatus',
      'approved_by': 'ApprovedBy',
      'approved_by_name': 'ApprovedByName',
      'approval_date': 'ApprovalDate',
      'rejection_reason': 'RejectionReason',
      'rejection_date': 'RejectionDate',

      // Asset
      'related_asset_id': 'RelatedAssetID',
      'related_asset_name': 'RelatedAssetName',
      'creates_asset': 'CreatesAsset',

      // Metadata
      'description': 'Description',
      'notes': 'Notes',
      'admin_comments': 'AdminComments',

      // Soft delete
      'is_deleted': 'IsDeleted',
      'deleted_at': 'DeletedAt',
      'deleted_by': 'DeletedBy',
    };

    const mapped: any = {};

    for (const [supabaseField, sharePointField] of Object.entries(fieldMapping)) {
      const value = payment[supabaseField as keyof Payment];

      if (value !== null && value !== undefined && value !== '') {
        // Boolean fields
        if (['IsDeleted', 'IsRecurring', 'CreatesAsset'].includes(sharePointField)) {
          mapped[sharePointField] = Boolean(value);
        }
        // Number fields
        else if (['Amount', 'ExchangeRate', 'AmountInUSD', 'InvoiceAmount'].includes(sharePointField)) {
          mapped[sharePointField] = Number(value);
        }
        // Date fields
        else if ([
          'PaymentDate',
          'DueDate',
          'NextPaymentDate',
          'RecurrenceEndDate',
          'InvoiceDate',
          'ApprovalDate',
          'RejectionDate',
          'DeletedAt'
        ].includes(sharePointField)) {
          const dateValue = typeof value === 'string' && !value.includes('T')
            ? `${value}T00:00:00Z`
            : value;
          mapped[sharePointField] = dateValue;
        }
        // All other fields as text
        else {
          mapped[sharePointField] = String(value);
        }
      }
    }

    return mapped;
  }

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
    switch (roleLevel) {
      case 'Admin':
      case 'Finance Manager':
        return payments; // See all

      case 'Finance Staff':
        // See all payments (but can't approve all)
        return payments;

      case 'Department Head':
        // See department payments
        return payments.filter(p =>
          p.unit === this.getUserDepartment(userEmail)
        );

      case 'Unit Manager':
        // See unit payments
        return payments.filter(p =>
          p.unit === this.getUserUnit(userEmail)
        );

      default:
        // Regular employees see only their own payments
        return payments.filter(p =>
          p.payee_email?.toLowerCase() === userEmail.toLowerCase() ||
          p.created_by?.toLowerCase() === userEmail.toLowerCase()
        );
    }
  }

  // Helper methods (would integrate with employee data)
  private getUserDepartment(email: string): string {
    // TODO: Integrate with HR system or employee directory
    return 'IT';
  }

  private getUserUnit(email: string): string {
    // TODO: Integrate with HR system or employee directory
    return 'IT';
  }
}
```

---

## 9. React Hook Design

### 9.1 usePaymentsSharePoint.ts

**File**: `src/hooks/usePaymentsSharePoint.ts`

```typescript
import { useState, useCallback, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { PaymentsSharePointService } from '@/services/paymentsSharePointService';
import { getGraphClient } from '@/services/graphService';
import { Payment } from '@/types/payment.types';
import { useToast } from '@/hooks/use-toast';
import { useRoleBasedAuth } from '@/hooks/useRoleBasedAuth';

export const usePaymentsSharePoint = () => {
  const { instance: msalInstance } = useMsal();
  const { user: roleUser, isAdmin } = useRoleBasedAuth();
  const { toast } = useToast();

  const [service, setService] = useState<PaymentsSharePointService | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const userEmail = msalInstance.getActiveAccount()?.username;

  /**
   * Initialize Service
   */
  const initializeService = useCallback(async () => {
    try {
      const graphClient = await getGraphClient(msalInstance);
      if (!graphClient) {
        throw new Error('Failed to get Graph client');
      }

      const paymentsService = new PaymentsSharePointService(graphClient);
      await paymentsService.initialize();

      setService(paymentsService);
      return paymentsService;
    } catch (err: any) {
      console.error('❌ [usePaymentsSharePoint] Failed to initialize service', err);
      toast({
        title: 'Initialization Error',
        description: 'Failed to connect to SharePoint. Please refresh the page.',
        variant: 'destructive',
      });
      throw err;
    }
  }, [msalInstance, toast]);

  /**
   * Fetch Payments
   */
  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const paymentsService = service || (await initializeService());
      const fetchedPayments = await paymentsService.getPayments(
        userEmail,
        isAdmin,
        roleUser?.role_name
      );

      setPayments(fetchedPayments);
      return fetchedPayments;
    } catch (err: any) {
      console.error('❌ [usePaymentsSharePoint] Failed to fetch payments', err);
      setError(err.message);
      toast({
        title: 'Error Loading Payments',
        description: err.message || 'Failed to load payments',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [service, userEmail, isAdmin, roleUser, initializeService, toast]);

  /**
   * Add Payment
   */
  const addPayment = useCallback(
    async (paymentData: Partial<Payment>): Promise<Payment> => {
      try {
        const paymentsService = service || (await initializeService());

        // Auto-populate creator info
        const paymentToCreate = {
          ...paymentData,
          created_by: paymentData.created_by || userEmail,
          payment_status: paymentData.payment_status || 'Draft',
        };

        const newPayment = await paymentsService.addPayment(paymentToCreate);

        // Update local state
        setPayments(prev => [...prev, newPayment]);

        toast({
          title: 'Payment Created',
          description: `Payment "${newPayment.title}" has been created successfully.`,
        });

        return newPayment;
      } catch (err: any) {
        console.error('❌ [usePaymentsSharePoint] Failed to add payment', err);
        toast({
          title: 'Error Creating Payment',
          description: err.message || 'Failed to create payment',
          variant: 'destructive',
        });
        throw err;
      }
    },
    [service, userEmail, initializeService, toast]
  );

  /**
   * Update Payment
   */
  const updatePayment = useCallback(
    async (id: string, updates: Partial<Payment>): Promise<Payment> => {
      try {
        const paymentsService = service || (await initializeService());

        const updatesToApply = {
          ...updates,
          last_updated_by: userEmail,
        };

        const updatedPayment = await paymentsService.updatePayment(id, updatesToApply);

        // Update local state
        setPayments(prev =>
          prev.map(payment => (payment.id === id ? updatedPayment : payment))
        );

        toast({
          title: 'Payment Updated',
          description: 'Payment has been updated successfully.',
        });

        return updatedPayment;
      } catch (err: any) {
        console.error('❌ [usePaymentsSharePoint] Failed to update payment', err);
        toast({
          title: 'Error Updating Payment',
          description: err.message || 'Failed to update payment',
          variant: 'destructive',
        });
        throw err;
      }
    },
    [service, userEmail, initializeService, toast]
  );

  /**
   * Delete Payment (Soft Delete)
   */
  const deletePayment = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const paymentsService = service || (await initializeService());
        await paymentsService.deletePayment(id, userEmail!);

        // Remove from local state
        setPayments(prev => prev.filter(payment => payment.id !== id));

        toast({
          title: 'Payment Deleted',
          description: 'Payment has been deleted successfully.',
        });

        return true;
      } catch (err: any) {
        console.error('❌ [usePaymentsSharePoint] Failed to delete payment', err);
        toast({
          title: 'Error Deleting Payment',
          description: err.message || 'Failed to delete payment',
          variant: 'destructive',
        });
        return false;
      }
    },
    [service, userEmail, initializeService, toast]
  );

  /**
   * Restore Payment
   */
  const restorePayment = useCallback(
    async (id: string): Promise<Payment> => {
      try {
        const paymentsService = service || (await initializeService());
        const restoredPayment = await paymentsService.restorePayment(id);

        // Add back to local state
        setPayments(prev => [...prev, restoredPayment]);

        toast({
          title: 'Payment Restored',
          description: 'Payment has been restored successfully.',
        });

        return restoredPayment;
      } catch (err: any) {
        console.error('❌ [usePaymentsSharePoint] Failed to restore payment', err);
        toast({
          title: 'Error Restoring Payment',
          description: err.message || 'Failed to restore payment',
          variant: 'destructive',
        });
        throw err;
      }
    },
    [service, initializeService, toast]
  );

  /**
   * Approve Payment
   */
  const approvePayment = useCallback(
    async (id: string): Promise<Payment> => {
      try {
        const paymentsService = service || (await initializeService());
        const approverName = roleUser?.full_name || userEmail || '';

        const approvedPayment = await paymentsService.approvePayment(
          id,
          userEmail!,
          approverName
        );

        // Update local state
        setPayments(prev =>
          prev.map(payment => (payment.id === id ? approvedPayment : payment))
        );

        toast({
          title: 'Payment Approved',
          description: 'Payment has been approved successfully.',
        });

        return approvedPayment;
      } catch (err: any) {
        console.error('❌ [usePaymentsSharePoint] Failed to approve payment', err);
        toast({
          title: 'Error Approving Payment',
          description: err.message || 'Failed to approve payment',
          variant: 'destructive',
        });
        throw err;
      }
    },
    [service, userEmail, roleUser, initializeService, toast]
  );

  /**
   * Reject Payment
   */
  const rejectPayment = useCallback(
    async (id: string, reason: string): Promise<Payment> => {
      try {
        const paymentsService = service || (await initializeService());
        const rejectedPayment = await paymentsService.rejectPayment(id, reason);

        // Update local state
        setPayments(prev =>
          prev.map(payment => (payment.id === id ? rejectedPayment : payment))
        );

        toast({
          title: 'Payment Rejected',
          description: 'Payment has been rejected.',
          variant: 'destructive',
        });

        return rejectedPayment;
      } catch (err: any) {
        console.error('❌ [usePaymentsSharePoint] Failed to reject payment', err);
        toast({
          title: 'Error Rejecting Payment',
          description: err.message || 'Failed to reject payment',
          variant: 'destructive',
        });
        throw err;
      }
    },
    [service, initializeService, toast]
  );

  /**
   * Mark as Paid
   */
  const markAsPaid = useCallback(
    async (id: string): Promise<Payment> => {
      try {
        const paymentsService = service || (await initializeService());
        const paidPayment = await paymentsService.markAsPaid(id);

        // Update local state
        setPayments(prev =>
          prev.map(payment => (payment.id === id ? paidPayment : payment))
        );

        toast({
          title: 'Payment Marked as Paid',
          description: 'Payment status updated to Paid.',
        });

        return paidPayment;
      } catch (err: any) {
        console.error('❌ [usePaymentsSharePoint] Failed to mark payment as paid', err);
        toast({
          title: 'Error Updating Payment',
          description: err.message || 'Failed to mark payment as paid',
          variant: 'destructive',
        });
        throw err;
      }
    },
    [service, initializeService, toast]
  );

  /**
   * Auto-fetch on mount
   */
  useEffect(() => {
    if (userEmail && roleUser) {
      fetchPayments();
    }
  }, [userEmail, roleUser, isAdmin, fetchPayments]);

  return {
    payments,
    loading,
    error,
    add: addPayment,
    update: updatePayment,
    remove: deletePayment,
    restore: restorePayment,
    approve: approvePayment,
    reject: rejectPayment,
    markAsPaid,
    refresh: fetchPayments,
  };
};
```

---

## 10. UI/UX Components

### 10.1 Main Payments Page

**File**: `src/components/payments/PaymentsPage.tsx`

**Features**:
- Tab navigation (similar to Assets):
  - **Dashboard** (Analytics overview)
  - **All Payments** (Table view with filtering)
  - **Pending Approvals** (Payments awaiting approval)
  - **Recurring Payments** (Scheduled recurring payments)
  - **Reports** (Export and reporting)

**View Modes**:
- Table View (default)
- Card View
- Detailed List View

**Filtering**:
- Text search (searches title, payee, invoice number, description)
- Status filter (Draft, Pending, Approved, Rejected, Paid, Cancelled)
- Category filter (Subscription, IT Equipment, etc.)
- Date range picker (payment date, due date)
- Amount range slider
- Unit/Department filter
- Currency filter

**Sorting**:
- Sort by: Payment Date, Amount, Status, Payee, Category
- Ascending/descending toggle

**Actions**:
- Add New Payment
- Edit Payment (if status = Draft or user has permission)
- View Details
- Approve/Reject (if user has approval rights)
- Mark as Paid (Finance Staff/Manager)
- Delete (soft delete)
- Export (CSV, Excel)

### 10.2 Dashboard Tab

**Widgets**:

1. **KPI Cards** (Top Row)
   - Total Payments This Month ($)
   - Pending Approvals (count)
   - Total Paid This Year ($)
   - Overdue Payments (count)

2. **Charts** (Middle Row)
   - **Spending by Category** (Pie Chart)
   - **Monthly Spending Trend** (Line Chart, last 12 months)
   - **Payment Status Distribution** (Bar Chart)

3. **Tables** (Bottom Row)
   - **Recent Payments** (Last 10 payments)
   - **Upcoming Due Dates** (Next 7 days)
   - **Top Vendors** (By total payment amount)

### 10.3 Modal Components

#### **AddPaymentModal**

**Sections**:

1. **Basic Information**
   - Title (text input)
   - Payment Category (dropdown)
   - Payment Type (dropdown: One-Time, Recurring)
   - Amount (number input with currency selector)

2. **Payee Details**
   - Payee Name (text input or employee selector)
   - Payee Type (dropdown)
   - Payee Email (text input)
   - Vendor ID (text input, optional)

3. **Payment Details**
   - Payment Method (dropdown)
   - Payment Date (date picker)
   - Due Date (date picker, optional)
   - Invoice Number (text input, optional)

4. **Organization**
   - Unit (dropdown)
   - Division (dropdown, optional)
   - Cost Center (text input, optional)
   - Project Code (text input, optional)
   - Budget Year (dropdown)

5. **Recurring Settings** (visible if Payment Type = Recurring)
   - Recurrence Pattern (dropdown: Monthly, Quarterly, Annually)
   - Next Payment Date (date picker)
   - Recurrence End Date (date picker, optional)

6. **Attachments**
   - Upload Invoice (file upload → SharePoint)
   - Upload Receipt (file upload → SharePoint)

7. **Additional Info**
   - Description (textarea)
   - Notes (textarea)
   - Admin Comments (textarea, admin-only)

**Validation**:
- Required fields: Title, Amount, Currency, Payee Name, Payee Type, Payment Category, Payment Method, Payment Date, Unit, Budget Year
- Amount > 0
- Payment Date not more than 1 year in future
- Due Date >= Payment Date (if provided)

**Actions**:
- Save as Draft
- Submit for Approval
- Cancel

#### **EditPaymentModal**

Same fields as Add, but:
- Pre-populated with existing data
- Show creation and modification audit info
- Delete button (soft delete)
- Status indicator

**Actions**:
- Update
- Submit for Approval (if status = Draft)
- Delete
- Cancel

#### **ViewPaymentModal**

Read-only view showing all fields including:
- Payment information
- Payee details
- Approval history (who approved, when, comments)
- Rejection reason (if rejected)
- Audit trail (created by, modified by, timestamps)
- Related asset (if applicable)
- Attachments (clickable links)

**Actions**:
- Edit (if user has permission)
- Approve/Reject (if user is approver)
- Mark as Paid (if Finance Staff/Manager)
- Print/Export
- Close

#### **ApprovalModal**

Shown when approver clicks "Approve" or "Reject":

**For Approval**:
- Show payment summary
- Optional approval comments
- Confirm button

**For Rejection**:
- Show payment summary
- **Required** rejection reason (textarea)
- Confirm button

### 10.4 Responsive Design

**Desktop** (>1024px):
- Full table view with all columns
- Sidebar filters panel
- Dashboard with 3-column grid

**Tablet** (768px - 1024px):
- Condensed table (hide less important columns)
- Collapsible filter panel
- Dashboard with 2-column grid

**Mobile** (<768px):
- Card view default
- Bottom sheet filters
- Dashboard with single-column stack
- Simplified modals with accordion sections

---

## 11. Security & Audit Trail

### 11.1 Authentication & Authorization

**Authentication**:
- MSAL with Microsoft Entra ID (same as Assets)
- Required scopes: `Sites.ReadWrite.All`, `Files.ReadWrite.All`, `User.Read.All`

**Authorization Layers**:

1. **Application Layer** (React)
   - Role-based UI rendering (hide/show actions based on role)
   - Client-side validation before API calls

2. **Service Layer** (TypeScript)
   - Role-based data filtering
   - Permission checks before CRUD operations

3. **SharePoint Layer** (SharePoint Online)
   - SharePoint permissions (all authenticated users can access Payments list)
   - Item-level security not used (handled in application)

### 11.2 Audit Trail

**Automatic Tracking** (SharePoint System Fields):
- Created (timestamp)
- Created By (Person)
- Modified (timestamp)
- Modified By (Person)

**Custom Tracking Fields**:
- Approved By (email)
- Approved By Name (text)
- Approval Date (timestamp)
- Rejection Date (timestamp)
- Deleted At (timestamp)
- Deleted By (email)

**Audit Log Features**:
- All payment modifications logged
- Approval/rejection actions tracked
- Soft delete trail preserved
- Immutable history (versioning in SharePoint)

**Audit Reports**:
- Payment History by User
- Approval Activity Log
- Deleted Payments Report
- Modification Timeline

### 11.3 Data Security

**Sensitive Data Handling**:
- Bank Account Numbers: Store only last 4 digits
- Tax IDs: Encrypted at rest (SharePoint default encryption)
- Invoice URLs: Secure SharePoint links with authentication
- Admin Comments: Visible only to Admin/Finance Manager roles

**Access Logging**:
- Log all data access attempts
- Track failed authentication attempts
- Monitor unusual activity patterns

---

## 12. Reporting & Analytics

### 12.1 Pre-built Reports

#### **1. Monthly Spending Report**

**Filters**:
- Month/Year selector
- Unit/Department filter
- Payment Category filter

**Sections**:
- Total spending by category (table + chart)
- Comparison to previous month
- Budget utilization (if budget data available)
- Top 10 vendors by amount
- Payment method breakdown

**Export**: PDF, Excel

#### **2. Annual Financial Summary**

**Filters**:
- Year selector
- Unit/Department filter

**Sections**:
- Year-over-year comparison
- Quarterly trends
- Category breakdown
- Recurring vs one-time payments
- Budget vs actual (if budget data available)

**Export**: PDF, Excel

#### **3. Vendor Payment History**

**Filters**:
- Vendor selector
- Date range

**Sections**:
- All payments to selected vendor
- Total amount paid
- Payment frequency
- Outstanding payments
- Average payment amount

**Export**: PDF, Excel

#### **4. Pending Approvals Report**

**Filters**:
- Approver filter
- Date range
- Amount threshold

**Sections**:
- List of payments pending approval
- Aging analysis (how long pending)
- Total amount pending
- Overdue approvals

**Export**: PDF, Excel

#### **5. Recurring Payments Schedule**

**Filters**:
- Date range (next X months)
- Category filter

**Sections**:
- Upcoming recurring payments (calendar view)
- Total projected spend
- Payment frequency distribution

**Export**: PDF, Excel, iCal

### 12.2 Dashboard Analytics

**Real-Time Metrics**:
- Total payments count
- Total amount (all-time, YTD, MTD)
- Average payment amount
- Pending approval count and amount
- Overdue payments

**Trend Analysis**:
- Month-over-month spending growth
- Category spending trends
- Vendor payment patterns

**Interactive Charts**:
- Click to drill down
- Filter by date range
- Export chart data

---

## 13. Integration Points

### 13.1 Integration with Assets Module

**Linkage**:
- `RelatedAssetID` field in Payments links to Asset record
- When payment is marked as Paid and `CreatesAsset` = Yes:
  - Prompt to create asset
  - Pre-populate asset form with payment data (vendor, purchase date, cost)
  - Link asset back to payment

**Benefits**:
- Complete financial trail for asset acquisitions
- Automatic depreciation calculation based on purchase cost
- Vendor consistency across assets and payments

**Implementation**:
```typescript
// When marking payment as paid
if (payment.creates_asset && payment.payment_status === 'Paid') {
  // Check if asset already exists
  const existingAsset = await getAssetByPaymentId(payment.id);

  if (!existingAsset) {
    // Show asset creation prompt
    showAssetCreationModal({
      preFilled: {
        name: payment.title,
        vendor: payment.payee_name,
        purchase_date: payment.payment_date,
        purchase_cost: payment.amount,
        invoice_url: payment.invoice_url,
      },
      onSave: async (newAsset) => {
        // Link payment to asset
        await updatePayment(payment.id, {
          related_asset_id: newAsset.id,
          related_asset_name: newAsset.name,
        });
      },
    });
  }
}
```

### 13.2 Integration with HR/Employee Directory

**Employee Data**:
- Use Microsoft Graph API to fetch employee list
- Auto-complete employee name when creating reimbursement
- Populate Payee Email from employee profile

**Department/Unit Mapping**:
- Fetch user's department from Azure AD or employee directory
- Auto-filter payments by user's department (for Department Heads)

### 13.3 Integration with Budget System (Future)

**Budget Allocation**:
- Track spending against departmental budgets
- Alert when approaching budget limit
- Show budget utilization in dashboard

**Budget Fields** (to be added later):
- Allocated Budget (per unit/department/year)
- Remaining Budget
- Budget Utilization %

---

## 14. Implementation Roadmap

### 14.1 Phase 1: Foundation (Week 1-2)

**Tasks**:
1. Create SharePoint Payments list with all 53 columns
2. Configure list settings (versioning, permissions)
3. Create document library for invoices/receipts
4. Implement `PaymentsSharePointService.ts` with full CRUD
5. Implement `usePaymentsSharePoint.ts` hook
6. Create TypeScript types (`payment.types.ts`)

**Deliverables**:
- Working backend integration
- Successful CRUD operations tested via console
- Field mapping validated

### 14.2 Phase 2: Basic UI (Week 3-4)

**Tasks**:
1. Create `PaymentsPage.tsx` with tab navigation
2. Implement table view with sorting and pagination
3. Create `AddPaymentModal` with all fields
4. Create `EditPaymentModal`
5. Create `ViewPaymentModal`
6. Implement basic filtering (status, category, date range)

**Deliverables**:
- Functional payments management interface
- Users can add, edit, view, delete payments
- Basic filtering and sorting working

### 14.3 Phase 3: Approval Workflow (Week 5-6)

**Tasks**:
1. Implement role-based data filtering
2. Create `ApprovalModal` component
3. Add approval/rejection functionality
4. Implement approval threshold logic
5. Add email notifications for approvals (if applicable)
6. Create "Pending Approvals" tab

**Deliverables**:
- Working approval workflow
- Role-based access control
- Approval notifications

### 14.4 Phase 4: Advanced Features (Week 7-8)

**Tasks**:
1. Implement recurring payment logic
2. Create dashboard with analytics
3. Add charts (spending trends, category breakdown)
4. Implement file upload for invoices/receipts
5. Create card view and detailed list view
6. Add advanced filters (amount range, vendor, etc.)

**Deliverables**:
- Dashboard with analytics
- Recurring payment automation
- Multiple view modes
- Document attachments

### 14.5 Phase 5: Reporting & Integration (Week 9-10)

**Tasks**:
1. Implement pre-built reports
2. Add export functionality (CSV, Excel, PDF)
3. Integrate with Assets module (asset linkage)
4. Create vendor payment history view
5. Implement budget tracking (if budget data available)
6. Add audit trail viewer

**Deliverables**:
- Comprehensive reporting system
- Export capabilities
- Asset-payment linkage working
- Audit trail accessible

### 14.6 Phase 6: Testing & Refinement (Week 11-12)

**Tasks**:
1. End-to-end testing of all workflows
2. User acceptance testing (UAT)
3. Performance optimization
4. Bug fixes and refinements
5. Documentation (user guide, admin guide)
6. Training materials

**Deliverables**:
- Production-ready Payments section
- User documentation
- Training completed

---

## 15. Additional Considerations

### 15.1 Performance Optimization

**Strategies**:
- Implement pagination (15-50 items per page)
- Use React.memo for expensive components
- Debounce search and filter inputs
- Cache SharePoint responses (5-minute cache)
- Lazy load tabs (only fetch data when tab is active)

### 15.2 Error Handling

**User-Facing Errors**:
- Toast notifications for all errors
- Friendly error messages (avoid technical jargon)
- Actionable error messages ("Click here to retry")

**Developer Errors**:
- Comprehensive console logging
- Error details in Admin Comments field
- Error tracking integration (Sentry, Application Insights)

### 15.3 Accessibility

**WCAG 2.1 AA Compliance**:
- Keyboard navigation support
- Screen reader friendly (ARIA labels)
- High contrast mode support
- Focus indicators
- Accessible date pickers and dropdowns

### 15.4 Internationalization (Future)

**Multi-Language Support**:
- English (primary)
- Spanish, French, German (future)
- Currency localization
- Date format localization

### 15.5 Mobile App (Future)

**Mobile Features**:
- Approve/reject payments on mobile
- View payment details
- Upload receipts via camera
- Push notifications for approvals

---

## Summary

The Payments section is designed as a comprehensive financial management system that mirrors the proven architecture of the Assets module while adding sophisticated approval workflows, recurring payment automation, and deep financial analytics. By using **SharePoint as the exclusive backend**, the system maintains consistency with existing infrastructure while providing a scalable, secure, and audit-ready solution for managing all organizational payments.

**Key Strengths**:
- ✅ Proven architecture (follows Assets pattern)
- ✅ Comprehensive data model (48 custom fields)
- ✅ Role-based access control with approval workflows
- ✅ Soft delete with complete audit trail
- ✅ Recurring payment automation
- ✅ Asset integration for procurement tracking
- ✅ Rich reporting and analytics
- ✅ Document attachment support
- ✅ Multi-currency support
- ✅ Scalable and maintainable codebase

**Next Steps**:
1. Review and approve this design document
2. Create SharePoint Payments list with defined schema
3. Begin Phase 1 implementation (Service layer)
4. Iterate with stakeholder feedback

---

**Document Version**: 1.0
**Last Updated**: {{ current_date }}
**Author**: Claude (AI Assistant)
**Reviewed By**: [To be filled]

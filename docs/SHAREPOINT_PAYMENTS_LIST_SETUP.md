

 # SharePoint Payments List Setup Guide

**Complete step-by-step guide for creating the Payments list in SharePoint Online**

---

## Overview

This guide will walk you through creating the **Payments** list in your SharePoint site with all 48 custom columns required for the Payments management system.

**SharePoint Site**: `https://scpng1.sharepoint.com/sites/scpngintranet`
**List Name**: `Payments`

---

## Part 1: Create the List

### Step 1: Navigate to Your SharePoint Site

1. Go to `https://scpng1.sharepoint.com/sites/scpngintranet`
2. Click **New** → **List**
3. Select **Blank list**
4. Name: `Payments`
5. Description: `Payment tracking and management system`
6. Click **Create**

---

## Part 2: Add Custom Columns

### **Core Payment Information** (8 columns)

#### 1. PaymentID
- Column type: **Single line of text**
- Required: **No**
- Description: `Unique payment identifier (e.g., PAY-2025-001)`

#### 2. PaymentDate
- Column type: **Date and Time**
- Date and Time format: **Date Only**
- Required: **Yes**
- Default value: **Today's date**
- Description: `Date payment was made or scheduled`

#### 3. DueDate
- Column type: **Date and Time**
- Date and Time format: **Date Only**
- Required: **No**
- Description: `Payment deadline`

#### 4. Amount
- Column type: **Number**
- Number of decimal places: **2**
- Minimum value: **0**
- Required: **Yes**
- Description: `Payment amount`

#### 5. Currency
- Column type: **Choice**
- Choices (enter each on a new line):
  ```
  USD
  PHP
  EUR
  GBP
  JPY
  SGD
  AUD
  ```
- Default value: **USD**
- Required: **Yes**
- Description: `Currency code`

#### 6. ExchangeRate
- Column type: **Number**
- Number of decimal places: **4**
- Minimum value: **0**
- Required: **No**
- Description: `Exchange rate to base currency (if applicable)`

#### 7. AmountInUSD
- Column type: **Number**
- Number of decimal places: **2**
- Minimum value: **0**
- Required: **No**
- Description: `Converted amount in USD for reporting`

---

### **Payee Information** (6 columns)

#### 8. PayeeName
- Column type: **Single line of text**
- Required: **Yes**
- Description: `Name of person/company receiving payment`

#### 9. PayeeEmail
- Column type: **Single line of text**
- Required: **No**
- Description: `Payee email address`

#### 10. PayeeType
- Column type: **Choice**
- Choices:
  ```
  Vendor
  Employee
  Contractor
  Government Agency
  Other
  ```
- Default value: **Vendor**
- Required: **Yes**
- Description: `Type of payee`

#### 11. VendorID
- Column type: **Single line of text**
- Required: **No**
- Description: `Vendor identification number`

#### 12. BankAccountNumber
- Column type: **Single line of text**
- Maximum number of characters: **4**
- Required: **No**
- Description: `Payee bank account (last 4 digits only for security)`

#### 13. TaxID
- Column type: **Single line of text**
- Required: **No**
- Description: `Tax identification number (if applicable)`

---

### **Payment Classification** (8 columns)

#### 14. PaymentCategory
- Column type: **Choice**
- Choices:
  ```
  Subscription
  IT Equipment
  Operational Expense
  Vendor Payment
  Employee Reimbursement
  Utilities
  Office Supplies
  Professional Services
  Travel
  Training
  Marketing
  Other
  ```
- Default value: **Other**
- Required: **Yes**
- Description: `Primary payment category`

#### 15. Subcategory
- Column type: **Single line of text**
- Required: **No**
- Description: `More specific category (e.g., "Cloud Storage" under Subscription)`

#### 16. PaymentMethod
- Column type: **Choice**
- Choices:
  ```
  Bank Transfer
  Credit Card
  Check
  Cash
  PayPal
  Wire Transfer
  ACH
  Other
  ```
- Default value: **Bank Transfer**
- Required: **Yes**
- Description: `Method of payment`

#### 17. PaymentType
- Column type: **Choice**
- Choices:
  ```
  One-Time
  Recurring Monthly
  Recurring Quarterly
  Recurring Annually
  ```
- Default value: **One-Time**
- Required: **Yes**
- Description: `Payment frequency type`

#### 18. IsRecurring
- Column type: **Yes/No**
- Default value: **No**
- Description: `Boolean flag for recurring payments`

#### 19. RecurrencePattern
- Column type: **Single line of text**
- Required: **No**
- Description: `Cron-like pattern for recurring payments (e.g., "0 0 1 * *")`

#### 20. NextPaymentDate
- Column type: **Date and Time**
- Date and Time format: **Date Only**
- Required: **No**
- Description: `Next scheduled payment date for recurring payments`

#### 21. RecurrenceEndDate
- Column type: **Date and Time**
- Date and Time format: **Date Only**
- Required: **No**
- Description: `When recurring payment ends`

---

### **Organizational Assignment** (6 columns)

#### 22. Unit
- Column type: **Choice**
- Choices:
  ```
  IT
  HR
  Finance
  Operations
  Administration
  Legal
  Procurement
  Marketing
  Sales
  Other
  ```
- Default value: **Other**
- Required: **Yes**
- Description: `Department/Unit`

#### 23. Division
- Column type: **Choice**
- Choices: (Add your divisions)
  ```
  Division A
  Division B
  Division C
  Other
  ```
- Required: **No**
- Description: `Organizational division`

#### 24. DivisionID
- Column type: **Single line of text**
- Required: **No**
- Description: `Division code`

#### 25. CostCenter
- Column type: **Single line of text**
- Required: **No**
- Description: `Cost center code for accounting`

#### 26. ProjectCode
- Column type: **Single line of text**
- Required: **No**
- Description: `Project code if payment is project-related`

#### 27. BudgetYear
- Column type: **Choice**
- Choices:
  ```
  2023
  2024
  2025
  2026
  2027
  ```
- Default value: **2025**
- Required: **Yes**
- Description: `Budget year`

---

### **Invoice & Documentation** (6 columns)

#### 28. InvoiceNumber
- Column type: **Single line of text**
- Required: **No**
- Description: `Vendor invoice number`

#### 29. InvoiceDate
- Column type: **Date and Time**
- Date and Time format: **Date Only**
- Required: **No**
- Description: `Date on invoice`

#### 30. InvoiceAmount
- Column type: **Number**
- Number of decimal places: **2**
- Required: **No**
- Description: `Total invoice amount (may differ from payment if partial)`

#### 31. InvoiceURL
- Column type: **Hyperlink**
- Required: **No**
- Description: `Link to invoice document in SharePoint`

#### 32. ReceiptURL
- Column type: **Hyperlink**
- Required: **No**
- Description: `Link to payment receipt`

#### 33. PurchaseOrderNumber
- Column type: **Single line of text**
- Required: **No**
- Description: `PO number if applicable`

---

### **Approval Workflow** (7 columns)

#### 34. PaymentStatus
- Column type: **Choice**
- Choices:
  ```
  Draft
  Pending Approval
  Approved
  Rejected
  Paid
  Cancelled
  On Hold
  ```
- Default value: **Draft**
- Required: **Yes**
- Description: `Current payment status`

#### 35. ApprovalStatus
- Column type: **Choice**
- Choices:
  ```
  Pending
  Approved
  Rejected
  ```
- Required: **No**
- Description: `Approval decision status`

#### 36. ApprovedBy
- Column type: **Single line of text**
- Required: **No**
- Description: `Email of person who approved`

#### 37. ApprovedByName
- Column type: **Single line of text**
- Required: **No**
- Description: `Name of approver`

#### 38. ApprovalDate
- Column type: **Date and Time**
- Date and Time format: **Date and Time**
- Required: **No**
- Description: `When payment was approved`

#### 39. RejectionReason
- Column type: **Multiple lines of text**
- Number of lines: **6**
- Required: **No**
- Description: `Reason for rejection`

#### 40. RejectionDate
- Column type: **Date and Time**
- Date and Time format: **Date and Time**
- Required: **No**
- Description: `When payment was rejected`

---

### **Asset Linkage** (3 columns)

#### 41. RelatedAssetID
- Column type: **Single line of text**
- Required: **No**
- Description: `Asset ID if payment is for asset purchase`

#### 42. RelatedAssetName
- Column type: **Single line of text**
- Required: **No**
- Description: `Asset name for quick reference`

#### 43. CreatesAsset
- Column type: **Yes/No**
- Default value: **No**
- Description: `Flag indicating if this payment should trigger asset creation`

---

### **Additional Metadata** (3 columns)

#### 44. Description
- Column type: **Multiple lines of text**
- Number of lines: **6**
- Required: **No**
- Description: `Detailed payment description`

#### 45. Notes
- Column type: **Multiple lines of text**
- Number of lines: **6**
- Required: **No**
- Description: `Additional notes`

#### 46. AdminComments
- Column type: **Multiple lines of text**
- Number of lines: **6**
- Required: **No**
- Description: `Internal admin comments (not visible to regular users)`

---

### **Soft Delete** (3 columns)

#### 47. IsDeleted
- Column type: **Yes/No**
- Default value: **No**
- Description: `Soft delete flag`

#### 48. DeletedAt
- Column type: **Date and Time**
- Date and Time format: **Date and Time**
- Required: **No**
- Description: `When item was deleted`

#### 49. DeletedBy
- Column type: **Single line of text**
- Required: **No**
- Description: `Email of person who deleted`

---

## Part 3: Configure List Settings

### Enable Versioning

1. Click **Settings** (gear icon) → **List settings**
2. Under **General Settings**, click **Versioning settings**
3. Set **Content Approval**: **No**
4. Set **Item Version History**: **Create major versions**
5. Keep drafts: **No**
6. Click **OK**

### Set Permissions (Optional)

By default, all site members can view and edit. If you want to restrict:

1. Go to **List settings** → **Permissions for this list**
2. Click **Stop Inheriting Permissions**
3. Customize permissions as needed

**Recommended**:
- Site Owners: Full Control
- Finance Team: Edit
- All Users: Read

---

## Part 4: Create Document Library for Invoices

### Step 1: Create Library

1. Go to your site homepage
2. Click **New** → **Document library**
3. Name: `Payment Documents`
4. Description: `Storage for invoices, receipts, and payment-related documents`
5. Click **Create**

### Step 2: Create Folders

Create the following folder structure:

```
Payment Documents/
├── Invoices/
├── Receipts/
└── Purchase Orders/
```

---

## Part 5: Verify Setup

### Checklist

- [ ] Payments list created with name exactly **"Payments"**
- [ ] All 48 custom columns added
- [ ] All required fields marked correctly
- [ ] All choice fields have correct options
- [ ] Versioning enabled
- [ ] Payment Documents library created
- [ ] Folders created in document library

### Test the Setup

1. **Create a test payment**:
   - Click **New** in the Payments list
   - Fill in required fields:
     - Title: "Test Payment"
     - PaymentDate: Today
     - Amount: 100
     - Currency: USD
     - PayeeName: "Test Vendor"
     - PayeeType: Vendor
     - PaymentCategory: Other
     - PaymentMethod: Bank Transfer
     - PaymentType: One-Time
     - Unit: IT
     - BudgetYear: 2025
     - PaymentStatus: Draft
   - Click **Save**

2. **Verify in application**:
   - Open the Unitopia Hub application
   - Navigate to the Payments section
   - You should see the test payment listed

---

## Part 6: SharePoint Column Summary Table

| # | Column Name | Type | Required | Default | Description |
|---|-------------|------|----------|---------|-------------|
| 1 | Title | Single line | Yes | - | Payment title (built-in) |
| 2 | PaymentID | Single line | No | - | Unique payment ID |
| 3 | PaymentDate | Date | Yes | Today | Payment date |
| 4 | DueDate | Date | No | - | Payment deadline |
| 5 | Amount | Number (2) | Yes | - | Payment amount |
| 6 | Currency | Choice | Yes | USD | Currency code |
| 7 | ExchangeRate | Number (4) | No | - | Exchange rate |
| 8 | AmountInUSD | Number (2) | No | - | Amount in USD |
| 9 | PayeeName | Single line | Yes | - | Payee name |
| 10 | PayeeEmail | Single line | No | - | Payee email |
| 11 | PayeeType | Choice | Yes | Vendor | Payee type |
| 12 | VendorID | Single line | No | - | Vendor ID |
| 13 | BankAccountNumber | Single line | No | - | Bank account (last 4) |
| 14 | TaxID | Single line | No | - | Tax ID |
| 15 | PaymentCategory | Choice | Yes | Other | Payment category |
| 16 | Subcategory | Single line | No | - | Subcategory |
| 17 | PaymentMethod | Choice | Yes | Bank Transfer | Payment method |
| 18 | PaymentType | Choice | Yes | One-Time | Payment type |
| 19 | IsRecurring | Yes/No | No | No | Is recurring |
| 20 | RecurrencePattern | Single line | No | - | Recurrence pattern |
| 21 | NextPaymentDate | Date | No | - | Next payment date |
| 22 | RecurrenceEndDate | Date | No | - | Recurrence end date |
| 23 | Unit | Choice | Yes | Other | Department/Unit |
| 24 | Division | Choice | No | - | Division |
| 25 | DivisionID | Single line | No | - | Division ID |
| 26 | CostCenter | Single line | No | - | Cost center |
| 27 | ProjectCode | Single line | No | - | Project code |
| 28 | BudgetYear | Choice | Yes | 2025 | Budget year |
| 29 | InvoiceNumber | Single line | No | - | Invoice number |
| 30 | InvoiceDate | Date | No | - | Invoice date |
| 31 | InvoiceAmount | Number (2) | No | - | Invoice amount |
| 32 | InvoiceURL | Hyperlink | No | - | Invoice URL |
| 33 | ReceiptURL | Hyperlink | No | - | Receipt URL |
| 34 | PurchaseOrderNumber | Single line | No | - | PO number |
| 35 | PaymentStatus | Choice | Yes | Draft | Payment status |
| 36 | ApprovalStatus | Choice | No | - | Approval status |
| 37 | ApprovedBy | Single line | No | - | Approver email |
| 38 | ApprovedByName | Single line | No | - | Approver name |
| 39 | ApprovalDate | Date/Time | No | - | Approval date |
| 40 | RejectionReason | Multi-line | No | - | Rejection reason |
| 41 | RejectionDate | Date/Time | No | - | Rejection date |
| 42 | RelatedAssetID | Single line | No | - | Related asset ID |
| 43 | RelatedAssetName | Single line | No | - | Related asset name |
| 44 | CreatesAsset | Yes/No | No | No | Creates asset flag |
| 45 | Description | Multi-line | No | - | Description |
| 46 | Notes | Multi-line | No | - | Notes |
| 47 | AdminComments | Multi-line | No | - | Admin comments |
| 48 | IsDeleted | Yes/No | No | No | Soft delete flag |
| 49 | DeletedAt | Date/Time | No | - | Deletion timestamp |
| 50 | DeletedBy | Single line | No | - | Deleter email |

Plus **5 system columns** (ID, Created, Author, Modified, Editor) automatically added by SharePoint.

**Total: 55 columns**

---

## Troubleshooting

### "List not found" error

- Verify list name is exactly **"Payments"** (case-sensitive)
- Ensure you're on the correct SharePoint site
- Check list hasn't been deleted

### Columns showing as missing

- Verify column internal names match exactly
- Check column types are correct
- Ensure required columns have defaults or are marked optional

### Permission errors

- Verify you have site owner or admin permissions
- Check app registration has Sites.ReadWrite.All scope
- Ensure user has access to the SharePoint site

---

## Next Steps

After completing this setup:

1. Test creating a payment in the application
2. Verify all fields are saved correctly
3. Test approval workflow
4. Test file uploads to Payment Documents library
5. Set up any additional SharePoint workflows if needed

---

**Setup Complete!** Your Payments SharePoint list is now ready for use with the Unitopia Hub application.

# SharePoint Assets List - Setup Instructions

## ⚠️ IMPORTANT: You must create this list before adding assets!

The "Field 'Type' is not recognized" error means the SharePoint Assets list hasn't been created yet with the required columns.

---

## Step 1: Create the Assets List

1. Go to your SharePoint site: https://scpng1.sharepoint.com/sites/scpngintranet
2. Click **⚙️ Settings (gear icon)** → **Site contents**
3. Click **+ New** → **List**
4. Choose **Blank list**
5. Enter these details:
   - **Name**: `Assets`
   - **Description**: `Asset management system for tracking IT equipment and resources`
   - ✅ Check **Show in site navigation**
6. Click **Create**

---

## Step 2: Add Required Columns

### Column 1: Type (REQUIRED - Choice)
1. Click **+ Add column** → **Choice**
2. **Name**: `Type`
3. **Choices** (one per line):
   ```
   Desktop PC
   Laptop
   PC Monitor
   Desk Phone
   Printer
   Scanner
   Tablet
   Projector
   Networking Equipment
   Server
   Other
   ```
4. ✅ Check **Require that this column contains information**
5. Click **Save**

### Column 2: Condition (Choice)
1. Click **+ Add column** → **Choice**
2. **Name**: `Condition`
3. **Default value**: `Good`
4. **Choices** (one per line):
   ```
   Excellent
   Good
   Fair
   Poor
   Needs Repair
   Out of Service
   ```
5. Click **Save**

### Column 3: AssetID (Text)
1. Click **+ Add column** → **Single line of text**
2. **Name**: `AssetID`
3. **Description**: `Custom asset identifier`
4. Click **Save**

### Column 4: Brand (Text)
1. Click **+ Add column** → **Single line of text**
2. **Name**: `Brand`
3. Click **Save**

### Column 5: Model (Text)
1. Click **+ Add column** → **Single line of text**
2. **Name**: `Model`
3. Click **Save**

### Column 6: SerialNumber (Text)
1. Click **+ Add column** → **Single line of text**
2. **Name**: `SerialNumber`
3. Click **Save**

### Column 7: AssignedTo (Person)
1. Click **+ Add column** → **Person**
2. **Name**: `AssignedTo`
3. **Allow selection of**: People only
4. **Allow multiple selections**: No
5. Click **Save**

### Column 8: AssignedToEmail (Text)
1. Click **+ Add column** → **Single line of text**
2. **Name**: `AssignedToEmail`
3. Click **Save**

### Column 9: AssignedDate (Date)
1. Click **+ Add column** → **Date and time**
2. **Name**: `AssignedDate`
3. **Include time**: No (Date only)
4. Click **Save**

### Column 10: Unit (Choice)
1. Click **+ Add column** → **Choice**
2. **Name**: `Unit`
3. **Choices** (one per line):
   ```
   IT
   HR
   Finance
   Operations
   Administration
   Legal
   Procurement
   Other
   ```
4. Click **Save**

### Column 11: Division (Choice)
1. Click **+ Add column** → **Choice**
2. **Name**: `Division`
3. **Choices** (customize for your organization):
   ```
   Administration Division
   Finance Division
   IT Division
   HR Division
   Operations Division
   Legal Division
   Procurement Division
   ```
4. Click **Save**

### Column 12: DivisionID (Text)
1. Click **+ Add column** → **Single line of text**
2. **Name**: `DivisionID`
3. Click **Save**

### Column 13: Description (Multi-line)
1. Click **+ Add column** → **Multiple lines of text**
2. **Name**: `Description`
3. **Type of text**: Plain text
4. Click **Save**

### Column 14: PurchaseDate (Date)
1. Click **+ Add column** → **Date and time**
2. **Name**: `PurchaseDate`
3. **Include time**: No
4. Click **Save**

### Column 15: PurchaseCost (Number)
1. Click **+ Add column** → **Number**
2. **Name**: `PurchaseCost`
3. **Number of decimal places**: 2
4. Click **Save**

### Column 16: DepreciatedValue (Number)
1. Click **+ Add column** → **Number**
2. **Name**: `DepreciatedValue`
3. **Number of decimal places**: 2
4. Click **Save**

### Column 17: Vendor (Text)
1. Click **+ Add column** → **Single line of text**
2. **Name**: `Vendor`
3. Click **Save**

### Column 18: WarrantyExpiryDate (Date)
1. Click **+ Add column** → **Date and time**
2. **Name**: `WarrantyExpiryDate`
3. **Include time**: No
4. Click **Save**

### Column 19: ExpiryDate (Date)
1. Click **+ Add column** → **Date and time**
2. **Name**: `ExpiryDate`
3. **Include time**: No
4. Click **Save**

### Column 20: LifeExpectancyYears (Number)
1. Click **+ Add column** → **Number**
2. **Name**: `LifeExpectancyYears`
3. **Number of decimal places**: 0 (whole number)
4. Click **Save**

### Column 21: YTDUsage (Text)
1. Click **+ Add column** → **Single line of text**
2. **Name**: `YTDUsage`
3. Click **Save**

### Column 22: Notes (Multi-line)
1. Click **+ Add column** → **Multiple lines of text**
2. **Name**: `Notes`
3. **Type of text**: Plain text
4. Click **Save**

### Column 23: AdminComments (Multi-line)
1. Click **+ Add column** → **Multiple lines of text**
2. **Name**: `AdminComments`
3. **Type of text**: Plain text
4. Click **Save**

### Column 24: InvoiceURL (Hyperlink)
1. Click **+ Add column** → **Hyperlink**
2. **Name**: `InvoiceURL`
3. Click **Save**

### Column 25: BarcodeURL (Hyperlink)
1. Click **+ Add column** → **Hyperlink**
2. **Name**: `BarcodeURL`
3. Click **Save**

### Column 26: ImageURL (Hyperlink)
1. Click **+ Add column** → **Hyperlink**
2. **Name**: `ImageURL`
3. Click **Save**

### Column 27: IsDeleted (Yes/No)
1. Click **+ Add column** → **Yes/No**
2. **Name**: `IsDeleted`
3. **Default value**: No
4. Click **Save**

### Column 28: DeletedAt (Date)
1. Click **+ Add column** → **Date and time**
2. **Name**: `DeletedAt`
3. **Include time**: Yes
4. Click **Save**

### Column 29: DeletedBy (Person)
1. Click **+ Add column** → **Person**
2. **Name**: `DeletedBy`
3. **Allow selection of**: People only
4. Click **Save**

---

## Step 3: Verify the Setup

After creating all columns, verify that you have:

✅ Title (default column - already exists)
✅ Type (Choice - REQUIRED)
✅ Condition (Choice)
✅ AssetID (Text)
✅ Brand (Text)
✅ Model (Text)
✅ SerialNumber (Text)
✅ AssignedTo (Person)
✅ AssignedToEmail (Text)
✅ AssignedDate (Date)
✅ Unit (Choice)
✅ Division (Choice)
✅ DivisionID (Text)
✅ Description (Multi-line text)
✅ PurchaseDate (Date)
✅ PurchaseCost (Number)
✅ DepreciatedValue (Number)
✅ Vendor (Text)
✅ WarrantyExpiryDate (Date)
✅ ExpiryDate (Date)
✅ LifeExpectancyYears (Number)
✅ YTDUsage (Text)
✅ Notes (Multi-line text)
✅ AdminComments (Multi-line text)
✅ InvoiceURL (Hyperlink)
✅ BarcodeURL (Hyperlink)
✅ ImageURL (Hyperlink)
✅ IsDeleted (Yes/No)
✅ DeletedAt (Date and time)
✅ DeletedBy (Person)

**Total: 30 columns (including built-in columns)**

---

## Step 4: Test Adding an Asset

1. Go back to your app: http://localhost:5173 (or your app URL)
2. Navigate to **Assets** page
3. Click **+ Add Asset**
4. Fill in the required fields:
   - **Asset Name**: Test Laptop
   - **Type**: Select "Laptop" from dropdown
   - **Assigned To**: Select an employee
5. Click **Add Asset**

If the list is set up correctly, the asset should be created without errors!

---

## Quick Column Creation Script

If you prefer, you can create columns faster using SharePoint's PowerShell:

```powershell
# Connect to SharePoint
Connect-PnPOnline -Url "https://scpng1.sharepoint.com/sites/scpngintranet" -Interactive

# Create Type column
Add-PnPField -List "Assets" -DisplayName "Type" -InternalName "Type" -Type Choice `
  -Choices @("Desktop PC","Laptop","PC Monitor","Desk Phone","Printer","Scanner","Tablet","Projector","Networking Equipment","Server","Other") `
  -Required

# (Continue with other columns...)
```

---

## Troubleshooting

### Error: "Field 'Type' is not recognized"
- **Cause**: The Type column hasn't been created in SharePoint yet
- **Solution**: Follow Step 2 above to create the Type column as a Choice field

### Error: "List 'Assets' not found"
- **Cause**: The Assets list hasn't been created yet
- **Solution**: Follow Step 1 above to create the list

### Can't add asset - validation errors
- **Cause**: Required columns missing or incorrect data types
- **Solution**: Verify all columns are created with the exact names and types shown above

---

## Time Estimate

- Creating the list: **2 minutes**
- Adding 29 columns: **30-40 minutes** (if done manually)
- Testing: **5 minutes**

**Total: ~35-47 minutes**

---

## Next Steps

Once the SharePoint list is set up:
1. ✅ Restart your dev server if needed
2. ✅ Try adding a test asset
3. ✅ Verify the asset appears in SharePoint
4. ✅ Check browser console for success logs

**You're all set! 🎉**

# SharePoint Assets List - Simple Text-Only Setup

## ✅ Simplified Approach: All Fields as Text

To avoid data type mismatches between the frontend and SharePoint, we're using **Single Line of Text** for all fields (except dates, numbers, and URLs where appropriate).

---

## Step 1: Create the Assets List

1. Go to: https://scpng1.sharepoint.com/sites/scpngintranet
2. Click **⚙️ Settings** → **Site contents**
3. Click **+ New** → **List**
4. Choose **Blank list**
5. **Name**: `Assets`
6. **Description**: `Asset management system`
7. ✅ Check **Show in site navigation**
8. Click **Create**

---

## Step 2: Add All Columns (Text-Based)

### Quick Column Creation Checklist

Add these columns **in this order** (all as "Single line of text" unless specified):

| # | Column Name | Type | Notes |
|---|------------|------|-------|
| 1 | Title | Single line of text | ✅ Already exists (default) |
| 2 | AssetID | Single line of text | Custom ID |
| 3 | **AssetType** | **Single line of text** | e.g., "Laptop", "Desktop PC" (Changed from "Type") |
| 4 | Brand | Single line of text | e.g., "Dell", "HP" |
| 5 | Model | Single line of text | e.g., "Latitude 5420" |
| 6 | SerialNumber | Single line of text | |
| 7 | Condition | **Single line of text** | e.g., "Good", "Excellent" |
| 8 | AssignedTo | Single line of text | Employee name |
| 9 | AssignedToEmail | Single line of text | Email address |
| 10 | AssignedDate | Date and time | Date only |
| 11 | Unit | Single line of text | e.g., "IT", "HR" |
| 12 | Division | Single line of text | e.g., "IT Division" |
| 13 | DivisionID | Single line of text | |
| 14 | Description | Multiple lines of text | Plain text |
| 15 | PurchaseDate | Date and time | Date only |
| 16 | PurchaseCost | Number | 2 decimal places |
| 17 | DepreciatedValue | Number | 2 decimal places |
| 18 | Vendor | Single line of text | |
| 19 | WarrantyExpiryDate | Date and time | Date only |
| 20 | ExpiryDate | Date and time | Date only |
| 21 | LifeExpectancyYears | Number | 0 decimal places |
| 22 | YTDUsage | Single line of text | e.g., "500 hours" |
| 23 | Notes | Multiple lines of text | Plain text |
| 24 | AdminComments | Multiple lines of text | Plain text |
| 25 | InvoiceURL | Hyperlink | |
| 26 | BarcodeURL | Hyperlink | |
| 27 | ImageURL | Hyperlink | |
| 28 | IsDeleted | Yes/No | Default: No |
| 29 | DeletedAt | Date and time | Include time |
| 30 | DeletedBy | Single line of text | Person name |

---

## Step 3: Create Columns in SharePoint

### For "Single line of text" columns:
1. Click **+ Add column** → **Single line of text**
2. Enter the column name (exact spelling from table above)
3. Click **Save**
4. Repeat for all text columns

### For "Date and time" columns:
1. Click **+ Add column** → **Date and time**
2. Enter the column name
3. **Include time**:
   - **No** for: AssignedDate, PurchaseDate, WarrantyExpiryDate, ExpiryDate
   - **Yes** for: DeletedAt
4. Click **Save**

### For "Number" columns:
1. Click **+ Add column** → **Number**
2. Enter the column name
3. **Decimal places**:
   - **2** for: PurchaseCost, DepreciatedValue
   - **0** for: LifeExpectancyYears
4. Click **Save**

### For "Multiple lines of text" columns:
1. Click **+ Add column** → **Multiple lines of text**
2. Enter the column name
3. **Type**: Plain text (not rich text)
4. Click **Save**

### For "Hyperlink" columns:
1. Click **+ Add column** → **Hyperlink**
2. Enter the column name
3. Click **Save**

### For "Yes/No" column (IsDeleted):
1. Click **+ Add column** → **Yes/No**
2. Name: `IsDeleted`
3. **Default value**: No
4. Click **Save**

---

## Step 4: Verification Checklist

After creating all columns, verify you have **30 columns total**:

### Text Columns (18):
- ✅ Title (default)
- ✅ AssetID
- ✅ Type
- ✅ Brand
- ✅ Model
- ✅ SerialNumber
- ✅ Condition
- ✅ AssignedTo
- ✅ AssignedToEmail
- ✅ Unit
- ✅ Division
- ✅ DivisionID
- ✅ Vendor
- ✅ YTDUsage
- ✅ DeletedBy

### Date Columns (5):
- ✅ AssignedDate
- ✅ PurchaseDate
- ✅ WarrantyExpiryDate
- ✅ ExpiryDate
- ✅ DeletedAt

### Number Columns (3):
- ✅ PurchaseCost
- ✅ DepreciatedValue
- ✅ LifeExpectancyYears

### Multi-line Text Columns (3):
- ✅ Description
- ✅ Notes
- ✅ AdminComments

### Hyperlink Columns (3):
- ✅ InvoiceURL
- ✅ BarcodeURL
- ✅ ImageURL

### Yes/No Columns (1):
- ✅ IsDeleted

---

## Step 5: Set Permissions (Optional)

1. Click **⚙️ Settings** → **List settings**
2. Under **Permissions and Management**, click **Permissions for this list**
3. Set appropriate permissions:
   - **Read**: All staff
   - **Edit/Add**: IT Admins, Asset Managers
   - **Full Control**: System Administrators

---

## Step 6: Test Adding an Asset

1. Go back to your app
2. Navigate to **Assets** page
3. Click **+ Add Asset**
4. Fill in the form:
   - **Asset Name**: Test Laptop
   - **Type**: Laptop (type it in)
   - **Brand**: Dell
   - **Condition**: Good (type it in)
   - **Assigned To**: Select an employee
5. Click **Add Asset**

**The asset should now be created successfully without any field type errors!** ✅

---

## Quick PowerShell Script (Faster Alternative)

If you have PnP PowerShell installed, you can create all columns at once:

```powershell
# Connect to SharePoint
Connect-PnPOnline -Url "https://scpng1.sharepoint.com/sites/scpngintranet" -Interactive

# Create the Assets list
New-PnPList -Title "Assets" -Template GenericList -Url "Lists/Assets"

# Create text columns
$textColumns = @("AssetID", "Type", "Brand", "Model", "SerialNumber", "Condition",
                 "AssignedTo", "AssignedToEmail", "Unit", "Division", "DivisionID",
                 "Vendor", "YTDUsage", "DeletedBy")

foreach ($col in $textColumns) {
    Add-PnPField -List "Assets" -DisplayName $col -InternalName $col -Type Text
}

# Create date columns (date only)
$dateColumns = @("AssignedDate", "PurchaseDate", "WarrantyExpiryDate", "ExpiryDate")
foreach ($col in $dateColumns) {
    Add-PnPField -List "Assets" -DisplayName $col -InternalName $col -Type DateTime
}

# Create date column with time
Add-PnPField -List "Assets" -DisplayName "DeletedAt" -InternalName "DeletedAt" -Type DateTime

# Create number columns
Add-PnPField -List "Assets" -DisplayName "PurchaseCost" -InternalName "PurchaseCost" -Type Number
Add-PnPField -List "Assets" -DisplayName "DepreciatedValue" -InternalName "DepreciatedValue" -Type Number
Add-PnPField -List "Assets" -DisplayName "LifeExpectancyYears" -InternalName "LifeExpectancyYears" -Type Number

# Create multi-line text columns
$noteColumns = @("Description", "Notes", "AdminComments")
foreach ($col in $noteColumns) {
    Add-PnPField -List "Assets" -DisplayName $col -InternalName $col -Type Note
}

# Create URL columns
$urlColumns = @("InvoiceURL", "BarcodeURL", "ImageURL")
foreach ($col in $urlColumns) {
    Add-PnPField -List "Assets" -DisplayName $col -InternalName $col -Type URL
}

# Create Yes/No column
Add-PnPField -List "Assets" -DisplayName "IsDeleted" -InternalName "IsDeleted" -Type Boolean

Write-Host "✅ Assets list created with all columns!" -ForegroundColor Green
```

---

## Time Estimate

- **Manual creation**: ~25-35 minutes
- **PowerShell script**: ~2-3 minutes
- **Testing**: ~5 minutes

---

## Troubleshooting

### Still getting "Field not recognized" errors?
1. **Check column names** - They must match exactly (case-sensitive)
2. **Refresh the page** - SharePoint may need a moment to register new columns
3. **Check browser console** - Look for specific field name in error message
4. **Verify list name** - Must be exactly "Assets"

### Assets not appearing in the list?
1. Check the **IsDeleted** column - make sure it's set to "No"
2. Check **All Items** view in SharePoint
3. Clear browser cache and refresh

---

## Benefits of Text-Only Approach

✅ **No data type mismatches** - Text accepts any value
✅ **Easier to set up** - Just create text columns
✅ **More flexible** - Can change values easily
✅ **No validation errors** - SharePoint won't reject valid text
✅ **Simpler migration** - Easy to bulk import data later

---

## Next Steps

Once your SharePoint list is set up:
1. ✅ Try adding a test asset
2. ✅ Verify it appears in SharePoint
3. ✅ Check console logs for success messages
4. ✅ Start migrating your existing assets

**You're all set! 🎉**

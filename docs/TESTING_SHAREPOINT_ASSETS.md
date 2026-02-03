# Testing SharePoint Assets Integration

## ✅ Setup Complete!

Your frontend is now configured to use SharePoint for assets. Here's how to test it.

---

## 🔧 Configuration Status

### Environment Variable
```bash
VITE_USE_SHAREPOINT_ASSETS=true  # ✅ Enabled in .env file
```

### Code Changes Applied

1. ✅ **AssetsSharePointService** created at `src/services/assetsSharePointService.ts`
   - Full CRUD operations
   - Comprehensive console logging
   - Data mapping validation

2. ✅ **useAssetsSharePoint hook** created at `src/hooks/useAssetsSharePoint.ts`
   - React hook for SharePoint integration
   - Automatic state management
   - Error handling with toasts

3. ✅ **AssetManagementNew.tsx** updated
   - Feature flag integration
   - Dual-source support (SharePoint/Supabase)
   - Console logging for debugging

---

## 🧪 Testing Steps

### Step 1: Start the Development Server

```bash
cd "c:\Users\johns\Desktop\Coding\Web Applications\scpng_projects\scpng_intranet\unitopia-hub"
npm run dev
```

### Step 2: Open Browser Console

1. Open your app in the browser
2. Press `F12` to open Developer Tools
3. Go to the **Console** tab
4. Keep it open to see all the logs

### Step 3: Navigate to Assets Page

Navigate to the Assets management page (usually at `/admin/assets` or `/assets`)

### Step 4: Watch the Console Logs

You should see detailed logs like this:

```
🔄 [AssetManagement] USE_SHAREPOINT_ASSETS: true
👤 [useAssetsSharePoint] Current user: { email: "your.email@scpng.gov.pg", isAdmin: false }
🔄 [useAssetsSharePoint] Initializing SharePoint service...
🔧 [AssetsSharePointService] Service initialized
🔄 [AssetsSharePointService] Starting initialization...
✅ [AssetsSharePointService] Site ID obtained: xxxx-xxxx-xxxx
✅ [AssetsSharePointService] Assets List ID obtained: xxxx-xxxx-xxxx
✅ [AssetsSharePointService] Initialization complete!
📥 [useAssetsSharePoint] Fetching assets...
📊 [GET ASSETS] Fetching assets from SharePoint...
✅ [GET ASSETS] Retrieved X total items from SharePoint
   Active assets (not deleted): X
   Filtered to user's assets: X (if not admin)
✅ [GET ASSETS] Returning X assets to frontend
✅ [useAssetsSharePoint] Loaded X assets
📊 [AssetManagement] Using SHAREPOINT as data source
   Total assets loaded: X
```

---

## 🆕 Test 1: Create a New Asset

### Action
Click the **"+ Add Asset"** button and fill in the form:

**Required Fields:**
- **Title/Name**: Test Laptop Dell
- **Type**: Laptop

**Optional Fields:**
- **Brand**: Dell
- **Model**: Latitude 5520
- **Serial Number**: TEST123456
- **Condition**: Good
- **Assigned To**: (Select yourself)
- **Unit**: IT
- **Purchase Cost**: 3500

Click **Save**

### Expected Console Output

```
=================================================================================
🆕 [ADD ASSET] Creating new asset in SharePoint...
=================================================================================

📋 [DATA MAPPING] Converting Supabase format to SharePoint format...
📥 [INPUT] Original asset data from frontend: {
  "name": "Test Laptop Dell",
  "type": "Laptop",
  "brand": "Dell",
  "model": "Latitude 5520",
  "serial_number": "TEST123456",
  "condition": "Good",
  "unit": "IT",
  "purchase_cost": 3500,
  ...
}

🔄 [FIELD MAPPING] Processing each field...
  ✓ name → Title: "Test Laptop Dell"
  ✓ type → Type: "Laptop"
  ✓ brand → Brand: "Dell"
  ✓ model → Model: "Latitude 5520"
  ✓ serial_number → SerialNumber: "TEST123456"
  ✓ condition → Condition: "Good"
  ✓ unit → Unit: "IT"
  ✓ purchase_cost → PurchaseCost: 3500 [NUMBER]
  ...

📤 [OUTPUT] Mapped SharePoint fields: {
  "Title": "Test Laptop Dell",
  "Type": "Laptop",
  "Brand": "Dell",
  "Model": "Latitude 5520",
  "SerialNumber": "TEST123456",
  "Condition": "Good",
  "Unit": "IT",
  "PurchaseCost": 3500,
  ...
}

✅ [DATA MAPPING] Conversion complete!

📤 [API REQUEST] Sending to SharePoint...
   Endpoint: /sites/xxxx/lists/xxxx/items
   Method: POST
   Payload: {...}

✅ [API RESPONSE] SharePoint response received:
{
  "id": "1",
  "fields": { ... }
}

✅ [ADD ASSET] Asset created successfully!
   SharePoint Item ID: 1
   Asset Name: Test Laptop Dell
   Asset Type: Laptop
=================================================================================
```

### Verify in SharePoint

1. Go to: https://scpng1.sharepoint.com/sites/scpngintranet/Lists/Assets
2. Check that your new asset appears in the list
3. Verify all fields match what you entered

---

## 🔍 Test 2: View Assets List

### Action
Just load the assets page

### Expected Behavior
- You should see all assets you're assigned to (or all assets if you're an admin)
- The table should display with proper data

### Console Logs to Check
```
📊 [GET ASSETS] Fetching assets from SharePoint...
   User Email: your.email@scpng.gov.pg
   Is Admin: false
✅ [GET ASSETS] Retrieved X total items from SharePoint
   Active assets (not deleted): X
   Filtered to user's assets: X
✅ [GET ASSETS] Returning X assets to frontend
```

---

## ✏️ Test 3: Edit an Asset

### Action
1. Click the **three-dot menu** (⋮) on any asset
2. Select **Edit**
3. Change any field (e.g., Condition from "Good" to "Fair")
4. Click **Save**

### Expected Console Output
```
================================================================================
✏️  [UPDATE ASSET] Updating asset ID: 1
================================================================================

📋 [DATA MAPPING] Converting Supabase format to SharePoint format...
📥 [INPUT] Original asset data from frontend: {
  "condition": "Fair"
}

🔄 [FIELD MAPPING] Processing each field...
  ✓ condition → Condition: "Fair"

📤 [OUTPUT] Mapped SharePoint fields: {
  "Condition": "Fair"
}

📤 [API REQUEST] Sending update to SharePoint...
   Item ID: 1
   Updates: { "Condition": "Fair" }

✅ [API RESPONSE] Update successful
✅ [UPDATE ASSET] Asset updated successfully!
================================================================================
```

---

## 🗑️ Test 4: Delete an Asset

### Action
1. Click the **three-dot menu** (⋮) on any asset
2. Select **Delete**
3. Confirm deletion

### Expected Console Output
```
🗑️  [DELETE ASSET] Soft deleting asset ID: 1
   Deleted by: your.email@scpng.gov.pg

✏️  [UPDATE ASSET] Updating asset ID: 1
🔄 [FIELD MAPPING] Processing each field...
  ✓ is_deleted → IsDeleted: true [BOOLEAN]
  ✓ deleted_at → DeletedAt: "2025-01-21T..."

✅ [DELETE ASSET] Asset soft-deleted successfully
```

### Verify in SharePoint
Asset should still exist in SharePoint with:
- `IsDeleted` = Yes
- `DeletedAt` = Current timestamp
- `DeletedBy` = Your name

---

## 🐛 Troubleshooting

### Problem: "List 'Assets' not found"

**Solution:**
- Verify you created the Assets list in SharePoint
- Check the list name is exactly "Assets" (case-sensitive)
- Visit: https://scpng1.sharepoint.com/sites/scpngintranet/Lists/Assets

### Problem: "Field 'XYZ' does not exist"

**Solution:**
- Check that you created ALL columns in the SharePoint list
- Column names are case-sensitive (e.g., `Title`, not `title`)
- Refer to [sharepoint_assets_list_schema.md](./sharepoint_assets_list_schema.md)

### Problem: No console logs appearing

**Solution:**
- Check that `VITE_USE_SHAREPOINT_ASSETS=true` in your `.env` file
- Restart the dev server after changing `.env`
- Clear browser cache and refresh

### Problem: "Permission denied" errors

**Solution:**
- Verify your Microsoft account has access to the SharePoint site
- Check you're logged in with the correct account
- Contact SharePoint admin to grant permissions

### Problem: Data not mapping correctly

**Check the console logs:**
- Look for the `📋 [DATA MAPPING]` section
- Compare `📥 [INPUT]` with `📤 [OUTPUT]`
- Verify field names match the schema

---

## 📊 What to Check in Console Logs

### ✅ Successful Operation Indicators

1. **Initialization**
   ```
   ✅ [AssetsSharePointService] Site ID obtained
   ✅ [AssetsSharePointService] Assets List ID obtained
   ✅ [AssetsSharePointService] Initialization complete!
   ```

2. **Data Mapping**
   ```
   📋 [DATA MAPPING] Converting...
   🔄 [FIELD MAPPING] Processing each field...
   ✓ name → Title: "..."
   ✓ type → Type: "..."
   ✅ [DATA MAPPING] Conversion complete!
   ```

3. **API Success**
   ```
   ✅ [API RESPONSE] SharePoint response received
   ✅ [ADD ASSET] Asset created successfully!
   ```

### ❌ Error Indicators

1. **Initialization Failure**
   ```
   ❌ [AssetsSharePointService] Initialization failed:
   ```

2. **API Failure**
   ```
   ❌ [ADD ASSET] FAILED to create asset
   Error Details: ...
   ```

3. **Mapping Issues**
   ```
   ⊗ field_name → FieldName: (empty/null - skipped)
   ```

---

## 🔄 Switching Back to Supabase

If you need to switch back to Supabase temporarily:

1. Edit `.env` file:
   ```bash
   VITE_USE_SHAREPOINT_ASSETS=false
   ```

2. Restart dev server:
   ```bash
   # Press Ctrl+C to stop
   npm run dev
   ```

3. Check console - should see:
   ```
   📊 [AssetManagement] Using SUPABASE as data source
   ```

---

## 📸 Screenshots to Take

For documentation/verification, take screenshots of:

1. **Console logs showing successful asset creation**
2. **SharePoint Assets list with test data**
3. **Frontend assets table displaying SharePoint data**
4. **Data mapping logs (INPUT → OUTPUT)**

---

## 🎯 Success Criteria

Your integration is working correctly if:

- ✅ Assets load from SharePoint on page load
- ✅ New assets save to SharePoint (verify in SharePoint list)
- ✅ Edits update SharePoint (verify changes persist)
- ✅ Deletes soft-delete assets (IsDeleted = Yes in SharePoint)
- ✅ Console shows detailed mapping logs
- ✅ No errors in console
- ✅ All fields map correctly (check INPUT vs OUTPUT logs)

---

## 📞 Next Steps After Testing

Once you've verified everything works:

1. **Share test results** - Show me the console logs
2. **Report any issues** - Field mapping problems, errors, etc.
3. **Data migration** - Migrate your 161 assets from Supabase
4. **Production deployment** - Deploy with SharePoint enabled

---

**Happy Testing! 🚀**

Check your browser console and look for the detailed logs. Every operation will show you exactly what data is being sent to SharePoint and how it's being mapped.

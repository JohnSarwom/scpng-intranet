# SharePoint Applications List - Field-by-Field Setup Guide

This guide shows you **exactly** what to enter when creating each column in SharePoint.

## Before You Start

1. Navigate to: `https://scpng1.sharepoint.com/sites/scpngintranet`
2. Click **Settings (⚙️)** → **Site contents**
3. Click **New** → **List**
4. Choose **Blank list**
5. Name: `Applications`
6. Click **Create**

Now you have an empty list with just the Title column. Let's add the rest!

---

## Column 1: Title (Already Exists)

✅ This column is created automatically. No action needed.

**What it's for:** The name of the application (e.g., "Outlook", "Teams")

---

## Column 2: App ID

**Step-by-step:**

1. Click **Add column** → **Single line of text**
2. In the panel that appears on the right:

   ```
   Name: App ID

   Description: Unique identifier for the app (use lowercase with no spaces)

   [✓] Require that this column contains information

   Maximum number of characters: 100
   ```

3. Click **Save**

**What it's for:** A unique ID like "outlook", "teams", "power-bi"

---

## Column 3: Description

**Step-by-step:**

1. Click **Add column** → **Multiple lines of text**
2. In the panel:

   ```
   Name: Description

   Description: Brief description of what the application does

   [ ] Require that this column contains information

   Specify the type of text to allow: Plain text

   Number of lines for editing: 3
   ```

3. Click **Save**

**What it's for:** A brief description like "Email, schedule, and set tasks"

---

## Column 4: Icon

**Step-by-step:**

1. Click **Add column** → **Hyperlink or Picture**
2. In the panel:

   ```
   Name: Icon

   Description: Emoji or URL to app icon image

   [ ] Require that this column contains information

   Format URL as: Hyperlink
   ```

3. Click **Save**

**What it's for:** Either an emoji (📧) or URL to an icon image

**Examples:**
- Emoji: `📧`
- URL: `https://scpng1.sharepoint.com/sites/scpngintranet/SiteAssets/AppIcons/outlook.png`

---

## Column 5: App URL

**Step-by-step:**

1. Click **Add column** → **Hyperlink or Picture**
2. In the panel:

   ```
   Name: App URL

   Description: Link to the application

   [✓] Require that this column contains information

   Format URL as: Hyperlink
   ```

3. Click **Save**

**What it's for:** The URL where the app is located (e.g., "https://outlook.office.com")

---

## Column 6: Category

**Step-by-step:**

1. Click **Add column** → **Choice**
2. In the panel:

   ```
   Name: Category

   Description: Application category for grouping

   Choices: (Enter each on a new line)
   Microsoft 365
   Productivity
   Communication
   Utilities
   Custom
   HR Systems
   Finance Systems
   External Services

   Display choices using: Drop-Down Menu

   Allow 'Fill-in' choices: No

   Default value: Custom

   [✓] Require that this column contains information
   ```

3. Click **Save**

**What it's for:** Grouping apps into categories

**Important:** Make sure each choice is on a separate line!

---

## Column 7: Is External

**Step-by-step:**

1. Click **Add column** → **Yes/No**
2. In the panel:

   ```
   Name: Is External

   Description: Whether the app should open in a new tab

   Default value: Yes
   ```

3. Click **Save**

**What it's for:** Controls whether the app opens in a new tab (Yes) or same window (No)

---

## Column 8: Display Order

**Step-by-step:**

1. Click **Add column** → **Number**
2. In the panel:

   ```
   Name: Display Order

   Description: Sort order - lower numbers appear first

   [ ] Require that this column contains information

   Min: 0

   Max: 1000

   Number of decimal places: 0

   Default value: 100

   Show as percentage: No
   ```

3. Click **Save**

**What it's for:** Controlling the order apps appear (1, 2, 3, etc.)

**Tip:** Use increments of 10 (10, 20, 30) to allow inserting apps in between later!

---

## Column 9: Is Active

**Step-by-step:**

1. Click **Add column** → **Yes/No**
2. In the panel:

   ```
   Name: Is Active

   Description: Whether to show this app to users

   Default value: Yes
   ```

3. Click **Save**

**What it's for:** Show (Yes) or hide (No) apps without deleting them

---

## ✅ You're Done!

Your list should now have these columns:
1. Title
2. App ID
3. Description
4. Icon
5. App URL
6. Category
7. Is External
8. Display Order
9. Is Active

---

## Adding Your First App

Let's add Outlook as a test:

1. Click **New** at the top of the list
2. Fill in the form:

   ```
   Title: Outlook

   App ID: outlook

   Description: Email, schedule, and set tasks

   Icon: 📧

   App URL: https://outlook.office.com

   Category: Microsoft 365

   Is External: Yes

   Display Order: 1

   Is Active: Yes
   ```

3. Click **Save**

---

## Adding More Apps

Here are 5 more apps to add for testing:

### Teams
```
Title: Teams
App ID: teams
Description: Chat, meetings, and collaboration
Icon: 👥
App URL: https://teams.microsoft.com
Category: Microsoft 365
Is External: Yes
Display Order: 2
Is Active: Yes
```

### Word
```
Title: Word
App ID: word
Description: Create and edit documents
Icon: 📝
App URL: https://office.com/launch/word
Category: Microsoft 365
Is External: Yes
Display Order: 3
Is Active: Yes
```

### Excel
```
Title: Excel
App ID: excel
Description: Create and edit spreadsheets
Icon: 📊
App URL: https://office.com/launch/excel
Category: Microsoft 365
Is External: Yes
Display Order: 4
Is Active: Yes
```

### PowerPoint
```
Title: PowerPoint
App ID: powerpoint
Description: Create presentations
Icon: 📽️
App URL: https://office.com/launch/powerpoint
Category: Microsoft 365
Is External: Yes
Display Order: 5
Is Active: Yes
```

### OneDrive
```
Title: OneDrive
App ID: onedrive
Description: Cloud storage and file sharing
Icon: ☁️
App URL: https://onedrive.live.com
Category: Microsoft 365
Is External: Yes
Display Order: 6
Is Active: Yes
```

---

## Verification

After adding apps:

1. Go back to the Applications list
2. You should see all your apps listed
3. Each should show the icon emoji
4. Category should be visible
5. All should have "Is Active" = Yes

---

## Testing in the Application

1. Open your Unitopia Hub application
2. Click the Apps icon (grid icon) in the top navigation bar
3. You should see all your apps grouped by category
4. Click an app to test if it opens

---

## Troubleshooting

### Column not showing when creating an item?
- Go to **List settings** → **Columns**
- Click the column name
- Make sure it's not hidden

### Can't find a column type?
- Make sure you're clicking **Add column** (not "+ Add column to view")
- The correct menu appears at the top of the list

### Category choices not showing?
- Edit the Category column
- Check that each choice is on a separate line
- No extra spaces or commas

### Apps not appearing in the application?
- Check that "Is Active" = Yes
- Verify the SharePoint list is named exactly "Applications"
- Check browser console for errors

---

## Next Steps

1. ✅ Add all your organization's apps
2. ✅ Test each app link
3. ✅ Organize with Display Order
4. ✅ Add custom categories if needed
5. ✅ Upload custom icons (optional)

---

## Getting Custom Icons

If you want to use images instead of emojis:

1. Find or create icons (64x64 PNG recommended)
2. In SharePoint, go to **Site Assets** or create a folder called **AppIcons**
3. Upload your icon images
4. Right-click the image → **Copy link**
5. Paste this link in the Icon field when creating apps

**Example:**
```
Icon: https://scpng1.sharepoint.com/sites/scpngintranet/SiteAssets/AppIcons/outlook.png
```

---

## Need Help?

Refer to:
- [APPS_SHAREPOINT_SETUP.md](./APPS_SHAREPOINT_SETUP.md) - Full setup guide
- [APPS_QUICK_START.md](./APPS_QUICK_START.md) - Quick reference
- [APPS_SHAREPOINT_SCHEMA.txt](./APPS_SHAREPOINT_SCHEMA.txt) - Text schema

---

## Screenshots Reference

Unfortunately, I can't provide screenshots, but here's what each step looks like:

**Creating a column:**
1. Top of list → "+ Add column"
2. Choose column type from dropdown
3. Panel slides in from right
4. Fill in the fields
5. Click "Save" at bottom of panel

**Adding an item:**
1. Top of list → "+ New"
2. Form appears
3. Fill in all fields
4. Click "Save" at bottom

That's it! You're ready to manage apps via SharePoint! 🎉

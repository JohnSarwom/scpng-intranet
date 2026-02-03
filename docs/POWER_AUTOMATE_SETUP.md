# Power Automate Setup for Notice Board

This document provides instructions on how to set up a Power Automate flow to automatically add emails sent to `allstaff@scpng.gov.pg` to the SCPNG Notice Board.

## 1. SharePoint List Setup

Before creating the Power Automate flow, you need to create a new list in your SharePoint site.

1.  Navigate to your SharePoint site: `https://scpng1.sharepoint.com/sites/scpngintranet`
2.  Go to **Site contents** and click **New** > **List**.
3.  Name the list **Announcements** and click **Create**.
4.  Once the list is created, add the following columns:

| Column name   | Type                  | Notes                                        |
| ------------- | --------------------- | -------------------------------------------- |
| `Title`       | Single line of text   | (Default column)                             |
| `Content`     | Multiple lines of text|                                              |
| `Category`    | Choice                | Options: `Announcement`, `Event`, `Update`, `Alert` |
| `IsPinned`    | Yes/No                |                                              |
| `ExpiryDate`  | Date and time         |                                              |
| `SourceEmail` | Single line of text   |                                              |

## 2. Power Automate Flow Setup

1.  Go to [Power Automate](https://make.powerautomate.com/).
2.  Click **Create** and select **Automated cloud flow**.
3.  Give your flow a name, for example, "Add All Staff Emails to Notice Board".
4.  In "Choose your flow's trigger", search for "When a new email arrives" (Office 365 Outlook) and select it.
5.  Click **Create**.

### Configure the Trigger

1.  Sign in to your Office 365 account if prompted.
2.  In the "When a new email arrives" trigger, click **Show advanced options**.
3.  In the **To** field, enter `allstaff@scpng.gov.pg`.
4.  You can also set other options like **From** or **Subject filter** to further filter the emails.

### Configure the Action

1.  Click **+ New step**.
2.  Search for "Create item" (SharePoint) and select it.
3.  In the "Create item" action, provide the following information:
    *   **Site Address**: Select your SharePoint site (`https://scpng1.sharepoint.com/sites/scpngintranet`).
    *   **List Name**: Select the **Announcements** list.
4.  Now, map the fields from the email to the SharePoint list columns:
    *   **Title**: Select **Subject** from the dynamic content.
    *   **Content**: Select **Body** from the dynamic content.
    *   **Category**: Set a default value, for example, `Announcement`. You can also add logic to determine the category from the email subject or body.
    *   **SourceEmail**: Select **From** from the dynamic content.

### Save and Test the Flow

1.  Click **Save**.
2.  To test the flow, send an email to `allstaff@scpng.gov.pg`.
3.  After a few moments, the email content should appear as a new item in your "Announcements" list in SharePoint, and it will be displayed on the SCPNG Notice Board in the application.

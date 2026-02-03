# UNIT Page Supabase to SharePoint Migration Plan

This document outlines a detailed, step-by-step plan for migrating the UNIT page's UI configuration and data from Supabase to SharePoint.

## Migration Strategy: Unit-Specific SharePoint Lists

To ensure security, scalability, and ease of management, we will create a **separate and dedicated set of SharePoint Lists for each business unit**. 

For example, the IT unit will have its own `IT_UnitTasks`, `IT_UnitProjects`, etc. The HR unit will have `HR_UnitTasks`, `HR_UnitProjects`, and so on.

This approach provides several key advantages:
- **Simplified Permissions**: Access can be managed on a per-list basis, aligning with departmental roles.
- **Improved User Experience**: Users browsing SharePoint will see clearly named lists relevant to their department.
- **Data Isolation**: Each unit's data is inherently separated, preventing confusion and accidental cross-unit modifications.

The application code will be responsible for dynamically constructing the correct list name based on the unit being viewed. For example, when a user navigates to the "IT" unit page, the application will target lists prefixed with `IT_`.

## SharePoint List Schema (Per Unit)

Here is the detailed schema for the set of lists to be created for **each unit**. We will start by creating the lists for the **IT Unit**.

### 1. IT Tasks List
**SharePoint List Name:** `IT_UnitTasks`

| Column Name | SharePoint Column Type | Notes |
|---|---|---|
| Title | Single line of text | Maps to `title` |
| Description | Multiple lines of text | |
| Status | Choice | Options: `To Do`, `In Progress`, `Review`, `Done` |
| Priority | Choice | Options: `Low`, `Medium`, `High`, `Urgent` |
| Assignee | Person or Group | |
| DueDate | Date and Time | |
| StartDate | Date and Time | |
| Project | Lookup | Lookup to the `IT_UnitProjects` list |
| CompletionPercentage | Number | Choose 'Percentage' format |
| Checklist | Multiple lines of text | For simplicity, a text field. |
| KRA | Lookup | Lookup to the `IT_UnitKRAs` list |
| KPI | Lookup | Lookup to the `IT_UnitKPIs` list |
| Completed | Yes/No (Boolean) | |
| Recurrence | Single line of text | e.g., "Daily", "Weekly" |
| Tags | Multiple lines of text | Or use Managed Metadata |
| Subtasks | Multiple lines of text | |

### 2. IT Projects List
**SharePoint List Name:** `IT_UnitProjects`

| Column Name | SharePoint Column Type | Notes |
|---|---|---|
| Title | Single line of text | Maps to `name` |
| Description | Multiple lines of text | |
| Status | Choice | Options: `Not Started`, `In Progress`, `Completed`, `On Hold` |
| StartDate | Date and Time | |
| EndDate | Date and Time | |
| Manager | Person or Group | |
| Budget | Number | Using Number type for PNG Kina currency. |
| BudgetSpent | Number | Using Number type for PNG Kina currency. |
| Progress | Number | Choose 'Percentage' format |

### 3. IT Risks List
**SharePoint List Name:** `IT_UnitRisks`

| Column Name | SharePoint Column Type | Notes |
|---|---|---|
| Title | Single line of text | |
| Description | Multiple lines of text | |
| Status | Choice | Options: `Open`, `In Progress`, `Closed`, `Mitigated` |
| Impact | Choice | Options: `Low`, `Medium`, `High`, `Critical` |
| Likelihood | Choice | Options: `Low`, `Medium`, `High`, `Very High` |
| Category | Single line of text | |
| Owner | Person or Group | |
| IdentificationDate | Date and Time | |
| MitigationPlan | Multiple lines of text | |
| DivisionID | Single line of text | Maps to `division_id` |

### 4. IT KRAs List
**SharePoint List Name:** `IT_UnitKRAs`

| Column Name | SharePoint Column Type | Notes |
|---|---|---|
| Title | Single line of text | |
| Objective | Lookup | Lookup to the `IT_UnitObjectives` list |
| Description | Multiple lines of text | |
| Department | Single line of text | |
| StartDate | Date and Time | |
| TargetDate | Date and Time | |
| Status | Choice | Options: `On Track`, `At Risk`, `Off Track`, `Achieved` |
| Owner | Person or Group | |

### 5. IT KPIs List
**SharePoint List Name:** `IT_UnitKPIs`

| Column Name | SharePoint Column Type | Notes |
|---|---|---|
| Title | Single line of text | Maps to `name` |
| KRA | Lookup | Lookup to the `IT_UnitKRAs` list |
| Description | Multiple lines of text | |
| Target | Number | |
| Actual | Number | |
| StartDate | Date and Time | |
| TargetDate | Date and Time | |
| Status | Choice | Options: `On Track`, `At Risk`, `Off Track`, `Achieved` |
| Comments | Multiple lines of text | |
| Assignees | Person or Group | Allow multiple selections |
| Metric | Single line of text | e.g., "%", "$", "Count" |
| Progress | Number | Choose 'Percentage' format |
| CostAssociated | Number | Using Number type for PNG Kina currency. |

### 6. IT Objectives List
**SharePoint List Name:** `IT_UnitObjectives`

| Column Name | SharePoint Column Type | Notes |
|---|---|---|
| Title | Single line of text | |
| Description | Multiple lines of text | |

---

## Migration Plan Phases

### Phase 1: Foundation & Data Modeling (IT Unit)

**Goal**: Establish the full set of SharePoint Lists for the IT Unit.

1.  **Create SharePoint Lists for IT**: Following the guide in the Appendix, create the complete set of lists for the IT Unit as defined in the schema above.
2.  **Initial Data Migration**: Manually or via a script, migrate the IT Unit's data from the Supabase tables to the newly created `IT_` SharePoint Lists.

### Phase 2: Dynamic Service Integration

**Goal**: Implement services that can target the correct, unit-specific SharePoint list.

*This is our current phase.*

1.  **Develop SharePoint Service Modules**: Create service files (e.g., `src/integrations/sharepoint/unitServices.ts`) with functions that accept a `unitId` as a parameter.
2.  **Implement Dynamic List Naming**: Inside the service functions, dynamically construct the list name (e.g., `${unitId}_UnitTasks`) before making the Graph API call.
3.  **Refactor Data Hooks**: Modify the existing data hooks (`useTasksData`, etc.) to call the new SharePoint services, passing the current `unitId` to them.

---

## Appendix A: SharePoint List Creation Guide

This guide details the manual process for creating the required SharePoint lists.

### Part 1: Create a Blank List

For each new list (e.g., `IT_UnitTasks`, `IT_UnitProjects`):

1.  From your SharePoint site's home page, click **+ New** > **List**.
2.  Select **Blank list**.
3.  **Name and Describe the List:**
    *   **Name:** Use the specific name from the schema (e.g., `IT_UnitTasks`).
    *   **Description:** Add a brief, helpful description.
    *   Tick **Show in site navigation** for easy access.
4.  Click **Create**.

### Part 2: Add Columns to the List

After creating a list, it will have a default `Title` column. Use this for the main name/title of the item (e.g., the task title or project name).

To add more columns:
1.  Click **+ Add column** next to the last column header.
2.  Select the correct **Type** from the dropdown menu (e.g., `Multiple lines of text`, `Choice`, `Number`, `Date and Time`, `Person or Group`).
3.  A settings panel will appear on the right. Enter the **Name** for the column exactly as specified in the schema tables above.
4.  Configure any additional options as needed (e.g., for a `Choice` column, enter the options provided in the schema).
5.  Click **Save**.

### Part 3: Creating Lookup Columns

Some columns (like `Project` in the `IT_UnitTasks` list) link to other lists. These require special handling.

**Important Rule:** You must create the target list *before* you can create a lookup column that points to it. For example, you must create `IT_UnitProjects` before you can create the `Project` lookup column in `IT_UnitTasks`.

**How to create a Lookup column:**
1.  Navigate to the list where you want to add the lookup (e.g., `IT_UnitTasks`).
2.  Click **+ Add column** and select the **Lookup** type.
3.  Configure the column:
    *   **Name:** The name for the lookup column (e.g., `Project`).
    *   **Get information from:** Select the target list from the dropdown (e.g., `IT_UnitProjects`).
    *   **In this column:** Select the column from the target list you want to display (this is almost always `Title`).
4.  Click **Save**.

---

## Appendix B: Detailed Migration & Refactoring Log

This section provides a detailed, chronological log of the migration process, including strategy decisions and technical execution steps.

### 1. Initial Goal & Strategy Evolution

*   **Initial Goal:** The primary objective was to migrate the UNIT page feature from a Supabase backend to a SharePoint backend.
*   **User Feedback 1 (Phased Rollout):** The initial plan was to migrate the entire feature at once. Based on user feedback, this was revised to a more cautious, **unit-by-unit** phased rollout, starting with the **IT Unit**. This minimizes risk and allows for iterative testing.
*   **User Feedback 2 (Data Architecture):** The plan was further improved based on user feedback regarding data structure. Instead of using a single set of SharePoint lists with a `UnitID` column to separate data, the strategy was changed to create a **dedicated set of lists for each business unit** (e.g., `IT_UnitTasks`, `HR_UnitTasks`). This aligns better with SharePoint's security model and is more intuitive for end-users.

### 2. Phase 1: SharePoint Foundation

*   **List Creation:** I provided detailed, step-by-step instructions for the user to manually create the required set of SharePoint lists for the IT Unit, starting with `IT_UnitTasks` and proceeding through `IT_UnitProjects`, `IT_UnitRisks`, `IT_UnitKRAs`, `IT_UnitKPIs`, and `IT_UnitObjectives`.
*   **Schema Adjustment:** The user noted that the `Currency` field type in SharePoint was not suitable for their region (PNG Kina). The plan and schema were updated to use the `Number` field type for all currency-related data.
*   **Documentation:** At the user's request, the detailed instructions for creating the SharePoint lists were added to this document under **Appendix A**.

### 3. Phase 2: Service Integration

#### 3.1. Investigation of Existing SharePoint Integrations

Before writing new code, an investigation was launched to understand how the application already interacts with SharePoint.

*   **Gallery Page Findings:**
    *   The Gallery uses a **hybrid model**.
    *   Physical image files are uploaded to a SharePoint document library using logic found in `useSharePointUpload.ts`.
    *   However, the metadata (list of events, photo captions, and the URLs to the SharePoint files) is stored in and retrieved from **Supabase** via the `galleryService.ts`.
*   **HR Profiles Findings:**
    *   The HR module uses a **pure SharePoint model**.
    *   All data is stored in dedicated SharePoint lists prefixed with `HR_` (e.g., `HR_Employees`).
    *   A dedicated service class, `HRSharePointService`, contains all the logic to communicate with these lists.
    *   A React hook, `useHRService`, is responsible for creating an authenticated Microsoft Graph client and passing it to the `HRSharePointService`.
*   **Conclusion:** The HR Profiles feature provides the ideal architectural pattern to follow. However, the investigation revealed that the code for creating the authenticated Graph client was duplicated in at least three different React hooks (`useHRService.ts`, `useMicrosoftGraph.tsx`, `useSharePointUpload.ts`).

#### 3.2. The Refactoring Plan (To Eliminate Code Duplication)

To build the new services on a clean foundation, a refactoring plan was established:
1.  Create a single, central service file, `src/services/graphService.ts`, to contain the logic for creating an authenticated Graph client.
2.  Modify the existing hooks to call this new central service instead of using their own duplicated logic.
3.  Build the new UNIT page services using the central service.

#### 3.3. Refactoring Execution & Errors

This section details the execution of the refactoring plan.

*   **Step 1: `graphService.ts` Creation (Success):** The central service file `src/services/graphService.ts` was created successfully.
*   **Step 2: `useHRService.ts` Refactor (Success):** The `useHRService.ts` hook was successfully and seamlessly refactored to use the new central service. Initial attempts encountered tooling errors, but the final state of the file is correct.
*   **Step 3: `useMicrosoftGraph.tsx` Refactor (CRITICAL FAILURE):** A critical error occurred during the refactoring of this file. In the attempt to replace the old code, I incorrectly used the `write_file` tool and overwrote the file with incomplete pseudo-code instead of the fully refactored code. This broke the file and any features that depend on it.
*   **Step 4: Recovery Attempt 1 (Success):** I informed the user of the error and provided the `git checkout` command to restore the file. The user successfully restored the file.
*   **Step 5: `useMicrosoftGraph.tsx` Refactor 2 (CRITICAL FAILURE):** In a repeat of the previous error, I made the same mistake and once again overwrote `useMicrosoftGraph.tsx` with incomplete code. This revealed a flaw in my process for handling large, complex file modifications.

### 4. Current Status

As of the time of this writing, the migration is paused. The file `src/hooks/useMicrosoftGraph.tsx` is in a broken state. The immediate next step is for the user to restore this file from version control. Once restored, I will resume the refactoring using a safer, more incremental method that avoids overwriting entire files.
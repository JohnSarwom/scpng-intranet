# Asset Management: My Assets Page Data Requirements & Logic

## Overview

This document outlines how data is retrieved and filtered for the "My Assets" page within the Asset Management feature. This page is designed to show users the assets currently assigned to them.

## Data Source

The primary data source is the `public.assets` table in the Supabase database.

## Data Retrieval and Filtering

Data for the "My Assets" page is fetched dynamically via the `get-my-assets` Supabase Edge Function. This function is typically invoked by the `useAssetsData` hook (or similar data-fetching logic) within the frontend component (`src/pages/AssetManagement.tsx`).

The Edge Function implements role-based access control logic:

1.  **Non-Admin Users:**
    *   The frontend sends the logged-in user's email (`user_email`) to the function.
    *   The function executes a database query to select assets where the `assigned_to_email` column **exactly matches** the provided `user_email`.
    *   **Result:** The user sees only the assets directly assigned to their email address.

2.  **Admin Users:**
    *   The function checks if the provided `user_email` exists in a hardcoded `ADMIN_EMAILS` list within the function's code.
    *   If the email is found in the list, the function executes a database query to select **all** assets (`SELECT *`) from the `public.assets` table, regardless of the `assigned_to_email` value.
    *   **Result:** Users designated as admins see a complete list of all assets in the system.

**Important Note on Authentication:** The `get-my-assets` function currently uses the `SUPABASE_SERVICE_ROLE_KEY`. This means the function itself bypasses any Row Level Security (RLS) policies when it executes its queries. The filtering logic described above is implemented entirely within the function's code.

## Row Level Security (RLS) Policy

While the Edge Function bypasses RLS, there is typically an RLS policy configured on the `public.assets` table itself for added security (defense-in-depth). A common policy for the `SELECT` operation is:

```sql
-- Policy Name: Allow users to view their own assigned assets
CREATE POLICY "Allow users to view their own assigned assets"
ON public.assets
FOR SELECT
USING (auth.jwt()->>'email' = assigned_to_email);
```

This policy ensures that if a user were to attempt to query the `assets` table directly using their own authentication token (JWT), they would still only be able to see assets assigned to their email address.

## Edge Function Details: `get-my-assets`

*   **Location:** `supabase/functions/get-my-assets/index.ts`
*   **Purpose:** To serve asset data based on the requesting user's role (admin or non-admin).
*   **Authentication:** Uses Supabase Admin client (`SERVICE_ROLE_KEY`), bypassing RLS.
*   **Input:** Expects a POST request with a JSON body containing `{ "user_email": "user@example.com" }`.
*   **Core Logic Snippet (Simplified):**

    ```typescript
    // Simplified logic within the function
    const ADMIN_EMAILS = [
      "admin@scpng.gov.pg", 
      // ... other admin emails
    ];

    const body = await req.json(); 
    const user_email = body?.user_email;

    // ... (Error handling for missing email) ...

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, { /* ... */ });
    
    let query = supabaseAdmin.from("assets").select("*"); 

    const isAdmin = ADMIN_EMAILS.includes(user_email.toLowerCase());

    if (isAdmin) {
      // Admin: No additional filtering, query remains SELECT *
      console.log(`Admin user (${user_email}) detected. Fetching all assets.`);
    } else {
      // Non-Admin: Filter by assigned_to_email
      console.log(`Non-admin user (${user_email}). Filtering assets by assigned_to_email.`);
      query = query.eq("assigned_to_email", user_email);
    }

    // Execute the query
    const { data, error } = await query;

    // ... (Error handling for query execution) ...

    // Return data
    return new Response(JSON.stringify(data || []), { /* ... headers ... */ }); 
    ```

*   **Error Handling:** Includes checks for missing email in input, missing Supabase environment variables, database query errors, and malformed JSON input.
*   **CORS:** Handles preflight OPTIONS requests.

## Frontend Interaction

*   The `useAssetsData` hook (or equivalent) in the frontend is responsible for:
    *   Getting the current user's email (e.g., from MSAL).
    *   Calling the `get-my-assets` Edge Function with the user's email.
    *   Managing loading, error, and data states.
*   The `AssetManagement.tsx` component uses the data returned by the hook to render the table or card view of the assets. 

## Realtime Updates

To ensure the displayed asset data (including values updated by processes like the depreciation cron job) is current without requiring a manual page refresh, the application utilizes Supabase Realtime subscriptions.

1.  **Database Configuration:**
    *   Realtime functionality must be enabled for the `public.assets` table within the Supabase project dashboard (Database -> Replication). Specifically, the table needs to be part of the `supabase_realtime` publication (or another publication configured for Realtime) and broadcast `UPDATE` events.

2.  **Frontend Subscription (`src/pages/AssetManagement.tsx`):**
    *   A `useEffect` hook within the `AssetManagement` component establishes a Realtime subscription when the component mounts.
    *   This subscription listens specifically for `UPDATE` events on the `public.assets` table.
    *   When an `UPDATE` event is received from Supabase (indicating a row in the `assets` table has changed), the callback function triggers the `refresh()` function provided by the `useAssetsData` hook.
    *   Calling `refresh()` causes the hook to re-fetch the latest asset data from the `get-my-assets` Edge Function.
    *   The updated data is then reflected in the component's state, automatically re-rendering the UI with the latest information (e.g., the updated `depreciated_value`).
    *   The subscription is cleaned up (removed) when the component unmounts to prevent memory leaks.

This mechanism ensures that changes made to assets in the database (by any means, including background jobs) are reflected in the user interface in near real-time. 
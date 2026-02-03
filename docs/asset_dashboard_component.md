# Asset Dashboard Component (`src/components/assets/AssetDashboard.tsx`)

This document describes the structure, layout, and data sources for the main asset dashboard component.

## Purpose

The `AssetDashboard` component provides a high-level overview of asset-related metrics, including total value, recent activity, depreciation, and upcoming maintenance. It utilizes data fetched from Supabase views and updates in real-time.

## Layout Structure

The dashboard is divided into several main sections using a responsive grid layout (Tailwind CSS):

1.  **Top Metrics Cards:**
    *   Displays key performance indicators (KPIs) in individual cards.
    *   Shows: "Total asset value", "New acquisitions (30d)", and "Total Depreciation".
    *   Uses a 3-column layout on medium screens and up (`md:grid-cols-3`).
    *   (Placeholder card exists for potential 4th metric).

2.  **Charts Row:**
    *   Contains visualizations for key trends and breakdowns.
    *   Uses a 12-column grid layout on medium screens and up (`md:grid-cols-12`).
    *   **Left Chart (approx. 67% width - `md:col-span-8`):** "Total asset value overview" (Area chart showing cumulative purchase cost over time).
    *   **Right Chart (approx. 33% width - `md:col-span-4`):** "Depreciation by Type" (Donut chart showing total depreciation breakdown by asset type).

3.  **Bottom Section:**
    *   Displays monthly trends and recent activity lists.
    *   Uses a 3-column grid layout on large screens and up (`lg:grid-cols-3`), spanning the full width.
    *   **Left Column (2/3 width - `lg:col-span-2`):** Contains the "Monthly Acquisition Cost" card (Bar chart showing total purchase cost per month for the current year). This card automatically adjusts its height to match the right column.
    *   **Right Column (1/3 width - `lg:col-span-1`):** Contains three cards stacked vertically using flexbox (`flex flex-col`):
        1.  "Recently Assigned Assets" (List of assets assigned in the last 30 days).
        2.  "Recently Damaged Assets" (List of assets recently marked as damaged).
        3.  "Upcoming Maintenance" (Displays a list of maintenance items - currently static data).

## Data Sources & Realtime: Connecting Frontend UI to Backend Views

The `AssetDashboard.tsx` component fetches data dynamically from several pre-defined Supabase views within the `useEffect` hook, primarily using the `fetchAllData` function which calls individual fetch helpers (e.g., `fetchSummary`, `fetchTimeSeriesData`). Here's a detailed breakdown of the backend-frontend connection:

1.  **Top Metric Cards & Donut Chart Center Value:**
    *   **UI Elements:** "Total asset value", "New acquisitions (30d)", "Total Depreciation" cards, and the central value displayed inside the Depreciation donut chart.
    *   **Backend View:** `public.dashboard_total_value_summary`
    *   **Data Fetched:** This view provides a single row summary containing aggregate values like `total_purchase_cost`, `total_active_assets`, `total_distinct_active_types`, `total_depreciated_value`, `total_recent_purchase_cost`, `total_recent_assets`, and `total_recent_distinct_types`.
    *   **Frontend Fetch:** Fetched by the `fetchSummary` function and stored in the `summary` state variable.

2.  **Area Chart ("Total asset value overview"):**
    *   **UI Element:** The line chart showing the trend of cumulative asset value.
    *   **Backend View:** `public.dashboard_daily_value_timeseries`
    *   **Data Fetched:** Provides multiple rows, each containing a `report_date` and the corresponding `cumulative_purchase_cost` up to that date.
    *   **Frontend Fetch:** Fetched by the `fetchTimeSeriesData` function and stored in the `timeSeriesData` state variable.

3.  **Donut Chart Slices ("Depreciation by Type"):**
    *   **UI Element:** The segments of the donut chart representing depreciation per asset type.
    *   **Backend View:** `public.dashboard_depreciation_by_type`
    *   **Data Fetched:** Provides multiple rows, each containing an `asset_type` and its corresponding `total_depreciated_value_for_type`.
    *   **Frontend Fetch:** Fetched by the `fetchDepreciationData` function and stored in the `depreciationByTypeData` state variable.

4.  **Bar Chart ("Monthly Acquisition Cost"):**
    *   **UI Element:** The bar chart showing acquisition costs per month.
    *   **Backend View:** `public.dashboard_monthly_acquisition_cost`
    *   **Data Fetched:** Provides up to 12 rows (one for each month of the current year), each containing the `month` abbreviation (e.g., 'Jan') and the `total_acquisition` cost for that month.
    *   **Frontend Fetch:** Fetched by the `fetchMonthlyAcquisitionData` function and stored in the `monthlyAcquisitionData` state variable.

5.  **"Recently Assigned Assets" Card:**
    *   **UI Element:** The list displaying recently assigned assets.
    *   **Backend View:** `public.dashboard_recently_assigned_assets`
    *   **Data Fetched:** Provides up to 5 rows (limited by the view), each containing asset details like `id`, `name`, `image_url`, `assigned_date`, and `assigned_to` for assets assigned within the last 30 days.
    *   **Frontend Fetch:** Fetched by the `fetchRecentlyAssignedAssets` function and stored in the `recentlyAssignedAssets` state variable.

6.  **"Recently Damaged Assets" Card:**
    *   **UI Element:** The list displaying recently damaged assets.
    *   **Backend View:** `public.dashboard_recently_damaged_assets`
    *   **Data Fetched:** Provides up to 5 rows (limited by the view), each containing asset details like `id`, `name`, `image_url`, `last_updated` (when marked damaged), and `assigned_to` for assets currently with condition 'Damaged'.
    *   **Frontend Fetch:** Fetched by the `fetchRecentlyDamagedAssets` function and stored in the `recentlyDamagedAssets` state variable.

**Realtime Updates:**
*   The component establishes a Realtime subscription to any changes (`*`) on the `public.assets` table.
*   Upon detecting any change (INSERT, UPDATE, DELETE) in the `assets` table, the `fetchAllData` function is triggered again.
*   This ensures that **all** dashboard components re-fetch their data from their respective Supabase views, keeping the displayed information consistent and up-to-date with the underlying asset data.

## Key Libraries Used

*   React
*   Tailwind CSS (via `shadcn/ui`)
*   `shadcn/ui` (for Card, Tooltip, Avatar, etc.)
*   `recharts` (for Area, Pie/Donut, and Bar charts)
*   `@supabase/supabase-js` (for data fetching and Realtime)
*   `date-fns` (implicitly via `formatRelativeTime` if added there, or similar logic in `utils`)

## Future Enhancements / Placeholders

*   Implement actual data fetching and display for "Upcoming Maintenance".
*   Add logic for calculating and displaying period-over-period changes (% and difference) in the top metric cards.
*   Implement date filtering capabilities (e.g., the "This year" dropdown on the bar chart).
*   Consider making the list items in "Recently Assigned/Damaged" clickable, linking to the asset detail page. 
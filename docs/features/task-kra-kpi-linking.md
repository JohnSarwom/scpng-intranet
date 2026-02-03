# Task, KRA, and KPI Linking Feature

## Overview

This document outlines the implementation of a new feature that allows for the seamless linking of daily tasks and operations with strategic Key Result Areas (KRAs) and Key Performance Indicators (KPIs). This functionality enhances visibility and alignment between day-to-day activities and the broader objectives of the organization.

## Key Features

1.  **Linking Tasks to KRAs/KPIs:**
    *   When creating a new task or editing an existing one, users now have the option to link it to a specific KRA and KPI.
    *   Two new dropdown menus have been added to the task dialog modal: "Link to KRA" and "Link to KPI".
    *   The "Link to KPI" dropdown is dynamically populated based on the selected KRA, showing only the relevant KPIs.
    *   This linking is optional, allowing users to continue creating standalone "daily op" tasks.

2.  **Visibility in KRA/KPI Tab:**
    *   The main KRA/KPI table has been enhanced to display tasks that are linked to specific KPIs.
    *   A new "Linked Tasks" column has been added to the table.
    *   This column shows a count of the tasks linked to each KPI.
    *   Clicking on the task count reveals a popover that lists the titles of all associated tasks, providing a quick overview without cluttering the main table.

## Technical Implementation

### 1. Centralized Data Management

*   To ensure data consistency and efficiency, the fetching of `tasks`, `kras`, and `kpis` has been centralized in the main `src/pages/Unit.tsx` component.
*   This parent component now manages the state for this data and passes it down as props to the relevant child components (`TasksTab`, `KRAsTab`, etc.).

### 2. Component Modifications

*   **`src/pages/Unit.tsx`:**
    *   Modified to pass `tasks` data to `KRAsTab`.
    *   Modified to pass `kras` and `kpis` data to `TaskDialog`.

*   **`src/types/index.ts`:**
    *   The global `Task` interface was updated to include two new optional fields: `kra_id: string` and `kpi_id: string`.

*   **`src/components/unit-tabs/TaskDialog.tsx`:**
    *   The component's props were updated to accept `kras` and `kpis`.
    *   New state variables (`selectedKraId`, `selectedKpiId`) were added to manage the user's selection.
    *   The UI was updated with two new `<Select>` components for KRA and KPI selection.
    *   The `handleSubmit` function was modified to include the `kra_id` and `kpi_id` in the submitted task data.

*   **`src/components/unit-tabs/KRAsTab.tsx`:**
    *   The component's props were updated to accept the `tasks` array.
    *   A new "Linked Tasks" column was added to the table.
    *   Logic was implemented to filter the `tasks` array and display the count and titles of tasks linked to each KPI using a `<Popover>` component.

### 3. Type Safety

*   The local `Task` interface in `TasksTab.tsx` was removed, and all components were updated to import the central `Task` type from `src/types/index.ts` to ensure type consistency across the application.

## Future Work

The next phase of this project will involve implementing the back-end logic to persist the `kra_id` and `kpi_id` relationships in the Supabase database when a task is created or updated.

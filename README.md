# SCPNG Intranet - Division-Based Access Control

This document provides instructions for setting up and using the division-based access control system in the SCPNG Intranet application.

## Overview

The SCPNG Intranet application implements a role-based access control system that restricts user access based on:
1. The division(s) a user belongs to
2. The role(s) they have within each division

## Database Setup

To set up the database tables and initial data, follow these steps:

1. Run the database setup script to create the necessary tables:
   ```bash
   psql -U your_username -d your_database -f db/setup_division_tables.sql
   ```

2. Import all staff members data:
   ```bash
   psql -U your_username -d your_database -f db/seed_all_staff.sql
   ```

3. Assign users to their respective divisions with appropriate roles:
   ```bash
   psql -U your_username -d your_database -f db/assign_users_to_divisions.sql
   ```

4. Add division_id to all database tables and set up row-level security policies:
   ```bash
   psql -U your_username -d your_database -f db/add_division_id_to_tables.sql
   ```

## Database Schema

The system uses the following main tables:

1. **divisions** - Contains information about each division
2. **staff_members** - Contains details about each staff member
3. **division_memberships** - Links staff members to divisions with specific roles
4. **unit_tasks** - Tasks with division-based access control
5. **unit_projects** - Projects with division-based access control
6. **unit_risks** - Risks with division-based access control
7. **unit_assets** - Assets with division-based access control
8. **unit_kras** - KRAs with division-based access control
9. **unit_kpis** - KPIs with division-based access control

> **Important Note**: All division IDs are of type VARCHAR (character varying), not UUID. The foreign key constraints must match this data type.

## Row-Level Security

The database uses Supabase Row-Level Security (RLS) policies to restrict access based on divisions:

- Each user can only see data from divisions they're a member of
- The policies use the `get_user_division_ids` function to match the user's email with their division memberships

## Role Hierarchy

Roles are arranged in a hierarchy (from highest to lowest authority):
1. **admin** - Can access and modify everything
2. **director** - Can access all division content and manage division settings
3. **manager** - Can access most division content and manage certain aspects
4. **officer** - Has standard access to division content
5. **staff** - Has basic access to division content

## Components Used

The division-based access control system uses the following key components:

1. **DivisionProtectedRoute** - A higher-order component that wraps routes requiring division-based access control
2. **DivisionSelector** - A component that allows users to switch between their authorized divisions
3. **useAuth** - A custom hook that provides user authentication information
4. **useDivisionContext** - A custom hook that provides division membership and role information

## Division Selector

The application includes a `DivisionSelector` component that appears in the navigation bar, allowing users to switch between their authorized divisions. When a user selects a division, all data shown throughout the application will be filtered to only display content from that division.

## Checking Access Programmatically

You can check if a user has access based on their division and role:

```jsx
import { useDivisionContext } from "../hooks/useDivisionContext";

function MyComponent() {
  const { userHasRole, currentDivisionId } = useDivisionContext();
  
  // Check if user is at least a manager in the current division
  const canEditContent = userHasRole(["admin", "director", "manager"], currentDivisionId);
  
  // Check if user is a director in the executive division
  const canApprovePolicy = userHasRole(["admin", "director"], "executive-division");
  
  return (
    <div>
      {canEditContent && <button>Edit Content</button>}
      {canApprovePolicy && <button>Approve Policy</button>}
    </div>
  );
}
```

## Troubleshooting

If users experience access issues:
1. Verify their email address is correctly entered in the `staff_members` table
2. Check that they have appropriate entries in the `division_memberships` table
3. Review the role assigned to ensure it matches their job requirements
4. Ensure the data has a proper `division_id` value set
5. Check that Row-Level Security (RLS) is enabled on all tables

## Common Error: Missing Division ID

If data disappears after refresh, the most likely cause is that the data was saved without a `division_id`. Check that:

1. The user has a valid current division selected
2. Forms for adding new items include the division ID
3. The `division_id` is properly passed to the database during insertion

## Adding New Tables

When adding new tables that should be division-restricted:

1. Add a `division_id VARCHAR REFERENCES divisions(id)` column
2. Add an index: `CREATE INDEX idx_table_name_division_id ON table_name(division_id);`
3. Enable RLS: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
4. Create a policy: 
   ```sql
   CREATE POLICY table_name_division_policy ON table_name
   USING (division_id IN (SELECT get_user_division_ids(auth.jwt() ->> 'email')));
   ```

## Documentation

For more detailed information about the division-based access control system, refer to:
- [Division-Based Access Control Documentation](docs/division-based-access.md)

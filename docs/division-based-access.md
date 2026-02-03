# Division-Based Access Control System

This document explains the division-based access control system implemented in the SCPNG Intranet application. The system allows users to access content and features based on their division membership and role within that division.

## Overview

The SCPNG organization is structured into several divisions:

1. **Executive Division** - Top management and leadership
2. **Corporate Services Division** - HR, Finance, and IT services 
3. **Licensing Market & Supervision Division** - Handles licensing and market supervision
4. **Legal Services Division** - Provides legal advisory services
5. **Research & Publication Division** - Manages research and publications
6. **Secretariat Unit** - Supports executive with administrative functions

Each staff member belongs to one or more divisions and has a specific role within each division.

## Role Hierarchy

The following roles are defined in order of decreasing authority:

1. **Admin** - Has access to everything across all divisions
2. **Director** - Top leadership of a specific division
3. **Manager** - Manages a unit or department within a division
4. **Officer** - Regular staff with specific responsibilities
5. **Staff** - General staff members

## Database Schema

The system uses three main tables in Supabase:

1. **divisions** - Stores information about each division
2. **staff_members** - Contains staff details including their primary division
3. **division_memberships** - Maps users to divisions with their specific roles

## Implementation Details

### Authentication Flow

1. Users log in using Microsoft authentication or local credentials
2. Upon successful login, the system fetches the user's division memberships
3. The user can switch between divisions they have access to using the division selector

### Access Control Components

- **DivisionProtectedRoute** - A React component that restricts access based on division membership and role
- **DivisionSelector** - UI component allowing users to switch between divisions they have access to

### Code Examples

#### Protecting a Route

```jsx
// Only users in the Executive Division can access this route
<Route path="/calendar" element={
  <DivisionProtectedRoute requiredDivisionId="executive-division">
    <Calendar />
  </DivisionProtectedRoute>
} />

// Only directors and managers can access this route
<Route path="/gallery" element={
  <DivisionProtectedRoute requiredRoles={['director', 'manager']}>
    <Gallery />
  </DivisionProtectedRoute>
} />
```

#### Checking Access Programmatically

```jsx
// In a component
const { hasAccessToDivision, user } = useAuth();

// Check if user has access to a specific division
if (hasAccessToDivision('legal-services-division')) {
  // Render content for Legal Services Division
}

// Check user's role in their current division
if (user?.divisionRole === 'director') {
  // Show director-specific features
}
```

## Filtering Content by Division

The Contacts page demonstrates how to filter content based on the user's selected division:

```jsx
// Filter by division, search term, and other filters
const filteredContacts = allContacts.filter(contact => {
  // Division filter
  const matchesDivision = isAdmin 
    ? true // Admins see everything
    : !selectedDivision // If no division is selected
    ? true // Show all
    : contact.divisionId === selectedDivision; // Otherwise filter by division
    
  // Additional filters...
  
  return matchesDivision && matchesSearch && matchesDepartmentFilter;
});
```

## Setting Up the Database

Two SQL scripts are provided for setting up the database:

1. `setup_division_tables.sql` - Creates necessary tables and inserts initial data
2. `assign_users_to_divisions.sql` - Assigns users to divisions with appropriate roles based on job titles

## Troubleshooting

- If a user can't access content they should have access to, check:
  - Their division memberships in the database
  - The role assigned to them in that division
  - That they have selected the correct division in the UI
  
- The "Unauthorized" page is displayed when a user attempts to access content they don't have permission for

## Future Enhancements

- **Fine-grained Permissions**: Add more specific permissions within roles
- **Permission Delegation**: Allow directors to assign temporary access to other staff
- **Audit Logging**: Track permission changes and access attempts
- **Group-based Access**: Create groups that span multiple divisions 
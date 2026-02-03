# Ticketing System

## Overview
The Ticketing System is a comprehensive front desk solution designed to manage visitor interactions, support requests, and task tracking. This system enables staff to track, manage, and resolve various types of inquiries and requests through a flexible, intuitive interface.

## Features

### Ticket Manager
- **Kanban Board View**: Drag-and-drop interface for ticket management with customizable columns
- **Multiple View Modes**: Toggle between board, grid, and list views
- **Ticket Creation**: Create new tickets with detailed information
- **Ticket Filtering**: Filter tickets based on status, priority, assignee, and date
- **Task Completion Tracking**: Mark tasks as complete and view completed tasks separately
- **Custom Columns**: Create, rename, and delete columns for workflow customization
- **Priority Levels**: Assign High, Medium, or Low priority to tickets
- **Due Date Assignment**: Set and track ticket due dates
- **Ticket Assignment**: Assign tickets to specific team members
- **Drag-and-Drop**: Move tickets between different stages of the workflow

### Ticket Inbox
- **Ticket Listing**: View all tickets in an email-like inbox
- **Conversation Threading**: Track conversations related to each ticket
- **Reply System**: Public and private reply options
- **File Attachments**: Attach files to ticket conversations
- **Ticket Details**: View and edit ticket details in a side panel
- **Ticket Assignment**: Assign tickets to team members
- **Priority Management**: Set and change ticket priorities
- **Tag System**: Add tags to tickets for organization
- **Related Items**: Link tickets to other tickets or resources

### Visitor Management
- **Visitor Tracking**: Track visitors across different stages (scheduled, checked-in, checked-out, no-show)
- **Multiple Views**: Board, grid, and list views for visitor information
- **Visitor Registration**: Register new visitors with detailed information in a wider, two-column modal (photo left, fields right)
- **Photo Upload**: Upload visitor photos for identification
- **Visit Scheduling**: Schedule visits with start/end dates and specific time using a date range picker
- **Host Assignment**: Assign visitors to hosts within the organization
- **Drag-and-Drop Interface**: Move visitors between different statuses (columns highlight, red line indicates drop position)
- **Search and Filter**: Find visitors based on various criteria
- **Check-in/Check-out**: Process visitor arrivals and departures

### Additional Ticket Categories (Placeholder)
- Appointments
- Mail & Packages
- General Inquiries
- Employee Support
- Event Prep
- Feedback & Complaints

## Components Used

### TicketManager.tsx
The core component for managing tickets in a flexible, drag-and-drop interface with multiple views.

**Key Features:**
- Multiple view modes (board, grid, list)
- Custom board columns/buckets
- Filtering system
- Ticket creation, editing, and deletion
- Drag-and-drop functionality
- Completed task tracking
- Priority and status management

**Data Structure:**
```typescript
interface TicketCardProps {
  id: string;
  title: string;
  description?: string;
  priority: "High" | "Medium" | "Low";
  assignee?: {
    name: string;
    avatarFallback: string;
    avatarImage?: string;
  };
  dueDate?: string;
  commentsCount?: number;
  status?: string;
  type?: string;
  createdAt?: string;
  completed: boolean;
  onComplete: (id: string, completed: boolean) => void;
}
```

### TicketInbox.tsx
Provides an email-like interface for managing ticket communications and details.

**Key Features:**
- Ticket listing sidebar
- Conversation thread view
- Reply composition with formatting options
- File attachments
- Ticket details sidebar
- Assignee and priority management

**Data Structure:**
```typescript
interface Ticket {
  id: string;
  title: string;
  code: string;
  status: string;
  date: string;
  selected: boolean;
}

interface ConversationMessage {
  id: number;
  sender: {
    name: string;
    avatar: string;
  };
  recipient: string;
  content: string;
  date: string;
  attachments: { name: string; date: string }[];
}
```

### VisitorManagement.tsx
Manages visitor registration, check-in/check-out processes, and visitor tracking.

**Key Features:**
- Multiple view modes (board, grid, list)
- Visitor card management
- Photo uploads
- Visitor status tracking
- Host assignment
- Drag-and-drop interface

**Data Structure:**
```typescript
interface Visitor {
  id: number;
  firstName: string;
  lastName: string;
  company: string;
  status: 'scheduled' | 'checked-in' | 'checked-out' | 'no-show';
  time: string;
  host: string;
  duration: string;
  initials: string;
  email?: string;
  phone?: string;
  purpose?: string;
  notes?: string;
  visitStartDate?: Date;
  visitEndDate?: Date;
  photoUrl?: string;
  assignees?: string[];
}
```

### TicketDialog.tsx
Modal dialog for creating and editing tickets.

**Key Features:**
- Form for ticket creation/editing (wider modal with grid layout)
- Priority, status, and group selection
- Due date picker
- Comment system
- File attachment options

**Data Structure:**
```typescript
interface TicketData {
  id?: string; 
  title: string;
  description?: string;
  priority?: 'Low' | 'Medium' | 'High';
  status?: string;
  dueDate?: Date | null;
  assigneeId?: string | null;
  groupId?: string;
  comments?: Comment[];
}
```

### TicketCard.tsx
Reusable component for displaying individual tickets.

**Key Features:**
- Priority indicators
- Due date display
- Assignee information
- Comment count
- Completion checkbox
- Edit and delete options

## Data Flow

### Creating a Ticket
1. User clicks the "New Ticket" button or uses the "+" button in a column
2. TicketDialog modal opens with a form
3. User fills in ticket details and submits the form
4. TicketManager component adds the new ticket to the specified status column
5. UI updates to show the new ticket

### Moving a Ticket
1. User drags a ticket card from one column to another
2. DndKit library handles the drag-and-drop interaction
3. On drop, the TicketManager updates the ticket's status
4. UI updates to reflect the new position

### Managing Ticket Conversations
1. User selects a ticket in the Ticket Inbox
2. Conversation thread and ticket details are loaded
3. User can reply to the conversation or update ticket details
4. Changes are reflected in the UI

### Managing Visitors
1. User adds a new visitor or updates an existing visitor's status
2. Visitor card is created or updated in the relevant status column
3. UI reflects the changes to visitor status

## UI Elements

### Tabs and Navigation
- Top-level tabs for different ticket categories
- View mode toggles (board/grid/list)
- Filter options

### Action Buttons
- New Ticket button
- Add Column button
- Filter button
- Search functionality

### Cards and Dialogs
- Ticket cards with drag-and-drop functionality
- Visitor cards with status indicators
- Dialog modals for creating and editing items
- Dropdown menus for actions

### Status Indicators
- Visual indicators for priority levels
- Status badges
- Due date highlighting
- Completion checkmarks

## Configuration

The Ticketing System can be configured in several ways:

### Column Customization
- Create custom columns to match workflow requirements
- Rename columns to reflect specific processes
- Delete unused columns

### Priority Levels
- Three standard priority levels (High, Medium, Low)
- Visual indicators for each priority level

### Status Options
- Default statuses: To Do, In Progress, Done
- Custom statuses through column creation

### View Preferences
- Board view (Kanban)
- Grid view (Card grid)
- List view (Detailed rows)

## Related Documentation
- [Components - Ticketing](/docs/components/ticketing/README.md)
- [UI Components](/docs/components/ui/README.md)
- [Database Schema](/docs/database/README.md) 
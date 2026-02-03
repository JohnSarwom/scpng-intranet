# Ticketing Components

This directory contains the core components used in the Ticketing System.

## Component Overview

The ticketing system is built using the following primary components:

1. **TicketManager** - Kanban-style ticket management with multiple views
2. **TicketInbox** - Email-like ticket conversation management
3. **VisitorManagement** - Visitor tracking and management system
4. **TicketDialog** - Modal for creating and editing tickets
5. **TicketCard** - Reusable card component for displaying tickets

## TicketManager

### Purpose
Provides a flexible interface for managing tickets using multiple view modes (board, grid, list) with drag-and-drop functionality.

### Usage
```jsx
<TicketManager />
```

### Features
- Kanban board view with customizable columns
- Grid and list alternative views
- Drag-and-drop ticket management (columns highlight, red line indicates drop position)
- Ticket creation, editing, and deletion
- Custom column creation, renaming, and deletion
- Priority and status management
- Due date tracking
- Ticket filtering and searching
- Completion tracking with separate completed tasks section

### State Management
- Tracks board data (columns and tickets)
- Manages ticket filters
- Handles view mode preferences
- Tracks active dialog states
- Manages drag-and-drop interactions (including drop target position for indicator)

### Dependencies
- DndKit library for drag-and-drop
- date-fns for date manipulation
- Shadcn UI components for the interface
- Lucide icons for visual elements

## TicketInbox

### Purpose
Provides an email-like interface for managing ticket communications and details.

### Usage
```jsx
<TicketInbox />
```

### Features
- Ticket listing with selection functionality
- Conversation threading for ticket communications
- Reply composition with formatting options
- File attachment capabilities
- Ticket details sidebar for managing metadata
- Public and private reply options

### State Management
- Tracks selected ticket
- Manages conversation data
- Handles reply composition state

### Dependencies
- Shadcn UI components
- Lucide icons

## VisitorManagement

### Purpose
Manages visitor registration, tracking, and status changes throughout the visitor lifecycle.

### Usage
```jsx
<VisitorManagement />
```

### Features
- Multiple view modes (board, grid, list)
- Visitor registration with detailed information (uses a wider, two-column modal: photo left, fields right, scrollable content with fixed header/footer)
- Photo upload capabilities
- Status tracking (scheduled, checked-in, checked-out, no-show)
- Host assignment
- Drag-and-drop status management (columns highlight, red line indicates drop position within column)
- Search and filtering options
- Visit date range selection (start and end date)

### State Management
- Tracks visitor data and status
- Manages form state for visitor creation/editing (including date range)
- Handles view mode preferences
- Tracks active dialog states
- Manages drag-and-drop interactions (including drop target position for indicator)

### Dependencies
- DndKit library for drag-and-drop
- date-fns for date formatting
- Shadcn UI components
- Lucide icons

## TicketDialog

### Purpose
Modal dialog for creating and editing tickets with comprehensive form fields, presented in a wider modal with an organized grid layout and scrollable content area.

### Usage
```jsx
<TicketDialog
  isOpen={isOpen}
  onClose={handleClose}
  onSubmit={handleTicketSubmit}
  initialData={editingTicket}
  statuses={statuses}
  defaultStatus={defaultStatus}
  buckets={buckets}
  defaultGroup={defaultGroup}
/>
```

### Props
| Prop Name | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| isOpen | boolean | Yes | - | Controls dialog visibility |
| onClose | function | Yes | - | Handler for dialog close |
| onSubmit | function | Yes | - | Handler for form submission |
| initialData | TicketData | No | null | Data for editing existing ticket |
| statuses | StatusOption[] | No | basic statuses | Available ticket statuses |
| defaultStatus | string | No | null | Default status for new tickets |
| buckets | Bucket[] | No | [] | Available columns/groups |
| defaultGroup | string | No | null | Default group for new tickets |

### State Management
- Form field values (title, description, etc.)
- Comments management
- Form validation

### Dependencies
- Shadcn UI Dialog and form components
- date-fns for date formatting

## TicketCard

### Purpose
Reusable card component for displaying ticket information in various views.

### Usage
```jsx
<TicketCard
  id={ticket.id}
  title={ticket.title}
  description={ticket.description}
  priority={ticket.priority}
  assignee={ticket.assignee}
  dueDate={ticket.dueDate}
  commentsCount={ticket.commentsCount}
  status={ticket.status}
  completed={ticket.completed}
  onEdit={() => handleEditTicket(ticket.id)}
  onDelete={() => handleDeleteTicket(ticket.id)}
  onComplete={handleToggleComplete}
/>
```

### Props
| Prop Name | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| id | string | Yes | - | Unique ticket identifier |
| title | string | Yes | - | Ticket title |
| description | string | No | - | Ticket description |
| priority | "High" \| "Medium" \| "Low" | Yes | - | Ticket priority level |
| assignee | object | No | - | Assigned user info |
| dueDate | string | No | - | Formatted due date |
| commentsCount | number | No | - | Number of comments |
| status | string | No | - | Current ticket status |
| completed | boolean | Yes | - | Completion state |
| onEdit | function | No | - | Edit handler |
| onDelete | function | No | - | Delete handler |
| onComplete | function | Yes | - | Completion toggle handler |

### Dependencies
- Shadcn UI components for styling
- DndKit for drag-and-drop capability

## Technical Implementation Details

### Drag-and-Drop System
The ticketing system uses DndKit for its drag-and-drop functionality:

- **DndContext** - Provides the drag-and-drop context
- **SortableContext** - Manages sortable items within a container
- **useSortable** - Hook for making items sortable
- **useDroppable** - Hook for creating drop targets
- **DragOverlay** - Renders the item being dragged
- **Visual Drop Indicator**: A red line is rendered between items during drag-over to show the precise insertion point (implemented via state updated in `onDragOver` and conditional rendering within `SortableContext`).

Key handlers:
- `handleDragStart` - Captures the initial drag state
- `handleDragOver` - Handles dragging over potential drop targets, calculates collision and insertion point for indicator
- `handleDragEnd` - Finalizes the drag operation and updates state

### View Mode Switching
The system supports multiple view modes through conditional rendering:

```jsx
{viewMode === 'board' && (
  <BoardView 
    tickets={filteredTickets} 
    buckets={buckets} 
    // other props 
  />
)}

{viewMode === 'grid' && (
  <GridView 
    tickets={filteredTickets} 
    // other props 
  />
)}

{viewMode === 'list' && (
  <ListView 
    tickets={filteredTickets} 
    buckets={buckets} 
    // other props 
  />
)}
```

### Filtering System
The filtering system allows users to filter tickets based on multiple criteria:

1. Status filters (todo, in progress, done)
2. Priority filters (high, medium, low)
3. Assignee filters
4. Date range filters

Implementation involves maintaining filter state and applying it to the data:

```typescript
const getFilteredTickets = () => {
  // Filter logic that applies all active filters
  // to the ticket data and returns filtered results
}
```

## Best Practices for Extending

When extending the ticketing components:

1. **Maintain Component Structure**: Follow the existing pattern of separating concerns.
2. **Respect Data Flow**: Use props for data passing and callbacks for actions.
3. **Extend Interfaces**: Add to existing TypeScript interfaces rather than creating duplicates.
4. **Preserve Drag-and-Drop**: Ensure new elements work with the DndKit implementation.
5. **Follow Design System**: Use the existing Shadcn UI components and styling approach.

## Related Components
- [UI Components](/docs/components/ui/README.md)
- [Layout Components](/docs/components/layout/README.md) 
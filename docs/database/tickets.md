# Ticketing System Database Schema

This document outlines the database schema for the Ticketing System, including tables, relationships, and security policies.

## Tables Overview

The Ticketing System utilizes the following core tables:

1. `tickets` - Main ticket records
2. `ticket_comments` - Comments and conversation threads for tickets
3. `ticket_statuses` - Available ticket status options
4. `ticket_priorities` - Priority level definitions
5. `ticket_types` - Types of tickets (task, bug, feature, etc.)
6. `ticket_attachments` - Files attached to tickets
7. `visitors` - Visitor registration and tracking
8. `visitor_statuses` - Status options for visitors

## Schema Details

### tickets

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | UUID | Primary Key | Unique ticket identifier |
| title | TEXT | NOT NULL | Ticket title |
| description | TEXT | | Detailed description |
| status_id | UUID | FOREIGN KEY | Reference to ticket_statuses |
| priority_id | UUID | FOREIGN KEY | Reference to ticket_priorities |
| type_id | UUID | FOREIGN KEY | Reference to ticket_types |
| assignee_id | UUID | FOREIGN KEY | User assigned to the ticket |
| reporter_id | UUID | FOREIGN KEY | User who reported the ticket |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |
| due_date | TIMESTAMP | | When the ticket is due |
| completed | BOOLEAN | NOT NULL | Whether the ticket is completed |
| completed_at | TIMESTAMP | | When the ticket was completed |
| column_id | TEXT | | Current board column identifier |
| column_order | INTEGER | | Order within the column |

### ticket_comments

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | UUID | Primary Key | Unique comment identifier |
| ticket_id | UUID | FOREIGN KEY | Reference to tickets |
| user_id | UUID | FOREIGN KEY | User who made the comment |
| content | TEXT | NOT NULL | Comment text content |
| is_private | BOOLEAN | NOT NULL | Whether comment is private |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |

### ticket_attachments

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | UUID | Primary Key | Unique attachment identifier |
| ticket_id | UUID | FOREIGN KEY | Reference to tickets |
| comment_id | UUID | FOREIGN KEY | Reference to ticket_comments |
| file_name | TEXT | NOT NULL | Original file name |
| file_path | TEXT | NOT NULL | Storage path to file |
| file_type | TEXT | NOT NULL | MIME type of file |
| file_size | INTEGER | NOT NULL | Size in bytes |
| uploaded_by | UUID | FOREIGN KEY | User who uploaded the file |
| created_at | TIMESTAMP | NOT NULL | Upload timestamp |

### ticket_statuses

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | UUID | Primary Key | Unique status identifier |
| name | TEXT | NOT NULL | Status name |
| description | TEXT | | Status description |
| color | TEXT | | Color code for status |
| order | INTEGER | | Display order |
| is_default | BOOLEAN | | Whether it's a default status |

### ticket_priorities

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | UUID | Primary Key | Unique priority identifier |
| name | TEXT | NOT NULL | Priority name (High, Medium, Low) |
| description | TEXT | | Priority description |
| color | TEXT | | Color code for priority |
| order | INTEGER | | Display order |

### ticket_types

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | UUID | Primary Key | Unique type identifier |
| name | TEXT | NOT NULL | Type name (Task, Bug, etc.) |
| description | TEXT | | Type description |
| icon | TEXT | | Icon identifier for type |

### visitors

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | UUID | Primary Key | Unique visitor identifier |
| first_name | TEXT | NOT NULL | Visitor's first name |
| last_name | TEXT | NOT NULL | Visitor's last name |
| company | TEXT | | Visitor's company |
| email | TEXT | | Visitor's email address |
| phone | TEXT | | Visitor's phone number |
| purpose | TEXT | | Purpose of visit |
| status_id | UUID | FOREIGN KEY | Reference to visitor_statuses |
| host_id | UUID | FOREIGN KEY | Staff member hosting the visitor |
| visit_start_date | TIMESTAMP | | Scheduled/actual visit start date |
| visit_end_date | TIMESTAMP | | Scheduled/actual visit end date |
| visit_time | TIME | | Specific time of visit (if needed alongside dates) |
| checked_in_at | TIMESTAMP | | Actual check-in time |
| checked_out_at | TIMESTAMP | | Check-out time |
| notes | TEXT | | Additional notes |
| photo_url | TEXT | | Visitor photo URL |
| created_at | TIMESTAMP | NOT NULL | Record creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |

### visitor_statuses

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | UUID | Primary Key | Unique status identifier |
| name | TEXT | NOT NULL | Status name (scheduled, checked-in, etc.) |
| description | TEXT | | Status description |
| color | TEXT | | Color code for status |
| order | INTEGER | | Display order |

## Relationships

### Primary Relationships

- **tickets → ticket_statuses**: Many-to-one relationship connecting tickets to their status
- **tickets → ticket_priorities**: Many-to-one relationship connecting tickets to their priority
- **tickets → ticket_types**: Many-to-one relationship connecting tickets to their type
- **tickets → users (assignee_id)**: Many-to-one relationship connecting tickets to assigned users
- **tickets → users (reporter_id)**: Many-to-one relationship connecting tickets to reporting users
- **ticket_comments → tickets**: Many-to-one relationship connecting comments to their tickets
- **ticket_comments → users**: Many-to-one relationship connecting comments to authors
- **ticket_attachments → tickets**: Many-to-one relationship connecting attachments to tickets
- **ticket_attachments → ticket_comments**: Many-to-one relationship connecting attachments to comments
- **visitors → visitor_statuses**: Many-to-one relationship connecting visitors to their status
- **visitors → users (host_id)**: Many-to-one relationship connecting visitors to hosts

## Indexes

| Index Name | Table | Columns | Type | Description |
|------------|-------|---------|------|-------------|
| idx_tickets_status | tickets | status_id | BTREE | Improve filtering by status |
| idx_tickets_assignee | tickets | assignee_id | BTREE | Improve filtering by assignee |
| idx_tickets_due_date | tickets | due_date | BTREE | Improve date-based queries |
| idx_ticket_comments_ticket | ticket_comments | ticket_id | BTREE | Improve comment lookups by ticket |
| idx_visitors_status | visitors | status_id | BTREE | Improve filtering by visitor status |
| idx_visitors_checkin | visitors | checked_in_at | BTREE | Improve time-based queries |

## RLS Policies (Row Level Security)

### tickets Table

| Policy Name | Operation | Using Expression | With Check Expression | Description |
|-------------|-----------|------------------|----------------------|-------------|
| tickets_view_policy | SELECT | (auth.uid() = assignee_id) OR (auth.uid() = reporter_id) OR (auth.uid() IN (SELECT user_id FROM staff WHERE role IN ('admin', 'manager'))) | - | Users can see tickets assigned to them, reported by them, or if they're admins/managers |
| tickets_insert_policy | INSERT | true | (auth.uid() = reporter_id) OR (auth.uid() IN (SELECT user_id FROM staff WHERE role IN ('admin', 'manager'))) | Any authenticated user can create tickets, but must set themselves as reporter unless admin/manager |
| tickets_update_policy | UPDATE | (auth.uid() = assignee_id) OR (auth.uid() = reporter_id) OR (auth.uid() IN (SELECT user_id FROM staff WHERE role IN ('admin', 'manager'))) | - | Users can update tickets assigned to them, reported by them, or if they're admins/managers |
| tickets_delete_policy | DELETE | (auth.uid() IN (SELECT user_id FROM staff WHERE role IN ('admin', 'manager'))) | - | Only admins/managers can delete tickets |

### ticket_comments Table

| Policy Name | Operation | Using Expression | With Check Expression | Description |
|-------------|-----------|------------------|----------------------|-------------|
| comments_view_policy | SELECT | (EXISTS (SELECT 1 FROM tickets WHERE tickets.id = ticket_comments.ticket_id AND ((tickets.assignee_id = auth.uid()) OR (tickets.reporter_id = auth.uid()) OR (auth.uid() IN (SELECT user_id FROM staff WHERE role IN ('admin', 'manager')))))) AND (NOT is_private OR auth.uid() IN (SELECT user_id FROM staff WHERE role IN ('admin', 'manager'))) | - | Users can see comments on tickets they're assigned to or reported, admins/managers can see all comments including private ones |
| comments_insert_policy | INSERT | EXISTS (SELECT 1 FROM tickets WHERE tickets.id = ticket_comments.ticket_id AND ((tickets.assignee_id = auth.uid()) OR (tickets.reporter_id = auth.uid()) OR (auth.uid() IN (SELECT user_id FROM staff WHERE role IN ('admin', 'manager'))))) | (user_id = auth.uid()) | Users can add comments to tickets they're assigned to or reported, must set themselves as author |

## Functions and Triggers

### Function: update_ticket_timestamp()
Automatically updates the `updated_at` field on ticket changes.

### Function: update_comment_timestamp()
Automatically updates the `updated_at` field on comment changes.

### Function: notify_ticket_assigned()
Sends notification when a ticket is assigned to a user.

### Function: notify_ticket_commented()
Sends notification when a comment is added to a ticket.

### Trigger: tickets_updated
Fires the update_ticket_timestamp() function when a ticket is updated.

### Trigger: comments_updated
Fires the update_comment_timestamp() function when a comment is updated.

### Trigger: ticket_assigned_notification
Fires the notify_ticket_assigned() function when a ticket's assignee_id is changed.

### Trigger: ticket_commented_notification
Fires the notify_ticket_commented() function when a new comment is added.

## Migration History

| Migration | Date | Description |
|-----------|------|-------------|
| 001_create_ticket_tables | 2023-01-15 | Initial creation of ticket-related tables |
| 002_add_completed_field | 2023-02-10 | Added completed and completed_at fields |
| 003_add_visitor_tables | 2023-03-05 | Added visitor management tables |
| 004_add_column_tracking | 2023-04-20 | Added column_id and column_order to tickets |
| 005_add_ticket_attachments | 2023-05-15 | Added attachment functionality |

## Sample Queries

### Get all active tickets assigned to current user
```sql
SELECT t.*, s.name as status_name, p.name as priority_name, tp.name as type_name
FROM tickets t
JOIN ticket_statuses s ON t.status_id = s.id
JOIN ticket_priorities p ON t.priority_id = p.id
JOIN ticket_types tp ON t.type_id = tp.id
WHERE t.assignee_id = auth.uid() 
AND t.completed = false
ORDER BY t.due_date ASC NULLS LAST, p.order ASC;
```

### Get ticket with comments
```sql
SELECT 
  t.*,
  s.name as status_name,
  p.name as priority_name,
  json_agg(DISTINCT c.*) as comments
FROM tickets t
JOIN ticket_statuses s ON t.status_id = s.id
JOIN ticket_priorities p ON t.priority_id = p.id
LEFT JOIN ticket_comments c ON t.id = c.ticket_id
WHERE t.id = :ticket_id
GROUP BY t.id, s.name, p.name;
```

### Get visitors for today
```sql
SELECT
  v.*,
  vs.name as status_name,
  u.display_name as host_name
FROM visitors v
JOIN visitor_statuses vs ON v.status_id = vs.id
LEFT JOIN users u ON v.host_id = u.id
WHERE
  -- Check if today falls within the visit date range
  (CURRENT_DATE >= DATE(v.visit_start_date) AND CURRENT_DATE <= DATE(v.visit_end_date))
  OR
  -- Include visitors actually checked in today, regardless of scheduled range
  DATE(v.checked_in_at) = CURRENT_DATE
ORDER BY COALESCE(v.checked_in_at, v.visit_start_date, v.created_at) ASC;
``` 
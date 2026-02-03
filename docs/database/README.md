# Database Documentation

This directory contains documentation for the database schema and data models used in the Unitopia Hub application.

## Table Documentation Template

Each table or data model should have its own documentation following this structure:

```markdown
# [Table Name]

## Description
Brief description of what this table represents and its purpose in the application.

## Schema

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id          | UUID      | Primary Key | Unique identifier |
| field1      | TEXT      | NOT NULL    | Description |
| field2      | INTEGER   |             | Description |
| created_at  | TIMESTAMP | NOT NULL    | Creation timestamp |
| updated_at  | TIMESTAMP | NOT NULL    | Last update timestamp |

## Indexes

| Index Name | Columns | Type | Description |
|------------|---------|------|-------------|
| idx_name   | field1  | BTREE | Description |

## Foreign Keys

| Column | References | On Delete | Description |
|--------|------------|-----------|-------------|
| field3 | other_table(id) | CASCADE | Description |

## RLS Policies (Row Level Security)

| Policy Name | Operation | Using Expression | With Check Expression | Description |
|-------------|-----------|------------------|----------------------|-------------|
| policy_name | SELECT    | (auth.uid() = user_id) | - | Users can only see their own data |

## Functions and Triggers

List of related functions and triggers.

## Sample Queries

Examples of common queries for this table.

## Relationships

- One-to-many relationship with Table X
- Many-to-many relationship with Table Y through junction table Z

## Migration History

Brief history of significant schema changes.

## Notes and Considerations

Any special considerations or notes about this table.
```

## Database Structure Overview

A high-level overview of the database structure, including major tables and their relationships.

## Core Tables

List of core tables in the application.

## Schema Organization

Description of how the schema is organized (e.g., public schema, auth schema, etc.).

## Data Migration

Information about data migration processes and tools. 
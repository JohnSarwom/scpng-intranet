-- EMERGENCY FIX FOR RLS ISSUES
-- CAUTION: This script temporarily disables RLS for troubleshooting
-- Be sure to re-enable RLS after testing is complete

-- Disable RLS on tasks table temporarily
ALTER TABLE unit_tasks DISABLE ROW LEVEL SECURITY;

-- Insert a test task directly via SQL to verify table is accessible
INSERT INTO unit_tasks (
    title, 
    description, 
    status, 
    priority, 
    assignee, 
    due_date, 
    division_id
) VALUES (
    'Emergency Test Task', 
    'This is an emergency test task created via SQL', 
    'todo', 
    'medium', 
    'jsarwom@scpng.gov.pg', 
    CURRENT_DATE + interval '7 day',
    'corporate-services-division'
);

-- Check if task was inserted
SELECT * FROM unit_tasks WHERE title = 'Emergency Test Task';

-- Add a dummy column to see if issue is with column naming
ALTER TABLE unit_tasks ADD COLUMN IF NOT EXISTS division_id_backup VARCHAR;

-- Update the unit_tasks schema to ensure proper columns exist
-- List all columns to verify structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'unit_tasks';

-- Test adding a hardcoded user to double-check division_memberships
DO $$
BEGIN
    -- Delete any existing entry to avoid conflicts
    DELETE FROM division_memberships 
    WHERE user_id = 'jsarwom@scpng.gov.pg' 
    AND division_id = 'corporate-services-division';
    
    -- Insert a fresh entry
    INSERT INTO division_memberships (user_id, division_id, role)
    VALUES ('jsarwom@scpng.gov.pg', 'corporate-services-division', 'admin');
END $$;

-- Verify division membership was added
SELECT * FROM division_memberships 
WHERE user_id = 'jsarwom@scpng.gov.pg';

-- Optional: Remove all existing policies and create a simple one
DO $$
DECLARE
    pol_name text;
BEGIN
    -- Drop all policies from unit_tasks
    FOR pol_name IN (
        SELECT policyname FROM pg_policies WHERE tablename = 'unit_tasks'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON unit_tasks', pol_name);
    END LOOP;
END $$;

-- Create a single permissive policy
CREATE POLICY allow_all_unit_tasks ON unit_tasks
    USING (true) 
    WITH CHECK (true);

-- Re-enable RLS with the new permissive policy
ALTER TABLE unit_tasks ENABLE ROW LEVEL SECURITY; 
-- Add division_id to all unit tables
-- This script adds division relationships to existing tables

-- Add division_id to Tasks table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'unit_tasks' AND column_name = 'division_id'
    ) THEN
        ALTER TABLE unit_tasks 
        ADD COLUMN division_id VARCHAR REFERENCES divisions(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add index for faster queries on division_id
CREATE INDEX IF NOT EXISTS idx_unit_tasks_division_id ON unit_tasks(division_id);

-- Add division_id to Projects table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'unit_projects' AND column_name = 'division_id'
    ) THEN
        ALTER TABLE unit_projects 
        ADD COLUMN division_id VARCHAR REFERENCES divisions(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_unit_projects_division_id ON unit_projects(division_id);

-- Add division_id to Risks table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'unit_risks' AND column_name = 'division_id'
    ) THEN
        ALTER TABLE unit_risks 
        ADD COLUMN division_id VARCHAR REFERENCES divisions(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_unit_risks_division_id ON unit_risks(division_id);

-- Add division_id to Assets table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'unit_assets' AND column_name = 'division_id'
    ) THEN
        ALTER TABLE unit_assets 
        ADD COLUMN division_id VARCHAR REFERENCES divisions(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_unit_assets_division_id ON unit_assets(division_id);

-- Add division_id to KRAs table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'unit_kras' AND column_name = 'division_id'
    ) THEN
        ALTER TABLE unit_kras 
        ADD COLUMN division_id VARCHAR REFERENCES divisions(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_unit_kras_division_id ON unit_kras(division_id);

-- Add division_id to KPIs table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'unit_kpis' AND column_name = 'division_id'
    ) THEN
        ALTER TABLE unit_kpis 
        ADD COLUMN division_id VARCHAR REFERENCES divisions(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_unit_kpis_division_id ON unit_kpis(division_id);

-- Create a function to get user's division IDs
CREATE OR REPLACE FUNCTION get_user_division_ids(p_user_email TEXT)
RETURNS TABLE(division_id VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT dm.division_id
    FROM division_memberships dm
    WHERE dm.user_id = p_user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on tables
ALTER TABLE unit_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE unit_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE unit_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE unit_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE unit_kras ENABLE ROW LEVEL SECURITY;
ALTER TABLE unit_kpis ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to avoid conflicts
DROP POLICY IF EXISTS unit_tasks_division_policy ON unit_tasks;
DROP POLICY IF EXISTS unit_projects_division_policy ON unit_projects;
DROP POLICY IF EXISTS unit_risks_division_policy ON unit_risks;
DROP POLICY IF EXISTS unit_assets_division_policy ON unit_assets;
DROP POLICY IF EXISTS unit_kras_division_policy ON unit_kras;
DROP POLICY IF EXISTS unit_kpis_division_policy ON unit_kpis;

DROP POLICY IF EXISTS admin_unit_tasks_policy ON unit_tasks;
DROP POLICY IF EXISTS admin_unit_projects_policy ON unit_projects;
DROP POLICY IF EXISTS admin_unit_risks_policy ON unit_risks;
DROP POLICY IF EXISTS admin_unit_assets_policy ON unit_assets;
DROP POLICY IF EXISTS admin_unit_kras_policy ON unit_kras;
DROP POLICY IF EXISTS admin_unit_kpis_policy ON unit_kpis;

DROP POLICY IF EXISTS personal_unit_tasks_policy ON unit_tasks;
DROP POLICY IF EXISTS personal_unit_projects_policy ON unit_projects;
DROP POLICY IF EXISTS personal_unit_risks_policy ON unit_risks;
DROP POLICY IF EXISTS personal_unit_assets_policy ON unit_assets;

DROP POLICY IF EXISTS unit_tasks_insert_policy ON unit_tasks;
DROP POLICY IF EXISTS unit_projects_insert_policy ON unit_projects;
DROP POLICY IF EXISTS unit_risks_insert_policy ON unit_risks;
DROP POLICY IF EXISTS unit_assets_insert_policy ON unit_assets;
DROP POLICY IF EXISTS unit_kras_insert_policy ON unit_kras;
DROP POLICY IF EXISTS unit_kpis_insert_policy ON unit_kpis;

DROP POLICY IF EXISTS personal_unit_tasks_insert_policy ON unit_tasks;
DROP POLICY IF EXISTS personal_unit_projects_insert_policy ON unit_projects;
DROP POLICY IF EXISTS personal_unit_risks_insert_policy ON unit_risks;
DROP POLICY IF EXISTS personal_unit_assets_insert_policy ON unit_assets;

DROP POLICY IF EXISTS admin_unit_tasks_insert_policy ON unit_tasks;
DROP POLICY IF EXISTS admin_unit_projects_insert_policy ON unit_projects;
DROP POLICY IF EXISTS admin_unit_risks_insert_policy ON unit_risks;
DROP POLICY IF EXISTS admin_unit_assets_insert_policy ON unit_assets;
DROP POLICY IF EXISTS admin_unit_kras_insert_policy ON unit_kras;
DROP POLICY IF EXISTS admin_unit_kpis_insert_policy ON unit_kpis;

DROP POLICY IF EXISTS unit_tasks_update_policy ON unit_tasks;
DROP POLICY IF EXISTS unit_projects_update_policy ON unit_projects;
DROP POLICY IF EXISTS unit_risks_update_policy ON unit_risks;
DROP POLICY IF EXISTS unit_assets_update_policy ON unit_assets;
DROP POLICY IF EXISTS unit_kras_update_policy ON unit_kras;
DROP POLICY IF EXISTS unit_kpis_update_policy ON unit_kpis;

DROP POLICY IF EXISTS personal_unit_tasks_update_policy ON unit_tasks;
DROP POLICY IF EXISTS personal_unit_projects_update_policy ON unit_projects;
DROP POLICY IF EXISTS personal_unit_risks_update_policy ON unit_risks;
DROP POLICY IF EXISTS personal_unit_assets_update_policy ON unit_assets;

DROP POLICY IF EXISTS unit_tasks_delete_policy ON unit_tasks;
DROP POLICY IF EXISTS unit_projects_delete_policy ON unit_projects;
DROP POLICY IF EXISTS unit_risks_delete_policy ON unit_risks;
DROP POLICY IF EXISTS unit_assets_delete_policy ON unit_assets;
DROP POLICY IF EXISTS unit_kras_delete_policy ON unit_kras;
DROP POLICY IF EXISTS unit_kpis_delete_policy ON unit_kpis;

DROP POLICY IF EXISTS personal_unit_tasks_delete_policy ON unit_tasks;
DROP POLICY IF EXISTS personal_unit_projects_delete_policy ON unit_projects;
DROP POLICY IF EXISTS personal_unit_risks_delete_policy ON unit_risks;
DROP POLICY IF EXISTS personal_unit_assets_delete_policy ON unit_assets;

-- Create RLS policies based on user's division access

-- Tasks
CREATE POLICY unit_tasks_division_policy ON unit_tasks
    USING (
        division_id IN (SELECT get_user_division_ids(auth.jwt() ->> 'email'))
    );

-- Projects
CREATE POLICY unit_projects_division_policy ON unit_projects
    USING (
        division_id IN (SELECT get_user_division_ids(auth.jwt() ->> 'email'))
    );

-- Risks
CREATE POLICY unit_risks_division_policy ON unit_risks
    USING (
        division_id IN (SELECT get_user_division_ids(auth.jwt() ->> 'email'))
    );

-- Assets
CREATE POLICY unit_assets_division_policy ON unit_assets
    USING (
        division_id IN (SELECT get_user_division_ids(auth.jwt() ->> 'email'))
    );

-- KRAs
CREATE POLICY unit_kras_division_policy ON unit_kras
    USING (
        division_id IN (SELECT get_user_division_ids(auth.jwt() ->> 'email'))
    );

-- KPIs
CREATE POLICY unit_kpis_division_policy ON unit_kpis
    USING (
        division_id IN (SELECT get_user_division_ids(auth.jwt() ->> 'email'))
    );

-- Add admin bypass policy for each table
-- This allows database administrators to access all data regardless of division

-- For tasks
CREATE POLICY admin_unit_tasks_policy ON unit_tasks
    USING (
        auth.jwt() ->> 'role' = 'admin'
    );

-- For projects
CREATE POLICY admin_unit_projects_policy ON unit_projects
    USING (
        auth.jwt() ->> 'role' = 'admin'
    );

-- For risks
CREATE POLICY admin_unit_risks_policy ON unit_risks
    USING (
        auth.jwt() ->> 'role' = 'admin'
    );

-- For assets
CREATE POLICY admin_unit_assets_policy ON unit_assets
    USING (
        auth.jwt() ->> 'role' = 'admin'
    );

-- For KRAs
CREATE POLICY admin_unit_kras_policy ON unit_kras
    USING (
        auth.jwt() ->> 'role' = 'admin'
    );

-- For KPIs
CREATE POLICY admin_unit_kpis_policy ON unit_kpis
    USING (
        auth.jwt() ->> 'role' = 'admin'
    );

-- Add fallback policies for personal data access
-- These policies allow users to access their own data even if not assigned to any division

-- For tasks (by assignee)
CREATE POLICY personal_unit_tasks_policy ON unit_tasks
    USING (
        assignee = auth.jwt() ->> 'email'
    );

-- For projects (by manager)
CREATE POLICY personal_unit_projects_policy ON unit_projects
    USING (
        manager = auth.jwt() ->> 'email'
    );

-- For risks (by owner)
CREATE POLICY personal_unit_risks_policy ON unit_risks
    USING (
        owner = auth.jwt() ->> 'email'
    );

-- For assets (by assignedTo)
CREATE POLICY personal_unit_assets_policy ON unit_assets
    USING (
        assigned_to = auth.jwt() ->> 'email'
    );

-- Insert test division membership if it doesn't exist yet
DO $$
DECLARE
    membership_count INTEGER;
BEGIN
    -- Check if membership already exists
    SELECT COUNT(*) INTO membership_count
    FROM division_memberships
    WHERE user_id = 'jsarwom@scpng.gov.pg' 
      AND division_id = 'corporate-services-division';
      
    -- Only insert if it doesn't exist
    IF membership_count = 0 THEN
        INSERT INTO division_memberships (user_id, division_id, role)
        VALUES ('jsarwom@scpng.gov.pg', 'corporate-services-division', 'manager');
        RAISE NOTICE 'Division membership created for jsarwom@scpng.gov.pg in corporate-services-division with role manager';
    ELSE
        RAISE NOTICE 'Division membership already exists for jsarwom@scpng.gov.pg in corporate-services-division';
    END IF;
END $$;

-- Insert a test task for troubleshooting if there isn't data for the user yet
DO $$
DECLARE
    user_division VARCHAR;
    task_count INTEGER;
BEGIN
    -- Check if there's already a task for the user
    SELECT COUNT(*) INTO task_count FROM unit_tasks 
    WHERE assignee = 'jsarwom@scpng.gov.pg';
    
    -- Only insert if no tasks found
    IF task_count = 0 THEN
        -- Get a division for the user if it exists
        SELECT division_id INTO user_division
        FROM division_memberships 
        WHERE user_id = 'jsarwom@scpng.gov.pg' 
        LIMIT 1;
        
        -- Only insert if user has at least one division
        IF user_division IS NOT NULL THEN
            INSERT INTO unit_tasks (
                title, 
                description, 
                status, 
                priority, 
                assignee, 
                due_date, 
                division_id
            ) VALUES (
                'Test Task', 
                'This is a test task', 
                'todo', 
                'medium', 
                'jsarwom@scpng.gov.pg', 
                CURRENT_DATE + interval '7 day',
                user_division
            );
            RAISE NOTICE 'Test task inserted for user jsarwom@scpng.gov.pg in division %', user_division;
        ELSE
            RAISE NOTICE 'No division found for user jsarwom@scpng.gov.pg, test task not inserted';
        END IF;
    ELSE
        RAISE NOTICE 'Tasks already exist for jsarwom@scpng.gov.pg, no test task inserted';
    END IF;
END $$;

-- Temporary RLS disabling/enabling section replaced with a safer query
-- Instead of disabling RLS, we'll add a simple diagnostic query to check for tasks
DO $$
DECLARE
    total_tasks INTEGER;
    user_tasks INTEGER;
BEGIN
    -- Count total tasks
    SELECT COUNT(*) INTO total_tasks FROM unit_tasks;
    
    -- Count user tasks
    SELECT COUNT(*) INTO user_tasks FROM unit_tasks WHERE assignee = 'jsarwom@scpng.gov.pg';
    
    RAISE NOTICE 'Task counts - Total: %, For jsarwom@scpng.gov.pg: %', total_tasks, user_tasks;
END $$;

-- Diagnostic queries to help troubleshooting
DO $$
DECLARE
    division_count INTEGER;
    disabled_rls_count INTEGER;
    r RECORD;
BEGIN
    RAISE NOTICE '--- DIAGNOSTIC INFORMATION ---';
    
    -- Check if the user has any division memberships
    RAISE NOTICE 'Checking division memberships for jsarwom@scpng.gov.pg:';
    SELECT COUNT(*) INTO division_count 
    FROM division_memberships 
    WHERE user_id = 'jsarwom@scpng.gov.pg';
    
    IF division_count = 0 THEN
        RAISE NOTICE 'WARNING: User jsarwom@scpng.gov.pg has no division memberships!';
    ELSE
        RAISE NOTICE 'Division memberships found for the user: %', division_count;
    END IF;
    
    -- Check if RLS is enabled on all tables
    RAISE NOTICE 'Checking RLS status:';
    SELECT COUNT(*) INTO disabled_rls_count
    FROM pg_tables 
    WHERE tablename IN ('unit_tasks', 'unit_projects', 'unit_risks', 'unit_assets', 'unit_kras', 'unit_kpis')
      AND NOT rowsecurity;
    
    IF disabled_rls_count = 0 THEN
        RAISE NOTICE 'RLS is properly enabled on all unit tables.';
    ELSE
        RAISE NOTICE 'WARNING: RLS is disabled on % tables!', disabled_rls_count;
    END IF;
    
    -- Check policies
    RAISE NOTICE 'Checking policies:';
    RAISE NOTICE 'Table | Policy Count';
    RAISE NOTICE '------------------------';
    FOR r IN 
        SELECT tablename, COUNT(policyname) as policy_count
        FROM pg_policies
        WHERE tablename IN ('unit_tasks', 'unit_projects', 'unit_risks', 'unit_assets', 'unit_kras', 'unit_kpis')
        GROUP BY tablename
    LOOP
        RAISE NOTICE '% | %', r.tablename, r.policy_count;
    END LOOP;
    
    RAISE NOTICE '--- END DIAGNOSTIC INFORMATION ---';
END $$;

-- Now let's check if tables exist and create them if they don't
DO $$
BEGIN
    -- Check if unit_tasks table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'unit_tasks') THEN
        CREATE TABLE unit_tasks (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            status VARCHAR(50) DEFAULT 'todo',
            priority VARCHAR(50) DEFAULT 'medium',
            assignee VARCHAR(255),
            due_date DATE,
            creation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            division_id VARCHAR REFERENCES divisions(id) ON DELETE CASCADE
        );
        RAISE NOTICE 'Created unit_tasks table';
    END IF;
    
    -- Check if unit_projects table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'unit_projects') THEN
        CREATE TABLE unit_projects (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            status VARCHAR(50) DEFAULT 'planned',
            manager VARCHAR(255),
            start_date DATE,
            end_date DATE,
            budget NUMERIC(15,2) DEFAULT 0,
            budget_spent NUMERIC(15,2) DEFAULT 0,
            progress INTEGER DEFAULT 0,
            creation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            division_id VARCHAR REFERENCES divisions(id) ON DELETE CASCADE
        );
        RAISE NOTICE 'Created unit_projects table';
    END IF;
    
    -- Check if unit_risks table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'unit_risks') THEN
        CREATE TABLE unit_risks (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            impact VARCHAR(50) DEFAULT 'medium',
            likelihood VARCHAR(50) DEFAULT 'medium',
            status VARCHAR(50) DEFAULT 'identified',
            category VARCHAR(100),
            owner VARCHAR(255),
            project_id INTEGER,
            project_name VARCHAR(255),
            creation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            division_id VARCHAR REFERENCES divisions(id) ON DELETE CASCADE
        );
        RAISE NOTICE 'Created unit_risks table';
    END IF;
    
    -- Check if unit_assets table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'unit_assets') THEN
        CREATE TABLE unit_assets (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            type VARCHAR(50),
            serial_number VARCHAR(100),
            assigned_to VARCHAR(255),
            department VARCHAR(255),
            purchase_date DATE,
            warranty_expiry DATE,
            status VARCHAR(50) DEFAULT 'active',
            notes TEXT,
            creation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            division_id VARCHAR REFERENCES divisions(id) ON DELETE CASCADE
        );
        RAISE NOTICE 'Created unit_assets table';
    END IF;
END $$;

-- Create INSERT policies to allow users to add data to their divisions
CREATE POLICY unit_tasks_insert_policy ON unit_tasks
    FOR INSERT 
    WITH CHECK (
        division_id IN (SELECT get_user_division_ids(auth.jwt() ->> 'email'))
    );

CREATE POLICY unit_projects_insert_policy ON unit_projects
    FOR INSERT 
    WITH CHECK (
        division_id IN (SELECT get_user_division_ids(auth.jwt() ->> 'email'))
    );

CREATE POLICY unit_risks_insert_policy ON unit_risks
    FOR INSERT 
    WITH CHECK (
        division_id IN (SELECT get_user_division_ids(auth.jwt() ->> 'email'))
    );

CREATE POLICY unit_assets_insert_policy ON unit_assets
    FOR INSERT 
    WITH CHECK (
        division_id IN (SELECT get_user_division_ids(auth.jwt() ->> 'email'))
    );

CREATE POLICY unit_kras_insert_policy ON unit_kras
    FOR INSERT 
    WITH CHECK (
        division_id IN (SELECT get_user_division_ids(auth.jwt() ->> 'email'))
    );

CREATE POLICY unit_kpis_insert_policy ON unit_kpis
    FOR INSERT 
    WITH CHECK (
        division_id IN (SELECT get_user_division_ids(auth.jwt() ->> 'email'))
    );

-- Add INSERT policies for personal data
CREATE POLICY personal_unit_tasks_insert_policy ON unit_tasks
    FOR INSERT 
    WITH CHECK (
        assignee = auth.jwt() ->> 'email'
    );

CREATE POLICY personal_unit_projects_insert_policy ON unit_projects
    FOR INSERT 
    WITH CHECK (
        manager = auth.jwt() ->> 'email'
    );

CREATE POLICY personal_unit_risks_insert_policy ON unit_risks
    FOR INSERT 
    WITH CHECK (
        owner = auth.jwt() ->> 'email'
    );

CREATE POLICY personal_unit_assets_insert_policy ON unit_assets
    FOR INSERT 
    WITH CHECK (
        assigned_to = auth.jwt() ->> 'email'
    );

-- Create admin insert policies
CREATE POLICY admin_unit_tasks_insert_policy ON unit_tasks
    FOR INSERT 
    WITH CHECK (
        auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY admin_unit_projects_insert_policy ON unit_projects
    FOR INSERT 
    WITH CHECK (
        auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY admin_unit_risks_insert_policy ON unit_risks
    FOR INSERT 
    WITH CHECK (
        auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY admin_unit_assets_insert_policy ON unit_assets
    FOR INSERT 
    WITH CHECK (
        auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY admin_unit_kras_insert_policy ON unit_kras
    FOR INSERT 
    WITH CHECK (
        auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY admin_unit_kpis_insert_policy ON unit_kpis
    FOR INSERT 
    WITH CHECK (
        auth.jwt() ->> 'role' = 'admin'
    );

-- Create UPDATE policies
CREATE POLICY unit_tasks_update_policy ON unit_tasks
    FOR UPDATE 
    USING (
        division_id IN (SELECT get_user_division_ids(auth.jwt() ->> 'email'))
    );

-- Create DELETE policies
CREATE POLICY unit_tasks_delete_policy ON unit_tasks
    FOR DELETE 
    USING (
        division_id IN (SELECT get_user_division_ids(auth.jwt() ->> 'email'))
    );

-- Add personal update/delete policies for tasks
CREATE POLICY personal_unit_tasks_update_policy ON unit_tasks
    FOR UPDATE 
    USING (
        assignee = auth.jwt() ->> 'email'
    );

CREATE POLICY personal_unit_tasks_delete_policy ON unit_tasks
    FOR DELETE 
    USING (
        assignee = auth.jwt() ->> 'email'
    );

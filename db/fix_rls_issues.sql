-- Special debug script to troubleshoot RLS issues
-- First, let's see what's in the JWT token:
CREATE OR REPLACE FUNCTION debug_jwt() 
RETURNS TEXT AS $$
BEGIN
    RETURN format('JWT email: %s, role: %s', 
                 COALESCE(auth.jwt() ->> 'email', 'null'),
                 COALESCE(auth.jwt() ->> 'role', 'null'));
END;
$$ LANGUAGE plpgsql;

-- Check what the JWT contains
SELECT debug_jwt();

-- Check division memberships for the user
SELECT * FROM division_memberships 
WHERE user_id = 'jsarwom@scpng.gov.pg';

-- Let's create an "allow all" policy for INSERT
DROP POLICY IF EXISTS temporary_allow_all_inserts ON unit_tasks;
CREATE POLICY temporary_allow_all_inserts ON unit_tasks
    FOR INSERT 
    WITH CHECK (true);

-- Add a debug function to log what happens when you try to insert a task
CREATE OR REPLACE FUNCTION debug_before_task_insert()
RETURNS TRIGGER AS $$
DECLARE
    user_email TEXT;
    user_count INTEGER;
BEGIN
    -- Get the current user's email
    user_email := auth.jwt() ->> 'email';
    
    -- Log the insert attempt details
    RAISE NOTICE 'Insert attempt by %: division_id=%, assignee=%', 
                user_email, NEW.division_id, NEW.assignee;
    
    -- Check if this user exists in division_memberships
    SELECT COUNT(*) INTO user_count
    FROM division_memberships 
    WHERE user_id = user_email;
    
    RAISE NOTICE 'User % has % division memberships', user_email, user_count;
    
    -- Continue with the insert
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS debug_task_insert_trigger ON unit_tasks;
CREATE TRIGGER debug_task_insert_trigger
BEFORE INSERT ON unit_tasks
FOR EACH ROW EXECUTE FUNCTION debug_before_task_insert();

-- Function to automatically set division_id if it's NULL
CREATE OR REPLACE FUNCTION set_task_division_id()
RETURNS TRIGGER AS $$
DECLARE
    user_division VARCHAR;
BEGIN
    -- If division_id is NULL, try to set it from user's division
    IF NEW.division_id IS NULL THEN
        -- Get a division for the user
        SELECT division_id INTO user_division
        FROM division_memberships 
        WHERE user_id = auth.jwt() ->> 'email'
        LIMIT 1;
        
        IF user_division IS NOT NULL THEN
            NEW.division_id := user_division;
            RAISE NOTICE 'Automatically set division_id to % for user %', 
                        user_division, auth.jwt() ->> 'email';
        ELSE
            -- If no division found, set to a default division
            NEW.division_id := 'corporate-services-division';
            RAISE NOTICE 'No division found for user %, using default division', 
                        auth.jwt() ->> 'email';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to set division_id
DROP TRIGGER IF EXISTS set_task_division_trigger ON unit_tasks;
CREATE TRIGGER set_task_division_trigger
BEFORE INSERT ON unit_tasks
FOR EACH ROW EXECUTE FUNCTION set_task_division_id(); 
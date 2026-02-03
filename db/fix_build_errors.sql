-- Comprehensive fix for database-related build errors

-- 1. First check if we need to add the color column to the divisions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'divisions' AND column_name = 'color'
  ) THEN
    ALTER TABLE divisions ADD COLUMN color VARCHAR(50);
    
    -- Set default colors for divisions
    UPDATE divisions SET color = '#4F46E5' WHERE id = 'executive-division';
    UPDATE divisions SET color = '#10B981' WHERE id = 'corporate-services-division';
    UPDATE divisions SET color = '#F59E0B' WHERE id = 'licensing-market-supervision-division';
    UPDATE divisions SET color = '#EF4444' WHERE id = 'legal-services-division';
    UPDATE divisions SET color = '#8B5CF6' WHERE id = 'research-publication-division';
    UPDATE divisions SET color = '#EC4899' WHERE id = 'secretariat-unit';
  END IF;
END
$$;

-- 2. Fix the get_user_divisions function to include the color field
DROP FUNCTION IF EXISTS get_user_divisions(TEXT);

CREATE OR REPLACE FUNCTION get_user_divisions(user_email TEXT)
RETURNS TABLE (
  id TEXT, 
  name TEXT, 
  description TEXT,
  color TEXT,
  role TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id, 
    d.name, 
    d.description,
    d.color,
    dm.role
  FROM 
    staff_members sm
  JOIN 
    division_memberships dm ON sm.id = dm.staff_id
  JOIN 
    divisions d ON dm.division_id = d.id
  WHERE 
    sm.email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Make sure all database tables have row-level security enabled
ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE division_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE unit_tasks ENABLE ROW LEVEL SECURITY; 

-- 4. Create RLS policies for read access to all authenticated users
DO $$
BEGIN
  -- Check and create policy for divisions
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'divisions' AND policyname = 'divisions_read_policy') THEN
    CREATE POLICY divisions_read_policy 
      ON divisions FOR SELECT TO authenticated 
      USING (true);
  END IF;
  
  -- Check and create policy for staff_members
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'staff_members' AND policyname = 'staff_members_read_policy') THEN
    CREATE POLICY staff_members_read_policy 
      ON staff_members FOR SELECT TO authenticated 
      USING (true);
  END IF;
  
  -- Check and create policy for division_memberships
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'division_memberships' AND policyname = 'division_memberships_read_policy') THEN
    CREATE POLICY division_memberships_read_policy 
      ON division_memberships FOR SELECT TO authenticated 
      USING (true);
  END IF;
  
  -- Check and create policy for unit_tasks
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'unit_tasks' AND policyname = 'unit_tasks_read_policy') THEN
    CREATE POLICY unit_tasks_read_policy 
      ON unit_tasks FOR SELECT TO authenticated 
      USING (true);
  END IF;
END
$$;

-- 5. Create updated_at column trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Add timestamp triggers to tables if missing
DO $$
BEGIN
  -- Check and create trigger for divisions
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_divisions_updated_at') THEN
    CREATE TRIGGER set_divisions_updated_at
      BEFORE UPDATE ON divisions
      FOR EACH ROW
      EXECUTE FUNCTION update_modified_column();
  END IF;
  
  -- Check and create trigger for staff_members
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_staff_members_updated_at') THEN
    CREATE TRIGGER set_staff_members_updated_at
      BEFORE UPDATE ON staff_members
      FOR EACH ROW
      EXECUTE FUNCTION update_modified_column();
  END IF;
  
  -- Check and create trigger for unit_tasks
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_unit_tasks_updated_at') THEN
    CREATE TRIGGER set_unit_tasks_updated_at
      BEFORE UPDATE ON unit_tasks
      FOR EACH ROW
      EXECUTE FUNCTION update_modified_column();
  END IF;
END
$$;

-- Log the changes
INSERT INTO schema_migrations (version, applied_at) 
VALUES ('20250413_fix_build_errors', CURRENT_TIMESTAMP); 
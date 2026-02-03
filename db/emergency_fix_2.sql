-- Apply additional fixes to database schema to resolve build errors

-- 1. Fix query failing due to missing color column
DROP FUNCTION IF EXISTS public.get_user_divisions(user_email TEXT);

CREATE OR REPLACE FUNCTION public.get_user_divisions(user_email TEXT)
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

-- 2. Add proper RLS policies to staff_members table to allow reads
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;

-- Allow everyone with a valid token to read staff members
CREATE POLICY staff_members_read_policy
  ON staff_members
  FOR SELECT
  TO authenticated
  USING (true);
  
-- 3. Add update timestamp trigger to divisions if missing
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add the trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_divisions_updated_at'
  ) THEN
    CREATE TRIGGER set_divisions_updated_at
    BEFORE UPDATE ON divisions
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
  END IF;
END $$; 
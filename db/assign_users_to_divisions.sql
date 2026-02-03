-- Assign users to divisions with appropriate roles
-- This script is useful after importing staff data to set up role-based access control

-- First clear existing memberships to avoid duplicates
DELETE FROM division_memberships;

-- Assign Directors (based on job titles)
INSERT INTO division_memberships (user_id, division_id, role)
SELECT 
  email as user_id,
  division_id,
  'director' as role
FROM staff_members
WHERE 
  job_title LIKE '%Director%' 
  OR job_title LIKE '%Chairman%'
  OR job_title LIKE '%Chief%';

-- Assign Managers
INSERT INTO division_memberships (user_id, division_id, role)
SELECT 
  email as user_id,
  division_id,
  'manager' as role
FROM staff_members
WHERE 
  job_title LIKE '%Manager%' 
  OR job_title LIKE '%Head%';

-- Assign Senior Officers as managers too (they often have management responsibilities)
INSERT INTO division_memberships (user_id, division_id, role)
SELECT 
  email as user_id,
  division_id,
  'manager' as role
FROM staff_members
WHERE 
  job_title LIKE '%Senior%'
  AND email NOT IN (SELECT user_id FROM division_memberships);

-- Assign Officers
INSERT INTO division_memberships (user_id, division_id, role)
SELECT 
  email as user_id,
  division_id,
  'officer' as role
FROM staff_members
WHERE 
  job_title LIKE '%Officer%'
  AND email NOT IN (SELECT user_id FROM division_memberships);

-- Assign everyone else as staff
INSERT INTO division_memberships (user_id, division_id, role)
SELECT 
  email as user_id,
  division_id,
  'staff' as role
FROM staff_members
WHERE email NOT IN (SELECT user_id FROM division_memberships);

-- Make admin users members of all divisions with director role (for testing)
WITH admin_divisions AS (
  SELECT 
    'admin@app.com' as email,
    id as division_id
  FROM divisions
)
INSERT INTO division_memberships (user_id, division_id, role)
SELECT
  email,
  division_id,
  'director' as role
FROM admin_divisions
WHERE NOT EXISTS (
  SELECT 1 FROM division_memberships 
  WHERE user_id = admin_divisions.email AND division_id = admin_divisions.division_id
);

-- Count memberships by division and role (for verification)
SELECT 
  d.name as division_name,
  dm.role,
  COUNT(*) as member_count
FROM division_memberships dm
JOIN divisions d ON dm.division_id = d.id
GROUP BY d.name, dm.role
ORDER BY d.name, dm.role; 
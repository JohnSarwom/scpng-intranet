-- Temporarily disable Row Level Security to test data access
-- This will allow all users to read/write gallery data

-- Disable RLS on gallery tables
ALTER TABLE gallery_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos DISABLE ROW LEVEL SECURITY;

-- Verify the change
SELECT schemaname, tablename, rowsecurity, enablerls 
FROM pg_tables 
LEFT JOIN pg_class ON pg_class.relname = pg_tables.tablename
LEFT JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
WHERE schemaname = 'public' 
AND tablename IN ('gallery_events', 'gallery_photos'); 
-- Re-enable Row Level Security with correct policies for custom auth system

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read gallery events" ON gallery_events;
DROP POLICY IF EXISTS "Allow authenticated users to read gallery photos" ON gallery_photos;
DROP POLICY IF EXISTS "Allow authenticated users to create gallery events" ON gallery_events;
DROP POLICY IF EXISTS "Allow authenticated users to upload gallery photos" ON gallery_photos;
DROP POLICY IF EXISTS "Allow users to update their own gallery events" ON gallery_events;
DROP POLICY IF EXISTS "Allow users to update their own gallery photos" ON gallery_photos;

-- Enable RLS
ALTER TABLE gallery_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;

-- Create new policies that allow all access (since this is internal company data)
-- You can make these more restrictive later based on your needs

-- Allow all users to read gallery events
CREATE POLICY "Allow all users to read gallery events" ON gallery_events
    FOR SELECT USING (true);

-- Allow all users to read gallery photos  
CREATE POLICY "Allow all users to read gallery photos" ON gallery_photos
    FOR SELECT USING (true);

-- Allow all users to create gallery events
CREATE POLICY "Allow all users to create gallery events" ON gallery_events
    FOR INSERT WITH CHECK (true);

-- Allow all users to upload gallery photos
CREATE POLICY "Allow all users to upload gallery photos" ON gallery_photos
    FOR INSERT WITH CHECK (true);

-- Allow all users to update gallery events
CREATE POLICY "Allow all users to update gallery events" ON gallery_events
    FOR UPDATE USING (true);

-- Allow all users to update gallery photos
CREATE POLICY "Allow all users to update gallery photos" ON gallery_photos
    FOR UPDATE USING (true);

-- Allow all users to delete (for soft deletes)
CREATE POLICY "Allow all users to delete gallery events" ON gallery_events
    FOR UPDATE USING (true);

CREATE POLICY "Allow all users to delete gallery photos" ON gallery_photos
    FOR UPDATE USING (true);

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('gallery_events', 'gallery_photos')
ORDER BY tablename, policyname; 
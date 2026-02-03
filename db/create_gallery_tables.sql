-- Create gallery events table
CREATE TABLE IF NOT EXISTS gallery_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    year INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM date)) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true
);

-- Create gallery photos table
CREATE TABLE IF NOT EXISTS gallery_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES gallery_events(id) ON DELETE CASCADE,
    caption VARCHAR(500),
    image_url TEXT NOT NULL,
    sharepoint_url TEXT,
    file_name VARCHAR(255),
    file_size BIGINT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploaded_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gallery_events_year ON gallery_events(year);
CREATE INDEX IF NOT EXISTS idx_gallery_events_date ON gallery_events(date);
CREATE INDEX IF NOT EXISTS idx_gallery_photos_event_id ON gallery_photos(event_id);
CREATE INDEX IF NOT EXISTS idx_gallery_photos_display_order ON gallery_photos(display_order);

-- Enable Row Level Security
ALTER TABLE gallery_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (adjust based on your authentication setup)
-- Allow all authenticated users to read gallery data
CREATE POLICY "Allow authenticated users to read gallery events" ON gallery_events
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read gallery photos" ON gallery_photos
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert gallery data
CREATE POLICY "Allow authenticated users to create gallery events" ON gallery_events
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to upload gallery photos" ON gallery_photos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own uploads (optional)
CREATE POLICY "Allow users to update their own gallery events" ON gallery_events
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Allow users to update their own gallery photos" ON gallery_photos
    FOR UPDATE USING (uploaded_by = auth.uid());

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_gallery_events_updated_at BEFORE UPDATE ON gallery_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_photos_updated_at BEFORE UPDATE ON gallery_photos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample events to maintain existing data structure
INSERT INTO gallery_events (id, title, date, description) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'Annual Stakeholder Meeting', '2024-03-15', 'Annual meeting with key stakeholders at MRDC House'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Staff Training Workshop', '2024-02-05', 'Professional development training for department heads'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Annual Stakeholder Meeting', '2023-03-10', 'Previous year''s annual meeting with stakeholders'),
    ('550e8400-e29b-41d4-a716-446655440004', 'Community Outreach Program', '2023-08-22', 'Community engagement initiatives in local areas')
ON CONFLICT (id) DO NOTHING;

-- Insert sample photos for the events
INSERT INTO gallery_photos (event_id, caption, image_url, display_order) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'Opening address by CEO', 'https://picsum.photos/id/237/800/600', 1),
    ('550e8400-e29b-41d4-a716-446655440001', 'Panel discussion', 'https://picsum.photos/id/238/800/600', 2),
    ('550e8400-e29b-41d4-a716-446655440001', 'Q&A session', 'https://picsum.photos/id/239/800/600', 3),
    ('550e8400-e29b-41d4-a716-446655440001', 'Networking session', 'https://picsum.photos/id/240/800/600', 4),
    ('550e8400-e29b-41d4-a716-446655440002', 'Workshop introduction', 'https://picsum.photos/id/241/800/600', 1),
    ('550e8400-e29b-41d4-a716-446655440002', 'Group activities', 'https://picsum.photos/id/242/800/600', 2),
    ('550e8400-e29b-41d4-a716-446655440002', 'Presentation session', 'https://picsum.photos/id/243/800/600', 3),
    ('550e8400-e29b-41d4-a716-446655440003', '2023 CEO presentation', 'https://picsum.photos/id/244/800/600', 1),
    ('550e8400-e29b-41d4-a716-446655440003', 'Financial review', 'https://picsum.photos/id/245/800/600', 2),
    ('550e8400-e29b-41d4-a716-446655440003', 'Strategic planning session', 'https://picsum.photos/id/246/800/600', 3),
    ('550e8400-e29b-41d4-a716-446655440004', 'Opening ceremony', 'https://picsum.photos/id/247/800/600', 1),
    ('550e8400-e29b-41d4-a716-446655440004', 'Community activities', 'https://picsum.photos/id/248/800/600', 2),
    ('550e8400-e29b-41d4-a716-446655440004', 'Donation handover', 'https://picsum.photos/id/249/800/600', 3),
    ('550e8400-e29b-41d4-a716-446655440004', 'Group photo', 'https://picsum.photos/id/250/800/600', 4),
    ('550e8400-e29b-41d4-a716-446655440004', 'Closing remarks', 'https://picsum.photos/id/251/800/600', 5)
ON CONFLICT DO NOTHING; 
-- Add missing color column to divisions table
ALTER TABLE divisions ADD COLUMN IF NOT EXISTS color VARCHAR(50);

-- Set default colors for existing divisions
UPDATE divisions SET color = '#4F46E5' WHERE id = 'executive-division';
UPDATE divisions SET color = '#10B981' WHERE id = 'corporate-services-division';
UPDATE divisions SET color = '#F59E0B' WHERE id = 'licensing-market-supervision-division';
UPDATE divisions SET color = '#EF4444' WHERE id = 'legal-services-division';
UPDATE divisions SET color = '#8B5CF6' WHERE id = 'research-publication-division';
UPDATE divisions SET color = '#EC4899' WHERE id = 'secretariat-unit';

-- Log the change
INSERT INTO schema_migrations (version, applied_at) 
VALUES ('20250412_add_color_to_divisions', CURRENT_TIMESTAMP); 
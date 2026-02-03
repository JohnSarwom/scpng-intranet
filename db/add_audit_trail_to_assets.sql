-- Add audit trail fields to assets table
-- This script adds comprehensive tracking for create/update/delete operations

-- Add the new audit columns
ALTER TABLE public.assets 
ADD COLUMN IF NOT EXISTS created_by TEXT,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_by TEXT,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;

-- Ensure created_at has proper default value (in case it wasn't set originally)
ALTER TABLE public.assets 
ALTER COLUMN created_at SET DEFAULT now();

-- Update any existing records with null created_at to use current timestamp
UPDATE public.assets 
SET created_at = COALESCE(created_at, now()) 
WHERE created_at IS NULL;

-- Update existing records to set created_by if last_updated_by exists
UPDATE public.assets 
SET created_by = last_updated_by 
WHERE created_by IS NULL AND last_updated_by IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.assets.created_by IS 'Email/identifier of user who created/uploaded the asset';
COMMENT ON COLUMN public.assets.last_updated_by IS 'Email/identifier of user who last updated the asset';
COMMENT ON COLUMN public.assets.deleted_at IS 'Timestamp when asset was deleted (soft delete)';
COMMENT ON COLUMN public.assets.deleted_by IS 'Email/identifier of user who deleted the asset';
COMMENT ON COLUMN public.assets.is_deleted IS 'Flag indicating if asset is soft deleted';

-- Create index for performance on common queries
CREATE INDEX IF NOT EXISTS idx_assets_is_deleted ON public.assets(is_deleted);
CREATE INDEX IF NOT EXISTS idx_assets_created_by ON public.assets(created_by);
CREATE INDEX IF NOT EXISTS idx_assets_deleted_at ON public.assets(deleted_at) WHERE deleted_at IS NOT NULL;

-- Create a view for active (non-deleted) assets
CREATE OR REPLACE VIEW public.active_assets AS
SELECT *
FROM public.assets
WHERE is_deleted = FALSE;

-- Create a view for audit trail reporting
CREATE OR REPLACE VIEW public.asset_audit_trail AS
SELECT 
    id,
    name,
    type,
    created_at,
    created_by,
    last_updated,
    last_updated_by,
    deleted_at,
    deleted_by,
    is_deleted,
    CASE 
        WHEN deleted_at IS NOT NULL THEN 'DELETED'
        WHEN last_updated > created_at + INTERVAL '1 minute' THEN 'UPDATED'
        ELSE 'CREATED'
    END as last_action,
    COALESCE(deleted_at, last_updated, created_at) as last_action_date,
    COALESCE(deleted_by, last_updated_by, created_by) as last_action_by
FROM public.assets
ORDER BY COALESCE(deleted_at, last_updated, created_at) DESC;

-- Grant appropriate permissions
GRANT SELECT ON public.active_assets TO authenticated;
GRANT SELECT ON public.asset_audit_trail TO authenticated;

-- Add RLS policies for the new view (if RLS is enabled)
-- ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Example RLS policy for active assets (uncomment if needed)
-- CREATE POLICY "Users can view active assets" ON public.assets
-- FOR SELECT TO authenticated
-- USING (is_deleted = FALSE);

-- Create trigger to automatically update last_updated timestamp
CREATE OR REPLACE FUNCTION update_assets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_assets_updated_at_trigger ON public.assets;
CREATE TRIGGER update_assets_updated_at_trigger
    BEFORE UPDATE ON public.assets
    FOR EACH ROW
    EXECUTE FUNCTION update_assets_updated_at();

-- Log completion
SELECT 'Audit trail fields added to assets table successfully' AS status;

/*
SUMMARY OF CHANGES:
==================
1. Added created_by field to track who uploaded/created each asset
2. Added deleted_at timestamp for soft delete functionality  
3. Added deleted_by field to track who deleted the asset
4. Added is_deleted boolean flag for efficient querying
5. Created indexes for performance
6. Created views for active assets and audit trail reporting
7. Added trigger to auto-update timestamps
8. Added proper comments for documentation

USAGE:
======
- Use 'active_assets' view for normal asset queries (excludes deleted)
- Use 'asset_audit_trail' view for audit reporting
- Set is_deleted=TRUE and populate deleted_at/deleted_by for soft deletes
- Always populate created_by during INSERT and last_updated_by during UPDATE
*/ 
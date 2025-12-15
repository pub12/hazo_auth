-- file_description: migration to add multi-tenancy organization support indexes
-- Adds indexes for hazo_org and hazo_users org-related columns for performance
-- Note: The hazo_org table and hazo_users.org_id/root_org_id columns should already exist
-- If creating a new database, ensure created_by in hazo_org references hazo_users.id, not hazo_org.id

-- Add indexes for hazo_org table for faster hierarchy lookups
CREATE INDEX IF NOT EXISTS idx_hazo_org_parent_org_id ON hazo_org(parent_org_id);
CREATE INDEX IF NOT EXISTS idx_hazo_org_root_org_id ON hazo_org(root_org_id);
CREATE INDEX IF NOT EXISTS idx_hazo_org_active ON hazo_org(active);
CREATE INDEX IF NOT EXISTS idx_hazo_org_name ON hazo_org(name);

-- Add indexes for hazo_users org fields for faster user-to-org lookups
CREATE INDEX IF NOT EXISTS idx_hazo_users_org_id ON hazo_users(org_id);
CREATE INDEX IF NOT EXISTS idx_hazo_users_root_org_id ON hazo_users(root_org_id);

-- file_description: migration to consolidate multi-tenancy to unified scopes with invitations
-- This migration:
-- 1. Drops legacy 7-level scope tables (if they exist)
-- 2. Drops hazo_org table (if exists)
-- 3. Removes org columns from hazo_users (if they exist)
-- 4. Creates super admin and default system scopes
-- 5. Creates hazo_invitations table for user invitation flow
-- 6. Creates firm_admin role for firm creators

-- ===========================================
-- PostgreSQL Version
-- ===========================================

-- 1. Drop legacy 7-level scope tables if they exist
DROP TABLE IF EXISTS hazo_scopes_l7 CASCADE;
DROP TABLE IF EXISTS hazo_scopes_l6 CASCADE;
DROP TABLE IF EXISTS hazo_scopes_l5 CASCADE;
DROP TABLE IF EXISTS hazo_scopes_l4 CASCADE;
DROP TABLE IF EXISTS hazo_scopes_l3 CASCADE;
DROP TABLE IF EXISTS hazo_scopes_l2 CASCADE;
DROP TABLE IF EXISTS hazo_scopes_l1 CASCADE;
DROP TABLE IF EXISTS hazo_scope_labels CASCADE;
DROP TABLE IF EXISTS hazo_enum_scope_types CASCADE;

-- 2. Drop hazo_org table if exists
DROP TABLE IF EXISTS hazo_org CASCADE;

-- 3. Remove org columns from hazo_users if they exist
-- Note: PostgreSQL requires separate statements
ALTER TABLE hazo_users DROP COLUMN IF EXISTS org_id;
ALTER TABLE hazo_users DROP COLUMN IF EXISTS root_org_id;

-- 4. Drop org-related indexes if they exist
DROP INDEX IF EXISTS idx_hazo_org_parent_org_id;
DROP INDEX IF EXISTS idx_hazo_org_root_org_id;
DROP INDEX IF EXISTS idx_hazo_org_active;
DROP INDEX IF EXISTS idx_hazo_org_name;
DROP INDEX IF EXISTS idx_hazo_users_org_id;
DROP INDEX IF EXISTS idx_hazo_users_root_org_id;

-- 5. Ensure hazo_scopes table has correct structure
-- (Table should already exist with id, parent_id, name, level, created_at, changed_at)
-- Add index on parent_id for hierarchy traversal if not exists
CREATE INDEX IF NOT EXISTS idx_hazo_scopes_parent ON hazo_scopes(parent_id);
CREATE INDEX IF NOT EXISTS idx_hazo_scopes_level ON hazo_scopes(level);

-- 6. Create super admin scope (special UUID with all zeros)
INSERT INTO hazo_scopes (id, parent_id, name, level, created_at, changed_at)
VALUES ('00000000-0000-0000-0000-000000000000', NULL, 'Super Admin', 'system', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 7. Create default system scope (for non-multi-tenancy mode)
INSERT INTO hazo_scopes (id, parent_id, name, level, created_at, changed_at)
VALUES ('00000000-0000-0000-0000-000000000001', NULL, 'System', 'default', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 8. Create hazo_invitations table
CREATE TABLE IF NOT EXISTS hazo_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_address TEXT NOT NULL,
  scope_id UUID NOT NULL REFERENCES hazo_scopes(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES hazo_roles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED')),
  invited_by UUID REFERENCES hazo_users(id) ON DELETE SET NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 9. Create indexes for hazo_invitations
CREATE INDEX IF NOT EXISTS idx_hazo_invitations_email ON hazo_invitations(email_address);
CREATE INDEX IF NOT EXISTS idx_hazo_invitations_scope ON hazo_invitations(scope_id);
CREATE INDEX IF NOT EXISTS idx_hazo_invitations_status ON hazo_invitations(status);
CREATE INDEX IF NOT EXISTS idx_hazo_invitations_expires ON hazo_invitations(expires_at);
CREATE INDEX IF NOT EXISTS idx_hazo_invitations_email_status ON hazo_invitations(email_address, status);

-- 10. Create firm_admin role (for firm creators)
INSERT INTO hazo_roles (id, role_name, created_at, changed_at)
VALUES (gen_random_uuid(), 'firm_admin', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ===========================================
-- SQLite Version (run separately if using SQLite)
-- ===========================================
--
-- -- 1. Drop legacy tables
-- DROP TABLE IF EXISTS hazo_scopes_l7;
-- DROP TABLE IF EXISTS hazo_scopes_l6;
-- DROP TABLE IF EXISTS hazo_scopes_l5;
-- DROP TABLE IF EXISTS hazo_scopes_l4;
-- DROP TABLE IF EXISTS hazo_scopes_l3;
-- DROP TABLE IF EXISTS hazo_scopes_l2;
-- DROP TABLE IF EXISTS hazo_scopes_l1;
-- DROP TABLE IF EXISTS hazo_scope_labels;
-- DROP TABLE IF EXISTS hazo_enum_scope_types;
-- DROP TABLE IF EXISTS hazo_org;
--
-- -- 2. Note: SQLite doesn't support DROP COLUMN in older versions
-- -- You may need to recreate the hazo_users table without org columns
--
-- -- 3. Create indexes
-- CREATE INDEX IF NOT EXISTS idx_hazo_scopes_parent ON hazo_scopes(parent_id);
-- CREATE INDEX IF NOT EXISTS idx_hazo_scopes_level ON hazo_scopes(level);
--
-- -- 4. Create super admin scope
-- INSERT OR IGNORE INTO hazo_scopes (id, parent_id, name, level, created_at, changed_at)
-- VALUES ('00000000-0000-0000-0000-000000000000', NULL, 'Super Admin', 'system', datetime('now'), datetime('now'));
--
-- -- 5. Create default system scope
-- INSERT OR IGNORE INTO hazo_scopes (id, parent_id, name, level, created_at, changed_at)
-- VALUES ('00000000-0000-0000-0000-000000000001', NULL, 'System', 'default', datetime('now'), datetime('now'));
--
-- -- 6. Create hazo_invitations table
-- CREATE TABLE IF NOT EXISTS hazo_invitations (
--   id TEXT PRIMARY KEY,
--   email_address TEXT NOT NULL,
--   scope_id TEXT NOT NULL REFERENCES hazo_scopes(id) ON DELETE CASCADE,
--   role_id TEXT NOT NULL REFERENCES hazo_roles(id) ON DELETE CASCADE,
--   status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED')),
--   invited_by TEXT REFERENCES hazo_users(id) ON DELETE SET NULL,
--   expires_at TEXT NOT NULL,
--   accepted_at TEXT,
--   created_at TEXT NOT NULL DEFAULT (datetime('now')),
--   changed_at TEXT NOT NULL DEFAULT (datetime('now'))
-- );
--
-- CREATE INDEX IF NOT EXISTS idx_hazo_invitations_email ON hazo_invitations(email_address);
-- CREATE INDEX IF NOT EXISTS idx_hazo_invitations_scope ON hazo_invitations(scope_id);
-- CREATE INDEX IF NOT EXISTS idx_hazo_invitations_status ON hazo_invitations(status);
-- CREATE INDEX IF NOT EXISTS idx_hazo_invitations_expires ON hazo_invitations(expires_at);
-- CREATE INDEX IF NOT EXISTS idx_hazo_invitations_email_status ON hazo_invitations(email_address, status);
--
-- -- 7. Create firm_admin role
-- INSERT OR IGNORE INTO hazo_roles (id, role_name, created_at, changed_at)
-- VALUES (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6))), 'firm_admin', datetime('now'), datetime('now'));

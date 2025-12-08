-- Migration: Add parent_scope_id to hazo_scopes_l2 through hazo_scopes_l7
-- This enables explicit hierarchy relationships between scope levels
-- L1 is the root level (no parent), L2 references L1, L3 references L2, etc.

-- ===========================================
-- PostgreSQL Version
-- ===========================================

-- Add parent_scope_id column to L2 (references L1)
ALTER TABLE hazo_scopes_l2 ADD COLUMN IF NOT EXISTS parent_scope_id UUID REFERENCES hazo_scopes_l1(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_hazo_scopes_l2_parent ON hazo_scopes_l2(parent_scope_id);

-- Add parent_scope_id column to L3 (references L2)
ALTER TABLE hazo_scopes_l3 ADD COLUMN IF NOT EXISTS parent_scope_id UUID REFERENCES hazo_scopes_l2(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_hazo_scopes_l3_parent ON hazo_scopes_l3(parent_scope_id);

-- Add parent_scope_id column to L4 (references L3)
ALTER TABLE hazo_scopes_l4 ADD COLUMN IF NOT EXISTS parent_scope_id UUID REFERENCES hazo_scopes_l3(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_hazo_scopes_l4_parent ON hazo_scopes_l4(parent_scope_id);

-- Add parent_scope_id column to L5 (references L4)
ALTER TABLE hazo_scopes_l5 ADD COLUMN IF NOT EXISTS parent_scope_id UUID REFERENCES hazo_scopes_l4(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_hazo_scopes_l5_parent ON hazo_scopes_l5(parent_scope_id);

-- Add parent_scope_id column to L6 (references L5)
ALTER TABLE hazo_scopes_l6 ADD COLUMN IF NOT EXISTS parent_scope_id UUID REFERENCES hazo_scopes_l5(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_hazo_scopes_l6_parent ON hazo_scopes_l6(parent_scope_id);

-- Add parent_scope_id column to L7 (references L6)
ALTER TABLE hazo_scopes_l7 ADD COLUMN IF NOT EXISTS parent_scope_id UUID REFERENCES hazo_scopes_l6(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_hazo_scopes_l7_parent ON hazo_scopes_l7(parent_scope_id);

-- ===========================================
-- SQLite Version (run separately if using SQLite)
-- ===========================================
-- Note: SQLite doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN
-- Run these only if the columns don't exist:
--
-- ALTER TABLE hazo_scopes_l2 ADD COLUMN parent_scope_id TEXT REFERENCES hazo_scopes_l1(id) ON DELETE CASCADE;
-- ALTER TABLE hazo_scopes_l3 ADD COLUMN parent_scope_id TEXT REFERENCES hazo_scopes_l2(id) ON DELETE CASCADE;
-- ALTER TABLE hazo_scopes_l4 ADD COLUMN parent_scope_id TEXT REFERENCES hazo_scopes_l3(id) ON DELETE CASCADE;
-- ALTER TABLE hazo_scopes_l5 ADD COLUMN parent_scope_id TEXT REFERENCES hazo_scopes_l4(id) ON DELETE CASCADE;
-- ALTER TABLE hazo_scopes_l6 ADD COLUMN parent_scope_id TEXT REFERENCES hazo_scopes_l5(id) ON DELETE CASCADE;
-- ALTER TABLE hazo_scopes_l7 ADD COLUMN parent_scope_id TEXT REFERENCES hazo_scopes_l6(id) ON DELETE CASCADE;
--
-- CREATE INDEX IF NOT EXISTS idx_hazo_scopes_l2_parent ON hazo_scopes_l2(parent_scope_id);
-- CREATE INDEX IF NOT EXISTS idx_hazo_scopes_l3_parent ON hazo_scopes_l3(parent_scope_id);
-- CREATE INDEX IF NOT EXISTS idx_hazo_scopes_l4_parent ON hazo_scopes_l4(parent_scope_id);
-- CREATE INDEX IF NOT EXISTS idx_hazo_scopes_l5_parent ON hazo_scopes_l5(parent_scope_id);
-- CREATE INDEX IF NOT EXISTS idx_hazo_scopes_l6_parent ON hazo_scopes_l6(parent_scope_id);
-- CREATE INDEX IF NOT EXISTS idx_hazo_scopes_l7_parent ON hazo_scopes_l7(parent_scope_id);

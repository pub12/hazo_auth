-- Migration: Add slug column to hazo_scopes for URL-friendly identifiers
-- This enables tenant context via URL paths (e.g., /org/:slug/dashboard)

ALTER TABLE hazo_scopes ADD COLUMN slug TEXT;

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_hazo_scopes_slug ON hazo_scopes(slug);

-- Note: Slug values should be unique within the same level of the hierarchy
-- but this isn't enforced via constraint to allow flexibility

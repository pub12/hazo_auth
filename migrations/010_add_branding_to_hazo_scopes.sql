-- Migration: Add branding columns to hazo_scopes for firm customization
-- Version: 010
-- Date: 2026-01-01
-- Description: Enables custom branding (logo, colors, tagline) for firms (root-level scopes)

-- Add branding columns to hazo_scopes
ALTER TABLE hazo_scopes ADD COLUMN logo_url TEXT;
ALTER TABLE hazo_scopes ADD COLUMN primary_color TEXT;
ALTER TABLE hazo_scopes ADD COLUMN secondary_color TEXT;
ALTER TABLE hazo_scopes ADD COLUMN tagline TEXT;

-- Note: Only root scopes (parent_id IS NULL) typically have branding set.
-- Child scopes inherit branding from their root scope via application logic.

-- file_description: migration to add OAuth support fields to hazo_users table
-- Adds google_id for Google OAuth and auth_providers to track available login methods

-- Add google_id column for Google OAuth unique identifier
-- This stores Google's unique user ID (sub claim from JWT) for OAuth lookups
-- Note: SQLite doesn't support ADD COLUMN with UNIQUE, so we add the column first
-- then create a unique index
ALTER TABLE hazo_users
ADD COLUMN google_id TEXT;

-- Add auth_providers column to track which authentication methods the user has set up
-- Values: 'email' (password login), 'google' (Google OAuth), or 'email,google' (both)
-- Default to 'email' for existing users who registered with email/password
ALTER TABLE hazo_users
ADD COLUMN auth_providers TEXT DEFAULT 'email';

-- Create unique index on google_id for fast lookups during OAuth login and to enforce uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_hazo_users_google_id ON hazo_users(google_id);

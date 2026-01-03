-- Migration: Fix status fields to use uppercase values to match PostgreSQL enums
-- This migration updates CHECK constraints from lowercase to uppercase status values
-- PostgreSQL enums: hazo_enum_user_status (PENDING, ACTIVE, BLOCKED)
--                   hazo_enum_invitation_status (PENDING, ACCEPTED, EXPIRED, REVOKED)

-- ============================================
-- Part 1: Fix hazo_users status field
-- ============================================

-- Create new table with correct CHECK constraint
CREATE TABLE hazo_users_new (
  id TEXT PRIMARY KEY,
  email_address TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  name TEXT,
  email_verified INTEGER DEFAULT 0,
  login_attempts INTEGER DEFAULT 0,
  last_logon TEXT,
  profile_picture_url TEXT,
  profile_source TEXT CHECK(profile_source IN ('gravatar', 'custom', 'predefined')),
  mfa_secret TEXT,
  url_on_logon TEXT,
  google_id TEXT UNIQUE,
  auth_providers TEXT DEFAULT 'email',
  user_type TEXT,
  app_user_data TEXT,
  status TEXT DEFAULT 'ACTIVE' CHECK(status IN ('PENDING', 'ACTIVE', 'BLOCKED')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  changed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Copy data with uppercase status conversion
INSERT INTO hazo_users_new (
  id, email_address, password_hash, name, email_verified, login_attempts,
  last_logon, profile_picture_url, profile_source, mfa_secret, url_on_logon,
  google_id, auth_providers, user_type, app_user_data, status, created_at, changed_at
)
SELECT
  id, email_address, password_hash, name, email_verified, login_attempts,
  last_logon, profile_picture_url, profile_source, mfa_secret, url_on_logon,
  google_id, auth_providers, user_type, app_user_data,
  CASE
    WHEN UPPER(status) = 'ACTIVE' THEN 'ACTIVE'
    WHEN UPPER(status) = 'PENDING' THEN 'PENDING'
    WHEN UPPER(status) = 'BLOCKED' THEN 'BLOCKED'
    WHEN UPPER(status) = 'INACTIVE' THEN 'BLOCKED'
    WHEN UPPER(status) = 'SUSPENDED' THEN 'BLOCKED'
    ELSE 'ACTIVE'
  END,
  created_at, changed_at
FROM hazo_users;

-- Drop old table
DROP TABLE hazo_users;

-- Rename new table
ALTER TABLE hazo_users_new RENAME TO hazo_users;

-- Recreate indexes
CREATE INDEX idx_hazo_users_email ON hazo_users(email_address);
CREATE INDEX idx_hazo_users_google_id ON hazo_users(google_id);
CREATE INDEX idx_hazo_users_status ON hazo_users(status);

-- ============================================
-- Part 2: Fix hazo_invitations status field
-- ============================================

-- Create new table with correct CHECK constraint
CREATE TABLE hazo_invitations_new (
  id TEXT PRIMARY KEY,
  email_address TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  scope_id TEXT NOT NULL REFERENCES hazo_scopes(id) ON DELETE CASCADE,
  root_scope_id TEXT NOT NULL REFERENCES hazo_scopes(id) ON DELETE CASCADE,
  role_id TEXT NOT NULL REFERENCES hazo_roles(id) ON DELETE CASCADE,
  invited_by TEXT REFERENCES hazo_users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED')),
  expires_at TEXT NOT NULL,
  accepted_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  changed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Copy data with uppercase status conversion
INSERT INTO hazo_invitations_new (
  id, email_address, token, scope_id, root_scope_id, role_id, invited_by,
  status, expires_at, accepted_at, created_at, changed_at
)
SELECT
  id, email_address, token, scope_id, root_scope_id, role_id, invited_by,
  UPPER(status),
  expires_at, accepted_at, created_at, changed_at
FROM hazo_invitations;

-- Drop old table
DROP TABLE hazo_invitations;

-- Rename new table
ALTER TABLE hazo_invitations_new RENAME TO hazo_invitations;

-- Recreate indexes
CREATE INDEX idx_hazo_invitations_email ON hazo_invitations(email_address);
CREATE INDEX idx_hazo_invitations_token ON hazo_invitations(token);
CREATE INDEX idx_hazo_invitations_scope ON hazo_invitations(scope_id);
CREATE INDEX idx_hazo_invitations_status ON hazo_invitations(status);
CREATE INDEX idx_hazo_invitations_expires ON hazo_invitations(expires_at);

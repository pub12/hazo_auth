// file_description: canonical SQLite schema for hazo_auth database
// This is the single source of truth for the hazo_auth SQLite schema.
// Used by: npx hazo_auth init, npx hazo_auth init-db, npx hazo_auth schema

export const SQLITE_SCHEMA = `
-- hazo_auth canonical SQLite schema
-- This schema creates all tables required by hazo_auth

-- Users table (from migration 011)
CREATE TABLE IF NOT EXISTS hazo_users (
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

CREATE INDEX IF NOT EXISTS idx_hazo_users_email ON hazo_users(email_address);
CREATE INDEX IF NOT EXISTS idx_hazo_users_google_id ON hazo_users(google_id);
CREATE INDEX IF NOT EXISTS idx_hazo_users_status ON hazo_users(status);

-- Refresh tokens table
CREATE TABLE IF NOT EXISTS hazo_refresh_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES hazo_users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  token_type TEXT DEFAULT 'refresh',
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_hazo_refresh_tokens_user ON hazo_refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_hazo_refresh_tokens_token ON hazo_refresh_tokens(token);

-- Roles table
CREATE TABLE IF NOT EXISTS hazo_roles (
  id TEXT PRIMARY KEY,
  role_name TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  changed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Permissions table
CREATE TABLE IF NOT EXISTS hazo_permissions (
  id TEXT PRIMARY KEY,
  permission_name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  changed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Role-permission assignments (composite PK, no id column)
CREATE TABLE IF NOT EXISTS hazo_role_permissions (
  role_id TEXT NOT NULL REFERENCES hazo_roles(id) ON DELETE CASCADE,
  permission_id TEXT NOT NULL REFERENCES hazo_permissions(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (role_id, permission_id)
);

-- Unified scopes table (hierarchical multi-tenancy)
CREATE TABLE IF NOT EXISTS hazo_scopes (
  id TEXT PRIMARY KEY,
  parent_id TEXT REFERENCES hazo_scopes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  level TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  tagline TEXT,
  slug TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  changed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_hazo_scopes_parent ON hazo_scopes(parent_id);
CREATE INDEX IF NOT EXISTS idx_hazo_scopes_level ON hazo_scopes(level);
CREATE INDEX IF NOT EXISTS idx_hazo_scopes_slug ON hazo_scopes(slug);

-- Super admin scope
INSERT OR IGNORE INTO hazo_scopes (id, parent_id, name, level, created_at, changed_at)
VALUES ('00000000-0000-0000-0000-000000000000', NULL, 'Super Admin', 'system', datetime('now'), datetime('now'));

-- Default system scope (for non-multi-tenancy mode)
INSERT OR IGNORE INTO hazo_scopes (id, parent_id, name, level, created_at, changed_at)
VALUES ('00000000-0000-0000-0000-000000000001', NULL, 'System', 'default', datetime('now'), datetime('now'));

-- User-scope assignments (membership model with scope-specific roles)
CREATE TABLE IF NOT EXISTS hazo_user_scopes (
  user_id TEXT NOT NULL REFERENCES hazo_users(id) ON DELETE CASCADE,
  scope_id TEXT NOT NULL REFERENCES hazo_scopes(id) ON DELETE CASCADE,
  root_scope_id TEXT NOT NULL REFERENCES hazo_scopes(id) ON DELETE CASCADE,
  role_id TEXT NOT NULL REFERENCES hazo_roles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('INVITED', 'ACTIVE', 'SUSPENDED', 'DEPARTED')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  changed_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, scope_id)
);

CREATE INDEX IF NOT EXISTS idx_hazo_user_scopes_scope ON hazo_user_scopes(scope_id);
CREATE INDEX IF NOT EXISTS idx_hazo_user_scopes_root ON hazo_user_scopes(root_scope_id);
CREATE INDEX IF NOT EXISTS idx_hazo_user_scopes_role ON hazo_user_scopes(role_id);

-- Invitations table
CREATE TABLE IF NOT EXISTS hazo_invitations (
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

CREATE INDEX IF NOT EXISTS idx_hazo_invitations_email ON hazo_invitations(email_address);
CREATE INDEX IF NOT EXISTS idx_hazo_invitations_token ON hazo_invitations(token);
CREATE INDEX IF NOT EXISTS idx_hazo_invitations_scope ON hazo_invitations(scope_id);
CREATE INDEX IF NOT EXISTS idx_hazo_invitations_status ON hazo_invitations(status);
CREATE INDEX IF NOT EXISTS idx_hazo_invitations_expires ON hazo_invitations(expires_at);

-- Firm admin role (for firm creators)
INSERT OR IGNORE INTO hazo_roles (id, role_name, created_at, changed_at)
VALUES (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6))), 'firm_admin', datetime('now'), datetime('now'));
`;

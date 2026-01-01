# hazo_auth Database Schema

This document describes the database schema for hazo_auth. The schema supports both PostgreSQL (via PostgREST) and SQLite.

## Schema Overview

```
hazo_users          - User accounts and profile data
hazo_roles          - Role definitions (e.g., super_user, firm_admin)
hazo_permissions    - Permission definitions (e.g., admin_user_management)
hazo_user_roles     - User-role assignments (junction table)
hazo_role_permissions - Role-permission assignments (junction table)
hazo_refresh_tokens - Tokens for password reset, email verification, etc.
hazo_scopes         - Unified scope hierarchy (firms, divisions, departments)
hazo_user_scopes    - User-scope assignments (membership-based multi-tenancy)
hazo_invitations    - User invitations to join scopes
```

## Core Tables

### hazo_users

User accounts with authentication and profile information.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID/TEXT | NO | - | Primary key |
| email_address | TEXT | NO | - | Unique email address |
| password_hash | TEXT | YES | - | Argon2 password hash (null for OAuth-only users) |
| name | TEXT | YES | - | Display name |
| email_verified | BOOLEAN/INT | YES | false/0 | Email verification status |
| login_attempts | INTEGER | YES | 0 | Failed login attempt counter |
| last_logon | TIMESTAMP/TEXT | YES | - | Last successful login |
| profile_picture_url | TEXT | YES | - | URL to profile picture |
| profile_source | TEXT | YES | - | 'gravatar', 'custom', or 'predefined' |
| mfa_secret | TEXT | YES | - | MFA secret key |
| url_on_logon | TEXT | YES | - | Custom redirect URL after login |
| google_id | TEXT | YES | - | Google OAuth ID (unique) |
| auth_providers | TEXT | YES | 'email' | Comma-separated: 'email', 'google' |
| user_type | TEXT | YES | - | Custom user type (configurable) |
| app_user_data | JSON/TEXT | YES | - | Application-specific JSON data |
| status | TEXT | YES | 'active' | 'active', 'inactive', 'suspended' |
| created_at | TIMESTAMP/TEXT | NO | NOW() | Creation timestamp |
| changed_at | TIMESTAMP/TEXT | NO | NOW() | Last modification timestamp |

### hazo_roles

Role definitions for RBAC.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID/TEXT | NO | - | Primary key |
| role_name | TEXT | NO | - | Unique role name (e.g., 'super_user', 'firm_admin') |
| created_at | TIMESTAMP/TEXT | NO | NOW() | Creation timestamp |
| changed_at | TIMESTAMP/TEXT | NO | NOW() | Last modification timestamp |

### hazo_permissions

Permission definitions for fine-grained access control.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID/TEXT | NO | - | Primary key |
| permission_name | TEXT | NO | - | Unique permission name |
| description | TEXT | YES | - | Human-readable description |
| created_at | TIMESTAMP/TEXT | NO | NOW() | Creation timestamp |
| changed_at | TIMESTAMP/TEXT | NO | NOW() | Last modification timestamp |

### hazo_user_roles

Junction table linking users to roles.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| user_id | UUID/TEXT | NO | - | FK to hazo_users.id |
| role_id | UUID/TEXT | NO | - | FK to hazo_roles.id |
| created_at | TIMESTAMP/TEXT | NO | NOW() | Creation timestamp |
| changed_at | TIMESTAMP/TEXT | NO | NOW() | Last modification timestamp |

Primary Key: (user_id, role_id)

### hazo_role_permissions

Junction table linking roles to permissions.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| role_id | UUID/TEXT | NO | - | FK to hazo_roles.id |
| permission_id | UUID/TEXT | NO | - | FK to hazo_permissions.id |
| created_at | TIMESTAMP/TEXT | NO | NOW() | Creation timestamp |
| changed_at | TIMESTAMP/TEXT | NO | NOW() | Last modification timestamp |

Primary Key: (role_id, permission_id)

### hazo_refresh_tokens

Tokens for password reset, email verification, and session refresh.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID/TEXT | NO | - | Primary key |
| user_id | UUID/TEXT | NO | - | FK to hazo_users.id |
| token_hash | TEXT | NO | - | Hashed token value |
| token_type | TEXT | NO | 'refresh' | 'refresh', 'password_reset', 'email_verification' |
| expires_at | TIMESTAMP/TEXT | NO | - | Token expiration time |
| created_at | TIMESTAMP/TEXT | NO | NOW() | Creation timestamp |

## Scope-Based Multi-Tenancy Tables

### hazo_scopes

Unified scope hierarchy table. Replaces the legacy 7-level scope tables.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID/TEXT | NO | - | Primary key |
| parent_id | UUID/TEXT | YES | - | FK to hazo_scopes.id (self-reference for hierarchy) |
| name | TEXT | NO | - | Scope name (e.g., "Acme Corp", "Sydney Office") |
| level | TEXT | NO | - | Descriptive level label (e.g., "HQ", "Division", "Department") |
| created_at | TIMESTAMP/TEXT | NO | NOW() | Creation timestamp |
| changed_at | TIMESTAMP/TEXT | NO | NOW() | Last modification timestamp |

**Special Scopes:**
- `00000000-0000-0000-0000-000000000000` - Super Admin scope (system-wide access)
- `00000000-0000-0000-0000-000000000001` - Default System scope (non-multi-tenancy mode)

**Hierarchy Example:**
```
Acme Corp (HQ, parent_id=NULL)
├── Sydney Office (Division, parent_id=Acme Corp)
│   ├── Engineering (Department, parent_id=Sydney Office)
│   └── Sales (Department, parent_id=Sydney Office)
└── Melbourne Office (Division, parent_id=Acme Corp)
    └── Support (Department, parent_id=Melbourne Office)
```

### hazo_user_scopes

User-scope assignments for membership-based multi-tenancy.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| user_id | UUID/TEXT | NO | - | FK to hazo_users.id |
| scope_id | UUID/TEXT | NO | - | FK to hazo_scopes.id (direct assignment) |
| root_scope_id | UUID/TEXT | NO | - | FK to hazo_scopes.id (root firm/organization) |
| role_id | UUID/TEXT | NO | - | FK to hazo_roles.id (role within this scope) |
| status | TEXT | YES | 'active' | 'active', 'inactive' |
| created_at | TIMESTAMP/TEXT | NO | NOW() | Creation timestamp |
| changed_at | TIMESTAMP/TEXT | NO | NOW() | Last modification timestamp |

Primary Key: (user_id, scope_id)

**Access Logic:**
- User has access to their assigned scope AND all child scopes
- Access is checked by traversing the `parent_id` hierarchy
- `root_scope_id` tracks which top-level firm/organization the user belongs to

### hazo_invitations

Invitations for onboarding new users to existing scopes.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID/TEXT | NO | - | Primary key |
| email_address | TEXT | NO | - | Invitee's email address |
| token | TEXT | NO | - | Unique invitation token |
| scope_id | UUID/TEXT | NO | - | FK to hazo_scopes.id (scope to join) |
| root_scope_id | UUID/TEXT | NO | - | FK to hazo_scopes.id (root firm) |
| role_id | UUID/TEXT | NO | - | FK to hazo_roles.id (role for invitee) |
| invited_by | UUID/TEXT | YES | - | FK to hazo_users.id (inviter) |
| status | TEXT | NO | 'pending' | 'pending', 'accepted', 'expired', 'revoked' |
| expires_at | TIMESTAMP/TEXT | NO | - | Invitation expiration time |
| accepted_at | TIMESTAMP/TEXT | YES | - | When invitation was accepted |
| created_at | TIMESTAMP/TEXT | NO | NOW() | Creation timestamp |
| changed_at | TIMESTAMP/TEXT | NO | NOW() | Last modification timestamp |

**Invitation Flow:**
1. Admin creates invitation with email, scope, and role
2. System sends email with invitation link containing token
3. New user registers and verifies email
4. Post-verification checks for pending invitation
5. If found, accepts invitation and assigns user to scope
6. If no invitation, redirects to "Create Firm" flow

## Indexes

### hazo_users
- `idx_hazo_users_email` on (email_address)
- `idx_hazo_users_google_id` on (google_id)
- `idx_hazo_users_status` on (status)

### hazo_refresh_tokens
- `idx_hazo_refresh_tokens_user` on (user_id)
- `idx_hazo_refresh_tokens_type` on (token_type)
- `idx_hazo_refresh_tokens_user_type` on (user_id, token_type)

### hazo_scopes
- `idx_hazo_scopes_parent` on (parent_id)
- `idx_hazo_scopes_level` on (level)

### hazo_user_scopes
- `idx_hazo_user_scopes_scope` on (scope_id)
- `idx_hazo_user_scopes_root` on (root_scope_id)
- `idx_hazo_user_scopes_role` on (role_id)

### hazo_invitations
- `idx_hazo_invitations_email` on (email_address)
- `idx_hazo_invitations_token` on (token)
- `idx_hazo_invitations_scope` on (scope_id)
- `idx_hazo_invitations_status` on (status)
- `idx_hazo_invitations_expires` on (expires_at)

## Default Data

### System Scopes (auto-created)
| ID | Name | Level | Purpose |
|----|------|-------|---------|
| 00000000-0000-0000-0000-000000000000 | Super Admin | system | System-wide administrative access |
| 00000000-0000-0000-0000-000000000001 | System | default | Default scope for non-multi-tenancy mode |

### Default Roles (created by init-users)
| Role Name | Purpose |
|-----------|---------|
| super_user | Full system access |
| firm_admin | Full access within a firm |

### Default Permissions (created by init-users)
| Permission Name | Description |
|-----------------|-------------|
| admin_user_management | Manage users |
| admin_role_management | Manage roles |
| admin_permission_management | Manage permissions |
| admin_scope_hierarchy_management | Manage scope hierarchy |
| admin_user_scope_assignment | Assign users to scopes |
| admin_test_access | Access test tools |

## Migration History

| Migration | Description |
|-----------|-------------|
| 001_add_token_type_to_refresh_tokens.sql | Add token_type column |
| 002_add_name_to_hazo_users.sql | Add name column |
| 003_add_url_on_logon_to_hazo_users.sql | Add url_on_logon column |
| 004_add_parent_scope_to_scope_tables.sql | Add parent_scope_id to scope tables |
| 005_add_oauth_fields_to_hazo_users.sql | Add google_id, auth_providers |
| 006_multi_tenancy_org_support.sql | Add org-based multi-tenancy (deprecated) |
| 007_add_user_type_to_hazo_users.sql | Add user_type column |
| 008_add_app_user_data_to_hazo_users.sql | Add app_user_data JSON column |
| 009_scope_consolidation.sql | Consolidate to unified scopes, add invitations |

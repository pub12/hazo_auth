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
hazo_scopes         - Unified scope hierarchy (firms, divisions, departments) with branding
hazo_user_scopes    - User-scope assignments (membership-based multi-tenancy)
hazo_invitations    - User invitations to join scopes
```

## Enum Types (PostgreSQL)

### hazo_enum_user_status
User account status values.

| Value | Description |
|-------|-------------|
| PENDING | Account created but not yet verified |
| ACTIVE | Active user account |
| BLOCKED | Account has been blocked |

### hazo_enum_profile_source_enum
Source of user's profile picture.

| Value | Description |
|-------|-------------|
| gravatar | Profile picture from Gravatar |
| custom | Custom uploaded profile picture |
| predefined | Predefined library image |

### hazo_enum_user_scope_status_type
User's status within a scope.

| Value | Description |
|-------|-------------|
| INVITED | User has been invited but hasn't joined |
| ACTIVE | Active member of the scope |
| SUSPENDED | Membership temporarily suspended |
| DEPARTED | User has left the scope |

## Core Tables

### hazo_users

User accounts with authentication and profile information.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | - | Primary key |
| email_address | TEXT | NO | - | Unique email address |
| password_hash | TEXT | YES | - | Argon2 password hash (null for OAuth-only users) |
| name | TEXT | YES | - | Display name |
| email_verified | BOOLEAN | YES | false | Email verification status |
| login_attempts | INTEGER | YES | 0 | Failed login attempt counter |
| last_logon | TIMESTAMP WITH TIME ZONE | YES | - | Last successful login |
| profile_picture_url | TEXT | YES | - | URL to profile picture |
| profile_source | hazo_enum_profile_source_enum | YES | - | 'gravatar', 'custom', or 'predefined' |
| mfa_secret | TEXT | YES | - | MFA secret key |
| url_on_logon | TEXT | YES | - | Custom redirect URL after login |
| phone_no | TEXT | YES | - | User's phone number |
| google_id | TEXT | YES | - | Google OAuth ID (unique) |
| auth_providers | TEXT | YES | 'email' | Comma-separated: 'email', 'google' |
| app_user_data | JSON | YES | - | Application-specific JSON data |
| status | hazo_enum_user_status | YES | 'ACTIVE' | User account status |
| created_at | TIMESTAMP WITH TIME ZONE | NO | NOW() | Creation timestamp |
| changed_at | TIMESTAMP WITH TIME ZONE | NO | NOW() | Last modification timestamp |

### hazo_roles

Role definitions for RBAC.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | - | Primary key |
| role_name | TEXT | NO | - | Unique role name (e.g., 'super_user', 'firm_admin') |
| created_at | TIMESTAMP WITH TIME ZONE | NO | NOW() | Creation timestamp |
| changed_at | TIMESTAMP WITH TIME ZONE | NO | NOW() | Last modification timestamp |

### hazo_permissions

Permission definitions for fine-grained access control.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | - | Primary key |
| permission_name | TEXT | NO | - | Unique permission name |
| description | TEXT | YES | - | Human-readable description |
| created_at | TIMESTAMP WITH TIME ZONE | NO | NOW() | Creation timestamp |
| changed_at | TIMESTAMP WITH TIME ZONE | NO | NOW() | Last modification timestamp |

### hazo_user_roles

Junction table linking users to roles.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| user_id | UUID | NO | - | FK to hazo_users.id |
| role_id | UUID | NO | - | FK to hazo_roles.id |
| created_at | TIMESTAMP WITH TIME ZONE | NO | NOW() | Creation timestamp |
| changed_at | TIMESTAMP WITH TIME ZONE | NO | NOW() | Last modification timestamp |

Primary Key: (user_id, role_id)

### hazo_role_permissions

Junction table linking roles to permissions.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| role_id | UUID | NO | - | FK to hazo_roles.id |
| permission_id | UUID | NO | - | FK to hazo_permissions.id |
| created_at | TIMESTAMP WITH TIME ZONE | NO | NOW() | Creation timestamp |
| changed_at | TIMESTAMP WITH TIME ZONE | NO | NOW() | Last modification timestamp |

Primary Key: (role_id, permission_id)

### hazo_refresh_tokens

Tokens for password reset, email verification, and session refresh.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | - | Primary key |
| user_id | UUID | NO | - | FK to hazo_users.id |
| token_hash | TEXT | NO | - | Hashed token value |
| token_type | TEXT | NO | 'refresh' | 'refresh', 'password_reset', 'email_verification' |
| expires_at | TIMESTAMP WITH TIME ZONE | NO | - | Token expiration time |
| created_at | TIMESTAMP WITH TIME ZONE | NO | NOW() | Creation timestamp |

## Scope-Based Multi-Tenancy Tables

### hazo_scopes

Unified scope hierarchy table with firm branding support.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | - | Primary key |
| parent_id | UUID | YES | - | FK to hazo_scopes.id (self-reference for hierarchy) |
| name | TEXT | NO | - | Scope name (e.g., "Acme Corp", "Sydney Office") |
| level | TEXT | NO | - | Descriptive level label (e.g., "HQ", "Division", "Department") |
| logo_url | TEXT | YES | - | URL to firm logo (branding) |
| primary_color | TEXT | YES | - | Primary brand color (hex, e.g., "#1a73e8") |
| secondary_color | TEXT | YES | - | Secondary brand color (hex, e.g., "#4285f4") |
| tagline | TEXT | YES | - | Firm tagline/slogan |
| created_at | TIMESTAMP WITH TIME ZONE | NO | NOW() | Creation timestamp |
| changed_at | TIMESTAMP WITH TIME ZONE | NO | NOW() | Last modification timestamp |

**Special Scopes:**
- `00000000-0000-0000-0000-000000000000` - Super Admin scope (system-wide access)
- `00000000-0000-0000-0000-000000000001` - Default System scope (non-multi-tenancy mode)

**Branding Inheritance:**
- Only root scopes (parent_id = NULL) typically have branding set
- Child scopes inherit branding from their root scope via application logic
- Use `get_effective_branding()` to resolve inherited branding

**Hierarchy Example:**
```
Acme Corp (HQ, parent_id=NULL, logo_url=/logos/acme.png, primary_color=#1a73e8)
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
| user_id | UUID | NO | - | FK to hazo_users.id |
| scope_id | UUID | NO | - | FK to hazo_scopes.id (direct assignment) |
| root_scope_id | UUID | NO | - | FK to hazo_scopes.id (root firm/organization) |
| role_id | UUID | NO | - | FK to hazo_roles.id (role within this scope) |
| status | hazo_enum_user_scope_status_type | YES | 'ACTIVE' | Membership status |
| created_at | TIMESTAMP WITH TIME ZONE | NO | NOW() | Creation timestamp |
| changed_at | TIMESTAMP WITH TIME ZONE | NO | NOW() | Last modification timestamp |

Primary Key: (user_id, scope_id)

**Access Logic:**
- User has access to their assigned scope AND all child scopes
- Access is checked by traversing the `parent_id` hierarchy
- `root_scope_id` tracks which top-level firm/organization the user belongs to

### hazo_invitations

Invitations for onboarding new users to existing scopes.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | - | Primary key |
| email | VARCHAR(255) | NO | - | Invitee's email address |
| token | VARCHAR(255) | NO | - | Unique invitation token |
| scope_id | UUID | NO | - | FK to hazo_scopes.id (scope to join) |
| root_scope_id | UUID | NO | - | FK to hazo_scopes.id (root firm) |
| role_id | UUID | NO | - | FK to hazo_roles.id (role for invitee) |
| invited_by | UUID | YES | - | FK to hazo_users.id (inviter) |
| expires_at | TIMESTAMP WITH TIME ZONE | NO | - | Invitation expiration time |
| is_used | BOOLEAN | YES | false | Whether invitation has been used |
| created_at | TIMESTAMP WITH TIME ZONE | NO | NOW() | Creation timestamp |

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
- `idx_hazo_invitations_email` on (email)
- `idx_hazo_invitations_token` on (token)
- `idx_hazo_invitations_scope` on (scope_id)

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
| 010_add_branding_to_hazo_scopes.sql | Add firm branding columns (logo_url, colors, tagline) |

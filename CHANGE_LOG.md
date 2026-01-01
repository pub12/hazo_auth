# Changelog

All notable changes to the hazo_auth package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [5.0.0] - 2026-01-01

### Changed - Major Architectural Overhaul: Scope-Based Multi-Tenancy

**BREAKING CHANGE**: Complete redesign of the multi-tenancy and scope system. This is a major architectural change that removes the organization-based model in favor of a unified scope-based membership system.

**Why this change**: The previous dual-system (organizations + 7 separate scope tables) created unnecessary complexity and tight coupling. The new unified scope model provides a simpler, more flexible architecture that can represent any hierarchical structure (companies, firms, departments, teams, etc.) without rigid table constraints.

**Key Changes:**

**1. Removed Organization Tables and Services:**
- **REMOVED**: `hazo_org` table and all org-related foreign keys
- **REMOVED**: `org_service.ts`, `org_cache.ts`, `multi_tenancy_config.server.ts`
- **REMOVED**: `scope_labels_service.ts` (labels now part of scope `level` field)
- **REMOVED**: `OrgManagementLayout`, `OrgHierarchyTab`, `ScopeLabelsTab` components
- **REMOVED**: `/api/hazo_auth/org_management/orgs` API routes
- **REMOVED**: `org_id`, `root_org_id` fields from `hazo_users` table

**2. Unified Scope System:**
- **NEW**: Single `hazo_scopes` table replaces 7 separate `hazo_scopes_l1` through `hazo_scopes_l7` tables
- **Schema**: `hazo_scopes(id, name, level, parent_id, created_at, created_by, changed_at, changed_by)`
- **level**: Descriptive text field (e.g., "Company", "Division", "Department") - replaces scope labels
- **parent_id**: Self-referencing foreign key for hierarchy - enables unlimited depth
- **Benefits**: Simpler queries, flexible hierarchy, no table-per-level complexity

**3. Membership-Based Multi-Tenancy:**
- Users assigned to scopes via `hazo_user_scopes` table (not org_id on user record)
- **Super admin scope**: `00000000-0000-0000-0000-000000000000` (for system admins)
- **Default system scope**: `00000000-0000-0000-0000-000000000001` (fallback scope)
- Scopes can represent: firms, companies, organizations, departments, teams, projects, etc.

**4. New Invitation System:**
- **NEW**: `hazo_invitations` table for user onboarding
- Fields: `id`, `email`, `scope_id`, `invited_by_user_id`, `expires_at`, `status`, `created_at`
- Status: `pending`, `accepted`, `expired`, `cancelled`
- Invitations link new users to existing scopes before account creation
- Post-verification checks invitations and auto-assigns users to scopes

**5. New "Create Firm" Flow:**
- **NEW**: Post-verification routing for new users without scope assignments
- Flow: verify email → check `hazo_user_scopes` → check `hazo_invitations` → create firm page
- Users create their own firm (scope) if no invitation exists
- Default firm image: `/hazo_auth/images/new_firm_default.jpg`
- **NEW**: `CreateFirmLayout` component and page
- **NEW**: `POST /api/hazo_auth/create_firm` API route

**6. New init_permissions.ts CLI Command:**
- **NEW**: `npx hazo_auth init-permissions` - Initialize permissions without creating super user
- Separated permission initialization from user creation for flexibility
- Creates all default permissions from `application_permission_list_defaults` config
- Useful for production deployments where super user is created separately
- Run `npm run init-users` (uses init_users.ts) to create permissions AND super user

**7. Updated init_users.ts CLI:**
- Creates super admin scope on initialization
- Assigns super user to super admin scope
- Removed org creation logic
- Now calls init_permissions internally

**8. Updated Configuration:**
```ini
[hazo_auth__scope_hierarchy]
enable_hrbac = true
super_admin_scope_id = 00000000-0000-0000-0000-000000000000
default_system_scope_id = 00000000-0000-0000-0000-000000000001
# REMOVED: default_org setting

[hazo_auth__invitations]
invitation_expiry_days = 7
send_invitation_email = true

[hazo_auth__create_firm]
enable_create_firm = true
default_firm_image_path = /hazo_auth/images/new_firm_default.jpg
```

**9. Updated User Management Layout:**
- **REMOVED**: `multiTenancyEnabled` prop
- **REMOVED**: Organization assignment UI elements
- **REMOVED**: Org-related filtering and dialogs
- Scope assignment now handled separately (not in User Management)

**New Services:**
- `src/lib/services/invitation_service.ts` - Invitation CRUD operations
- `src/lib/services/firm_service.ts` - Create firm logic
- `src/lib/services/post_verification_service.ts` - Post-verification routing

**Modified Services:**
- `src/lib/services/scope_service.ts` - Updated for unified scope table
- `src/lib/services/user_scope_service.ts` - Simplified for membership model

**New API Routes:**
- `GET /api/hazo_auth/invitations` - List invitations
- `POST /api/hazo_auth/invitations` - Create invitation
- `PATCH /api/hazo_auth/invitations` - Update invitation
- `DELETE /api/hazo_auth/invitations` - Delete invitation
- `POST /api/hazo_auth/create_firm` - Create new firm

**New Components:**
- `CreateFirmLayout` (`src/components/layouts/create_firm/index.tsx`) - Create firm form
- `CreateFirmPage` (`src/server_pages/create_firm.tsx`) - Zero-config page

**Breaking Changes for Consuming Applications:**

1. **Database Migration Required**:
   - Drop `hazo_org` table
   - Drop `hazo_scopes_l1` through `hazo_scopes_l7` tables
   - Create new unified `hazo_scopes` table
   - Create `hazo_invitations` table
   - Remove `org_id`, `root_org_id` from `hazo_users`
   - Migrate existing scope data to unified table
   - Migrate existing user org assignments to `hazo_user_scopes`

2. **Configuration Changes**:
   - Remove `[hazo_auth__multi_tenancy]` section
   - Remove `default_org` from `[hazo_auth__scope_hierarchy]`
   - Add `[hazo_auth__invitations]` section
   - Add `[hazo_auth__create_firm]` section

3. **API Changes**:
   - Remove all `/api/hazo_auth/org_management/*` routes
   - Scope API now uses unified table (different response structure)
   - User assignment to scopes now via invitation or create firm flows

4. **Component Props**:
   - `UserManagementLayout` no longer accepts `multiTenancyEnabled` prop
   - Removed org-related props from all components

5. **Type Changes**:
   - `ScopeRecord` type updated (no more `org_id`, `root_org_id`)
   - `HazoAuthUser` no longer includes org fields
   - New `Invitation` type for invitation records

**Migration Strategy:**

For consuming applications using the old org-based multi-tenancy:

1. **Backup database** - This is a destructive migration
2. **Export org data** - Save org hierarchy before migration
3. **Map orgs to scopes** - Decide how orgs map to new scope structure
4. **Run migration scripts** - Apply database schema changes
5. **Migrate data** - Convert org assignments to scope assignments
6. **Update configuration** - Remove old config, add new sections
7. **Update code** - Remove org-related API calls and components
8. **Test thoroughly** - Verify all user access and scope assignments work

**Why These Breaking Changes Are Worth It:**

- **Simpler Architecture**: Single scope table vs 8 tables (1 org + 7 scope levels)
- **More Flexible**: Unlimited hierarchy depth vs fixed 7 levels
- **Better Performance**: Fewer joins, simpler queries
- **Clearer Model**: Membership-based vs mixed org_id + scope assignments
- **Easier to Understand**: One concept (scopes) vs two (orgs + scopes)
- **Modern Patterns**: Invitation-based onboarding is industry standard

**Backward Compatibility**: NONE - This is a breaking change requiring migration. Applications using org-based multi-tenancy must migrate to the new scope-based model.

**Files Removed:**
1. `src/lib/services/org_service.ts`
2. `src/lib/auth/org_cache.ts`
3. `src/lib/multi_tenancy_config.server.ts`
4. `src/lib/services/scope_labels_service.ts`
5. `src/components/layouts/org_management/` (entire directory)
6. `src/components/layouts/user_management/components/org_hierarchy_tab.tsx`
7. `src/components/layouts/user_management/components/scope_labels_tab.tsx`
8. `src/app/api/hazo_auth/org_management/` (entire directory)

**Files Created:**
1. `src/lib/services/invitation_service.ts`
2. `src/lib/services/firm_service.ts`
3. `src/lib/services/post_verification_service.ts`
4. `src/components/layouts/create_firm/index.tsx`
5. `src/server_pages/create_firm.tsx`
6. `src/app/api/hazo_auth/invitations/route.ts`
7. `src/app/api/hazo_auth/create_firm/route.ts`
8. `public/hazo_auth/images/new_firm_default.jpg`

**Files Modified:**
1. `src/lib/services/scope_service.ts` - Unified scope operations
2. `src/lib/services/user_scope_service.ts` - Simplified for membership model
3. `src/components/layouts/user_management/index.tsx` - Removed org UI
4. `src/cli/init.ts` - Updated for scope-based model
5. `hazo_auth_config.ini` - Removed org config, added invitation/create firm config

**Version Impact**: This change will be released as **v5.0.0** due to breaking changes.

**Quick Migration Checklist:**

```bash
# 1. BACKUP YOUR DATABASE (this is destructive!)
# 2. Run migration script
npm run migrate migrations/009_scope_consolidation.sql

# 3. Update hazo_auth_config.ini
#    - Remove [hazo_auth__multi_tenancy] section
#    - Remove default_org from [hazo_auth__scope_hierarchy]
#    - Add [hazo_auth__invitations] section
#    - Add [hazo_auth__create_firm] section

# 4. Remove org-related code from your app
#    - Remove /api/hazo_auth/org_management/* routes
#    - Remove OrgManagementLayout usage
#    - Remove multiTenancyEnabled prop from UserManagementLayout
#    - Remove org-related imports and API calls

# 5. Add new routes (optional, for invitation/firm features)
#    - /api/hazo_auth/invitations/route.ts
#    - /api/hazo_auth/create_firm/route.ts
#    - /hazo_auth/create_firm/page.tsx (if using create firm flow)

# 6. Test with new scope-based API
#    - Scope operations now use unified hazo_scopes table
#    - User assignment via hazo_user_scopes (not org_id)
#    - Test invitation flow if enabled
#    - Test create firm flow if enabled

# 7. Initialize permissions (new CLI command)
npx hazo_auth init-permissions  # Or npm run init-users
```

See migration script comments for PostgreSQL vs SQLite differences.

---

### ~~Changed - Scope Permission Clarification and Org Assignment Restriction~~ [OBSOLETE - v5.0.0 removed org system]

**Feature Enhancement**: Separated permission requirements for scope labels and improved organization assignment security.

**Why this change**: The scope labels tab requires system-level permissions beyond standard scope hierarchy management. Additionally, non-global admins should only be able to assign users to organizations within their own org tree for security and data segregation.

**What Changed**:

**1. Scope Labels Tab Permission:**
- **Scope Labels tab** now requires `admin_system` permission (NEW permission added to defaults)
- **Scope Hierarchy tab** continues using `admin_scope_hierarchy_management`
- **User Scopes tab** continues using `admin_user_scope_assignment`
- Changed in `src/components/layouts/user_management/index.tsx`

**2. Organization Assignment Restriction:**
- Org assignment dialog now filters orgs based on admin's permissions
- **Global admins** (`hazo_org_global_admin` permission) see all organizations
- **Non-global admins** only see their own org tree (filtered by `root_org_id`)
- Changed in `src/components/layouts/user_management/index.tsx`

**Security Rationale**:
- Prevents non-global admins from assigning users to organizations outside their tree
- Reduces risk of accidental cross-org data exposure
- Clear separation between system-level and scope-level permissions

**Files Modified**:
- `src/components/layouts/user_management/index.tsx` - Updated permission checks and org filtering
- `hazo_auth_config.ini` - Added `admin_system` to `application_permission_list_defaults`

**Backward Compatibility**:
- Existing users with `admin_scope_hierarchy_management` can still manage scope hierarchy
- New `admin_system` permission required for scope labels (add via `npm run init-users`)
- Org assignment restriction only affects non-global admins

---

### Added - App Permission Declaration via INI Config

**Feature**: Consuming applications can now declare required permissions with descriptions for debugging and error handling.

**Why this addition**: When permission checks fail in production, developers and users need clear context about which permissions were checked and what they control. Declaring permissions in config enables centralized permission documentation and better error messages when access is denied.

**Core Features**:
- **INI-based declaration**: Define permissions in `[hazo_auth__app_permissions]` section
- **Permission descriptions**: Each permission has a description for debugging
- **API endpoint**: `GET /api/hazo_auth/permissions/app` lists registered app permissions
- **Enhanced error messages**: `PermissionError` includes permission descriptions when available
- **Zero impact when unused**: Optional feature, no changes to existing flows

**New Configuration** (`hazo_auth_config.ini`):
```ini
[hazo_auth__app_permissions]
# Format: app_permission_N = permission_name:Description for debugging
app_permission_1 = view_reports:View financial reports and analytics
app_permission_2 = edit_invoices:Create and edit client invoices
app_permission_3 = admin_billing:Manage billing settings and subscriptions
```

**New API Endpoint**:
**`GET /api/hazo_auth/permissions/app`** - List registered app permissions
```typescript
// Response
{
  permissions: [
    { name: "view_reports", description: "View financial reports and analytics" },
    { name: "edit_invoices", description: "Create and edit client invoices" }
  ]
}
```

**Enhanced Permission Errors**:
When `strict: true` and permissions are missing, errors now include descriptions:

```typescript
try {
  await hazo_get_auth(request, {
    required_permissions: ["view_reports", "admin_billing"],
    strict: true
  });
} catch (error) {
  if (error instanceof PermissionError) {
    console.log(error.user_friendly_message);
    // "Access denied: Missing permissions: view_reports (View financial reports and analytics), admin_billing (Manage billing settings and subscriptions)"
  }
}
```

**Updated `PermissionError` Class** (`src/lib/auth/auth_types.ts`):
```typescript
export class PermissionError extends Error {
  constructor(
    missing_permissions: string[],
    public user_friendly_message: string,
    public permission_descriptions?: Map<string, string>  // NEW
  ) {
    super(user_friendly_message);
    this.name = "PermissionError";
    this.missing_permissions = missing_permissions;
    this.permission_descriptions = permission_descriptions;
  }

  missing_permissions: string[];
  permission_descriptions?: Map<string, string>;
}
```

**Service Functions** (`src/lib/app_permissions_config.server.ts`):
```typescript
// Get app permissions configuration
export function get_app_permissions_config(): AppPermissionsConfig

// Get permission description by name
export function get_permission_description(permission_name: string): string | undefined

// Check if permission is registered in config
export function is_registered_app_permission(permission_name: string): boolean
```

**Integration with `hazo_get_auth`** (`src/lib/auth/hazo_get_auth.server.ts`):
- When `strict: true` and permissions are missing, error includes descriptions
- Automatically looks up descriptions from app permissions config
- Falls back to permission names if no description found
- Enhanced user-friendly error messages for better UX

**Files Created**:
1. `src/lib/app_permissions_config.server.ts` - Config loader for app permissions
2. `src/app/api/hazo_auth/permissions/app/route.ts` - API endpoint for listing permissions

**Files Modified**:
1. `src/lib/auth/auth_types.ts` - Updated `PermissionError` with `permission_descriptions`
2. `src/lib/auth/hazo_get_auth.server.ts` - Enhanced error messages with descriptions
3. `hazo_auth_config.ini` - Added `[hazo_auth__app_permissions]` section example

**Use Cases**:

**1. Production error debugging:**
```typescript
// When access is denied, error includes clear context
PermissionError: Access denied: Missing permissions:
- view_reports (View financial reports and analytics)
- admin_billing (Manage billing settings and subscriptions)
```

**2. Admin UI for permission management:**
```typescript
// Fetch registered permissions to populate dropdown with descriptions
const response = await fetch("/api/hazo_auth/permissions/app");
const { permissions } = await response.json();
// [{ name: "view_reports", description: "View financial reports..." }]
```

**3. Documentation generation:**
```typescript
// Auto-generate permission documentation from config
const config = get_app_permissions_config();
console.log(config.permissions);
// Map { "view_reports" => "View financial reports and analytics" }
```

**Design Rationale**:

1. **INI-based (not database)**:
   - Config file is version-controlled (permissions are code-level concerns)
   - No CRUD UI needed for permission descriptions
   - Easier to maintain consistent permissions across environments
   - Prevents runtime permission description changes

2. **Optional feature**:
   - Zero impact when not configured
   - Existing apps work unchanged
   - Descriptions are informational, not required for functionality

3. **Separation from RBAC**:
   - RBAC permissions stored in database (runtime management)
   - App permission descriptions stored in config (deployment-time declaration)
   - Config serves as documentation, not permission enforcement

**Backward Compatibility**:
- No breaking changes - new config section is optional
- `PermissionError` class extended (existing code works unchanged)
- New API endpoint is additive
- `hazo_get_auth` behavior unchanged when config section not present

**Future Enhancements (not in this release)**:
- UI for viewing all registered app permissions with descriptions
- Permission usage analytics (which permissions are most commonly denied)
- Auto-generate permission documentation from config
- Validate that permissions in config exist in database

---

### Added - Configurable Cookie Prefix and Domain

**Feature**: Customizable cookie prefix and domain settings to prevent cookie conflicts when running multiple apps.

**Why this addition**: When running two apps that both use hazo_auth on localhost (different ports), cookies would conflict because browser cookie isolation is based on domain, not port. This caused authentication state to be shared between apps, leading to unexpected logouts or incorrect user sessions.

**Core Features**:
- **Cookie Prefix**: Add a custom prefix to all hazo_auth cookies (e.g., `myapp_hazo_auth_session`)
- **Cookie Domain**: Optionally set cookie domain for cross-subdomain sharing (e.g., `.example.com`)
- **Edge Runtime Support**: Environment variables for middleware (since Edge Runtime can't read config files)
- **Zero Breaking Changes**: Default behavior unchanged - only applies when configured

**New Configuration** (`hazo_auth_config.ini`):
```ini
[hazo_auth__cookies]
# Cookie prefix for all hazo_auth cookies (default: empty string)
cookie_prefix =
# Optional domain for cookies (default: not set - browser determines domain)
cookie_domain =
```

**New Environment Variables** (Required for Edge Runtime):
```bash
# Cookie prefix for Edge runtime (middleware)
HAZO_AUTH_COOKIE_PREFIX=myapp_

# Cookie domain for Edge runtime (optional)
HAZO_AUTH_COOKIE_DOMAIN=.example.com
```

**Cookie Names Affected**:
- `hazo_auth_session` → `{prefix}hazo_auth_session` (JWT session token)
- `hazo_auth_user_id` → `{prefix}hazo_auth_user_id`
- `hazo_auth_user_email` → `{prefix}hazo_auth_user_email`
- `hazo_auth_dev_lock` → `{prefix}hazo_auth_dev_lock` (if dev lock enabled)

**Use Case - Multiple Apps on Localhost:**

**App 1** (port 3000):
```ini
[hazo_auth__cookies]
cookie_prefix = app1_
```
```env
HAZO_AUTH_COOKIE_PREFIX=app1_
```

**App 2** (port 3001):
```ini
[hazo_auth__cookies]
cookie_prefix = app2_
```
```env
HAZO_AUTH_COOKIE_PREFIX=app2_
```

Now both apps can run simultaneously without cookie conflicts!

**Files Created**:
1. `src/lib/cookies_config.server.ts` - Server-side cookie configuration loader with helper functions
2. `src/lib/cookies_config.edge.ts` - Edge-compatible cookie configuration (uses env vars only)

**Files Modified**:
1. `hazo_auth_config.example.ini` - Added `[hazo_auth__cookies]` section with documentation
2. All routes that set/read cookies:
   - `src/app/api/hazo_auth/login/route.ts`
   - `src/app/api/hazo_auth/logout/route.ts`
   - `src/app/api/hazo_auth/oauth/google/callback/route.ts`
   - `src/app/api/hazo_auth/update_user/route.ts`
   - `src/app/api/hazo_auth/dev_lock/route.ts`
3. Authentication utilities:
   - `src/lib/auth/hazo_get_auth.server.ts`
   - `src/lib/auth/auth_utils.server.ts`
   - `src/lib/auth/server_auth.ts`
   - `src/lib/auth/session_token_validator.edge.ts`
   - `src/lib/auth/dev_lock_validator.edge.ts`
4. Middleware:
   - `src/server/middleware.ts`
5. Debug route:
   - `src/app/api/hazo_auth/debug_auth/route.ts`

**Helper Functions** (`cookies_config.server.ts` and `cookies_config.edge.ts`):
```typescript
// Get cookie configuration
export function get_cookies_config(): CookiesConfig

// Get prefixed cookie name (e.g., "app1_hazo_auth_session")
export function get_cookie_name(base_name: string): string

// Get cookie options (with domain if configured)
export function get_cookie_options(options?: ResponseCookie): ResponseCookie
```

**Backward Compatibility**:
- Default prefix is empty string (no prefix) - existing apps work unchanged
- Default domain is not set - browser determines domain as before
- Cookie behavior identical when not configured
- No breaking changes to existing authentication flows

**Security Notes**:
- Cookie prefix does not affect security - cookies still HttpOnly, Secure, SameSite=Lax
- Domain setting enables cross-subdomain sharing if needed (e.g., `app.example.com` and `admin.example.com`)
- Edge Runtime validation uses same prefix/domain from environment variables

**Design Rationale**:
1. **Two Configuration Sources**: Config file for server-side (most routes), env vars for Edge Runtime (middleware)
2. **Helper Functions**: Centralized cookie name/options generation prevents inconsistencies
3. **Additive Only**: No changes to existing behavior when not configured
4. **Simple API**: Single `cookie_prefix` setting affects all cookies uniformly

---

### Changed - Zero-Config Server Pages Now Include Navbar Automatically

**Feature Enhancement**: All 6 zero-config server page components now include the AuthPageShell wrapper internally, enabling the navbar to work automatically based on configuration without requiring consuming apps to wrap pages manually.

**Why this change**: The navbar feature required consuming apps to manually wrap page components with `AuthPageShell`, creating unnecessary boilerplate and friction. By embedding the wrapper directly in server page components, the navbar now works out-of-the-box with zero configuration, improving the developer experience and reducing setup complexity.

**What Changed**:
- **Server Page Components Updated** (all 6 files): Each server page now wraps its layout component in `AuthPageShell`, passing navbar configuration and the `disableNavbar` prop
  - `src/server_pages/login.tsx` - Login page
  - `src/server_pages/register.tsx` - Register page
  - `src/server_pages/forgot_password.tsx` - Forgot password page
  - `src/server_pages/reset_password.tsx` - Reset password page
  - `src/server_pages/verify_email.tsx` - Email verification page
  - `src/server_pages/my_settings.tsx` - My Settings page

**Files Modified**:
1. `src/server_pages/login.tsx` - Added AuthPageShell wrapper with navbar config
2. `src/server_pages/register.tsx` - Added AuthPageShell wrapper with navbar config
3. `src/server_pages/forgot_password.tsx` - Added AuthPageShell wrapper with navbar config
4. `src/server_pages/reset_password.tsx` - Added AuthPageShell wrapper with navbar config
5. `src/server_pages/verify_email.tsx` - Added AuthPageShell wrapper with navbar config (navbar disabled by default)
6. `src/server_pages/my_settings.tsx` - Added AuthPageShell wrapper with navbar config
7. `src/app/hazo_auth/login/page.tsx` - Removed redundant AuthPageShell wrapper
8. `src/app/hazo_auth/register/page.tsx` - Removed redundant AuthPageShell wrapper
9. `src/app/hazo_auth/forgot_password/page.tsx` - Removed redundant AuthPageShell wrapper
10. `src/app/hazo_auth/reset_password/page.tsx` - Removed redundant AuthPageShell wrapper
11. `src/app/hazo_auth/verify_email/page.tsx` - Removed redundant AuthPageShell wrapper
12. `src/app/hazo_auth/my_settings/page.tsx` - Removed redundant AuthPageShell wrapper

**Before (consuming apps had to wrap manually)**:
```typescript
// app/hazo_auth/login/page.tsx
import { LoginPage } from "hazo_auth/pages/login";
import { AuthPageShell } from "hazo_auth/components/layouts/shared/components/auth_page_shell";

export default function Page() {
  const navbarConfig = get_navbar_config();
  return (
    <AuthPageShell navbarConfig={navbarConfig}>
      <LoginPage />
    </AuthPageShell>
  );
}
```

**After (navbar works automatically)**:
```typescript
// app/hazo_auth/login/page.tsx
import { LoginPage } from "hazo_auth/pages/login";

export default function Page() {
  return <LoginPage />;  // Navbar automatically enabled if configured
}
```

**Behavior**:
- Navbar appears automatically on all auth pages when `enable_navbar = true` in `[hazo_auth__navbar]` config section
- Navbar can be disabled per-page by passing `disableNavbar={true}` prop
- Email verification page has navbar disabled by default (since it's often accessed from email links without context)
- Vertical centering works automatically when navbar is enabled and `vertical_center = auto` in `[hazo_auth__ui_shell]` config

**Backward Compatibility**:
- No breaking changes for consuming applications
- Existing pages work unchanged (navbar appears if configured)
- Manual AuthPageShell wrappers still work but are now redundant
- New projects get navbar automatically with zero configuration

**Design Rationale**:
- **Developer Experience**: Reduces boilerplate code in consuming applications
- **Zero-Config Philosophy**: Aligns with the zero-config page component design
- **Single Source of Truth**: Configuration in INI file controls navbar appearance, not wrapper code
- **Consistency**: All auth pages behave the same way regarding navbar rendering

---

### Fixed - Password Toggle Button Positioning

**Issue**: Password toggle button (eye icon) in password input fields had inconsistent vertical centering due to using `top-1/2 -translate-y-1/2`, which could misalign with different font sizes or input heights in custom themes.

**Root Cause**: The `absolute right-0.5 top-1/2 h-9 w-9 -translate-y-1/2` positioning approach relied on percentage-based centering, which doesn't account for the parent container's padding or border, causing slight misalignment in some themes.

**Fix Applied**:
Changed positioning in `src/components/layouts/shared/components/password_field.tsx` from:
```tsx
className="absolute right-0.5 top-1/2 h-9 w-9 -translate-y-1/2"
```

To:
```tsx
className="absolute inset-y-0 right-1 my-auto h-8 w-8"
```

**Why This is Better**:
- `inset-y-0` with `my-auto` provides more robust vertical centering using flexbox auto-margins
- Doesn't rely on transform-based centering which can be affected by parent container metrics
- Works consistently across different input heights and custom themes
- Slightly smaller button size (h-8 w-8 vs h-9 w-9) provides better visual balance
- Increased right spacing (right-1 vs right-0.5) prevents button from touching input border

**Files Modified**:
- `src/components/layouts/shared/components/password_field.tsx` - Updated button positioning classes

**Impact**: Password toggle button now centers perfectly in all themes and input sizes, improving visual consistency across the application.

---

### Changed - Improved Auth Card Padding on Mobile and Small Tablets

**Enhancement**: Increased horizontal margins in `TwoColumnAuthLayout` component for better visual spacing on mobile and small tablet devices.

**Why this change**: The previous `mx-4` (16px horizontal margins) felt cramped on modern mobile devices with larger screens. Increasing margins to `mx-6` (24px) on mobile and `mx-8` (32px) on small tablets provides better breathing room and improves readability on smaller viewports.

**What Changed**:
Updated `src/components/layouts/shared/components/two_column_auth_layout.tsx`:

**Before**:
```tsx
className="mx-4 rounded-2xl border bg-card"
```

**After**:
```tsx
className="mx-6 rounded-2xl border bg-card sm:mx-8"
```

**Breakpoint Behavior**:
- **Mobile (< 640px)**: 24px horizontal margins (`mx-6`)
- **Small tablets (≥ 640px)**: 32px horizontal margins (`sm:mx-8`)
- **Larger screens**: Existing max-width constraints continue to apply

**Files Modified**:
- `src/components/layouts/shared/components/two_column_auth_layout.tsx` - Updated container margin classes

**Visual Impact**:
- Better visual hierarchy on mobile devices
- Improved readability with more whitespace
- Card feels less cramped on small screens
- Maintains existing desktop appearance

**Backward Compatibility**: No breaking changes - purely visual enhancement that improves mobile UX.

---

### Added - App User Data (Custom User Metadata)

**Feature**: Flexible JSON field for consuming applications to store custom user-specific data without modifying the `hazo_users` table schema.

**Why this addition**: Many applications need to store custom user metadata (preferences, settings, app-specific state) without altering the core authentication schema. The `app_user_data` field provides a flexible, JSON-based storage solution that allows consuming applications to store arbitrary key-value data per user without database migrations or schema changes.

**Core Features**:
- **JSON Storage**: Single TEXT column stores JSON objects (no schema restrictions)
- **Deep Merge Support**: PATCH endpoint merges new data with existing (preserves unmodified fields)
- **Full Replace**: PUT endpoint replaces entire JSON object
- **Clear Data**: DELETE endpoint sets field to NULL
- **Type-Safe Service Layer**: TypeScript service with validation and error handling
- **Included in Auth Response**: Returns in `/api/hazo_auth/me` response for client access
- **Zero Impact When Unused**: Nullable column, no performance impact when not populated

**Database Changes** (Migration `008_add_app_user_data_to_hazo_users.sql`):
```sql
-- Add app_user_data column to hazo_users
ALTER TABLE hazo_users
ADD COLUMN app_user_data TEXT;
```

Adds single `app_user_data` TEXT column to `hazo_users` table. No indexes (JSON queries use application-level filtering). Compatible with both PostgreSQL and SQLite.

**New API Endpoints**:

1. **`GET /api/hazo_auth/app_user_data`**:
   - Returns current user's `app_user_data` as parsed JSON
   - Returns `null` if no data set
   - Requires authentication

   ```typescript
   Response:
   {
     data: { theme: "dark", sidebar_collapsed: true } | null
   }
   ```

2. **`PATCH /api/hazo_auth/app_user_data`** (Merge):
   - Deep merges provided JSON with existing data
   - Preserves fields not in request body
   - Creates nested objects if they don't exist

   ```typescript
   Request:
   {
     data: { theme: "light" }
   }

   // If existing data: { theme: "dark", sidebar_collapsed: true }
   // Result: { theme: "light", sidebar_collapsed: true }
   ```

3. **`PUT /api/hazo_auth/app_user_data`** (Replace):
   - Replaces entire `app_user_data` object
   - Existing fields not in request are removed

   ```typescript
   Request:
   {
     data: { theme: "light" }
   }

   // If existing data: { theme: "dark", sidebar_collapsed: true }
   // Result: { theme: "light" }
   ```

4. **`DELETE /api/hazo_auth/app_user_data`** (Clear):
   - Sets `app_user_data` to NULL
   - Removes all custom data for user

**API Response Changes**:

**`/api/hazo_auth/me` Enhanced**:
```typescript
{
  authenticated: true,
  // ... existing fields
  app_user_data: { theme: "dark", sidebar_collapsed: true } | null  // NEW
}
```

**New Service** (`src/lib/services/app_user_data_service.ts`):

```typescript
/**
 * Get user's app_user_data
 * @param adapter - hazo_connect adapter
 * @param user_id - User ID
 * @returns Parsed JSON object or null
 */
export async function get_app_user_data(
  adapter: HazoConnectAdapter,
  user_id: string
): Promise<Record<string, any> | null>

/**
 * Update user's app_user_data (deep merge or replace)
 * @param adapter - hazo_connect adapter
 * @param user_id - User ID
 * @param new_data - New data object
 * @param merge - If true, deep merge; if false, replace entirely
 */
export async function update_app_user_data(
  adapter: HazoConnectAdapter,
  user_id: string,
  new_data: Record<string, any>,
  merge: boolean = true
): Promise<void>

/**
 * Clear user's app_user_data (set to null)
 * @param adapter - hazo_connect adapter
 * @param user_id - User ID
 */
export async function clear_app_user_data(
  adapter: HazoConnectAdapter,
  user_id: string
): Promise<void>
```

**Deep Merge Algorithm**:
- Recursively merges nested objects
- Arrays are replaced (not merged)
- Null values in new_data delete fields from existing data
- Primitives (string, number, boolean) are replaced

**Example Merge Behavior**:
```typescript
// Existing data
{ user: { name: "Alice", age: 30 }, theme: "dark" }

// PATCH with
{ user: { age: 31 }, sidebar: true }

// Result
{ user: { name: "Alice", age: 31 }, theme: "dark", sidebar: true }
```

**Type Definitions** (`src/lib/auth/auth_types.ts`):

```typescript
export type HazoAuthUser = {
  id: string;
  email_address: string;
  name: string | null;
  is_active: boolean;
  profile_picture_url: string | null;
  url_on_logon: string | null;
  app_user_data: Record<string, any> | null;  // NEW
};
```

**New Test UI** (`src/components/layouts/app_user_data_test/index.tsx`):

Interactive test page at `/hazo_auth/app_user_data_test` with:
- View current `app_user_data` (live refresh)
- Merge data form (PATCH)
- Replace data form (PUT)
- Clear data button (DELETE)
- JSON validation before submission
- Success/error toast notifications
- Live data preview with syntax highlighting

**Files Created**:
1. `migrations/008_add_app_user_data_to_hazo_users.sql` - Database migration
2. `src/lib/services/app_user_data_service.ts` - Service layer with get/update/clear functions
3. `src/app/api/hazo_auth/app_user_data/route.ts` - API route handlers (GET, PATCH, PUT, DELETE)
4. `src/server/routes/app_user_data.ts` - Route handler exports for consuming apps
5. `src/components/layouts/app_user_data_test/index.tsx` - Test UI component
6. `src/app/hazo_auth/app_user_data_test/page.tsx` - Test page
7. `src/app/hazo_auth/app_user_data_test/app_user_data_test_page_client.tsx` - Client component wrapper

**Files Modified**:
1. `src/lib/auth/auth_types.ts` - Added `app_user_data` to `HazoAuthUser` type
2. `src/lib/auth/hazo_get_auth.server.ts` - Returns `app_user_data` in user object
3. `src/app/api/hazo_auth/me/route.ts` - Includes `app_user_data` in response
4. `src/server/routes/index.ts` - Exports app_user_data route handlers
5. `src/components/layouts/shared/components/sidebar_layout_wrapper.tsx` - Added "App User Data Test" link to sidebar

**Usage Patterns**:

1. **Store user preferences**:
   ```typescript
   PATCH /api/hazo_auth/app_user_data
   {
     data: {
       theme: "dark",
       language: "en-US",
       timezone: "America/New_York"
     }
   }
   ```

2. **Store app-specific state**:
   ```typescript
   PATCH /api/hazo_auth/app_user_data
   {
     data: {
       dashboard_layout: "grid",
       sidebar_collapsed: true,
       recent_searches: ["tax forms", "invoices"]
     }
   }
   ```

3. **Store nested configuration**:
   ```typescript
   PATCH /api/hazo_auth/app_user_data
   {
     data: {
       notifications: {
         email: true,
         sms: false,
         push: true
       },
       privacy: {
         profile_public: false,
         show_email: false
       }
     }
   }
   ```

4. **Update nested field (deep merge)**:
   ```typescript
   // Existing: { notifications: { email: true, sms: false } }
   PATCH /api/hazo_auth/app_user_data
   {
     data: {
       notifications: { sms: true }
     }
   }
   // Result: { notifications: { email: true, sms: true } }
   ```

5. **Replace entire object**:
   ```typescript
   PUT /api/hazo_auth/app_user_data
   {
     data: { theme: "light" }
   }
   // Removes all other fields, sets only theme
   ```

6. **Clear all data**:
   ```typescript
   DELETE /api/hazo_auth/app_user_data
   // Sets app_user_data to NULL
   ```

**Route Handler Setup** (Consuming Apps):

```typescript
// app/api/hazo_auth/app_user_data/route.ts
export {
  appUserDataGET as GET,
  appUserDataPATCH as PATCH,
  appUserDataPUT as PUT,
  appUserDataDELETE as DELETE
} from "hazo_auth/server/routes";
```

Or use CLI: `npx hazo_auth generate-routes`

**Design Rationale**:

1. **Single JSON Column (not separate table)**:
   - **Pro**: Zero schema changes needed for new app-specific fields
   - **Pro**: Simple migration (single ALTER TABLE)
   - **Pro**: No joins required for user queries
   - **Pro**: Flexible structure per application's needs
   - **Con**: No relational queries on custom data (acceptable tradeoff)

2. **Deep Merge by Default (PATCH)**:
   - **Pro**: Preserves unmodified fields (prevents data loss)
   - **Pro**: Allows incremental updates without fetching existing data first
   - **Pro**: Intuitive API behavior for most use cases
   - **Con**: Slightly more complex than simple replace (mitigated by service layer)

3. **Separate PUT for Replace**:
   - **Pro**: Explicit intent when full replacement is needed
   - **Pro**: RESTful semantics (PATCH = partial, PUT = full)
   - **Pro**: Prevents accidental data loss from merge behavior

4. **No Schema Validation**:
   - **Pro**: Maximum flexibility for consuming applications
   - **Pro**: No breaking changes when app requirements change
   - **Con**: No database-level validation (consuming apps handle validation)

5. **Included in `/api/hazo_auth/me`**:
   - **Pro**: Single request for auth status + custom data
   - **Pro**: Available to client components via `use_hazo_auth()` hook
   - **Pro**: Reduces API round trips

**Performance Considerations**:

**Storage**:
- JSON stored as TEXT (no compression)
- Recommended max size: ~10KB per user (reasonable for preferences/settings)
- Large data sets should use separate tables

**Querying**:
- No indexes on `app_user_data` (JSON queries are application-level)
- Use separate columns if database-level filtering needed
- Deep merge performance: O(n) where n = number of keys (fast for small objects)

**Caching**:
- Returned by `hazo_get_auth()` (benefits from LRU cache)
- Cache invalidation happens on user data changes
- No additional database queries for authenticated requests

**Backward Compatibility**:
- Nullable column (existing users have NULL)
- No breaking changes to existing API responses
- New field ignored by clients that don't use it
- Migration is additive (no data removal)

**Security Considerations**:
- Data is user-scoped (users can only access/modify their own data)
- Authentication required for all endpoints
- JSON parsing errors handled gracefully (returns 400)
- No SQL injection risk (JSON stored as TEXT)
- Rate limiting inherits from existing auth endpoints

**Future Enhancements (not in this release)**:
- Schema validation (Zod schemas for app-specific structure)
- Size limits (prevent abuse with large JSON objects)
- Encryption for sensitive custom data
- Audit logging for data changes
- Bulk export/import for user data migration

---

## [4.5.4] - 2025-12-23

### Fixed - User Management UI Improvements

**Issue**: Several UX issues in the User Management layout prevented optimal workflow when multi-tenancy was enabled.

**Fixes Applied:**

1. **User Details Dialog Scrolling:**
   - Added `max-h-[80vh] overflow-y-auto` to User Details `DialogContent`
   - Users can now scroll to see all fields when dialog content is tall
   - Critical for viewing organization assignment and other fields below the fold

2. **Organization Assignment with Tree View:**
   - Added new action button in user table rows with Building2 icon
   - Button only appears when multi-tenancy is enabled (`multiTenancyEnabled = true`)
   - Opens dedicated dialog with:
     - "None" option to remove org assignment
     - TreeView component showing hierarchical organization structure
     - Cancel/Save buttons with loading state
   - Updated `OrgOption` type to include `parent_org_id` for tree building
   - Added `buildOrgTree()` helper function to convert flat org list to tree structure
   - Provides intuitive visual hierarchy for selecting user's organization

3. **Radix UI Select Fix:**
   - Changed "None" option from `value=""` to `value="__none__"`
   - Radix UI Select component does not support empty string values
   - Affected components:
     - Org select dropdown in user detail dialog
     - User type select in user detail dialog
     - Scope type select in RBAC test tool
   - Ensures consistent behavior across all Select components

**Files Modified:**
- `src/components/layouts/user_management/index.tsx` - Added org assignment button, tree dialog, fixed Select values
- `src/app/hazo_auth/scope_test/scope_test_page_client.tsx` - Fixed Select "None" value

**Impact**: Improves user experience when managing user accounts with multi-tenancy enabled. Organization assignment is now more intuitive with visual hierarchy, and dialog scrolling ensures all fields are accessible.

---

### ~~Fixed - Missing Organization Management Server Route Exports~~ [OBSOLETE - v5.0.0 removed org system]

**Issue**: The `OrgHierarchyTab` component in consuming apps would fail because the organization management API route handlers were not exported from `hazo_auth/server/routes`, causing a bug where consuming apps couldn't use the organization management features.

**Root Cause**: When the organization management feature was added, the route handlers in `src/app/api/hazo_auth/org_management/orgs/route.ts` were not re-exported through the `src/server/routes/` barrel export system, making them unavailable to consuming applications.

**Fix Applied:**

1. **Created new file**: `src/server/routes/org_management_orgs.ts`
   - Re-exports GET, POST, PATCH, DELETE handlers from the org management orgs route
   - Follows same pattern as other route exports (e.g., `user_management_users.ts`)

2. **Updated**: `src/server/routes/index.ts`
   - Added exports: `orgManagementOrgsGET`, `orgManagementOrgsPOST`, `orgManagementOrgsPATCH`, `orgManagementOrgsDELETE`
   - Added comment header: "// Organization management routes"

**Consumer Usage:**

Before fix (broken):
```typescript
// This would fail - exports didn't exist
export { GET, POST, PATCH, DELETE } from "hazo_auth/server/routes";
```

After fix (working):
```typescript
// app/api/hazo_auth/org_management/orgs/route.ts
export {
  orgManagementOrgsGET as GET,
  orgManagementOrgsPOST as POST,
  orgManagementOrgsPATCH as PATCH,
  orgManagementOrgsDELETE as DELETE
} from "hazo_auth/server/routes";
```

Or use CLI generator:
```bash
npx hazo_auth generate-routes
```

**Files Created:**
- `src/server/routes/org_management_orgs.ts` - Organization management route re-exports

**Files Modified:**
- `src/server/routes/index.ts` - Added org management exports

**Impact**: This fix enables consuming applications to properly use the `OrgHierarchyTab` component and organization management features without encountering module resolution errors.

---

### ~~Changed - HRBAC Scopes Connected to Organizations via Foreign Keys~~ [OBSOLETE - v5.0.0 removed org system]

**Major Architectural Change**: HRBAC scopes now use proper foreign key references to the `hazo_org` table instead of string-based organization identifiers.

**Why this change**: The previous string-based `org` field was a weak reference that didn't enforce referential integrity. Connecting scopes to organizations via UUID foreign keys provides proper relational database structure, enables cascading deletes, and ensures scopes are always associated with valid organizations. This change also enables permission-based org filtering for non-global admins, improving security and user experience.

**Key Changes:**

1. **Scope Tables Schema Updated:**
   - **Before**: Scopes had `org: TEXT` field (just a string label)
   - **After**: Scopes have `org_id: UUID` and `root_org_id: UUID` foreign keys
   - Foreign keys reference `hazo_org(id)` with proper cascade delete behavior
   - All scope tables (L1-L7) updated with new fields

2. **Removed `default_org` Configuration:**
   - Removed `default_org` setting from `[hazo_auth__scope_hierarchy]` section
   - Scope organization is now determined by user's `org_id` from authentication
   - Non-global admins automatically see only their organization's scopes

3. **Permission-Based Organization Filtering:**
   - **Non-global admins**: Automatically filtered to their own organization's scopes
   - **Global admins** (`hazo_org_global_admin` permission): Can manage any organization's scopes
   - API routes use `hazo_get_auth()` to determine user's org and filter accordingly

4. **API Route Changes:**
   ```typescript
   // Before: String-based org parameter
   GET /api/hazo_auth/scope_management/scopes?org=default&level=hazo_scopes_l1

   // After: UUID-based org_id parameter
   GET /api/hazo_auth/scope_management/scopes?org_id=abc-123-uuid&level=hazo_scopes_l1

   // Note: For non-global admins, org_id is ignored and user's own org is used
   ```

5. **Type Definitions Updated:**
   ```typescript
   // Before
   type ScopeRecord = {
     org: string;  // String identifier
     // ... other fields
   };

   // After
   type ScopeRecord = {
     org_id: string;       // UUID foreign key
     root_org_id: string;  // UUID for root org
     // ... other fields
   };
   ```

**Files Modified:**
1. `src/lib/services/scope_service.ts` - Updated types and CRUD operations
2. `src/lib/services/scope_labels_service.ts` - Updated `ScopeLabel` type
3. `src/lib/scope_hierarchy_config.server.ts` - Removed `default_org` config
4. `src/app/api/hazo_auth/scope_management/scopes/route.ts` - Added org filtering
5. `src/app/api/hazo_auth/scope_management/labels/route.ts` - Added org filtering
6. `src/components/layouts/user_management/components/scope_hierarchy_tab.tsx` - Updated to use org_id
7. `src/components/layouts/user_management/components/scope_labels_tab.tsx` - Updated to use org_id
8. `src/components/layouts/user_management/components/user_scopes_tab.tsx` - Updated types
9. `src/components/layouts/user_management/index.tsx` - Removed `defaultOrg` prop
10. `src/components/layouts/rbac_test/index.tsx` - Removed `defaultOrg` prop
11. `hazo_auth_config.ini` - Removed `default_org` setting

**Migration Required:**
- Database migration needed to add `org_id` and `root_org_id` columns to scope tables
- Existing scope data must be migrated to reference valid `hazo_org` records
- Migration script should match string `org` values to `hazo_org.name` or similar

**Configuration Changes:**
```ini
[hazo_auth__scope_hierarchy]
enable_hrbac = true
# default_org = my_organization  # REMOVED - no longer needed
scope_cache_ttl_minutes = 15
scope_cache_max_entries = 5000
# ... other settings
```

**Security Improvements:**
- Non-global admins cannot accidentally view/modify scopes from other organizations
- Scope access is automatically filtered based on user's organization
- Global admins explicitly granted via `hazo_org_global_admin` permission

**Breaking Changes for Consuming Applications:**
1. **API Parameter Change**: `org` parameter changed to `org_id` (UUID instead of string)
2. **Configuration Change**: Remove `default_org` setting from `hazo_auth_config.ini`
3. **Component Props**: `defaultOrg` prop removed from `UserManagementLayout` and `RbacTestLayout`
4. **Type Changes**: `ScopeRecord` and `CreateScopeData` types updated (TypeScript only)

**Backward Compatibility:**
- **Database schema**: Requires migration - old string `org` field no longer used
- **API contracts**: Breaking change - clients must use `org_id` instead of `org`
- **Configuration**: Breaking change - remove `default_org` setting

**Design Rationale:**
1. **Proper Foreign Keys**: Ensures referential integrity at database level
2. **Cascade Deletes**: Deleting organization automatically cleans up scopes
3. **Permission-Based Filtering**: Improves security by limiting scope visibility
4. **Automatic Org Detection**: User's org determined from authentication (no manual config)
5. **Global Admin Support**: Explicit permission for cross-org management

**Future Enhancements:**
- Support for cross-organizational scope hierarchies (if needed)
- Scope visibility controls (public/private scopes)
- Org-level scope inheritance rules

---

### Added - User Types (Optional Feature)

**Feature**: Configurable user type categorization with visual badge indicators for user classification and filtering.

**Why this addition**: Many applications need to categorize users beyond role-based permissions (e.g., "Client" vs "Tax Agent", "Internal" vs "External", "Premium" vs "Standard"). User types provide a simple, config-based way to tag and visually identify user categories without adding complexity to the RBAC system. This is particularly useful for applications managing multiple user personas or customer types.

**Core Features**:
- **Config-based types**: Define types in INI file (no database table management)
- **Single type per user**: Each user assigned exactly one type (mutually exclusive categories)
- **Visual badges**: Color-coded badges with preset colors (blue, green, red, yellow, purple, gray, orange, pink) or custom hex colors
- **UI integration**: Type column in User Management table, dropdown selector in user detail dialog
- **Default assignment**: New registrations can be auto-assigned a default type
- **Optional feature**: Disabled by default, zero impact when not used
- **Lightweight**: Single VARCHAR column, no joins or additional tables

**New Configuration** (`hazo_auth_config.ini`):
```ini
[hazo_auth__user_types]
# Enable user types feature (default: false)
enable_user_types = true

# Default type for new registrations (optional)
default_user_type = standard

# Define types: key:label:badge_color
# Colors: blue, green, red, yellow, purple, gray, orange, pink, or hex (#4CAF50)
user_type_1 = admin:Administrator:red
user_type_2 = standard:Standard User:blue
user_type_3 = client:Client:green
user_type_4 = agent:Tax Agent:orange
user_type_5 = premium:Premium User:#FFD700
```

**Configuration Format:**
- **Type Key**: Unique identifier stored in database (e.g., "client", "agent")
- **Label**: Display name shown in UI (e.g., "Client", "Tax Agent")
- **Badge Color**: Visual indicator color - preset name or hex code

**Database Changes** (Migration `007_add_user_type_to_hazo_users.sql`):
```sql
-- Add user_type column to hazo_users
ALTER TABLE hazo_users
ADD COLUMN user_type TEXT;

-- Optional: Create index for filtering
CREATE INDEX IF NOT EXISTS idx_hazo_users_user_type ON hazo_users(user_type);
```

Adds single `user_type` TEXT column to `hazo_users` table. No foreign key constraints - values validated against config at runtime.

**API Changes:**

1. **`/api/hazo_auth/me` Response (Enhanced)**:
   ```typescript
   {
     authenticated: true,
     // ... existing fields
     user_type: "client",        // NEW: User's type key (or null)
     user_type_info: {           // NEW: Type details (or null)
       key: "client",
       label: "Client",
       badge_color: "green"
     }
   }
   ```

2. **`/api/hazo_auth/user_management/users` GET Response**:
   ```typescript
   {
     users: [...],
     user_types_enabled: true,   // NEW: Whether feature is enabled
     available_user_types: [     // NEW: List of configured types
       { key: "admin", label: "Administrator", badge_color: "red" },
       { key: "client", label: "Client", badge_color: "green" }
     ]
   }
   ```

3. **`/api/hazo_auth/user_management/users` PATCH**:
   - Accepts `user_type` field in request body
   - Validates type key against config before saving
   - Returns updated user with `user_type_info`

4. **NEW `/api/hazo_auth/user_management/user_types` GET**:
   - Returns user types configuration
   - Response: `{ enabled: boolean, types: UserType[], default_type: string | null }`
   - Used by UserManagementLayout to fetch types for dropdown

**New Components:**

1. **`UserTypeBadge`** (`src/components/ui/user-type-badge.tsx`):
   - Display-only badge component
   - Props: `type` (key), `label`, `badge_color`, `variant` ("badge" | "text"), `className`
   - Supports preset colors and custom hex codes
   - Accessible with proper ARIA labels

   ```typescript
   import { UserTypeBadge } from "hazo_auth/components/ui/user-type-badge";

   <UserTypeBadge
     type="client"
     label="Client"
     badge_color="green"
     variant="badge"
   />
   ```

**Modified Components:**

1. **`UserManagementLayout`** (`src/components/layouts/user_management/index.tsx`):
   - Added "Type" column to users table (conditionally rendered when feature enabled)
   - Column displays `UserTypeBadge` with user's type
   - Added user type dropdown in user detail dialog (edit mode only)
   - Dropdown populated with `available_user_types` from API
   - Type changes saved via PATCH request
   - Props added: `userTypesEnabled: boolean`, `availableUserTypes: UserType[]`

2. **`UserManagementPage`** (Demo app):
   - Fetches user types config from `/api/hazo_auth/user_management/user_types`
   - Passes `userTypesEnabled` and `availableUserTypes` props to layout
   - Zero-config support maintained (props optional)

**New Services:**

1. **`user_types_config.server.ts`** (`src/lib/user_types_config.server.ts`):
   - `get_user_types_config()` - Read config from INI file with defaults
   - `is_user_types_enabled()` - Quick check if feature enabled
   - `get_default_user_type()` - Get default type for new registrations
   - `validate_user_type(type_key)` - Validate type key against config
   - `parse_user_type_entry(entry)` - Parse "key:label:color" format

   ```typescript
   export type UserType = {
     key: string;           // Unique identifier (e.g., "client")
     label: string;         // Display name (e.g., "Client")
     badge_color: string;   // Color preset or hex code
   };

   export type UserTypesConfig = {
     enable_user_types: boolean;
     default_user_type: string | null;
     user_types: UserType[];
   };
   ```

**Modified Services:**

1. **`registration_service.ts`**:
   - Sets `user_type` to `default_user_type` (if configured) for new registrations
   - Falls back to NULL if no default specified or feature disabled

2. **`user_management_service.ts`** (API route handler):
   - GET: Returns `user_types_enabled` and `available_user_types` in response
   - PATCH: Validates `user_type` against config before updating
   - Rejects invalid type keys with 400 error

**New API Route:**

**`/api/hazo_auth/user_management/user_types`** (GET):
```typescript
// Route handler
export { GET } from "hazo_auth/server/routes/user_types";

// Response
{
  enabled: true,
  types: [
    { key: "admin", label: "Administrator", badge_color: "red" },
    { key: "client", label: "Client", badge_color: "green" }
  ],
  default_type: "standard"
}
```

**Configuration Defaults** (`src/lib/config/default_config.ts`):
```typescript
export const DEFAULT_USER_TYPES: UserTypesConfig = {
  enable_user_types: false,  // Disabled by default
  default_user_type: null,   // No default type
  user_types: [],            // No types defined
};
```

**Usage Patterns:**

1. **Simple categorization**:
   ```ini
   [hazo_auth__user_types]
   enable_user_types = true
   default_user_type = standard
   user_type_1 = standard:Standard User:blue
   user_type_2 = premium:Premium User:yellow
   ```

2. **Client vs internal users**:
   ```ini
   [hazo_auth__user_types]
   enable_user_types = true
   default_user_type = client
   user_type_1 = client:Client:green
   user_type_2 = internal:Internal Staff:purple
   ```

3. **Tax accounting personas**:
   ```ini
   [hazo_auth__user_types]
   enable_user_types = true
   user_type_1 = client:Client:green
   user_type_2 = tax_agent:Tax Agent:orange
   user_type_3 = bookkeeper:Bookkeeper:blue
   user_type_4 = support:Support Staff:gray
   ```

4. **Custom hex colors**:
   ```ini
   [hazo_auth__user_types]
   enable_user_types = true
   user_type_1 = vip:VIP Client:#FFD700
   user_type_2 = standard:Standard:#4CAF50
   ```

**Files Created:**
1. `migrations/007_add_user_type_to_hazo_users.sql` - Database migration
2. `src/lib/user_types_config.server.ts` - Configuration loader
3. `src/components/ui/user-type-badge.tsx` - Badge component
4. `src/app/api/hazo_auth/user_management/user_types/route.ts` - Config API endpoint

**Files Modified:**
1. `src/lib/config/default_config.ts` - Added DEFAULT_USER_TYPES
2. `src/app/api/hazo_auth/user_management/users/route.ts` - Added user_type to GET/PATCH
3. `src/app/api/hazo_auth/me/route.ts` - Added user_type and user_type_info to response
4. `src/components/layouts/user_management/index.tsx` - Added type column and dialog dropdown
5. `src/lib/services/registration_service.ts` - Sets default user type on new registrations
6. `src/app/hazo_auth/user_management/page.tsx` - Passes userTypes props
7. `src/app/hazo_auth/user_management/user_management_page_client.tsx` - Forwards props
8. `hazo_auth_config.ini` - Added example [hazo_auth__user_types] section

**Design Rationale:**

1. **Config-based (not UI-managed)**:
   - Simple INI configuration vs complex CRUD UI
   - Types defined at deployment time, not runtime
   - Prevents user type proliferation
   - Easier to maintain consistent types across environments

2. **Single type per user**:
   - Mutually exclusive categories (not tags)
   - Clear user classification
   - Simpler UI (dropdown vs multi-select)
   - Avoids confusion about which type takes precedence

3. **Separate from RBAC**:
   - User types are categories, not permissions
   - Roles control what users can do
   - Types control how users are labeled/filtered
   - Example: A "Client" can have "Admin" role

4. **Optional feature**:
   - Zero impact when disabled
   - No breaking changes to existing setups
   - Single migration adds nullable column
   - UI automatically adapts

**Backward Compatibility:**
- User types feature is opt-in via `enable_user_types = true`
- Existing installations work unchanged (column is nullable)
- No breaking changes to existing API responses (new fields are additions)
- UserManagementLayout works with or without user types
- Migration safely adds nullable column with index

**Future Enhancements (not in this release):**
- Type-based filtering in User Management table
- Type-specific permissions or role defaults
- Bulk type assignment
- Type change audit logging

---

### Added - Authentication Page Navbar

**Feature**: Configurable navigation bar for all authentication pages in standalone layout mode.

**Why this addition**: Many applications need consistent branding across authentication pages. The navbar provides a professional, branded experience with company logo, name, and navigation links, making auth pages feel integrated with the main application rather than disconnected flows.

**Core Features**:
- **Logo Display**: Next.js Image-optimized logo with configurable dimensions
- **Company Branding**: Company name displayed next to logo, linking to home page
- **Home Link**: Optional "Home" link with icon on the right side
- **Automatic Vertical Centering**: Auth content automatically vertically centered when navbar is enabled
- **Customizable Styling**: Background color, text color, and height configurable via INI
- **Global or Per-Page Control**: Can be enabled/disabled globally or overridden per page
- **Smart Defaults**: Uses CSS variables for theming when custom colors not specified
- **Auto-Disabled for Dev Lock**: Navbar automatically disabled on dev lock pages

**New Configuration** (`hazo_auth_config.ini`):
```ini
[hazo_auth__navbar]
enable_navbar = true              # Enable navbar on auth pages
logo_path = /logo.png             # Path to logo image
logo_width = 32                   # Logo width in pixels
logo_height = 32                  # Logo height in pixels
company_name = My Company         # Company name (links to home_path)
home_path = /                     # URL for logo and company name link
home_label = Home                 # Label for home link
show_home_link = true             # Show "Home" link on right side
background_color =                # Custom background color (optional)
text_color =                      # Custom text color (optional)
height = 64                       # Navbar height in pixels
```

**UI Shell Integration**:
- Added `vertical_center` option to `[hazo_auth__ui_shell]` section
- When `vertical_center = auto`, content is vertically centered when navbar is present
- Works seamlessly with `layout_mode = standalone`

**New Components**:
- `AuthNavbar` - Client component for the navbar (in `src/components/layouts/shared/components/auth_navbar.tsx`)
- Exported via `hazo_auth/components/layouts/shared` barrel export

**Modified Components**:
- `StandaloneLayoutWrapper` - Added navbar slot and vertical centering logic
- `AuthPageShell` - Passes navbar configuration to wrapper, added `disableNavbar` prop

**New Services**:
- `navbar_config.server.ts` - Server-side config loader for navbar settings
- `get_navbar_config()` - Reads navbar configuration from INI file with defaults

**Modified Services**:
- `ui_shell_config.server.ts` - Now loads navbar config and vertical_center setting

**Configuration Defaults** (`src/lib/config/default_config.ts`):
- `DEFAULT_NAVBAR` - Default navbar configuration values
- `enable_navbar: true` by default for immediate branding out of the box

**Files Created**:
1. `src/lib/navbar_config.server.ts` - Navbar configuration loader
2. `src/components/layouts/shared/components/auth_navbar.tsx` - Navbar component

**Files Modified**:
1. `src/lib/config/default_config.ts` - Added DEFAULT_NAVBAR
2. `src/lib/ui_shell_config.server.ts` - Loads navbar config and vertical_center
3. `src/components/layouts/shared/components/standalone_layout_wrapper.tsx` - Navbar slot and centering
4. `src/components/layouts/shared/components/auth_page_shell.tsx` - Navbar config passing
5. `src/components/layouts/shared/index.ts` - Export AuthNavbar and AuthNavbarProps
6. `hazo_auth_config.ini` - Added [hazo_auth__navbar] section

**Usage**:

Zero-config (navbar appears automatically):
```typescript
import { LoginPage } from "hazo_auth/pages/login";
export default function Page() {
  return <LoginPage />; // Navbar shown if enabled in config
}
```

Custom navbar configuration:
```typescript
import { LoginLayout } from "hazo_auth/components/layouts/login";
export default function Page() {
  return (
    <LoginLayout
      navbar={{
        logo_path: "/custom-logo.svg",
        company_name: "Acme Corp",
        background_color: "#1a1a1a",
      }}
    />
  );
}
```

Disable navbar for specific page:
```typescript
import { LoginLayout } from "hazo_auth/components/layouts/login";
export default function Page() {
  return <LoginLayout navbar={{ enable_navbar: false }} />;
}
```

**Design Considerations**:
- Responsive design for mobile and desktop
- Accessibility with proper ARIA labels
- Theme support via CSS variables
- Performance optimization with Next.js Image
- Consistent branding across all auth pages

**Backward Compatibility**:
- Navbar is enabled by default but can be disabled via `enable_navbar = false`
- Existing auth pages work unchanged (navbar appears with default branding)
- No breaking changes to existing layouts or page components
- Props can override configuration for custom implementations

---

### Added - Google OAuth Sign-In

**Major Feature**: Complete Google OAuth authentication integration via NextAuth.js v4.

**Why this addition**: Many users prefer signing in with their existing Google accounts rather than creating new passwords. OAuth provides better security (no password to remember/leak) and faster onboarding. The implementation supports flexible authentication strategies - users can have Google-only, password-only, or both authentication methods.

**Core Features**:
- **Google Sign-In Button**: One-click authentication with Google accounts
- **Dual Authentication**: Users can link BOTH Google and email/password to the same account
- **Auto-Linking**: Automatically links Google login to existing unverified email/password accounts (configurable)
- **Profile Data Import**: Full name and profile picture automatically populated from Google profile
- **Email Verification**: Emails are auto-verified when signing in with Google
- **Set Password Feature**: Google-only users can add a password later via My Settings
- **Graceful Degradation**: Login page adapts based on enabled authentication methods (Google-only, email-only, or both)

**New Configuration** (`hazo_auth_config.ini`):
```ini
[hazo_auth__oauth]
enable_google = true                      # Enable Google OAuth (default: true)
enable_email_password = true              # Enable email/password login (default: true)
auto_link_unverified_accounts = true      # Auto-link to unverified accounts (default: true)
google_button_text = Continue with Google # Customize button text
oauth_divider_text = or                   # Divider text between OAuth and email/password
```

**New Environment Variables**:
- `NEXTAUTH_SECRET` - NextAuth.js session encryption key (required for OAuth)
- `NEXTAUTH_URL` - Base URL for OAuth callbacks
- `HAZO_AUTH_GOOGLE_CLIENT_ID` - Google OAuth client ID
- `HAZO_AUTH_GOOGLE_CLIENT_SECRET` - Google OAuth client secret

**Database Changes** (Migration `005_add_oauth_fields_to_hazo_users.sql`):
- Added `google_id` column - Google's unique user ID (TEXT, UNIQUE, indexed)
- Added `auth_providers` column - Tracks authentication methods: 'email', 'google', or 'email,google'
- Default value 'email' for existing users

**New Components**:
- `GoogleIcon` - Google logo SVG component
- `GoogleSignInButton` - Styled "Sign in with Google" button
- `OAuthDivider` - Divider with "or" text between OAuth and email/password sections
- `ConnectedAccountsSection` (My Settings) - Shows linked OAuth providers (Google, future providers)
- `SetPasswordSection` (My Settings) - Allows Google-only users to set a password

**Modified Components**:
- `LoginLayout` - Added Google Sign-In button and OAuth divider (conditionally rendered)
- `MySettingsLayout` - Added "Connected Accounts" and "Set Password" sections
- `ForgotPasswordLayout` - Special handling for Google-only users (shows "sign in with Google" message)

**New Services** (`src/lib/services/oauth_service.ts`):
- `handle_google_oauth_login(adapter, google_user, auto_link)` - Process Google OAuth login
  - Creates new user with Google profile data
  - Links to existing unverified email/password account (if enabled)
  - Returns user object with authentication info
- `link_google_account(adapter, user_id, google_id, google_profile)` - Link Google to existing account
- `set_user_password(adapter, user_id, password)` - Set password for Google-only users
- `get_user_oauth_status(adapter, user_id)` - Get user's OAuth connection status

**Modified Services**:
- `login_service.ts` - Handle login for users without passwords (Google-only users)
  - Check `password_hash IS NULL OR password_hash = ''` for Google-only accounts
  - Return appropriate error message
- `registration_service.ts` - Set `auth_providers='email'` for email/password registrations
- `password_reset_service.ts` - Check if user has password before allowing reset
  - Return `no_password_set: true` for Google-only users

**New Configuration Helpers** (`src/lib/oauth_config.server.ts`):
- `get_oauth_config()` - Read OAuth configuration from INI file
- `is_google_oauth_enabled()` - Quick check if Google OAuth is enabled
- `is_email_password_enabled()` - Quick check if email/password login is enabled

**NextAuth.js Integration** (`src/lib/auth/nextauth_config.ts`):
- Complete NextAuth.js v4 configuration with Google provider
- Custom callbacks for sign-in validation and session management
- Integration with hazo_auth's existing session system

**New API Routes**:
- `/api/auth/[...nextauth]` - NextAuth.js catch-all route (handles OAuth flows)
- `/api/hazo_auth/oauth/google/callback` - Custom callback to create hazo_auth session after OAuth
- `/api/hazo_auth/set_password` - API endpoint for Google-only users to set password

**API Response Changes**:
- `/api/hazo_auth/me` - Added OAuth status fields:
  - `auth_providers: string` - Tracks authentication methods ('email', 'google', or 'email,google')
  - `has_password: boolean` - Whether user has a password set
  - `google_connected: boolean` - Whether Google account is linked

**Password Validation Utility** (`src/lib/utils/password_validator.ts`):
- Validates password strength based on configuration requirements
- Returns detailed error messages for password validation failures
- Used by set password feature

**User Flows**:

1. **New User - Google Sign-In:**
   - Click "Sign in with Google" → Authenticate with Google → Account created with profile data → Auto-verified email

2. **Existing Unverified User - Auto-Link:**
   - User has email/password (unverified) → Sign in with Google (same email) → Accounts linked → Email verified → Can use either method

3. **Google-Only User Adds Password:**
   - Google-only user → My Settings → "Set Password" section → Set password → Can now use both methods

4. **Google-Only User Forgot Password:**
   - Try "Forgot Password" → System detects no password → Shows "Sign in with Google instead" message

**Dependencies**:
- Added `next-auth@^4.24.11` - NextAuth.js for OAuth handling

**Migration Path**:
1. Run migration: `npm run migrate migrations/005_add_oauth_fields_to_hazo_users.sql`
2. Add environment variables: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `HAZO_AUTH_GOOGLE_CLIENT_ID`, `HAZO_AUTH_GOOGLE_CLIENT_SECRET`
3. Configure OAuth in `hazo_auth_config.ini`: Add `[hazo_auth__oauth]` section
4. Create OAuth API routes (or use `npx hazo_auth generate-routes --oauth`)
5. Test: Visit login page and see Google Sign-In button

**Backward Compatibility**:
- OAuth is opt-in via configuration - existing apps work unchanged
- Existing users continue using email/password login
- No breaking changes to existing authentication flows
- Migration adds columns with default values (safe for existing data)

### Added
- **ProfileStamp Component**: New drop-in component for user attribution in notes, comments, and activity feeds
  - Displays circular profile picture with hover card showing user details
  - Three size variants: sm (24px), default (32px), lg (40px)
  - Customizable hover card with name, email, and custom fields
  - Loading state and unauthenticated fallback handling
  - Keyboard accessible with focus ring
  - Exported from `hazo_auth/client` for client component use
  - Test page at `/hazo_auth/profile_stamp_test` with interactive examples
  - **Why this addition**: Many applications need user attribution UI for comments, notes, activity feeds, and team member displays. ProfileStamp provides a ready-to-use component that integrates with hazo_auth's authentication system.

- **Profile Picture Aliases in /api/hazo_auth/me**: Enhanced API response for consuming app compatibility
  - Added `profile_image`, `avatar_url`, and `image` as aliases for `profile_picture_url`
  - Allows consuming applications to use their preferred field name
  - All aliases point to the same URL value
  - **Why this change**: Different applications use different naming conventions for profile pictures. Providing aliases improves interoperability without requiring consumers to modify their existing code.

- **HoverCard UI Component**: Added shadcn/ui hover card component using @radix-ui/react-hover-card
  - Provides accessible hover card UI primitive
  - Used by ProfileStamp component

### Changed
- **Roles Matrix UI Redesign**: Replaced horizontal data table matrix with tag-based UI for improved UX
  - Each role now displays permissions as inline tags/chips (max 4 visible, "+N more" for rest)
  - Added interactive Edit Permissions dialog with Select All/Unselect All buttons and scrollable permission list
  - Added expand/collapse for permission tags in read-only mode (clicking "+N more" expands inline)
  - **Why this change**: The horizontal data table was difficult to scan when many permissions existed. Tag-based UI provides better visual hierarchy and more efficient use of space.

### Fixed
- **RBAC Test Component**: Fixed permissions loading to correctly fetch user's role IDs first, then filter roles with permissions
- **RBAC Test Component**: Fixed scopes loading by adding `&include_effective=true` to fetch URL to retrieve `direct_scopes` field
- **RBAC Test API Route**: Fixed `users_service.read()` call to use correct hazo_connect API method `findBy()`
- **RBAC Test API Route**: Fixed `check_user_scope_access` function call - was passing an object instead of individual parameters
- **Tree View Component**: Fixed nested button hydration error by changing `AccordionTrigger` to use `<div role="button">` instead of `<button>` to allow action buttons inside, added keyboard accessibility (tabIndex, onKeyDown for Enter/Space)

## [3.0.4] - 2025-12-08

### Fixed
- Installation and import issues resolved
- Package exports configuration improvements

## [3.0.3] - 2025-12-08

### Fixed
- Import path issues for component exports
- Build configuration for TypeScript compilation

## [3.0.2] - 2025-12-08

### Fixed
- Build errors and TypeScript compilation issues
- Package structure for proper module resolution

## [3.0.1] - 2025-12-08

### Fixed
- Build errors related to TypeScript configuration
- Module export paths

## [3.0.0] - 2025-12-08

### Added - Hierarchical Role-Based Access Control (HRBAC)

**⚠️ NOTE**: This entry describes the original HRBAC implementation with string-based `org` fields. See the **[Unreleased] → Changed - HRBAC Scopes Connected to Organizations via Foreign Keys** section above for the updated architecture using UUID foreign keys.

**Major Feature**: Comprehensive HRBAC system with 7-level scope hierarchy for enterprise-grade access control.

**Why this change**: Many enterprise applications require organizational hierarchy-based access control (e.g., Company → Division → Department → Team). The standard RBAC model with permissions only doesn't support "users assigned to higher-level scopes automatically have access to all descendant scopes." HRBAC fills this gap by adding hierarchical scope management with automatic inheritance.

**Core HRBAC Features**:
- **7-Level Scope Hierarchy** (`hazo_scopes_l1` through `hazo_scopes_l7`)
  - L1: Top level (e.g., Company) - root nodes with no parent
  - L2-L7: Hierarchical levels (e.g., Division, Department, Team, Project, Sub-project, Task)
  - Each level (except L1) has `parent_scope_id` linking to parent level
  - Database CASCADE DELETE ensures referential integrity when deleting parent scopes

- **User Scope Assignments** (`hazo_user_scopes` table)
  - Users can be assigned to any scope at any level
  - Assignments stored with `scope_type`, `scope_id`, and `scope_seq` (human-readable ID)
  - Composite primary key: `(user_id, scope_type, scope_id)`

- **Customizable Labels** (`hazo_scope_labels` table)
  - Organizations can customize labels for each scope level
  - Example: "Company", "Division", "Department" instead of generic "Level 1", "Level 2", "Level 3"
  - Unique constraint per organization and scope type

- **Automatic Access Inheritance**
  - Users assigned to L2 automatically have access to all L3, L4, L5, L6, L7 under that L2 scope
  - Access checking uses ancestor traversal for inherited permissions
  - Direct assignments take precedence over inherited access

**New Services**:
- `scope_service.ts` - CRUD operations for scopes at all levels
  - `get_scopes_by_level()` - Retrieve scopes by level and organization
  - `get_scope_by_id()` / `get_scope_by_seq()` - Single scope lookup
  - `create_scope()` - Create new scope with parent validation
  - `update_scope()` / `delete_scope()` - Modify/remove scopes (cascades to children)
  - `get_scope_children()` / `get_scope_ancestors()` / `get_scope_descendants()` - Hierarchy navigation
  - `get_scope_tree()` - Build nested tree structure for UI display
  - Helper functions: `is_valid_scope_level()`, `get_parent_level()`, `get_child_level()`

- `scope_labels_service.ts` - Manage custom labels per organization
  - `get_scope_labels()` - Retrieve all labels for an organization
  - `get_scope_labels_with_defaults()` - Labels with fallback to defaults
  - `get_label_for_level()` - Single label lookup
  - `upsert_scope_label()` - Create or update label (upsert pattern)
  - `batch_upsert_scope_labels()` - Bulk save labels from UI
  - `delete_scope_label()` - Revert to default label

- `user_scope_service.ts` - User scope assignments and access checking
  - `get_user_scopes()` - All scope assignments for a user
  - `get_users_by_scope()` - All users assigned to a specific scope
  - `assign_user_scope()` / `remove_user_scope()` - Manage assignments
  - `update_user_scopes()` - Bulk replace all assignments
  - `check_user_scope_access()` - **Core access checking with inheritance**
    - Checks direct assignment OR ancestor-based access
    - Returns `access_via` showing which scope granted access
  - `get_user_effective_scopes()` - Calculate all scopes user can access (direct + inherited)

**Caching**:
- `scope_cache.ts` - LRU cache for scope lookups (default: 5000 entries, 15min TTL)
  - Reduces database queries for repeated scope access checks
  - Smart invalidation using cache versions per scope
  - Methods: `get()`, `set()`, `invalidate_user()`, `invalidate_by_scope()`, `invalidate_by_scope_level()`, `invalidate_all()`
  - Configurable via `[hazo_auth__scope_hierarchy]` section

**Configuration** (`hazo_auth_config.ini`) - **OBSOLETE - See [Unreleased] section for current config**:
```ini
[hazo_auth__scope_hierarchy]
enable_hrbac = true                      # Enable HRBAC features
default_org = my_organization            # REMOVED - No longer used
scope_cache_ttl_minutes = 15             # Cache TTL
scope_cache_max_entries = 5000           # Cache size limit
default_label_l1 = Company               # Customizable default labels
default_label_l2 = Division
default_label_l3 = Department
default_label_l4 = Team
default_label_l5 = Project
default_label_l6 = Sub-project
default_label_l7 = Task
```

**Configuration Helper**:
- `scope_hierarchy_config.server.ts` - Load and parse HRBAC configuration
  - `get_scope_hierarchy_config()` - Complete config object
  - `is_hrbac_enabled()` - Quick enable check
  - `get_default_org()` - **REMOVED** - No longer used
  - `get_default_label(level)` - Default label for a level

**Database Changes**:
- Migration `004_add_parent_scope_to_scope_tables.sql`
  - Adds `parent_scope_id` column to L2-L7 scope tables
  - Creates foreign key constraints with CASCADE DELETE
  - Creates indexes on `parent_scope_id` for efficient hierarchy queries
  - Supports both PostgreSQL and SQLite

**hazo_get_auth Integration**:
Extended `hazo_get_auth()` to support scope-based access control:
```typescript
const result = await hazo_get_auth(request, {
  required_permissions: ['view_reports'],
  scope_type: 'hazo_scopes_l3',    // Check access to Level 3 scope
  scope_id: 'uuid-of-scope',        // or use scope_seq
  scope_seq: 'L3_001',
  strict: true,                     // Throws ScopeAccessError if denied
});

if (result.scope_ok) {
  // Access granted via: result.scope_access_via
}
```

**New UI Components**:
- `scope_hierarchy_tab.tsx` - Manage scope hierarchy with tree view
  - Create, edit, delete scopes at each level
  - Visual tree structure showing parent-child relationships
  - Requires `admin_scope_hierarchy_management` permission

- `scope_labels_tab.tsx` - Customize scope level labels
  - Edit labels for all 7 levels per organization
  - Preview with sample scope names
  - Requires `admin_scope_hierarchy_management` permission

- `user_scopes_tab.tsx` - Assign scopes to users
  - User selection dropdown
  - Multi-select scope assignment
  - Display current assignments and effective access
  - Requires `admin_user_scope_assignment` permission

- `rbac_test_layout.tsx` - RBAC/HRBAC testing tool
  - Test permissions and scope access for any user
  - Select user, test permissions, test scope access
  - Clear pass/fail indicators with detailed access info
  - Requires `admin_test_access` permission

**New UI Primitives**:
- `select.tsx` - Dropdown select component (shadcn/ui)
- `tree-view.tsx` - Tree view component for hierarchical data

**New API Routes**:
- `/api/hazo_auth/scope_management/*` - Scope CRUD operations
  - GET/POST/PUT/DELETE endpoints for scope management
  - Tree structure retrieval for UI

- `/api/hazo_auth/user_management/users/scopes` - User scope assignments
  - GET: Retrieve user's scope assignments
  - POST: Assign scope to user
  - PUT: Bulk update user scopes

- `/api/hazo_auth/rbac_test` - Test endpoint for RBAC/HRBAC
  - POST: Test permissions and scope access for specified user
  - Requires `admin_test_access` permission

**New Permissions**:
- `admin_scope_hierarchy_management` - Manage scopes and scope labels
- `admin_user_scope_assignment` - Assign scopes to users
- `admin_test_access` - Access the RBAC/HRBAC test tool

Add to `application_permission_list_defaults`:
```ini
[hazo_auth__user_management]
application_permission_list_defaults = admin_user_management,admin_role_management,admin_permission_management,admin_scope_hierarchy_management,admin_user_scope_assignment,admin_test_access
```

**Database Tables**:
- `hazo_scopes_l1` through `hazo_scopes_l7` - Scope tables (L2-L7 have `parent_scope_id`)
- `hazo_user_scopes` - User-scope assignments (composite PK: user_id, scope_type, scope_id)
- `hazo_scope_labels` - Custom labels per organization (UNIQUE: org, scope_type)
- `hazo_enum_scope_types` - Enum type for scope level validation (PostgreSQL only)

**Integration with User Management**:
When HRBAC is enabled and user has appropriate permissions, three new tabs appear in `UserManagementLayout`:
- **Scope Hierarchy** - Manage scope structure
- **Scope Labels** - Customize labels
- **User Scopes** - Assign scopes to users

**Testing**:
- New test files in `__tests__/auth/`, `__tests__/integration/`, `__tests__/services/`
- RBAC test page at `/hazo_auth/rbac_test` for interactive testing
- Scope test page at `/hazo_auth/scope_test` for scope access verification

**Migration Path**:
1. Run migration `004_add_parent_scope_to_scope_tables.sql` to add `parent_scope_id` columns
2. Create HRBAC tables using scripts in `SETUP_CHECKLIST.md` (9 new tables)
3. Enable in config: `[hazo_auth__scope_hierarchy] enable_hrbac = true`
4. Add new permissions to `application_permission_list_defaults`
5. Run `npm run init-users` to create permissions and assign to super user

### Changed
- `hazo_get_auth()` now accepts optional scope parameters for HRBAC access checking
- `auth_types.ts` - Added scope-related types: `ScopeOptions`, `ScopeAccessError`
- User Management layout automatically shows/hides HRBAC tabs based on configuration and permissions

### Technical Details
- **Scope Inheritance Algorithm**: When checking access, the system first checks for direct assignment, then traverses ancestors up to L1 using `get_scope_ancestors()`. This ensures O(log n) lookup time for hierarchical access.
- **Cache Strategy**: LRU cache with TTL and version-based invalidation. When a scope assignment changes, only affected users are invalidated (smart invalidation).
- **Database Performance**: All parent_scope_id columns are indexed for efficient ancestor/descendant queries. Cascade deletes ensure referential integrity without manual cleanup.
- **Type Safety**: TypeScript enums and type guards (`is_valid_scope_level()`) prevent invalid scope level usage at compile time and runtime.

---

## [2.x.x] - Previous Versions

### Features from v2.0
- Zero-config Server Components for authentication pages
- JWT Session Tokens for Edge-compatible authentication
- Standardized `/api/hazo_auth/me` endpoint
- ProfilePicMenu sidebar variant
- User Management layout with role and permission management

### Features from v1.x
- Initial authentication flows (login, register, forgot password, reset password, email verification)
- Role-Based Access Control (RBAC)
- Profile picture management with Gravatar integration
- My Settings page for user profile management
- Two-factor authentication preparation (MFA secret storage)

---

## Migration Notes

### Upgrading to 3.0.0 (HRBAC)

**Required Steps**:
1. **Database Migration**: Run `004_add_parent_scope_to_scope_tables.sql`
2. **Create HRBAC Tables**: Run scripts from `SETUP_CHECKLIST.md` Phase 7
3. **Configuration**: Add `[hazo_auth__scope_hierarchy]` section to `hazo_auth_config.ini`
4. **Permissions**: Add new permissions (`admin_scope_hierarchy_management`, `admin_user_scope_assignment`, `admin_test_access`) to defaults

**Optional Steps**:
- Customize default labels for scope levels in config
- Set `default_org` for single-tenant applications
- Adjust cache settings (`scope_cache_ttl_minutes`, `scope_cache_max_entries`)

**Backward Compatibility**:
- HRBAC is opt-in via `enable_hrbac = true` - existing apps work unchanged
- Standard RBAC continues to work without modification
- No breaking changes to existing authentication APIs
- Existing database schema unchanged (only additions)

**Breaking Changes**: None - all changes are additive and opt-in.

---

## Support

For issues, questions, or feature requests related to HRBAC or any other features, please refer to:
- Documentation: `CLAUDE.md`, `README.md`, `TECHDOC.md`
- Setup Guide: `SETUP_CHECKLIST.md`
- Migration Guide: `MIGRATION.md` (if upgrading from v1.x to v2.x)

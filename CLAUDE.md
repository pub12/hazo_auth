# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Context

This is the `hazo_auth` package within the hazo ecosystem monorepo. For general monorepo conventions (naming, build patterns, dependencies), see the parent `CLAUDE.md` file.

## Build Commands

```bash
# Development
npm run dev              # Next.js dev server with demo pages (http://localhost:3000)
npm run storybook        # Component development (http://localhost:6006)

# Building
npm run build:pkg        # Build package for distribution (outputs to dist/)
npm run build            # Next.js build (for testing demo app)

# Testing
npm test                 # Run Jest tests
npm run test:watch       # Run tests in watch mode

# Database Operations
npm run init-users       # Initialize default permissions and super user
npm run migrate          # Apply database migration (usage: npm run migrate [file.sql])

# CLI Tools
npm run validate         # Validate project setup
npm run generate-routes  # Generate API route files
```

## Architecture Overview

### Entry Points

The package exports through multiple entry points for separation of concerns:

- **`src/index.ts`** - Main server-side entry (includes Node.js dependencies)
- **`src/client.ts`** - Client-safe exports (no Node.js modules, for browser use)
- **`src/server/index.ts`** - Express server bootstrap (for standalone server mode)
- **`src/cli/index.ts`** - CLI entry point (`npx hazo_auth` commands)

### Key Export Paths (package.json)

```typescript
// Server-side (API routes, Server Components)
import { hazo_get_auth } from "hazo_auth";
import { LoginLayout } from "hazo_auth/components/layouts/login";

// Client-side (Client Components)
import { ProfilePicMenu, ProfileStamp, use_auth_status } from "hazo_auth/client";

// Page components (zero-config)
import { LoginPage } from "hazo_auth/pages/login";

// Server utilities
import { validate_session_cookie } from "hazo_auth/server/middleware";

// API route handlers
export { POST } from "hazo_auth/server/routes";
```

### Authentication Flow Architecture

1. **Login Flow (Email/Password):**
   - Client submits credentials → `/api/hazo_auth/login` (POST)
   - Server validates via Argon2, creates JWT session token
   - Sets cookies: `hazo_auth_user_id`, `hazo_auth_user_email`, `hazo_auth_session` (JWT)
   - Returns user data or redirects

2. **Login Flow (Google OAuth):**
   - Client clicks "Sign in with Google" button
   - NextAuth.js handles OAuth flow → `/api/auth/signin/google`
   - Google authentication → callback to `/api/auth/callback/google`
   - Custom callback handler (`/api/hazo_auth/oauth/google/callback`) creates hazo_auth session
   - Auto-links to existing unverified email/password accounts (configurable)
   - Sets same cookies as email/password login for unified session management

3. **Authorization Check (Server-side):**
   - API route calls `hazo_get_auth(request, { required_permissions: ['admin'] })`
   - Function validates JWT session token OR queries database for user + permissions
   - Returns `HazoAuthResult` with user, permissions, and `permission_ok` flag
   - Uses LRU cache (15min TTL) to reduce database load

4. **Authorization Check (Client-side):**
   - Component uses `use_hazo_auth()` hook
   - Hook fetches from `/api/hazo_auth/me` (standardized endpoint)
   - Returns authentication status and permissions

5. **Edge Runtime (Middleware/Proxy):**
   - Use `validate_session_cookie(request)` - validates JWT without database
   - Fast signature verification for route protection
   - Falls back to simple cookie check if JWT unavailable

### Configuration System

All configuration comes from `hazo_auth_config.ini` in the project root (where `process.cwd()` points):

- **UI Customization:** `[hazo_auth__login_layout]`, `[hazo_auth__register_layout]`, etc.
- **UI Shell:** `[hazo_auth__ui_shell]` (layout_mode, vertical_center)
- **Navbar:** `[hazo_auth__navbar]` (enable_navbar, logo, company name, home link, styling)
- **Auth Behavior:** `[hazo_auth__tokens]`, `[hazo_auth__password_requirements]`
- **OAuth Settings:** `[hazo_auth__oauth]` (enable_google, enable_email_password, auto_link_unverified_accounts, button text)
- **RBAC Setup:** `[hazo_auth__user_management]`, `[hazo_auth__initial_setup]`
- **Email Settings:** `[hazo_auth__email]` (templates, from_email, base_url)
- **Profile Pictures:** `[hazo_auth__profile_picture]` (upload path, priorities)
- **Multi-Tenancy:** `[hazo_auth__multi_tenancy]` (enable, cache settings, user limits)

Configuration is loaded via `hazo_config` package and cached at runtime.

### Database Schema

**Core tables:**
- `hazo_users` - User accounts (id, email_address, password_hash, profile fields, google_id, auth_providers, user_type, org_id, app_user_data)
- `hazo_refresh_tokens` - Token storage (password reset, email verification)
- `hazo_roles` - Role definitions
- `hazo_permissions` - Permission definitions
- `hazo_user_roles` - User-role junction table
- `hazo_role_permissions` - Role-permission junction table

**Multi-tenancy tables:**
- `hazo_org` - Organization definitions (id, name, parent_org_id, root_org_id, user_limit, active, audit fields)

**HRBAC tables (optional):**
- `hazo_scopes_l1` through `hazo_scopes_l7` - Hierarchical scope levels
- `hazo_user_scopes` - User-scope assignments
- `hazo_scope_labels` - Custom labels for scope levels per organization
- `hazo_enum_scope_types` - Enum for scope type validation

**Migration Pattern:**
```bash
npm run migrate migrations/003_add_url_on_logon_to_hazo_users.sql
```

Migrations are executed via `scripts/apply_migration.ts` which supports both SQLite and PostgREST.

### Hierarchical Role-Based Access Control (HRBAC)

HRBAC extends the standard RBAC model with 7 hierarchical scope levels (L1-L7). Users assigned to a higher-level scope automatically inherit access to all descendant scopes.

**Architecture:**
- Scope tables have `org_id` and `root_org_id` foreign keys referencing `hazo_org` table
- Scope tables use `parent_scope_id` to establish hierarchy (L2 references L1, L3 references L2, etc.)
- User scope assignments in `hazo_user_scopes` table
- Access checking uses ancestor traversal for inherited access
- LRU cache for scope lookups (configurable TTL and size)
- Multi-tenancy must be enabled to use HRBAC

**Configuration:**
```ini
[hazo_auth__scope_hierarchy]
enable_hrbac = true
scope_cache_ttl_minutes = 15
scope_cache_max_entries = 5000
default_label_l1 = Company
default_label_l2 = Division
default_label_l3 = Department
# ... through l7
```

**Using hazo_get_auth with scope options:**
```typescript
const result = await hazo_get_auth(request, {
  required_permissions: ['view_reports'],
  scope_type: 'hazo_scopes_l3',
  scope_id: 'uuid-of-scope',  // or use scope_seq
  scope_seq: 'L3_001',
  strict: true,  // throws ScopeAccessError if denied
});

if (result.scope_ok) {
  // Access granted via: result.scope_access_via
}
```

**Services:**
- `src/lib/services/scope_service.ts` - CRUD operations for scopes
- `src/lib/services/scope_labels_service.ts` - Custom labels per organization
- `src/lib/services/user_scope_service.ts` - User scope assignments and access checking
- `src/lib/auth/scope_cache.ts` - LRU cache for scope lookups

### Multi-Tenancy (Organization Hierarchy)

Multi-tenancy enables hierarchical organization structures for company-wide access control. Organizations can have parent-child relationships, forming a tree structure.

**Architecture:**
- User limit enforcement at root organization level only
- Soft delete pattern (sets `active = false`, never deletes)
- LRU cache for org lookups (configurable TTL and size)
- `hazo_get_auth` returns org info when multi-tenancy is enabled

**Configuration:**
```ini
[hazo_auth__multi_tenancy]
enable_multi_tenancy = true
org_cache_ttl_minutes = 15
org_cache_max_entries = 1000
default_user_limit = 0
```

**Using hazo_get_auth with multi-tenancy:**
```typescript
const result = await hazo_get_auth(request, {
  required_permissions: ['view_data'],
});

if (result.authenticated) {
  result.user.org_id;           // User's direct org ID
  result.user.org_name;         // User's direct org name
  result.user.parent_org_id;    // Parent org ID (if any)
  result.user.parent_org_name;  // Parent org name
  result.user.root_org_id;      // Root org ID
  result.user.root_org_name;    // Root org name
}

// Require org assignment for specific routes
const auth = await hazo_get_auth(request, { require_org: true });
// Throws OrgRequiredError if user has no org_id
```

**API Endpoints:**
- `GET /api/hazo_auth/org_management/orgs` - List organizations (with `action=tree` for hierarchy)
- `POST /api/hazo_auth/org_management/orgs` - Create organization
- `PATCH /api/hazo_auth/org_management/orgs` - Update organization
- `DELETE /api/hazo_auth/org_management/orgs?org_id=...` - Soft delete (deactivate)

**Services:**
- `src/lib/services/org_service.ts` - CRUD operations for organizations
- `src/lib/auth/org_cache.ts` - LRU cache for org lookups
- `src/lib/multi_tenancy_config.server.ts` - Configuration loader

**Components:**
- `OrgHierarchyTab` - TreeView component for org management (in user_management)
- `OrgManagementLayout` - Standalone layout for org management
- `OrgManagementPage` - Zero-config page component

**User Management UI Features (when multi-tenancy enabled):**
- Organization Assignment Button with TreeView dialog
- User Details Dialog with scrollable content (`max-h-[80vh] overflow-y-auto`)
- Select components use `value="__none__"` for "None" options (Radix UI requirement)

### User Types (Optional Feature)

User types allow applications to categorize users with customizable types (e.g., "Client", "Tax Agent", "Support Staff") with visual badge indicators. Disabled by default.

**Key Features:**
- Define types in INI config (no database table management required)
- Single type per user (mutually exclusive)
- Visual badge with preset or custom hex colors
- Displayed as column in User Management table
- Default type can be auto-assigned on registration

**Configuration:**
```ini
[hazo_auth__user_types]
enable_user_types = true
default_user_type = standard

# Define types: key:label:badge_color
# Colors: blue, green, red, yellow, purple, gray, orange, pink, or hex (#4CAF50)
user_type_1 = admin:Administrator:red
user_type_2 = standard:Standard User:blue
user_type_3 = client:Client:green
```

**Components:**
- `UserTypeBadge` (`src/components/ui/user-type-badge.tsx`) - Display badge component

**Services:**
- `src/lib/user_types_config.server.ts` - Configuration loader and validation

### App User Data (Custom Application Data)

A flexible JSON field `app_user_data` allows consuming applications to store custom user-specific data without requiring schema changes. Data is stored as TEXT (JSON string) in the `hazo_users` table.

**Features:**
- Returned in `hazo_get_auth` user object and `/api/hazo_auth/me` response
- PATCH (merge) and PUT (replace) modes for updates
- Deep merge for nested objects, arrays are replaced
- Cache invalidation on updates

**API Endpoints:**
- `GET /api/hazo_auth/app_user_data` - Get current data
- `PATCH /api/hazo_auth/app_user_data` - Merge with existing data
- `PUT /api/hazo_auth/app_user_data` - Replace entirely
- `DELETE /api/hazo_auth/app_user_data` - Clear (set to null)

**Usage in hazo_get_auth:**
```typescript
const result = await hazo_get_auth(request);
if (result.authenticated) {
  const customData = result.user.app_user_data;
  // { preferences: { theme: "dark" }, ... }
}
```

**Service Functions:**
```typescript
import { get_app_user_data, update_app_user_data, clear_app_user_data } from "hazo_auth";

// Get data
const result = await get_app_user_data(adapter, user_id);

// Merge data
await update_app_user_data(adapter, user_id, { newKey: "value" }, { merge: true });

// Replace data
await update_app_user_data(adapter, user_id, { entireData: "here" }, { merge: false });

// Clear data
await clear_app_user_data(adapter, user_id);
```

**Route Handlers for Consuming Apps:**
```typescript
// app/api/hazo_auth/app_user_data/route.ts
export {
  appUserDataGET as GET,
  appUserDataPATCH as PATCH,
  appUserDataPUT as PUT,
  appUserDataDELETE as DELETE
} from "hazo_auth/server/routes";
```

**Test Page:** Visit `/hazo_auth/app_user_data_test` to test the functionality.

### Google OAuth Integration

hazo_auth supports Google Sign-In via NextAuth.js v4:
- Dual authentication: Users can have BOTH Google OAuth and email/password login
- Auto-linking: Automatically links Google login to existing unverified email/password accounts (configurable)
- Set password feature: Google-only users can add a password later via My Settings

**Configuration:**
```ini
[hazo_auth__oauth]
enable_google = true
enable_email_password = true
auto_link_unverified_accounts = true
google_button_text = Continue with Google
```

**Key Services:**
- `src/lib/oauth_config.server.ts` - OAuth configuration loader
- `src/lib/services/oauth_service.ts` - OAuth business logic (handle_google_oauth_login, link_google_account, set_user_password)
- `src/lib/auth/nextauth_config.ts` - NextAuth.js configuration

**API Endpoints:**
- `GET /api/auth/signin/google` - Initiates Google OAuth flow (NextAuth.js)
- `GET /api/hazo_auth/oauth/google/callback` - Creates hazo_auth session after OAuth
- `POST /api/hazo_auth/set_password` - Allows Google-only users to set a password

### Component Architecture

Components follow a layered structure:

1. **Layouts** (`src/components/layouts/*`) - Full-featured page layouts with business logic
   - Example: `LoginLayout`, `RegisterLayout`, `MySettingsLayout`, `RbacTestLayout`
   - Accept configuration props for customization
   - Use hooks for form state and API communication

2. **Page Components** (`src/page_components/*`) - Zero-config wrappers
   - Example: `LoginPage`, `RegisterPage`
   - Load configuration from INI files
   - Wrap layouts with sensible defaults

3. **Shared Components** (`src/components/layouts/shared/*`) - Reusable UI elements
   - Example: `ProfilePicMenu`, `ProfileStamp`, `FormActionButtons`, `PasswordField`, `AuthNavbar`
   - Exported via barrel file for clean imports

4. **UI Primitives** (`src/components/ui/*`) - shadcn/ui components
   - Low-level components (Button, Input, Dialog, etc.)
   - Not exposed in package exports

### File Naming Patterns

- `*.server.ts` - Server-only code (uses Node.js APIs, database access)
- `*.edge.ts` - Edge Runtime compatible (no Node.js APIs)
- `*_config.ts` - Configuration loaders
- `*_service.ts` - Business logic services
- `use_*.ts` - React hooks (client-side)
- `*_types.ts` - TypeScript type definitions

## Critical Workflows

### Adding a New Authentication Feature

1. Create service function in `src/lib/services/`
2. Add API route in `src/app/api/hazo_auth/[feature]/route.ts`
3. Export route handler from `src/server/routes/` (if needed)
4. Create layout component in `src/components/layouts/[feature]/`
5. Create page component in `src/page_components/[feature].tsx`
6. Add configuration section to `hazo_auth_config.ini`
7. Update `package.json` exports field
8. Test with Storybook
9. Run `npm run build:pkg`

### Testing Authentication Changes

1. Start dev server: `npm run dev`
2. Visit demo pages at `/hazo_auth/login`, `/hazo_auth/register`, etc.
3. Use SQLite admin UI (if enabled): `/hazo_connect/sqlite_admin`
4. Test ProfileStamp component: `/hazo_auth/profile_stamp_test`
5. Test organization management: `/hazo_auth/org_management`
6. Test app_user_data: `/hazo_auth/app_user_data_test`
7. Test with Storybook: `npm run storybook`
8. Run unit tests: `npm test`

### Working with hazo_connect

The package uses `hazo_connect` for all database operations:

```typescript
import { get_hazo_connect_instance } from "../hazo_connect_instance.server";
import { createCrudService } from "hazo_connect/server";

const hazoConnect = get_hazo_connect_instance();
const users_service = createCrudService(hazoConnect, "hazo_users");

// Query example
const users = await users_service.read({
  filters: [{ field: "email_address", operator: "eq", value: email }],
  select: ["id", "email_address", "password_hash"],
});
```

The singleton instance (`get_hazo_connect_instance()`) is configured via `hazo_auth_config.ini`:
- `[hazo_connect] type = sqlite` or `postgrest`
- Environment variables for connection strings

### CLI Command Implementation

CLI commands are in `src/cli/`:
- `init.ts` - Initialize project structure
- `generate.ts` - Generate route files
- `validate.ts` - Validate setup

Entry point is `src/cli/index.ts`, which uses `commander` for argument parsing.

### JWT Session Token System

**Generation** (`src/lib/services/session_token_service.ts`):
- Login creates JWT with user_id, email, issued_at, expires_at
- Signed with `JWT_SECRET` (env var)
- 30-day expiry (configurable)
- Stored in `hazo_auth_session` cookie

**Validation**:
- **Server Routes:** Use `validate_session_token(token)` - verifies signature + expiry
- **Edge Runtime:** Use `validate_session_cookie(request)` - Edge-compatible validation
- Both use `jose` library (Edge Runtime compatible)

### Rate Limiting & Caching

**hazo_get_auth** implements:
- LRU cache (10,000 users, 15min TTL)
- Per-user rate limiting (100 req/min)
- Per-IP rate limiting (200 req/min for unauthenticated)

Configuration in `[hazo_auth__auth_utility]` section.

Cache invalidation endpoint: `POST /api/hazo_auth/invalidate_cache`

## Package Structure Reference

```
src/
├── app/                      # Next.js demo app
│   ├── api/hazo_auth/        # Demo API routes
│   └── hazo_auth/            # Demo pages
├── cli/                      # CLI commands (npx hazo_auth)
├── components/
│   ├── layouts/              # Layout components
│   │   ├── login/
│   │   ├── register/
│   │   ├── my_settings/
│   │   ├── user_management/
│   │   ├── rbac_test/        # RBAC/HRBAC test tool
│   │   └── shared/           # Shared components & hooks
│   └── ui/                   # shadcn/ui primitives
├── lib/
│   ├── auth/                 # Authentication utilities
│   │   ├── hazo_get_auth.server.ts      # Main auth function
│   │   ├── session_token_validator.edge.ts  # Edge validation
│   │   ├── auth_cache.ts                # LRU cache
│   │   └── auth_rate_limiter.ts         # Rate limiting
│   ├── services/             # Business logic services
│   └── config/               # Configuration loaders
├── server/
│   ├── routes/               # Exportable route handlers
│   ├── middleware.ts         # Middleware utilities
│   └── index.ts              # Express server bootstrap
├── page_components/          # Zero-config page wrappers
├── index.ts                  # Main entry (server-side)
└── client.ts                 # Client-safe entry
```

## Environment Variables

**Required:**
- `JWT_SECRET` - JWT signing key (min 32 chars) - **CRITICAL for JWT session tokens**
- `ZEPTOMAIL_API_KEY` - Email service API key (for password reset, verification emails)

**Required for OAuth:**
- `NEXTAUTH_SECRET` - NextAuth.js secret for session encryption (min 32 chars)
- `NEXTAUTH_URL` - Base URL for OAuth callbacks (e.g., `http://localhost:3000`)
- `HAZO_AUTH_GOOGLE_CLIENT_ID` - Google OAuth client ID (from Google Cloud Console)
- `HAZO_AUTH_GOOGLE_CLIENT_SECRET` - Google OAuth client secret

**Optional:**
- `POSTGREST_URL` - PostgREST API URL (if using PostgreSQL)
- `POSTGREST_API_KEY` - PostgREST API key
- `APP_DOMAIN_NAME` - Base URL for email links (fallback to NEXT_PUBLIC_APP_URL)

## Client-Safe Components

The following components are exported from `hazo_auth/client` for use in client components:

- `ProfilePicMenu` - Profile picture menu with dropdown or sidebar variants
- `ProfileStamp` - Circular profile picture with hover card showing user details
- `use_auth_status` - Hook for basic authentication status
- `use_hazo_auth` - Hook for authentication with permissions
- `cn` - Class name utility function

### ProfileStamp Component

A drop-in component that displays a circular profile picture with a hover card showing user details.

```typescript
import { ProfileStamp } from "hazo_auth/client";

// Basic usage
<ProfileStamp />

// With custom fields
<ProfileStamp
  size="lg"
  custom_fields={[
    { label: "Role", value: "Admin" },
    { label: "Department", value: "Engineering" }
  ]}
/>
```

**Props:**
- `size?: "sm" | "default" | "lg"` - Avatar sizes: sm (24px), default (32px), lg (40px)
- `custom_fields?: ProfileStampCustomField[]` - Custom fields to show in hover card
- `className?: string` - Additional CSS classes
- `show_name?: boolean` - Show user name in hover card (default: true)
- `show_email?: boolean` - Show email in hover card (default: true)

## Authentication Page Navbar

The navbar feature provides a configurable navigation bar for all authentication pages when using standalone layout mode. **The navbar now works automatically** - zero-config server page components include the navbar based on configuration without manual wrapping.

**Configuration:**
```ini
[hazo_auth__navbar]
enable_navbar = true
logo_path = /logo.png
logo_width = 32
logo_height = 32
company_name = My Company
home_path = /
home_label = Home
show_home_link = true
background_color =
text_color =
height = 64
```

**Zero-Config Usage:**
All server page components (`LoginPage`, `RegisterPage`, `ForgotPasswordPage`, `ResetPasswordPage`, `VerifyEmailPage`, `MySettingsPage`) automatically include the navbar when `enable_navbar = true`. No wrapper code needed.

```typescript
// app/hazo_auth/login/page.tsx
import { LoginPage } from "hazo_auth/pages/login";

export default function Page() {
  return <LoginPage />;  // Navbar appears automatically if configured
}
```

**Disable for specific pages:**
```typescript
<LoginPage disableNavbar={true} />
```

**Files:**
- `src/lib/navbar_config.server.ts` - Server-side config loader
- `src/components/layouts/shared/components/auth_navbar.tsx` - Navbar component
- `src/components/layouts/shared/components/standalone_layout_wrapper.tsx` - Wrapper with navbar slot
- `src/components/layouts/shared/components/auth_page_shell.tsx` - Shell wrapper (now included in server pages)

## Development Lock Screen

Password-protected lock screen that blocks access to the entire application during development/testing.

**Environment Variables (Required when enabled):**
```bash
HAZO_AUTH_DEV_LOCK_ENABLED=true
HAZO_AUTH_DEV_LOCK_PASSWORD=your_secure_password_here
```

**Configuration:**
```ini
[hazo_auth__dev_lock]
enable = true
session_duration_days = 7
background_color = #000000
logo_path = /logo.png
application_name = My Application
```

**How It Works:**
1. Startup validation in `instrumentation-node.ts` - fails fast if misconfigured
2. Middleware check - first check before auth, validates signed cookie using HMAC-SHA256
3. Lock screen at `/hazo_auth/dev_lock` - posts to `/api/hazo_auth/dev_lock` to validate
4. Cookie is HttpOnly, Secure (in production), SameSite=Lax

## App User Data (Custom User Metadata)

The `app_user_data` feature provides a flexible JSON field for storing custom user-specific data without database schema changes.

**Database Migration:**
```bash
npm run migrate migrations/008_add_app_user_data_to_hazo_users.sql
```

**API Endpoints:**
- `GET /api/hazo_auth/app_user_data` - Get user's data (returns parsed JSON or null)
- `PATCH /api/hazo_auth/app_user_data` - Merge with existing data (deep merge, preserves other fields)
- `PUT /api/hazo_auth/app_user_data` - Replace entire object (removes fields not in request)
- `DELETE /api/hazo_auth/app_user_data` - Clear data (set to NULL)

**Service Functions:**
```typescript
import {
  get_app_user_data,
  update_app_user_data,
  clear_app_user_data
} from "@/lib/services/app_user_data_service";

// Get data
const data = await get_app_user_data(adapter, user_id);

// Update with merge (default)
await update_app_user_data(adapter, user_id, { theme: "light" }, true);

// Replace entirely
await update_app_user_data(adapter, user_id, { theme: "light" }, false);

// Clear data
await clear_app_user_data(adapter, user_id);
```

**Access in Client Components:**
```typescript
// Available in /api/hazo_auth/me response
const { app_user_data } = use_hazo_auth();
console.log(app_user_data?.theme); // "dark"
```

**Route Handler Exports:**
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

**Deep Merge Behavior (PATCH):**
```typescript
// Existing: { theme: "dark", sidebar_collapsed: true }
// PATCH with: { theme: "light" }
// Result: { theme: "light", sidebar_collapsed: true }

// Nested merge
// Existing: { user: { name: "Alice", age: 30 }, theme: "dark" }
// PATCH with: { user: { age: 31 }, sidebar: true }
// Result: { user: { name: "Alice", age: 31 }, theme: "dark", sidebar: true }
```

**Use Cases:**
- User preferences (theme, language, timezone)
- App-specific state (dashboard layout, sidebar collapsed, recent searches)
- Nested configuration (notifications, privacy settings)

**Test Page:** `/hazo_auth/app_user_data_test`

**Performance Notes:**
- Recommended max size: ~10KB per user
- Benefits from `hazo_get_auth()` LRU cache
- No database queries for cached authenticated requests

**Type Definitions:**
```typescript
// Updated in auth_types.ts
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

## Permissions Reference

| Permission | Purpose |
|------------|---------|
| `admin_scope_hierarchy_management` | Manage scopes and labels |
| `admin_user_scope_assignment` | Assign scopes to users |
| `admin_test_access` | Access the RBAC/HRBAC test tool |
| `hazo_perm_org_management` | CRUD operations on organizations |
| `hazo_org_global_admin` | View/manage all organizations and scopes across the system |

## Common Issues

### "Module not found: Can't resolve 'fs'"
- Client component importing from `hazo_auth` instead of `hazo_auth/client`
- Use `hazo_auth/client` for all client components

### "Cannot read config file"
- Config files must be in project root (where `process.cwd()` points)
- Not in `node_modules/hazo_auth/` - copy to consuming project root

### Middleware JWT validation fails
- Ensure `JWT_SECRET` env var is set
- Must be same secret used to sign tokens at login
- Minimum 32 characters recommended

### Profile picture upload not working
- Check `[hazo_auth__profile_picture] upload_photo_path` in config
- Path must exist and be writable
- Default: `./uploads/profile_pictures`

### Permission checks always fail
- Run `npm run init-users` to initialize permissions and roles
- Verify user has roles assigned in `hazo_user_roles` table
- Check `[hazo_auth__user_management] application_permission_list_defaults`

### Radix UI Select showing empty "None" option
- Radix UI Select does not support `value=""` (empty string)
- Use `value="__none__"` for "None" options instead
- Affects: org select, user type select, scope type select

### User details dialog fields cut off
- Dialog content uses `max-h-[80vh] overflow-y-auto` for scrollable content
- Scroll to see org assignment and fields below the fold

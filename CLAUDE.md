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
   - Full name populated from Google profile

3. **Authorization Check (Server-side):**
   - API route calls `hazo_get_auth(request, { required_permissions: ['admin'] })`
   - Function validates JWT session token OR queries database for user + permissions
   - Returns `HazoAuthResult` with user, permissions, and `permission_ok` flag
   - Uses LRU cache (15min TTL) to reduce database load

4. **Authorization Check (Client-side):**
   - Component uses `use_hazo_auth()` hook
   - Hook fetches from `/api/hazo_auth/me` (standardized endpoint)
   - Returns authentication status and permissions
   - Response includes profile picture aliases: `profile_image`, `avatar_url`, `image` (for consuming app compatibility)
   - Response includes OAuth status: `auth_providers`, `has_password`, `google_connected`

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

Core tables:
- `hazo_users` - User accounts (id, email_address, password_hash, profile fields, **google_id**, **auth_providers**)
- `hazo_refresh_tokens` - Token storage (password reset, email verification)
- `hazo_roles` - Role definitions
- `hazo_permissions` - Permission definitions
- `hazo_user_roles` - User-role junction table
- `hazo_role_permissions` - Role-permission junction table

**New OAuth fields in hazo_users (v4.2.0):**
- `google_id` - Google's unique user ID (sub claim from JWT) for OAuth lookups
- `auth_providers` - Tracks authentication methods: 'email', 'google', or 'email,google'

HRBAC tables (optional, for Hierarchical Role-Based Access Control):
- `hazo_scopes_l1` through `hazo_scopes_l7` - Hierarchical scope levels
- `hazo_user_scopes` - User-scope assignments
- `hazo_scope_labels` - Custom labels for scope levels per organization
- `hazo_enum_scope_types` - Enum for scope type validation

Multi-tenancy tables (optional, for organization hierarchy):
- `hazo_org` - Organization definitions (id, name, parent_org_id, root_org_id, user_limit, active)
- Users reference orgs via `hazo_users.org_id` and `hazo_users.root_org_id`

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

**Relationship with Multi-Tenancy:**
HRBAC scopes are connected to organizations via `org_id` and `root_org_id` foreign keys:
- Multi-tenancy must be enabled to use HRBAC
- Each scope belongs to a specific organization
- Non-global admins can only see/manage scopes for their own organization
- Global admins (`hazo_org_global_admin` permission) can manage scopes for any organization

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

**Permissions:**
- `admin_scope_hierarchy_management` - Manage scopes and labels
- `admin_user_scope_assignment` - Assign scopes to users
- `admin_test_access` - Access the RBAC/HRBAC test tool
- `hazo_org_global_admin` - View/manage scopes for any organization

**Services:**
- `src/lib/services/scope_service.ts` - CRUD operations for scopes
- `src/lib/services/scope_labels_service.ts` - Custom labels per organization
- `src/lib/services/user_scope_service.ts` - User scope assignments and access checking
- `src/lib/auth/scope_cache.ts` - LRU cache for scope lookups

### Multi-Tenancy (Organization Hierarchy)

Multi-tenancy enables hierarchical organization structures for company-wide access control. Organizations can have parent-child relationships, forming a tree structure.

**Architecture:**
- Uses existing `hazo_org` table with `parent_org_id` and `root_org_id` fields
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

**Database Schema:**
The `hazo_org` table includes:
- `id` - UUID primary key
- `name` - Organization name
- `parent_org_id` - Reference to parent org (NULL for root)
- `root_org_id` - Reference to root org for quick tree lookups
- `user_limit` - Maximum users (0 = unlimited, enforced at root level)
- `active` - Soft delete flag
- `created_at`, `created_by`, `changed_at`, `changed_by` - Audit fields

**Migration:**
```bash
npm run migrate migrations/006_multi_tenancy_org_support.sql
```

**Using hazo_get_auth with multi-tenancy:**
When multi-tenancy is enabled, `hazo_get_auth` returns additional org fields:
```typescript
const result = await hazo_get_auth(request, {
  required_permissions: ['view_data'],
});

if (result.authenticated) {
  // User org info available:
  result.user.org_id;           // User's direct org ID
  result.user.org_name;         // User's direct org name
  result.user.parent_org_id;    // Parent org ID (if any)
  result.user.parent_org_name;  // Parent org name
  result.user.root_org_id;      // Root org ID
  result.user.root_org_name;    // Root org name
}
```

**Org Requirement Options:**

By default, `org_id` is **optional** when multi-tenancy is enabled. Users without an org assignment will have null org fields. To require org assignment for specific routes, use the `require_org` option:

```typescript
// Throw OrgRequiredError if user has no org_id
const auth = await hazo_get_auth(request, { require_org: true });
```

Consuming apps can catch this error:

```typescript
import { OrgRequiredError } from "hazo_auth";

try {
  const auth = await hazo_get_auth(request, { require_org: true });
} catch (error) {
  if (error instanceof OrgRequiredError) {
    return NextResponse.json(
      { error: "User not assigned to an organization" },
      { status: 400 }
    );
  }
}
```

**Permissions:**
- `hazo_perm_org_management` - CRUD operations on organizations
- `hazo_org_global_admin` - View/manage all organizations across the system

**API Endpoints:**
- `GET /api/hazo_auth/org_management/orgs` - List organizations (with `action=tree` for hierarchy)
- `POST /api/hazo_auth/org_management/orgs` - Create organization
- `PATCH /api/hazo_auth/org_management/orgs` - Update organization
- `DELETE /api/hazo_auth/org_management/orgs?org_id=...` - Soft delete (deactivate)

**Setting up the API route in consuming apps:**
```typescript
// app/api/hazo_auth/org_management/orgs/route.ts
export {
  orgManagementOrgsGET as GET,
  orgManagementOrgsPOST as POST,
  orgManagementOrgsPATCH as PATCH,
  orgManagementOrgsDELETE as DELETE
} from "hazo_auth/server/routes";
```

Or use CLI: `npx hazo_auth generate-routes`

**Services:**
- `src/lib/services/org_service.ts` - CRUD operations for organizations
- `src/lib/auth/org_cache.ts` - LRU cache for org lookups
- `src/lib/multi_tenancy_config.server.ts` - Configuration loader

**Components:**
- `OrgHierarchyTab` - TreeView component for org management (in user_management)
- `OrgManagementLayout` - Standalone layout for org management
- `OrgManagementPage` - Zero-config page component

**Imports:**
```typescript
// Standalone layout
import { OrgManagementLayout } from "hazo_auth/components/layouts/org_management";

// Page component
import { OrgManagementPage } from "hazo_auth/page_components/org_management";
```

**User Management UI Features:**

When multi-tenancy is enabled, the User Management layout provides several organization-related features:

1. **Organization Assignment Button:**
   - Action button in user table rows (Building2 icon)
   - Opens dialog with TreeView showing org hierarchy
   - "None" option to remove org assignment
   - Visual hierarchy makes selecting user's org intuitive

2. **User Details Dialog:**
   - Scrollable content (`max-h-[80vh] overflow-y-auto`)
   - Ensures all fields visible (including org assignment)
   - Edit mode shows org select dropdown in dialog body
   - Tree view button provides alternative assignment method

3. **Select Component Values:**
   - "None" options use `value="__none__"` (Radix UI requirement)
   - Empty strings (`value=""`) not supported by Radix UI Select
   - Consistent across org select, user type select, scope type select

### User Types (Optional Feature)

User types allow applications to categorize users with customizable types (e.g., "Client", "Tax Agent", "Support Staff") with visual badge indicators. This is an optional feature that's disabled by default.

**Key Features:**
- Define types in INI config (no database table management required)
- Single type per user (mutually exclusive)
- Visual badge with preset or custom hex colors
- Displayed as column in User Management table
- Editable in user detail dialog
- Default type can be auto-assigned on registration
- Zero impact when disabled
- Lightweight: single nullable TEXT column

**Why Use User Types:**
User types provide simple categorization for user personas or customer types without adding complexity to the RBAC system. Unlike roles (which control permissions), types control how users are labeled and filtered. Example: A "Client" user can have an "Admin" role.

**Configuration:**
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
- **key**: Unique identifier stored in database (e.g., "client", "agent")
- **label**: Display name shown in UI (e.g., "Client", "Tax Agent")
- **badge_color**: Visual indicator - preset name (blue, green, red, yellow, purple, gray, orange, pink) or hex code (#4CAF50)

**Database Migration:**
```bash
npm run migrate migrations/007_add_user_type_to_hazo_users.sql
```

Adds single `user_type` TEXT column to `hazo_users` table with optional index for filtering. No foreign key constraints - values validated against config at runtime.

**API Changes:**

1. **`/api/hazo_auth/me` Response (Enhanced):**
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

2. **`/api/hazo_auth/user_management/users` GET Response:**
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

3. **`/api/hazo_auth/user_management/users` PATCH:**
- Accepts `user_type` field in request body
- Validates type key against config before saving
- Returns updated user with `user_type_info`

4. **NEW `/api/hazo_auth/user_management/user_types` GET:**
- Returns user types configuration
- Response: `{ enabled: boolean, types: UserType[], default_type: string | null }`

**Components:**

**UserTypeBadge** (`src/components/ui/user-type-badge.tsx`):
Display-only badge component for showing user types.

```typescript
import { UserTypeBadge } from "hazo_auth/components/ui/user-type-badge";

// Badge variant (default)
<UserTypeBadge
  type="client"
  label="Client"
  badge_color="green"
  variant="badge"
/>

// Text variant (no badge styling)
<UserTypeBadge
  type="client"
  label="Client"
  badge_color="green"
  variant="text"
/>
```

**Props:**
- `type: string` - Type key (for ARIA label)
- `label: string` - Display label
- `badge_color: string` - Preset color or hex code
- `variant?: "badge" | "text"` - Display style (default: "badge")
- `className?: string` - Additional CSS classes

**Using in UserManagementLayout:**
```typescript
import { UserManagementLayout } from "hazo_auth/components/layouts/user_management";

<UserManagementLayout
  userTypesEnabled={true}
  availableUserTypes={[
    { key: "admin", label: "Administrator", badge_color: "red" },
    { key: "standard", label: "Standard User", badge_color: "blue" },
  ]}
/>
```

When `userTypesEnabled` is true, the layout automatically adds:
- "Type" column to users table with `UserTypeBadge` display
- User type dropdown in user detail dialog (edit mode only)
- Type validation before saving changes

**Services & Configuration:**

**`user_types_config.server.ts`** (`src/lib/user_types_config.server.ts`):
```typescript
// Main configuration function
export function get_user_types_config(): UserTypesConfig

// Quick checks
export function is_user_types_enabled(): boolean
export function get_default_user_type(): string | null

// Validation
export function validate_user_type(type_key: string): boolean

// Type definitions
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

**API Route:**
```typescript
// app/api/hazo_auth/user_management/user_types/route.ts
export { GET } from "hazo_auth/server/routes/user_types";
```

**Usage Patterns:**

1. **Simple categorization:**
```ini
[hazo_auth__user_types]
enable_user_types = true
default_user_type = standard
user_type_1 = standard:Standard User:blue
user_type_2 = premium:Premium User:yellow
```

2. **Tax accounting personas:**
```ini
[hazo_auth__user_types]
enable_user_types = true
user_type_1 = client:Client:green
user_type_2 = tax_agent:Tax Agent:orange
user_type_3 = bookkeeper:Bookkeeper:blue
user_type_4 = support:Support Staff:gray
```

3. **Custom hex colors:**
```ini
[hazo_auth__user_types]
enable_user_types = true
user_type_1 = vip:VIP Client:#FFD700
user_type_2 = standard:Standard:#4CAF50
```

**Registration Service Integration:**
When `default_user_type` is configured, new user registrations automatically receive that type. Falls back to NULL if no default specified or feature disabled.

**Design Considerations:**
- **Config-based (not UI-managed)**: Types defined at deployment time prevents proliferation
- **Single type per user**: Mutually exclusive categories (not tags) for clear classification
- **Separate from RBAC**: Types are labels, roles are permissions
- **Optional feature**: Zero impact when disabled, no breaking changes

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
6. Test with Storybook: `npm run storybook`
7. Run unit tests: `npm test`

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

Required:
- `JWT_SECRET` - JWT signing key (min 32 chars) - **CRITICAL for JWT session tokens**
- `ZEPTOMAIL_API_KEY` - Email service API key (for password reset, verification emails)
- `NEXTAUTH_SECRET` - NextAuth.js secret for session encryption (min 32 chars) - **Required for OAuth**
- `NEXTAUTH_URL` - Base URL for OAuth callbacks (e.g., `http://localhost:3000` for dev, `https://yourdomain.com` for production)

OAuth Providers (optional, enable in config):
- `HAZO_AUTH_GOOGLE_CLIENT_ID` - Google OAuth client ID (from Google Cloud Console)
- `HAZO_AUTH_GOOGLE_CLIENT_SECRET` - Google OAuth client secret

Optional:
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

A drop-in component that displays a circular profile picture with a hover card showing user details. Perfect for adding profile attribution to notes, comments, or any user-generated content.

**Props:**
```typescript
type ProfileStampProps = {
  size?: "sm" | "default" | "lg";  // Avatar sizes: sm (24px), default (32px), lg (40px)
  custom_fields?: ProfileStampCustomField[];  // Custom fields to show in hover card
  className?: string;  // Additional CSS classes
  show_name?: boolean;  // Show user name in hover card (default: true)
  show_email?: boolean;  // Show email in hover card (default: true)
};
```

**Usage Example:**
```typescript
import { ProfileStamp } from "hazo_auth/client";

// Basic usage
<ProfileStamp />

// With custom fields for notes
<ProfileStamp
  size="lg"
  custom_fields={[
    { label: "Role", value: "Admin" },
    { label: "Department", value: "Engineering" }
  ]}
/>

// No hover card (show_name and show_email both false, no custom fields)
<ProfileStamp show_name={false} show_email={false} />
```

**Test Page:** Visit `/hazo_auth/profile_stamp_test` to see examples of ProfileStamp with various configurations.

## Google OAuth Integration

### Overview

hazo_auth supports Google Sign-In via NextAuth.js v4, allowing users to authenticate with their Google accounts. The implementation supports:
- **Dual authentication methods**: Users can have BOTH Google OAuth and email/password login
- **Auto-linking**: Automatically links Google login to existing unverified email/password accounts (configurable)
- **Graceful degradation**: Login page adapts based on enabled authentication methods
- **Set password feature**: Google-only users can add a password later via My Settings

### Configuration

Enable Google OAuth in `hazo_auth_config.ini`:

```ini
[hazo_auth__oauth]
# Enable Google OAuth login (requires Google Cloud credentials)
enable_google = true

# Enable traditional email/password login
enable_email_password = true

# Auto-link Google login to existing unverified email/password accounts
auto_link_unverified_accounts = true

# Customize button text
google_button_text = Continue with Google
oauth_divider_text = or
```

### Environment Variables

Add to `.env.local`:

```env
# NextAuth.js configuration (REQUIRED for OAuth)
NEXTAUTH_SECRET=your_secure_random_string_at_least_32_characters
NEXTAUTH_URL=http://localhost:3000  # Change to production URL in production

# Google OAuth credentials (from Google Cloud Console)
HAZO_AUTH_GOOGLE_CLIENT_ID=your_google_client_id
HAZO_AUTH_GOOGLE_CLIENT_SECRET=your_google_client_secret
```

**Get Google OAuth credentials:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project or select existing project
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Set Authorized JavaScript origins: `http://localhost:3000` (dev), `https://yourdomain.com` (prod)
6. Set Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
7. Copy Client ID and Client Secret

### Database Migration

Run migration to add OAuth fields:

```bash
npm run migrate migrations/005_add_oauth_fields_to_hazo_users.sql
```

This adds:
- `google_id` - Google's unique user ID (TEXT, UNIQUE, indexed)
- `auth_providers` - Tracks authentication methods: 'email', 'google', or 'email,google'

### User Flows

**New User - Google Sign-In:**
1. Click "Sign in with Google" button
2. Authenticate with Google
3. Account created with Google profile data (email, name, profile picture)
4. `auth_providers` set to 'google'
5. `password_hash` is NULL
6. Email is auto-verified (email_verified = true)

**Existing User with Unverified Email/Password:**
1. User has email/password account but hasn't verified email
2. Click "Sign in with Google" with same email address
3. System auto-links Google account (if `auto_link_unverified_accounts = true`)
4. Email becomes verified
5. `auth_providers` updated to 'email,google'
6. User can now log in with EITHER method

**Google-Only User Adds Password:**
1. Google-only user visits My Settings
2. "Set Password" section appears (only for Google-only users)
3. User sets password
4. `auth_providers` updated to 'email,google'
5. User can now log in with EITHER method

**User with Password Tries Forgot Password (Google-Only):**
1. User who registered with Google tries "Forgot Password"
2. System detects `has_password = false`
3. Shows message: "You registered with Google. Please sign in with Google instead."

### API Endpoints

**OAuth Routes (created by NextAuth.js):**
- `GET /api/auth/signin/google` - Initiates Google OAuth flow
- `GET /api/auth/callback/google` - Google OAuth callback handler

**Custom OAuth Routes:**
- `GET /api/hazo_auth/oauth/google/callback` - Creates hazo_auth session after NextAuth callback
- `POST /api/hazo_auth/set_password` - Allows Google-only users to set a password

### Components

**New OAuth Components:**
- `GoogleIcon` - Google logo SVG
- `GoogleSignInButton` - "Sign in with Google" button
- `OAuthDivider` - Divider with "or" text between OAuth and email/password
- `ConnectedAccountsSection` (My Settings) - Shows linked OAuth providers
- `SetPasswordSection` (My Settings) - For Google-only users to add password

**Modified Components:**
- `LoginLayout` - Added OAuth button section (conditionally rendered)
- `MySettingsLayout` - Added Connected Accounts and Set Password sections
- `ForgotPasswordLayout` - Special handling for Google-only users

### Service Functions

**OAuth Service (`src/lib/services/oauth_service.ts`):**
- `handle_google_oauth_login()` - Process Google OAuth login, create/link account
- `link_google_account()` - Link Google OAuth to existing email/password account
- `set_user_password()` - Set password for Google-only users
- `get_user_oauth_status()` - Get user's OAuth connection status

**Modified Services:**
- `login_service.ts` - Handle login for users without passwords (Google-only)
- `registration_service.ts` - Set `auth_providers='email'` for new email registrations
- `password_reset_service.ts` - Check if user has password before allowing reset

### Configuration Helpers

**OAuth Config (`src/lib/oauth_config.server.ts`):**
- `get_oauth_config()` - Read OAuth configuration from INI file
- `is_google_oauth_enabled()` - Quick check if Google OAuth is enabled
- `is_email_password_enabled()` - Quick check if email/password login is enabled

### NextAuth.js Configuration

NextAuth.js config is in `src/lib/auth/nextauth_config.ts`:

```typescript
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.HAZO_AUTH_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.HAZO_AUTH_GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Custom sign-in logic
    },
  },
  // ... other NextAuth options
};
```

### API Response Changes

**`/api/hazo_auth/me` Response (Enhanced):**
```typescript
{
  authenticated: true,
  // ... existing fields
  auth_providers: "email,google",  // NEW: Tracks authentication methods
  has_password: true,              // NEW: Whether user has password set
  google_connected: true,          // NEW: Whether Google account is linked
}
```

### Dependencies

New dependency added to `package.json`:
- `next-auth@^4.24.11` - NextAuth.js for OAuth handling

### Files Added

1. `migrations/005_add_oauth_fields_to_hazo_users.sql` - Database migration
2. `src/lib/oauth_config.server.ts` - OAuth configuration loader
3. `src/lib/services/oauth_service.ts` - OAuth business logic
4. `src/lib/auth/nextauth_config.ts` - NextAuth.js configuration
5. `src/lib/utils/password_validator.ts` - Password validation utility
6. `src/app/api/auth/[...nextauth]/route.ts` - NextAuth API route handler
7. `src/app/api/hazo_auth/oauth/google/callback/route.ts` - Custom callback handler
8. `src/app/api/hazo_auth/set_password/route.ts` - Set password API route
9. `src/components/layouts/shared/components/google_icon.tsx` - Google logo
10. `src/components/layouts/shared/components/google_sign_in_button.tsx` - Google button
11. `src/components/layouts/shared/components/oauth_divider.tsx` - OAuth/email divider
12. `src/components/layouts/my_settings/components/connected_accounts_section.tsx` - OAuth status
13. `src/components/layouts/my_settings/components/set_password_section.tsx` - Set password UI

## Authentication Page Navbar

### Overview

The navbar feature provides a configurable navigation bar that appears at the top of all authentication pages (login, register, forgot_password, reset_password, verify_email, my_settings) when using standalone layout mode. The navbar displays your company logo, name, and a home link, providing consistent branding across the authentication experience.

**Key Features:**
- Configurable logo with Next.js Image optimization
- Company name display with link to home page
- Optional home link with icon
- Customizable colors and height
- Automatically vertically centers auth content when navbar is enabled
- Can be disabled globally or per-page
- Automatically disabled for dev_lock pages

### Configuration

**INI Configuration (`hazo_auth_config.ini`):**
```ini
[hazo_auth__navbar]
# Enable navbar on auth pages (default: true)
enable_navbar = true

# Logo configuration
logo_path = /logo.png
logo_width = 32
logo_height = 32

# Company branding
company_name = My Company

# Home link configuration
home_path = /
home_label = Home
show_home_link = true

# Styling (optional - leave blank to use defaults)
background_color =
text_color =
height = 64
```

**UI Shell Configuration:**
The navbar works in conjunction with the standalone layout mode. When navbar is enabled, auth content is automatically vertically centered:

```ini
[hazo_auth__ui_shell]
layout_mode = standalone
vertical_center = auto  # 'auto' enables vertical centering when navbar is present
```

### How It Works

1. **Automatic Display**: When `layout_mode = standalone` and `enable_navbar = true`, the navbar automatically appears on all auth pages
2. **Vertical Centering**: Auth content is vertically centered when navbar is enabled (controlled by `vertical_center` setting)
3. **Logo Handling**: Uses Next.js Image component for optimized logo rendering
4. **Navigation**: Company name and logo link to `home_path`, optional home link on the right side
5. **Styling**: Supports custom background color, text color, and height via configuration

### Component Structure

**Files:**
- `src/lib/navbar_config.server.ts` - Server-side config loader
- `src/components/layouts/shared/components/auth_navbar.tsx` - Client component for navbar
- `src/components/layouts/shared/components/standalone_layout_wrapper.tsx` - Wrapper with navbar slot
- `src/components/layouts/shared/components/auth_page_shell.tsx` - Shell that passes navbar config

**Types:**
```typescript
type NavbarConfig = {
  enable_navbar: boolean;
  logo_path: string;
  logo_width: number;
  logo_height: number;
  company_name: string;
  home_path: string;
  home_label: string;
  show_home_link: boolean;
  background_color: string;
  text_color: string;
  height: number;
};
```

### Usage

**Zero-Config (Recommended):**
The navbar is automatically enabled when you use zero-config page components and have `layout_mode = standalone`:

```typescript
// app/hazo_auth/login/page.tsx
import { LoginPage } from "hazo_auth/pages/login";

export default function Page() {
  return <LoginPage />; // Navbar appears automatically if enabled in config
}
```

**Customization via Props:**
You can override navbar configuration via layout props:

```typescript
import { LoginLayout } from "hazo_auth/components/layouts/login";

export default function Page() {
  return (
    <LoginLayout
      navbar={{
        enable_navbar: true,
        logo_path: "/custom-logo.svg",
        company_name: "Custom Company Name",
        background_color: "#1a1a1a",
        text_color: "#ffffff",
      }}
    />
  );
}
```

**Disabling Navbar for Specific Pages:**
Use the `disableNavbar` prop on `AuthPageShell` or pass `enable_navbar: false` in navbar config:

```typescript
import { LoginLayout } from "hazo_auth/components/layouts/login";

export default function Page() {
  return (
    <LoginLayout
      navbar={{ enable_navbar: false }}
    />
  );
}
```

### Imports

```typescript
// Import navbar component (if building custom layouts)
import { AuthNavbar } from "hazo_auth/components/layouts/shared";

// Import navbar config type
import type { NavbarConfig } from "hazo_auth/lib/navbar_config.server";
```

### Configuration Defaults

Default values from `src/lib/config/default_config.ts`:

```typescript
export const DEFAULT_NAVBAR: NavbarConfig = {
  enable_navbar: true,
  logo_path: "/logo.png",
  logo_width: 32,
  logo_height: 32,
  company_name: "My Company",
  home_path: "/",
  home_label: "Home",
  show_home_link: true,
  background_color: "",  // Uses CSS variable --hazo-bg-subtle
  text_color: "",        // Uses CSS variable --hazo-text-primary
  height: 64,
};
```

### Design Considerations

- **Responsive**: Navbar adapts to mobile and desktop viewports
- **Accessibility**: Proper ARIA labels and semantic HTML
- **Theme Support**: Inherits dark mode via CSS variables when colors not specified
- **Performance**: Logo uses Next.js Image for automatic optimization
- **Consistency**: Same navbar across all auth pages for unified branding

### Example Configurations

**Minimal Navbar (Logo Only):**
```ini
[hazo_auth__navbar]
enable_navbar = true
logo_path = /logo.svg
logo_width = 40
logo_height = 40
company_name =
show_home_link = false
```

**Full Branding with Custom Colors:**
```ini
[hazo_auth__navbar]
enable_navbar = true
logo_path = /brand/logo.png
logo_width = 48
logo_height = 48
company_name = Acme Corporation
home_path = https://acme.com
home_label = Back to Home
show_home_link = true
background_color = #1e3a8a
text_color = #ffffff
height = 72
```

**Disable Navbar:**
```ini
[hazo_auth__navbar]
enable_navbar = false
```

---

## Development Lock Screen

### Overview

The dev lock feature provides a password-protected lock screen that blocks access to the entire application during development/testing. When enabled, users must enter a password to access any page or API route.

**Key Features:**
- Blocks ALL routes (pages redirect to lock screen, APIs return 503)
- Zero performance impact when disabled (fast env var check in middleware)
- Persistent cookie session (configurable duration, default 7 days)
- Customizable UI (background color, logo, text)
- Fails fast if misconfigured (app won't start without password when enabled)

### Configuration

**Environment Variables (Required when enabled):**
```bash
# Enable the dev lock in middleware (fast-path check)
HAZO_AUTH_DEV_LOCK_ENABLED=true

# The password users must enter to unlock
HAZO_AUTH_DEV_LOCK_PASSWORD=your_secure_password_here
```

**INI Configuration (`hazo_auth_config.ini`):**
```ini
[hazo_auth__dev_lock]
# Enable in config (also requires env var)
enable = true

# Session duration in days
session_duration_days = 7

# UI Customization
background_color = #000000
logo_path = /logo.png
logo_width = 120
logo_height = 120
application_name = My Application
limited_access_text = Limited Access
password_placeholder = Enter access password
submit_button_text = Unlock
error_message = Incorrect password
text_color = #ffffff
accent_color = #3b82f6
```

### How It Works

1. **Startup Validation** (`instrumentation-node.ts`):
   - If `HAZO_AUTH_DEV_LOCK_ENABLED=true` but `HAZO_AUTH_DEV_LOCK_PASSWORD` is not set, app fails to start
   - Warns if password is less than 8 characters

2. **Middleware Check** (`src/middleware.ts`):
   - First check in middleware (before auth check)
   - Only runs if `HAZO_AUTH_DEV_LOCK_ENABLED === "true"`
   - Validates signed cookie using HMAC-SHA256
   - Page routes: Redirect to `/hazo_auth/dev_lock`
   - API routes: Return 503 with JSON error

3. **Lock Screen** (`/hazo_auth/dev_lock`):
   - Black background with logo, app name, "Limited Access" text
   - Single password input
   - Posts to `/api/hazo_auth/dev_lock` to validate

4. **Unlock** (`/api/hazo_auth/dev_lock`):
   - Validates password using constant-time comparison
   - Creates signed cookie with configurable expiry
   - Redirects to home page on success

### Files

| File | Purpose |
|------|---------|
| `src/lib/config/default_config.ts` | DEFAULT_DEV_LOCK defaults |
| `src/lib/dev_lock_config.server.ts` | Config loader from INI file |
| `src/lib/auth/dev_lock_validator.edge.ts` | Edge-compatible cookie validation (HMAC-SHA256) |
| `instrumentation-node.ts` | Startup validation |
| `src/middleware.ts` | Dev lock check (first in middleware chain) |
| `src/components/layouts/dev_lock/index.tsx` | DevLockLayout component |
| `src/app/api/hazo_auth/dev_lock/route.ts` | Unlock API endpoint |
| `src/app/hazo_auth/dev_lock/page.tsx` | Demo lock screen page |
| `src/page_components/dev_lock.tsx` | Zero-config page component |

### Usage in Consuming Apps

```typescript
// Import the layout for customization
import { DevLockLayout } from "hazo_auth/components/layouts/dev_lock";

// Or use the zero-config page component
import { DevLockPage } from "hazo_auth/page_components/dev_lock";

// In your app's /dev_lock/page.tsx
export default function LockPage() {
  return (
    <DevLockPage
      application_name="My App"
      background_color="#1a1a2e"
    />
  );
}
```

### Security Notes

- Password is validated using constant-time comparison (prevents timing attacks)
- Cookie is signed with HMAC-SHA256 using the password as key
- Cookie format: `timestamp|expiry|signature`
- HttpOnly, Secure (in production), SameSite=Lax

## Common Issues

### "Module not found: Can't resolve 'fs'"
- Client component importing from `hazo_auth` instead of `hazo_auth/client`
- Use `hazo_auth/client` for all client components
- ProfileStamp is exported from `hazo_auth/client`

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
- This is a known limitation of Radix UI Select component

### User details dialog fields cut off
- Dialog content now scrollable with `max-h-[80vh] overflow-y-auto`
- Ensures all fields visible even in smaller viewports
- Scroll to see org assignment and fields below the fold

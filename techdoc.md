# hazo_auth Technical Documentation

## Overview

The `hazo_auth` package is a reusable authentication UI component package for Next.js applications. It provides:

- Complete authentication flows (login, register, forgot password, reset password, email verification)
- User settings and profile management
- Role-based access control (RBAC) with permissions
- Configurable UI components based on shadcn/ui
- Integration with `hazo_config` for configuration and `hazo_connect` for data access
- **JWT Session Tokens** (v1.6.6+): Edge-compatible authentication for Next.js proxy/middleware files

---

## Package Architecture

### Build System

The package uses a dual-configuration TypeScript setup:

1. **`tsconfig.json`** - Development configuration for Next.js app
2. **`tsconfig.build.json`** - Production build configuration for the npm package

**Build command:**
```bash
npm run build:pkg  # Runs: tsc -p tsconfig.build.json
```

**Build output:**
- Compiles `src/` to `dist/`
- Generates `.d.ts` type declarations
- Excludes `src/app/**/*` (Next.js demo app) and `src/stories/**/*` (Storybook)

### Package Exports

The `package.json` exports field defines the public API:

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./pages": "./dist/page_components/index.js",
    "./pages/login": "./dist/page_components/login.js",
    "./pages/register": "./dist/page_components/register.js",
    "./pages/forgot_password": "./dist/page_components/forgot_password.js",
    "./pages/reset_password": "./dist/page_components/reset_password.js",
    "./pages/verify_email": "./dist/page_components/verify_email.js",
    "./pages/my_settings": "./dist/page_components/my_settings.js",
    "./components/layouts/login": "./dist/components/layouts/login/index.js",
    "./components/layouts/register": "./dist/components/layouts/register/index.js",
    "./components/layouts/shared": "./dist/components/layouts/shared/index.js",
    "./lib/auth/hazo_get_auth.server": "./dist/lib/auth/hazo_get_auth.server.js",
    "./server": "./dist/server/index.js",
    "./server/routes": "./dist/server/routes/index.js"
  }
}
```
**Note:** The `./pages/*` exports point to `dist/page_components/*` to avoid conflicts with Next.js Pages Router.

**Important:** Internal modules (like UI components, utility functions) are not exposed. They are used internally via relative imports and re-exported through the public entry points.

### CLI Commands

The package provides CLI commands for setup and route generation:

```bash
npx hazo_auth init                    # Initialize project (creates dirs, copies config)
npx hazo_auth generate-routes         # Generate API routes only
npx hazo_auth generate-routes --pages # Generate API routes + page routes
npx hazo_auth validate                # Check setup and configuration
npx hazo_auth --help                  # Show all commands
```

### Zero-Config Page Components

The package provides zero-config page components in `src/pages/`:

| Component | Import Path | Description |
|-----------|-------------|-------------|
| `LoginPage` | `hazo_auth/pages/login` | Zero-config login page |
| `RegisterPage` | `hazo_auth/pages/register` | Zero-config register page |
| `ForgotPasswordPage` | `hazo_auth/pages/forgot_password` | Zero-config forgot password page |
| `ResetPasswordPage` | `hazo_auth/pages/reset_password` | Zero-config reset password page |
| `VerifyEmailPage` | `hazo_auth/pages/verify_email` | Zero-config email verification page |
| `MySettingsPage` | `hazo_auth/pages/my_settings` | Zero-config my settings page |

**Usage:**
```typescript
// app/hazo_auth/login/page.tsx
import { LoginPage } from "hazo_auth/pages/login";
export default LoginPage;
```

All page components:
- Work out-of-the-box with no required props
- Use sensible defaults for all configuration
- Accept optional props for customization
- Handle client-side initialization of `hazo_connect`

### Import Patterns

**For consumers of the package:**
```typescript
// Main entry point
import { LoginLayout, use_hazo_auth } from "hazo_auth";

// Layout components
import { LoginLayout } from "hazo_auth/components/layouts/login";
import { RegisterLayout } from "hazo_auth/components/layouts/register";

// Shared components and hooks (recommended - uses barrel exports)
import { 
  ProfilePicMenu, 
  use_hazo_auth, 
  use_auth_status 
} from "hazo_auth/components/layouts/shared";

// Server-side authentication
import { hazo_get_auth } from "hazo_auth/lib/auth/hazo_get_auth.server";
```

**Within the package source code:**
```typescript
// Relative imports are used throughout the package
import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";
import { use_auth_status } from "../hooks/use_auth_status";
```

**Important:** The package uses **relative imports internally**, not package-style imports. This ensures the compiled `dist/` output contains relative paths that work correctly in consuming projects without any webpack alias configuration.

### Module Resolution

The compiled package output (`dist/`) contains relative imports, so consuming projects do not need any special webpack configuration. Simply install the package and import from the exposed entry points.

**Example consuming project usage:**
```typescript
// No webpack aliases needed!
import { LoginLayout } from "hazo_auth/components/layouts/login";
import { ProfilePicMenu, use_auth_status } from "hazo_auth/components/layouts/shared";
```

The `tsconfig.json` paths and `next.config.mjs` webpack aliases are only used for the local Next.js development app (`src/app/`) within the package repository, not for consuming projects.

---

## File Architecture

### Directory Structure

```
hazo_auth/
├── src/
│   ├── app/                    # Next.js app directory (demo/dev only, not in package)
│   │   ├── api/hazo_auth/      # API routes
│   │   └── hazo_auth/*/page.tsx # Demo pages
│   ├── cli/                    # CLI commands
│   │   ├── index.ts            # CLI entry point
│   │   ├── init.ts             # Init command
│   │   ├── generate.ts         # Route generation
│   │   └── validate.ts         # Setup validation
│   ├── components/
│   │   ├── layouts/            # Layout components
│   │   │   ├── login/          # Login layout
│   │   │   ├── register/       # Register layout
│   │   │   ├── forgot_password/
│   │   │   ├── reset_password/
│   │   │   ├── verify_email/
│   │   │   ├── my_settings/
│   │   │   ├── user_management/
│   │   │   └── shared/         # Shared layout components
│   │   │       ├── components/ # Reusable form components
│   │   │       └── hooks/      # Layout-specific hooks
│   │   ├── ui/                 # shadcn UI components
│   │   └── index.ts            # Barrel export
│   ├── page_components/        # Zero-config page components (exposed as hazo_auth/pages/*)
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── forgot_password.tsx
│   │   ├── reset_password.tsx
│   │   ├── verify_email.tsx
│   │   ├── my_settings.tsx
│   │   └── index.ts            # Barrel export
│   ├── hooks/                  # Client-side React hooks
│   │   ├── use_hazo_auth.ts
│   │   ├── use_auth_status.ts
│   │   ├── use_login_form.ts
│   │   └── index.ts
│   ├── lib/
│   │   ├── auth/               # Authentication utilities
│   │   │   ├── hazo_get_auth.server.ts
│   │   │   ├── auth_utils.server.ts
│   │   │   ├── server_auth.ts
│   │   │   └── auth_types.ts
│   │   ├── config/             # Configuration loaders
│   │   │   └── config_loader.server.ts
│   │   ├── services/           # Business logic services
│   │   │   ├── registration_service.ts
│   │   │   ├── login_service.ts
│   │   │   ├── password_reset_service.ts
│   │   │   ├── email_verification_service.ts
│   │   │   ├── user_profiles_service.ts
│   │   │   └── ...
│   │   └── index.ts
│   ├── server/                 # Server-only utilities
│   │   ├── hazo_connect_instance.server.ts
│   │   ├── hazo_connect_setup.server.ts
│   │   └── index.ts
│   ├── stories/                # Storybook stories (not in package)
│   └── index.ts                # Main entry point
├── dist/                       # Compiled package output
├── migrations/                 # Database migration files
├── scripts/                    # Utility scripts
├── __tests__/                  # Test files
│   └── fixtures/               # Test fixtures (SQLite database)
├── public/
│   └── profile_pictures/       # Library profile pictures
├── hazo_auth_config.ini        # Main configuration file
├── hazo_notify_config.ini      # Email service configuration
├── package.json
├── tsconfig.json               # Development TypeScript config
└── tsconfig.build.json         # Package build TypeScript config
```

### Key Files

- **`src/index.ts`** - Main entry point, exports all public APIs
- **`src/components/index.ts`** - Barrel export for all components
- **`src/hooks/index.ts`** - Barrel export for all hooks
- **`src/lib/index.ts`** - Barrel export for library utilities
- **`src/server/index.ts`** - Barrel export for server utilities
- **`instrumentation.ts`** - Next.js instrumentation file for email service initialization
- **`src/middleware.ts`** - Next.js middleware for route protection

---

## Database Schema

### hazo_users Table

```sql
CREATE TABLE hazo_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_address TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    login_attempts INTEGER NOT NULL DEFAULT 0,
    last_logon TIMESTAMP WITH TIME ZONE,
    profile_picture_url TEXT,
    profile_source hazo_enum_profile_source_enum,
    mfa_secret TEXT,
    url_on_logon TEXT,                                    -- Custom redirect URL after login
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

**Field Notes:**
- `id` - UUID primary key (TEXT in SQLite)
- `email_address` - Unique email for authentication
- `password_hash` - Argon2 hashed password
- `name` - Optional display name
- `email_verified` - Whether email has been verified
- `is_active` - Account active status
- `login_attempts` - Failed login attempt counter
- `last_logon` - Last successful login timestamp
- `profile_picture_url` - URL to profile picture
- `profile_source` - Source of profile picture (gravatar, custom, predefined)
- `mfa_secret` - MFA secret for TOTP (future use)
- `url_on_logon` - Custom URL to redirect user after successful login
- `created_at` - Account creation timestamp
- `changed_at` - Last modification timestamp

### hazo_refresh_tokens Table

```sql
CREATE TABLE hazo_refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES hazo_users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    token_type TEXT NOT NULL,           -- 'refresh', 'password_reset', 'email_verification'
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

### RBAC Tables

**hazo_permissions:**
```sql
CREATE TABLE hazo_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    permission_name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

**hazo_roles:**
```sql
CREATE TABLE hazo_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

**hazo_role_permissions:**
```sql
CREATE TABLE hazo_role_permissions (
    role_id UUID NOT NULL REFERENCES hazo_roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES hazo_permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id)
);
```

**hazo_user_roles:**
```sql
CREATE TABLE hazo_user_roles (
    user_id UUID NOT NULL REFERENCES hazo_users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES hazo_roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);
```

### HRBAC Tables (Hierarchical Role-Based Access Control)

**Optional feature** - enables 7-level scope hierarchy for organizational access control.

**hazo_scopes_l1 through hazo_scopes_l7:**
```sql
-- Level 1 (root level - no parent)
CREATE TABLE hazo_scopes_l1 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seq TEXT NOT NULL,                       -- Auto-generated friendly ID (e.g., L1_001)
    org TEXT NOT NULL,                       -- Organization identifier
    name TEXT NOT NULL,                      -- Scope name (e.g., "Acme Corp")
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_hazo_scopes_l1_org ON hazo_scopes_l1(org);
CREATE INDEX idx_hazo_scopes_l1_seq ON hazo_scopes_l1(seq);

-- Level 2 (parent: L1)
CREATE TABLE hazo_scopes_l2 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seq TEXT NOT NULL,
    org TEXT NOT NULL,
    name TEXT NOT NULL,
    parent_scope_id UUID REFERENCES hazo_scopes_l1(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_hazo_scopes_l2_org ON hazo_scopes_l2(org);
CREATE INDEX idx_hazo_scopes_l2_seq ON hazo_scopes_l2(seq);
CREATE INDEX idx_hazo_scopes_l2_parent ON hazo_scopes_l2(parent_scope_id);

-- Levels 3-7 follow the same pattern, each referencing the previous level
```

**Field Notes:**
- `id` - UUID primary key (TEXT in SQLite)
- `seq` - Auto-generated human-readable ID (e.g., L2_015) via database function
- `org` - Organization identifier (allows multi-tenancy)
- `name` - Display name for the scope
- `parent_scope_id` - References parent level (NULL for L1, required for L2-L7)
- Foreign key with CASCADE DELETE ensures referential integrity

**hazo_user_scopes:**
```sql
CREATE TABLE hazo_user_scopes (
    user_id UUID NOT NULL REFERENCES hazo_users(id) ON DELETE CASCADE,
    scope_id UUID NOT NULL,                  -- References scope in one of the scope tables
    scope_seq TEXT NOT NULL,                 -- Denormalized seq for quick lookup
    scope_type hazo_enum_scope_types NOT NULL, -- Which level (hazo_scopes_l1..l7)
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, scope_type, scope_id)
);
CREATE INDEX idx_hazo_user_scopes_user_id ON hazo_user_scopes(user_id);
CREATE INDEX idx_hazo_user_scopes_scope_id ON hazo_user_scopes(scope_id);
CREATE INDEX idx_hazo_user_scopes_scope_type ON hazo_user_scopes(scope_type);
```

**Field Notes:**
- Composite primary key: `(user_id, scope_type, scope_id)`
- `scope_type` - Enum indicating which level (hazo_scopes_l1 through hazo_scopes_l7)
- `scope_seq` - Denormalized for display purposes (avoids joins)
- Users can be assigned to multiple scopes at different levels

**hazo_scope_labels:**
```sql
CREATE TABLE hazo_scope_labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org TEXT NOT NULL,
    scope_type hazo_enum_scope_types NOT NULL,
    label TEXT NOT NULL,                     -- Custom label (e.g., "Division" instead of "Level 2")
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(org, scope_type)
);
CREATE INDEX idx_hazo_scope_labels_org ON hazo_scope_labels(org);
```

**Field Notes:**
- Allows organizations to customize labels for each scope level
- Example: "Company" (L1), "Division" (L2), "Department" (L3)
- UNIQUE constraint ensures one label per organization per level

**hazo_enum_scope_types (PostgreSQL only):**
```sql
CREATE TYPE hazo_enum_scope_types AS ENUM (
    'hazo_scopes_l1',
    'hazo_scopes_l2',
    'hazo_scopes_l3',
    'hazo_scopes_l4',
    'hazo_scopes_l5',
    'hazo_scopes_l6',
    'hazo_scopes_l7'
);
```

**SQLite Note:** SQLite uses TEXT with CHECK constraint for scope type validation.

### Database Migrations

Migration files are located in `migrations/`:

| File | Description |
|------|-------------|
| `001_create_tables.sql` | Initial schema creation |
| `002_add_name_to_hazo_users.sql` | Add name field to users |
| `003_add_url_on_logon_to_hazo_users.sql` | Add url_on_logon field for custom redirects |
| `004_add_parent_scope_to_scope_tables.sql` | Add parent_scope_id to L2-L7 scope tables (HRBAC) |

**Apply migrations:**
```bash
# Apply specific migration
npx tsx scripts/apply_migration.ts migrations/003_add_url_on_logon_to_hazo_users.sql

# Apply all pending migrations
npx tsx scripts/apply_migration.ts
```

---

## Configuration Management

### Configuration Files

1. **`hazo_auth_config.ini`** - Main application configuration
2. **`hazo_notify_config.ini`** - Email service configuration

### Configuration Sections

| Section | Description |
|---------|-------------|
| `hazo_auth__register_layout` | Register page configuration |
| `hazo_auth__login_layout` | Login page configuration |
| `hazo_auth__forgot_password_layout` | Forgot password page configuration |
| `hazo_auth__reset_password_layout` | Reset password page configuration |
| `hazo_auth__email_verification_layout` | Email verification page configuration |
| `hazo_auth__my_settings_layout` | My Settings page configuration |
| `hazo_auth__password_requirements` | Password requirements |
| `hazo_auth__user_fields` | User field visibility |
| `hazo_auth__already_logged_in` | "Already logged in" message configuration |
| `hazo_auth__profile_picture` | Profile picture configuration |
| `hazo_auth__profile_pic_menu` | Profile picture menu widget configuration |
| `hazo_auth__tokens` | Token expiry configuration |
| `hazo_auth__messages` | User-facing messages |
| `hazo_auth__ui_sizes` | UI size configuration |
| `hazo_auth__file_types` | Allowed file types |
| `hazo_auth__email` | Email template configuration |
| `hazo_auth__ui_shell` | UI shell mode (test_sidebar/standalone) |
| `hazo_auth__auth_utility` | Authentication utility configuration (caching, rate limiting) |

### Reading Configuration

```typescript
import { 
  get_config_value, 
  get_config_boolean, 
  get_config_number,
  get_config_array 
} from "hazo_auth/lib/config/config_loader.server";

const message = get_config_value("hazo_auth__messages", "photo_upload_disabled_message", "Photo upload is not enabled.");
const enabled = get_config_boolean("hazo_auth__profile_picture", "allow_photo_upload", false);
const size = get_config_number("hazo_auth__ui_sizes", "gravatar_size", 200);
const permissions = get_config_array("hazo_auth__permissions", "application_permission_list_defaults", []);
```

---

## Components

### Layout Components

All layout components follow a similar pattern:
1. Server-side page component (`page.tsx`) reads configuration and passes to client component
2. Client component (`*_page_client.tsx`) renders the layout within sidebar
3. Layout component (`layouts/*/index.tsx`) contains the actual UI

| Component | Config Section | API Route | Service |
|-----------|----------------|-----------|---------|
| `LoginLayout` | `hazo_auth__login_layout` | `/api/auth/login` | `login_service.ts` |
| `RegisterLayout` | `hazo_auth__register_layout` | `/api/auth/register` | `registration_service.ts` |
| `ForgotPasswordLayout` | `hazo_auth__forgot_password_layout` | `/api/auth/forgot_password` | `password_reset_service.ts` |
| `ResetPasswordLayout` | `hazo_auth__reset_password_layout` | `/api/auth/reset_password` | `password_reset_service.ts` |
| `EmailVerificationLayout` | `hazo_auth__email_verification_layout` | `/api/auth/verify_email` | `email_verification_service.ts` |
| `MySettingsLayout` | `hazo_auth__my_settings_layout` | Multiple | Multiple |
| `UserManagementLayout` | N/A | Multiple | Multiple |

**UserManagementLayout Tabs:**
- **Users Tab**: List users, deactivate users, send password reset emails
- **Roles Tab**: Manage roles and their permission assignments using tag-based UI
  - **Roles Matrix**: Displays roles with their permissions as inline tags/chips
  - Shows up to 4 permission tags, with "+N more" button to expand/collapse remaining permissions
  - Edit Permissions dialog with Select All/Unselect All functionality
  - Scrollable permission list with checkboxes and descriptions
  - **Design Rationale**: Tag-based UI replaced horizontal data table for better visual hierarchy and efficient use of space when many permissions exist
- **Permissions Tab**: Create, edit, and delete permissions
- **Scope Hierarchy Tab** (HRBAC): Manage scope structure (requires `admin_scope_hierarchy_management`)
- **Scope Labels Tab** (HRBAC): Customize scope level labels (requires `admin_scope_hierarchy_management`)
- **User Scopes Tab** (HRBAC): Assign scopes to users (requires `admin_user_scope_assignment`)

### Shared Components

Located in `src/components/layouts/shared/components/`:

- `FormActionButtons` - Save/Cancel button group
- `FormFieldWrapper` - Input field with edit mode
- `PasswordField` - Password input with visibility toggle
- `ProfilePicMenu` - Profile picture menu component with dropdown and sidebar variants
  - `variant="dropdown"` (default): Renders as clickable avatar with dropdown menu (for navbar/header)
  - `variant="sidebar"`: Shows profile picture and name in sidebar, clicking opens dropdown menu (for sidebar navigation)
- `ProfilePicMenuWrapper` - Server wrapper with config loading (supports both variants)
- `AlreadyLoggedInGuard` - Guard for logged-in users
- `UnauthorizedGuard` - Guard for unauthorized users

### UI Components

Located in `src/components/ui/`, these are shadcn-based components:

- `Button`, `Input`, `Label`, `Select`, `Checkbox`, `Radio`
- `Dialog`, `AlertDialog`, `Sheet`, `Popover`, `Tooltip`
- `Avatar`, `Badge`, `Card`, `Separator`
- `Form`, `Tabs`, `Table`
- `Sidebar`, `SidebarGroup`, `SidebarMenu`, `SidebarMenuItem` (for sidebar variant)
- `TreeView` - Hierarchical data display with accordion-style expand/collapse
  - Uses `<div role="button">` for triggers instead of `<button>` to support nested interactive elements
  - Keyboard accessible (Tab navigation, Enter/Space to toggle)
  - Prevents hydration errors when action buttons are placed inside tree items
- And more...

---

## ProfilePicMenu Component

The `ProfilePicMenu` component is a versatile widget that displays user authentication state and provides account actions. It supports two rendering variants:

### Variants

#### Dropdown Variant (Default)
- **Use case**: Navbar, header, or top navigation
- **Behavior**: Clickable avatar opens a dropdown menu
- **Props**: `variant="dropdown"` (default)

```typescript
import { ProfilePicMenu } from "hazo_auth/components/layouts/shared";

<ProfilePicMenu 
  variant="dropdown"
  avatar_size="sm"
  className="ml-auto"
/>
```

#### Sidebar Variant
- **Use case**: Sidebar navigation
- **Behavior**: Shows profile picture and name in a `SidebarGroup`. Clicking opens a dropdown menu with account actions
- **Props**: `variant="sidebar"`

```typescript
import { ProfilePicMenu } from "hazo_auth/components/layouts/shared";
import { SidebarContent } from "hazo_auth/components/ui/sidebar";

<SidebarContent>
  {/* Other sidebar groups */}
  <ProfilePicMenu 
    variant="sidebar"
    avatar_size="sm"
    sidebar_group_label="Account"
  />
</SidebarContent>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"dropdown" \| "sidebar"` | `"dropdown"` | Rendering variant |
| `avatar_size` | `"sm" \| "default" \| "lg"` | `"default"` | Avatar size |
| `sidebar_group_label` | `string` | `"Account"` | Label for sidebar variant group |
| `show_single_button` | `boolean` | `false` | Show single button when not authenticated |
| `sign_up_label` | `string` | `"Sign Up"` | Sign up button label |
| `sign_in_label` | `string` | `"Sign In"` | Sign in button label |
| `register_path` | `string` | `"/hazo_auth/register"` | Registration page path |
| `login_path` | `string` | `"/hazo_auth/login"` | Login page path |
| `settings_path` | `string` | `"/hazo_auth/my_settings"` | Settings page path |
| `logout_path` | `string` | `"/api/hazo_auth/logout"` | Logout API endpoint |
| `custom_menu_items` | `ProfilePicMenuMenuItem[]` | `[]` | Custom menu items |
| `className` | `string` | `undefined` | Additional CSS classes |

### Menu Item Types

Menu items support three types:

1. **`info`**: Display-only information (name, email)
2. **`separator`**: Visual separator between menu sections
3. **`link`**: Clickable menu item with navigation

### Configuration

The component can be configured via `hazo_auth_config.ini`:

```ini
[hazo_auth__profile_pic_menu]
show_single_button = false
sign_up_label = Sign Up
sign_in_label = Sign In
register_path = /hazo_auth/register
login_path = /hazo_auth/login
settings_path = /hazo_auth/my_settings
logout_path = /api/hazo_auth/logout
custom_menu_items = info:Phone:+1234567890:3,separator:2,link:My Account:/account:4
```

### Server Wrapper

Use `ProfilePicMenuWrapper` to automatically load configuration:

```typescript
import { ProfilePicMenuWrapper } from "hazo_auth/components/layouts/shared";

<ProfilePicMenuWrapper 
  variant="sidebar"
  avatar_size="sm"
/>
```

---

## Hooks

### Client-Side Hooks

| Hook | Location | Purpose |
|------|----------|---------|
| `use_hazo_auth` | `src/hooks/use_hazo_auth.ts` | Auth status with permissions |
| `use_auth_status` | `src/hooks/use_auth_status.ts` | Basic auth status |
| `use_login_form` | `src/hooks/use_login_form.ts` | Login form state management |
| `trigger_hazo_auth_refresh` | `src/hooks/use_hazo_auth.ts` | Refresh auth across components |
| `trigger_auth_status_refresh` | `src/hooks/use_auth_status.ts` | Refresh basic auth status |

### Example Usage

```typescript
"use client";

// Import from barrel export (recommended)
import { use_hazo_auth, use_auth_status } from "hazo_auth/components/layouts/shared";

// With permissions checking
function AdminPanel() {
  const { authenticated, user, permissions, permission_ok, loading } = use_hazo_auth({
    required_permissions: ["admin_user_management"],
    strict: false,
  });

  if (loading) return <div>Loading...</div>;
  if (!authenticated) return <div>Please log in</div>;
  if (!permission_ok) return <div>Access denied</div>;

  return <div>Admin Panel for {user?.name}</div>;
}

// Simple auth check
function UserProfile() {
  const { authenticated, name, email, loading } = use_auth_status();

  if (loading) return <div>Loading...</div>;
  if (!authenticated) return <div>Please log in</div>;

  return <div>Hello, {name || email}!</div>;
}
```

---

## Services

### Authentication Services

| Service | Location | Functions |
|---------|----------|-----------|
| `registration_service.ts` | `src/lib/services/` | `register_user()` |
| `login_service.ts` | `src/lib/services/` | `authenticate_user()` |
| `password_reset_service.ts` | `src/lib/services/` | `request_password_reset()`, `reset_password()` |
| `password_change_service.ts` | `src/lib/services/` | `change_password()` |
| `email_verification_service.ts` | `src/lib/services/` | `verify_email_token()`, `resend_verification_email()` |

### User Services

| Service | Location | Functions |
|---------|----------|-----------|
| `user_profiles_service.ts` | `src/lib/services/` | `hazo_get_user_profiles()` |
| `user_update_service.ts` | `src/lib/services/` | `update_user_profile()` |
| `profile_picture_service.ts` | `src/lib/services/` | `get_gravatar_url()`, `update_user_profile_picture()` |
| `profile_picture_remove_service.ts` | `src/lib/services/` | `remove_profile_picture()` |

### Token Service

| Service | Location | Functions |
|---------|----------|-----------|
| `token_service.ts` | `src/lib/services/` | `create_token()`, `validate_token()` |

### Email Service

| Service | Location | Functions |
|---------|----------|-----------|
| `email_service.ts` | `src/lib/services/` | `send_email()`, `send_template_email()` |

**Template Types:**
- `email_verification` - Email verification template
- `forgot_password` - Password reset template
- `password_changed` - Password changed notification

### HRBAC Services (Hierarchical Role-Based Access Control)

**Optional services** - only used when HRBAC is enabled via configuration.

| Service | Location | Functions |
|---------|----------|-----------|
| `scope_service.ts` | `src/lib/services/` | Scope CRUD operations and hierarchy navigation |
| `scope_labels_service.ts` | `src/lib/services/` | Custom scope labels per organization |
| `user_scope_service.ts` | `src/lib/services/` | User scope assignments and access checking |

**scope_service.ts Functions:**
- `get_scopes_by_level(adapter, level, org?)` - Get all scopes for a level
- `get_scope_by_id(adapter, level, scope_id)` - Get single scope by UUID
- `get_scope_by_seq(adapter, level, seq)` - Get single scope by friendly ID
- `create_scope(adapter, level, data)` - Create new scope with parent validation
- `update_scope(adapter, level, scope_id, data)` - Update scope name or parent
- `delete_scope(adapter, level, scope_id)` - Delete scope (cascades to children)
- `get_scope_children(adapter, level, scope_id)` - Get immediate children
- `get_scope_ancestors(adapter, level, scope_id)` - Get all ancestors up to L1
- `get_scope_descendants(adapter, level, scope_id)` - Get all descendants down to L7
- `get_scope_tree(adapter, org)` - Build nested tree structure for an organization
- `get_all_scope_trees(adapter)` - Build trees for all organizations
- `is_valid_scope_level(level)` - Validate scope level string
- `get_parent_level(level)` - Get parent level for a scope level
- `get_child_level(level)` - Get child level for a scope level

**scope_labels_service.ts Functions:**
- `get_scope_labels(adapter, org)` - Get all labels for an organization
- `get_scope_labels_with_defaults(adapter, org, custom_defaults?)` - Labels with fallback
- `get_label_for_level(adapter, org, scope_type, custom_default?)` - Single label lookup
- `upsert_scope_label(adapter, org, scope_type, label)` - Create or update label
- `batch_upsert_scope_labels(adapter, org, labels[])` - Bulk save labels from UI
- `delete_scope_label(adapter, org, scope_type)` - Revert to default label

**user_scope_service.ts Functions:**
- `get_user_scopes(adapter, user_id)` - Get all scope assignments for a user
- `get_users_by_scope(adapter, scope_type, scope_id)` - Get users assigned to a scope
- `assign_user_scope(adapter, user_id, scope_type, scope_id, scope_seq)` - Assign scope to user
- `remove_user_scope(adapter, user_id, scope_type, scope_id)` - Remove scope assignment
- `update_user_scopes(adapter, user_id, new_scopes[])` - Bulk replace assignments
- `check_user_scope_access(adapter, user_id, target_scope_type, target_scope_id?, target_scope_seq?)` - **Core access checking with inheritance**
  - Checks direct assignment OR ancestor-based access
  - Returns `{ has_access, access_via?, user_scopes? }`
  - Used by `hazo_get_auth()` for scope-based authorization
- `get_user_effective_scopes(adapter, user_id)` - Calculate all accessible scopes (direct + inherited)

**HRBAC Architecture Details:**

1. **Scope Hierarchy:**
   - 7 levels: L1 (root) → L2 → L3 → L4 → L5 → L6 → L7 (leaf)
   - Each level (except L1) has `parent_scope_id` referencing parent level
   - Foreign key CASCADE DELETE ensures referential integrity

2. **Access Inheritance Algorithm:**
   - User assigned to L2 automatically has access to all L3, L4, L5, L6, L7 under that L2
   - Access checking: First check direct assignment, then traverse ancestors
   - Time complexity: O(log n) for hierarchical lookup with indexed parent_scope_id

3. **Caching Strategy:**
   - `scope_cache.ts` - LRU cache with TTL (configurable: default 5000 entries, 15min TTL)
   - Smart invalidation using cache versions per scope
   - Methods: `get()`, `set()`, `invalidate_user()`, `invalidate_by_scope()`, `invalidate_all()`
   - Cache key: user_id → scopes[]
   - Invalidation: When scope assignment changes, only affected users invalidated

4. **Database Performance:**
   - Indexes on `parent_scope_id` for efficient ancestor/descendant queries
   - Indexes on `org`, `seq` for quick lookups
   - Composite primary key on `hazo_user_scopes(user_id, scope_type, scope_id)`

5. **Type Safety:**
   - TypeScript enums for `ScopeLevel` type
   - Type guards (`is_valid_scope_level()`) prevent invalid usage
   - Compile-time and runtime validation

---

## API Routes

All API routes follow a consistent pattern:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { get_hazo_connect_instance } from "hazo_auth/server/hazo_connect_instance.server";
import { create_app_logger } from "hazo_auth/lib/app_logger";
import { get_filename, get_line_number } from "hazo_auth/lib/utils/api_route_helpers";

export async function POST(request: NextRequest) {
  const logger = create_app_logger();

  try {
    const body = await request.json();
    const hazoConnect = get_hazo_connect_instance();
    
    const result = await some_service_function(hazoConnect, body);
    
    logger.info("operation_successful", {
      filename: get_filename(),
      line_number: get_line_number(),
    });
    
    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";
    
    logger.error("operation_failed", {
      filename: get_filename(),
      line_number: get_line_number(),
      error: error_message,
    });
    
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
```

### Authentication Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/hazo_auth/register` | POST | User registration |
| `/api/hazo_auth/login` | POST | User login |
| `/api/hazo_auth/logout` | POST | User logout |
| `/api/hazo_auth/me` | GET | **Standardized user info with permissions (RECOMMENDED)** |
| `/api/hazo_auth/get_auth` | POST | Get auth with permissions (server-side utility endpoint) |
| `/api/hazo_auth/forgot_password` | POST | Request password reset |
| `/api/hazo_auth/reset_password` | POST | Reset password with token |
| `/api/hazo_auth/validate_reset_token` | GET | Validate reset token |
| `/api/hazo_auth/verify_email` | GET | Verify email with token |
| `/api/hazo_auth/resend_verification` | POST | Resend verification email |

#### `/api/hazo_auth/me` - Standardized Endpoint

**⚠️ IMPORTANT: Use this endpoint for all client-side authentication checks.**

The `/api/hazo_auth/me` endpoint is the **standardized endpoint** that ensures consistent response format across all projects. It always includes permissions and user information in a unified structure.

**Response Format (Authenticated):**
```typescript
{
  authenticated: true,
  // Top-level fields (for backward compatibility)
  user_id: string,
  email: string,
  name: string | null,
  email_verified: boolean,
  last_logon: string | undefined,
  profile_picture_url: string | null,
  profile_source: "upload" | "library" | "gravatar" | "custom" | undefined,
  // Permissions (always included)
  user: {
    id: string,
    email_address: string,
    name: string | null,
    is_active: boolean,
    profile_picture_url: string | null,
  },
  permissions: string[],
  permission_ok: boolean,
  missing_permissions?: string[],
}
```

**Response Format (Not Authenticated):**
```typescript
{
  authenticated: false
}
```

**Why Use `/api/hazo_auth/me`?**
- ✅ **Standardized format** - Always returns the same structure
- ✅ **Always includes permissions** - No need for separate permission checks
- ✅ **Backward compatible** - Top-level fields work with existing code
- ✅ **Single source of truth** - Prevents downstream variations

**Implementation:** The endpoint uses `hazo_get_auth()` internally and adds additional user fields (email_verified, last_logon, profile_source) from the database to provide a comprehensive response.

### Profile Management Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/update_user` | PATCH | Update user profile |
| `/api/auth/change_password` | POST | Change password |
| `/api/auth/upload_profile_picture` | POST | Upload profile picture |
| `/api/auth/remove_profile_picture` | DELETE | Remove profile picture |
| `/api/auth/library_photos` | GET | Get library photos |

### HRBAC Routes (Scope Management)

**Optional routes** - only used when HRBAC is enabled.

| Route | Method | Description | Required Permission |
|-------|--------|-------------|---------------------|
| `/api/hazo_auth/scope_management/scopes` | GET | Get scopes for a level and org | `admin_scope_hierarchy_management` |
| `/api/hazo_auth/scope_management/scopes` | POST | Create new scope | `admin_scope_hierarchy_management` |
| `/api/hazo_auth/scope_management/scopes/:id` | PUT | Update scope | `admin_scope_hierarchy_management` |
| `/api/hazo_auth/scope_management/scopes/:id` | DELETE | Delete scope (cascades) | `admin_scope_hierarchy_management` |
| `/api/hazo_auth/scope_management/tree` | GET | Get scope tree for org | `admin_scope_hierarchy_management` |
| `/api/hazo_auth/scope_management/labels` | GET | Get scope labels for org | `admin_scope_hierarchy_management` |
| `/api/hazo_auth/scope_management/labels` | POST | Upsert scope label | `admin_scope_hierarchy_management` |
| `/api/hazo_auth/scope_management/labels/batch` | POST | Batch upsert labels | `admin_scope_hierarchy_management` |
| `/api/hazo_auth/user_management/users/scopes` | GET | Get user's scope assignments | `admin_user_scope_assignment` |
| `/api/hazo_auth/user_management/users/scopes` | POST | Assign scope to user | `admin_user_scope_assignment` |
| `/api/hazo_auth/user_management/users/scopes` | PUT | Bulk update user scopes | `admin_user_scope_assignment` |
| `/api/hazo_auth/user_management/users/scopes/:id` | DELETE | Remove scope assignment | `admin_user_scope_assignment` |
| `/api/hazo_auth/rbac_test` | POST | Test permissions and scope access | `admin_test_access` |

**Example Request (Create Scope):**
```typescript
POST /api/hazo_auth/scope_management/scopes
{
  "level": "hazo_scopes_l2",
  "org": "acme_corp",
  "name": "Engineering Division",
  "parent_scope_id": "uuid-of-l1-scope"
}
```

**Example Request (Assign Scope):**
```typescript
POST /api/hazo_auth/user_management/users/scopes
{
  "user_id": "uuid-of-user",
  "scope_type": "hazo_scopes_l2",
  "scope_id": "uuid-of-scope",
  "scope_seq": "L2_005"
}
```

**Example Request (Test Scope Access):**
```typescript
POST /api/hazo_auth/rbac_test
{
  "test_user_id": "uuid-of-user-to-test",
  "required_permissions": ["view_reports"],
  "scope_type": "hazo_scopes_l3",
  "scope_id": "uuid-of-scope"
}

Response:
{
  "authenticated": true,
  "permission_ok": true,
  "scope_ok": true,
  "scope_access_via": {
    "scope_type": "hazo_scopes_l2",
    "scope_id": "parent-scope-uuid",
    "scope_seq": "L2_005"
  },
  "user_scopes": [...]
}
```

**Implementation Notes:**
- The route correctly uses `users_service.findBy()` (hazo_connect API) instead of `users_service.read()`
- Scope access checking calls `check_user_scope_access()` with individual parameters, not an object
- Client component fetches user's role IDs first, then retrieves all roles with permissions and filters to user's roles
- Client component includes `&include_effective=true` in scope fetch URL to retrieve `direct_scopes` field

---

## Authentication System

### Cookie-Based Authentication

Authentication is stored in HTTP-only cookies:
- `hazo_auth_user_id` - User ID
- `hazo_auth_user_email` - User email address
- Cookies are set on login (30-day expiry) and cleared on logout
- HttpOnly, Secure in production, SameSite: lax

### Server-Side Utilities

**For API Routes** (`src/lib/auth/auth_utils.server.ts`):

```typescript
import { 
  get_authenticated_user, 
  is_authenticated, 
  require_auth 
} from "hazo_auth/lib/auth/auth_utils.server";

// Get user if authenticated
const authResult = await get_authenticated_user(request);
if (authResult.authenticated) {
  console.log(authResult.user_id, authResult.email);
}

// Simple boolean check
const isAuth = await is_authenticated(request);

// Require auth (throws if not authenticated)
const user = await require_auth(request);
```

**For Server Components** (`src/lib/auth/server_auth.ts`):

```typescript
import { 
  get_server_auth_user, 
  is_server_authenticated 
} from "hazo_auth/lib/auth/server_auth";

const authResult = await get_server_auth_user();
const isAuth = await is_server_authenticated();
```

**Advanced Auth with Permissions** (`src/lib/auth/hazo_get_auth.server.ts`):

```typescript
import { hazo_get_auth } from "hazo_auth/lib/auth/hazo_get_auth.server";

const authResult = await hazo_get_auth(request, {
  required_permissions: ["admin_user_management"],
  strict: true, // Throws PermissionError if missing
});

// authResult.user.url_on_logon contains custom redirect URL
```

**Client-Side Authentication (Recommended):**

For client-side code, use the standardized `/api/hazo_auth/me` endpoint:

```typescript
// Client-side (React component)
const response = await fetch("/api/hazo_auth/me", {
  method: "GET",
  credentials: "include",
});

const data = await response.json();

if (data.authenticated) {
  console.log("User:", data.user);
  console.log("Permissions:", data.permissions);
  console.log("Permission OK:", data.permission_ok);
}
```

The `use_auth_status` hook automatically uses this endpoint and includes permissions in its return value.

### Route Protection (Proxy/Middleware)

**Note:** Next.js is migrating from `middleware.ts` to `proxy.ts` (see [Next.js documentation](https://nextjs.org/docs/messages/middleware-to-proxy)). The functionality remains the same.

#### JWT Session Tokens (v1.6.6+)

**New Feature:** hazo_auth now issues JWT session tokens on login for Edge-compatible authentication:

- **Cookie Name:** `hazo_auth_session`
- **Token Type:** JWT (signed with `JWT_SECRET`)
- **Expiry:** 30 days (configurable)
- **Payload:** `{ user_id, email, iat, exp }`
- **Validation:** Signature and expiry checked without database access (Edge-compatible)

#### Using in Proxy/Middleware

**Recommended: JWT Validation**

```typescript
// proxy.ts (or middleware.ts)
import { validate_session_cookie } from "hazo_auth/server/middleware";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (pathname.startsWith("/members")) {
    const { valid } = await validate_session_cookie(request);
    if (!valid) {
      return NextResponse.redirect(new URL("/hazo_auth/login", request.url));
    }
  }
  
  return NextResponse.next();
}
```

**Edge Runtime Limitations:**
- Proxy/middleware runs in Edge Runtime (cannot use Node.js APIs like SQLite)
- `hazo_get_auth` cannot be used directly (requires database access)
- JWT validation works in Edge Runtime (no database needed)
- Full user validation happens in API routes/layouts

#### Backward Compatibility

- Existing `hazo_auth_user_id` and `hazo_auth_user_email` cookies still work
- `hazo_get_auth` falls back to simple cookies if JWT not present
- Both authentication methods supported simultaneously

---

## Logging

### Server-Side Logging

All server-side code uses the logger service:

```typescript
import { create_app_logger } from "hazo_auth/lib/app_logger";
import { get_filename, get_line_number } from "hazo_auth/lib/utils/api_route_helpers";

const logger = create_app_logger();

logger.info("operation_successful", {
  filename: get_filename(),
  line_number: get_line_number(),
  user_id,
  additional_data: "value",
});

logger.error("operation_failed", {
  filename: get_filename(),
  line_number: get_line_number(),
  error: error_message,
  error_stack,
});
```

### Client-Side Feedback

Client-side components use toast notifications (Sonner) for user-facing errors instead of console logging.

---

## Constraints

1. All database interactions must use `hazo_connect` adapter passed as parameter
2. All server-side code must use logger service, not `console.log/error/warn`
3. All configuration must be read from `hazo_auth_config.ini` using shared config loader
4. All user-facing messages and sizes must be configurable via config file
5. Client components cannot directly import server-side config - values must be passed as props
6. API routes must use shared `get_filename()` and `get_line_number()` helpers for logging
7. **Internal imports must use relative paths** (e.g., `../../ui/button`) so the compiled output works correctly in consuming projects
8. Only the main entry points are exposed via `package.json` exports - internal modules are not directly importable by consumers

---

## Testing

### Test Database

Tests use an SQLite database located at `__tests__/fixtures/hazo_auth.sqlite`.

### Running Tests

```bash
npm test
```

### Test Utilities

Test utilities are available for:
- Creating test users
- Mocking authentication
- Setting up test configurations

---

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start Next.js development server |
| `build` | `npm run build` | Build Next.js application |
| `build:pkg` | `npm run build:pkg` | Build npm package |
| `storybook` | `npm run storybook` | Start Storybook |
| `test` | `npm test` | Run tests |
| `init-users` | `npm run init-users` | Initialize default permissions and super user |

### CLI Commands (for consuming projects)

| Command | Description |
|---------|-------------|
| `npx hazo_auth init` | Initialize project (creates directories, copies config files) |
| `npx hazo_auth generate-routes` | Generate API routes in consuming project |
| `npx hazo_auth generate-routes --pages` | Generate API routes + page routes |
| `npx hazo_auth validate` | Check setup and configuration |
| `npx hazo_auth --help` | Show help and all available commands |

### Migration Script

```bash
# Apply specific migration
npx tsx scripts/apply_migration.ts migrations/003_add_url_on_logon_to_hazo_users.sql

# Apply all pending migrations (when no argument provided)
npx tsx scripts/apply_migration.ts
```

---

## Troubleshooting

### Common Issues

**1. "Module not found" errors when consuming the package:**
- Ensure you're importing from exposed entry points only (e.g., `hazo_auth/components/layouts/login`, not `hazo_auth/components/ui/button`)
- Internal modules like UI components are not directly importable - use barrel exports from `hazo_auth/components/layouts/shared`
- Check that the package is built (`npm run build:pkg`)

**2. Configuration not loading:**
- Configuration files must be in the project root (where `process.cwd()` points)
- Copy example config files: `cp node_modules/hazo_auth/*.example.ini ./`

**3. Database connection errors:**
- Verify database configuration in `hazo_auth_config.ini`
- For SQLite, ensure the database file exists at the configured path

**4. Email not sending:**
- Check `hazo_notify_config.ini` configuration
- Verify `ZEPTOMAIL_API_KEY` environment variable (if using Zeptomail)
- Check email service logs for errors

**5. Permission denied errors:**
- Ensure user has required permissions in database
- Check `hazo_role_permissions` and `hazo_user_roles` tables
- Use `npm run init-users` to set up default permissions

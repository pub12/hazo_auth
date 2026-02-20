## hazo_auth - Authentication UI Component Package

A reusable authentication UI component package powered by Next.js, TailwindCSS, and shadcn. It integrates `hazo_config` for configuration management and `hazo_connect` for data access, enabling future components to stay aligned with platform conventions.

### What's New in v5.1.28

**Schema Validation, Permission Constants & DX Improvements**

- **Schema validation** - `npx hazo_auth validate` now checks SQLite schema: required tables, TEXT ID types, `hazo_user_scopes` columns, admin permissions, and warns about v4 remnant tables
- **Permission constants** - New `HAZO_AUTH_PERMISSIONS` and `ALL_ADMIN_PERMISSIONS` exports from both `hazo_auth` and `hazo_auth/client` for programmatic permission checks
- **CLI fix** - CLI wrapper now sets `--conditions react-server` in NODE_OPTIONS, fixing "server-only" import errors when running `npx hazo_auth validate`, `init-permissions`, etc.
- **Silent permission fix** - `hazo_get_auth` now applies `String()` normalization to role_id/permission_id comparisons, fixing empty permissions when SQLite returns INTEGER IDs
- **DB-generated IDs** - `init-permissions` no longer generates UUIDs client-side; lets the database generate IDs (supports both TEXT UUID and INTEGER PK schemas)
- **Dev debug info** - `withAuth` 403 responses and `UserManagementLayout` "Access Denied" view now include permission debug details in development mode
- **Import cleanup** - Removed `.js` extensions from internal imports for better TypeScript/bundler compatibility

### What's New in v5.1.27

**Mandatory Cookie Prefix** - `cookie_prefix` is now required for all consuming apps.

- **Breaking:** `get_cookies_config()` throws if `cookie_prefix` is not set in `[hazo_auth__cookies]` config section
- **Breaking:** `get_cookie_prefix_edge()` throws if `HAZO_AUTH_COOKIE_PREFIX` env var is not set
- **Validation:** `npx hazo_auth validate` now checks for cookie_prefix configuration
- **Init:** `.env.local.example` template includes `HAZO_AUTH_COOKIE_PREFIX` as required
- **Docs:** shadcn/ui components are bundled — consumers do NOT need to install them separately

### What's New in v5.1.26

**Consumer Setup Improvements** - Five fixes that improve the out-of-box experience for new consumers:

- **Multi-tenancy bypass** - `enable_multi_tenancy = false` (the default) now correctly skips scope/invitation checks in OAuth and post-verification flows. No more redirect loops to `/hazo_auth/create_firm` for simple apps.
- **Clear SQLite errors** - Missing `sqlite_path` in config now throws a clear error instead of silently falling back to a test fixture database. Unrecognized config keys produce warnings with typo suggestions.
- **Auto-schema creation** - `npx hazo_auth init` now creates the SQLite database with all required tables automatically. Also available standalone via `npx hazo_auth init-db`. Use `npx hazo_auth schema` to print the canonical SQL.
- **Auth page images** - `npx hazo_auth init` now copies default login/register/forgot-password images to `public/hazo_auth/images/`.
- **Graceful image fallback** - Visual panels on auth pages fall back to a colored background instead of crashing when images are missing.

### What's New in v5.2.0 ⚠️ BREAKING CHANGE

**Server/Client Module Separation** - Complete fix for "Module not found: Can't resolve 'fs'" errors.

**Breaking Change - New Import Path:**
```typescript
// BEFORE (v5.1.x) - Server imports from main entry
import { hazo_get_auth, get_login_config } from "hazo_auth";

// AFTER (v5.2.0) - Server imports from dedicated entry point
import { hazo_get_auth, get_login_config } from "hazo_auth/server-lib";

// Client imports unchanged
import { ProfilePicMenu, use_auth_status } from "hazo_auth/client";
import { cn } from "hazo_auth"; // Still works
```

**Key Changes:**
- ✅ **New `hazo_auth/server-lib` entry point** - All server-only exports (auth functions, services, config loaders) now here
- ✅ **Clean main entry** - `hazo_auth` is now client-safe (components, types, utilities only)
- ✅ **Peer dependencies** - `hazo_config` and `hazo_connect` are now peer dependencies (install in your app)
- ✅ **Fixed import path** - Uses `hazo_config/server` (not deprecated `hazo_config/dist/lib`)

**Required Migration:**
```bash
# 1. Install peer dependencies
npm install hazo_config hazo_connect hazo_logs

# 2. Update imports in your server-side code
# Change: import { hazo_get_auth } from "hazo_auth"
# To:     import { hazo_get_auth } from "hazo_auth/server-lib"
```

### What's New in v5.1.23 🔧

**FIX: Server/Client Bundling Issue** - Added `import "server-only"` guards to prevent accidental client bundling.

**Key Changes:**
- ✅ **Server-Only Guards** - Added `import "server-only"` to all server files preventing accidental client bundling
- ✅ **hazo_logs v1.0.10** - Upgraded with conditional exports for browser/node environments
- ✅ **Client Logging Support** - Logs API route now exports POST for client-side log ingestion

### What's New in v5.1.5 🐛

**CRITICAL BUGFIX**: Fixed incomplete migration from v4.x to v5.x - several files were still referencing the deprecated `hazo_user_roles` table instead of `hazo_user_scopes`. This release completes the scope-based role assignment architecture introduced in v5.0.

**Key Fixes:**
- ✅ **hazo_get_auth** - Now correctly fetches roles from `hazo_user_scopes`
- ✅ **Role IDs** - Changed from `number[]` to `string[]` (UUIDs) throughout codebase
- ✅ **User Management** - Updated for scope-based role assignments
- ✅ **Cache System** - Fixed type inconsistencies with UUID role IDs

If you're on v5.x and experiencing permission/role issues, upgrade to v5.1.5 immediately.

### What's New in v5.0 🚀

**BREAKING CHANGE: Scope-Based Multi-Tenancy** - Complete architectural redesign for simpler, more flexible multi-tenancy!

- ✅ **Unified Scope System** - Single `hazo_scopes` table replaces 8 separate tables (1 org + 7 scope levels)
- ✅ **Membership-Based** - Users assigned to scopes via `hazo_user_scopes` (not org_id on user record)
- ✅ **Invitation System** - Built-in invitation flow for onboarding new users to existing scopes
- ✅ **Create Firm Flow** - New users create their own firm (scope) after email verification
- ✅ **Post-Verification Routing** - Smart routing after email verification: invitations → create firm → default redirect
- ✅ **Unlimited Hierarchy** - Flexible parent-child relationships, no fixed depth limit
- ✅ **Simpler Architecture** - Fewer tables, fewer joins, easier to understand
- ✅ **New CLI Command** - `npx hazo_auth init-permissions` for flexible permission setup

**Migrating from v4.x?** This is a breaking change. Run the migration:

```bash
# 1. Backup your database first!
# 2. Run the scope consolidation migration
npm run migrate migrations/009_scope_consolidation.sql

# 3. Update configuration (remove org settings, add invitation/create firm settings)
# 4. Update code (remove org-related API calls and components)
# 5. Test thoroughly
```

See [CHANGE_LOG.md](./CHANGE_LOG.md) for detailed migration guide, rationale, and breaking changes.

### What's New in v2.0

**Zero-Config Server Components** - Authentication pages now work out-of-the-box with ZERO configuration required!

- ✅ **True "Drop In and Use"** - Pages initialize everything server-side, no loading state
- ✅ **Better Performance** - Smaller JS bundles, faster page loads, immediate rendering
- ✅ **Flexible API Paths** - Customize endpoints globally via `HazoAuthProvider` context
- ✅ **Embeddable Components** - MySettings and UserManagement adapt to any layout
- ✅ **Sensible Defaults** - INI files are now optional, defaults built-in

### Also Includes (v1.6.6+)

- **JWT Session Tokens for Edge-Compatible Authentication**: Secure Edge Runtime authentication in Next.js proxy/middleware files. See [Proxy/Middleware Authentication](#proxymiddleware-authentication) for details.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration Setup](#configuration-setup)
- [Database Setup](#database-setup)
- [Google OAuth Setup](#google-oauth-setup)
- [Using Components](#using-components)
- [Authentication Service](#authentication-service)
- [Proxy/Middleware Authentication](#proxymiddleware-authentication)
- [Profile Picture Menu Widget](#profile-picture-menu-widget)
- [User Types (Optional Feature)](#user-types-optional-feature)
- [User Profile Service](#user-profile-service)
- [Local Development](#local-development)

---

## Installation

```bash
# Install hazo_auth and required peer dependencies
npm install hazo_auth hazo_config hazo_connect hazo_logs
```

**Note:** `hazo_config`, `hazo_connect`, and `hazo_logs` are required peer dependencies.

---

## Quick Start

The fastest way to get started is using the CLI commands:

```bash
# 1. Install the package and peer dependencies
npm install hazo_auth hazo_config hazo_connect hazo_logs

# 2. Initialize your project (directories, config, database, images)
npx hazo_auth init

# 3. Configure cookie prefix (REQUIRED)
# Edit config/hazo_auth_config.ini and set a unique prefix:
#   [hazo_auth__cookies]
#   cookie_prefix = myapp_

# 4. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local and set:
#   HAZO_AUTH_COOKIE_PREFIX=myapp_   (MUST match cookie_prefix above)
#   JWT_SECRET=<your-secret>
#   ZEPTOMAIL_API_KEY=<your-key>

# 5. Initialize default permissions and roles
npx hazo_auth init-users

# 6. Generate API routes and pages
npx hazo_auth generate-routes --pages

# 7. Start your dev server
npm run dev
```

That's it! Visit `http://localhost:3000/hazo_auth/login` to see the login page.

### Tailwind v4 Setup (Required for Tailwind v4 Users)

If you're using Tailwind v4, add this to your `globals.css` AFTER the tailwindcss import:

```css
@import "tailwindcss";

/* Required: Enable Tailwind to scan hazo_auth package classes */
@source "../node_modules/hazo_auth/dist";
```

**Important:** Without this directive, Tailwind classes in hazo_auth components (hover states, colors, spacing) will not be compiled, resulting in broken styling.

### CLI Commands

```bash
npx hazo_auth init                  # Initialize project (creates dirs, copies config)
npx hazo_auth generate-routes       # Generate API routes only
npx hazo_auth generate-routes --pages  # Generate API routes + pages
npx hazo_auth validate              # Check your setup and configuration
npx hazo_auth --help                # Show all commands
```

### Using Zero-Config Page Components (v2.0+)

**NEW in v2.0:** All pages are now React Server Components that initialize everything on the server. No configuration, no loading state, no hassle!

```typescript
// app/login/page.tsx - That's literally it!
import { LoginPage } from "hazo_auth/pages/login";

export default function Page() {
  return <LoginPage />;
}
```

**What happens behind the scenes:**
- ✅ Database connection initialized server-side via hazo_connect singleton
- ✅ Configuration loaded from hazo_auth_config.ini (or uses sensible defaults)
- ✅ All props automatically configured
- ✅ Navbar automatically rendered based on config (no manual wrapping needed)
- ✅ Page renders immediately - NO loading state!

**Available zero-config pages:**

| Page | Import | Description |
|------|--------|-------------|
| **LoginPage** | `hazo_auth/pages/login` | Login form with forgot password link |
| **RegisterPage** | `hazo_auth/pages/register` | Registration with password validation |
| **ForgotPasswordPage** | `hazo_auth/pages/forgot_password` | Request password reset email |
| **ResetPasswordPage** | `hazo_auth/pages/reset_password` | Set new password with token |
| **VerifyEmailPage** | `hazo_auth/pages/verify_email` | Email verification handler |
| **MySettingsPage** | `hazo_auth/pages/my_settings` | User profile and password change |

**Example - Complete Auth Flow:**

```typescript
// app/login/page.tsx
import { LoginPage } from "hazo_auth/pages/login";
export default function Page() {
  return <LoginPage />;
}

// app/register/page.tsx
import { RegisterPage } from "hazo_auth/pages/register";
export default function Page() {
  return <RegisterPage />;
}

// app/settings/page.tsx
import { MySettingsPage } from "hazo_auth/pages/my_settings";
export default function Page() {
  return <MySettingsPage />;
}
```

**Customizing Visual Appearance (Optional):**

```typescript
// All pages accept optional visual props
import { LoginPage } from "hazo_auth/pages/login";

export default function Page() {
  return (
    <LoginPage
      image_src="/custom-login-image.jpg"
      image_alt="My company logo"
      image_background_color="#f0f0f0"
    />
  );
}
```

**Embedding MySettings in Your Dashboard:**

```typescript
// MySettings is now container-agnostic!
import { MySettingsPage } from "hazo_auth/pages/my_settings";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <Sidebar />
      <main className="p-6">
        <MySettingsPage className="max-w-4xl mx-auto" />
      </main>
    </DashboardLayout>
  );
}
```

**Custom API Paths:**

If you use custom API endpoints (not `/api/hazo_auth/`), wrap your app with `HazoAuthProvider`:

```typescript
// app/layout.tsx
import { HazoAuthProvider } from "hazo_auth";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <HazoAuthProvider apiBasePath="/api/v1/auth">
          {children}
        </HazoAuthProvider>
      </body>
    </html>
  );
}
```

### Manual Setup (Advanced)

If you prefer manual control, you can use the layout components directly:

```typescript
// Import layout components
import { LoginLayout } from "hazo_auth/components/layouts/login";
import { RegisterLayout } from "hazo_auth/components/layouts/register";
import { ForgotPasswordLayout } from "hazo_auth/components/layouts/forgot_password";
import { ResetPasswordLayout } from "hazo_auth/components/layouts/reset_password";
import { EmailVerificationLayout } from "hazo_auth/components/layouts/email_verification";
import { MySettingsLayout } from "hazo_auth/components/layouts/my_settings";
import { UserManagementLayout } from "hazo_auth/components/layouts/user_management";

// Import shared components and hooks from barrel export
import {
  ProfilePicMenu,
  ProfilePicMenuWrapper,
  ProfileStamp,
  use_hazo_auth,
  use_auth_status
} from "hazo_auth/components/layouts/shared";

// Import server-side utilities
import { hazo_get_auth } from "hazo_auth/lib/auth/hazo_get_auth.server";
```

---

## Required Dependencies

**Peer Dependencies (Required):**
```bash
npm install hazo_config hazo_connect hazo_logs
```

**UI Components:** All shadcn/ui components are bundled with hazo_auth. You do NOT need to install them separately.

**Toast Notifications:** Add the Toaster component to your app layout:

```tsx
// app/layout.tsx
import { Toaster } from "sonner";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

---

## Client vs Server Imports

hazo_auth provides separate entry points for client and server code to avoid bundling Node.js modules in the browser:

### Client Components

For client components (browser-safe, no Node.js dependencies):

```typescript
// Use hazo_auth/client for client components
import {
  ProfilePicMenu,
  ProfileStamp,
  use_auth_status,
  use_hazo_auth,
  cn
} from "hazo_auth/client";
```

### Server Components / API Routes

For server-side code (API routes, Server Components):

```typescript
// Use hazo_auth/server-lib for server-side code
import { hazo_get_auth, get_config_value } from "hazo_auth/server-lib";
import { hazo_get_user_profiles } from "hazo_auth/server-lib";
```

### Why This Matters

Server-only code (Node.js APIs like `fs`, `path`, database access) must be kept separate from client bundles. The `hazo_auth/server-lib` entry point:
- Contains all server-only exports (auth functions, services, config loaders)
- Includes `import "server-only"` guard that throws build errors if imported in client code
- Uses peer dependencies (`hazo_config`, `hazo_connect`, `hazo_logs`) from your app

If you accidentally import from `hazo_auth/server-lib` in a client component, you'll get a helpful build error instead of a cryptic "Can't resolve 'fs'" message.

---

## Dark Mode / Theming

hazo_auth supports dark mode via CSS custom properties. To enable dark mode:

### 1. Import the theme CSS

Copy the variables file to your project:

```bash
cp node_modules/hazo_auth/src/styles/hazo-auth-variables.css ./app/hazo-auth-theme.css
```

Import in your `globals.css`:

```css
@import "./hazo-auth-theme.css";
```

### 2. CSS Variables Reference

You can customize the theme by overriding these variables:

```css
:root {
  /* Backgrounds */
  --hazo-bg-subtle: #f8fafc;      /* Light background */
  --hazo-bg-muted: #f1f5f9;       /* Slightly darker background */
  
  /* Text */
  --hazo-text-primary: #0f172a;   /* Primary text */
  --hazo-text-secondary: #334155; /* Secondary text */
  --hazo-text-muted: #64748b;     /* Muted/subtle text */
  
  /* Borders */
  --hazo-border: #e2e8f0;         /* Standard border */
}

.dark {
  /* Dark mode overrides */
  --hazo-bg-subtle: #18181b;
  --hazo-bg-muted: #27272a;
  --hazo-text-primary: #fafafa;
  --hazo-text-secondary: #d4d4d8;
  --hazo-text-muted: #a1a1aa;
  --hazo-border: #3f3f46;
}
```

The dark class is typically added by next-themes or similar theme providers.

---

## Configuration Setup

After installing the package, you need to set up configuration files in your project root:

### 1. Copy the example config files to your project root:

```bash
cp node_modules/hazo_auth/hazo_auth_config.example.ini ./hazo_auth_config.ini
cp node_modules/hazo_auth/hazo_notify_config.example.ini ./hazo_notify_config.ini
```

### 2. Customize the configuration files:

- Edit `hazo_auth_config.ini` to configure authentication settings, database connection, UI labels, and more
- Edit `hazo_notify_config.ini` to configure email service settings (Zeptomail, SMTP, etc.)

### 3. Set up environment variables (recommended for sensitive data):

- Create a `.env.local` file in your project root
- Add `ZEPTOMAIL_API_KEY=your_api_key_here` (if using Zeptomail)
- Add `JWT_SECRET=your_secure_random_string_at_least_32_characters` (required for JWT session tokens)
- Add other sensitive configuration values as needed

**Note:** `JWT_SECRET` is required for JWT session token functionality (used for Edge-compatible proxy/middleware authentication). Generate a secure random string at least 32 characters long.

**For Google OAuth (optional):**
```env
# NextAuth.js configuration (required for OAuth)
NEXTAUTH_SECRET=your_secure_random_string_at_least_32_characters
NEXTAUTH_URL=http://localhost:3000  # Change to production URL in production

# Google OAuth credentials (from Google Cloud Console)
HAZO_AUTH_GOOGLE_CLIENT_ID=your_google_client_id
HAZO_AUTH_GOOGLE_CLIENT_SECRET=your_google_client_secret
```

See [Google OAuth Setup](#google-oauth-setup) for detailed instructions.

**For Cookie Customization (optional):**
```env
# Cookie prefix (prevents conflicts when running multiple apps on localhost)
HAZO_AUTH_COOKIE_PREFIX=myapp_

# Cookie domain (optional, for cross-subdomain sharing)
HAZO_AUTH_COOKIE_DOMAIN=.example.com
```

These environment variables are required for Edge Runtime (middleware) when using cookie customization. Also set in `hazo_auth_config.ini`:
```ini
[hazo_auth__cookies]
cookie_prefix = myapp_
cookie_domain = .example.com
```

**Important:** The configuration files must be located in your project root directory (where `process.cwd()` points to), not inside `node_modules`. The package reads configuration from `process.cwd()` at runtime, so storing them elsewhere (including `node_modules/hazo_auth`) will break runtime access.

---

## Database Setup

Before using `hazo_auth`, you need to create the required database tables. The package supports both **PostgreSQL** (for production) and **SQLite** (for local development/testing).

### PostgreSQL Setup

Run the following SQL scripts in your PostgreSQL database:

#### 1. Create the Profile Source Enum Type

```sql
-- Enum type for profile picture source
CREATE TYPE hazo_enum_profile_source_enum AS ENUM ('gravatar', 'custom', 'predefined');

-- Note: hazo_enum_scope_types was removed in v5.0
-- The unified hazo_scopes table uses a TEXT "level" column instead
```

#### 2. Create the Organization Table (Multi-Tenancy)

```sql
-- Organization table for multi-tenancy (create before hazo_users)
CREATE TABLE hazo_org (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    parent_org_id UUID REFERENCES hazo_org(id) ON DELETE SET NULL,
    root_org_id UUID REFERENCES hazo_org(id) ON DELETE SET NULL,
    user_limit INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID,  -- Will reference hazo_users after it's created
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    changed_by UUID
);

CREATE INDEX idx_hazo_org_parent_org_id ON hazo_org(parent_org_id);
CREATE INDEX idx_hazo_org_root_org_id ON hazo_org(root_org_id);
CREATE INDEX idx_hazo_org_active ON hazo_org(active);
```

#### 3. Create the Users Table

```sql
-- Main users table
CREATE TABLE hazo_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_address TEXT NOT NULL UNIQUE,
    password_hash TEXT,                                   -- NULL for OAuth-only users
    name TEXT,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    login_attempts INTEGER NOT NULL DEFAULT 0,
    last_logon TIMESTAMP WITH TIME ZONE,
    profile_picture_url TEXT,
    profile_source hazo_enum_profile_source_enum,
    mfa_secret TEXT,
    url_on_logon TEXT,
    user_type TEXT,                                       -- Optional user categorization
    google_id TEXT UNIQUE,                                -- Google OAuth ID
    auth_providers TEXT DEFAULT 'email',                  -- 'email', 'google', or 'email,google'
    org_id UUID REFERENCES hazo_org(id) ON DELETE SET NULL,
    root_org_id UUID REFERENCES hazo_org(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_hazo_users_email ON hazo_users(email_address);
CREATE INDEX idx_hazo_users_user_type ON hazo_users(user_type);
CREATE UNIQUE INDEX idx_hazo_users_google_id ON hazo_users(google_id);
CREATE INDEX idx_hazo_users_org_id ON hazo_users(org_id);
CREATE INDEX idx_hazo_users_root_org_id ON hazo_users(root_org_id);

-- Add FK constraints to hazo_org after hazo_users exists
ALTER TABLE hazo_org ADD CONSTRAINT fk_hazo_org_created_by
    FOREIGN KEY (created_by) REFERENCES hazo_users(id) ON DELETE SET NULL;
ALTER TABLE hazo_org ADD CONSTRAINT fk_hazo_org_changed_by
    FOREIGN KEY (changed_by) REFERENCES hazo_users(id) ON DELETE SET NULL;
```

**Note:** The `url_on_logon` field is used to store a custom redirect URL for users after successful login. This allows per-user customization of post-login navigation.

#### 4. Create the Refresh Tokens Table

```sql
-- Refresh tokens table (used for password reset, email verification, etc.)
CREATE TABLE hazo_refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES hazo_users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    token_type TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index for token lookups
CREATE INDEX idx_hazo_refresh_tokens_user_id ON hazo_refresh_tokens(user_id);
CREATE INDEX idx_hazo_refresh_tokens_token_type ON hazo_refresh_tokens(token_type);
```

#### 5. Create the Permissions Table

```sql
-- Permissions table for RBAC
CREATE TABLE hazo_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    permission_name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

#### 6. Create the Roles Table

```sql
-- Roles table for RBAC
CREATE TABLE hazo_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

#### 7. Create the Role-Permissions Junction Table

```sql
-- Junction table linking roles to permissions
CREATE TABLE hazo_role_permissions (
    role_id UUID NOT NULL REFERENCES hazo_roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES hazo_permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id)
);

-- Indexes for lookups
CREATE INDEX idx_hazo_role_permissions_role_id ON hazo_role_permissions(role_id);
CREATE INDEX idx_hazo_role_permissions_permission_id ON hazo_role_permissions(permission_id);
```

#### 8. Create the User-Roles Junction Table

```sql
-- Junction table linking users to roles
CREATE TABLE hazo_user_roles (
    user_id UUID NOT NULL REFERENCES hazo_users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES hazo_roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

-- Indexes for lookups
CREATE INDEX idx_hazo_user_roles_user_id ON hazo_user_roles(user_id);
CREATE INDEX idx_hazo_user_roles_role_id ON hazo_user_roles(role_id);
```

### Complete PostgreSQL Setup Script

For convenience, here's the complete SQL script to create all tables at once:

```sql
-- ============================================
-- hazo_auth Database Setup Script (PostgreSQL)
-- ============================================

-- 1. Create enum types
CREATE TYPE hazo_enum_profile_source_enum AS ENUM ('gravatar', 'custom', 'predefined');
-- Note: hazo_enum_scope_types was removed in v5.0 (uses unified hazo_scopes table)

-- 2. Create organization table (multi-tenancy)
CREATE TABLE hazo_org (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    parent_org_id UUID REFERENCES hazo_org(id) ON DELETE SET NULL,
    root_org_id UUID REFERENCES hazo_org(id) ON DELETE SET NULL,
    user_limit INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID,
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    changed_by UUID
);
CREATE INDEX idx_hazo_org_parent_org_id ON hazo_org(parent_org_id);
CREATE INDEX idx_hazo_org_root_org_id ON hazo_org(root_org_id);
CREATE INDEX idx_hazo_org_active ON hazo_org(active);

-- 3. Create users table
CREATE TABLE hazo_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_address TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    name TEXT,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    login_attempts INTEGER NOT NULL DEFAULT 0,
    last_logon TIMESTAMP WITH TIME ZONE,
    profile_picture_url TEXT,
    profile_source hazo_enum_profile_source_enum,
    mfa_secret TEXT,
    url_on_logon TEXT,
    user_type TEXT,
    google_id TEXT UNIQUE,
    auth_providers TEXT DEFAULT 'email',
    org_id UUID REFERENCES hazo_org(id) ON DELETE SET NULL,
    root_org_id UUID REFERENCES hazo_org(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_hazo_users_email ON hazo_users(email_address);
CREATE INDEX idx_hazo_users_user_type ON hazo_users(user_type);
CREATE UNIQUE INDEX idx_hazo_users_google_id ON hazo_users(google_id);
CREATE INDEX idx_hazo_users_org_id ON hazo_users(org_id);
CREATE INDEX idx_hazo_users_root_org_id ON hazo_users(root_org_id);

-- Add FK constraints to hazo_org after hazo_users exists
ALTER TABLE hazo_org ADD CONSTRAINT fk_hazo_org_created_by
    FOREIGN KEY (created_by) REFERENCES hazo_users(id) ON DELETE SET NULL;
ALTER TABLE hazo_org ADD CONSTRAINT fk_hazo_org_changed_by
    FOREIGN KEY (changed_by) REFERENCES hazo_users(id) ON DELETE SET NULL;

-- 4. Create refresh tokens table
CREATE TABLE hazo_refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES hazo_users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    token_type TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_hazo_refresh_tokens_user_id ON hazo_refresh_tokens(user_id);
CREATE INDEX idx_hazo_refresh_tokens_token_type ON hazo_refresh_tokens(token_type);

-- 4. Create permissions table
CREATE TABLE hazo_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    permission_name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 5. Create roles table
CREATE TABLE hazo_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 6. Create role-permissions junction table
CREATE TABLE hazo_role_permissions (
    role_id UUID NOT NULL REFERENCES hazo_roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES hazo_permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id)
);
CREATE INDEX idx_hazo_role_permissions_role_id ON hazo_role_permissions(role_id);
CREATE INDEX idx_hazo_role_permissions_permission_id ON hazo_role_permissions(permission_id);

-- 7. Create user-roles junction table
CREATE TABLE hazo_user_roles (
    user_id UUID NOT NULL REFERENCES hazo_users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES hazo_roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);
CREATE INDEX idx_hazo_user_roles_user_id ON hazo_user_roles(user_id);
CREATE INDEX idx_hazo_user_roles_role_id ON hazo_user_roles(role_id);
```

### SQLite Setup (for local development)

For local development and testing, you can use SQLite. The SQLite schema is slightly different (no UUID type, TEXT used instead):

```sql
-- ============================================
-- hazo_auth Database Setup Script (SQLite)
-- ============================================

-- Users table
CREATE TABLE IF NOT EXISTS hazo_users (
    id TEXT PRIMARY KEY,
    email_address TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT,
    email_verified INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    login_attempts INTEGER NOT NULL DEFAULT 0,
    last_logon TEXT,
    profile_picture_url TEXT,
    profile_source TEXT,
    mfa_secret TEXT,
    url_on_logon TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    changed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Refresh tokens table
CREATE TABLE IF NOT EXISTS hazo_refresh_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES hazo_users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    token_type TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Permissions table
CREATE TABLE IF NOT EXISTS hazo_permissions (
    id TEXT PRIMARY KEY,
    permission_name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    changed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Roles table
CREATE TABLE IF NOT EXISTS hazo_roles (
    id TEXT PRIMARY KEY,
    role_name TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    changed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Role-permissions junction table
CREATE TABLE IF NOT EXISTS hazo_role_permissions (
    role_id TEXT NOT NULL REFERENCES hazo_roles(id) ON DELETE CASCADE,
    permission_id TEXT NOT NULL REFERENCES hazo_permissions(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    changed_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (role_id, permission_id)
);

-- User-roles junction table
CREATE TABLE IF NOT EXISTS hazo_user_roles (
    user_id TEXT NOT NULL REFERENCES hazo_users(id) ON DELETE CASCADE,
    role_id TEXT NOT NULL REFERENCES hazo_roles(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    changed_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, role_id)
);
```

### Initialize Default Permissions and Super User

After creating the tables, you can use the `init-users` script to set up default permissions and a super user:

```bash
npm run init-users
```

This script reads from `hazo_auth_config.ini` and:
1. Creates default permissions from `application_permission_list_defaults`
2. Creates a `default_super_user_role` role with all permissions
3. Assigns the role to the user specified in `default_super_user_email`

### Apply Migrations

To apply database migrations (e.g., adding new fields):

```bash
# Apply a specific migration
npx tsx scripts/apply_migration.ts migrations/003_add_url_on_logon_to_hazo_users.sql

# Or apply all pending migrations
npx tsx scripts/apply_migration.ts
```

---

## Google OAuth Setup

hazo_auth supports Google Sign-In via NextAuth.js v4, allowing users to authenticate with their Google accounts.

### Features

- **Dual authentication**: Users can have BOTH Google OAuth and email/password login
- **Auto-linking**: Automatically links Google login to existing unverified email/password accounts
- **Graceful degradation**: Login page adapts based on enabled authentication methods
- **Set password feature**: Google-only users can add a password later via My Settings
- **Profile data**: Full name and profile picture automatically populated from Google

### Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project or select an existing project
3. Enable Google+ API (or Google Identity Services)
4. Navigate to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen if prompted
6. Set **Application type** to "Web application"
7. Add **Authorized JavaScript origins**:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`
8. Add **Authorized redirect URIs**:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
9. Copy the **Client ID** and **Client Secret**

### Step 2: Add Environment Variables

Add to your `.env.local`:

```env
# NextAuth.js configuration (REQUIRED for OAuth)
NEXTAUTH_SECRET=your_secure_random_string_at_least_32_characters
NEXTAUTH_URL=http://localhost:3000  # Change to production URL in production

# Google OAuth credentials (from Google Cloud Console)
HAZO_AUTH_GOOGLE_CLIENT_ID=your_google_client_id_from_step_1
HAZO_AUTH_GOOGLE_CLIENT_SECRET=your_google_client_secret_from_step_1
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### Step 3: Run Database Migration

Add OAuth fields to the `hazo_users` table:

```bash
npm run migrate migrations/005_add_oauth_fields_to_hazo_users.sql
```

This migration adds:
- `google_id` - Google's unique user ID (TEXT, UNIQUE)
- `auth_providers` - Tracks authentication methods: 'email', 'google', or 'email,google'
- Index on `google_id` for fast OAuth lookups

**Manual migration (if needed):**

**PostgreSQL:**
```sql
ALTER TABLE hazo_users
ADD COLUMN google_id TEXT UNIQUE;

ALTER TABLE hazo_users
ADD COLUMN auth_providers TEXT DEFAULT 'email';

CREATE INDEX IF NOT EXISTS idx_hazo_users_google_id ON hazo_users(google_id);
```

**SQLite:**
```sql
ALTER TABLE hazo_users
ADD COLUMN google_id TEXT;

ALTER TABLE hazo_users
ADD COLUMN auth_providers TEXT DEFAULT 'email';

CREATE UNIQUE INDEX IF NOT EXISTS idx_hazo_users_google_id_unique ON hazo_users(google_id);
CREATE INDEX IF NOT EXISTS idx_hazo_users_google_id ON hazo_users(google_id);
```

### Step 4: Configure OAuth in hazo_auth_config.ini

```ini
[hazo_auth__oauth]
# Enable Google OAuth login (default: true)
enable_google = true

# Enable traditional email/password login (default: true)
enable_email_password = true

# Auto-link Google login to existing unverified email/password accounts (default: true)
auto_link_unverified_accounts = true

# Customize button text (optional)
google_button_text = Continue with Google
oauth_divider_text = or

# Post-Login Redirect Configuration (v5.1.16+)
# URL for users who need to create a firm (default: /hazo_auth/create_firm)
# create_firm_url = /hazo_auth/create_firm

# Default redirect after OAuth login for users with scopes (default: /)
# default_redirect = /

# Skip invitation table check (set true if not using invitations)
# skip_invitation_check = false

# Redirect when skip_invitation_check=true and user has no scope (default: /)
# no_scope_redirect = /
```

### Step 5: Create NextAuth API Routes

Create `app/api/auth/[...nextauth]/route.ts`:

```typescript
export { GET, POST } from "hazo_auth/server/routes/nextauth";
```

Create `app/api/hazo_auth/oauth/google/callback/route.ts`:

```typescript
export { GET } from "hazo_auth/server/routes/oauth_google_callback";
```

Create `app/api/hazo_auth/set_password/route.ts`:

```typescript
export { POST } from "hazo_auth/server/routes/set_password";
```

**Or use the CLI generator:**
```bash
npx hazo_auth generate-routes --oauth
```

### Step 6: Test Google OAuth

1. Start your dev server: `npm run dev`
2. Visit `http://localhost:3000/hazo_auth/login`
3. You should see the "Sign in with Google" button
4. Click it and authenticate with your Google account
5. You'll be redirected back and logged in

### User Flows

**New User - Google Sign-In:**
- User clicks "Sign in with Google"
- Authenticates with Google
- Account created with Google profile data (email, name, profile picture)
- Email is automatically verified
- User can log in with Google anytime

**Existing Unverified User - Google Sign-In:**
- User has email/password account but hasn't verified email
- Clicks "Sign in with Google" with same email
- System auto-links Google account (if `auto_link_unverified_accounts = true`)
- Email becomes verified
- User can now log in with EITHER Google OR email/password

**Google-Only User Adds Password:**
- Google-only user visits My Settings
- "Set Password" section appears
- User sets a password
- User can now log in with EITHER method

**Google-Only User Tries Forgot Password:**
- User registered with Google tries "Forgot Password"
- System shows: "You registered with Google. Please sign in with Google instead."

### Configuration Options

**Disable email/password login (Google-only):**
```ini
[hazo_auth__oauth]
enable_google = true
enable_email_password = false
```

**Hide "Create account" link (e.g., OAuth-only apps with no email registration):**
```ini
[hazo_auth__login_layout]
show_create_account_link = false
```

**Disable Google OAuth (email/password only):**
```ini
[hazo_auth__oauth]
enable_google = false
enable_email_password = true
```

### API Response Changes

The `/api/hazo_auth/me` endpoint now includes OAuth status:

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

Google OAuth adds one new dependency:
- `next-auth@^4.24.11` - NextAuth.js for OAuth handling (automatically installed with hazo_auth)

### Troubleshooting

**"Sign in with Google" button not showing:**
- Verify `enable_google = true` in `[hazo_auth__oauth]` section
- Check `HAZO_AUTH_GOOGLE_CLIENT_ID` and `HAZO_AUTH_GOOGLE_CLIENT_SECRET` are set
- Check `NEXTAUTH_URL` matches your current URL

**OAuth callback error:**
- OAuth errors (e.g., `AccessDenied`, `OAuthSignin`) are automatically displayed as a banner on the login page via `?error=` query param
- Verify redirect URI in Google Cloud Console matches exactly: `http://localhost:3000/api/auth/callback/google`
- Check `NEXTAUTH_SECRET` is set and at least 32 characters
- Verify API routes are created: `/api/auth/[...nextauth]/route.ts` and `/api/hazo_auth/oauth/google/callback/route.ts`

**User created but not logged in:**
- Check browser console for errors
- Verify `/api/hazo_auth/oauth/google/callback` route exists
- Check server logs for errors during session creation

**404 after Google OAuth login (v5.1.16+ fix):**
- If users get 404 after Google OAuth, the `hazo_invitations` table may be missing
- **Option 1:** Run migration `009_scope_consolidation.sql` to create the table
- **Option 2:** Set `skip_invitation_check = true` in `[hazo_auth__oauth]` if not using invitations
- Check logs for `invitation_table_missing` warnings
- If using custom paths, set `create_firm_url` to your app's create firm page URL

---

## Using Components

### Package Exports

The package exports components through these paths:

```typescript
// Main entry point - exports all public APIs
import { ... } from "hazo_auth";

// Zero-config page components (recommended for quick setup)
import { LoginPage } from "hazo_auth/pages/login";
import { RegisterPage } from "hazo_auth/pages/register";
import { ForgotPasswordPage } from "hazo_auth/pages/forgot_password";
import { ResetPasswordPage } from "hazo_auth/pages/reset_password";
import { VerifyEmailPage } from "hazo_auth/pages/verify_email";
import { MySettingsPage } from "hazo_auth/pages/my_settings";

// Or import all pages at once
import { 
  LoginPage, 
  RegisterPage, 
  ForgotPasswordPage,
  ResetPasswordPage,
  VerifyEmailPage,
  MySettingsPage 
} from "hazo_auth/pages";

// Layout components - for custom implementations
import { LoginLayout } from "hazo_auth/components/layouts/login";
import { RegisterLayout } from "hazo_auth/components/layouts/register";
import { ForgotPasswordLayout } from "hazo_auth/components/layouts/forgot_password";
import { ResetPasswordLayout } from "hazo_auth/components/layouts/reset_password";
import { EmailVerificationLayout } from "hazo_auth/components/layouts/email_verification";
import { MySettingsLayout } from "hazo_auth/components/layouts/my_settings";
import { UserManagementLayout } from "hazo_auth/components/layouts/user_management";
import { RbacTestLayout } from "hazo_auth/components/layouts/rbac_test";

// Shared layout components and hooks (barrel import - recommended)
import { 
  ProfilePicMenu,
  ProfilePicMenuWrapper,
  FormActionButtons,
  use_hazo_auth,
  use_auth_status 
} from "hazo_auth/components/layouts/shared";

// Server-side authentication utility
import { hazo_get_auth } from "hazo_auth/lib/auth/hazo_get_auth.server";

// Server utilities
import { ... } from "hazo_auth/server";

// Edge-compatible proxy/middleware authentication (v1.6.6+)
import { validate_session_cookie } from "hazo_auth/server/middleware";
```

**Note:** The package uses relative imports internally. Consumers should only import from the exposed entry points listed above. Do not import from internal paths like `hazo_auth/components/ui/*` - these are internal modules.

### Using Layout Components

Prefer to drop the forms into your own routes without using the pre-built pages? Import the layouts directly and feed them a `data_client` plus any label/button overrides:

```tsx
// app/(auth)/login/page.tsx in your project
import { LoginLayout, createLayoutDataClient } from "hazo_auth";
import { create_postgrest_hazo_connect } from "hazo_auth/lib/hazo_connect_setup";

export default async function LoginPage() {
  const hazoConnect = create_postgrest_hazo_connect();
  const dataClient = createLayoutDataClient(hazoConnect);

  return (
    <div className="my-app-shell">
      <LoginLayout
        image_src="/marketing/login-hero.svg"
        image_alt="Login hero image"
        data_client={dataClient}
        redirectRoute="/dashboard"
      />
    </div>
  );
}
```

**Available Layout Components:**
- `LoginLayout` - Login form with email/password
- `RegisterLayout` - Registration form with password requirements
- `ForgotPasswordLayout` - Request password reset
- `ResetPasswordLayout` - Set new password with token
- `EmailVerificationLayout` - Verify email address
- `MySettingsLayout` - User profile and settings
- `UserManagementLayout` - Admin user/role management (requires user_management API routes)
- `RbacTestLayout` - RBAC/HRBAC permission and scope testing tool (requires admin_test_access permission)

### User Management Component

The `UserManagementLayout` component provides a comprehensive admin interface for managing users, roles, and permissions. It requires the user_management API routes to be set up in your project.

**Required Permissions:**
- `admin_user_management` - Access to Users tab
- `admin_role_management` - Access to Roles tab
- `admin_permission_management` - Access to Permissions tab
- `admin_scope_hierarchy_management` - Access to Scope Hierarchy tab (HRBAC)
- `admin_system` - Access to Scope Labels tab (HRBAC)
- `admin_user_scope_assignment` - Access to User Scopes tab (HRBAC)

**Required API Routes:**
The `UserManagementLayout` component requires the following API routes to be created in your project:

```typescript
// app/api/hazo_auth/user_management/users/route.ts
export { GET, PATCH, POST } from "hazo_auth/server/routes";

// app/api/hazo_auth/user_management/permissions/route.ts
export { GET, POST, PUT, DELETE } from "hazo_auth/server/routes";

// app/api/hazo_auth/user_management/roles/route.ts
export { GET, POST, PUT } from "hazo_auth/server/routes";

// app/api/hazo_auth/user_management/users/roles/route.ts
export { GET, POST, PUT } from "hazo_auth/server/routes";
```

**Note:** These routes are automatically created when you run `npx hazo_auth generate-routes`. The routes handle:
- **Users:** List users, deactivate users, send password reset emails
- **Permissions:** List permissions (from DB and config), migrate config permissions to DB, create/update/delete permissions
- **Roles:** List roles with permissions, create roles, update role-permission assignments
  - **UI Enhancement**: The Roles tab uses a tag-based UI for better readability. Each role displays permissions as inline tags/chips (showing up to 4, with "+N more" to expand). Edit permissions via an interactive dialog with Select All/Unselect All buttons.
- **User Roles:** Get user roles, assign roles to users, bulk update user role assignments

---

### Organization Management Component

The `OrgManagementLayout` component provides an admin interface for managing the organization hierarchy when multi-tenancy is enabled. It requires the org_management API routes to be set up in your project.

**Required Permissions:**
- `hazo_perm_org_management` - CRUD operations on organizations
- `hazo_org_global_admin` - View/manage all organizations across the system (optional, for global admins)

**Required API Routes:**
The `OrgManagementLayout` component requires the following API route to be created in your project:

```typescript
// app/api/hazo_auth/org_management/orgs/route.ts
export {
  orgManagementOrgsGET as GET,
  orgManagementOrgsPOST as POST,
  orgManagementOrgsPATCH as PATCH,
  orgManagementOrgsDELETE as DELETE
} from "hazo_auth/server/routes";
```

**Note:** This route is automatically created when you run `npx hazo_auth generate-routes`. The route handles:
- **GET:** List organizations (with `action=tree` query parameter for hierarchical tree structure)
- **POST:** Create new organization
- **PATCH:** Update existing organization (name, user_limit, active status)
- **DELETE:** Soft delete organization (sets active=false, does not remove from database)

**Example Usage:**

```tsx
// app/hazo_auth/user_management/page.tsx
import { UserManagementLayout } from "hazo_auth/components/layouts/user_management";

export default function UserManagementPage() {
  return <UserManagementLayout />;
}
```

The component automatically shows/hides tabs based on the user's permissions, so users will only see the tabs they have access to.

**Shared Components:**
- `ProfilePicMenu` / `ProfilePicMenuWrapper` - Navbar profile menu
- `FormActionButtons`, `FormFieldWrapper`, `PasswordField`
- And more under `hazo_auth/components/layouts/shared/`

### Choose the UI Shell (Test Sidebar vs Standalone)

By default, the pages render inside the "test workspace" sidebar so you can quickly preview every flow. When you reuse the routes inside another project you'll usually want a clean, standalone wrapper instead. Set this in `hazo_auth_config.ini`:

```ini
[hazo_auth__ui_shell]
# Options: test_sidebar | standalone
layout_mode = standalone
vertical_center = auto  # 'auto' enables vertical centering when navbar is present
# Optional tweaks for the standalone header wrapper/classes:
# standalone_heading = Welcome back
# standalone_description = Your description here
# standalone_wrapper_class = min-h-screen bg-background py-8
# standalone_content_class = mx-auto w-full max-w-4xl rounded-2xl border bg-card
```

- `test_sidebar`: keeps the developer sidebar (perfect for the demo workspace or Storybook screenshots).
- `standalone`: renders the page body directly so it inherits your own app shell, layout, and theme tokens.
- `vertical_center`: controls vertical centering of auth content (`auto` enables centering when navbar is present)
- The wrapper and content class overrides let you align spacing/borders with your design system without editing package code.

### Authentication Page Navbar

**The navbar now works automatically** - zero-config server page components include the navbar based on configuration without manual wrapping.

When using `layout_mode = standalone`, you can enable a configurable navbar that appears on all auth pages:

```ini
[hazo_auth__navbar]
enable_navbar = true              # Show navbar on auth pages
logo_path = /logo.png             # Path to logo image
logo_width = 32                   # Logo width in pixels
logo_height = 32                  # Logo height in pixels
company_name = My Company         # Company name (links to home)
home_path = /                     # URL for logo and company name link
home_label = Home                 # Label for home link
show_home_link = true             # Show "Home" link on right side
background_color =                # Custom background (optional)
text_color =                      # Custom text color (optional)
height = 64                       # Navbar height in pixels
```

The navbar provides consistent branding across authentication pages with your company logo, name, and optional home link. It automatically vertically centers auth content when enabled.

**Zero-config usage (recommended):**
```typescript
// app/hazo_auth/login/page.tsx
import { LoginPage } from "hazo_auth/pages/login";

export default function Page() {
  return <LoginPage />;  // Navbar appears automatically if enabled in config
}
```

**Customize via props (advanced):**
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

**Disable for specific pages:**
```typescript
<LoginPage disableNavbar={true} />
// OR for layout components:
<LoginLayout navbar={{ enable_navbar: false }} />
```

---

## Authentication Service

The `hazo_auth` package provides a comprehensive authentication and authorization system with role-based access control (RBAC). The main authentication utilities are:

- **`hazo_get_auth`** - Standard authentication with user details, permissions, and caching
- **`hazo_get_tenant_auth`** - Tenant-aware authentication that extracts scope context from request headers or cookies
- **`require_tenant_auth`** - Strict tenant authentication with typed error handling

These utilities provide user details, permissions, and permission checking with built-in caching and rate limiting.

### Client-Side API Endpoint (Recommended)

#### `/api/hazo_auth/me` (GET) - Standardized User Info Endpoint

**⚠️ IMPORTANT: Use this endpoint for all client-side authentication checks. It always returns the same standardized format with permissions.**

This is the **standardized endpoint** that ensures consistent response format across all projects. It always includes permissions and user information in a unified structure.

**Endpoint:** `GET /api/hazo_auth/me`

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
  // Profile picture aliases (for consuming app compatibility)
  profile_image?: string,  // Alias for profile_picture_url
  avatar_url?: string,     // Alias for profile_picture_url
  image?: string,          // Alias for profile_picture_url
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

**Example Usage:**

```typescript
// Client-side (React component)
const response = await fetch("/api/hazo_auth/me", {
  method: "GET",
  credentials: "include",
});

const data = await response.json();

if (data.authenticated) {
  console.log("User:", data.user);
  console.log("Email:", data.email);
  console.log("Permissions:", data.permissions);
  console.log("Permission OK:", data.permission_ok);
}
```

**Why Use `/api/hazo_auth/me`?**
- ✅ **Standardized format** - Always returns the same structure
- ✅ **Always includes permissions** - No need for separate permission checks
- ✅ **Backward compatible** - Top-level fields work with existing code
- ✅ **Single source of truth** - Prevents downstream variations

**Note:** The `use_auth_status` hook automatically uses this endpoint and includes permissions in its return value.

### Proxy/Middleware Authentication

hazo_auth provides Edge-compatible authentication for Next.js proxy/middleware files. **Note:** Next.js is migrating from `middleware.ts` to `proxy.ts` (see [Next.js documentation](https://nextjs.org/docs/messages/middleware-to-proxy)), but the functionality remains the same.

#### Edge Runtime Limitations

Next.js proxy/middleware runs in Edge Runtime, which cannot use Node.js APIs (like SQLite). Therefore, `hazo_get_auth` cannot be used directly in proxy/middleware because it requires database access.

#### JWT Session Tokens

**New in v1.6.6+:** hazo_auth now issues JWT session tokens on login that can be validated in Edge Runtime:

- **Cookie Name:** `hazo_auth_session`
- **Token Type:** JWT (signed with `JWT_SECRET`)
- **Expiry:** 30 days (configurable)
- **Validation:** Signature and expiry checked without database access
- **Backward Compatible:** Existing `hazo_auth_user_id` and `hazo_auth_user_email` cookies still work

**Requirements:**
- `JWT_SECRET` environment variable must be set (see [Configuration Setup](#configuration-setup))
- The `jose` package is included as a dependency (Edge-compatible JWT library)

#### Using in Proxy/Middleware

**Recommended: Use JWT validation (Edge-compatible)**

```typescript
// proxy.ts (or middleware.ts - both work)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validate_session_cookie } from "hazo_auth/server/middleware";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protect routes
  if (pathname.startsWith("/members")) {
    const { valid } = await validate_session_cookie(request);
    
    if (!valid) {
      const login_url = new URL("/hazo_auth/login", request.url);
      login_url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(login_url);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

**Fallback: Simple cookie check (less secure, but works)**

If JWT validation fails or you need a simpler check:

```typescript
// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (pathname.startsWith("/members")) {
    const user_id = request.cookies.get("hazo_auth_user_id")?.value;
    const user_email = request.cookies.get("hazo_auth_user_email")?.value;
    
    if (!user_id || !user_email) {
      const login_url = new URL("/hazo_auth/login", request.url);
      login_url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(login_url);
    }
  }
  
  return NextResponse.next();
}
```

**Important Notes:**
- JWT validation provides better security (signature validation, tamper detection)
- Simple cookie check is faster but doesn't validate token integrity
- Full user status checks (e.g., deactivated accounts) happen in API routes/layouts
- Both approaches work - JWT is recommended for production

### Server-Side Functions

#### `hazo_get_tenant_auth` (Recommended for Multi-Tenant Apps)

**New:** Tenant-aware authentication function that extracts scope context from request headers or cookies and returns enriched result with organization information.

**Location:** `src/lib/auth/hazo_get_tenant_auth.server.ts`

**Scope Context Extraction:**
- **Header (priority):** `X-Hazo-Scope-Id` (configurable via `scope_header_name`)
- **Cookie (fallback):** `hazo_auth_scope_id` (with prefix if configured)

**Function Signature:**
```typescript
import { hazo_get_tenant_auth } from "hazo_auth";
import type { TenantAuthResult, TenantAuthOptions } from "hazo_auth";

async function hazo_get_tenant_auth(
  request: NextRequest,
  options?: TenantAuthOptions
): Promise<TenantAuthResult>
```

**Options:**
- `required_permissions?: string[]` - Array of permission names to check
- `strict?: boolean` - If `true`, throws errors when checks fail (default: `false`)
- `scope_header_name?: string` - Custom header name for scope ID (default: `"X-Hazo-Scope-Id"`)
- `scope_cookie_name?: string` - Custom cookie name for scope ID (default: `"hazo_auth_scope_id"`)

**Return Type:**
```typescript
type TenantAuthResult =
  | {
      authenticated: true;
      user: HazoAuthUser;
      permissions: string[];
      permission_ok: boolean;
      missing_permissions?: string[];
      organization: TenantOrganization | null;  // NEW: Tenant context
      user_scopes: ScopeDetails[];              // NEW: All user's scopes for switching
      scope_ok: boolean;
    }
  | {
      authenticated: false;
      user: null;
      permissions: [];
      permission_ok: false;
      organization: null;
      user_scopes: [];
      scope_ok: false;
    };

type TenantOrganization = {
  id: string;
  name: string;
  slug: string | null;          // URL-friendly identifier
  level: string;                // "Company", "Division", etc.
  role_id: string;              // User's role in this scope
  is_super_admin: boolean;
  branding?: {
    logo_url: string | null;
    primary_color: string | null;
    secondary_color: string | null;
    tagline: string | null;
  };
};

type ScopeDetails = {
  id: string;
  name: string;
  slug: string | null;
  level: string;
  parent_id: string | null;
  role_id: string;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  tagline: string | null;
};
```

**Basic Usage Example:**
```typescript
// app/api/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { hazo_get_tenant_auth } from "hazo_auth";

export async function GET(request: NextRequest) {
  const auth = await hazo_get_tenant_auth(request);

  if (!auth.authenticated) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  if (!auth.organization) {
    return NextResponse.json(
      {
        error: "No organization context",
        available_scopes: auth.user_scopes.map(s => ({ id: s.id, name: s.name }))
      },
      { status: 403 }
    );
  }

  // Access tenant-specific data
  const data = await getTenantData(auth.organization.id);

  return NextResponse.json({
    organization: auth.organization,
    data,
    // Include available scopes for UI scope switcher
    available_scopes: auth.user_scopes,
  });
}
```

**Strict Mode with Error Handling:**
```typescript
import { require_tenant_auth, HazoAuthError } from "hazo_auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await require_tenant_auth(request, {
      required_permissions: ["view_reports"],
    });

    // auth.organization is guaranteed non-null here
    const reports = await getReports(auth.organization.id);
    return NextResponse.json({ reports });
  } catch (error) {
    if (error instanceof HazoAuthError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          // For TenantAccessDeniedError, includes available_scopes
          available_scopes: error.available_scopes
        },
        { status: error.status_code }
      );
    }
    throw error;
  }
}
```

**Frontend Integration:**
```typescript
// Client sets scope via header or cookie
const response = await fetch("/api/dashboard", {
  headers: {
    "X-Hazo-Scope-Id": selectedScopeId,
  },
});

// Or via cookie (set once during scope selection)
document.cookie = `hazo_auth_scope_id=${selectedScopeId}; path=/`;
```

**Error Types:**
```typescript
import {
  AuthenticationRequiredError,   // 401 - User not authenticated
  TenantRequiredError,            // 403 - No tenant context provided
  TenantAccessDeniedError,        // 403 - User lacks access to tenant
} from "hazo_auth";
```

#### `require_tenant_auth` (Strict Tenant Auth)

Helper function that wraps `hazo_get_tenant_auth` and throws typed errors for common failure cases.

**Throws:**
- `AuthenticationRequiredError` (401) - User not authenticated
- `TenantRequiredError` (403) - No tenant context in request
- `TenantAccessDeniedError` (403) - User lacks access to requested tenant

**Returns:** `RequiredTenantAuthResult` with guaranteed non-null `organization`

**Example:**
```typescript
export async function GET(request: NextRequest) {
  try {
    // organization is guaranteed to exist
    const { organization, user, permissions } = await require_tenant_auth(request);

    const data = await getData(organization.id);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof HazoAuthError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status_code }
      );
    }
    throw error;
  }
}
```

#### `withAuth` / `withOptionalAuth` (Route Handler Wrappers)

Higher-order functions that eliminate auth boilerplate from API routes. Handles authentication, permission checks, param resolution, and error responses automatically.

**Before (manual boilerplate):**
```typescript
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await hazo_get_tenant_auth(request);
    if (!auth.authenticated) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    // ... handler logic
  } catch (error) {
    if (error instanceof HazoAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status_code });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

**After (with `withAuth`):**
```typescript
import { withAuth } from "hazo_auth/server-lib";

// Simple authenticated route
export const GET = withAuth(async (request, auth, params) => {
  return NextResponse.json({ user: auth.user });
});

// With URL params and permissions
export const DELETE = withAuth<{ id: string }>(
  async (request, auth, { id }) => {
    await deleteItem(id);
    return NextResponse.json({ success: true });
  },
  { required_permissions: ["admin_system"] }
);

// With tenant requirement (auth.organization guaranteed non-null)
export const GET = withAuth<{ id: string }>(
  async (request, auth, { id }) => {
    const data = await getData(auth.organization.id, id);
    return NextResponse.json(data);
  },
  { require_tenant: true }
);
```

**`withOptionalAuth`** - for public routes where auth is optional:
```typescript
import { withOptionalAuth } from "hazo_auth/server-lib";

export const GET = withOptionalAuth(async (request, auth, params) => {
  if (auth.authenticated) {
    return NextResponse.json({ user: auth.user, data: getPrivateData() });
  }
  return NextResponse.json({ data: getPublicData() });
});
```

**Permission helpers** for fine-grained checks inside handlers:
```typescript
import { withAuth, hasPermission, requirePermission } from "hazo_auth/server-lib";

export const PATCH = withAuth(async (request, auth, params) => {
  // Boolean check
  const canEdit = hasPermission(auth, "edit_content");

  // Throws PermissionError (caught by wrapper, returns 403)
  requirePermission(auth, "admin_system");
});
```

**Available exports:**
- `withAuth<TParams>(handler, options?)` - requires authentication
- `withOptionalAuth<TParams>(handler, options?)` - auth optional
- `hasPermission(auth, permission)` - boolean check
- `hasAllPermissions(auth, permissions)` - all must match
- `hasAnyPermission(auth, permissions)` - any must match
- `requirePermission(auth, permission)` - throws if missing
- `requireAllPermissions(auth, permissions)` - throws if any missing
- Types: `AuthenticatedTenantAuth`, `AuthenticatedTenantAuthWithOrg`, `WithAuthOptions`

#### `hazo_get_auth` (Standard Auth)

The primary authentication utility for server-side use in API routes. Returns user details, permissions, and optionally checks required permissions.

**Location:** `src/lib/auth/hazo_get_auth.server.ts`

**Function Signature:**
```typescript
import { hazo_get_auth } from "hazo_auth/lib/auth/hazo_get_auth.server";
import type { HazoAuthResult, HazoAuthOptions } from "hazo_auth/lib/auth/auth_types";

async function hazo_get_auth(
  request: NextRequest,
  options?: HazoAuthOptions
): Promise<HazoAuthResult>
```

**Options:**
- `required_permissions?: string[]` - Array of permission names to check
- `strict?: boolean` - If `true`, throws `PermissionError` when permissions are missing (default: `false`)

**Return Type:**
```typescript
type HazoAuthResult = 
  | {
      authenticated: true;
      user: {
        id: string;
        name: string | null;
        email_address: string;
        is_active: boolean;
        profile_picture_url: string | null;
        url_on_logon: string | null;
      };
      permissions: string[];
      permission_ok: boolean;
      missing_permissions?: string[];
    }
  | {
      authenticated: false;
      user: null;
      permissions: [];
      permission_ok: false;
    };
```

**Features:**
- **Caching:** LRU cache with TTL (configurable, default: 15 minutes)
- **Rate Limiting:** Per-user and per-IP rate limiting
- **Permission Checking:** Optional permission validation with detailed error messages
- **Audit Logging:** Logs permission denials for security auditing
- **Performance:** Optimized database queries with single JOIN

**Example Usage:**

```typescript
// In an API route (src/app/api/protected/route.ts)
import { NextRequest, NextResponse } from "next/server";
import { hazo_get_auth } from "hazo_auth/lib/auth/hazo_get_auth.server";
import { PermissionError } from "hazo_auth/lib/auth/auth_types";

export async function GET(request: NextRequest) {
  try {
    // Check authentication and permissions
    const authResult = await hazo_get_auth(request, {
      required_permissions: ["admin_user_management"],
      strict: true, // Throws PermissionError if missing permissions
    });

    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // User is authenticated and has required permissions
    // Access url_on_logon for custom redirect
    const redirectUrl = authResult.user.url_on_logon || "/dashboard";
    
    return NextResponse.json({
      message: "Access granted",
      user: authResult.user,
      permissions: authResult.permissions,
    });
  } catch (error) {
    if (error instanceof PermissionError) {
      return NextResponse.json(
        {
          error: "Permission denied",
          missing_permissions: error.missing_permissions,
          user_friendly_message: error.user_friendly_message,
        },
        { status: 403 }
      );
    }
    throw error;
  }
}
```

#### `get_authenticated_user`

Basic authentication check for API routes. Returns user info if authenticated, or `{ authenticated: false }` if not.

**Location:** `src/lib/auth/auth_utils.server.ts`

```typescript
import { get_authenticated_user } from "hazo_auth/lib/auth/auth_utils.server";

export async function GET(request: NextRequest) {
  const authResult = await get_authenticated_user(request);
  
  if (!authResult.authenticated) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    user_id: authResult.user_id,
    email: authResult.email,
    name: authResult.name,
  });
}
```

#### `get_server_auth_user`

Gets authenticated user in server components and pages (uses Next.js `cookies()` function).

**Location:** `src/lib/auth/server_auth.ts`

```typescript
// In a server component (src/app/dashboard/page.tsx)
import { get_server_auth_user } from "hazo_auth/lib/auth/server_auth";

export default async function DashboardPage() {
  const authResult = await get_server_auth_user();
  
  if (!authResult.authenticated) {
    return <div>Please log in to access this page.</div>;
  }

  return (
    <div>
      <h1>Welcome, {authResult.name || authResult.email}!</h1>
      <p>User ID: {authResult.user_id}</p>
    </div>
  );
}
```

### Client-Side Hooks

#### `use_hazo_auth`

React hook for fetching authentication status and permissions on the client side.

**Location:** `src/hooks/use_hazo_auth.ts`

```typescript
"use client";

import { use_hazo_auth } from "hazo_auth/components/layouts/shared/hooks/use_hazo_auth";

export function ProtectedComponent() {
  const { authenticated, user, permissions, permission_ok, loading, error, refetch } = 
    use_hazo_auth({
      required_permissions: ["admin_user_management"],
      strict: false,
    });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!authenticated) return <div>Please log in to access this page.</div>;
  if (!permission_ok) return <div>You don't have permission to access this page.</div>;

  return (
    <div>
      <h1>Welcome, {user?.name || user?.email_address}!</h1>
      <p>Your permissions: {permissions.join(", ")}</p>
      <button onClick={() => refetch()}>Refresh Auth Status</button>
    </div>
  );
}
```

#### `use_auth_status`

Simpler hook for basic authentication status checking.

**Location:** `src/hooks/use_auth_status.ts`

```typescript
"use client";

import { use_auth_status } from "hazo_auth/components/layouts/shared/hooks/use_auth_status";

export function UserGreeting() {
  const { authenticated, name, email, loading } = use_auth_status();

  if (loading) return <div>Loading...</div>;
  if (!authenticated) return <div>Please log in</div>;

  return <div>Welcome, {name || email}!</div>;
}
```

### Configuration

Configure the authentication utility in `hazo_auth_config.ini`:

```ini
[hazo_auth__auth_utility]
# Cache settings
cache_max_users = 10000
cache_ttl_minutes = 15
cache_max_age_minutes = 30

# Rate limiting
rate_limit_per_user = 100
rate_limit_per_ip = 200

# Permission check behavior
log_permission_denials = true
enable_friendly_error_messages = true
```

---

## Hierarchical Role-Based Access Control (HRBAC)

hazo_auth supports optional Hierarchical Role-Based Access Control (HRBAC) with 7 scope levels (L1-L7). HRBAC extends standard RBAC by allowing users to be assigned to scopes in a hierarchy, with automatic inheritance of access to child scopes.

### Enabling HRBAC

Add the following to your `hazo_auth_config.ini`:

```ini
[hazo_auth__scope_hierarchy]
enable_hrbac = true
# Note: No default_org needed - org determined from user authentication
scope_cache_ttl_minutes = 15
scope_cache_max_entries = 5000

# Note: In v5.0+, scope levels are stored as the "level" column in hazo_scopes
# Examples: "HQ", "Division", "Department", "Team", etc.
# The level field is a descriptive string, not a fixed L1-L7 hierarchy
```

### Database Setup

HRBAC requires additional database tables. Run the scope consolidation migration:

```bash
npm run migrate migrations/009_scope_consolidation.sql
```

This creates:
- `hazo_scopes` - Unified scope hierarchy with branding support
- `hazo_user_scopes` - User-scope-role assignments
- `hazo_invitations` - User invitation flow

See `SETUP_CHECKLIST.md` for full PostgreSQL and SQLite scripts.

### Using hazo_get_auth with Scope Options

When HRBAC is enabled, you can check scope access alongside permissions:

```typescript
import { hazo_get_auth } from "hazo_auth/lib/auth/hazo_get_auth.server";
import { ScopeAccessError } from "hazo_auth/lib/auth/auth_types";

export async function GET(request: NextRequest) {
  try {
    const authResult = await hazo_get_auth(request, {
      required_permissions: ["view_reports"],
      scope_id: "uuid-of-scope",     // Check access to specific scope
      strict: true,                   // Throws ScopeAccessError if denied
    });

    if (!authResult.authenticated) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Both permission_ok and scope_ok must be true for full access
    if (authResult.scope_ok) {
      // Access granted - scope_access_via shows how access was granted
      console.log("Access via:", authResult.scope_access_via);
    }

    return NextResponse.json({ message: "Access granted" });
  } catch (error) {
    if (error instanceof ScopeAccessError) {
      return NextResponse.json(
        { error: "Scope access denied", scope: error.scope_identifier },
        { status: 403 }
      );
    }
    throw error;
  }
}
```

### Scope Access Inheritance

Users assigned to a higher-level scope automatically have access to all descendant scopes:
- User with L2 scope access can access all L3, L4, L5, L6, L7 scopes under that L2 scope
- Direct assignments take precedence over inherited access
- The `scope_access_via` field in the result shows which scope granted access

### Required Permissions for Management

- `admin_scope_hierarchy_management` - Manage scope hierarchy (create, edit, delete scopes)
- `admin_system` - System-level administration (scope labels configuration)
- `admin_user_scope_assignment` - Assign scopes to users
- `admin_test_access` - Access the RBAC/HRBAC test tool

Add these to your `application_permission_list_defaults` in `hazo_auth_config.ini`:

```ini
[hazo_auth__user_management]
application_permission_list_defaults = admin_user_management,admin_role_management,admin_permission_management,admin_scope_hierarchy_management,admin_system,admin_user_scope_assignment,admin_test_access
```

### User Management UI

When HRBAC is enabled and the user has appropriate permissions, three new tabs appear in the User Management layout:
- **Scope Hierarchy** - Create, edit, and delete scopes at each level (requires `admin_scope_hierarchy_management`)
- **Scope Labels** - Customize labels for scope levels per organization (requires `admin_system`)
- **User Scopes** - Assign and remove scope assignments for users (requires `admin_user_scope_assignment`)

**Organization Assignment (when multi-tenancy enabled):**
- **Global admins** (`hazo_org_global_admin` permission) can assign users to any organization
- **Non-global admins** can only assign users to organizations within their own org tree (filtered by `root_org_id`)

### RBAC/HRBAC Test Tool

The `RbacTestLayout` component provides a comprehensive testing interface for administrators to test RBAC permissions and HRBAC scope access for any user in the system.

**Features:**
- **User Selection**: Dropdown to select any user in the system
- **User Info Display**: Shows selected user's current permissions and assigned scopes
- **RBAC Test Tab**: Select permissions to test if the user has them
- **HRBAC Test Tab**: Select a scope from a tree view and test if the user has access
- **Results Display**: Clear pass/fail indicators with missing permissions and scope access details

**Required Permission:** `admin_test_access`

**Usage in Your App:**

```typescript
// app/admin/rbac-test/page.tsx
import { RbacTestLayout } from "hazo_auth/components/layouts/rbac_test";
import { is_hrbac_enabled } from "hazo_auth/lib/scope_hierarchy_config.server";

export default function RbacTestPage() {
  const hrbacEnabled = is_hrbac_enabled();

  return (
    <RbacTestLayout
      hrbacEnabled={hrbacEnabled}
    />
  );
}
```

**API Route Required:**
The test tool uses the `/api/hazo_auth/rbac_test` endpoint which is included in the package. This route:
- Accepts `test_user_id` parameter to test any user
- Checks permissions and scope access for the specified user
- Requires `admin_test_access` permission to call

**Demo Page:** A test page is available at `/hazo_auth/rbac_test` in the demo app.

---

## ProfileStamp Component

The `ProfileStamp` component is a drop-in widget that displays a circular profile picture with a hover card showing user details. Perfect for adding profile attribution to notes, comments, or any user-generated content.

### Features

- Displays user's profile picture or initials
- Hover card with user name, email, and custom fields
- Three sizes: sm (24px), default (32px), lg (40px)
- Automatic loading state and unauthenticated fallback
- Fully accessible with keyboard navigation

### Usage

```typescript
import { ProfileStamp } from "hazo_auth/client";

// Basic usage
<ProfileStamp />

// With custom size and fields
<ProfileStamp
  size="lg"
  custom_fields={[
    { label: "Role", value: "Admin" },
    { label: "Department", value: "Engineering" }
  ]}
/>

// Hide default fields, only show custom fields
<ProfileStamp
  show_name={false}
  show_email={false}
  custom_fields={[
    { label: "Posted", value: "2 hours ago" }
  ]}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `"sm" \| "default" \| "lg"` | `"default"` | Avatar size (sm: 24px, default: 32px, lg: 40px) |
| `custom_fields` | `ProfileStampCustomField[]` | `[]` | Custom fields to display in hover card |
| `className` | `string` | `undefined` | Additional CSS classes |
| `show_name` | `boolean` | `true` | Show user name in hover card |
| `show_email` | `boolean` | `true` | Show email in hover card |

### ProfileStampCustomField Type

```typescript
type ProfileStampCustomField = {
  label: string;  // Field label (e.g., "Role", "Department")
  value: string;  // Field value (e.g., "Admin", "Engineering")
};
```

### Test Page

Visit `/hazo_auth/profile_stamp_test` in your dev environment to see examples of ProfileStamp with various configurations:
- Size variants
- Custom fields
- Display options (showing/hiding name and email)
- Usage scenarios (notes, comments, activity feeds)

---

## Profile Picture Menu Widget

The Profile Picture Menu is a versatile component for navbar or sidebar that automatically displays:
- **When authenticated**: User's profile picture with a dropdown menu (navbar) or sidebar menu (sidebar) containing user info, settings link, logout, and custom menu items
- **When not authenticated**: Sign Up and Sign In buttons (or a single button, configurable)

### Variants

The component supports two rendering variants:

- **`dropdown`** (default): Renders as a clickable avatar that opens a dropdown menu. Use this for navbar/header contexts.
- **`sidebar`**: Shows profile picture and name in a sidebar group. Clicking opens a dropdown menu with account actions. Use this inside `SidebarContent` for sidebar navigation.

### Basic Usage (Recommended)

Use the `ProfilePicMenuWrapper` component which automatically loads configuration from `hazo_auth_config.ini`:

#### Dropdown Variant (Navbar/Header)

```typescript
// In your navbar or layout component
import { ProfilePicMenuWrapper } from "hazo_auth/components/layouts/shared/components/profile_pic_menu_wrapper";

export function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4">
      <div>Logo</div>
      <ProfilePicMenuWrapper 
        avatar_size="default" // "sm" | "default" | "lg"
        className="ml-auto"
        // variant="dropdown" is the default
      />
    </nav>
  );
}
```

#### Sidebar Variant

The sidebar variant shows only the profile picture and name. Clicking opens a dropdown menu with account actions:

```typescript
// In your sidebar component
import { ProfilePicMenu } from "hazo_auth/components/layouts/shared";
import { SidebarContent } from "hazo_auth/components/ui/sidebar";

export function Sidebar() {
  return (
    <SidebarContent>
      {/* Other sidebar groups */}
      
      {/* Profile menu as sidebar variant - shows avatar + name, clicking opens dropdown */}
      <ProfilePicMenu 
        variant="sidebar"
        avatar_size="sm"
        sidebar_group_label="Account" // Optional: defaults to "Account"
        className="mt-auto" // Optional: push to bottom
      />
    </SidebarContent>
  );
}
```

### Direct Usage (Advanced)

If you need more control, use `ProfilePicMenu` directly:

```typescript
import { ProfilePicMenu } from "hazo_auth/components/layouts/shared";

// Dropdown variant (navbar)
<ProfilePicMenu 
  variant="dropdown"
  avatar_size="sm"
  settings_path="/settings"
  logout_path="/api/logout"
/>

// Sidebar variant
<ProfilePicMenu 
  variant="sidebar"
  avatar_size="sm"
  sidebar_group_label="My Account"
  custom_menu_items={[
    { type: "link", label: "Dashboard", href: "/dashboard", order: 1, id: "dashboard" }
  ]}
/>
```

### Configuration

```ini
[hazo_auth__profile_pic_menu]
show_single_button = false
sign_up_label = Sign Up
sign_in_label = Sign In
register_path = /hazo_auth/register
login_path = /hazo_auth/login
settings_path = /hazo_auth/my_settings
logout_path = /api/hazo_auth/logout
# Custom menu items (optional)
custom_menu_items = info:Phone:+1234567890:3,separator:2,link:My Account:/account:4
```

---

## User Types (Optional Feature)

hazo_auth provides an optional user type categorization system for classifying users with visual badge indicators. This feature is useful for applications managing multiple user personas (e.g., "Client" vs "Tax Agent", "Internal" vs "External", "Premium" vs "Standard").

### Overview

- **Config-based**: Define types in `hazo_auth_config.ini` (no UI management needed)
- **Single type per user**: Mutually exclusive categories (not tags)
- **Visual badges**: Color-coded badges with preset or custom hex colors
- **Zero impact when disabled**: Optional feature, disabled by default
- **Separate from RBAC**: Types are labels, roles control permissions

### Quick Start

1. **Enable in configuration** (`hazo_auth_config.ini`):
   ```ini
   [hazo_auth__user_types]
   enable_user_types = true
   default_user_type = standard
   user_type_1 = standard:Standard User:blue
   user_type_2 = client:Client:green
   user_type_3 = agent:Tax Agent:orange
   ```

2. **Run database migration**:
   ```bash
   npm run migrate migrations/007_add_user_type_to_hazo_users.sql
   ```

3. **Use in User Management**:
   ```typescript
   import { UserManagementLayout } from "hazo_auth/components/layouts/user_management";

   <UserManagementLayout
     userTypesEnabled={true}
     availableUserTypes={[
       { key: "standard", label: "Standard User", badge_color: "blue" },
       { key: "client", label: "Client", badge_color: "green" }
     ]}
   />
   ```

### Configuration Format

Each user type is defined as `key:label:badge_color`:
- **key**: Unique identifier stored in database (e.g., "client")
- **label**: Display name shown in UI (e.g., "Client")
- **badge_color**: Preset color name (blue, green, red, yellow, purple, gray, orange, pink) or hex code (#4CAF50)

### API Changes

**`/api/hazo_auth/me` now includes user type info**:
```typescript
{
  authenticated: true,
  // ... existing fields
  user_type: "client",        // User's type key
  user_type_info: {           // Type details
    key: "client",
    label: "Client",
    badge_color: "green"
  }
}
```

**New endpoint `/api/hazo_auth/user_management/user_types`** (GET):
Returns user types configuration for populating dropdowns.

### UserTypeBadge Component

Display user types with color-coded badges:

```typescript
import { UserTypeBadge } from "hazo_auth/components/ui/user-type-badge";

<UserTypeBadge
  type="client"
  label="Client"
  badge_color="green"
  variant="badge"  // or "text" for plain text
/>
```

### Example Configurations

**Simple Premium/Standard tiers**:
```ini
[hazo_auth__user_types]
enable_user_types = true
default_user_type = standard
user_type_1 = standard:Standard:blue
user_type_2 = premium:Premium:#FFD700
```

**Tax accounting personas**:
```ini
[hazo_auth__user_types]
enable_user_types = true
user_type_1 = client:Client:green
user_type_2 = tax_agent:Tax Agent:orange
user_type_3 = bookkeeper:Bookkeeper:blue
```

### Key Differences from RBAC

| Feature | User Types | Roles |
|---------|-----------|-------|
| **Purpose** | Categorize/label users | Control permissions |
| **Configuration** | INI file | Database + UI |
| **Assignment** | One type per user | Multiple roles per user |
| **Example** | "Client", "Agent" | "Admin", "Editor" |
| **Use case** | Visual identification | Access control |

A user can have type "Client" with role "Admin" - types and roles are independent.

### Default Type Assignment

New registrations automatically receive the `default_user_type` when configured:

```ini
[hazo_auth__user_types]
enable_user_types = true
default_user_type = standard  # New users get "standard" type
```

For full documentation, see `CLAUDE.md` or `TECHDOC.md`.

---

## App User Data (Custom User Metadata)

hazo_auth provides a flexible JSON field for storing custom user-specific data without modifying the `hazo_users` table schema. This allows consuming applications to store user preferences, settings, and app-specific state.

### Overview

- **JSON Storage**: Single TEXT column stores JSON objects (no schema restrictions)
- **Deep Merge Support**: PATCH endpoint merges new data with existing data
- **Full Replace**: PUT endpoint replaces entire JSON object
- **Clear Data**: DELETE endpoint sets field to NULL
- **Type-Safe**: TypeScript service layer with validation
- **Included in Auth Response**: Available in `/api/hazo_auth/me` response

### Quick Start

1. **Run database migration**:
   ```bash
   npm run migrate migrations/008_add_app_user_data_to_hazo_users.sql
   ```

2. **Create API route** (`app/api/hazo_auth/app_user_data/route.ts`):
   ```typescript
   export {
     appUserDataGET as GET,
     appUserDataPATCH as PATCH,
     appUserDataPUT as PUT,
     appUserDataDELETE as DELETE
   } from "hazo_auth/server/routes";
   ```

   Or use CLI: `npx hazo_auth generate-routes`

3. **Use in your app**:
   ```typescript
   // Store user preferences (deep merge)
   PATCH /api/hazo_auth/app_user_data
   {
     data: {
       theme: "dark",
       language: "en-US",
       sidebar_collapsed: true
     }
   }

   // Access in client components
   const { app_user_data } = use_hazo_auth();
   console.log(app_user_data?.theme); // "dark"
   ```

### API Endpoints

**GET `/api/hazo_auth/app_user_data`** - Get current user's data
```typescript
Response: { data: { theme: "dark", sidebar_collapsed: true } | null }
```

**PATCH `/api/hazo_auth/app_user_data`** - Merge with existing data (preserves other fields)
```typescript
Request: { data: { theme: "light" } }
// If existing: { theme: "dark", sidebar_collapsed: true }
// Result: { theme: "light", sidebar_collapsed: true }
```

**PUT `/api/hazo_auth/app_user_data`** - Replace entire object
```typescript
Request: { data: { theme: "light" } }
// Result: { theme: "light" } (sidebar_collapsed removed)
```

**DELETE `/api/hazo_auth/app_user_data`** - Clear all data (sets to NULL)

### Service Functions

```typescript
import {
  get_app_user_data,
  update_app_user_data,
  clear_app_user_data
} from "hazo_auth";

// Get data
const data = await get_app_user_data(adapter, user_id);

// Update with merge (default)
await update_app_user_data(adapter, user_id, { theme: "light" }, true);

// Replace entirely
await update_app_user_data(adapter, user_id, { theme: "light" }, false);

// Clear data
await clear_app_user_data(adapter, user_id);
```

### Access in `/api/hazo_auth/me`

The `app_user_data` field is included in the authentication response:

```typescript
{
  authenticated: true,
  user: { ... },
  permissions: [...],
  app_user_data: { theme: "dark", sidebar_collapsed: true } | null
}
```

### Use Cases

**Store user preferences:**
```typescript
{
  theme: "dark",
  language: "en-US",
  timezone: "America/New_York"
}
```

**Store app-specific state:**
```typescript
{
  dashboard_layout: "grid",
  sidebar_collapsed: true,
  recent_searches: ["tax forms", "invoices"]
}
```

**Store nested configuration:**
```typescript
{
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
```

### Deep Merge Behavior

```typescript
// Existing data
{ user: { name: "Alice", age: 30 }, theme: "dark" }

// PATCH with
{ user: { age: 31 }, sidebar: true }

// Result (deep merge)
{ user: { name: "Alice", age: 31 }, theme: "dark", sidebar: true }
```

### Test Page

Visit `/hazo_auth/app_user_data_test` in your dev environment to test the API with an interactive UI:
- View current data (live refresh)
- Merge data (PATCH)
- Replace data (PUT)
- Clear data (DELETE)
- JSON validation

### Performance & Limits

- **Recommended max size**: ~10KB per user (for preferences/settings)
- **Storage**: JSON stored as TEXT (no compression)
- **Caching**: Benefits from `hazo_get_auth()` LRU cache
- **Large datasets**: Use separate tables for complex relational data

For full documentation, see `CHANGE_LOG.md` and `TECHDOC.md`.

---

## User Profile Service

The `hazo_auth` package provides a batch user profile retrieval service for applications that need basic user information, such as chat applications or user lists.

### `hazo_get_user_profiles`

Retrieves basic profile information for multiple users in a single batch call.

**Location:** `src/lib/services/user_profiles_service.ts`

```typescript
import { hazo_get_user_profiles } from "hazo_auth/lib/services/user_profiles_service";
import { get_hazo_connect_instance } from "hazo_auth/server/hazo_connect_instance.server";

export async function GET(request: NextRequest) {
  const adapter = get_hazo_connect_instance();
  
  const result = await hazo_get_user_profiles(adapter, [
    "user-id-1",
    "user-id-2",
    "user-id-3",
  ]);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    profiles: result.profiles,
    not_found: result.not_found_ids,
  });
}
```

---

## Local Development (for package contributors)

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd hazo_auth

# Install dependencies
npm install

# Copy configuration files
cp hazo_auth_config.example.ini hazo_auth_config.ini
cp hazo_notify_config.example.ini hazo_notify_config.ini
```

### Development Commands

```bash
# Start development server
npm run dev

# Run Storybook
npm run storybook

# Build the package for distribution
npm run build:pkg

# Run tests
npm test

# Initialize database users/roles
npm run init-users

# Apply database migrations
npx tsx scripts/apply_migration.ts [migration_file_path]
```

### Project Structure

```
hazo_auth/
├── src/
│   ├── app/              # Next.js app directory (demo pages)
│   ├── components/       # React components
│   │   ├── layouts/      # Layout components (login, register, etc.)
│   │   └── ui/           # Reusable UI components (shadcn-based)
│   ├── hooks/            # Client-side React hooks
│   ├── lib/              # Shared utilities and services
│   │   ├── auth/         # Authentication utilities
│   │   ├── config/       # Configuration loaders
│   │   └── services/     # Business logic services
│   ├── server/           # Server-only utilities
│   └── index.ts          # Main entry point
├── dist/                 # Compiled package output
├── migrations/           # Database migration files
├── scripts/              # Utility scripts
├── __tests__/            # Test files and fixtures
└── public/               # Static assets
```

### Building the Package

The package is built using TypeScript with a separate build configuration:

```bash
npm run build:pkg
```

This compiles the `src/` directory to `dist/` with:
- Type declarations (`.d.ts` files)
- ES modules output
- Excludes Next.js app directory and Storybook stories

### Package Exports

The `package.json` exports field defines the public API:

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./pages": "./dist/page_components/index.js",
    "./pages/login": "./dist/page_components/login.js",
    "./pages/register": "./dist/page_components/register.js",
    "./components/layouts/login": "./dist/components/layouts/login/index.js",
    "./components/layouts/register": "./dist/components/layouts/register/index.js",
    "./components/layouts/shared": "./dist/components/layouts/shared/index.js",
    "./lib/auth/hazo_get_auth.server": "./dist/lib/auth/hazo_get_auth.server.js",
    "./server": "./dist/server/index.js",
    "./server/routes": "./dist/server/routes/index.js"
  }
}
```

**Important:** The package uses relative imports internally, so consuming projects do not need to configure webpack aliases or TypeScript paths. Simply install the package and import from the exposed entry points.

### Next Steps

- Use `npx shadcn@latest add <component>` to scaffold new UI primitives.
- Centralize configurable values through `hazo_config`.
- Access backend resources exclusively via `hazo_connect`.

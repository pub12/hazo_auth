## hazo_auth - Authentication UI Component Package

A reusable authentication UI component package powered by Next.js, TailwindCSS, and shadcn. It integrates `hazo_config` for configuration management and `hazo_connect` for data access, enabling future components to stay aligned with platform conventions.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration Setup](#configuration-setup)
- [Database Setup](#database-setup)
- [Using Components](#using-components)
- [Authentication Service](#authentication-service)
- [Profile Picture Menu Widget](#profile-picture-menu-widget)
- [User Profile Service](#user-profile-service)
- [Local Development](#local-development)

---

## Installation

```bash
npm install hazo_auth
```

---

## Quick Start

### 1. Install the package

```bash
npm install hazo_auth
```

### 2. Copy configuration files

```bash
cp node_modules/hazo_auth/hazo_auth_config.example.ini ./hazo_auth_config.ini
cp node_modules/hazo_auth/hazo_notify_config.example.ini ./hazo_notify_config.ini
```

### 3. Set up environment variables

Create a `.env.local` file:

```env
ZEPTOMAIL_API_KEY=your_api_key_here
```

### 4. Set up the database

Run the database setup SQL script (see [Database Setup](#database-setup)).

### 5. Import and use components

```typescript
// Import layout components
import { LoginLayout } from "hazo_auth/components/layouts/login";
import { RegisterLayout } from "hazo_auth/components/layouts/register";

// Import UI components
import { Button } from "hazo_auth/components/ui/button";
import { Input } from "hazo_auth/components/ui/input";

// Import hooks
import { use_hazo_auth } from "hazo_auth/hooks/use_hazo_auth";
import { use_auth_status } from "hazo_auth/hooks/use_auth_status";

// Import server-side utilities
import { hazo_get_auth } from "hazo_auth/lib/auth/hazo_get_auth.server";
import { get_authenticated_user } from "hazo_auth/lib/auth/auth_utils.server";
```

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
- Add other sensitive configuration values as needed

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
```

#### 2. Create the Users Table

```sql
-- Main users table
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
    url_on_logon TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX idx_hazo_users_email ON hazo_users(email_address);
```

**Note:** The `url_on_logon` field is used to store a custom redirect URL for users after successful login. This allows per-user customization of post-login navigation.

#### 3. Create the Refresh Tokens Table

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

#### 4. Create the Permissions Table

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

#### 5. Create the Roles Table

```sql
-- Roles table for RBAC
CREATE TABLE hazo_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

#### 6. Create the Role-Permissions Junction Table

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

#### 7. Create the User-Roles Junction Table

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

-- 1. Create enum type
CREATE TYPE hazo_enum_profile_source_enum AS ENUM ('gravatar', 'custom', 'predefined');

-- 2. Create users table
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
    url_on_logon TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_hazo_users_email ON hazo_users(email_address);

-- 3. Create refresh tokens table
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

## Using Components

### Package Exports

The package exports components through these paths:

```typescript
// Main entry point - exports all public APIs
import { ... } from "hazo_auth";

// Layout components
import { LoginLayout } from "hazo_auth/components/layouts/login";
import { RegisterLayout } from "hazo_auth/components/layouts/register";
import { ForgotPasswordLayout } from "hazo_auth/components/layouts/forgot_password";
import { ResetPasswordLayout } from "hazo_auth/components/layouts/reset_password";
import { EmailVerificationLayout } from "hazo_auth/components/layouts/verify_email";
import { MySettingsLayout } from "hazo_auth/components/layouts/my_settings";
import { UserManagementLayout } from "hazo_auth/components/layouts/user_management";

// UI components
import { Button } from "hazo_auth/components/ui/button";
import { Input } from "hazo_auth/components/ui/input";
import { Avatar } from "hazo_auth/components/ui/avatar";
// ... and more shadcn-based components

// Shared layout components
import { ProfilePicMenu } from "hazo_auth/components/layouts/shared/components/profile_pic_menu";
import { ProfilePicMenuWrapper } from "hazo_auth/components/layouts/shared/components/profile_pic_menu_wrapper";
import { FormActionButtons } from "hazo_auth/components/layouts/shared/components/form_action_buttons";

// Hooks (client-side)
import { use_hazo_auth } from "hazo_auth/hooks/use_hazo_auth";
import { use_auth_status } from "hazo_auth/hooks/use_auth_status";
import { use_login_form } from "hazo_auth/hooks/use_login_form";

// Library utilities
import { hazo_get_auth } from "hazo_auth/lib/auth/hazo_get_auth.server";
import { get_authenticated_user } from "hazo_auth/lib/auth/auth_utils.server";
import { get_server_auth_user } from "hazo_auth/lib/auth/server_auth";

// Server utilities
import { get_hazo_connect_instance } from "hazo_auth/server/hazo_connect_instance.server";
```

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
- `UserManagementLayout` - Admin user/role management

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
# Optional tweaks for the standalone header wrapper/classes:
# standalone_heading = Welcome back
# standalone_description = Your description here
# standalone_wrapper_class = min-h-screen bg-background py-8
# standalone_content_class = mx-auto w-full max-w-4xl rounded-2xl border bg-card
```

- `test_sidebar`: keeps the developer sidebar (perfect for the demo workspace or Storybook screenshots).
- `standalone`: renders the page body directly so it inherits your own app shell, layout, and theme tokens.
- The wrapper and content class overrides let you align spacing/borders with your design system without editing package code.

---

## Authentication Service

The `hazo_auth` package provides a comprehensive authentication and authorization system with role-based access control (RBAC). The main authentication utility is `hazo_get_auth`, which provides user details, permissions, and permission checking with built-in caching and rate limiting.

### Server-Side Functions

#### `hazo_get_auth` (Recommended)

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

import { use_hazo_auth } from "hazo_auth/hooks/use_hazo_auth";

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

import { use_auth_status } from "hazo_auth/hooks/use_auth_status";

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

## Profile Picture Menu Widget

The Profile Picture Menu is a versatile component for navbar or sidebar that automatically displays:
- **When authenticated**: User's profile picture with a dropdown menu containing user info, settings link, logout, and custom menu items
- **When not authenticated**: Sign Up and Sign In buttons (or a single button, configurable)

### Basic Usage (Recommended)

Use the `ProfilePicMenuWrapper` component which automatically loads configuration from `hazo_auth_config.ini`:

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
      />
    </nav>
  );
}
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
    "./components/*": "./dist/components/*.js",
    "./components/ui/*": "./dist/components/ui/*.js",
    "./components/layouts/*": "./dist/components/layouts/*.js",
    "./lib/*": "./dist/lib/*.js",
    "./hooks/*": "./dist/hooks/*.js",
    "./server/*": "./dist/server/*.js"
  }
}
```

### Next Steps

- Use `npx shadcn@latest add <component>` to scaffold new UI primitives.
- Centralize configurable values through `hazo_config`.
- Access backend resources exclusively via `hazo_connect`.

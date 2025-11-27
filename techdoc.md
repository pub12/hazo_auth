# hazo_auth Technical Documentation

## Overview

The `hazo_auth` package is a reusable authentication UI component package for Next.js applications. It provides:

- Complete authentication flows (login, register, forgot password, reset password, email verification)
- User settings and profile management
- Role-based access control (RBAC) with permissions
- Configurable UI components based on shadcn/ui
- Integration with `hazo_config` for configuration and `hazo_connect` for data access

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

The `package.json` exports field defines the public API. Only main entry points are exposed:

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./components/layouts/login": "./dist/components/layouts/login/index.js",
    "./components/layouts/register": "./dist/components/layouts/register/index.js",
    "./components/layouts/forgot_password": "./dist/components/layouts/forgot_password/index.js",
    "./components/layouts/reset_password": "./dist/components/layouts/reset_password/index.js",
    "./components/layouts/email_verification": "./dist/components/layouts/email_verification/index.js",
    "./components/layouts/my_settings": "./dist/components/layouts/my_settings/index.js",
    "./components/layouts/user_management": "./dist/components/layouts/user_management/index.js",
    "./components/layouts/shared": "./dist/components/layouts/shared/index.js",
    "./lib/auth/hazo_get_auth.server": "./dist/lib/auth/hazo_get_auth.server.js",
    "./server": "./dist/server/index.js"
  }
}
```

**Important:** Internal modules (like UI components, utility functions) are not exposed. They are used internally via relative imports and re-exported through the public entry points.

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
│   │   ├── api/auth/           # API routes
│   │   └── */page.tsx          # Demo pages
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

### Database Migrations

Migration files are located in `migrations/`:

| File | Description |
|------|-------------|
| `001_create_tables.sql` | Initial schema creation |
| `002_add_name_to_hazo_users.sql` | Add name field to users |
| `003_add_url_on_logon_to_hazo_users.sql` | Add url_on_logon field for custom redirects |

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

### Shared Components

Located in `src/components/layouts/shared/components/`:

- `FormActionButtons` - Save/Cancel button group
- `FormFieldWrapper` - Input field with edit mode
- `PasswordField` - Password input with visibility toggle
- `ProfilePicMenu` - Profile picture dropdown menu
- `ProfilePicMenuWrapper` - Wrapper with config loading
- `AlreadyLoggedInGuard` - Guard for logged-in users
- `UnauthorizedGuard` - Guard for unauthorized users

### UI Components

Located in `src/components/ui/`, these are shadcn-based components:

- `Button`, `Input`, `Label`, `Select`, `Checkbox`, `Radio`
- `Dialog`, `AlertDialog`, `Sheet`, `Popover`, `Tooltip`
- `Avatar`, `Badge`, `Card`, `Separator`
- `Form`, `Tabs`, `Table`
- And more...

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
| `/api/auth/register` | POST | User registration |
| `/api/auth/login` | POST | User login |
| `/api/auth/logout` | POST | User logout |
| `/api/auth/me` | GET | Get current user info |
| `/api/auth/get_auth` | POST | Get auth with permissions |
| `/api/auth/forgot_password` | POST | Request password reset |
| `/api/auth/reset_password` | POST | Reset password with token |
| `/api/auth/validate_reset_token` | GET | Validate reset token |
| `/api/auth/verify_email` | GET | Verify email with token |
| `/api/auth/resend_verification` | POST | Resend verification email |

### Profile Management Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/update_user` | PATCH | Update user profile |
| `/api/auth/change_password` | POST | Change password |
| `/api/auth/upload_profile_picture` | POST | Upload profile picture |
| `/api/auth/remove_profile_picture` | DELETE | Remove profile picture |
| `/api/auth/library_photos` | GET | Get library photos |

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

### Route Protection (Middleware)

The `src/middleware.ts` automatically protects routes:

- **Public Routes:** `/login`, `/register`, `/forgot_password`, etc.
- **Protected Routes:** All other routes require authentication cookies
- Redirects to `/login?redirect=<original_path>` if not authenticated

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

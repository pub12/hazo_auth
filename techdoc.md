# hazo_auth Technical Documentation

## Overall

### File Architecture

The `hazo_auth` package is organized as follows:

- **`src/lib/`** - Core library code including:
  - **`auth/`** - Authentication utilities for server-side and API routes
  - **`config/`** - Shared configuration loader utilities
  - **`services/`** - Business logic services (registration, login, password reset, etc.)
  - **`*_config.server.ts`** - Server-side configuration readers for each layout/feature
  - **`hazo_connect_instance.server.ts`** - Singleton hazo_connect adapter instance
  - **`hazo_connect_setup.server.ts`** - hazo_connect configuration and initialization
  - **`app_logger.ts`** - Application logging service wrapper
  - **`utils/`** - Shared utility functions (API route helpers, etc.)

- **`src/components/`** - React components:
  - **`layouts/`** - Layout components (login, register, forgot_password, reset_password, verify_email, my_settings)
  - **`layouts/shared/`** - Shared layout components and utilities
  - **`ui/`** - Reusable UI components (Shadcn-based)

- **`src/app/`** - Next.js app directory:
  - **`api/auth/`** - API routes for authentication operations
  - **`*/page.tsx`** - Page components that render layouts within sidebar

- **`src/middleware.ts`** - Next.js middleware for automatic route protection based on authentication status

- **`hazo_auth_config.ini`** - Main configuration file located at the project root
- **`hazo_notify_config.ini`** - Email service configuration file located at the project root

### Key Files

- **`instrumentation.ts`** - Next.js instrumentation file that runs once when server starts. Initializes hazo_notify email service and passes configuration instance to email service.

- **`src/lib/config/config_loader.server.ts`** - Shared utility for reading configuration from `hazo_auth_config.ini` using `hazo_config`. Provides helper functions: `read_config_section()`, `get_config_value()`, `get_config_boolean()`, `get_config_number()`, `get_config_array()`.

- **`src/lib/hazo_connect_instance.server.ts`** - Singleton instance of hazo_connect adapter, initialized once and reused across all routes/components.

- **`src/lib/utils/api_route_helpers.ts`** - Shared helper functions for API routes to get filename and line number from call stack for logging.

- **`src/lib/app_logger.ts`** - Wrapper around the main app logger service. All server-side code should use `create_app_logger()` instead of `console.log/error/warn`.

- **`src/lib/auth/auth_utils.server.ts`** - Server-side authentication utilities for API routes. Provides `get_authenticated_user()`, `is_authenticated()`, and `require_auth()` functions.

- **`src/lib/auth/server_auth.ts`** - Server-side authentication utilities for server components and pages. Provides `get_server_auth_user()` and `is_server_authenticated()` functions.

- **`src/middleware.ts`** - Next.js middleware that automatically protects routes based on authentication cookies. Runs in Edge Runtime and only checks if cookies exist - actual database validation happens in API routes. Public routes (login, register, etc.) are allowed without authentication, while protected routes require authentication cookies and redirect to login if not present.

### Configuration Management

Configuration is managed through two main configuration files:

1. **`hazo_auth_config.ini`** - Main application configuration file, managed using the `hazo_config` npm package. The shared config loader (`config_loader.server.ts`) provides a unified interface for reading configuration values with type conversion and defaults.

2. **`hazo_notify_config.ini`** - Email service configuration file for `hazo_notify` (located in the project root). Managed by `hazo_notify` package and loaded during server startup in `instrumentation.ts`. See `hazo_notify_config.ini` for available configuration options.

Configuration sections (hazo_auth_config.ini):
- `hazo_auth__register_layout` - Register page configuration
- `hazo_auth__login_layout` - Login page configuration
- `hazo_auth__forgot_password_layout` - Forgot password page configuration
- `hazo_auth__reset_password_layout` - Reset password page configuration
- `hazo_auth__email_verification_layout` - Email verification page configuration
- `hazo_auth__my_settings_layout` - My Settings page configuration
- `hazo_auth__password_requirements` - Shared password requirements (used by register and reset password)
- `hazo_auth__user_fields` - Shared user field visibility (used by register and my_settings)
- `hazo_auth__already_logged_in` - Shared "already logged in" message and button configuration
- `hazo_auth__profile_picture` - Profile picture configuration
- `hazo_auth__tokens` - Token expiry configuration
- `hazo_auth__messages` - User-facing messages
- `hazo_auth__ui_sizes` - UI size configuration (Gravatar size, tooltip sizes, grid columns, etc.)
- `hazo_auth__file_types` - Allowed file extensions and MIME types
- `hazo_auth__email` - Email configuration (from address, base URL, template directory, template settings)

Note: Email sending is handled by `hazo_notify`, which reads its configuration from `hazo_notify_config.ini`. The `hazo_auth__email` section is used for template-related settings (directory, subjects) and base URL for email links.

### Logging

All server-side code uses the logger service via `create_app_logger()` from `app_logger.ts`. Log entries should include:
- `filename` - Source file name
- `line_number` - Line number (use `get_filename()` and `get_line_number()` from `api_route_helpers.ts` for API routes)
- Relevant context data (user_id, error messages, etc.)

Client-side components use toast notifications (Sonner) for user-facing errors instead of console logging.

## Components

### Layout Components

All layout components follow a similar pattern:
1. Server-side page component (`page.tsx`) reads configuration and passes to client component
2. Client component (`*_page_client.tsx`) renders the layout within sidebar
3. Layout component (`layouts/*/index.tsx`) contains the actual UI

#### Register Layout

- **File:** `src/components/layouts/register/index.tsx`
- **Config:** `hazo_auth__register_layout`, `hazo_auth__password_requirements`, `hazo_auth__user_fields`, `hazo_auth__already_logged_in`
- **API Route:** `/api/auth/register` (POST)
- **Service:** `registration_service.ts`

#### Login Layout

- **File:** `src/components/layouts/login/index.tsx`
- **Config:** `hazo_auth__login_layout`, `hazo_auth__already_logged_in`
- **API Route:** `/api/auth/login` (POST)
- **Service:** `login_service.ts`

#### Forgot Password Layout

- **File:** `src/components/layouts/forgot_password/index.tsx`
- **Config:** `hazo_auth__forgot_password_layout`, `hazo_auth__already_logged_in`
- **API Route:** `/api/auth/forgot_password` (POST)
- **Service:** `password_reset_service.ts`

#### Reset Password Layout

- **File:** `src/components/layouts/reset_password/index.tsx`
- **Config:** `hazo_auth__reset_password_layout`, `hazo_auth__password_requirements`, `hazo_auth__already_logged_in`
- **API Route:** `/api/auth/reset_password` (POST)
- **Service:** `password_reset_service.ts`

#### Email Verification Layout

- **File:** `src/components/layouts/verify_email/index.tsx`
- **Config:** `hazo_auth__email_verification_layout`, `hazo_auth__already_logged_in`
- **API Route:** `/api/auth/verify_email` (GET)
- **Service:** `email_verification_service.ts`

#### My Settings Layout

- **File:** `src/components/layouts/my_settings/index.tsx`
- **Config:** `hazo_auth__my_settings_layout`, `hazo_auth__user_fields`, `hazo_auth__password_requirements`, `hazo_auth__profile_picture`, `hazo_auth__messages`, `hazo_auth__ui_sizes`, `hazo_auth__file_types`
- **API Routes:**
  - `/api/auth/me` (GET) - Get current user info
  - `/api/auth/update_user` (PATCH) - Update user profile
  - `/api/auth/change_password` (POST) - Change password
  - `/api/auth/upload_profile_picture` (POST) - Upload profile picture
  - `/api/auth/remove_profile_picture` (DELETE) - Remove profile picture
  - `/api/auth/library_photos` (GET) - Get library photo categories and photos
- **Services:** `user_update_service.ts`, `password_change_service.ts`, `profile_picture_service.ts`, `profile_picture_remove_service.ts`

## API Routes

All API routes follow a consistent pattern:
1. Import shared helpers: `get_filename`, `get_line_number` from `@/lib/utils/api_route_helpers`
2. Create logger: `const logger = create_app_logger()`
3. Get hazo_connect instance: `get_hazo_connect_instance()`
4. Handle request with proper error logging
5. Return JSON response with appropriate status codes

### Authentication Routes

- **`/api/auth/register`** (POST) - User registration
- **`/api/auth/login`** (POST) - User login
- **`/api/auth/logout`** (POST) - User logout
- **`/api/auth/me`** (GET) - Get current authenticated user info
- **`/api/auth/forgot_password`** (POST) - Request password reset
- **`/api/auth/reset_password`** (POST) - Reset password with token
- **`/api/auth/validate_reset_token`** (GET) - Validate reset token
- **`/api/auth/verify_email`** (GET) - Verify email with token
- **`/api/auth/resend_verification`** (POST) - Resend verification email

### Profile Management Routes

- **`/api/auth/update_user`** (PATCH) - Update user profile (name, email)
- **`/api/auth/change_password`** (POST) - Change password (requires current password)
- **`/api/auth/upload_profile_picture`** (POST) - Upload profile picture (multipart/form-data)
- **`/api/auth/remove_profile_picture`** (DELETE) - Remove profile picture
- **`/api/auth/library_photos`** (GET) - Get library photo categories and photos in a category

## Services

### Registration Service

- **File:** `src/lib/services/registration_service.ts`
- **Function:** `register_user(adapter, data)`
- **Features:**
  - Validates email uniqueness
  - Hashes password with Argon2
  - Creates user in `hazo_users` table
  - Sets default profile picture based on config priority (Gravatar/library)
  - Creates email verification token
  - Sends verification email using email service
  - Returns user_id on success

### Login Service

- **File:** `src/lib/services/login_service.ts`
- **Function:** `authenticate_user(adapter, email, password)`
- **Features:**
  - Validates credentials
  - Checks email verification status
  - Updates last_logon timestamp
  - Logs login attempts (IP address, success/failure)
  - Returns user info on success

### Password Reset Service

- **File:** `src/lib/services/password_reset_service.ts`
- **Functions:**
  - `request_password_reset(adapter, email)` - Creates password reset token and sends password reset email
  - `validate_password_reset_token(adapter, token)` - Validates token without resetting
  - `reset_password(adapter, token, new_password)` - Validates token and resets password
- **Features:**
  - Token expiry based on config (default: 10 minutes)
  - Token hashing with Argon2
  - Invalidates token after use
  - Sends password reset email using email service
  - Sends password changed notification email after successful password reset

### Password Change Service

- **File:** `src/lib/services/password_change_service.ts`
- **Function:** `change_password(adapter, user_id, data)` - Changes user password when logged in
- **Features:**
  - Verifies current password before allowing change
  - Validates new password against requirements from config
  - Updates password hash in database
  - Sends password changed notification email using email service

### Email Verification Service

- **File:** `src/lib/services/email_verification_service.ts`
- **Functions:**
  - `verify_email_token(adapter, token)` - Verifies email with token
  - `resend_verification_email(adapter, email)` - Creates new verification token and sends verification email
- **Features:**
  - Token expiry based on config (default: 48 hours)
  - Updates `email_verified` flag in `hazo_users` table
  - Sends verification email using email service

### Email Service

- **File:** `src/lib/services/email_service.ts`
- **Functions:**
  - `send_email(options)` - Sends an email using hazo_notify
  - `send_template_email(template_type, to, data)` - Sends an email using a template
  - `set_hazo_notify_instance(config)` - Sets the hazo_notify configuration instance (called from instrumentation.ts)
- **Email Provider:**
  - Uses `hazo_notify` npm package for sending emails
  - Initialized in `instrumentation.ts` during server startup
  - Configuration loaded from `hazo_notify_config.ini` in the project root directory
  - Falls back to loading config on first use if not initialized
- **Template Types:**
  - `email_verification` - Email verification template
  - `forgot_password` - Password reset template
  - `password_changed` - Password changed notification template
- **Features:**
  - Loads templates from configured directory (default: `./email_templates`)
  - Falls back to default templates if custom templates are not found
  - Supports HTML and text email templates
  - Template variable substitution using `{{variable}}` syntax
  - Constructs verification/reset URLs from base URL config
  - Sends emails using hazo_notify (supports Zeptomail API, SMTP, and POP3 providers)
- **Template Variables:**
  - `{{token}}` - The verification/reset token (email_verification, forgot_password templates only)
  - `{{verification_url}}` - Full URL for email verification (email_verification template only)
  - `{{reset_url}}` - Full URL for password reset (forgot_password template only)
  - `{{user_email}}` - User's email address (all templates)
  - `{{user_name}}` - User's name (if available, all templates)
- **Configuration (hazo_auth_config.ini):**
  - `email_from` - Email from address (optional: overrides hazo_notify_config.ini from_email setting)
    - Priority: 1. hazo_auth__email.from_email, 2. hazo_notify_config.ini from_email
    - If not set, uses hazo_notify_config.ini from_email setting
  - `from_name` - Email from name (optional: overrides hazo_notify_config.ini from_name setting)
    - Priority: 1. hazo_auth__email.from_name, 2. hazo_notify_config.ini from_name
    - If not set, uses hazo_notify_config.ini from_name setting
  - `base_url` - Base URL for email links (default: empty, uses relative URLs)
    - Priority: 1. hazo_auth__email.base_url, 2. APP_DOMAIN_NAME env var, 3. NEXT_PUBLIC_APP_URL/APP_URL env vars
  - `email_template_main_directory` - Directory containing email templates (default: `./email_templates`)
  - `email_template__forgot_password` - Config key for forgot password template
  - `email_template__forgot_password__subject` - Subject for forgot password email
  - `email_template__email_verification` - Config key for email verification template
  - `email_template__email_verification__subject` - Subject for email verification email
  - `email_template__password_changed` - Config key for password changed notification template
  - `email_template__password_changed__subject` - Subject for password changed notification email
- **Configuration (hazo_notify_config.ini):**
  - `emailer_module` - Email provider (zeptoemail_api, smtp, pop3)
  - `from_email` - Default sender email address
  - `from_name` - Default sender name
  - `zeptomail_api_endpoint` - Zeptomail API endpoint (if using zeptoemail_api)
  - `zeptomail_api_key` - Zeptomail API key (set via ZEPTOMAIL_API_KEY environment variable, recommended)
  - See `hazo_notify_config.ini` for full configuration options
- **Template Files:**
  - Templates should be named: `<template_type>.html` and `<template_type>.txt`
  - Example: `email_verification.html`, `email_verification.txt`, `forgot_password.html`, `forgot_password.txt`, `password_changed.html`, `password_changed.txt`
  - Templates support variable substitution using `{{variable}}` syntax
  - If template files are not found, default templates are used
- **Initialization:**
  - `instrumentation.ts` loads hazo_notify configuration during server startup
  - Configuration instance is passed to email service via `set_hazo_notify_instance()`
  - If initialization fails, email service will attempt to load config on first use

### Profile Picture Service

- **File:** `src/lib/services/profile_picture_service.ts`
- **Functions:**
  - `get_gravatar_url(email, size?)` - Generates Gravatar URL (size from config)
  - `get_library_categories()` - Gets library photo categories
  - `get_library_photos(category)` - Gets photos in a category (filters by config file types)
  - `get_default_profile_picture(adapter, user_email)` - Gets default profile picture based on config priority
  - `update_user_profile_picture(adapter, user_id, url, source)` - Updates profile picture in database
- **Features:**
  - Supports Gravatar, library photos, and custom uploads
  - File type validation based on config
  - Size configuration from `hazo_auth__ui_sizes`

### Token Service

- **File:** `src/lib/services/token_service.ts`
- **Function:** `create_token(adapter, user_id, token_type)`
- **Token Types:** `refresh`, `password_reset`, `email_verification`
- **Features:**
  - Token expiry from config (`hazo_auth__tokens` section)
  - Token hashing with Argon2
  - Invalidates existing tokens of same type for user
  - Returns raw token for sending to user (email, etc.)

### User Profiles Service

- **File:** `src/lib/services/user_profiles_service.ts`
- **Function:** `hazo_get_user_profiles(adapter, user_ids)`
- **Purpose:** Batch retrieval of basic user profile information for chat applications and similar use cases
- **Return Type:**
  ```typescript
  type UserProfileInfo = {
    user_id: string;
    profile_picture_url: string | null;
    email: string;
    name: string | null;
    days_since_created: number;
  };

  type GetProfilesResult = {
    success: boolean;
    profiles: UserProfileInfo[];
    not_found_ids: string[];
    error?: string;
  };
  ```
- **Features:**
  - Batch retrieval using single database query with `in` filter
  - Automatic deduplication of input user IDs
  - Returns list of user IDs that were not found (`not_found_ids`)
  - Profile picture URL is returned directly from database (already resolved)
  - Calculates `days_since_created` using `date-fns` `differenceInDays`
  - Error handling with `sanitize_error_for_user` for user-friendly messages
  - Logging of successful retrievals and errors

## Constraints

- All database interactions must use `hazo_connect` adapter passed as parameter
- All server-side code must use logger service, not console.log/error/warn
- All configuration must be read from `hazo_auth_config.ini` using shared config loader
- All user-facing messages and sizes must be configurable via config file
- Client components cannot directly import server-side config - values must be passed as props
- API routes must use shared `get_filename()` and `get_line_number()` helpers for logging

## Example Code

### Reading Configuration

```typescript
import { get_config_value, get_config_boolean, get_config_number } from "@/lib/config/config_loader.server";

const message = get_config_value("hazo_auth__messages", "photo_upload_disabled_message", "Photo upload is not enabled.");
const enabled = get_config_boolean("hazo_auth__profile_picture", "allow_photo_upload", false);
const size = get_config_number("hazo_auth__ui_sizes", "gravatar_size", 200);
```

### Using Logger Service

```typescript
import { create_app_logger } from "@/lib/app_logger";
import { get_filename, get_line_number } from "@/lib/utils/api_route_helpers";

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

### API Route Pattern

```typescript
import { NextRequest, NextResponse } from "next/server";
import { get_hazo_connect_instance } from "@/lib/hazo_connect_instance.server";
import { create_app_logger } from "@/lib/app_logger";
import { get_filename, get_line_number } from "@/lib/utils/api_route_helpers";
import { some_service_function } from "@/lib/services/some_service";

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
    const error_stack = error instanceof Error ? error.stack : undefined;
    
    logger.error("operation_failed", {
      filename: get_filename(),
      line_number: get_line_number(),
      error: error_message,
      error_stack,
    });
    
    return NextResponse.json(
      { error: "Operation failed" },
      { status: 500 }
    );
  }
}
```

## Authentication Management

### Authentication System

hazo_auth provides a centralized authentication management system that allows the parent application to easily check login status and protect routes.

#### Authentication Storage

- **Cookies**: Authentication is stored in HTTP-only cookies:
  - `hazo_auth_user_id` - User ID
  - `hazo_auth_user_email` - User email address
  - Cookies are set on login (30-day expiry) and cleared on logout
  - HttpOnly, Secure in production, SameSite: lax

#### Server-Side Authentication Utilities

**For API Routes** (`src/lib/auth/auth_utils.server.ts`):

- **`get_authenticated_user(request: NextRequest): Promise<AuthResult>`**
  - Checks if user is authenticated from request cookies
  - Validates user exists, is active, and cookies match
  - Returns `AuthUser` if authenticated, `{ authenticated: false }` otherwise

- **`is_authenticated(request: NextRequest): Promise<boolean>`**
  - Simple boolean check for authentication status
  - Returns `true` if authenticated, `false` otherwise

- **`require_auth(request: NextRequest): Promise<AuthUser>`**
  - Requires authentication - throws error if not authenticated
  - Use in API routes that require authentication
  - Throws `Error("Authentication required")` if not authenticated

- **`get_authenticated_user_with_response(request: NextRequest): Promise<{ auth_result: AuthResult; response?: NextResponse }>`**
  - Gets authenticated user and returns response with cleared cookies if invalid
  - Useful for `/api/auth/me` endpoint that needs to clear cookies on invalid auth

**For Server Components/Pages** (`src/lib/auth/server_auth.ts`):

- **`get_server_auth_user(): Promise<ServerAuthResult>`**
  - Gets authenticated user in server components/pages
  - Uses Next.js `cookies()` function to read authentication cookies
  - Returns `ServerAuthUser` if authenticated, `{ authenticated: false }` otherwise

- **`is_server_authenticated(): Promise<boolean>`**
  - Checks if user is authenticated in server components/pages
  - Returns `true` if authenticated, `false` otherwise

#### Client-Side Authentication

**React Hook** (`src/components/layouts/shared/hooks/use_auth_status.ts`):

- **`use_auth_status(): AuthStatus`**
  - React hook that checks authentication status
  - Calls `/api/auth/me` endpoint
  - Returns `{ authenticated, user_id, email, name, email_verified, last_logon, profile_picture_url, profile_source, loading, refresh }`
  - Automatically refreshes on mount and listens for auth status change events

- **`trigger_auth_status_refresh(): void`**
  - Triggers a refresh of authentication status across all components
  - Dispatches a custom event that all `use_auth_status` hooks listen to

#### Route Protection

**Next.js Middleware** (`src/middleware.ts`):

- Automatically protects routes based on authentication cookies
- **Note**: Middleware runs in Edge Runtime and cannot access Node.js APIs (like SQLite)
- Only checks if authentication cookies exist - actual database validation happens in API routes
- **Public Routes** (allowed without authentication):
  - `/login`, `/register`, `/forgot_password`, `/reset_password`, `/verify_email`
  - `/api/auth/login`, `/api/auth/register`, `/api/auth/forgot_password`, `/api/auth/reset_password`, `/api/auth/verify_email`, `/api/auth/validate_reset_token`, `/api/auth/me`
- **Protected Routes**: All other routes require authentication cookies
  - Redirects to `/login?redirect=<original_path>` if cookies are not present
  - Actual user validation (checking if user exists, is active, etc.) happens in API routes

#### Usage Examples

**In API Routes:**
```typescript
import { require_auth } from "@/lib/auth/auth_utils.server";

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await require_auth(request);
    
    // user.user_id, user.email, etc. are now available
    // ... rest of the code
  } catch (error) {
    if (error.message === "Authentication required") {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    // ... handle other errors
  }
}
```

**In Server Components/Pages:**
```typescript
import { get_server_auth_user } from "@/lib/auth/server_auth";

export default async function MyPage() {
  const auth_result = await get_server_auth_user();
  
  if (!auth_result.authenticated) {
    redirect("/login");
  }
  
  // auth_result.user_id, auth_result.email, etc. are available
  return <div>Welcome {auth_result.name}</div>;
}
```

**In Client Components:**
```typescript
import { use_auth_status } from "@/components/layouts/shared/hooks/use_auth_status";

export function MyComponent() {
  const { authenticated, user_id, email, loading } = use_auth_status();
  
  if (loading) return <div>Loading...</div>;
  if (!authenticated) return <div>Please log in</div>;
  
  return <div>Welcome {email}</div>;
}
```

#### Guard Components

- **`UnauthorizedGuard`** - Shows unauthorized message if user is not authenticated, otherwise renders children
- **`AlreadyLoggedInGuard`** - Shows "already logged in" message if user is authenticated, otherwise renders children


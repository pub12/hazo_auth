## hazo_auth - Authentication UI Component Package

A reusable authentication UI component package powered by Next.js, TailwindCSS, and shadcn. It integrates `hazo_config` for configuration management and `hazo_connect` for data access, enabling future components to stay aligned with platform conventions.

### Installation

```bash
npm install hazo_auth
```

### Configuration Setup

After installing the package, you need to set up configuration files in your project root:

1. **Copy the example config files to your project root:**
   ```bash
   cp node_modules/hazo_auth/hazo_auth_config.example.ini ./hazo_auth_config.ini
   cp node_modules/hazo_auth/hazo_notify_config.example.ini ./hazo_notify_config.ini
   ```

2. **Customize the configuration files:**
   - Edit `hazo_auth_config.ini` to configure authentication settings, database connection, UI labels, and more
   - Edit `hazo_notify_config.ini` to configure email service settings (Zeptomail, SMTP, etc.)

3. **Set up environment variables (recommended for sensitive data):**
   - Create a `.env.local` file in your project root
   - Add `ZEPTOMAIL_API_KEY=your_api_key_here` (if using Zeptomail)
   - Add other sensitive configuration values as needed

**Important:** The configuration files must be located in your project root directory (where `process.cwd()` points to), not inside `node_modules`. The package reads configuration from `process.cwd()` at runtime, so storing them elsewhere (including `node_modules/hazo_auth`) will break runtime access.

### Expose hazo_auth Routes in the Consumer App

Because `src/app/hazo_auth` (pages) and `src/app/api/hazo_auth` (API routes) need to be part of the consuming Next.js app’s routing tree, make sure they exist in your project’s `src/app` directory. Two recommended approaches:

1. **Create symlinks (preferred during development):**
   ```bash
   mkdir -p src/app/api src/app
   ln -s ../../node_modules/hazo_auth/src/app/api/hazo_auth src/app/api/hazo_auth
   ln -s ../../node_modules/hazo_auth/src/app/hazo_auth src/app/hazo_auth
   ```
   Adjust the relative paths if your project structure differs.

2. **Copy the directories (useful for deployment or when symlinks cause issues):**
   ```bash
   cp -R node_modules/hazo_auth/src/app/api/hazo_auth src/app/api/hazo_auth
   cp -R node_modules/hazo_auth/src/app/hazo_auth src/app/hazo_auth
   ```
   Add an npm script (e.g., `postinstall`) to automate copying after installations or updates.

> The package expects these routes to live at `src/app/api/hazo_auth` and `src/app/hazo_auth` inside the consumer project. Without copying or linking them, Next.js won’t mount the auth pages or APIs.

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

**Non-strict mode (returns permission status without throwing):**

```typescript
// Check permissions without throwing errors
const authResult = await hazo_get_auth(request, {
  required_permissions: ["admin_user_management"],
  strict: false, // Returns permission_ok: false if missing
});

if (authResult.authenticated && authResult.permission_ok) {
  // User has required permissions
} else if (authResult.authenticated) {
  // User is authenticated but missing permissions
  console.log("Missing permissions:", authResult.missing_permissions);
} else {
  // User is not authenticated
}
```

#### `get_authenticated_user`

Basic authentication check for API routes. Returns user info if authenticated, or `{ authenticated: false }` if not.

**Location:** `src/lib/auth/auth_utils.server.ts`

**Function Signature:**
```typescript
import { get_authenticated_user } from "hazo_auth/lib/auth/auth_utils.server";
import type { AuthResult } from "hazo_auth/lib/auth/auth_utils.server";

async function get_authenticated_user(request: NextRequest): Promise<AuthResult>
```

**Example Usage:**

```typescript
import { NextRequest, NextResponse } from "next/server";
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

#### `require_auth`

Requires authentication and throws an error if the user is not authenticated. Useful for protected API routes.

**Location:** `src/lib/auth/auth_utils.server.ts`

**Function Signature:**
```typescript
import { require_auth } from "hazo_auth/lib/auth/auth_utils.server";
import type { AuthUser } from "hazo_auth/lib/auth/auth_utils.server";

async function require_auth(request: NextRequest): Promise<AuthUser>
```

**Example Usage:**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { require_auth } from "hazo_auth/lib/auth/auth_utils.server";

export async function GET(request: NextRequest) {
  try {
    const user = await require_auth(request);
    // User is guaranteed to be authenticated here
    return NextResponse.json({ user_id: user.user_id, email: user.email });
  } catch (error) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }
}
```

#### `is_authenticated`

Simple boolean check for authentication status.

**Location:** `src/lib/auth/auth_utils.server.ts`

**Function Signature:**
```typescript
import { is_authenticated } from "hazo_auth/lib/auth/auth_utils.server";

async function is_authenticated(request: NextRequest): Promise<boolean>
```

**Example Usage:**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { is_authenticated } from "hazo_auth/lib/auth/auth_utils.server";

export async function GET(request: NextRequest) {
  const authenticated = await is_authenticated(request);
  
  if (!authenticated) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  // Continue with authenticated logic
}
```

#### `get_server_auth_user`

Gets authenticated user in server components and pages (uses Next.js `cookies()` function).

**Location:** `src/lib/auth/server_auth.ts`

**Function Signature:**
```typescript
import { get_server_auth_user } from "hazo_auth/lib/auth/server_auth";
import type { ServerAuthResult } from "hazo_auth/lib/auth/server_auth";

async function get_server_auth_user(): Promise<ServerAuthResult>
```

**Example Usage:**

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

**Location:** `src/components/layouts/shared/hooks/use_hazo_auth.ts`

**Function Signature:**
```typescript
import { use_hazo_auth } from "hazo_auth/components/layouts/shared/hooks/use_hazo_auth";
import type { UseHazoAuthOptions, UseHazoAuthResult } from "hazo_auth/components/layouts/shared/hooks/use_hazo_auth";

function use_hazo_auth(options?: UseHazoAuthOptions): UseHazoAuthResult
```

**Options:**
- `required_permissions?: string[]` - Array of permission names to check
- `strict?: boolean` - If `true`, throws error when permissions are missing (default: `false`)
- `skip?: boolean` - Skip fetch (for conditional use)

**Return Type:**
```typescript
type UseHazoAuthResult = HazoAuthResult & {
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};
```

**Example Usage:**

```typescript
"use client";

import { use_hazo_auth } from "hazo_auth/components/layouts/shared/hooks/use_hazo_auth";

export function ProtectedComponent() {
  const { authenticated, user, permissions, permission_ok, loading, error, refetch } = 
    use_hazo_auth({
      required_permissions: ["admin_user_management"],
      strict: false,
    });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!authenticated) {
    return <div>Please log in to access this page.</div>;
  }

  if (!permission_ok) {
    return <div>You don't have permission to access this page.</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.name || user?.email_address}!</h1>
      <p>Your permissions: {permissions.join(", ")}</p>
      <button onClick={() => refetch()}>Refresh Auth Status</button>
    </div>
  );
}
```

**Conditional Permission Checks:**

```typescript
"use client";

import { use_hazo_auth } from "hazo_auth/components/layouts/shared/hooks/use_hazo_auth";

export function ConditionalComponent() {
  // Check multiple permissions
  const userManagementAuth = use_hazo_auth({
    required_permissions: ["admin_user_management"],
  });

  const roleManagementAuth = use_hazo_auth({
    required_permissions: ["admin_role_management"],
  });

  return (
    <div>
      {userManagementAuth.permission_ok && (
        <button>Manage Users</button>
      )}
      {roleManagementAuth.permission_ok && (
        <button>Manage Roles</button>
      )}
    </div>
  );
}
```

#### `trigger_hazo_auth_refresh`

Triggers a refresh of authentication status across all components using `use_hazo_auth`. Useful after login, logout, or permission changes.

**Location:** `src/components/layouts/shared/hooks/use_hazo_auth.ts`

**Function Signature:**
```typescript
import { trigger_hazo_auth_refresh } from "hazo_auth/components/layouts/shared/hooks/use_hazo_auth";

function trigger_hazo_auth_refresh(): void
```

**Example Usage:**

```typescript
"use client";

import { trigger_hazo_auth_refresh } from "hazo_auth/components/layouts/shared/hooks/use_hazo_auth";

export function LogoutButton() {
  const handleLogout = async () => {
    await fetch("/api/hazo_auth/logout", { method: "POST" });
    trigger_hazo_auth_refresh(); // Notify all components to refresh auth status
    window.location.href = "/hazo_auth/login";
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

### Configuration

The authentication utility can be configured in `hazo_auth_config.ini` under the `[hazo_auth__auth_utility]` section:

```ini
[hazo_auth__auth_utility]
# Cache settings
# Maximum number of users to cache (LRU eviction, default: 10000)
cache_max_users = 10000

# Cache TTL in minutes (default: 15)
cache_ttl_minutes = 15

# Force cache refresh if older than this many minutes (default: 30)
cache_max_age_minutes = 30

# Rate limiting for /api/hazo_auth/get_auth endpoint
# Per-user rate limit (requests per minute, default: 100)
rate_limit_per_user = 100

# Per-IP rate limit for unauthenticated requests (default: 200)
rate_limit_per_ip = 200

# Permission check behavior
# Log all permission denials for security audit (default: true)
log_permission_denials = true

# User-friendly error messages
# Enable mapping of technical permissions to user-friendly messages (default: true)
enable_friendly_error_messages = true

# Permission message mappings (optional, comma-separated: permission_name:user_message)
# Example: admin_user_management:You don't have access to user management,admin_role_management:You don't have access to role management
permission_error_messages = 
```

### Testing Authentication and RBAC

#### Testing User Authentication

To test if a user is authenticated, use the `hazo_get_auth` function or the `use_hazo_auth` hook:

```typescript
// Server-side test
const authResult = await hazo_get_auth(request);
if (authResult.authenticated) {
  console.log("User is authenticated:", authResult.user.email_address);
  console.log("User permissions:", authResult.permissions);
} else {
  console.log("User is not authenticated");
}

// Client-side test
const { authenticated, user, permissions } = use_hazo_auth();
if (authenticated) {
  console.log("User is authenticated:", user?.email_address);
  console.log("User permissions:", permissions);
}
```

#### Testing RBAC Permissions

To test if a user has specific permissions:

```typescript
// Server-side - strict mode (throws error if missing)
try {
  const authResult = await hazo_get_auth(request, {
    required_permissions: ["admin_user_management", "admin_role_management"],
    strict: true,
  });
  // User has all required permissions
  console.log("Access granted");
} catch (error) {
  if (error instanceof PermissionError) {
    console.log("Missing permissions:", error.missing_permissions);
    console.log("User permissions:", error.user_permissions);
    console.log("User-friendly message:", error.user_friendly_message);
  }
}

// Server-side - non-strict mode (returns status)
const authResult = await hazo_get_auth(request, {
  required_permissions: ["admin_user_management"],
  strict: false,
});

if (authResult.authenticated && authResult.permission_ok) {
  console.log("User has required permissions");
} else if (authResult.authenticated) {
  console.log("User is missing permissions:", authResult.missing_permissions);
}

// Client-side test
const { permission_ok, missing_permissions, permissions } = use_hazo_auth({
  required_permissions: ["admin_user_management"],
});

if (permission_ok) {
  console.log("User has required permissions");
} else {
  console.log("Missing permissions:", missing_permissions);
  console.log("User permissions:", permissions);
}
```

#### Getting All User Permissions

To get all permissions for the current user:

```typescript
// Server-side
const authResult = await hazo_get_auth(request);
if (authResult.authenticated) {
  console.log("All user permissions:", authResult.permissions);
  // Check if user has a specific permission
  const hasPermission = authResult.permissions.includes("admin_user_management");
}

// Client-side
const { permissions } = use_hazo_auth();
console.log("All user permissions:", permissions);
const hasPermission = permissions.includes("admin_user_management");
```

#### Testing in API Routes

Example of a protected API route with permission checking:

```typescript
// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { hazo_get_auth } from "hazo_auth/lib/auth/hazo_get_auth.server";
import { PermissionError } from "hazo_auth/lib/auth/auth_types";

export async function GET(request: NextRequest) {
  try {
    // Require authentication and specific permission
    const authResult = await hazo_get_auth(request, {
      required_permissions: ["admin_user_management"],
      strict: true,
    });

    // Fetch users (only accessible to admins)
    const users = await fetchUsers();
    
    return NextResponse.json({ users });
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
    
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }
}
```

#### Testing in React Components

Example of a protected component with permission-based UI:

```typescript
"use client";

import { use_hazo_auth } from "hazo_auth/components/layouts/shared/hooks/use_hazo_auth";

export function AdminDashboard() {
  const userManagementAuth = use_hazo_auth({
    required_permissions: ["admin_user_management"],
  });

  const roleManagementAuth = use_hazo_auth({
    required_permissions: ["admin_role_management"],
  });

  if (userManagementAuth.loading || roleManagementAuth.loading) {
    return <div>Loading...</div>;
  }

  if (!userManagementAuth.authenticated) {
    return <div>Please log in to access this page.</div>;
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {userManagementAuth.permission_ok && (
        <section>
          <h2>User Management</h2>
          {/* User management UI */}
        </section>
      )}
      {roleManagementAuth.permission_ok && (
        <section>
          <h2>Role Management</h2>
          {/* Role management UI */}
        </section>
      )}
      {!userManagementAuth.permission_ok && !roleManagementAuth.permission_ok && (
        <div>You don't have permission to access any admin features.</div>
      )}
    </div>
  );
}
```

### Cache Invalidation

The authentication cache is automatically invalidated in the following scenarios:
- User logout
- Password change
- User deactivation
- Role assignment changes
- Permission changes to roles

You can also manually invalidate the cache using the API endpoint:

```typescript
// POST /api/hazo_auth/invalidate_cache
// Body: { user_id?: string, role_ids?: number[], invalidate_all?: boolean }
```

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

### Direct Usage (Manual Configuration)

If you prefer to configure the component directly without using the config file:

```typescript
"use client";

import { ProfilePicMenu } from "hazo_auth/components/layouts/shared/components/profile_pic_menu";

export function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4">
      <div>Logo</div>
      <ProfilePicMenu
        show_single_button={false}
        sign_up_label="Sign Up"
        sign_in_label="Sign In"
        register_path="/hazo_auth/register"
        login_path="/hazo_auth/login"
        settings_path="/hazo_auth/my_settings"
        logout_path="/api/hazo_auth/logout"
        avatar_size="default"
        className="ml-auto"
      />
    </nav>
  );
}
```

### Configuration

Configure the Profile Picture Menu in `hazo_auth_config.ini` under the `[hazo_auth__profile_pic_menu]` section:

```ini
[hazo_auth__profile_pic_menu]
# Button configuration for unauthenticated users
# Show only "Sign Up" button when true, show both "Sign Up" and "Sign In" buttons when false (default)
show_single_button = false

# Sign up button label
sign_up_label = Sign Up

# Sign in button label
sign_in_label = Sign In

# Register page path
register_path = /hazo_auth/register

# Login page path
login_path = /hazo_auth/login

# Settings page path (shown in dropdown menu when authenticated)
settings_path = /hazo_auth/my_settings

# Logout API endpoint path
logout_path = /api/hazo_auth/logout

# Custom menu items (optional)
# Format: "type:label:value_or_href:order" for info/link, or "separator:order" for separator
# Examples:
#   - Info item: "info:Phone:+1234567890:3"
#   - Link item: "link:My Account:/account:4"
#   - Separator: "separator:2"
# Custom items are added to the default menu items (name, email, separator, Settings, Logout)
# Items are sorted by type (info first, then separators, then links) and then by order within each type
custom_menu_items = 
```

### Component Props

#### `ProfilePicMenuWrapper` Props

- `className?: string` - Additional CSS classes
- `avatar_size?: "sm" | "default" | "lg"` - Size of the profile picture avatar (default: "default")

#### `ProfilePicMenu` Props

- `show_single_button?: boolean` - Show only "Sign Up" button when true (default: false)
- `sign_up_label?: string` - Label for sign up button (default: "Sign Up")
- `sign_in_label?: string` - Label for sign in button (default: "Sign In")
- `register_path?: string` - Path to registration page (default: "/hazo_auth/register")
- `login_path?: string` - Path to login page (default: "/hazo_auth/login")
- `settings_path?: string` - Path to settings page (default: "/hazo_auth/my_settings")
- `logout_path?: string` - Path to logout API endpoint (default: "/api/hazo_auth/logout")
- `custom_menu_items?: ProfilePicMenuMenuItem[]` - Array of custom menu items
- `className?: string` - Additional CSS classes
- `avatar_size?: "sm" | "default" | "lg"` - Size of the profile picture avatar (default: "default")

### Custom Menu Items

You can add custom menu items to the dropdown menu. Items are automatically sorted by type (info → separator → link) and then by order.

**Menu Item Types:**

1. **Info** - Display-only text (e.g., phone number, department)
   - Format: `"info:label:value:order"`
   - Example: `"info:Phone:+1234567890:3"`

2. **Link** - Clickable menu item that navigates to a URL
   - Format: `"link:label:href:order"`
   - Example: `"link:My Account:/account:4"`

3. **Separator** - Visual separator line
   - Format: `"separator:order"`
   - Example: `"separator:2"`

**Example Configuration:**

```ini
[hazo_auth__profile_pic_menu]
# Add custom menu items
custom_menu_items = info:Phone:+1234567890:3,separator:2,link:My Account:/account:4,link:Help:/help:5
```

This will create a menu with:
1. Default items (name, email, separator, Settings, Logout)
2. Custom info item: "Phone: +1234567890" (order 3)
3. Custom separator (order 2)
4. Custom link: "My Account" → `/account` (order 4)
5. Custom link: "Help" → `/help` (order 5)

Items are sorted by type priority (info < separator < link) and then by order within each type.

### Default Menu Items

When authenticated, the dropdown menu automatically includes:
- User's name (if available)
- User's email address
- Separator
- Settings link (with Settings icon)
- Logout link (with LogOut icon, triggers logout action)

### Examples

#### Example 1: Simple Navbar Integration

```typescript
// app/components/navbar.tsx
import { ProfilePicMenuWrapper } from "hazo_auth/components/layouts/shared/components/profile_pic_menu_wrapper";

export function Navbar() {
  return (
    <header className="border-b">
      <nav className="container mx-auto flex items-center justify-between p-4">
        <div className="text-xl font-bold">My App</div>
        <ProfilePicMenuWrapper />
      </nav>
    </header>
  );
}
```

#### Example 2: Custom Styling and Size

```typescript
// app/components/navbar.tsx
import { ProfilePicMenuWrapper } from "hazo_auth/components/layouts/shared/components/profile_pic_menu_wrapper";

export function Navbar() {
  return (
    <header className="bg-slate-900 text-white">
      <nav className="container mx-auto flex items-center justify-between p-4">
        <div className="text-xl font-bold">My App</div>
        <ProfilePicMenuWrapper 
          avatar_size="sm"
          className="bg-slate-800 rounded-lg p-2"
        />
      </nav>
    </header>
  );
}
```

#### Example 3: With Custom Menu Items (Programmatic)

```typescript
"use client";

import { ProfilePicMenu } from "hazo_auth/components/layouts/shared/components/profile_pic_menu";
import type { ProfilePicMenuMenuItem } from "hazo_auth/lib/profile_pic_menu_config.server";

export function Navbar() {
  const customItems: ProfilePicMenuMenuItem[] = [
    {
      type: "info",
      label: "Department",
      value: "Engineering",
      order: 3,
      id: "dept_info",
    },
    {
      type: "separator",
      order: 2,
      id: "custom_sep",
    },
    {
      type: "link",
      label: "Documentation",
      href: "/docs",
      order: 4,
      id: "docs_link",
    },
  ];

  return (
    <nav className="flex items-center justify-between p-4">
      <div>Logo</div>
      <ProfilePicMenu
        custom_menu_items={customItems}
        avatar_size="default"
      />
    </nav>
  );
}
```

#### Example 4: Single Button Mode

```typescript
// In hazo_auth_config.ini
[hazo_auth__profile_pic_menu]
show_single_button = true
sign_up_label = Get Started
```

When `show_single_button` is `true`, only the "Sign Up" button is shown for unauthenticated users (no "Sign In" button).

### Behavior

- **Loading State**: Shows a pulsing placeholder while checking authentication status
- **Unauthenticated**: Shows Sign Up/Sign In buttons (or single button if configured)
- **Authenticated**: Shows profile picture with dropdown menu
- **Profile Picture Fallback**: If no profile picture is set, shows user's initials
- **Logout**: Handles logout action, refreshes auth status, and redirects appropriately
- **Responsive**: Works well in both navbar and sidebar layouts

### Styling

The component uses TailwindCSS classes and can be customized with:
- `className` prop for additional styling
- `avatar_size` prop for different avatar sizes
- CSS class names prefixed with `cls_profile_pic_menu_*` for targeted styling

Example custom styling:

```css
/* Target specific elements */
.cls_profile_pic_menu_avatar {
  border: 2px solid #3b82f6;
}

.cls_profile_pic_menu_dropdown {
  min-width: 200px;
}
```

### Local Development (for package contributors)

- `npm install` to install dependencies.
- `npm run dev` launches the Next.js app at `http://localhost:3000`.
- `npm run storybook` launches Storybook at `http://localhost:6006`.

### Project Structure

- `src/app` contains the application shell and route composition.
- `src/lib` is the home for shared utilities and authentication functions.
- `src/components` contains React components and hooks.
- `src/stories` holds Storybook stories for documenting components.

### Next Steps

- Use `npx shadcn@latest add <component>` to scaffold new UI primitives.
- Centralize configurable values through `hazo_config`.
- Access backend resources exclusively via `hazo_connect`.

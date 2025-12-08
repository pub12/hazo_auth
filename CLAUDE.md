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
import { ProfilePicMenu, use_auth_status } from "hazo_auth/client";

// Page components (zero-config)
import { LoginPage } from "hazo_auth/pages/login";

// Server utilities
import { validate_session_cookie } from "hazo_auth/server/middleware";

// API route handlers
export { POST } from "hazo_auth/server/routes";
```

### Authentication Flow Architecture

1. **Login Flow:**
   - Client submits credentials → `/api/hazo_auth/login` (POST)
   - Server validates via Argon2, creates JWT session token
   - Sets cookies: `hazo_auth_user_id`, `hazo_auth_user_email`, `hazo_auth_session` (JWT)
   - Returns user data or redirects

2. **Authorization Check (Server-side):**
   - API route calls `hazo_get_auth(request, { required_permissions: ['admin'] })`
   - Function validates JWT session token OR queries database for user + permissions
   - Returns `HazoAuthResult` with user, permissions, and `permission_ok` flag
   - Uses LRU cache (15min TTL) to reduce database load

3. **Authorization Check (Client-side):**
   - Component uses `use_hazo_auth()` hook
   - Hook fetches from `/api/hazo_auth/me` (standardized endpoint)
   - Returns authentication status and permissions

4. **Edge Runtime (Middleware/Proxy):**
   - Use `validate_session_cookie(request)` - validates JWT without database
   - Fast signature verification for route protection
   - Falls back to simple cookie check if JWT unavailable

### Configuration System

All configuration comes from `hazo_auth_config.ini` in the project root (where `process.cwd()` points):

- **UI Customization:** `[hazo_auth__login_layout]`, `[hazo_auth__register_layout]`, etc.
- **Auth Behavior:** `[hazo_auth__tokens]`, `[hazo_auth__password_requirements]`
- **RBAC Setup:** `[hazo_auth__user_management]`, `[hazo_auth__initial_setup]`
- **Email Settings:** `[hazo_auth__email]` (templates, from_email, base_url)
- **Profile Pictures:** `[hazo_auth__profile_picture]` (upload path, priorities)

Configuration is loaded via `hazo_config` package and cached at runtime.

### Database Schema

Core tables:
- `hazo_users` - User accounts (id, email_address, password_hash, profile fields)
- `hazo_refresh_tokens` - Token storage (password reset, email verification)
- `hazo_roles` - Role definitions
- `hazo_permissions` - Permission definitions
- `hazo_user_roles` - User-role junction table
- `hazo_role_permissions` - Role-permission junction table

HRBAC tables (optional, for Hierarchical Role-Based Access Control):
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
- Scope tables use `parent_scope_id` to establish hierarchy (L2 references L1, L3 references L2, etc.)
- User scope assignments in `hazo_user_scopes` table
- Access checking uses ancestor traversal for inherited access
- LRU cache for scope lookups (configurable TTL and size)

**Configuration:**
```ini
[hazo_auth__scope_hierarchy]
enable_hrbac = true
default_org = my_org
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

**Services:**
- `src/lib/services/scope_service.ts` - CRUD operations for scopes
- `src/lib/services/scope_labels_service.ts` - Custom labels per organization
- `src/lib/services/user_scope_service.ts` - User scope assignments and access checking
- `src/lib/auth/scope_cache.ts` - LRU cache for scope lookups

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
   - Example: `ProfilePicMenu`, `FormActionButtons`, `PasswordField`
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
4. Test with Storybook: `npm run storybook`
5. Run unit tests: `npm test`

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

Optional:
- `POSTGREST_URL` - PostgREST API URL (if using PostgreSQL)
- `POSTGREST_API_KEY` - PostgREST API key
- `APP_DOMAIN_NAME` - Base URL for email links (fallback to NEXT_PUBLIC_APP_URL)

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

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Context

This is the `hazo_auth` package within the hazo ecosystem monorepo. For general monorepo conventions (naming, build patterns, dependencies), see the parent `CLAUDE.md` file.

## Build Commands

```bash
npm run dev              # Next.js dev server (http://localhost:3000)
npm run storybook        # Component development (http://localhost:6006)
npm run build:pkg        # Build package for distribution (dist/)
npm run build            # Next.js build (for testing demo app)
npm test                 # Run Jest tests
npm run test:watch       # Tests in watch mode
npm run init-users       # Initialize default permissions and super user
npm run migrate          # Apply migration (usage: npm run migrate [file.sql])
npm run validate         # Validate project setup
npm run generate-routes  # Generate API route files
```

## Architecture Overview

### Entry Points & Exports

```typescript
// Server-side (API routes, Server Components)
import { hazo_get_auth } from "hazo_auth";
import { LoginLayout } from "hazo_auth/components/layouts/login";

// Client-side (Client Components) - MUST use /client to avoid Node.js module errors
import { ProfilePicMenu, ProfileStamp, use_auth_status, use_hazo_auth } from "hazo_auth/client";

// Page components (zero-config)
import { LoginPage } from "hazo_auth/pages/login";

// Server utilities
import { validate_session_cookie } from "hazo_auth/server/middleware";

// API route handlers
export { POST } from "hazo_auth/server/routes";
```

Source entry points: `src/index.ts` (server), `src/client.ts` (client-safe), `src/server/index.ts` (Express), `src/cli/index.ts` (CLI).

### Authentication Flows

**Email/Password:** Client submits credentials to `/api/hazo_auth/login` (POST) -> Argon2 validation -> JWT session token -> Sets cookies (`hazo_auth_session`, `hazo_auth_user_id`, `hazo_auth_user_email`).

**Google OAuth:** NextAuth.js handles `/api/auth/signin/google` -> Google auth -> callback creates hazo_auth session -> same cookies as email/password. Auto-links to existing unverified accounts (configurable). Services: `oauth_config.server.ts`, `services/oauth_service.ts`, `auth/nextauth_config.ts`.

**Server-side auth check:** `hazo_get_auth(request, { required_permissions: ['admin'] })` -> validates JWT or queries DB -> returns `HazoAuthResult` with user, permissions, `permission_ok`. Uses LRU cache (15min TTL).

**Client-side auth check:** `use_hazo_auth()` hook -> fetches `/api/hazo_auth/me`.

**Edge Runtime:** `validate_session_cookie(request)` -> JWT validation without DB access, for middleware/proxy.

### Server Routes Architecture (CRITICAL for Package Distribution)

Route handler implementations MUST be in `src/server/routes/*.ts` with relative imports to `../../lib/*`. The `src/app/api/hazo_auth/*/route.ts` files are demo-only re-exports (excluded from npm).

```typescript
// src/server/routes/login.ts (SHIPPED in package)
import { login_user_service } from "../../lib/services/login_service";
export async function loginPOST(request: NextRequest) { /* ... */ }

// src/app/api/hazo_auth/login/route.ts (NOT shipped, demo only)
export { loginPOST as POST } from "hazo_auth/server/routes/login";
```

### Configuration System

All config from `config/hazo_auth_config.ini` (project root), loaded via `hazo_config` package.

Key sections: `[hazo_auth__login_layout]`, `[hazo_auth__register_layout]`, `[hazo_auth__ui_shell]`, `[hazo_auth__navbar]`, `[hazo_auth__tokens]`, `[hazo_auth__password_requirements]`, `[hazo_auth__oauth]`, `[hazo_auth__user_management]`, `[hazo_auth__email]`, `[hazo_auth__profile_picture]`, `[hazo_auth__cookies]`, `[hazo_auth__scope_hierarchy]`, `[hazo_auth__invitations]`, `[hazo_auth__create_firm]`, `[hazo_auth__user_types]`, `[hazo_auth__app_user_data]`, `[hazo_auth__dev_lock]`, `[hazo_auth__app_permissions]`.

Notable defaults:
- `[hazo_auth__ui_shell]` `vertical_center`: Boolean only (`true`/`false`), `standalone_content_class`: use `max-w-5xl` for two-column layouts
- `[hazo_auth__navbar]` `logo_path` and `company_name` default to empty (must be configured), height: 40px
- `[hazo_auth__cookies]` `cookie_prefix` and `cookie_domain`: prevents conflicts when running multiple apps on same domain. Edge Runtime requires env vars `HAZO_AUTH_COOKIE_PREFIX` and `HAZO_AUTH_COOKIE_DOMAIN` since middleware can't read config files.

### Database Schema

**Tables:** `hazo_users`, `hazo_refresh_tokens`, `hazo_roles`, `hazo_permissions`, `hazo_role_permissions` (composite PK, no id), `hazo_scopes`, `hazo_user_scopes` (composite PK, no id), `hazo_invitations`.

**Critical schema requirements:**
- All IDs are TEXT (UUIDs), not INTEGER
- `hazo_user_scopes` MUST have `root_scope_id` and `role_id` columns (scope-based role assignments)
- `hazo_role_permissions` uses composite PK `(role_id, permission_id)` with NO `id` column
- Super admin scope: `00000000-0000-0000-0000-000000000000`
- Default system scope: `00000000-0000-0000-0000-000000000001`

Full schema reference is in the migration SQL files under `migrations/`. Key migration: `009_scope_consolidation.sql`.

Migrations run via `scripts/apply_migration.ts` (supports SQLite and PostgREST).

### Scope-Based Multi-Tenancy

Unified `hazo_scopes` table with hierarchical parent-child structure. Users assigned via `hazo_user_scopes` (membership model with scope-specific roles). Role IDs are UUIDs (strings), not numeric.

**Services:** `scope_service.ts`, `user_scope_service.ts`, `invitation_service.ts`, `firm_service.ts`, `post_verification_service.ts` (all in `src/lib/services/`).

**Invitation flow:** Invite by email -> pending invitation -> user registers -> email verified -> auto-assigned to scope.
**Create Firm flow:** User with no scopes or invitations after verification -> prompted to create firm -> becomes owner/admin.

**API endpoints:** `/api/hazo_auth/invitations` (GET/POST/PATCH/DELETE), `/api/hazo_auth/create_firm` (POST).

### App User Data

Flexible JSON field `app_user_data` on `hazo_users` for custom per-user data. Returned in `hazo_get_auth` and `/api/hazo_auth/me`. Deep merge on PATCH, full replace on PUT.

**API:** GET/PATCH/PUT/DELETE at `/api/hazo_auth/app_user_data`. Schema editor via `[hazo_auth__app_user_data]` config.
**Service:** `src/lib/services/app_user_data_service.ts`
**Route exports:** `appUserDataGET`, `appUserDataPATCH`, `appUserDataPUT`, `appUserDataDELETE` from `hazo_auth/server/routes`.

### Component Architecture

1. **Layouts** (`src/components/layouts/*`) - Full page layouts with business logic (LoginLayout, RegisterLayout, MySettingsLayout, etc.)
2. **Page Components** (`src/page_components/*`) - Zero-config wrappers that load INI config (LoginPage, RegisterPage, etc.)
3. **Shared Components** (`src/components/layouts/shared/*`) - ProfilePicMenu, ProfileStamp, FormActionButtons, PasswordField, AuthNavbar
4. **UI Primitives** (`src/components/ui/*`) - shadcn/ui components (not exported in package)

### File Naming Patterns

- `*.server.ts` - Server-only (Node.js APIs, DB access)
- `*.edge.ts` - Edge Runtime compatible
- `*_config.ts` / `*_config.server.ts` - Configuration loaders
- `*_service.ts` - Business logic services
- `use_*.ts` - React hooks (client-side)
- `*_types.ts` - TypeScript types

## Critical Workflows

### Adding a New Authentication Feature

1. Create service in `src/lib/services/`
2. Create route handler in `src/server/routes/[feature].ts` (relative imports to `../../lib/*`)
3. Add demo route in `src/app/api/hazo_auth/[feature]/route.ts` (imports from `hazo_auth/server/routes`)
4. Create layout in `src/components/layouts/[feature]/`
5. Create page component in `src/page_components/[feature].tsx`
6. Add config section to `config/hazo_auth_config.ini`
7. Update `package.json` exports
8. Run `npm run build:pkg`

### Working with hazo_connect

```typescript
import { get_hazo_connect_instance } from "../hazo_connect_instance.server";
import { createCrudService } from "hazo_connect/server";

const hazoConnect = get_hazo_connect_instance();
const users_service = createCrudService(hazoConnect, "hazo_users");

const users = await users_service.read({
  filters: [{ field: "email_address", operator: "eq", value: email }],
  select: ["id", "email_address", "password_hash"],
});
```

Configured via `[hazo_connect]` in config INI (`type = sqlite` or `postgrest`).

### Testing

- Demo pages: `/hazo_auth/login`, `/hazo_auth/register`, `/hazo_auth/profile_stamp_test`, `/hazo_auth/org_management`, `/hazo_auth/app_user_data_test`
- SQLite admin: `/hazo_connect/sqlite_admin`
- Storybook: `npm run storybook`
- Unit tests: `npm test`

## Package Structure

```
src/
├── app/                      # Next.js demo app (NOT shipped in package)
│   ├── api/hazo_auth/        # Demo API routes (re-export from server/routes)
│   └── hazo_auth/            # Demo pages
├── cli/                      # CLI commands (npx hazo_auth)
├── components/
│   ├── layouts/              # Layout components (login, register, my_settings, user_management, rbac_test, shared)
│   └── ui/                   # shadcn/ui primitives
├── lib/
│   ├── auth/                 # hazo_get_auth.server.ts, session_token_validator.edge.ts, auth_cache.ts, auth_rate_limiter.ts
│   ├── services/             # Business logic services
│   └── *_config.server.ts    # Configuration loaders
├── server/
│   ├── routes/               # Route handler implementations (SHIPPED in package)
│   └── middleware.ts         # Middleware utilities
├── page_components/          # Zero-config page wrappers
├── index.ts                  # Main entry (server-side)
└── client.ts                 # Client-safe entry
```

## Environment Variables

**Required:** `JWT_SECRET` (min 32 chars), `ZEPTOMAIL_API_KEY` (for emails)

**OAuth:** `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `HAZO_AUTH_GOOGLE_CLIENT_ID`, `HAZO_AUTH_GOOGLE_CLIENT_SECRET`

**Edge Runtime:** `HAZO_AUTH_COOKIE_PREFIX`, `HAZO_AUTH_COOKIE_DOMAIN` (optional)

**Optional:** `POSTGREST_URL`, `POSTGREST_API_KEY`, `APP_DOMAIN_NAME`

**Dev Lock:** `HAZO_AUTH_DEV_LOCK_ENABLED`, `HAZO_AUTH_DEV_LOCK_PASSWORD`

## Permissions

Built-in: `admin_system`, `admin_scope_hierarchy_management`, `admin_user_scope_assignment`, `admin_test_access`, `admin_user_management`, `admin_role_management`, `admin_permission_management`.

App permissions declared in `[hazo_auth__app_permissions]` config (format: `app_permission_X = name:description`).

## Common Issues

- **"Can't resolve 'fs'"** - Client component importing from `hazo_auth` instead of `hazo_auth/client`
- **"Cannot read config file"** - Config must be in project root (`process.cwd()`), not in `node_modules/`
- **JWT validation fails** - Check `JWT_SECRET` env var is set and matches (min 32 chars)
- **Permission checks fail** - Run `npm run init-users`, verify `hazo_user_scopes` has entries with valid UUID role_ids
- **Radix Select empty "None" option** - Use `value="__none__"` not `value=""` (Radix doesn't support empty string values)
- **Auth pages squashed** - Check `vertical_center` in `[hazo_auth__ui_shell]` (boolean only), use `max-w-5xl` for two-column layouts
- **404 after Google OAuth** - Check if `hazo_invitations` table exists, or set `skip_invitation_check = true` in `[hazo_auth__oauth]`
- **Dialog fields cut off** - Dialog uses `max-h-[80vh] overflow-y-auto`, scroll to see content below fold

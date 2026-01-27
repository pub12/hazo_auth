# hazo_auth Setup Checklist

This checklist provides step-by-step instructions for setting up the `hazo_auth` package in your Next.js project. AI assistants can follow this guide to ensure complete and correct setup.

## Quick Start (Recommended)

The fastest way to set up hazo_auth:

```bash
# 1. Install the package and peer dependencies
npm install hazo_auth hazo_config hazo_connect hazo_logs

# 2. Initialize project (creates directories, copies config files)
npx hazo_auth init

# 3. Generate API routes and pages
npx hazo_auth generate-routes --pages

# 4. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local and add ZEPTOMAIL_API_KEY and JWT_SECRET

# 5. Configure navbar logo and company name (IMPORTANT)
# Edit hazo_auth_config.ini and set:
#   [hazo_auth__navbar]
#   logo_path = /logo.png
#   company_name = My Company
# Note: Copy your logo to public/logo.png

# 6. Start dev server and test
npm run dev
# Visit http://localhost:3000/hazo_auth/login
```

If this works, skip to [Phase 6: Verification Tests](#phase-6-verification-tests).

---

## Pre-flight Checks

Before starting, verify your project meets these requirements:

- [ ] Node.js 18+ installed
- [ ] Project uses Next.js 14+ with App Router
- [ ] npm or pnpm package manager
- [ ] Project has `app/` directory (Next.js App Router structure)

**Verify Node.js version:**
```bash
node --version
# Expected: v18.x.x or higher
```

---

## Phase 1: Installation & Config Files

### Step 1.1: Install the package and peer dependencies

```bash
npm install hazo_auth hazo_config hazo_connect hazo_logs
```

**Note (v5.2.0+):** `hazo_config`, `hazo_connect`, and `hazo_logs` are now peer dependencies. You must install them in your project.

**Verify installation:**
```bash
ls node_modules/hazo_auth/package.json
# Expected: file exists
```

### Step 1.2: Install Required shadcn/ui Components

hazo_auth uses shadcn/ui components. Install the required dependencies:

**For all auth pages (login, register, etc.):**
```bash
npx shadcn@latest add button input label
```

**For My Settings page:**
```bash
npx shadcn@latest add dialog tabs switch avatar dropdown-menu
```

**For toast notifications:**
```bash
npx shadcn@latest add sonner
```

**Add Toaster to your app layout:**

Edit `app/layout.tsx` and add the Toaster component:

```tsx
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

### Step 1.4: Configure Navbar (Logo and Company Name)

The navbar appears on all auth pages (login, register, etc.) when using standalone layout mode. **By default, the logo and company name are NOT displayed** - you must configure them.

**Edit `hazo_auth_config.ini`:**
```ini
[hazo_auth__navbar]
# Enable navbar (default: true)
enable_navbar = true

# Logo - place your logo in public folder and set the path
logo_path = /logo.png

# Logo size (default: 28x28 - fits slim 48px navbar)
logo_width = 28
logo_height = 28

# Company name displayed next to logo
company_name = My Company

# Home link (right side of navbar)
show_home_link = true
home_path = /
home_label = Home

# Navbar height (default: 48px for slim appearance)
height = 48
```

**Important:**
- If `logo_path` is empty, no logo will be displayed
- If `company_name` is empty, no company name will be displayed
- The default navbar height is 48px (slim design)

**Checklist:**
- [ ] Logo file exists in `public/` folder (e.g., `public/logo.png`)
- [ ] `logo_path` configured in `hazo_auth_config.ini`
- [ ] `company_name` configured in `hazo_auth_config.ini`

---

### Step 1.5: Enable Dark Mode Support (Optional)

hazo_auth components support dark mode via CSS custom properties. Add the CSS variables to your global styles:

**Copy the CSS variables file:**
```bash
cp node_modules/hazo_auth/src/styles/hazo-auth-variables.css ./app/hazo-auth-theme.css
```

**Import in your global styles (`app/globals.css`):**
```css
@import "./hazo-auth-theme.css";
```

Or add the variables directly to your CSS - see the file for all available variables.

### Step 1.5: Initialize project (Recommended)

Use the CLI to automatically set up directories and copy config files:

```bash
npx hazo_auth init
```

This command:
- Creates `public/profile_pictures/library/` directory
- Creates `public/profile_pictures/uploads/` directory
- Creates `data/` directory (for SQLite database)
- Copies `hazo_auth_config.ini` and `hazo_notify_config.ini`
- Copies profile picture library images
- Creates `.env.local.example` template

### Step 1.2b: Manual config setup (Alternative)

If you prefer manual setup:

```bash
cp node_modules/hazo_auth/hazo_auth_config.example.ini ./hazo_auth_config.ini
cp node_modules/hazo_auth/hazo_notify_config.example.ini ./hazo_notify_config.ini
```

**Verify config files exist:**
```bash
ls -la hazo_auth_config.ini hazo_notify_config.ini
# Expected: both files exist in project root
```

### Step 1.3: Configure database connection

Edit `hazo_auth_config.ini`:

**For SQLite (development):**
```ini
[hazo_connect]
type = sqlite
sqlite_path = ./data/hazo_auth.sqlite
```

**For PostgreSQL (production):**
```ini
[hazo_connect]
type = postgrest
postgrest_url = https://your-postgrest-url.com
```

### Step 1.4: Configure UI shell mode

Edit `hazo_auth_config.ini`:
```ini
[hazo_auth__ui_shell]
# Use 'standalone' for consuming projects (inherits your app's layout)
# Use 'test_sidebar' only for hazo_auth package development
layout_mode = standalone
```

**Checklist:**
- [ ] `hazo_auth_config.ini` exists in project root
- [ ] `hazo_notify_config.ini` exists in project root
- [ ] Database type configured (sqlite or postgrest)
- [ ] UI shell mode set to `standalone`

---

## Phase 2: Environment Variables

### Step 2.1: Create .env.local file

Create `.env.local` in your project root:

```env
# Required for email functionality (Zeptomail)
ZEPTOMAIL_API_KEY=your_zeptomail_api_key_here

# Required for PostgreSQL/PostgREST (if using)
HAZO_CONNECT_POSTGREST_API_KEY=your_postgrest_api_key_here

# Required for JWT authentication
JWT_SECRET=your_secure_random_string_at_least_32_characters
# Note: JWT_SECRET is required for JWT session token functionality (Edge-compatible proxy/middleware authentication)

# Optional: Cookie customization (prevents conflicts when running multiple apps)
HAZO_AUTH_COOKIE_PREFIX=myapp_
HAZO_AUTH_COOKIE_DOMAIN=
```

**Generate a secure JWT secret:**
```bash
openssl rand -base64 32
```

**Cookie Customization (Optional):**
If you're running multiple apps that use hazo_auth on localhost (different ports), set `HAZO_AUTH_COOKIE_PREFIX` to prevent cookie conflicts. For example:
- App 1 (port 3000): `HAZO_AUTH_COOKIE_PREFIX=app1_`
- App 2 (port 3001): `HAZO_AUTH_COOKIE_PREFIX=app2_`

Also configure in `hazo_auth_config.ini`:
```ini
[hazo_auth__cookies]
cookie_prefix = myapp_
cookie_domain =
```

### Step 2.2: Configure email settings

Edit `hazo_notify_config.ini`:
```ini
[emailer]
emailer_module = zeptoemail_api
from_email = noreply@yourdomain.com
from_name = Your App Name
```

**Checklist:**
- [ ] `.env.local` file created
- [ ] `ZEPTOMAIL_API_KEY` set (or email will not work)
- [ ] `JWT_SECRET` set (required for JWT session tokens - Edge-compatible proxy/middleware authentication)
- [ ] `from_email` configured in `hazo_notify_config.ini`

---

## Phase 3: Database Setup

### Option A: SQLite (Development)

Create the data directory:
```bash
mkdir -p data
```

The SQLite database will be created automatically on first use if using hazo_connect's SQLite adapter.

**Manual creation (if needed):**
```bash
# Create database with initial schema
cat << 'EOF' | sqlite3 data/hazo_auth.sqlite
CREATE TABLE IF NOT EXISTS hazo_users (
    id TEXT PRIMARY KEY,
    email_address TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    name TEXT,
    email_verified INTEGER NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'ACTIVE' CHECK(status IN ('PENDING', 'ACTIVE', 'BLOCKED')),
    login_attempts INTEGER NOT NULL DEFAULT 0,
    last_logon TEXT,
    profile_picture_url TEXT,
    profile_source TEXT CHECK(profile_source IN ('gravatar', 'custom', 'predefined')),
    mfa_secret TEXT,
    url_on_logon TEXT,
    google_id TEXT UNIQUE,
    auth_providers TEXT DEFAULT 'email',
    user_type TEXT,
    app_user_data TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    changed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS hazo_refresh_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES hazo_users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    token_type TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS hazo_permissions (
    id TEXT PRIMARY KEY,
    permission_name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    changed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS hazo_roles (
    id TEXT PRIMARY KEY,
    role_name TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    changed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS hazo_role_permissions (
    role_id TEXT NOT NULL REFERENCES hazo_roles(id) ON DELETE CASCADE,
    permission_id TEXT NOT NULL REFERENCES hazo_permissions(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    changed_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS hazo_user_roles (
    user_id TEXT NOT NULL REFERENCES hazo_users(id) ON DELETE CASCADE,
    role_id TEXT NOT NULL REFERENCES hazo_roles(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    changed_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, role_id)
);
EOF
```

**Verify SQLite database:**
```bash
sqlite3 data/hazo_auth.sqlite ".tables"
# Expected: hazo_users hazo_refresh_tokens hazo_permissions hazo_roles hazo_role_permissions hazo_user_roles
```

### Option B: PostgreSQL (Production)

Run this SQL script in your PostgreSQL database:

**Important:** Run the entire script in order. The enum type must be created before the table that uses it.

```sql
-- Ensure we're in the public schema (or your target schema)
SET search_path TO public;

-- Create enum types (drop first if they exist to avoid conflicts)
DROP TYPE IF EXISTS hazo_enum_profile_source_enum CASCADE;
CREATE TYPE hazo_enum_profile_source_enum AS ENUM ('gravatar', 'custom', 'predefined');

DROP TYPE IF EXISTS hazo_enum_scope_types CASCADE;
CREATE TYPE hazo_enum_scope_types AS ENUM (
    'hazo_scopes_l1', 'hazo_scopes_l2', 'hazo_scopes_l3',
    'hazo_scopes_l4', 'hazo_scopes_l5', 'hazo_scopes_l6', 'hazo_scopes_l7'
);

DROP TYPE IF EXISTS hazo_enum_notify_chain_status CASCADE;
CREATE TYPE hazo_enum_notify_chain_status AS ENUM ('draft', 'published', 'inactive');

DROP TYPE IF EXISTS hazo_enum_notify_email_type CASCADE;
CREATE TYPE hazo_enum_notify_email_type AS ENUM ('system', 'user');

DROP TYPE IF EXISTS hazo_enum_group_type CASCADE;
CREATE TYPE hazo_enum_group_type AS ENUM ('support', 'peer', 'group');

DROP TYPE IF EXISTS hazo_enum_group_role CASCADE;
CREATE TYPE hazo_enum_group_role AS ENUM ('client', 'staff', 'owner', 'admin', 'member');

DROP TYPE IF EXISTS hazo_enum_chat_type CASCADE;
CREATE TYPE hazo_enum_chat_type AS ENUM ('chat', 'field', 'project', 'support', 'general');

-- Create organization table (multi-tenancy) - MUST be created before hazo_users
CREATE TABLE hazo_org (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    parent_org_id UUID REFERENCES hazo_org(id) ON DELETE SET NULL,
    root_org_id UUID REFERENCES hazo_org(id) ON DELETE SET NULL,
    user_limit INTEGER NOT NULL DEFAULT 0,              -- 0 = unlimited
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID,                                    -- FK added after hazo_users exists
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    changed_by UUID                                     -- FK added after hazo_users exists
);
CREATE INDEX idx_hazo_org_parent_org_id ON hazo_org(parent_org_id);
CREATE INDEX idx_hazo_org_root_org_id ON hazo_org(root_org_id);
CREATE INDEX idx_hazo_org_active ON hazo_org(active);
CREATE INDEX idx_hazo_org_name ON hazo_org(name);

-- Create users table
CREATE TABLE hazo_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_address TEXT NOT NULL UNIQUE,
    password_hash TEXT,                                 -- NULL for OAuth-only users
    name TEXT,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'ACTIVE',              -- 'PENDING', 'ACTIVE', or 'BLOCKED'
    login_attempts INTEGER NOT NULL DEFAULT 0,
    last_logon TIMESTAMP WITH TIME ZONE,
    profile_picture_url TEXT,
    profile_source hazo_enum_profile_source_enum,
    mfa_secret TEXT,
    url_on_logon TEXT,
    user_type TEXT,                                     -- Optional user categorization
    app_user_data TEXT,                                 -- Custom JSON data for consuming apps
    google_id TEXT UNIQUE,                              -- Google OAuth ID
    auth_providers TEXT DEFAULT 'email',                -- 'email', 'google', or 'email,google'
    org_id UUID REFERENCES hazo_org(id) ON DELETE SET NULL,
    root_org_id UUID REFERENCES hazo_org(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_hazo_users_email ON hazo_users(email_address);
CREATE INDEX idx_hazo_users_status ON hazo_users(status);
CREATE INDEX idx_hazo_users_user_type ON hazo_users(user_type);
CREATE UNIQUE INDEX idx_hazo_users_google_id ON hazo_users(google_id);
CREATE INDEX idx_hazo_users_org_id ON hazo_users(org_id);
CREATE INDEX idx_hazo_users_root_org_id ON hazo_users(root_org_id);

-- Add FK constraints to hazo_org now that hazo_users exists
ALTER TABLE hazo_org ADD CONSTRAINT fk_hazo_org_created_by
    FOREIGN KEY (created_by) REFERENCES hazo_users(id) ON DELETE SET NULL;
ALTER TABLE hazo_org ADD CONSTRAINT fk_hazo_org_changed_by
    FOREIGN KEY (changed_by) REFERENCES hazo_users(id) ON DELETE SET NULL;

-- Create refresh tokens table
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

-- Create permissions table
CREATE TABLE hazo_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    permission_name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create roles table
CREATE TABLE hazo_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create role-permissions junction table
CREATE TABLE hazo_role_permissions (
    role_id UUID NOT NULL REFERENCES hazo_roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES hazo_permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id)
);
CREATE INDEX idx_hazo_role_permissions_role_id ON hazo_role_permissions(role_id);
CREATE INDEX idx_hazo_role_permissions_permission_id ON hazo_role_permissions(permission_id);

-- Create user-roles junction table
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

**Verify PostgreSQL tables:**
```sql
SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'hazo_%';
-- Expected: 6 tables listed
```

**Grant access to admin user:**

After creating the tables, grant appropriate permissions to your admin database user. Replace `your_admin_user` with your actual PostgreSQL username:

```sql
-- Grant usage on schema (usually 'public')
GRANT USAGE ON SCHEMA public TO your_admin_user;

-- Grant all privileges on all hazo_* tables
GRANT ALL PRIVILEGES ON TABLE hazo_users TO your_admin_user;
GRANT ALL PRIVILEGES ON TABLE hazo_refresh_tokens TO your_admin_user;
GRANT ALL PRIVILEGES ON TABLE hazo_permissions TO your_admin_user;
GRANT ALL PRIVILEGES ON TABLE hazo_roles TO your_admin_user;
GRANT ALL PRIVILEGES ON TABLE hazo_role_permissions TO your_admin_user;
GRANT ALL PRIVILEGES ON TABLE hazo_user_roles TO your_admin_user;

-- Grant usage on the enum type
GRANT USAGE ON TYPE hazo_enum_profile_source_enum TO your_admin_user;

-- Grant privileges on sequences (if using SERIAL instead of UUID, though not needed for UUID)
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_admin_user;

-- Optional: Grant privileges on future tables (if you plan to add more hazo_* tables)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO your_admin_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO your_admin_user;
```

**For PostgREST/API access (if using PostgREST):**

If you're using PostgREST, you'll typically use an `anon` role for unauthenticated access and an `authenticated` role for authenticated users. Grant appropriate permissions:

```sql
-- Create roles if they don't exist
-- CREATE ROLE anon;
-- CREATE ROLE authenticated;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant select on tables for anon (public read access)
GRANT SELECT ON TABLE hazo_users TO anon;
GRANT SELECT ON TABLE hazo_permissions TO anon;
GRANT SELECT ON TABLE hazo_roles TO anon;
GRANT SELECT ON TABLE hazo_role_permissions TO anon;
GRANT SELECT ON TABLE hazo_user_roles TO anon;

-- Grant full access to authenticated users (adjust based on your RLS policies)
GRANT ALL PRIVILEGES ON TABLE hazo_users TO authenticated;
GRANT ALL PRIVILEGES ON TABLE hazo_refresh_tokens TO authenticated;
GRANT ALL PRIVILEGES ON TABLE hazo_permissions TO authenticated;
GRANT ALL PRIVILEGES ON TABLE hazo_roles TO authenticated;
GRANT ALL PRIVILEGES ON TABLE hazo_role_permissions TO authenticated;
GRANT ALL PRIVILEGES ON TABLE hazo_user_roles TO authenticated;

-- Grant usage on enum type
GRANT USAGE ON TYPE hazo_enum_profile_source_enum TO anon, authenticated;
```

**Checklist:**
- [ ] Database created (SQLite file or PostgreSQL)
- [ ] All enum types created (PostgreSQL only):
  - [ ] `hazo_enum_profile_source_enum`
  - [ ] `hazo_enum_scope_types`
  - [ ] `hazo_enum_notify_chain_status`
  - [ ] `hazo_enum_notify_email_type`
  - [ ] `hazo_enum_group_type`
  - [ ] `hazo_enum_group_role`
  - [ ] `hazo_enum_chat_type`
- [ ] All core tables exist:
  - [ ] `hazo_org` (multi-tenancy - must be created before hazo_users)
  - [ ] `hazo_users` (with status, google_id, auth_providers, app_user_data, org_id, root_org_id, user_type fields)
  - [ ] `hazo_refresh_tokens`
  - [ ] `hazo_permissions`
  - [ ] `hazo_roles`
  - [ ] `hazo_role_permissions`
  - [ ] `hazo_user_roles`

---

## Phase 3.1: Configure Default Permissions (Optional)

The `hazo_auth_config.ini` file includes default permissions that will be available in the Permissions tab. These defaults are already configured when you run `npx hazo_auth init`.

**Default permissions included:**
- `admin_user_management`
- `admin_role_management`
- `admin_permission_management`

**To customize permissions:**

Edit `hazo_auth_config.ini`:
```ini
[hazo_auth__user_management]
application_permission_list_defaults = admin_user_management,admin_role_management,admin_permission_management
```

**To initialize permissions and create a super user:**

After setting up your database and configuring permissions, you can run:
```bash
npm run init-users
```

This script will:
1. Create all permissions from `application_permission_list_defaults`
2. Create a `default_super_user_role` role with all permissions
3. Assign the role to the user specified in `default_super_user_email` (configure in `[hazo_auth__initial_setup]` section)

**Checklist:**
- [ ] Default permissions configured in `hazo_auth_config.ini` (already set by default)
- [ ] `default_super_user_email` configured if you want to use `init-users` script

---

## Phase 3.2: Google OAuth Setup (Optional)

Google OAuth Sign-In allows users to authenticate with their Google accounts. This section is optional - skip if you don't need OAuth.

### Step 3.2.1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project or select an existing project
3. Enable **Google+ API** (or Google Identity Services)
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

### Step 3.2.2: Add OAuth Environment Variables

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

### Step 3.2.3: Run OAuth Database Migration

Add OAuth fields to the `hazo_users` table:

```bash
npm run migrate migrations/005_add_oauth_fields_to_hazo_users.sql
```

**Verify migration applied:**

**PostgreSQL:**
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'hazo_users'
  AND column_name IN ('google_id', 'auth_providers');
-- Expected: 2 rows returned
```

**SQLite:**
```bash
sqlite3 data/hazo_auth.sqlite ".schema hazo_users" | grep -E "google_id|auth_providers"
# Expected: google_id TEXT UNIQUE, auth_providers TEXT DEFAULT 'email'
```

**Manual migration (if needed):**

**PostgreSQL:**
```sql
ALTER TABLE hazo_users ADD COLUMN google_id TEXT UNIQUE;
ALTER TABLE hazo_users ADD COLUMN auth_providers TEXT DEFAULT 'email';
CREATE INDEX IF NOT EXISTS idx_hazo_users_google_id ON hazo_users(google_id);
```

**SQLite:**
```sql
ALTER TABLE hazo_users ADD COLUMN google_id TEXT;
ALTER TABLE hazo_users ADD COLUMN auth_providers TEXT DEFAULT 'email';
CREATE UNIQUE INDEX IF NOT EXISTS idx_hazo_users_google_id_unique ON hazo_users(google_id);
CREATE INDEX IF NOT EXISTS idx_hazo_users_google_id ON hazo_users(google_id);
```

### Step 3.2.4: Configure OAuth in hazo_auth_config.ini

Add (or modify) the OAuth section:

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

**Configuration Options:**

- **Google-only authentication** (no email/password):
  ```ini
  enable_google = true
  enable_email_password = false
  ```

- **Email/password only** (no OAuth):
  ```ini
  enable_google = false
  enable_email_password = true
  ```

- **Both methods** (recommended):
  ```ini
  enable_google = true
  enable_email_password = true
  ```

### Step 3.2.5: Create OAuth API Routes

**Option A: Use CLI generator (Recommended):**
```bash
npx hazo_auth generate-routes --oauth
```

**Option B: Create manually:**

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

### Step 3.2.6: Verify OAuth API Routes

```bash
ls app/api/auth/\[...nextauth\]/route.ts
ls app/api/hazo_auth/oauth/google/callback/route.ts
ls app/api/hazo_auth/set_password/route.ts
# All files should exist
```

**OAuth Setup Checklist:**
- [ ] Google OAuth credentials obtained
- [ ] `NEXTAUTH_SECRET` and `NEXTAUTH_URL` set in `.env.local`
- [ ] `HAZO_AUTH_GOOGLE_CLIENT_ID` and `HAZO_AUTH_GOOGLE_CLIENT_SECRET` set
- [ ] OAuth migration applied (google_id and auth_providers columns added)
- [ ] `[hazo_auth__oauth]` section configured in `hazo_auth_config.ini`
- [ ] OAuth API routes created (`[...nextauth]`, `oauth/google/callback`, `set_password`)
- [ ] Post-login redirect configured (if not using invitations, set `skip_invitation_check = true`)

---

## Phase 4: API Routes

Create API route files in your project. Each file re-exports handlers from hazo_auth.

### Step 4.1: Generate routes automatically (Recommended)

```bash
npx hazo_auth generate-routes
```

This creates all required API routes automatically.

### Step 4.2: Manual route creation (Alternative)

If automatic generation doesn't work, create these files manually:

**Required routes (create all of these):**

```
app/api/hazo_auth/
├── login/route.ts
├── register/route.ts
├── logout/route.ts
├── me/route.ts
├── forgot_password/route.ts
├── reset_password/route.ts
├── verify_email/route.ts
├── resend_verification/route.ts
├── update_user/route.ts
├── change_password/route.ts
├── upload_profile_picture/route.ts
├── remove_profile_picture/route.ts
├── library_photos/route.ts
├── get_auth/route.ts
├── validate_reset_token/route.ts
├── profile_picture/
│   └── [filename]/route.ts
└── user_management/
    ├── users/route.ts
    ├── permissions/route.ts
    ├── roles/route.ts
    └── users/
        └── roles/route.ts
```

**Example route file content:**

`app/api/hazo_auth/login/route.ts`:
```typescript
export { POST } from "hazo_auth/server/routes/login";
```

`app/api/hazo_auth/register/route.ts`:
```typescript
export { POST } from "hazo_auth/server/routes/register";
```

`app/api/hazo_auth/logout/route.ts`:
```typescript
export { POST } from "hazo_auth/server/routes/logout";
```

`app/api/hazo_auth/me/route.ts`:
```typescript
export { GET } from "hazo_auth/server/routes/me";
```

`app/api/hazo_auth/forgot_password/route.ts`:
```typescript
export { POST } from "hazo_auth/server/routes/forgot_password";
```

`app/api/hazo_auth/reset_password/route.ts`:
```typescript
export { POST } from "hazo_auth/server/routes/reset_password";
```

`app/api/hazo_auth/verify_email/route.ts`:
```typescript
export { GET } from "hazo_auth/server/routes/verify_email";
```

`app/api/hazo_auth/resend_verification/route.ts`:
```typescript
export { POST } from "hazo_auth/server/routes/resend_verification";
```

`app/api/hazo_auth/update_user/route.ts`:
```typescript
export { PATCH } from "hazo_auth/server/routes/update_user";
```

`app/api/hazo_auth/change_password/route.ts`:
```typescript
export { POST } from "hazo_auth/server/routes/change_password";
```

`app/api/hazo_auth/upload_profile_picture/route.ts`:
```typescript
export { POST } from "hazo_auth/server/routes/upload_profile_picture";
```

`app/api/hazo_auth/remove_profile_picture/route.ts`:
```typescript
export { DELETE } from "hazo_auth/server/routes/remove_profile_picture";
```

`app/api/hazo_auth/library_photos/route.ts`:
```typescript
export { GET } from "hazo_auth/server/routes/library_photos";
```

`app/api/hazo_auth/get_auth/route.ts`:
```typescript
export { POST } from "hazo_auth/server/routes/get_auth";
```

`app/api/hazo_auth/validate_reset_token/route.ts`:
```typescript
export { POST } from "hazo_auth/server/routes/validate_reset_token";
```

`app/api/hazo_auth/profile_picture/[filename]/route.ts`:
```typescript
export { GET } from "hazo_auth/server/routes/profile_picture_filename";
```

**User Management routes (optional - required if using UserManagementLayout):**

`app/api/hazo_auth/user_management/users/route.ts`:
```typescript
export { GET, PATCH, POST } from "hazo_auth/server/routes";
```

`app/api/hazo_auth/user_management/permissions/route.ts`:
```typescript
export { GET, POST, PUT, DELETE } from "hazo_auth/server/routes";
```

`app/api/hazo_auth/user_management/roles/route.ts`:
```typescript
export { GET, POST, PUT } from "hazo_auth/server/routes";
```

`app/api/hazo_auth/user_management/users/roles/route.ts`:
```typescript
export { GET, POST, PUT } from "hazo_auth/server/routes";
```

**Note:** The `generate-routes` command automatically creates all user_management routes. These routes are required if you plan to use the `UserManagementLayout` component for managing users, roles, and permissions.

**Checklist:**
- [ ] All 16 core API route files created
- [ ] User management routes created (if using UserManagementLayout)
- [ ] Each file exports the correct HTTP method (POST, GET, PATCH, DELETE, PUT)

---

## Phase 5: Page Routes

Create page files for each auth flow.

### Step 5.1: Generate pages automatically (Recommended)

```bash
npx hazo_auth generate-routes --pages
```

This generates both API routes and page routes. The generated pages use zero-config components that work out of the box.

**Generated pages:**
```
app/hazo_auth/
├── login/page.tsx
├── register/page.tsx
├── forgot_password/page.tsx
├── reset_password/page.tsx
├── verify_email/page.tsx
└── my_settings/page.tsx
```

### Step 5.2: Manual page creation (Alternative)

If you prefer manual setup or need custom paths, create these files:

**Login page** - `app/hazo_auth/login/page.tsx`:
```typescript
import { LoginPage } from "hazo_auth/pages/login";
export default LoginPage;
```

**Register page** - `app/hazo_auth/register/page.tsx`:
```typescript
import { RegisterPage } from "hazo_auth/pages/register";
export default RegisterPage;
```

**Forgot password page** - `app/hazo_auth/forgot_password/page.tsx`:
```typescript
import { ForgotPasswordPage } from "hazo_auth/pages/forgot_password";
export default ForgotPasswordPage;
```

**Reset password page** - `app/hazo_auth/reset_password/page.tsx`:
```typescript
import { ResetPasswordPage } from "hazo_auth/pages/reset_password";
export default ResetPasswordPage;
```

**Email verification page** - `app/hazo_auth/verify_email/page.tsx`:
```typescript
import { VerifyEmailPage } from "hazo_auth/pages/verify_email";
export default VerifyEmailPage;
```

**My settings page** - `app/hazo_auth/my_settings/page.tsx`:
```typescript
import { MySettingsPage } from "hazo_auth/pages/my_settings";
export default MySettingsPage;
```

### Step 5.3: Custom page routes (Advanced)

If you need custom paths or want to wrap pages with your own layout:

```typescript
// app/(auth)/login/page.tsx
import { LoginPage } from "hazo_auth/pages/login";

export default function CustomLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoginPage 
        redirectRoute="/dashboard"
        successMessage="Welcome back!"
      />
    </div>
  );
}
```

**Checklist:**
- [ ] Login page created (`/hazo_auth/login`)
- [ ] Register page created (`/hazo_auth/register`)
- [ ] Forgot password page created (`/hazo_auth/forgot_password`)
- [ ] Reset password page created (`/hazo_auth/reset_password`)
- [ ] Email verification page created (`/hazo_auth/verify_email`)
- [ ] My settings page created (`/hazo_auth/my_settings`)

---

## Phase 5.1: Proxy/Middleware Setup (Optional)

**Note:** Next.js is migrating from `middleware.ts` to `proxy.ts` (see [Next.js documentation](https://nextjs.org/docs/messages/middleware-to-proxy)). The functionality remains the same - both work, but `proxy.ts` is the new convention.

If you want to protect routes at the Edge Runtime level (before pages load), create a proxy/middleware file:

### Step 5.1.1: Create Proxy File (Recommended)

Create `proxy.ts` in your project root (or `middleware.ts` - both work):

```typescript
// proxy.ts (or middleware.ts)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validate_session_cookie } from "hazo_auth/server/middleware";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protect your routes (e.g., /members, /dashboard, etc.)
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

### Step 5.1.2: Simple Cookie Check (Alternative)

If you prefer a simpler approach without JWT validation:

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
- Proxy/middleware runs in Edge Runtime (cannot use Node.js APIs like SQLite)
- JWT validation (`validate_session_cookie`) provides better security
- Simple cookie check is faster but doesn't validate token integrity
- Full user validation (e.g., deactivated accounts) happens in API routes/layouts
- Both `proxy.ts` and `middleware.ts` work - Next.js recommends `proxy.ts`

**Checklist:**
- [ ] Proxy/middleware file created (optional - only if you need route protection)
- [ ] Protected routes configured
- [ ] JWT validation used (recommended) or simple cookie check

---

## Phase 6: Verification Tests

Run these tests to verify your setup is working correctly.

### Test 1: API Health Check - Standardized `/api/hazo_auth/me` Endpoint

**⚠️ IMPORTANT: Use `/api/hazo_auth/me` for all client-side authentication checks. It always returns a standardized format with permissions.**

```bash
curl -s http://localhost:3000/api/hazo_auth/me | jq
```

**Expected response (not authenticated):**
```json
{
  "authenticated": false
}
```

**Expected response (authenticated - standardized format):**
```json
{
  "authenticated": true,
  "user_id": "28fe0aff-29c7-407e-b92e-bf11a6a3332f",
  "email": "test@example.com",
  "name": "Test User",
  "email_verified": false,
  "last_logon": "2025-01-27T16:18:00.054Z",
  "profile_picture_url": "https://gravatar.com/avatar/...",
  "profile_source": "gravatar",
  "user": {
    "id": "28fe0aff-29c7-407e-b92e-bf11a6a3332f",
    "email_address": "test@example.com",
    "name": "Test User",
    "is_active": true,
    "profile_picture_url": "https://gravatar.com/avatar/..."
  },
  "permissions": [],
  "permission_ok": true
}
```

**Key Points:**
- ✅ Always returns the same standardized format
- ✅ Always includes `permissions` and `permission_ok` fields
- ✅ Top-level fields (`user_id`, `email`, `name`) for backward compatibility
- ✅ `user` object contains full user details
- ✅ Use this endpoint instead of `/api/hazo_auth/get_auth` for client-side code

### Test 2: Registration API

```bash
curl -X POST http://localhost:3000/api/hazo_auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!","name":"Test User"}'
```

**Expected response:**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account."
}
```

### Test 3: Email Sending

After registration, check the inbox for `test@example.com` for a verification email.

**If email not received, check:**
- `ZEPTOMAIL_API_KEY` is set in `.env.local`
- `from_email` is configured and verified in Zeptomail
- Check server logs for email errors

### Test 4: Login API

```bash
curl -X POST http://localhost:3000/api/hazo_auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'
```

**Expected response (success):**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

### Test 5: Profile Picture Library

```bash
curl -s http://localhost:3000/api/hazo_auth/library_photos | jq
```

**Expected response:**
```json
{
  "success": true,
  "categories": ["Cars", "Young Cartoons"],
  "source": "project"
}
```

The `source` field indicates where photos are served from:
- `"project"` - Photos are in your project's `public/profile_pictures/library/`
- `"node_modules"` - Photos are served from `node_modules/hazo_auth/public/` via API route

**Test paginated photos:**
```bash
curl -s "http://localhost:3000/api/hazo_auth/library_photos?category=Cars&page=1&page_size=5" | jq
```

**Note:** Library photos work automatically whether they're copied to your project or still in node_modules. The API will serve them from node_modules as a fallback.

### Test 6: Visit Pages in Browser

Start your dev server:
```bash
npm run dev
```

Visit each page and verify it loads:
- [ ] `http://localhost:3000/hazo_auth/login` - Login form displays
- [ ] `http://localhost:3000/hazo_auth/register` - Registration form displays
- [ ] `http://localhost:3000/hazo_auth/forgot_password` - Forgot password form displays
- [ ] `http://localhost:3000/hazo_auth/my_settings` - Settings page displays (after login)
- [ ] `http://localhost:3000/hazo_auth/profile_stamp_test` - ProfileStamp component examples display

### Test 7: Google OAuth (if configured)

If you completed Phase 3.2 (Google OAuth Setup):

**Check login page:**
1. Visit `http://localhost:3000/hazo_auth/login`
2. Verify "Sign in with Google" button appears
3. Verify divider with "or" text (if email/password is also enabled)

**Test Google sign-in:**
1. Click "Sign in with Google" button
2. You should be redirected to Google's login page
3. Sign in with your Google account
4. You should be redirected back to your app and logged in
5. Visit `/hazo_auth/my_settings`
6. Verify "Connected Accounts" section shows Google as connected

**Test Google-only user features:**
1. If you signed in with Google (and didn't have a password account first):
2. Visit `/hazo_auth/my_settings`
3. Verify "Set Password" section appears
4. Set a password
5. Log out and try logging in with email/password (should work)

**Test forgot password with Google-only user:**
1. Create a new user with Google OAuth only
2. Try visiting `/hazo_auth/forgot_password`
3. Enter the Google user's email
4. Should show message: "You registered with Google. Please sign in with Google instead."

**OAuth Test Checklist:**
- [ ] "Sign in with Google" button appears on login page
- [ ] OAuth divider appears (if both auth methods enabled)
- [ ] Google OAuth flow completes successfully
- [ ] User is logged in after OAuth callback
- [ ] Connected Accounts section shows Google in My Settings
- [ ] Set Password feature works for Google-only users
- [ ] Forgot password shows appropriate message for Google-only users

---

## Phase 7: HRBAC Setup (Optional)

Hierarchical Role-Based Access Control (HRBAC) extends the standard RBAC with 7 hierarchical scope levels. This phase is optional - only complete it if you need scope-based access control.

### Step 7.1: Enable HRBAC in Configuration

Add to your `hazo_auth_config.ini`:

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

### Step 7.2: Add HRBAC Permissions

Add the HRBAC management permissions to your `application_permission_list_defaults`:

```ini
[hazo_auth__user_management]
application_permission_list_defaults = admin_user_management,admin_role_management,admin_permission_management,admin_scope_hierarchy_management,admin_user_scope_assignment
```

### Step 7.3: Create HRBAC Database Tables

**Recommended:** Run the scope consolidation migration which creates all required tables:

```bash
npm run migrate migrations/009_scope_consolidation.sql
```

If you prefer manual setup, use the scripts below:

#### PostgreSQL

```sql
-- =============================================
-- HRBAC Database Setup Script (PostgreSQL)
-- v5.0+ Unified Scope Model
-- =============================================

-- 1. Create unified hazo_scopes table (with branding columns)
CREATE TABLE IF NOT EXISTS hazo_scopes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES hazo_scopes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    level TEXT NOT NULL,
    logo_url TEXT,
    primary_color TEXT,
    secondary_color TEXT,
    tagline TEXT,
    slug TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 2. Create indexes for hierarchy traversal
CREATE INDEX IF NOT EXISTS idx_hazo_scopes_parent ON hazo_scopes(parent_id);
CREATE INDEX IF NOT EXISTS idx_hazo_scopes_level ON hazo_scopes(level);
CREATE INDEX IF NOT EXISTS idx_hazo_scopes_slug ON hazo_scopes(slug);

-- 3. Create system scopes
INSERT INTO hazo_scopes (id, parent_id, name, level, created_at, changed_at)
VALUES ('00000000-0000-0000-0000-000000000000', NULL, 'Super Admin', 'system', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO hazo_scopes (id, parent_id, name, level, created_at, changed_at)
VALUES ('00000000-0000-0000-0000-000000000001', NULL, 'System', 'default', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 4. Create user scopes junction table (membership-based multi-tenancy)
CREATE TABLE IF NOT EXISTS hazo_user_scopes (
    user_id UUID NOT NULL REFERENCES hazo_users(id) ON DELETE CASCADE,
    scope_id UUID NOT NULL REFERENCES hazo_scopes(id) ON DELETE CASCADE,
    root_scope_id UUID NOT NULL REFERENCES hazo_scopes(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES hazo_roles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('INVITED', 'ACTIVE', 'SUSPENDED', 'DEPARTED')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, scope_id)
);

CREATE INDEX IF NOT EXISTS idx_hazo_user_scopes_scope ON hazo_user_scopes(scope_id);
CREATE INDEX IF NOT EXISTS idx_hazo_user_scopes_root ON hazo_user_scopes(root_scope_id);
CREATE INDEX IF NOT EXISTS idx_hazo_user_scopes_role ON hazo_user_scopes(role_id);

-- 5. Create invitations table (for onboarding new users)
CREATE TABLE IF NOT EXISTS hazo_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_address TEXT NOT NULL,
    scope_id UUID NOT NULL REFERENCES hazo_scopes(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES hazo_roles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED')),
    invited_by UUID REFERENCES hazo_users(id) ON DELETE SET NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hazo_invitations_email ON hazo_invitations(email_address);
CREATE INDEX IF NOT EXISTS idx_hazo_invitations_scope ON hazo_invitations(scope_id);
CREATE INDEX IF NOT EXISTS idx_hazo_invitations_status ON hazo_invitations(status);

-- 6. Create firm_admin role (for firm creators)
INSERT INTO hazo_roles (id, role_name, created_at, changed_at)
VALUES (gen_random_uuid(), 'firm_admin', NOW(), NOW())
ON CONFLICT DO NOTHING;
```

#### PostgreSQL Grant Scripts

After creating the tables, grant appropriate permissions:

```sql
-- Grant to your admin user (replace 'your_admin_user' with actual username)
GRANT ALL PRIVILEGES ON TABLE hazo_scopes TO your_admin_user;
GRANT ALL PRIVILEGES ON TABLE hazo_user_scopes TO your_admin_user;
GRANT ALL PRIVILEGES ON TABLE hazo_invitations TO your_admin_user;

-- For PostgREST authenticated role
GRANT ALL PRIVILEGES ON TABLE hazo_scopes TO authenticated;
GRANT ALL PRIVILEGES ON TABLE hazo_user_scopes TO authenticated;
GRANT ALL PRIVILEGES ON TABLE hazo_invitations TO authenticated;
```

#### SQLite

```sql
-- =============================================
-- HRBAC Database Setup Script (SQLite)
-- v5.0+ Unified Scope Model
-- =============================================

-- 1. Create unified hazo_scopes table (with branding columns)
CREATE TABLE IF NOT EXISTS hazo_scopes (
    id TEXT PRIMARY KEY,
    parent_id TEXT REFERENCES hazo_scopes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    level TEXT NOT NULL,
    logo_url TEXT,
    primary_color TEXT,
    secondary_color TEXT,
    tagline TEXT,
    slug TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    changed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. Create indexes for hierarchy traversal
CREATE INDEX IF NOT EXISTS idx_hazo_scopes_parent ON hazo_scopes(parent_id);
CREATE INDEX IF NOT EXISTS idx_hazo_scopes_level ON hazo_scopes(level);
CREATE INDEX IF NOT EXISTS idx_hazo_scopes_slug ON hazo_scopes(slug);

-- 3. Create system scopes
INSERT OR IGNORE INTO hazo_scopes (id, parent_id, name, level, created_at, changed_at)
VALUES ('00000000-0000-0000-0000-000000000000', NULL, 'Super Admin', 'system', datetime('now'), datetime('now'));

INSERT OR IGNORE INTO hazo_scopes (id, parent_id, name, level, created_at, changed_at)
VALUES ('00000000-0000-0000-0000-000000000001', NULL, 'System', 'default', datetime('now'), datetime('now'));

-- 4. Create user scopes junction table (membership-based multi-tenancy)
CREATE TABLE IF NOT EXISTS hazo_user_scopes (
    user_id TEXT NOT NULL REFERENCES hazo_users(id) ON DELETE CASCADE,
    scope_id TEXT NOT NULL REFERENCES hazo_scopes(id) ON DELETE CASCADE,
    root_scope_id TEXT NOT NULL REFERENCES hazo_scopes(id) ON DELETE CASCADE,
    role_id TEXT NOT NULL REFERENCES hazo_roles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('INVITED', 'ACTIVE', 'SUSPENDED', 'DEPARTED')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    changed_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, scope_id)
);

CREATE INDEX IF NOT EXISTS idx_hazo_user_scopes_scope ON hazo_user_scopes(scope_id);
CREATE INDEX IF NOT EXISTS idx_hazo_user_scopes_root ON hazo_user_scopes(root_scope_id);
CREATE INDEX IF NOT EXISTS idx_hazo_user_scopes_role ON hazo_user_scopes(role_id);

-- 5. Create invitations table (for onboarding new users)
CREATE TABLE IF NOT EXISTS hazo_invitations (
    id TEXT PRIMARY KEY,
    email_address TEXT NOT NULL,
    scope_id TEXT NOT NULL REFERENCES hazo_scopes(id) ON DELETE CASCADE,
    role_id TEXT NOT NULL REFERENCES hazo_roles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED')),
    invited_by TEXT REFERENCES hazo_users(id) ON DELETE SET NULL,
    expires_at TEXT NOT NULL,
    accepted_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    changed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_hazo_invitations_email ON hazo_invitations(email_address);
CREATE INDEX IF NOT EXISTS idx_hazo_invitations_scope ON hazo_invitations(scope_id);
CREATE INDEX IF NOT EXISTS idx_hazo_invitations_status ON hazo_invitations(status);
```

### Step 7.4: Verify HRBAC Tables

#### PostgreSQL
```sql
SELECT table_name FROM information_schema.tables
WHERE table_name IN ('hazo_scopes', 'hazo_user_scopes', 'hazo_invitations');
-- Expected: 3 tables (hazo_scopes, hazo_user_scopes, hazo_invitations)
```

#### SQLite
```bash
sqlite3 data/hazo_auth.sqlite ".tables" | grep -E "hazo_scopes|hazo_user_scopes|hazo_invitations"
```

### Step 7.5: Add Slug Column to hazo_scopes (Optional - for Tenant Auth)

If you plan to use tenant-aware authentication with URL-friendly identifiers, add the `slug` column to the `hazo_scopes` table:

```bash
npm run migrate migrations/012_add_slug_to_hazo_scopes.sql
```

**Manual Migration (if needed):**

**PostgreSQL:**
```sql
ALTER TABLE hazo_scopes ADD COLUMN slug TEXT;
CREATE INDEX IF NOT EXISTS idx_hazo_scopes_slug ON hazo_scopes(slug);
```

**SQLite:**
```sql
ALTER TABLE hazo_scopes ADD COLUMN slug TEXT;
CREATE INDEX IF NOT EXISTS idx_hazo_scopes_slug ON hazo_scopes(slug);
```

**What is slug?**
- URL-friendly identifier for scopes (e.g., "acme-corp", "sales-division")
- Enables tenant context via URL paths (e.g., `/org/:slug/dashboard`)
- Not enforced as unique to allow flexibility

### Step 7.6: Test HRBAC

1. Start your dev server: `npm run dev`
2. Log in with a user that has `admin_scope_hierarchy_management` permission
3. Visit `/hazo_auth/user_management`
4. Verify the "Scope Hierarchy", "Scope Labels", and "User Scopes" tabs appear
5. Visit `/hazo_auth/scope_test` to test scope access checking

**HRBAC Checklist:**
- [ ] `enable_hrbac = true` in config
- [ ] HRBAC permissions added to defaults
- [ ] All HRBAC tables created:
  - [ ] `hazo_scopes` (unified scope hierarchy with branding)
  - [ ] `hazo_user_scopes` (user-scope-role assignments)
  - [ ] `hazo_invitations` (user invitation flow)
- [ ] System scopes exist:
  - [ ] Super Admin scope (00000000-0000-0000-0000-000000000000)
  - [ ] Default System scope (00000000-0000-0000-0000-000000000001)
- [ ] Grants applied (PostgreSQL)
- [ ] HRBAC tabs visible in User Management
- [ ] Scope test page works

---

## Phase 8: Tenant-Aware Authentication Setup (Optional)

Tenant-aware authentication adds scope context to authentication results, enabling multi-tenant applications where users can access multiple organizations/scopes.

**Skip this phase if:**
- Your app doesn't need multi-tenancy
- Users don't switch between different scopes/organizations

### Step 8.1: Ensure Slug Column Exists

The tenant auth feature uses the `slug` column for URL-friendly scope identifiers. If you didn't complete Step 7.5, do so now:

```bash
npm run migrate migrations/012_add_slug_to_hazo_scopes.sql
```

### Step 8.2: Use Tenant Auth in API Routes

Replace `hazo_get_auth` with `hazo_get_tenant_auth` in your API routes:

**Before (standard auth):**
```typescript
import { hazo_get_auth } from "hazo_auth/server-lib";

export async function GET(request: NextRequest) {
  const auth = await hazo_get_auth(request);
  // No tenant context
}
```

**After (tenant auth):**
```typescript
import { hazo_get_tenant_auth } from "hazo_auth/server-lib";

export async function GET(request: NextRequest) {
  const auth = await hazo_get_tenant_auth(request);

  if (auth.authenticated && auth.organization) {
    // auth.organization contains tenant details
    // auth.user_scopes contains all scopes user can access (for UI switcher)
    const data = await getTenantData(auth.organization.id);
  }
}
```

**Or use strict mode with error handling:**
```typescript
import { require_tenant_auth, HazoAuthError } from "hazo_auth/server-lib";

export async function GET(request: NextRequest) {
  try {
    const auth = await require_tenant_auth(request);
    // auth.organization is guaranteed non-null
    return NextResponse.json(await getData(auth.organization.id));
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

### Step 8.3: Set Scope Context from Frontend

The frontend needs to send the current scope ID via header or cookie.

**Option A: Header (recommended - per-request):**
```typescript
const response = await fetch("/api/dashboard", {
  headers: {
    "X-Hazo-Scope-Id": selectedScopeId,
  },
});
```

**Option B: Cookie (persistent - set once):**
```typescript
// Set cookie when user selects a scope
document.cookie = `hazo_auth_scope_id=${selectedScopeId}; path=/`;

// Then all requests include the scope automatically
const response = await fetch("/api/dashboard");
```

**Custom Configuration (optional):**
```typescript
// Use custom header or cookie names
const auth = await hazo_get_tenant_auth(request, {
  scope_header_name: "X-Tenant-Id",         // Custom header
  scope_cookie_name: "my_app_tenant_id",    // Custom cookie
});
```

### Step 8.4: Build Scope Switcher UI (Optional)

Use the `user_scopes` array to build a scope switcher dropdown:

```typescript
const auth = await hazo_get_tenant_auth(request);

// Return available scopes to frontend
return NextResponse.json({
  current_scope: auth.organization,
  available_scopes: auth.user_scopes.map(s => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    level: s.level,
    branding: {
      logo_url: s.logo_url,
      primary_color: s.primary_color,
    },
  })),
});
```

**Frontend Scope Switcher:**
```tsx
function ScopeSwitcher({ scopes, currentScopeId }) {
  const handleScopeChange = (scopeId: string) => {
    // Option 1: Set cookie
    document.cookie = `hazo_auth_scope_id=${scopeId}; path=/`;
    window.location.reload();

    // Option 2: Update state and send header on all requests
    setCurrentScope(scopeId);
  };

  return (
    <select value={currentScopeId} onChange={e => handleScopeChange(e.target.value)}>
      {scopes.map(scope => (
        <option key={scope.id} value={scope.id}>
          {scope.name} ({scope.level})
        </option>
      ))}
    </select>
  );
}
```

### Step 8.5: Test Tenant Auth

**Test with cURL:**
```bash
# No scope context - should return error or empty organization
curl -H "Cookie: hazo_auth_session=YOUR_TOKEN" \
  http://localhost:3000/api/dashboard | jq

# With scope context via header
curl -H "Cookie: hazo_auth_session=YOUR_TOKEN" \
  -H "X-Hazo-Scope-Id: SCOPE_UUID" \
  http://localhost:3000/api/dashboard | jq

# With scope context via cookie
curl -H "Cookie: hazo_auth_session=YOUR_TOKEN; hazo_auth_scope_id=SCOPE_UUID" \
  http://localhost:3000/api/dashboard | jq
```

**Tenant Auth Checklist:**
- [ ] `slug` column added to `hazo_scopes`
- [ ] API routes updated to use `hazo_get_tenant_auth` or `require_tenant_auth`
- [ ] Frontend sends scope context via header or cookie
- [ ] Tenant auth returns organization details when scope is valid
- [ ] Tenant auth returns user_scopes for building scope switcher
- [ ] Error handling in place for missing/invalid scope context
- [ ] Scope switcher UI built (optional but recommended)

---

## Troubleshooting

### Issue: "User is inactive" or "auth_utility_fetch_user_failed" errors

**Symptoms:** Users can't log in, error logs show `auth_utility_fetch_user_failed` or "User is inactive" even for newly created users.

**Cause:** Your database has an `is_active` column instead of the required `status` column. The code expects `status TEXT` with value `'ACTIVE'`.

**Solutions:**

1. **Run the status migration** (recommended):
   ```bash
   npm run migrate migrations/011_fix_status_case_to_uppercase.sql
   ```

2. **Or manually add the status column:**

   **SQLite:**
   ```sql
   -- Add status column
   ALTER TABLE hazo_users ADD COLUMN status TEXT DEFAULT 'ACTIVE';

   -- Migrate is_active values to status
   UPDATE hazo_users SET status = CASE
     WHEN is_active = 1 OR is_active = TRUE THEN 'ACTIVE'
     ELSE 'BLOCKED'
   END WHERE status IS NULL;
   ```

   **PostgreSQL:**
   ```sql
   -- Add status column
   ALTER TABLE hazo_users ADD COLUMN status TEXT NOT NULL DEFAULT 'ACTIVE';

   -- Migrate is_active values to status
   UPDATE hazo_users SET status = CASE
     WHEN is_active = TRUE THEN 'ACTIVE'
     ELSE 'BLOCKED'
   END;

   -- Create index
   CREATE INDEX IF NOT EXISTS idx_hazo_users_status ON hazo_users(status);
   ```

**Note:** The `status` column uses text values: `'PENDING'`, `'ACTIVE'`, or `'BLOCKED'`.

### Issue: Email not sending

**Symptoms:** Registration succeeds but no email received.

**Solutions:**
1. Check `ZEPTOMAIL_API_KEY` is set in `.env.local`
2. Verify `from_email` in `hazo_notify_config.ini` is authorized in Zeptomail
3. Check server console for error messages
4. Verify `emailer_module` is set to `zeptoemail_api`

### Issue: Profile pictures not showing

**Symptoms:** Avatar shows fallback initials, library photos empty.

**Solutions:**
1. **Run init command** (copies library photos automatically):
   ```bash
   npx hazo_auth init
   ```

2. **Or manually copy library photos:**
   ```bash
   mkdir -p public/profile_pictures/library
   cp -r node_modules/hazo_auth/public/profile_pictures/library/* public/profile_pictures/library/
   ```

3. **Check API response source:**
   ```bash
   curl -s http://localhost:3000/api/hazo_auth/library_photos | jq '.source'
   ```
   - If `"node_modules"` - Photos are being served from the package (slower but works)
   - If `"project"` - Photos are in your public folder (optimal)

4. Verify `library_photos` and `library_photo` API routes exist
5. Check file permissions on `public/profile_pictures/`

### Issue: Database connection failed

**Symptoms:** API returns 500 errors, "database connection failed" in logs.

**Solutions:**
1. Verify `hazo_auth_config.ini` has correct database settings
2. For SQLite: ensure `data/` directory exists and is writable
3. For PostgreSQL: verify connection string and credentials
4. Check `HAZO_CONNECT_POSTGREST_API_KEY` is set

### Issue: "Module not found" errors

**Symptoms:** Import errors when running the app.

**Solutions:**
1. Ensure `hazo_auth` is installed: `npm install hazo_auth`
2. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
3. Verify you're importing from correct paths (see Phase 5)

### Issue: API routes return 404

**Symptoms:** Calls to `/api/hazo_auth/*` return 404.

**Solutions:**
1. Run `npx hazo_auth generate-routes` to create routes
2. Verify route files exist in `app/api/hazo_auth/`
3. Check Next.js is detecting routes: `npm run dev` and watch console
4. Ensure route files export correct HTTP methods

### Issue: Authentication not persisting

**Symptoms:** User logs in but immediately shows as logged out.

**Solutions:**
1. Verify `JWT_SECRET` is set in `.env.local`
2. Check cookies are being set (inspect browser devtools > Application > Cookies)
3. Ensure API routes are on same domain (no CORS issues)

### Issue: 404 after Google OAuth login

**Symptoms:** User completes Google sign-in but gets redirected to 404 page (typically `/hazo_auth/create_firm`).

**Solutions:**
1. **If not using invitations system:** Set `skip_invitation_check = true` in `[hazo_auth__oauth]`:
   ```ini
   [hazo_auth__oauth]
   skip_invitation_check = true
   no_scope_redirect = /
   ```

2. **If using invitations system:** Run the migration to create `hazo_invitations` table:
   ```bash
   npm run migrate migrations/009_scope_consolidation.sql
   ```

3. **If using custom paths:** Set `create_firm_url` to your app's create firm page:
   ```ini
   [hazo_auth__oauth]
   create_firm_url = /my-app/create-organization
   ```

4. **Check logs** for `invitation_table_missing` warnings - this indicates the table doesn't exist

### Issue: Navbar logo or company name not showing

**Symptoms:** Navbar appears but logo and/or company name are missing.

**Solutions:**
1. **Configure logo and company name in `hazo_auth_config.ini`:**
   ```ini
   [hazo_auth__navbar]
   logo_path = /logo.png
   company_name = My Company
   ```

2. **Ensure logo file exists:**
   - Place your logo in the `public/` folder
   - The path should be relative to public (e.g., `/logo.png` for `public/logo.png`)

3. **Verify config is being read:**
   - Config file must be in project root (where `process.cwd()` points)
   - Restart the dev server after changing config

4. **Check if navbar is enabled:**
   ```ini
   [hazo_auth__navbar]
   enable_navbar = true
   ```

**Note:** By default, `logo_path` and `company_name` are empty strings, so nothing displays until you configure them.

---

## Final Checklist

**Configuration:**
- [ ] `hazo_auth_config.ini` configured
- [ ] `hazo_notify_config.ini` configured
- [ ] `.env.local` with all required variables (ZEPTOMAIL_API_KEY, JWT_SECRET)
- [ ] Navbar configured with logo and company name (see Step 1.4)

**Database:**
- [ ] Database created and accessible
- [ ] All 6 tables exist

**API Routes:**
- [ ] All 16 API routes created
- [ ] `/api/hazo_auth/me` returns `{"authenticated": false}`

**Pages:**
- [ ] All 6 auth pages created
- [ ] Pages render without errors
- [ ] Navbar displays with logo and company name

**Features:**
- [ ] Registration works
- [ ] Email verification sends
- [ ] Login works
- [ ] Profile pictures display
- [ ] Settings page accessible

---

## Quick Setup Command

For AI assistants, here's a single command to verify setup status:

```bash
npx hazo_auth validate
```

This will check all configuration and report any issues.


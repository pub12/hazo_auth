# hazo_auth Setup Checklist

This checklist provides step-by-step instructions for setting up the `hazo_auth` package in your Next.js project. AI assistants can follow this guide to ensure complete and correct setup.

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

### Step 1.1: Install the package

```bash
npm install hazo_auth
```

**Verify installation:**
```bash
ls node_modules/hazo_auth/package.json
# Expected: file exists
```

### Step 1.2: Copy configuration files

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
```

**Generate a secure JWT secret:**
```bash
openssl rand -base64 32
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
- [ ] `JWT_SECRET` set
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

```sql
-- Create enum type
CREATE TYPE hazo_enum_profile_source_enum AS ENUM ('gravatar', 'custom', 'predefined');

-- Create users table
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

**Checklist:**
- [ ] Database created (SQLite file or PostgreSQL)
- [ ] All 6 tables exist: `hazo_users`, `hazo_refresh_tokens`, `hazo_permissions`, `hazo_roles`, `hazo_role_permissions`, `hazo_user_roles`

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
└── profile_picture/
    └── [filename]/route.ts
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

**Checklist:**
- [ ] All 16 API route files created
- [ ] Each file exports the correct HTTP method (POST, GET, PATCH, DELETE)

---

## Phase 5: Page Routes

Create page files for each auth flow.

### Step 5.1: Create auth pages

**Login page** - `app/(auth)/login/page.tsx`:
```typescript
import { LoginLayout } from "hazo_auth/components/layouts/login";

export default function LoginPage() {
  return <LoginLayout />;
}
```

**Register page** - `app/(auth)/register/page.tsx`:
```typescript
import { RegisterLayout } from "hazo_auth/components/layouts/register";

export default function RegisterPage() {
  return <RegisterLayout />;
}
```

**Forgot password page** - `app/(auth)/forgot-password/page.tsx`:
```typescript
import { ForgotPasswordLayout } from "hazo_auth/components/layouts/forgot_password";

export default function ForgotPasswordPage() {
  return <ForgotPasswordLayout />;
}
```

**Reset password page** - `app/(auth)/reset-password/page.tsx`:
```typescript
import { ResetPasswordLayout } from "hazo_auth/components/layouts/reset_password";

export default function ResetPasswordPage() {
  return <ResetPasswordLayout />;
}
```

**Email verification page** - `app/(auth)/verify-email/page.tsx`:
```typescript
import { EmailVerificationLayout } from "hazo_auth/components/layouts/email_verification";

export default function VerifyEmailPage() {
  return <EmailVerificationLayout />;
}
```

**My settings page** - `app/(auth)/my-settings/page.tsx`:
```typescript
import { MySettingsLayout } from "hazo_auth/components/layouts/my_settings";

export default function MySettingsPage() {
  return <MySettingsLayout />;
}
```

### Step 5.2: Create layout for auth pages (optional)

`app/(auth)/layout.tsx`:
```typescript
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      {children}
    </div>
  );
}
```

**Checklist:**
- [ ] Login page created (`/login`)
- [ ] Register page created (`/register`)
- [ ] Forgot password page created (`/forgot-password`)
- [ ] Reset password page created (`/reset-password`)
- [ ] Email verification page created (`/verify-email`)
- [ ] My settings page created (`/my-settings`)

---

## Phase 6: Verification Tests

Run these tests to verify your setup is working correctly.

### Test 1: API Health Check

```bash
curl -s http://localhost:3000/api/hazo_auth/me | jq
```

**Expected response:**
```json
{
  "authenticated": false
}
```

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
  "photos": [
    {"url": "/profile_pictures/library/...", "name": "..."},
    ...
  ]
}
```

**If library photos not showing:**
- Copy profile pictures from `node_modules/hazo_auth/public/profile_pictures/library/` to `public/profile_pictures/library/`

### Test 6: Visit Pages in Browser

Start your dev server:
```bash
npm run dev
```

Visit each page and verify it loads:
- [ ] `http://localhost:3000/login` - Login form displays
- [ ] `http://localhost:3000/register` - Registration form displays
- [ ] `http://localhost:3000/forgot-password` - Forgot password form displays
- [ ] `http://localhost:3000/my-settings` - Settings page displays (after login)

---

## Troubleshooting

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
1. Copy library photos:
   ```bash
   mkdir -p public/profile_pictures/library
   cp -r node_modules/hazo_auth/public/profile_pictures/library/* public/profile_pictures/library/
   ```
2. Verify `library_photos` API route exists
3. Check file permissions on `public/profile_pictures/`

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

---

## Final Checklist

**Configuration:**
- [ ] `hazo_auth_config.ini` configured
- [ ] `hazo_notify_config.ini` configured
- [ ] `.env.local` with all required variables

**Database:**
- [ ] Database created and accessible
- [ ] All 6 tables exist

**API Routes:**
- [ ] All 16 API routes created
- [ ] `/api/hazo_auth/me` returns `{"authenticated": false}`

**Pages:**
- [ ] All 6 auth pages created
- [ ] Pages render without errors

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


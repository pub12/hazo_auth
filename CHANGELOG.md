# Changelog

All notable changes to hazo_auth will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2024-12-05

### Added

#### Zero-Config Server Components
- **NEW: Server Component Pages** - All auth pages are now React Server Components that initialize everything server-side
  - `LoginPage` - Zero-config login page (`hazo_auth/pages/login`)
  - `RegisterPage` - Zero-config registration page (`hazo_auth/pages/register`)
  - `VerifyEmailPage` - Zero-config email verification page (`hazo_auth/pages/verify_email`)
  - `ForgotPasswordPage` - Zero-config password reset request page (`hazo_auth/pages/forgot_password`)
  - `ResetPasswordPage` - Zero-config password reset page (`hazo_auth/pages/reset_password`)
  - `MySettingsPage` - Zero-config user settings page (`hazo_auth/pages/my_settings`)

#### Context Provider for API Configuration
- **NEW: `HazoAuthProvider`** - React Context provider for global API path configuration
  - Allows customizing API base path (e.g., `/api/v1/auth` instead of `/api/hazo_auth/`)
  - All 40+ API calls now use configurable paths from context
  - Backward compatible - defaults to `/api/hazo_auth/` if provider not used

#### Centralized Configuration System
- **NEW: `default_config.ts`** - Single source of truth for all default values
  - 17 configuration sections with sensible defaults
  - INI files are now **optional** - package works out-of-the-box
  - Configuration precedence: defaults < INI file < component props

#### Package Exports
- Added `hazo_auth/pages` - Barrel export for all zero-config page components
- Added `hazo_auth/pages/login` - Direct import for LoginPage
- Added `hazo_auth/pages/register` - Direct import for RegisterPage
- Added `hazo_auth/pages/verify_email` - Direct import for VerifyEmailPage
- Added `hazo_auth/pages/forgot_password` - Direct import for ForgotPasswordPage
- Added `hazo_auth/pages/reset_password` - Direct import for ResetPasswordPage
- Added `hazo_auth/pages/my_settings` - Direct import for MySettingsPage
- Added context exports in main package (`HazoAuthProvider`, `useHazoAuthConfig`)

### Changed

#### Component Improvements
- **MySettings is now embeddable** - Removed `min-h-screen` constraint, added `className` prop
  - Component adapts to any container size
  - Can be embedded in dashboards, tabs, or used standalone
  - Example: `<MySettingsPage className="max-w-4xl mx-auto" />`

#### Build Configuration
- Updated `tsconfig.build.json` to include new directories:
  - Added `src/contexts/**/*` for context provider
  - Added `src/pages/**/*` for server component pages
  - Excluded `src/app/**/*` (test app not bundled in package)
  - Excluded `src/stories/**/*` (Storybook files)

#### Performance Improvements
- **Eliminated client-side loading state** - Database connection happens server-side during SSR
- **Smaller JavaScript bundles** - Server initialization code not shipped to browser
- **Faster page loads** - No useEffect delays, immediate rendering

### Deprecated

- **`hazo_auth/page_components/*` imports** - Still functional but deprecated
  - Will be removed in v3.0.0
  - Use `hazo_auth/pages/*` instead
  - All old imports show deprecation warnings with migration instructions

### Breaking Changes

⚠️ **Version 2.0 requires Next.js 13+ with App Router**

If you're still using Next.js Pages Router, you must either:
1. Upgrade to App Router (recommended)
2. Stay on hazo_auth v1.x

See [MIGRATION.md](./MIGRATION.md) for detailed upgrade instructions.

#### Import Path Changes

**Before (v1.x):**
```tsx
import LoginPage from "hazo_auth/page_components/login";
```

**After (v2.0):**
```tsx
import { LoginPage } from "hazo_auth/pages/login";
```

**Backward Compatibility:** Old imports still work in v2.0 but will be removed in v3.0.

#### MySettings Layout Changes

- Removed `min-h-screen` from MySettings component
- If you relied on automatic full-screen height, wrap it yourself:
```tsx
<div className="min-h-screen">
  <MySettingsPage />
</div>
```

#### API Path Configuration

- All components now use `HazoAuthProvider` context for API paths
- If you use custom API paths, wrap your app:
```tsx
<HazoAuthProvider apiBasePath="/api/v1/auth">
  <App />
</HazoAuthProvider>
```

### Fixed

- Fixed prop drilling issue with API paths (now uses context)
- Fixed MySettings component not being embeddable
- Fixed missing default values when INI files are absent

### Documentation

- Added comprehensive [MIGRATION.md](./MIGRATION.md) with v1.x → v2.0 upgrade guide
- Updated [README.md](./README.md) with zero-config examples
- Added JSDoc deprecation warnings to old page_components
- Updated inline code comments with v2.0 patterns

---

## [1.6.7] - 2024-11-28

### Fixed
- Updated cookie handling in API routes
- Fixed user management layout issues

## [1.6.6] - 2024-11-27

### Added
- JWT session tokens for Edge-compatible authentication
- Session token validation for proxy/middleware use
- Edge Runtime support for authentication checks

### Changed
- Login now issues JWT session tokens in addition to simple cookies
- Enhanced security with token-based authentication

---

## Previous Versions

For changes in versions 1.6.5 and earlier, please refer to git commit history.

---

## Upgrade Guides

- **v1.x → v2.0:** See [MIGRATION.md](./MIGRATION.md)

## Support

- **Documentation:** [README.md](./README.md)
- **Issues:** Report bugs and request features on GitHub
- **Questions:** Check existing issues or create a new one

---

**Legend:**
- 🚀 **Added** - New features
- 🔧 **Changed** - Changes in existing functionality
- ⚠️ **Deprecated** - Soon-to-be removed features
- 🗑️ **Removed** - Removed features
- 🐛 **Fixed** - Bug fixes
- 🔒 **Security** - Security improvements

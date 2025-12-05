# Migration Guide: hazo_auth v1.x → v2.0

This guide will help you upgrade from hazo_auth v1.x to v2.0.

## Overview of Changes

hazo_auth v2.0 introduces **zero-config server components** that dramatically simplify authentication setup. The main goals of this release:

- ✅ **True "drop in and use"** - Pages work immediately with zero configuration
- ✅ **Server-side initialization** - No client loading state, better performance
- ✅ **Flexible API paths** - Customize API endpoints globally via context
- ✅ **Embeddable components** - MySettings and UserManagement fit any layout
- ✅ **Sensible defaults** - INI files are now optional

---

## Breaking Changes

### 1. Page Components Now Server Components

**What Changed:**
- All page components are now **React Server Components** (no "use client")
- Pages initialize database connections and config server-side
- No more client-side loading state

**Migration Required:**
You must be using **Next.js 13+ with App Router**. If you're still on Pages Router, you have two options:

**Option A: Upgrade to App Router (Recommended)**
```bash
# Update Next.js to 13+
npm install next@latest react@latest react-dom@latest
```

**Option B: Keep using v1.x**
If you cannot upgrade to App Router, stay on hazo_auth v1.x.

### 2. New Import Paths

**Old (v1.x):**
```tsx
import LoginPage from "hazo_auth/page_components/login";
import RegisterPage from "hazo_auth/page_components/register";
```

**New (v2.0):**
```tsx
import { LoginPage } from "hazo_auth/pages/login";
import { RegisterPage } from "hazo_auth/pages/register";

// Or barrel import
import { LoginPage, RegisterPage } from "hazo_auth/pages";
```

**Backward Compatibility:**
Old imports (`hazo_auth/page_components/*`) still work in v2.0 but are **deprecated** and will be removed in v3.0.

### 3. MySettings Component Changes

**What Changed:**
- Removed `min-h-screen` constraint
- Component is now truly embeddable in any layout
- Added `className` prop for custom styling

**Migration:**
If you were relying on MySettings taking full screen height, wrap it yourself:

```tsx
// Before (v1.x - automatic full screen)
<MySettingsLayout {...props} />

// After (v2.0 - explicit if needed)
<div className="min-h-screen">
  <MySettingsPage className="max-w-4xl mx-auto" />
</div>
```

### 4. Context Provider Required for Custom API Paths

**What Changed:**
All API calls now use a configurable context instead of hardcoded `/api/hazo_auth/`.

**Migration:**
If you use custom API paths, wrap your app with `HazoAuthProvider`:

```tsx
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

**Default:** If you use `/api/hazo_auth/`, no provider needed!

---

## Step-by-Step Migration

### Step 1: Update Package Version

```bash
npm install hazo_auth@^2.0.0
```

### Step 2: Update Page Imports

Replace old imports with new ones:

```diff
- import LoginPage from "hazo_auth/page_components/login";
- import RegisterPage from "hazo_auth/page_components/register";
+ import { LoginPage } from "hazo_auth/pages/login";
+ import { RegisterPage } from "hazo_auth/pages/register";
```

### Step 3: Simplify Your Pages

**Before (v1.x):**
```tsx
// app/login/page.tsx
"use client";
import { useState, useEffect } from "react";
import LoginPage from "hazo_auth/page_components/login";

export default function Page() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize something...
    setLoading(false);
  }, []);

  if (loading) return <div>Loading...</div>;

  return <LoginPage />;
}
```

**After (v2.0):**
```tsx
// app/login/page.tsx
import { LoginPage } from "hazo_auth/pages/login";

export default function Page() {
  return <LoginPage />;
}
```

That's it! Everything initializes server-side.

### Step 4: (Optional) Add Context Provider

Only needed if you use custom API paths:

```tsx
// app/layout.tsx
import { HazoAuthProvider } from "hazo_auth";

export default function RootLayout({ children }) {
  return (
    <HazoAuthProvider apiBasePath="/api/v1/auth">
      {children}
    </HazoAuthProvider>
  );
}
```

### Step 5: Update MySettings Usage (If Embedded)

If you embed MySettings in a dashboard:

```tsx
// Before (v1.x - fought with layout)
<div className="dashboard">
  <MySettingsLayout {...allTheProps} />
</div>

// After (v2.0 - adapts to container)
<div className="dashboard">
  <MySettingsPage className="max-w-4xl" />
</div>
```

---

## New Features in v2.0

### 1. Zero-Config Pages

All pages work out-of-the-box with **ZERO configuration**:

```tsx
// app/login/page.tsx
import { LoginPage } from "hazo_auth/pages/login";

export default function Page() {
  return <LoginPage />; // Works immediately!
}
```

Behind the scenes:
- ✅ Database connection initialized server-side
- ✅ Configuration loaded from INI file (with sensible defaults)
- ✅ No loading state
- ✅ Better performance

### 2. Configurable API Paths

Customize API endpoints globally:

```tsx
import { HazoAuthProvider } from "hazo_auth";

<HazoAuthProvider apiBasePath="/api/v1/auth">
  <App />
</HazoAuthProvider>
```

All auth components now use the configured path.

### 3. Sensible Defaults Everywhere

INI files are now **optional**. If missing, hazo_auth uses built-in defaults:

```typescript
// Default password requirements (if not in INI)
{
  minimum_length: 8,
  require_uppercase: false,
  require_lowercase: false,
  require_number: false,
  require_special: false,
}

// Default UI settings (if not in INI)
{
  image_src: "/globe.svg",
  layout_mode: "standalone",
  show_visual_panel: true,
}
```

You can still override via INI or props.

### 4. Truly Embeddable Components

MySettings and UserManagement adapt to their container:

```tsx
// Embed in dashboard
<DashboardLayout>
  <Sidebar />
  <main>
    <MySettingsPage className="max-w-4xl mx-auto" />
  </main>
</DashboardLayout>

// Or use standalone
<MySettingsPage />
```

---

## Deprecation Warnings

### Deprecated in v2.0 (Removed in v3.0)

1. **`hazo_auth/page_components/*` imports**
   - Still work in v2.0 but show deprecation warnings
   - Migrate to `hazo_auth/pages/*` before v3.0

2. **Client-side page initialization**
   - Old pattern still works but is inefficient
   - Migrate to server components for better performance

---

## Troubleshooting

### "Module not found" Errors

**Error:** `Cannot find module 'hazo_auth/pages/login'`

**Solution:** Make sure you're on v2.0.0:
```bash
npm list hazo_auth
# Should show hazo_auth@2.0.0
```

### Hydration Errors

**Error:** Hydration mismatch with auth state

**Solution:** Ensure you're using server components (no "use client" in page files):

```tsx
// ✅ Correct (server component)
import { LoginPage } from "hazo_auth/pages/login";

export default function Page() {
  return <LoginPage />;
}
```

```tsx
// ❌ Wrong (client component)
"use client";
import { LoginPage } from "hazo_auth/pages/login";
```

### Database Connection Issues

**Error:** "Cannot connect to database" in page

**Solution:** Ensure your hazo_connect setup is correct and the singleton is working:

```typescript
// lib/hazo_connect.ts
import { getHazoConnectSingleton } from "hazo_connect/nextjs/setup";

export function get_hazo_connect_instance() {
  return getHazoConnectSingleton({
    type: process.env.HAZO_CONNECT_TYPE || "sqlite",
    // ... your config
  });
}
```

### Custom API Paths Not Working

**Error:** API calls still go to `/api/hazo_auth/`

**Solution:** Wrap your app in `HazoAuthProvider`:

```tsx
// app/layout.tsx
import { HazoAuthProvider } from "hazo_auth";

export default function RootLayout({ children }) {
  return (
    <HazoAuthProvider apiBasePath="/your/custom/path">
      {children}
    </HazoAuthProvider>
  );
}
```

---

## Benefits of Upgrading

### Performance
- ⚡ **No client loading state** - Pages render immediately
- ⚡ **Smaller JS bundles** - Server initialization doesn't ship to browser
- ⚡ **Faster page loads** - Database queries happen server-side during SSR

### Developer Experience
- 🎯 **Zero configuration** - Drop in pages and they work
- 🎯 **Better TypeScript** - All types exported and documented
- 🎯 **Flexible layouts** - Components adapt to any container

### Maintainability
- 🔧 **Single source of truth** - Test app uses same code as you
- 🔧 **Consistent patterns** - All pages follow same architecture
- 🔧 **Clear deprecations** - Upgrade path is well-documented

---

## Timeline

- **v2.0.0** (Current): New server components available, old imports deprecated
- **v2.1.0** (Planned): Additional customization options
- **v3.0.0** (Future): Old `page_components` imports removed

We recommend migrating to new imports now to avoid breaking changes in v3.0.

---

## Need Help?

- **Documentation:** Check the updated [README.md](./README.md)
- **Examples:** See test app in `src/app/hazo_auth/`
- **Issues:** Report problems at [GitHub Issues](https://github.com/your-org/hazo_auth/issues)

Happy migrating! 🚀

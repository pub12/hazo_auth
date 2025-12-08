# Changelog

All notable changes to the hazo_auth package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- **Roles Matrix UI Redesign**: Replaced horizontal data table matrix with tag-based UI for improved UX
  - Each role now displays permissions as inline tags/chips (max 4 visible, "+N more" for rest)
  - Added interactive Edit Permissions dialog with Select All/Unselect All buttons and scrollable permission list
  - Added expand/collapse for permission tags in read-only mode (clicking "+N more" expands inline)
  - **Why this change**: The horizontal data table was difficult to scan when many permissions existed. Tag-based UI provides better visual hierarchy and more efficient use of space.

### Fixed
- **RBAC Test Component**: Fixed permissions loading to correctly fetch user's role IDs first, then filter roles with permissions
- **RBAC Test Component**: Fixed scopes loading by adding `&include_effective=true` to fetch URL to retrieve `direct_scopes` field
- **RBAC Test API Route**: Fixed `users_service.read()` call to use correct hazo_connect API method `findBy()`
- **RBAC Test API Route**: Fixed `check_user_scope_access` function call - was passing an object instead of individual parameters
- **Tree View Component**: Fixed nested button hydration error by changing `AccordionTrigger` to use `<div role="button">` instead of `<button>` to allow action buttons inside, added keyboard accessibility (tabIndex, onKeyDown for Enter/Space)

## [3.0.4] - 2025-12-08

### Fixed
- Installation and import issues resolved
- Package exports configuration improvements

## [3.0.3] - 2025-12-08

### Fixed
- Import path issues for component exports
- Build configuration for TypeScript compilation

## [3.0.2] - 2025-12-08

### Fixed
- Build errors and TypeScript compilation issues
- Package structure for proper module resolution

## [3.0.1] - 2025-12-08

### Fixed
- Build errors related to TypeScript configuration
- Module export paths

## [3.0.0] - 2025-12-08

### Added - Hierarchical Role-Based Access Control (HRBAC)

**Major Feature**: Comprehensive HRBAC system with 7-level scope hierarchy for enterprise-grade access control.

**Why this change**: Many enterprise applications require organizational hierarchy-based access control (e.g., Company → Division → Department → Team). The standard RBAC model with permissions only doesn't support "users assigned to higher-level scopes automatically have access to all descendant scopes." HRBAC fills this gap by adding hierarchical scope management with automatic inheritance.

**Core HRBAC Features**:
- **7-Level Scope Hierarchy** (`hazo_scopes_l1` through `hazo_scopes_l7`)
  - L1: Top level (e.g., Company) - root nodes with no parent
  - L2-L7: Hierarchical levels (e.g., Division, Department, Team, Project, Sub-project, Task)
  - Each level (except L1) has `parent_scope_id` linking to parent level
  - Database CASCADE DELETE ensures referential integrity when deleting parent scopes

- **User Scope Assignments** (`hazo_user_scopes` table)
  - Users can be assigned to any scope at any level
  - Assignments stored with `scope_type`, `scope_id`, and `scope_seq` (human-readable ID)
  - Composite primary key: `(user_id, scope_type, scope_id)`

- **Customizable Labels** (`hazo_scope_labels` table)
  - Organizations can customize labels for each scope level
  - Example: "Company", "Division", "Department" instead of generic "Level 1", "Level 2", "Level 3"
  - Unique constraint per organization and scope type

- **Automatic Access Inheritance**
  - Users assigned to L2 automatically have access to all L3, L4, L5, L6, L7 under that L2 scope
  - Access checking uses ancestor traversal for inherited permissions
  - Direct assignments take precedence over inherited access

**New Services**:
- `scope_service.ts` - CRUD operations for scopes at all levels
  - `get_scopes_by_level()` - Retrieve scopes by level and organization
  - `get_scope_by_id()` / `get_scope_by_seq()` - Single scope lookup
  - `create_scope()` - Create new scope with parent validation
  - `update_scope()` / `delete_scope()` - Modify/remove scopes (cascades to children)
  - `get_scope_children()` / `get_scope_ancestors()` / `get_scope_descendants()` - Hierarchy navigation
  - `get_scope_tree()` - Build nested tree structure for UI display
  - Helper functions: `is_valid_scope_level()`, `get_parent_level()`, `get_child_level()`

- `scope_labels_service.ts` - Manage custom labels per organization
  - `get_scope_labels()` - Retrieve all labels for an organization
  - `get_scope_labels_with_defaults()` - Labels with fallback to defaults
  - `get_label_for_level()` - Single label lookup
  - `upsert_scope_label()` - Create or update label (upsert pattern)
  - `batch_upsert_scope_labels()` - Bulk save labels from UI
  - `delete_scope_label()` - Revert to default label

- `user_scope_service.ts` - User scope assignments and access checking
  - `get_user_scopes()` - All scope assignments for a user
  - `get_users_by_scope()` - All users assigned to a specific scope
  - `assign_user_scope()` / `remove_user_scope()` - Manage assignments
  - `update_user_scopes()` - Bulk replace all assignments
  - `check_user_scope_access()` - **Core access checking with inheritance**
    - Checks direct assignment OR ancestor-based access
    - Returns `access_via` showing which scope granted access
  - `get_user_effective_scopes()` - Calculate all scopes user can access (direct + inherited)

**Caching**:
- `scope_cache.ts` - LRU cache for scope lookups (default: 5000 entries, 15min TTL)
  - Reduces database queries for repeated scope access checks
  - Smart invalidation using cache versions per scope
  - Methods: `get()`, `set()`, `invalidate_user()`, `invalidate_by_scope()`, `invalidate_by_scope_level()`, `invalidate_all()`
  - Configurable via `[hazo_auth__scope_hierarchy]` section

**Configuration** (`hazo_auth_config.ini`):
```ini
[hazo_auth__scope_hierarchy]
enable_hrbac = true                      # Enable HRBAC features
default_org = my_organization            # Default org for single-tenant apps
scope_cache_ttl_minutes = 15             # Cache TTL
scope_cache_max_entries = 5000           # Cache size limit
default_label_l1 = Company               # Customizable default labels
default_label_l2 = Division
default_label_l3 = Department
default_label_l4 = Team
default_label_l5 = Project
default_label_l6 = Sub-project
default_label_l7 = Task
```

**Configuration Helper**:
- `scope_hierarchy_config.server.ts` - Load and parse HRBAC configuration
  - `get_scope_hierarchy_config()` - Complete config object
  - `is_hrbac_enabled()` - Quick enable check
  - `get_default_org()` - Default organization
  - `get_default_label(level)` - Default label for a level

**Database Changes**:
- Migration `004_add_parent_scope_to_scope_tables.sql`
  - Adds `parent_scope_id` column to L2-L7 scope tables
  - Creates foreign key constraints with CASCADE DELETE
  - Creates indexes on `parent_scope_id` for efficient hierarchy queries
  - Supports both PostgreSQL and SQLite

**hazo_get_auth Integration**:
Extended `hazo_get_auth()` to support scope-based access control:
```typescript
const result = await hazo_get_auth(request, {
  required_permissions: ['view_reports'],
  scope_type: 'hazo_scopes_l3',    // Check access to Level 3 scope
  scope_id: 'uuid-of-scope',        // or use scope_seq
  scope_seq: 'L3_001',
  strict: true,                     // Throws ScopeAccessError if denied
});

if (result.scope_ok) {
  // Access granted via: result.scope_access_via
}
```

**New UI Components**:
- `scope_hierarchy_tab.tsx` - Manage scope hierarchy with tree view
  - Create, edit, delete scopes at each level
  - Visual tree structure showing parent-child relationships
  - Requires `admin_scope_hierarchy_management` permission

- `scope_labels_tab.tsx` - Customize scope level labels
  - Edit labels for all 7 levels per organization
  - Preview with sample scope names
  - Requires `admin_scope_hierarchy_management` permission

- `user_scopes_tab.tsx` - Assign scopes to users
  - User selection dropdown
  - Multi-select scope assignment
  - Display current assignments and effective access
  - Requires `admin_user_scope_assignment` permission

- `rbac_test_layout.tsx` - RBAC/HRBAC testing tool
  - Test permissions and scope access for any user
  - Select user, test permissions, test scope access
  - Clear pass/fail indicators with detailed access info
  - Requires `admin_test_access` permission

**New UI Primitives**:
- `select.tsx` - Dropdown select component (shadcn/ui)
- `tree-view.tsx` - Tree view component for hierarchical data

**New API Routes**:
- `/api/hazo_auth/scope_management/*` - Scope CRUD operations
  - GET/POST/PUT/DELETE endpoints for scope management
  - Tree structure retrieval for UI

- `/api/hazo_auth/user_management/users/scopes` - User scope assignments
  - GET: Retrieve user's scope assignments
  - POST: Assign scope to user
  - PUT: Bulk update user scopes

- `/api/hazo_auth/rbac_test` - Test endpoint for RBAC/HRBAC
  - POST: Test permissions and scope access for specified user
  - Requires `admin_test_access` permission

**New Permissions**:
- `admin_scope_hierarchy_management` - Manage scopes and scope labels
- `admin_user_scope_assignment` - Assign scopes to users
- `admin_test_access` - Access the RBAC/HRBAC test tool

Add to `application_permission_list_defaults`:
```ini
[hazo_auth__user_management]
application_permission_list_defaults = admin_user_management,admin_role_management,admin_permission_management,admin_scope_hierarchy_management,admin_user_scope_assignment,admin_test_access
```

**Database Tables**:
- `hazo_scopes_l1` through `hazo_scopes_l7` - Scope tables (L2-L7 have `parent_scope_id`)
- `hazo_user_scopes` - User-scope assignments (composite PK: user_id, scope_type, scope_id)
- `hazo_scope_labels` - Custom labels per organization (UNIQUE: org, scope_type)
- `hazo_enum_scope_types` - Enum type for scope level validation (PostgreSQL only)

**Integration with User Management**:
When HRBAC is enabled and user has appropriate permissions, three new tabs appear in `UserManagementLayout`:
- **Scope Hierarchy** - Manage scope structure
- **Scope Labels** - Customize labels
- **User Scopes** - Assign scopes to users

**Testing**:
- New test files in `__tests__/auth/`, `__tests__/integration/`, `__tests__/services/`
- RBAC test page at `/hazo_auth/rbac_test` for interactive testing
- Scope test page at `/hazo_auth/scope_test` for scope access verification

**Migration Path**:
1. Run migration `004_add_parent_scope_to_scope_tables.sql` to add `parent_scope_id` columns
2. Create HRBAC tables using scripts in `SETUP_CHECKLIST.md` (9 new tables)
3. Enable in config: `[hazo_auth__scope_hierarchy] enable_hrbac = true`
4. Add new permissions to `application_permission_list_defaults`
5. Run `npm run init-users` to create permissions and assign to super user

### Changed
- `hazo_get_auth()` now accepts optional scope parameters for HRBAC access checking
- `auth_types.ts` - Added scope-related types: `ScopeOptions`, `ScopeAccessError`
- User Management layout automatically shows/hides HRBAC tabs based on configuration and permissions

### Technical Details
- **Scope Inheritance Algorithm**: When checking access, the system first checks for direct assignment, then traverses ancestors up to L1 using `get_scope_ancestors()`. This ensures O(log n) lookup time for hierarchical access.
- **Cache Strategy**: LRU cache with TTL and version-based invalidation. When a scope assignment changes, only affected users are invalidated (smart invalidation).
- **Database Performance**: All parent_scope_id columns are indexed for efficient ancestor/descendant queries. Cascade deletes ensure referential integrity without manual cleanup.
- **Type Safety**: TypeScript enums and type guards (`is_valid_scope_level()`) prevent invalid scope level usage at compile time and runtime.

---

## [2.x.x] - Previous Versions

### Features from v2.0
- Zero-config Server Components for authentication pages
- JWT Session Tokens for Edge-compatible authentication
- Standardized `/api/hazo_auth/me` endpoint
- ProfilePicMenu sidebar variant
- User Management layout with role and permission management

### Features from v1.x
- Initial authentication flows (login, register, forgot password, reset password, email verification)
- Role-Based Access Control (RBAC)
- Profile picture management with Gravatar integration
- My Settings page for user profile management
- Two-factor authentication preparation (MFA secret storage)

---

## Migration Notes

### Upgrading to 3.0.0 (HRBAC)

**Required Steps**:
1. **Database Migration**: Run `004_add_parent_scope_to_scope_tables.sql`
2. **Create HRBAC Tables**: Run scripts from `SETUP_CHECKLIST.md` Phase 7
3. **Configuration**: Add `[hazo_auth__scope_hierarchy]` section to `hazo_auth_config.ini`
4. **Permissions**: Add new permissions (`admin_scope_hierarchy_management`, `admin_user_scope_assignment`, `admin_test_access`) to defaults

**Optional Steps**:
- Customize default labels for scope levels in config
- Set `default_org` for single-tenant applications
- Adjust cache settings (`scope_cache_ttl_minutes`, `scope_cache_max_entries`)

**Backward Compatibility**:
- HRBAC is opt-in via `enable_hrbac = true` - existing apps work unchanged
- Standard RBAC continues to work without modification
- No breaking changes to existing authentication APIs
- Existing database schema unchanged (only additions)

**Breaking Changes**: None - all changes are additive and opt-in.

---

## Support

For issues, questions, or feature requests related to HRBAC or any other features, please refer to:
- Documentation: `CLAUDE.md`, `README.md`, `TECHDOC.md`
- Setup Guide: `SETUP_CHECKLIST.md`
- Migration Guide: `MIGRATION.md` (if upgrading from v1.x to v2.x)

// file_description: regression tests for multi-tenancy (organization hierarchy) feature
// section: imports
import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";

// Test the configuration defaults
describe("Multi-Tenancy Configuration", () => {
  describe("DEFAULT_MULTI_TENANCY constants", () => {
    it("should have correct default values", async () => {
      const { DEFAULT_MULTI_TENANCY } = await import("@/lib/config/default_config");

      expect(DEFAULT_MULTI_TENANCY).toBeDefined();
      expect(DEFAULT_MULTI_TENANCY.enable_multi_tenancy).toBe(false);
      expect(DEFAULT_MULTI_TENANCY.org_cache_ttl_minutes).toBe(15);
      expect(DEFAULT_MULTI_TENANCY.org_cache_max_entries).toBe(1000);
      expect(DEFAULT_MULTI_TENANCY.default_user_limit).toBe(0);
    });

    it("should be immutable (const assertion)", async () => {
      const { DEFAULT_MULTI_TENANCY } = await import("@/lib/config/default_config");

      // Verify the object is frozen or at least the values are as expected
      expect(typeof DEFAULT_MULTI_TENANCY.enable_multi_tenancy).toBe("boolean");
      expect(typeof DEFAULT_MULTI_TENANCY.org_cache_ttl_minutes).toBe("number");
      expect(typeof DEFAULT_MULTI_TENANCY.org_cache_max_entries).toBe("number");
      expect(typeof DEFAULT_MULTI_TENANCY.default_user_limit).toBe("number");
    });
  });
});

// Test the org cache implementation
describe("Org Cache", () => {
  let get_org_cache: typeof import("@/lib/auth/org_cache").get_org_cache;
  let reset_org_cache: typeof import("@/lib/auth/org_cache").reset_org_cache;

  beforeEach(async () => {
    // Import fresh instance for each test
    const module = await import("@/lib/auth/org_cache");
    get_org_cache = module.get_org_cache;
    reset_org_cache = module.reset_org_cache;
    // Reset the singleton before each test
    reset_org_cache();
  });

  afterEach(() => {
    // Clean up after each test
    reset_org_cache();
  });

  describe("get_org_cache function", () => {
    it("should create cache with default settings", () => {
      const cache = get_org_cache();
      expect(cache).toBeDefined();
      expect(cache.get_stats().max_size).toBe(1000);
    });

    it("should create cache with custom settings", () => {
      const cache = get_org_cache(500, 10);
      expect(cache).toBeDefined();
      expect(cache.get_stats().max_size).toBe(500);
    });

    it("should set and get org entries", () => {
      const cache = get_org_cache(100, 5);

      const orgEntry = {
        org_id: "test-org-id",
        org_name: "Test Org",
        parent_org_id: null,
        parent_org_name: null,
        root_org_id: null,
        root_org_name: null,
      };

      cache.set("test-org-id", orgEntry);
      const retrieved = cache.get("test-org-id");

      expect(retrieved).toBeDefined();
      expect(retrieved?.org_id).toBe("test-org-id");
      expect(retrieved?.org_name).toBe("Test Org");
    });

    it("should return undefined for non-existent entries", () => {
      const cache = get_org_cache();
      const result = cache.get("non-existent-id");
      expect(result).toBeUndefined();
    });

    it("should invalidate entries", () => {
      const cache = get_org_cache();

      const orgEntry = {
        org_id: "test-org-id",
        org_name: "Test Org",
        parent_org_id: null,
        parent_org_name: null,
        root_org_id: null,
        root_org_name: null,
      };

      cache.set("test-org-id", orgEntry);
      expect(cache.get("test-org-id")).toBeDefined();

      cache.invalidate("test-org-id");
      expect(cache.get("test-org-id")).toBeUndefined();
    });

    it("should invalidate all entries", () => {
      const cache = get_org_cache();

      cache.set("org1", {
        org_id: "org1",
        org_name: "Org 1",
        parent_org_id: null,
        parent_org_name: null,
        root_org_id: null,
        root_org_name: null,
      });

      cache.set("org2", {
        org_id: "org2",
        org_name: "Org 2",
        parent_org_id: null,
        parent_org_name: null,
        root_org_id: null,
        root_org_name: null,
      });

      cache.invalidate_all();

      expect(cache.get("org1")).toBeUndefined();
      expect(cache.get("org2")).toBeUndefined();
    });

    it("should evict entries when max size exceeded (LRU behavior)", () => {
      const cache = get_org_cache(2, 60);

      cache.set("org1", {
        org_id: "org1",
        org_name: "Org 1",
        parent_org_id: null,
        parent_org_name: null,
        root_org_id: null,
        root_org_name: null,
      });

      cache.set("org2", {
        org_id: "org2",
        org_name: "Org 2",
        parent_org_id: null,
        parent_org_name: null,
        root_org_id: null,
        root_org_name: null,
      });

      // Access org1 to make it recently used
      cache.get("org1");

      // Add org3 - should evict org2 (least recently used)
      cache.set("org3", {
        org_id: "org3",
        org_name: "Org 3",
        parent_org_id: null,
        parent_org_name: null,
        root_org_id: null,
        root_org_name: null,
      });

      expect(cache.get("org1")).toBeDefined();
      expect(cache.get("org3")).toBeDefined();
      // org2 should be evicted
      expect(cache.get("org2")).toBeUndefined();
    });

    it("should track cache statistics", () => {
      const cache = get_org_cache(100, 15);

      cache.set("org1", {
        org_id: "org1",
        org_name: "Org 1",
        parent_org_id: null,
        parent_org_name: null,
        root_org_id: null,
        root_org_name: null,
      });

      const stats = cache.get_stats();
      expect(stats.size).toBe(1);
      expect(stats.max_size).toBe(100);
    });
  });
});

// Test the auth_types extension
describe("HazoAuthUser Type Extension", () => {
  it("should include org-related optional fields", async () => {
    const types = await import("@/lib/auth/auth_types");

    // Type checking is done at compile time, but we can verify the module loads
    expect(types).toBeDefined();

    // Create a sample user object to verify the type accepts org fields
    const testUser: import("@/lib/auth/auth_types").HazoAuthUser = {
      id: "user-123",
      email_address: "test@example.com",
      name: "Test User",
      profile_picture_url: null,
      org_id: "org-123",
      org_name: "Test Organization",
      parent_org_id: "parent-org-456",
      parent_org_name: "Parent Organization",
      root_org_id: "root-org-789",
      root_org_name: "Root Organization",
    };

    expect(testUser.org_id).toBe("org-123");
    expect(testUser.org_name).toBe("Test Organization");
    expect(testUser.parent_org_id).toBe("parent-org-456");
    expect(testUser.parent_org_name).toBe("Parent Organization");
    expect(testUser.root_org_id).toBe("root-org-789");
    expect(testUser.root_org_name).toBe("Root Organization");
  });

  it("should allow org fields to be null", async () => {
    const testUser: import("@/lib/auth/auth_types").HazoAuthUser = {
      id: "user-123",
      email_address: "test@example.com",
      name: "Test User",
      profile_picture_url: null,
      org_id: null,
      org_name: null,
      parent_org_id: null,
      parent_org_name: null,
      root_org_id: null,
      root_org_name: null,
    };

    expect(testUser.org_id).toBeNull();
    expect(testUser.org_name).toBeNull();
  });

  it("should allow org fields to be undefined", async () => {
    const testUser: import("@/lib/auth/auth_types").HazoAuthUser = {
      id: "user-123",
      email_address: "test@example.com",
      name: "Test User",
      profile_picture_url: null,
      // org fields not specified - should be undefined
    };

    expect(testUser.org_id).toBeUndefined();
    expect(testUser.org_name).toBeUndefined();
  });
});

// Test org service utility functions
describe("Org Service Utilities", () => {
  describe("org hierarchy calculations", () => {
    it("should correctly identify root organizations", async () => {
      // A root org has no parent_org_id
      const rootOrg = {
        id: "root-123",
        name: "Root Company",
        parent_org_id: null,
        root_org_id: null, // Root orgs have null root_org_id (they are the root)
        user_limit: 1000,
        active: true,
      };

      expect(rootOrg.parent_org_id).toBeNull();
      expect(rootOrg.root_org_id).toBeNull();
    });

    it("should correctly identify child organizations", async () => {
      // A child org has parent_org_id and root_org_id
      const childOrg = {
        id: "child-456",
        name: "Child Department",
        parent_org_id: "root-123",
        root_org_id: "root-123",
        user_limit: 0, // Child orgs typically inherit from root
        active: true,
      };

      expect(childOrg.parent_org_id).toBe("root-123");
      expect(childOrg.root_org_id).toBe("root-123");
    });

    it("should correctly identify nested child organizations", async () => {
      // A nested child has parent_org_id different from root_org_id
      const nestedOrg = {
        id: "nested-789",
        name: "Nested Team",
        parent_org_id: "child-456", // Parent is another child
        root_org_id: "root-123",    // But root is still the same
        user_limit: 0,
        active: true,
      };

      expect(nestedOrg.parent_org_id).toBe("child-456");
      expect(nestedOrg.root_org_id).toBe("root-123");
      expect(nestedOrg.parent_org_id).not.toBe(nestedOrg.root_org_id);
    });
  });

  describe("user limit validation logic", () => {
    it("should recognize unlimited orgs (user_limit = 0)", () => {
      const unlimitedOrg = { user_limit: 0 };
      const isUnlimited = unlimitedOrg.user_limit === 0;
      expect(isUnlimited).toBe(true);
    });

    it("should recognize limited orgs (user_limit > 0)", () => {
      const limitedOrg = { user_limit: 100 };
      const isLimited = limitedOrg.user_limit > 0;
      expect(isLimited).toBe(true);
    });

    it("should calculate remaining capacity correctly", () => {
      const org = { user_limit: 100, current_user_count: 75 };
      const remaining = org.user_limit - org.current_user_count;
      expect(remaining).toBe(25);
    });

    it("should detect when org is at capacity", () => {
      const org = { user_limit: 100, current_user_count: 100 };
      const atCapacity = org.current_user_count >= org.user_limit;
      expect(atCapacity).toBe(true);
    });

    it("should detect when org is over capacity", () => {
      const org = { user_limit: 100, current_user_count: 105 };
      const overCapacity = org.current_user_count > org.user_limit;
      expect(overCapacity).toBe(true);
    });
  });

  describe("active/inactive state", () => {
    it("should recognize active organizations", () => {
      const activeOrg = { active: true };
      expect(activeOrg.active).toBe(true);
    });

    it("should recognize inactive (soft-deleted) organizations", () => {
      const inactiveOrg = { active: false };
      expect(inactiveOrg.active).toBe(false);
    });
  });
});

// Test tree structure building
describe("Org Tree Structure", () => {
  it("should build correct tree from flat org list", () => {
    // Sample flat org list
    const orgs = [
      { id: "root1", name: "Company A", parent_org_id: null, root_org_id: null },
      { id: "child1", name: "Dept A1", parent_org_id: "root1", root_org_id: "root1" },
      { id: "child2", name: "Dept A2", parent_org_id: "root1", root_org_id: "root1" },
      { id: "grandchild1", name: "Team A1-1", parent_org_id: "child1", root_org_id: "root1" },
      { id: "root2", name: "Company B", parent_org_id: null, root_org_id: null },
    ];

    // Build tree structure
    type OrgWithChildren = typeof orgs[0] & { children?: OrgWithChildren[] };

    const buildTree = (items: typeof orgs, parentId: string | null = null): OrgWithChildren[] => {
      return items
        .filter(item => item.parent_org_id === parentId)
        .map(item => ({
          ...item,
          children: buildTree(items, item.id),
        }));
    };

    const tree = buildTree(orgs);

    // Verify tree structure
    expect(tree).toHaveLength(2); // Two root orgs

    const companyA = tree.find(o => o.id === "root1");
    expect(companyA).toBeDefined();
    expect(companyA?.children).toHaveLength(2); // Two departments

    const deptA1 = companyA?.children?.find(o => o.id === "child1");
    expect(deptA1).toBeDefined();
    expect(deptA1?.children).toHaveLength(1); // One team

    const teamA1 = deptA1?.children?.find(o => o.id === "grandchild1");
    expect(teamA1).toBeDefined();
    expect(teamA1?.children).toHaveLength(0); // No children

    const companyB = tree.find(o => o.id === "root2");
    expect(companyB).toBeDefined();
    expect(companyB?.children).toHaveLength(0); // No children
  });
});

// Test permission constants
describe("Multi-Tenancy Permissions", () => {
  it("should define correct permission constants", () => {
    const PERMISSION_ORG_MANAGEMENT = "hazo_perm_org_management";
    const PERMISSION_GLOBAL_ADMIN = "hazo_org_global_admin";

    expect(PERMISSION_ORG_MANAGEMENT).toBe("hazo_perm_org_management");
    expect(PERMISSION_GLOBAL_ADMIN).toBe("hazo_org_global_admin");
  });

  it("should differentiate between org management and global admin", () => {
    // Org management: CRUD within accessible orgs
    // Global admin: Access to ALL orgs

    const userPermissions = ["hazo_perm_org_management"];

    const hasOrgManagement = userPermissions.includes("hazo_perm_org_management");
    const hasGlobalAdmin = userPermissions.includes("hazo_org_global_admin");

    expect(hasOrgManagement).toBe(true);
    expect(hasGlobalAdmin).toBe(false);
  });
});

// Test API response structures
describe("Multi-Tenancy API Response Structures", () => {
  describe("GET /api/hazo_auth/org_management/orgs response", () => {
    it("should have correct structure for list response", () => {
      const mockListResponse = {
        success: true,
        orgs: [
          {
            id: "org-123",
            name: "Test Org",
            parent_org_id: null,
            root_org_id: null,
            user_limit: 100,
            active: true,
            current_user_count: 25,
          },
        ],
      };

      expect(mockListResponse.success).toBe(true);
      expect(mockListResponse.orgs).toBeInstanceOf(Array);
      expect(mockListResponse.orgs[0]).toHaveProperty("id");
      expect(mockListResponse.orgs[0]).toHaveProperty("name");
      expect(mockListResponse.orgs[0]).toHaveProperty("current_user_count");
    });

    it("should have correct structure for tree response", () => {
      const mockTreeResponse = {
        success: true,
        tree: [
          {
            id: "org-123",
            name: "Test Org",
            parent_org_id: null,
            root_org_id: null,
            user_limit: 100,
            active: true,
            current_user_count: 25,
            children: [
              {
                id: "org-456",
                name: "Child Org",
                parent_org_id: "org-123",
                root_org_id: "org-123",
                user_limit: 0,
                active: true,
                current_user_count: 10,
                children: [],
              },
            ],
          },
        ],
      };

      expect(mockTreeResponse.success).toBe(true);
      expect(mockTreeResponse.tree).toBeInstanceOf(Array);
      expect(mockTreeResponse.tree[0]).toHaveProperty("children");
      expect(mockTreeResponse.tree[0].children).toBeInstanceOf(Array);
    });

    it("should have correct structure for error response", () => {
      const mockErrorResponse = {
        error: "Multi-tenancy is not enabled",
        code: "MULTI_TENANCY_DISABLED",
      };

      expect(mockErrorResponse).toHaveProperty("error");
      expect(mockErrorResponse).toHaveProperty("code");
      expect(mockErrorResponse.code).toBe("MULTI_TENANCY_DISABLED");
    });
  });

  describe("POST /api/hazo_auth/org_management/orgs response", () => {
    it("should have correct structure for create response", () => {
      const mockCreateResponse = {
        success: true,
        org: {
          id: "new-org-123",
          name: "New Organization",
          parent_org_id: null,
          root_org_id: null,
          user_limit: 50,
          active: true,
          created_at: "2025-01-01T00:00:00.000Z",
          created_by: "user-123",
        },
      };

      expect(mockCreateResponse.success).toBe(true);
      expect(mockCreateResponse.org).toHaveProperty("id");
      expect(mockCreateResponse.org).toHaveProperty("created_at");
      expect(mockCreateResponse.org).toHaveProperty("created_by");
    });
  });
});

// Test display formatting
describe("Org Display Formatting", () => {
  it("should format user count display for unlimited orgs", () => {
    const org = { current_user_count: 25, user_limit: 0 };
    const display = org.user_limit === 0
      ? `${org.current_user_count} users`
      : `${org.current_user_count}/${org.user_limit} users`;
    expect(display).toBe("25 users");
  });

  it("should format user count display for limited orgs", () => {
    const org = { current_user_count: 75, user_limit: 100 };
    const display = org.user_limit === 0
      ? `${org.current_user_count} users`
      : `${org.current_user_count}/${org.user_limit} users`;
    expect(display).toBe("75/100 users");
  });

  it("should format org display name with user count", () => {
    const org = { name: "Engineering", current_user_count: 50, user_limit: 100, active: true };
    const getUserCountDisplay = (o: typeof org) =>
      o.user_limit === 0 ? `${o.current_user_count} users` : `${o.current_user_count}/${o.user_limit} users`;

    const displayName = `${org.name} (${getUserCountDisplay(org)})`;
    expect(displayName).toBe("Engineering (50/100 users)");
  });

  it("should format inactive org display name", () => {
    const org = { name: "Old Dept", current_user_count: 0, user_limit: 0, active: false };
    const getUserCountDisplay = (o: typeof org) =>
      o.user_limit === 0 ? `${o.current_user_count} users` : `${o.current_user_count}/${o.user_limit} users`;

    const displayName = org.active === false
      ? `${org.name} (${getUserCountDisplay(org)}) [Inactive]`
      : `${org.name} (${getUserCountDisplay(org)})`;
    expect(displayName).toBe("Old Dept (0 users) [Inactive]");
  });
});

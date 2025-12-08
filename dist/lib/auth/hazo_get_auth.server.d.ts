import { NextRequest } from "next/server";
import type { HazoAuthResult, HazoAuthOptions } from "./auth_types";
/**
 * Main hazo_get_auth function for server-side use in API routes
 * Returns user details, permissions, and checks required permissions
 * Optionally checks HRBAC scope access when scope options are provided
 * @param request - NextRequest object
 * @param options - Optional parameters for permission checking and HRBAC scope checking
 * @returns HazoAuthResult with user data, permissions, and optional scope access info
 * @throws PermissionError if strict mode and permissions are missing
 * @throws ScopeAccessError if strict mode and scope access is denied
 */
export declare function hazo_get_auth(request: NextRequest, options?: HazoAuthOptions): Promise<HazoAuthResult>;
//# sourceMappingURL=hazo_get_auth.server.d.ts.map
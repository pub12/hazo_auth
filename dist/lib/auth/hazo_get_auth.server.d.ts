import { NextRequest } from "next/server";
import type { HazoAuthResult, HazoAuthOptions } from "hazo_auth/lib/auth/auth_types";
/**
 * Main hazo_get_auth function for server-side use in API routes
 * Returns user details, permissions, and checks required permissions
 * @param request - NextRequest object
 * @param options - Optional parameters for permission checking
 * @returns HazoAuthResult with user data and permissions
 * @throws PermissionError if strict mode and permissions are missing
 */
export declare function hazo_get_auth(request: NextRequest, options?: HazoAuthOptions): Promise<HazoAuthResult>;
//# sourceMappingURL=hazo_get_auth.server.d.ts.map
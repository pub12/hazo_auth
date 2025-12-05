import type { NextRequest } from "next/server";
export type ValidateSessionCookieResult = {
    valid: boolean;
    user_id?: string;
    email?: string;
};
/**
 * Validates session cookie from NextRequest (Edge-compatible)
 * Extracts hazo_auth_session cookie and validates JWT signature and expiry
 * Works in Edge Runtime (Next.js proxy/middleware)
 * @param request - NextRequest object
 * @returns Validation result with user_id and email if valid
 */
export declare function validate_session_cookie(request: NextRequest): Promise<ValidateSessionCookieResult>;
//# sourceMappingURL=session_token_validator.edge.d.ts.map
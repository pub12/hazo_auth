import { NextRequest, NextResponse } from "next/server";
/**
 * Handles the OAuth callback after Google sign-in
 * The user creation/linking is done in NextAuth signIn callback
 * This route just sets the hazo_auth session cookies
 */
export declare function GET(request: NextRequest): Promise<NextResponse<unknown>>;
//# sourceMappingURL=oauth_google_callback.d.ts.map
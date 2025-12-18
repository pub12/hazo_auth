// file_description: Edge-compatible JWT session token validator for Next.js proxy/middleware
// Uses jose library which works in Edge Runtime
// section: imports
import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";

// section: types
export type ValidateSessionCookieResult = {
  valid: boolean;
  user_id?: string;
  email?: string;
};

// section: helpers
/**
 * Gets JWT secret from environment variables
 * Works in Edge Runtime (no Node.js APIs)
 * @returns JWT secret as Uint8Array for jose library
 */
function get_jwt_secret(): Uint8Array | null {
  const jwt_secret = process.env.JWT_SECRET;
  
  if (!jwt_secret) {
    // In Edge Runtime, we can't use logger, so we just return null
    // The validation will fail gracefully
    return null;
  }
  
  // Convert string secret to Uint8Array for jose
  return new TextEncoder().encode(jwt_secret);
}

// section: main_function
/**
 * Validates session cookie from NextRequest (Edge-compatible)
 * Extracts hazo_auth_session cookie and validates JWT signature and expiry
 * Works in Edge Runtime (Next.js proxy/middleware)
 * @param request - NextRequest object
 * @returns Validation result with user_id and email if valid
 */
export async function validate_session_cookie(
  request: NextRequest,
): Promise<ValidateSessionCookieResult> {
  try {
    // Extract session cookie
    const session_cookie = request.cookies.get("hazo_auth_session")?.value;
    
    if (!session_cookie) {
      return { valid: false };
    }
    
    // Get JWT secret
    const secret = get_jwt_secret();
    
    if (!secret) {
      // JWT_SECRET not set - cannot validate
      return { valid: false };
    }
    
    // Verify JWT signature and expiration
    const { payload } = await jwtVerify(session_cookie, secret, {
      algorithms: ["HS256"],
    });
    
    // Extract user_id and email from payload
    const user_id = payload.user_id as string;
    const email = payload.email as string;
    
    if (!user_id || !email) {
      return { valid: false };
    }
    
    return {
      valid: true,
      user_id,
      email,
    };
  } catch (error) {
    // jose throws JWTExpired, JWTInvalid, etc. - these are expected for invalid tokens
    // In Edge Runtime, we can't log, so we just return invalid
    return { valid: false };
  }
}













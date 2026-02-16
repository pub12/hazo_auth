// file_description: utility module for Edge-compatible proxy/middleware authentication
// This is a utility module, not a Next.js middleware/proxy file
// Exports functions for use in consuming apps' proxy.ts or middleware.ts files
// section: imports
export { validate_session_cookie } from "../lib/auth/session_token_validator.edge";
export type { ValidateSessionCookieResult } from "../lib/auth/session_token_validator.edge";


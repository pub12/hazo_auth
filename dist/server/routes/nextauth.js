// file_description: NextAuth.js route handler for OAuth authentication (for re-export by consuming apps)
// section: imports
// ESM/CJS interop: next-auth is CommonJS, handle both export scenarios
import NextAuthImport from "next-auth";
const NextAuth = NextAuthImport.default || NextAuthImport;
import { get_nextauth_config } from "../../lib/auth/nextauth_config.js";
// section: handler
// Get config lazily to ensure environment variables are available
function getHandler() {
    var _a;
    const config = get_nextauth_config();
    // Debug logging (remove in production)
    if (process.env.NODE_ENV === "development") {
        console.log("[NextAuth] Creating handler with providers:", ((_a = config.providers) === null || _a === void 0 ? void 0 : _a.length) || 0);
        console.log("[NextAuth] Google Client ID set:", !!process.env.HAZO_AUTH_GOOGLE_CLIENT_ID);
        console.log("[NextAuth] Google Client Secret set:", !!process.env.HAZO_AUTH_GOOGLE_CLIENT_SECRET);
        console.log("[NextAuth] NEXTAUTH_SECRET set:", !!process.env.NEXTAUTH_SECRET);
        console.log("[NextAuth] NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
    }
    return NextAuth(config);
}
// Create handler lazily
let cachedHandler = null;
function getOrCreateHandler() {
    if (!cachedHandler) {
        cachedHandler = getHandler();
    }
    return cachedHandler;
}
// section: exports
export async function GET(request, context) {
    const handler = getOrCreateHandler();
    return handler(request, context);
}
export async function POST(request, context) {
    const handler = getOrCreateHandler();
    return handler(request, context);
}

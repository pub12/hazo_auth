// file_description: NextAuth.js route handler for OAuth authentication (for re-export by consuming apps)
// section: imports
import NextAuth from "next-auth";
import { get_nextauth_config } from "../../lib/auth/nextauth_config.js";

// section: types
type NextAuthContext = {
  params: Promise<{ nextauth: string[] }>;
};

// section: handler
// Get config lazily to ensure environment variables are available
function getHandler() {
  const config = get_nextauth_config();

  // Debug logging (remove in production)
  if (process.env.NODE_ENV === "development") {
    console.log("[NextAuth] Creating handler with providers:", config.providers?.length || 0);
    console.log("[NextAuth] Google Client ID set:", !!process.env.HAZO_AUTH_GOOGLE_CLIENT_ID);
    console.log("[NextAuth] Google Client Secret set:", !!process.env.HAZO_AUTH_GOOGLE_CLIENT_SECRET);
    console.log("[NextAuth] NEXTAUTH_SECRET set:", !!process.env.NEXTAUTH_SECRET);
    console.log("[NextAuth] NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
  }

  return NextAuth(config);
}

// Create handler lazily
let cachedHandler: ReturnType<typeof NextAuth> | null = null;

function getOrCreateHandler() {
  if (!cachedHandler) {
    cachedHandler = getHandler();
  }
  return cachedHandler;
}

// section: exports
export async function GET(request: Request, context: NextAuthContext) {
  const handler = getOrCreateHandler();
  return handler(request, context);
}

export async function POST(request: Request, context: NextAuthContext) {
  const handler = getOrCreateHandler();
  return handler(request, context);
}

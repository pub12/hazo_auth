// file_description: helper function to create hazo_connect instance with configuration from environment variables
// This file provides a client-safe wrapper that returns a mock on client-side
// section: imports
// Note: We don't import server-side code here to avoid client-side bundling issues

// section: helpers
/**
 * Creates a hazo_connect instance configured from environment variables
 * 
 * Environment variables:
 * - HAZO_CONNECT_TYPE: Database type ("sqlite" | "postgrest") - defaults to "sqlite"
 * - HAZO_CONNECT_SQLITE_PATH: Path to SQLite database file (relative to process.cwd() or absolute)
 * - HAZO_CONNECT_POSTGREST_URL: PostgREST API URL (for postgrest type)
 * - HAZO_CONNECT_POSTGREST_API_KEY: PostgREST API key (for postgrest type)
 * 
 * Falls back to test fixture database if HAZO_CONNECT_SQLITE_PATH is not set
 * 
 * Note: For client-side usage (Next.js pages), this returns a mock adapter
 * since SQLite cannot run in browser environments. Use PostgREST for client-side database access.
 */
// Lazy loader for server module - prevents webpack from statically analyzing the require
function loadServerModule() {
  // Use Function constructor to create a dynamic require that webpack can't analyze
  // eslint-disable-next-line no-new-func
  const requireFunc = new Function('modulePath', 'return require(modulePath)');
  return requireFunc('./hazo_connect_setup.server');
}

export function create_sqlite_hazo_connect() {
  // Check if we're in a browser/client environment
  if (typeof window !== "undefined") {
    // Return a mock adapter for client-side usage
    return create_client_mock_hazo_connect();
  }

  // Server-side: dynamically load server module
  // Using Function constructor prevents webpack from statically analyzing the require
  const serverModule = loadServerModule();
  return serverModule.create_sqlite_hazo_connect_server();
}

/**
 * Creates a mock hazo_connect adapter for client-side usage
 * This satisfies the LayoutDataClient interface without requiring SQLite
 */
function create_client_mock_hazo_connect() {
  return {
    healthCheck: async () => {
      // Mock health check for client-side - no-op
      return Promise.resolve();
    },
  };
}


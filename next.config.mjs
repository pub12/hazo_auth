// file_description: configure next.js application settings for the ui_component project
// section: imports
import path from "path";
import { fileURLToPath } from "url";

// section: path_resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// section: base_configuration
const next_config = {
  /* config options here */
  // Note: hazo_connect configuration is now read from hazo_auth_config.ini using hazo_config
  // Environment variables are only used as fallback if hazo_auth_config.ini is not found
  // See hazo_auth_config.ini for hazo_connect configuration parameters
  env: {
    // Environment variables can be set here as fallback, but hazo_auth_config.ini is preferred
    // HAZO_CONNECT_ENABLE_ADMIN_UI: "true",
    // HAZO_CONNECT_SQLITE_PATH: path.resolve(__dirname, "__tests__", "fixtures", "hazo_auth.sqlite"),
  },
  // Note: serverComponentsExternalPackages is not available in Next.js 14.2
  // Using webpack externals configuration instead (see webpack section below)
  // section: webpack_configuration
  webpack: (config, { isServer }) => {
    // Exclude sql.js from webpack bundling for API routes
    // These packages use Node.js module.exports which doesn't work in webpack context
    if (isServer) {
      config.externals = config.externals || [];
      // Add sql.js as external to prevent webpack from bundling it
      if (Array.isArray(config.externals)) {
        config.externals.push("sql.js");
        // Exclude hazo_notify from Edge runtime bundles (middleware)
        // hazo_notify is only available in Node.js runtime (server bundles), not Edge runtime
        // This ensures hazo_notify is loaded at runtime for API routes using Node.js runtime
        config.externals.push("hazo_notify");
      } else {
        config.externals = [config.externals, "sql.js", "hazo_notify"];
      }
    } else {
      // Client-side: exclude server-only files from client bundles
      config.resolve.alias = {
        ...config.resolve.alias,
        "@/lib/hazo_connect_setup.server": false,
        "@/lib/hazo_connect_instance.server": false,
        "@/lib/login_config.server": false,
        // Exclude hazo_notify from client bundles
        "hazo_notify": false,
      };
    }
    return config;
  },
};

export default next_config;


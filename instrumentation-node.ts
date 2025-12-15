// file_description: Node.js-only instrumentation initialization
// This file is only imported when NEXT_RUNTIME === 'nodejs'
// Contains all Node.js-specific service initialization
// section: imports

import { set_hazo_notify_instance } from "./src/lib/services/email_service";

// section: dev_lock_validation

/**
 * Validates dev lock configuration at startup
 * Throws error if dev lock is enabled but password is not set
 */
function validate_dev_lock_config(): void {
  const dev_lock_enabled = process.env.HAZO_AUTH_DEV_LOCK_ENABLED === "true";

  if (dev_lock_enabled) {
    const password = process.env.HAZO_AUTH_DEV_LOCK_PASSWORD;

    if (!password) {
      console.error("=".repeat(60));
      console.error("FATAL ERROR: Dev Lock Configuration Invalid");
      console.error("=".repeat(60));
      console.error("HAZO_AUTH_DEV_LOCK_ENABLED is set to 'true' but");
      console.error("HAZO_AUTH_DEV_LOCK_PASSWORD is not set.");
      console.error("");
      console.error("Please either:");
      console.error("  1. Set HAZO_AUTH_DEV_LOCK_PASSWORD environment variable");
      console.error("  2. Remove or set HAZO_AUTH_DEV_LOCK_ENABLED to 'false'");
      console.error("=".repeat(60));

      throw new Error(
        "Dev lock is enabled but HAZO_AUTH_DEV_LOCK_PASSWORD is not set. " +
          "Application cannot start without a password."
      );
    }

    if (password.length < 8) {
      console.warn("=".repeat(60));
      console.warn("WARNING: Dev Lock Password Too Short");
      console.warn("=".repeat(60));
      console.warn("HAZO_AUTH_DEV_LOCK_PASSWORD is less than 8 characters.");
      console.warn("Consider using a stronger password for better security.");
      console.warn("=".repeat(60));
    }

    console.log("Dev lock is enabled - application access restricted until password entry");
  }
}

// section: initialization

// Validate dev lock configuration first (synchronous, fails fast)
validate_dev_lock_config();

// Self-executing async function to initialize services
(async function initializeNodeServices() {
  try {
    // Import hazo_notify package
    const hazo_notify_module = await import("hazo_notify");
    const { load_emailer_config } = hazo_notify_module;
    const notify_config = load_emailer_config();

    // Pass the initialized configuration to hazo_auth email service
    set_hazo_notify_instance(notify_config);

    console.log("hazo_notify initialized successfully");
  } catch (error) {
    const error_message =
      error instanceof Error ? error.message : "Unknown error";
    console.warn("Failed to initialize hazo_notify:", error_message);
    console.warn(
      "Email service will attempt to load config on first use as fallback"
    );
  }
})();

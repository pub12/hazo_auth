// file_description: Node.js-only instrumentation initialization
// This file is only imported when NEXT_RUNTIME === 'nodejs'
// Contains all Node.js-specific service initialization
// section: imports

import { set_hazo_notify_instance } from "./src/lib/services/email_service";

// section: initialization

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

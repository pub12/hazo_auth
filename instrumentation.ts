// file_description: Next.js instrumentation file - runs once when server starts
// Initializes hazo_notify email service and passes it to hazo_auth email service
// section: instrumentation
export async function register() {
  // Only run in server environment
  if (typeof window === "undefined") {
    try {
      // Step 1: Import hazo_notify package
      const hazo_notify_module = await import("hazo_notify");
      
      // Step 2: Load hazo_notify emailer configuration
      // This reads from hazo_notify_config.ini in the project root (same location as hazo_auth_config.ini)
      const { load_emailer_config } = hazo_notify_module;
      const notify_config = load_emailer_config();
      
      // Step 3: Pass the initialized configuration to hazo_auth email service
      // This allows the email service to reuse the same configuration instance
      const { set_hazo_notify_instance } = await import("@/lib/services/email_service");
      set_hazo_notify_instance(notify_config);
      
      // Log successful initialization
      console.log("hazo_notify initialized successfully");
    } catch (error) {
      // Log error but don't crash - allows app to run without email functionality
      // The email service will attempt to load config on first use as fallback
      const error_message = error instanceof Error ? error.message : "Unknown error";
      console.warn("Failed to initialize hazo_notify:", error_message);
      console.warn("Email service will attempt to load config on first use as fallback");
    }
  }
}


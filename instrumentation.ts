// file_description: Next.js instrumentation file - runs once when server starts
// NOTE: hazo_notify initialization has been disabled since we're now using a console-based email service
// The email service (email_service.ts) outputs emails to console instead of using hazo_notify
// section: instrumentation
export async function register() {
  // Only run in server environment
  if (typeof window === "undefined") {
    // hazo_notify initialization has been disabled
    // Email functionality is now handled by the console-based email service (email_service.ts)
    // which outputs emails to console for development/testing
    // If you need to re-enable hazo_notify, uncomment the code below and ensure setup_hazo_auth exists
    
    /*
    try {
      // Step 1: Import hazo_notify package
      const hazo_notify_module = await import("hazo_notify");
      
      // Step 2: Get the hazo_notify object (handle both default and named exports)
      const hazo_notify = hazo_notify_module.default || hazo_notify_module;
      
      // Step 3: Initialize hazo_notify FIRST (reads hazo_notify_config.ini internally)
      const notify_instance = hazo_notify.init("hazo_notify_config.ini");
      
      // Step 4: THEN pass the initialized instance to hazo_auth
      // Note: setup_hazo_auth function doesn't exist in the codebase
      // setup_hazo_auth({
      //   hazo_notify_instance: notify_instance,
      // });
    } catch (error) {
      // Log error but don't crash - allows app to run without email functionality
      const error_message = error instanceof Error ? error.message : "Unknown error";
      console.warn("Failed to initialize hazo_notify:", error_message);
    }
    */
  }
}


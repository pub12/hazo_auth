// file_description: utility functions for collecting client IP address
// section: client_ip_collection
/**
 * Attempts to get the client IP address
 * In browser context, this will try to fetch from an API endpoint
 * Falls back to "unknown" if unable to determine
 */
export async function get_client_ip(): Promise<string> {
  // Check if fetch is available (not available in test environment)
  if (typeof fetch === "undefined") {
    return "unknown";
  }

  try {
    // Try to get IP from a public IP detection service
    const response = await fetch("https://api.ipify.org?format=json", {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.ip || "unknown";
    }
  } catch (error) {
    // Silently fail and return unknown
    // Only log in non-test environments
    if (process.env.NODE_ENV !== "test") {
      console.debug("Failed to fetch IP address:", error);
    }
  }

  return "unknown";
}


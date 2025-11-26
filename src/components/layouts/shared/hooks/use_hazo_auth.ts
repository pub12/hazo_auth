// file_description: React hook for hazo_get_auth utility (client-side)
// section: client_directive
"use client";

// section: imports
import { useState, useEffect, useCallback } from "react";
import type { HazoAuthResult } from "hazo_auth/lib/auth/auth_types";

// section: types

/**
 * Options for use_hazo_auth hook
 */
export type UseHazoAuthOptions = {
  /**
   * Array of required permissions to check
   */
  required_permissions?: string[];
  /**
   * If true, throws error when permissions are missing (default: false)
   */
  strict?: boolean;
  /**
   * Skip fetch (for conditional use)
   */
  skip?: boolean;
};

/**
 * Result type for use_hazo_auth hook
 */
export type UseHazoAuthResult = HazoAuthResult & {
  /**
   * Loading state
   */
  loading: boolean;
  /**
   * Error state
   */
  error: Error | null;
  /**
   * Manual refetch function
   */
  refetch: () => Promise<void>;
};

// section: constants
const AUTH_STATUS_CHANGE_EVENT = "hazo_auth_status_change";

// section: helpers

/**
 * Triggers a refresh of hazo_auth status across all components
 * Dispatches a custom event that all use_hazo_auth hooks listen to
 */
export function trigger_hazo_auth_refresh(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(AUTH_STATUS_CHANGE_EVENT),
    );
  }
}

// section: hook

/**
 * React hook for hazo_get_auth utility
 * Fetches authentication status and permissions from /api/auth/get_auth
 * @param options - Optional parameters for permission checking
 * @returns UseHazoAuthResult with auth data, loading state, and refetch function
 */
export function use_hazo_auth(
  options?: UseHazoAuthOptions,
): UseHazoAuthResult {
  const [authResult, setAuthResult] = useState<HazoAuthResult>({
    authenticated: false,
    user: null,
    permissions: [],
    permission_ok: false,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAuth = useCallback(async () => {
    if (options?.skip) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/hazo_auth/get_auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          required_permissions: options?.required_permissions,
          strict: options?.strict || false,
        }),
      });

      if (!response.ok) {
        const error_data = await response.json();
        throw new Error(
          error_data.user_friendly_message ||
            error_data.error ||
            "Failed to fetch authentication status",
        );
      }

      const data = await response.json();
      setAuthResult(data);
    } catch (err) {
      const error_message =
        err instanceof Error ? err : new Error("Unknown error");
      setError(error_message);
      setAuthResult({
        authenticated: false,
        user: null,
        permissions: [],
        permission_ok: false,
      });
    } finally {
      setLoading(false);
    }
  }, [options?.required_permissions, options?.strict, options?.skip]);

  useEffect(() => {
    // Fetch auth status on mount
    void fetchAuth();

    // Listen for auth status change events
    const handleAuthChange = () => {
      void fetchAuth();
    };

    window.addEventListener(AUTH_STATUS_CHANGE_EVENT, handleAuthChange);

    return () => {
      window.removeEventListener(
        AUTH_STATUS_CHANGE_EVENT,
        handleAuthChange,
      );
    };
  }, [fetchAuth]);

  return {
    ...authResult,
    loading,
    error,
    refetch: fetchAuth,
  };
}


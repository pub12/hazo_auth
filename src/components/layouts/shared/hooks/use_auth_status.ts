// file_description: hook to check authentication status and get current user info
// section: client_directive
"use client";

// section: imports
import { useState, useEffect, useCallback } from "react";

// section: types
export type AuthStatusData = {
  authenticated: boolean;
  user_id?: string;
  email?: string;
  name?: string;
  email_verified?: boolean;
  last_logon?: string;
  profile_picture_url?: string;
  profile_source?: "upload" | "library" | "gravatar" | "custom";
  loading: boolean;
};

export type AuthStatus = AuthStatusData & {
  refresh: () => Promise<void>;
};

// section: constants
const AUTH_STATUS_CHANGE_EVENT = "hazo_auth_status_change";

// section: helpers
/**
 * Dispatches a custom event to notify all auth status hooks to refresh
 */
export function trigger_auth_status_refresh(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(AUTH_STATUS_CHANGE_EVENT));
  }
}

// section: hook
export function use_auth_status(): AuthStatus {
  const [authStatus, setAuthStatus] = useState<AuthStatusData>({
    authenticated: false,
    loading: true,
  });

  const checkAuth = useCallback(async () => {
    setAuthStatus((prev) => ({ ...prev, loading: true }));

    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (data.authenticated) {
        setAuthStatus({
          authenticated: true,
          user_id: data.user_id,
          email: data.email,
          name: data.name,
          email_verified: data.email_verified,
          last_logon: data.last_logon,
          profile_picture_url: data.profile_picture_url,
          profile_source: data.profile_source,
          loading: false,
        });
      } else {
        setAuthStatus({
          authenticated: false,
          loading: false,
        });
      }
    } catch (error) {
      setAuthStatus({
        authenticated: false,
        loading: false,
      });
    }
  }, []);

  useEffect(() => {
    // Check auth status on mount
    void checkAuth();

    // Listen for auth status change events
    const handleAuthChange = () => {
      void checkAuth();
    };

    window.addEventListener(AUTH_STATUS_CHANGE_EVENT, handleAuthChange);

    return () => {
      window.removeEventListener(AUTH_STATUS_CHANGE_EVENT, handleAuthChange);
    };
  }, [checkAuth]);

  return {
    ...authStatus,
    refresh: checkAuth,
  };
}


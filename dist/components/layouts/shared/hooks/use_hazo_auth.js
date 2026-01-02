// file_description: React hook for hazo_get_auth utility (client-side)
// section: client_directive
"use client";
// section: imports
import { useState, useEffect, useCallback } from "react";
import { useHazoAuthConfig } from "../../../../contexts/hazo_auth_provider.js";
// section: constants
const AUTH_STATUS_CHANGE_EVENT = "hazo_auth_status_change";
// section: helpers
/**
 * Triggers a refresh of hazo_auth status across all components
 * Dispatches a custom event that all use_hazo_auth hooks listen to
 */
export function trigger_hazo_auth_refresh() {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(AUTH_STATUS_CHANGE_EVENT));
    }
}
// section: hook
/**
 * React hook for hazo_get_auth utility
 * Fetches authentication status and permissions from /api/auth/get_auth
 * @param options - Optional parameters for permission checking
 * @returns UseHazoAuthResult with auth data, loading state, and refetch function
 */
export function use_hazo_auth(options) {
    const { apiBasePath } = useHazoAuthConfig();
    const [authResult, setAuthResult] = useState({
        authenticated: false,
        user: null,
        permissions: [],
        permission_ok: false,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchAuth = useCallback(async () => {
        if (options === null || options === void 0 ? void 0 : options.skip) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${apiBasePath}/get_auth`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    required_permissions: options === null || options === void 0 ? void 0 : options.required_permissions,
                    strict: (options === null || options === void 0 ? void 0 : options.strict) || false,
                }),
            });
            if (!response.ok) {
                const error_data = await response.json();
                throw new Error(error_data.user_friendly_message ||
                    error_data.error ||
                    "Failed to fetch authentication status");
            }
            const data = await response.json();
            setAuthResult(data);
        }
        catch (err) {
            const error_message = err instanceof Error ? err : new Error("Unknown error");
            setError(error_message);
            setAuthResult({
                authenticated: false,
                user: null,
                permissions: [],
                permission_ok: false,
            });
        }
        finally {
            setLoading(false);
        }
    }, [apiBasePath, options === null || options === void 0 ? void 0 : options.required_permissions, options === null || options === void 0 ? void 0 : options.strict, options === null || options === void 0 ? void 0 : options.skip]);
    useEffect(() => {
        // Fetch auth status on mount
        void fetchAuth();
        // Listen for auth status change events
        const handleAuthChange = () => {
            void fetchAuth();
        };
        window.addEventListener(AUTH_STATUS_CHANGE_EVENT, handleAuthChange);
        return () => {
            window.removeEventListener(AUTH_STATUS_CHANGE_EVENT, handleAuthChange);
        };
    }, [fetchAuth]);
    return Object.assign(Object.assign({}, authResult), { loading,
        error, refetch: fetchAuth });
}

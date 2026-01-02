// file_description: React hook for fetching firm branding (client-side)
// section: client_directive
"use client";

// section: imports
import { useState, useEffect, useCallback } from "react";
import { useHazoAuthConfig } from "../../../../contexts/hazo_auth_provider";

// section: types

/**
 * Firm branding data structure
 */
export type FirmBranding = {
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  tagline?: string;
};

/**
 * Options for use_firm_branding hook
 */
export type UseFirmBrandingOptions = {
  /**
   * Scope ID to get branding for
   * If not provided, uses current user's root scope
   */
  scope_id?: string;
  /**
   * Whether to resolve inheritance (default: true)
   * If true, child scopes will get their root scope's branding
   */
  resolve_inheritance?: boolean;
  /**
   * Skip fetch (for conditional use)
   */
  skip?: boolean;
};

/**
 * Result type for use_firm_branding hook
 */
export type UseFirmBrandingResult = {
  /**
   * The branding data (null if no branding set)
   */
  branding: FirmBranding | null;
  /**
   * Loading state
   */
  loading: boolean;
  /**
   * Error state
   */
  error: Error | null;
  /**
   * Whether the branding was inherited from a parent scope
   */
  is_inherited: boolean;
  /**
   * Manual refetch function
   */
  refetch: () => Promise<void>;
};

// section: hook

/**
 * React hook for fetching firm branding
 * @param options - Optional parameters for scope and inheritance
 * @returns UseFirmBrandingResult with branding data, loading state, and refetch function
 */
export function use_firm_branding(
  options?: UseFirmBrandingOptions
): UseFirmBrandingResult {
  const { apiBasePath } = useHazoAuthConfig();
  const [branding, setBranding] = useState<FirmBranding | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isInherited, setIsInherited] = useState<boolean>(false);

  const fetchBranding = useCallback(async () => {
    if (options?.skip) {
      setLoading(false);
      return;
    }

    // If no scope_id provided, we need to get the current user's scope first
    if (!options?.scope_id) {
      setLoading(false);
      setBranding(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        scope_id: options.scope_id,
        resolve_inheritance: String(options.resolve_inheritance ?? true),
      });

      const response = await fetch(
        `${apiBasePath}/scope_management/branding?${params}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setBranding(data.branding || null);
        setIsInherited(data.is_inherited || false);
      } else {
        throw new Error(data.error || "Failed to fetch branding");
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      setBranding(null);
      setIsInherited(false);
    } finally {
      setLoading(false);
    }
  }, [apiBasePath, options?.scope_id, options?.resolve_inheritance, options?.skip]);

  // Fetch branding on mount and when dependencies change
  useEffect(() => {
    void fetchBranding();
  }, [fetchBranding]);

  return {
    branding,
    loading,
    error,
    is_inherited: isInherited,
    refetch: fetchBranding,
  };
}

/**
 * React hook for fetching the current user's firm branding
 * This hook first fetches the user's scope, then gets the branding for that scope
 * @returns UseFirmBrandingResult with branding data, loading state, and refetch function
 */
export function use_current_user_branding(): UseFirmBrandingResult {
  const { apiBasePath } = useHazoAuthConfig();
  const [branding, setBranding] = useState<FirmBranding | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isInherited, setIsInherited] = useState<boolean>(false);

  const fetchBranding = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // First, get the current user's auth info which includes their scope
      const meResponse = await fetch(`${apiBasePath}/me`, {
        method: "GET",
        credentials: "include",
      });

      if (!meResponse.ok) {
        if (meResponse.status === 401) {
          // Not authenticated - no branding
          setBranding(null);
          setLoading(false);
          return;
        }
        throw new Error(`HTTP error ${meResponse.status}`);
      }

      const meData = await meResponse.json();

      if (!meData.authenticated || !meData.user) {
        setBranding(null);
        setLoading(false);
        return;
      }

      // Get user scopes to find their root scope
      const scopesResponse = await fetch(
        `${apiBasePath}/user_scopes?user_id=${meData.user.id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!scopesResponse.ok) {
        setBranding(null);
        setLoading(false);
        return;
      }

      const scopesData = await scopesResponse.json();

      if (!scopesData.user_scopes || scopesData.user_scopes.length === 0) {
        setBranding(null);
        setLoading(false);
        return;
      }

      // Get the first root scope ID
      const rootScopeId = scopesData.user_scopes[0].root_scope_id;

      if (!rootScopeId) {
        setBranding(null);
        setLoading(false);
        return;
      }

      // Now fetch the branding for that scope
      const params = new URLSearchParams({
        scope_id: rootScopeId,
        resolve_inheritance: "true",
      });

      const brandingResponse = await fetch(
        `${apiBasePath}/scope_management/branding?${params}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!brandingResponse.ok) {
        setBranding(null);
        setLoading(false);
        return;
      }

      const brandingData = await brandingResponse.json();

      if (brandingData.success) {
        setBranding(brandingData.branding || null);
        setIsInherited(brandingData.is_inherited || false);
      } else {
        setBranding(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      setBranding(null);
      setIsInherited(false);
    } finally {
      setLoading(false);
    }
  }, [apiBasePath]);

  // Fetch branding on mount
  useEffect(() => {
    void fetchBranding();
  }, [fetchBranding]);

  return {
    branding,
    loading,
    error,
    is_inherited: isInherited,
    refetch: fetchBranding,
  };
}

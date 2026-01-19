// file_description: hook for managing create firm form state and submission
"use client";

// section: imports
import { useState, useCallback, useRef, useEffect, useMemo, FormEvent } from "react";

// section: types
export type CreateFirmFormValues = {
  firm_name: string;
  org_structure: string;
};

export type CreateFirmFormErrors = {
  firm_name?: string;
  org_structure?: string;
  form?: string;
};

export type UseCreateFirmFormOptions = {
  default_org_structure?: string;
  onSuccess?: (scope_id: string) => void;
  redirectRoute?: string;
  /** API base path for hazo_auth endpoints */
  apiBasePath?: string;
  logger?: {
    info: (message: string, data?: Record<string, unknown>) => void;
    error: (message: string, data?: Record<string, unknown>) => void;
  };
};

export type UseCreateFirmFormResult = {
  values: CreateFirmFormValues;
  errors: CreateFirmFormErrors;
  isSubmitting: boolean;
  isSuccess: boolean;
  isSubmitDisabled: boolean;
  handleFieldChange: (field: keyof CreateFirmFormValues, value: string) => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  /** Ref to attach to firm_name input for DOM value sync */
  firmNameRef: React.RefObject<HTMLInputElement>;
  /** Ref to attach to org_structure input for DOM value sync */
  orgStructureRef: React.RefObject<HTMLInputElement>;
  /** Sync React state from DOM values (call on autofill detection) */
  syncFromDOM: () => void;
};

// section: hook
export function use_create_firm_form(
  options: UseCreateFirmFormOptions = {}
): UseCreateFirmFormResult {
  const {
    default_org_structure = "Headquarters",
    onSuccess,
    redirectRoute = "/",
    apiBasePath = "/api/hazo_auth",
    logger,
  } = options;

  const [values, setValues] = useState<CreateFirmFormValues>({
    firm_name: "",
    org_structure: default_org_structure,
  });

  const [errors, setErrors] = useState<CreateFirmFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Refs for DOM value sync (handles browser autocomplete, password managers, etc.)
  const firmNameRef = useRef<HTMLInputElement>(null);
  const orgStructureRef = useRef<HTMLInputElement>(null);
  // Counter to force re-evaluation of isSubmitDisabled after sync
  const [syncCounter, setSyncCounter] = useState(0);

  // Sync React state from DOM values (call when autofill detected or on focus)
  const syncFromDOM = useCallback(() => {
    let didSync = false;

    if (firmNameRef.current) {
      const domValue = firmNameRef.current.value;
      if (domValue !== values.firm_name) {
        setValues((prev) => ({ ...prev, firm_name: domValue }));
        didSync = true;
      }
    }

    if (orgStructureRef.current) {
      const domValue = orgStructureRef.current.value;
      if (domValue !== values.org_structure) {
        setValues((prev) => ({ ...prev, org_structure: domValue }));
        didSync = true;
      }
    }

    // Force re-evaluation even if React state didn't change (DOM might have)
    if (didSync) {
      setSyncCounter((c) => c + 1);
    }
  }, [values.firm_name, values.org_structure]);

  // Effect to detect browser autofill via animationstart event
  // Chrome triggers animationstart on autofilled inputs if CSS animation is defined
  useEffect(() => {
    const handleAutofill = (e: AnimationEvent) => {
      if (e.animationName === "onAutoFillStart") {
        // Delay to allow browser to populate the value
        setTimeout(syncFromDOM, 50);
      }
    };

    const firmNameInput = firmNameRef.current;
    const orgStructureInput = orgStructureRef.current;

    firmNameInput?.addEventListener("animationstart", handleAutofill as EventListener);
    orgStructureInput?.addEventListener("animationstart", handleAutofill as EventListener);

    // Also sync on focus (catches form restoration, manual paste, etc.)
    const handleFocus = () => {
      // Small delay to let browser complete any pending value changes
      setTimeout(syncFromDOM, 10);
    };

    firmNameInput?.addEventListener("focus", handleFocus);
    orgStructureInput?.addEventListener("focus", handleFocus);

    // Initial sync after mount (catches pre-populated values)
    setTimeout(syncFromDOM, 100);

    return () => {
      firmNameInput?.removeEventListener("animationstart", handleAutofill as EventListener);
      orgStructureInput?.removeEventListener("animationstart", handleAutofill as EventListener);
      firmNameInput?.removeEventListener("focus", handleFocus);
      orgStructureInput?.removeEventListener("focus", handleFocus);
    };
  }, [syncFromDOM]);

  const handleFieldChange = useCallback(
    (field: keyof CreateFirmFormValues, value: string) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      // Clear field error when user starts typing
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    []
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: CreateFirmFormErrors = {};

    if (!values.firm_name.trim()) {
      newErrors.firm_name = "Firm name is required";
    } else if (values.firm_name.length > 100) {
      newErrors.firm_name = "Firm name must be 100 characters or less";
    }

    if (!values.org_structure.trim()) {
      newErrors.org_structure = "Organisation structure is required";
    } else if (values.org_structure.length > 50) {
      newErrors.org_structure = "Organisation structure must be 50 characters or less";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);
      setErrors({});

      try {
        const response = await fetch(`${apiBasePath}/create_firm`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firm_name: values.firm_name.trim(),
            org_structure: values.org_structure.trim(),
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setErrors({ form: data.error || "Failed to create firm" });
          logger?.error("create_firm_form_error", {
            error: data.error,
            status: response.status,
          });
          return;
        }

        setIsSuccess(true);
        logger?.info("create_firm_form_success", {
          scope_id: data.scope?.id,
        });

        // Call onSuccess callback if provided
        if (onSuccess && data.scope?.id) {
          onSuccess(data.scope.id);
        }

        // Redirect after a brief delay to show success
        setTimeout(() => {
          window.location.href = redirectRoute;
        }, 1500);
      } catch (error) {
        const error_message =
          error instanceof Error ? error.message : "Unknown error";
        setErrors({ form: "An unexpected error occurred. Please try again." });
        logger?.error("create_firm_form_error", {
          error: error_message,
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateForm, onSuccess, redirectRoute, apiBasePath, logger]
  );

  // Calculate disabled state using both React state AND refs as fallback
  // This handles cases where DOM is populated but React state hasn't caught up
  // (browser autocomplete, password managers, form restoration, etc.)
  const isSubmitDisabled = useMemo(() => {
    if (isSubmitting) return true;

    // Check React state first
    const firmNameFromState = values.firm_name.trim();
    const orgStructureFromState = values.org_structure.trim();

    // Also check DOM refs as fallback (may have values React doesn't know about)
    const firmNameFromDom = firmNameRef.current?.value?.trim() || "";
    const orgStructureFromDom = orgStructureRef.current?.value?.trim() || "";

    // Use whichever has a value (prefer state, fall back to DOM)
    const effectiveFirmName = firmNameFromState || firmNameFromDom;
    const effectiveOrgStructure = orgStructureFromState || orgStructureFromDom;

    return !effectiveFirmName || !effectiveOrgStructure;
    // syncCounter included to force re-evaluation after DOM sync
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubmitting, values.firm_name, values.org_structure, syncCounter]);

  return {
    values,
    errors,
    isSubmitting,
    isSuccess,
    isSubmitDisabled,
    handleFieldChange,
    handleSubmit,
    firmNameRef,
    orgStructureRef,
    syncFromDOM,
  };
}

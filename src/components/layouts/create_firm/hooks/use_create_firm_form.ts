// file_description: hook for managing create firm form state and submission
"use client";

// section: imports
import { useState, useCallback, FormEvent } from "react";

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

  const isSubmitDisabled =
    isSubmitting || !values.firm_name.trim() || !values.org_structure.trim();

  return {
    values,
    errors,
    isSubmitting,
    isSuccess,
    isSubmitDisabled,
    handleFieldChange,
    handleSubmit,
  };
}

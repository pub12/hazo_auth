// file_description: encapsulate reset password form state, validation, and data interactions
// section: imports
import { useCallback, useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import type { LayoutDataClient } from "@/components/layouts/shared/data/layout_data_client";
import type { PasswordRequirementOptions } from "@/components/layouts/shared/config/layout_customization";
import { RESET_PASSWORD_FIELD_IDS, type ResetPasswordFieldId } from "@/components/layouts/reset_password/config/reset_password_field_config";
import { validatePassword } from "@/components/layouts/shared/utils/validation";

// section: constants
const PASSWORD_FIELDS: Array<ResetPasswordFieldId> = [
  RESET_PASSWORD_FIELD_IDS.PASSWORD,
  RESET_PASSWORD_FIELD_IDS.CONFIRM_PASSWORD,
];

// section: types
export type ResetPasswordFormValues = Record<ResetPasswordFieldId, string>;
export type ResetPasswordFormErrors = Partial<Record<ResetPasswordFieldId, string | string[]>>;
export type PasswordVisibilityState = Record<
  Extract<ResetPasswordFieldId, "password" | "confirm_password">,
  boolean
>;

export type UseResetPasswordFormParams<TClient = unknown> = {
  passwordRequirements: PasswordRequirementOptions;
  dataClient: LayoutDataClient<TClient>;
  loginPath?: string;
};

export type UseResetPasswordFormResult = {
  values: ResetPasswordFormValues;
  errors: ResetPasswordFormErrors;
  passwordVisibility: PasswordVisibilityState;
  isSubmitDisabled: boolean;
  isSubmitting: boolean;
  isSuccess: boolean;
  token: string | null;
  isValidatingToken: boolean;
  tokenError: string | null;
  handleFieldChange: (fieldId: ResetPasswordFieldId, value: string) => void;
  togglePasswordVisibility: (fieldId: "password" | "confirm_password") => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  handleCancel: () => void;
};

// section: helpers
const buildInitialValues = (): ResetPasswordFormValues => ({
  [RESET_PASSWORD_FIELD_IDS.PASSWORD]: "",
  [RESET_PASSWORD_FIELD_IDS.CONFIRM_PASSWORD]: "",
});

// section: hook
export const use_reset_password_form = <TClient,>({
  passwordRequirements,
  dataClient,
  loginPath = "/hazo_auth/login",
}: UseResetPasswordFormParams<TClient>): UseResetPasswordFormResult => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get("token");

  const [values, setValues] = useState<ResetPasswordFormValues>(buildInitialValues);
  const [errors, setErrors] = useState<ResetPasswordFormErrors>({});
  const [passwordVisibility, setPasswordVisibility] = useState<PasswordVisibilityState>({
    password: false,
    confirm_password: false,
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(tokenParam);
  const [isValidatingToken, setIsValidatingToken] = useState<boolean>(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  // Validate token on mount
  useEffect(() => {
    if (!tokenParam) {
      setTokenError("Reset password link invalid or has expired. Please go to Reset Password page to get a new link.");
      return;
    }

    // Validate token by calling validation API
    const validateToken = async () => {
      setIsValidatingToken(true);
      setTokenError(null);

      try {
        const response = await fetch(`/api/hazo_auth/validate_reset_token?token=${encodeURIComponent(tokenParam)}`, {
          method: "GET",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          const errorMessage = data.error || "Reset password link invalid or has expired. Please go to Reset Password page to get a new link.";
          setTokenError(errorMessage);
          setToken(null);
        } else {
          // Token is valid
          setToken(tokenParam);
          setTokenError(null);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An error occurred while validating the token";
        setTokenError("Reset password link invalid or has expired. Please go to Reset Password page to get a new link.");
        setToken(null);
      } finally {
        setIsValidatingToken(false);
      }
    };

    void validateToken();
  }, [tokenParam]);

  const isSubmitDisabled = useMemo(() => {
    if (isSubmitting || isSuccess || !token || tokenError) {
      return true;
    }

    const hasEmptyField = Object.values(values).some((value) => value.trim() === "");
    if (hasEmptyField) {
      return true;
    }

    return Object.keys(errors).length > 0;
  }, [isSubmitting, isSuccess, token, tokenError, values, errors]);

  const handleFieldChange = useCallback((fieldId: ResetPasswordFieldId, value: string) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));

    // Clear error for this field when user starts typing
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }

    // Validate password fields in real-time
    if (fieldId === RESET_PASSWORD_FIELD_IDS.PASSWORD) {
      const passwordError = validatePassword(value, passwordRequirements);
      if (passwordError) {
        setErrors((prev) => ({
          ...prev,
          [RESET_PASSWORD_FIELD_IDS.PASSWORD]: passwordError,
        }));
      } else {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[RESET_PASSWORD_FIELD_IDS.PASSWORD];
          return next;
        });
      }

      // Also validate confirm password if it has a value
      if (values[RESET_PASSWORD_FIELD_IDS.CONFIRM_PASSWORD]) {
        if (value !== values[RESET_PASSWORD_FIELD_IDS.CONFIRM_PASSWORD]) {
          setErrors((prev) => ({
            ...prev,
            [RESET_PASSWORD_FIELD_IDS.CONFIRM_PASSWORD]: "Passwords do not match",
          }));
        } else {
          setErrors((prev) => {
            const next = { ...prev };
            delete next[RESET_PASSWORD_FIELD_IDS.CONFIRM_PASSWORD];
            return next;
          });
        }
      }
    } else if (fieldId === RESET_PASSWORD_FIELD_IDS.CONFIRM_PASSWORD) {
      if (value !== values[RESET_PASSWORD_FIELD_IDS.PASSWORD]) {
        setErrors((prev) => ({
          ...prev,
          [RESET_PASSWORD_FIELD_IDS.CONFIRM_PASSWORD]: "Passwords do not match",
        }));
      } else {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[RESET_PASSWORD_FIELD_IDS.CONFIRM_PASSWORD];
          return next;
        });
      }
    }
  }, [errors, passwordRequirements, values]);

  const togglePasswordVisibility = useCallback((fieldId: "password" | "confirm_password") => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [fieldId]: !prev[fieldId],
    }));
  }, []);

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      toast.error("Reset token is missing");
      return;
    }

    // Validate all fields
    const passwordError = validatePassword(values[RESET_PASSWORD_FIELD_IDS.PASSWORD], passwordRequirements);
    const confirmPasswordError =
      values[RESET_PASSWORD_FIELD_IDS.PASSWORD] !== values[RESET_PASSWORD_FIELD_IDS.CONFIRM_PASSWORD]
        ? "Passwords do not match"
        : undefined;

    if (passwordError || confirmPasswordError) {
      setErrors({
        ...(passwordError ? { [RESET_PASSWORD_FIELD_IDS.PASSWORD]: passwordError } : {}),
        ...(confirmPasswordError ? { [RESET_PASSWORD_FIELD_IDS.CONFIRM_PASSWORD]: confirmPasswordError } : {}),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/hazo_auth/reset_password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          new_password: values[RESET_PASSWORD_FIELD_IDS.PASSWORD],
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage = data.error || "Failed to reset password";
        toast.error(errorMessage);
        setTokenError(errorMessage);
        setIsSubmitting(false);
        return;
      }

      toast.success(data.message || "Password reset successfully");
      setIsSuccess(true);

      // Redirect to login after a short delay
      setTimeout(() => {
        router.push(loginPath);
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast.error(errorMessage);
      setTokenError(errorMessage);
      setIsSubmitting(false);
    }
  }, [token, values, passwordRequirements, router, loginPath]);

  const handleCancel = useCallback(() => {
    router.push(loginPath);
  }, [router, loginPath]);

  return {
    values,
    errors,
    passwordVisibility,
    isSubmitDisabled,
    isSubmitting,
    isSuccess,
    token,
    isValidatingToken,
    tokenError,
    handleFieldChange,
    togglePasswordVisibility,
    handleSubmit,
    handleCancel,
  };
};


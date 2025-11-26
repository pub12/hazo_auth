// file_description: encapsulate forgot password form state, validation, and data interactions
// section: imports
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import type { LayoutDataClient } from "hazo_auth/components/layouts/shared/data/layout_data_client";
import { FORGOT_PASSWORD_FIELD_IDS, type ForgotPasswordFieldId } from "hazo_auth/components/layouts/forgot_password/config/forgot_password_field_config";
import { validateEmail } from "hazo_auth/components/layouts/shared/utils/validation";

// section: types
export type ForgotPasswordFormValues = Record<ForgotPasswordFieldId, string>;
export type ForgotPasswordFormErrors = Partial<Record<ForgotPasswordFieldId, string>> & {
  submit?: string;
};

export type UseForgotPasswordFormParams<TClient = unknown> = {
  dataClient: LayoutDataClient<TClient>;
};

export type UseForgotPasswordFormResult = {
  values: ForgotPasswordFormValues;
  errors: ForgotPasswordFormErrors;
  isSubmitDisabled: boolean;
  isSubmitting: boolean;
  emailTouched: boolean;
  handleFieldChange: (fieldId: ForgotPasswordFieldId, value: string) => void;
  handleEmailBlur: () => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  handleCancel: () => void;
};

// section: helpers
const buildInitialValues = (): ForgotPasswordFormValues => ({
  [FORGOT_PASSWORD_FIELD_IDS.EMAIL]: "",
});

// section: hook
export const use_forgot_password_form = <TClient,>({
  dataClient,
}: UseForgotPasswordFormParams<TClient>): UseForgotPasswordFormResult => {
  const [values, setValues] = useState<ForgotPasswordFormValues>(buildInitialValues);
  const [errors, setErrors] = useState<ForgotPasswordFormErrors>({});
  const [emailTouched, setEmailTouched] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isSubmitDisabled = useMemo(() => {
    if (isSubmitting) {
      return true;
    }

    const hasEmptyField = Object.values(values).some((fieldValue) => fieldValue.trim() === "");
    const hasErrors = Object.keys(errors).length > 0;
    return hasEmptyField || hasErrors;
  }, [errors, values, isSubmitting]);

  const handleFieldChange = useCallback((fieldId: ForgotPasswordFieldId, value: string) => {
    setValues((previousValues) => {
      const nextValues: ForgotPasswordFormValues = {
        ...previousValues,
        [fieldId]: value,
      };

      setErrors((previousErrors) => {
        const updatedErrors: ForgotPasswordFormErrors = { ...previousErrors };

        // Only validate email on change if it has been touched (blurred)
        if (fieldId === FORGOT_PASSWORD_FIELD_IDS.EMAIL && emailTouched) {
          const emailError = validateEmail(value);
          if (emailError) {
            updatedErrors[FORGOT_PASSWORD_FIELD_IDS.EMAIL] = emailError;
          } else {
            delete updatedErrors[FORGOT_PASSWORD_FIELD_IDS.EMAIL];
          }
        }

        return updatedErrors;
      });

      return nextValues;
    });
  }, [emailTouched]);

  const handleEmailBlur = useCallback(() => {
    setEmailTouched(true);
    // Validate email on blur
    setErrors((previousErrors) => {
      const updatedErrors: ForgotPasswordFormErrors = { ...previousErrors };
      const emailValue = values[FORGOT_PASSWORD_FIELD_IDS.EMAIL];
      const emailError = validateEmail(emailValue);
      if (emailError) {
        updatedErrors[FORGOT_PASSWORD_FIELD_IDS.EMAIL] = emailError;
      } else {
        delete updatedErrors[FORGOT_PASSWORD_FIELD_IDS.EMAIL];
      }
      return updatedErrors;
    });
  }, [values]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      // Final validation
      const emailError = validateEmail(values[FORGOT_PASSWORD_FIELD_IDS.EMAIL]);

      if (emailError) {
        setErrors({
          [FORGOT_PASSWORD_FIELD_IDS.EMAIL]: emailError,
        });
        return;
      }

      setIsSubmitting(true);
      setErrors({});

      try {
        const response = await fetch("/api/hazo_auth/forgot_password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: values[FORGOT_PASSWORD_FIELD_IDS.EMAIL],
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Password reset request failed");
        }

        // Show success notification
        toast.success("Password reset link sent", {
          description: "If an account with that email exists, a password reset link has been sent.",
        });

        // Reset form on success
        setValues(buildInitialValues());
        setErrors({});
        setEmailTouched(false);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Password reset request failed. Please try again.";

        // Show error notification
        toast.error("Password reset failed", {
          description: errorMessage,
        });

        // Set error state
        setErrors({
          submit: errorMessage,
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, dataClient],
  );

  const handleCancel = useCallback(() => {
    setValues(buildInitialValues());
    setErrors({});
    setEmailTouched(false);
  }, []);

  return {
    values,
    errors,
    isSubmitDisabled,
    isSubmitting,
    emailTouched,
    handleFieldChange,
    handleEmailBlur,
    handleSubmit,
    handleCancel,
  };
};


// file_description: encapsulate email verification state, validation, and data interactions
// section: imports
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { LayoutDataClient } from "@/components/layouts/shared/data/layout_data_client";
import { EMAIL_VERIFICATION_FIELD_IDS, type EmailVerificationFieldId } from "@/components/layouts/email_verification/config/email_verification_field_config";
import { validateEmail } from "@/components/layouts/shared/utils/validation";

// section: types
export type EmailVerificationFormValues = Record<EmailVerificationFieldId, string>;
export type EmailVerificationFormErrors = Partial<Record<EmailVerificationFieldId, string>> & {
  submit?: string;
};

export type UseEmailVerificationParams<TClient = unknown> = {
  dataClient: LayoutDataClient<TClient>;
  redirectDelay?: number; // Delay in seconds before redirecting to login
  loginPath?: string; // Path to redirect to after successful verification
};

export type UseEmailVerificationResult = {
  isVerifying: boolean;
  isVerified: boolean;
  isError: boolean;
  errorMessage?: string;
  email?: string; // Email from token if available
  values: EmailVerificationFormValues;
  errors: EmailVerificationFormErrors;
  isSubmitDisabled: boolean;
  isSubmitting: boolean;
  emailTouched: boolean;
  redirectCountdown: number;
  handleFieldChange: (fieldId: EmailVerificationFieldId, value: string) => void;
  handleEmailBlur: () => void;
  handleResendSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  handleCancel: () => void;
  handleGoToLogin: () => void;
};

// section: helpers
const buildInitialValues = (initialEmail?: string): EmailVerificationFormValues => ({
  [EMAIL_VERIFICATION_FIELD_IDS.EMAIL]: initialEmail || "",
});

// section: hook
export const use_email_verification = <TClient,>({
  dataClient,
  redirectDelay = 5,
  loginPath = "/hazo_auth/login",
}: UseEmailVerificationParams<TClient>): UseEmailVerificationResult => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const emailParam = searchParams.get("email");
  const messageParam = searchParams.get("message");

  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(messageParam || undefined);
  const [email, setEmail] = useState<string | undefined>(emailParam || undefined);
  const [values, setValues] = useState<EmailVerificationFormValues>(buildInitialValues(emailParam || undefined));
  const [errors, setErrors] = useState<EmailVerificationFormErrors>({});
  const [emailTouched, setEmailTouched] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number>(redirectDelay);

  // Verify token on mount if token exists, or show error if message is provided
  useEffect(() => {
    // If message is provided (from login redirect), show error state immediately
    if (messageParam && !token) {
      setIsError(true);
      setErrorMessage(messageParam);
      if (emailParam) {
        setEmail(emailParam);
        setValues(buildInitialValues(emailParam));
      }
      return;
    }

    if (!token) {
      setIsError(true);
      setErrorMessage("No verification token provided");
      return;
    }

    const verifyToken = async () => {
      setIsVerifying(true);
      setIsError(false);
      setErrorMessage(undefined);

      try {
        const response = await fetch(`/api/hazo_auth/verify_email?token=${encodeURIComponent(token)}`, {
          method: "GET",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Email verification failed");
        }

        // Success
        setIsVerified(true);
        setEmail(data.email);
        setValues(buildInitialValues(data.email));

        // Start countdown for redirect
        let countdown = redirectDelay;
        setRedirectCountdown(countdown);

        const countdownInterval = setInterval(() => {
          countdown -= 1;
          setRedirectCountdown(countdown);

          if (countdown <= 0) {
            clearInterval(countdownInterval);
            router.push(loginPath);
          }
        }, 1000);

        // Cleanup interval on unmount
        return () => clearInterval(countdownInterval);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Email verification failed. Please try again.";

        setIsError(true);
        setErrorMessage(errorMessage);

        // Try to extract email from error response if available
        try {
          const response = await fetch(`/api/hazo_auth/verify_email?token=${encodeURIComponent(token)}`, {
            method: "GET",
          });
          const data = await response.json();
          if (data.email) {
            setEmail(data.email);
            setValues(buildInitialValues(data.email));
          }
        } catch {
          // Ignore errors when trying to get email
        }
      } finally {
        setIsVerifying(false);
      }
    };

    void verifyToken();
  }, [token, redirectDelay, loginPath, router]);

  const isSubmitDisabled = useMemo(() => {
    if (isSubmitting) {
      return true;
    }

    const hasEmptyField = Object.values(values).some((fieldValue) => fieldValue.trim() === "");
    const hasErrors = Object.keys(errors).length > 0;
    return hasEmptyField || hasErrors;
  }, [errors, values, isSubmitting]);

  const handleFieldChange = useCallback((fieldId: EmailVerificationFieldId, value: string) => {
    setValues((previousValues) => {
      const nextValues: EmailVerificationFormValues = {
        ...previousValues,
        [fieldId]: value,
      };

      setErrors((previousErrors) => {
        const updatedErrors: EmailVerificationFormErrors = { ...previousErrors };

        // Only validate email on change if it has been touched (blurred)
        if (fieldId === EMAIL_VERIFICATION_FIELD_IDS.EMAIL && emailTouched) {
          const emailError = validateEmail(value);
          if (emailError) {
            updatedErrors[EMAIL_VERIFICATION_FIELD_IDS.EMAIL] = emailError;
          } else {
            delete updatedErrors[EMAIL_VERIFICATION_FIELD_IDS.EMAIL];
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
      const updatedErrors: EmailVerificationFormErrors = { ...previousErrors };
      const emailValue = values[EMAIL_VERIFICATION_FIELD_IDS.EMAIL];
      const emailError = validateEmail(emailValue);
      if (emailError) {
        updatedErrors[EMAIL_VERIFICATION_FIELD_IDS.EMAIL] = emailError;
      } else {
        delete updatedErrors[EMAIL_VERIFICATION_FIELD_IDS.EMAIL];
      }
      return updatedErrors;
    });
  }, [values]);

  const handleResendSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      // Final validation
      const emailError = validateEmail(values[EMAIL_VERIFICATION_FIELD_IDS.EMAIL]);

      if (emailError) {
        setErrors({
          [EMAIL_VERIFICATION_FIELD_IDS.EMAIL]: emailError,
        });
        return;
      }

      setIsSubmitting(true);
      setErrors({});

      try {
        const response = await fetch("/api/hazo_auth/resend_verification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: values[EMAIL_VERIFICATION_FIELD_IDS.EMAIL],
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to resend verification email");
        }

        // Show success notification
        toast.success("Verification email sent", {
          description: data.message || "If an account with that email exists and is not verified, a verification link has been sent.",
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to resend verification email. Please try again.";

        // Show error notification
        toast.error("Failed to resend verification email", {
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
    router.push(loginPath);
  }, [router, loginPath]);

  const handleGoToLogin = useCallback(() => {
    router.push(loginPath);
  }, [router, loginPath]);

  return {
    isVerifying,
    isVerified,
    isError,
    errorMessage,
    email,
    values,
    errors,
    isSubmitDisabled,
    isSubmitting,
    emailTouched,
    redirectCountdown,
    handleFieldChange,
    handleEmailBlur,
    handleResendSubmit,
    handleCancel,
    handleGoToLogin,
  };
};


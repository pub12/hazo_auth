// file_description: encapsulate email verification state, validation, and data interactions
// section: imports
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { EMAIL_VERIFICATION_FIELD_IDS } from "../config/email_verification_field_config";
import { validateEmail } from "../../shared/utils/validation";
// section: helpers
const buildInitialValues = (initialEmail) => ({
    [EMAIL_VERIFICATION_FIELD_IDS.EMAIL]: initialEmail || "",
});
// section: hook
export const use_email_verification = ({ dataClient, redirectDelay = 5, loginPath = "/hazo_auth/login", }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const emailParam = searchParams.get("email");
    const messageParam = searchParams.get("message");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState(messageParam || undefined);
    const [email, setEmail] = useState(emailParam || undefined);
    const [values, setValues] = useState(buildInitialValues(emailParam || undefined));
    const [errors, setErrors] = useState({});
    const [emailTouched, setEmailTouched] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [redirectCountdown, setRedirectCountdown] = useState(redirectDelay);
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
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Email verification failed. Please try again.";
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
                }
                catch (_a) {
                    // Ignore errors when trying to get email
                }
            }
            finally {
                setIsVerifying(false);
            }
        };
        void verifyToken();
    }, [token, redirectDelay, loginPath, router]);
    const isSubmitDisabled = useMemo(() => {
        if (isSubmitting) {
            return true;
        }
        // Only disable if there are active errors
        const hasErrors = !!errors[EMAIL_VERIFICATION_FIELD_IDS.EMAIL];
        return hasErrors;
    }, [errors, isSubmitting]);
    const handleFieldChange = useCallback((fieldId, value) => {
        setValues((previousValues) => {
            const nextValues = Object.assign(Object.assign({}, previousValues), { [fieldId]: value });
            setErrors((previousErrors) => {
                const updatedErrors = Object.assign({}, previousErrors);
                // Only validate email on change if it has been touched (blurred)
                if (fieldId === EMAIL_VERIFICATION_FIELD_IDS.EMAIL && emailTouched) {
                    const emailError = validateEmail(value);
                    if (emailError) {
                        updatedErrors[EMAIL_VERIFICATION_FIELD_IDS.EMAIL] = emailError;
                    }
                    else {
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
            const updatedErrors = Object.assign({}, previousErrors);
            const emailValue = values[EMAIL_VERIFICATION_FIELD_IDS.EMAIL];
            const emailError = validateEmail(emailValue);
            if (emailError) {
                updatedErrors[EMAIL_VERIFICATION_FIELD_IDS.EMAIL] = emailError;
            }
            else {
                delete updatedErrors[EMAIL_VERIFICATION_FIELD_IDS.EMAIL];
            }
            return updatedErrors;
        });
    }, [values]);
    const handleResendSubmit = useCallback(async (event) => {
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
            let data;
            try {
                data = await response.json();
            }
            catch (jsonError) {
                // If JSON parsing fails, the response is likely HTML (e.g., error page)
                throw new Error("Server returned an invalid response. Please try again later.");
            }
            if (!response.ok) {
                throw new Error(data.error || "Failed to resend verification email");
            }
            // Show success notification
            toast.success("Verification email sent", {
                description: data.message || "If an account with that email exists and is not verified, a verification link has been sent.",
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to resend verification email. Please try again.";
            // Show error notification
            toast.error("Failed to resend verification email", {
                description: errorMessage,
            });
            // Set error state
            setErrors({
                submit: errorMessage,
            });
        }
        finally {
            setIsSubmitting(false);
        }
    }, [values, dataClient]);
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

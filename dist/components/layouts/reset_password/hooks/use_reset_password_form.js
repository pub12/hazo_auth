// file_description: encapsulate reset password form state, validation, and data interactions
// section: imports
import { useCallback, useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { RESET_PASSWORD_FIELD_IDS } from "../config/reset_password_field_config.js";
import { validatePassword } from "../../shared/utils/validation.js";
import { useHazoAuthConfig } from "../../../../contexts/hazo_auth_provider.js";
// section: constants
const PASSWORD_FIELDS = [
    RESET_PASSWORD_FIELD_IDS.PASSWORD,
    RESET_PASSWORD_FIELD_IDS.CONFIRM_PASSWORD,
];
// section: helpers
const buildInitialValues = () => ({
    [RESET_PASSWORD_FIELD_IDS.PASSWORD]: "",
    [RESET_PASSWORD_FIELD_IDS.CONFIRM_PASSWORD]: "",
});
// section: hook
export const use_reset_password_form = ({ passwordRequirements, dataClient, loginPath = "/hazo_auth/login", }) => {
    const { apiBasePath } = useHazoAuthConfig();
    const router = useRouter();
    const searchParams = useSearchParams();
    const tokenParam = searchParams.get("token");
    const [values, setValues] = useState(buildInitialValues);
    const [errors, setErrors] = useState({});
    const [passwordVisibility, setPasswordVisibility] = useState({
        password: false,
        confirm_password: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [token, setToken] = useState(tokenParam);
    const [isValidatingToken, setIsValidatingToken] = useState(false);
    const [tokenError, setTokenError] = useState(null);
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
                const response = await fetch(`${apiBasePath}/validate_reset_token?token=${encodeURIComponent(tokenParam)}`, {
                    method: "GET",
                });
                const data = await response.json();
                if (!response.ok || !data.success) {
                    const errorMessage = data.error || "Reset password link invalid or has expired. Please go to Reset Password page to get a new link.";
                    setTokenError(errorMessage);
                    setToken(null);
                }
                else {
                    // Token is valid
                    setToken(tokenParam);
                    setTokenError(null);
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : "An error occurred while validating the token";
                setTokenError("Reset password link invalid or has expired. Please go to Reset Password page to get a new link.");
                setToken(null);
            }
            finally {
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
    const handleFieldChange = useCallback((fieldId, value) => {
        setValues((prev) => (Object.assign(Object.assign({}, prev), { [fieldId]: value })));
        // Clear error for this field when user starts typing
        if (errors[fieldId]) {
            setErrors((prev) => {
                const next = Object.assign({}, prev);
                delete next[fieldId];
                return next;
            });
        }
        // Validate password fields in real-time
        if (fieldId === RESET_PASSWORD_FIELD_IDS.PASSWORD) {
            const passwordError = validatePassword(value, passwordRequirements);
            if (passwordError) {
                setErrors((prev) => (Object.assign(Object.assign({}, prev), { [RESET_PASSWORD_FIELD_IDS.PASSWORD]: passwordError })));
            }
            else {
                setErrors((prev) => {
                    const next = Object.assign({}, prev);
                    delete next[RESET_PASSWORD_FIELD_IDS.PASSWORD];
                    return next;
                });
            }
            // Also validate confirm password if it has a value
            if (values[RESET_PASSWORD_FIELD_IDS.CONFIRM_PASSWORD]) {
                if (value !== values[RESET_PASSWORD_FIELD_IDS.CONFIRM_PASSWORD]) {
                    setErrors((prev) => (Object.assign(Object.assign({}, prev), { [RESET_PASSWORD_FIELD_IDS.CONFIRM_PASSWORD]: "Passwords do not match" })));
                }
                else {
                    setErrors((prev) => {
                        const next = Object.assign({}, prev);
                        delete next[RESET_PASSWORD_FIELD_IDS.CONFIRM_PASSWORD];
                        return next;
                    });
                }
            }
        }
        else if (fieldId === RESET_PASSWORD_FIELD_IDS.CONFIRM_PASSWORD) {
            if (value !== values[RESET_PASSWORD_FIELD_IDS.PASSWORD]) {
                setErrors((prev) => (Object.assign(Object.assign({}, prev), { [RESET_PASSWORD_FIELD_IDS.CONFIRM_PASSWORD]: "Passwords do not match" })));
            }
            else {
                setErrors((prev) => {
                    const next = Object.assign({}, prev);
                    delete next[RESET_PASSWORD_FIELD_IDS.CONFIRM_PASSWORD];
                    return next;
                });
            }
        }
    }, [errors, passwordRequirements, values]);
    const togglePasswordVisibility = useCallback((fieldId) => {
        setPasswordVisibility((prev) => (Object.assign(Object.assign({}, prev), { [fieldId]: !prev[fieldId] })));
    }, []);
    const handleSubmit = useCallback(async (event) => {
        event.preventDefault();
        if (!token) {
            toast.error("Reset token is missing");
            return;
        }
        // Validate all fields
        const passwordError = validatePassword(values[RESET_PASSWORD_FIELD_IDS.PASSWORD], passwordRequirements);
        const confirmPasswordError = values[RESET_PASSWORD_FIELD_IDS.PASSWORD] !== values[RESET_PASSWORD_FIELD_IDS.CONFIRM_PASSWORD]
            ? "Passwords do not match"
            : undefined;
        if (passwordError || confirmPasswordError) {
            setErrors(Object.assign(Object.assign({}, (passwordError ? { [RESET_PASSWORD_FIELD_IDS.PASSWORD]: passwordError } : {})), (confirmPasswordError ? { [RESET_PASSWORD_FIELD_IDS.CONFIRM_PASSWORD]: confirmPasswordError } : {})));
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await fetch(`${apiBasePath}/reset_password`, {
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
        }
        catch (error) {
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

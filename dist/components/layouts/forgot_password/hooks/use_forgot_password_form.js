// file_description: encapsulate forgot password form state, validation, and data interactions
// section: imports
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { FORGOT_PASSWORD_FIELD_IDS } from "../config/forgot_password_field_config";
import { validateEmail } from "../../shared/utils/validation";
import { useHazoAuthConfig } from "../../../../contexts/hazo_auth_provider";
// section: helpers
const buildInitialValues = () => ({
    [FORGOT_PASSWORD_FIELD_IDS.EMAIL]: "",
});
// section: hook
export const use_forgot_password_form = ({ dataClient, }) => {
    const { apiBasePath } = useHazoAuthConfig();
    const [values, setValues] = useState(buildInitialValues);
    const [errors, setErrors] = useState({});
    const [emailTouched, setEmailTouched] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isSubmitDisabled = useMemo(() => {
        if (isSubmitting) {
            return true;
        }
        const hasEmptyField = Object.values(values).some((fieldValue) => fieldValue.trim() === "");
        const hasErrors = Object.keys(errors).length > 0;
        return hasEmptyField || hasErrors;
    }, [errors, values, isSubmitting]);
    const handleFieldChange = useCallback((fieldId, value) => {
        setValues((previousValues) => {
            const nextValues = Object.assign(Object.assign({}, previousValues), { [fieldId]: value });
            setErrors((previousErrors) => {
                const updatedErrors = Object.assign({}, previousErrors);
                // Only validate email on change if it has been touched (blurred)
                if (fieldId === FORGOT_PASSWORD_FIELD_IDS.EMAIL && emailTouched) {
                    const emailError = validateEmail(value);
                    if (emailError) {
                        updatedErrors[FORGOT_PASSWORD_FIELD_IDS.EMAIL] = emailError;
                    }
                    else {
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
            const updatedErrors = Object.assign({}, previousErrors);
            const emailValue = values[FORGOT_PASSWORD_FIELD_IDS.EMAIL];
            const emailError = validateEmail(emailValue);
            if (emailError) {
                updatedErrors[FORGOT_PASSWORD_FIELD_IDS.EMAIL] = emailError;
            }
            else {
                delete updatedErrors[FORGOT_PASSWORD_FIELD_IDS.EMAIL];
            }
            return updatedErrors;
        });
    }, [values]);
    const handleSubmit = useCallback(async (event) => {
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
            const response = await fetch(`${apiBasePath}/forgot_password`, {
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Password reset request failed. Please try again.";
            // Show error notification
            toast.error("Password reset failed", {
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

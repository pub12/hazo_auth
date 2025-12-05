// file_description: encapsulate login form state, validation, data interactions, IP collection, and login attempt logging
// section: imports
import { useCallback, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LOGIN_FIELD_IDS } from "../config/login_field_config";
import { validateEmail } from "../../shared/utils/validation";
import { get_client_ip } from "../../shared/utils/ip_address";
import { trigger_auth_status_refresh } from "../../shared/hooks/use_auth_status";
import { useHazoAuthConfig } from "../../../../contexts/hazo_auth_provider";
// section: helpers
const buildInitialValues = () => ({
    [LOGIN_FIELD_IDS.EMAIL]: "",
    [LOGIN_FIELD_IDS.PASSWORD]: "",
});
const get_filename = () => {
    return "use_login_form.ts";
};
const get_line_number = () => {
    // This is a placeholder - in a real implementation, you might use Error stack trace
    return 0;
};
// section: hook
export const use_login_form = ({ dataClient, logger, redirectRoute, successMessage = "Successfully logged in", urlOnLogon, }) => {
    const router = useRouter();
    const { apiBasePath } = useHazoAuthConfig();
    const [values, setValues] = useState(buildInitialValues);
    const [errors, setErrors] = useState({});
    const [passwordVisibility, setPasswordVisibility] = useState({
        password: false,
    });
    const [clientIp, setClientIp] = useState("unknown");
    const [emailTouched, setEmailTouched] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    // section: ip_collection
    useEffect(() => {
        let isMounted = true;
        void get_client_ip().then((ip) => {
            if (isMounted) {
                setClientIp(ip);
            }
        });
        return () => {
            isMounted = false;
        };
    }, []);
    const isSubmitDisabled = useMemo(() => {
        const allFieldsEmpty = Object.values(values).every((fieldValue) => fieldValue.trim() === "");
        return allFieldsEmpty;
    }, [values]);
    const togglePasswordVisibility = useCallback(() => {
        setPasswordVisibility((previous) => ({
            password: !previous.password,
        }));
    }, []);
    const handleFieldChange = useCallback((fieldId, value) => {
        setValues((previousValues) => {
            const nextValues = Object.assign(Object.assign({}, previousValues), { [fieldId]: value });
            setErrors((previousErrors) => {
                const updatedErrors = Object.assign({}, previousErrors);
                // Only validate email on change if it has been touched (blurred)
                if (fieldId === LOGIN_FIELD_IDS.EMAIL && emailTouched) {
                    const emailError = validateEmail(value);
                    if (emailError) {
                        updatedErrors[LOGIN_FIELD_IDS.EMAIL] = emailError;
                    }
                    else {
                        delete updatedErrors[LOGIN_FIELD_IDS.EMAIL];
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
            const emailValue = values[LOGIN_FIELD_IDS.EMAIL];
            const emailError = validateEmail(emailValue);
            if (emailError) {
                updatedErrors[LOGIN_FIELD_IDS.EMAIL] = emailError;
            }
            else {
                delete updatedErrors[LOGIN_FIELD_IDS.EMAIL];
            }
            return updatedErrors;
        });
    }, [values]);
    // section: login_attempt_logging
    const log_login_attempt = useCallback((success, errorMessage) => {
        if (!logger) {
            return;
        }
        const timestamp = new Date().toISOString();
        const logData = Object.assign({ filename: get_filename(), line_number: get_line_number(), email: values[LOGIN_FIELD_IDS.EMAIL], ip_address: clientIp, timestamp,
            success }, (errorMessage ? { error_message: errorMessage } : {}));
        if (success) {
            logger.info("login_attempt_successful", logData);
        }
        else {
            logger.error("login_attempt_failed", logData);
        }
    }, [logger, values, clientIp]);
    const handleSubmit = useCallback(async (event) => {
        event.preventDefault();
        const email = values[LOGIN_FIELD_IDS.EMAIL];
        const password = values[LOGIN_FIELD_IDS.PASSWORD];
        try {
            // Update IP address if still unknown
            const currentIp = clientIp === "unknown" ? await get_client_ip() : clientIp;
            setClientIp(currentIp);
            // Attempt login via API route
            const response = await fetch(`${apiBasePath}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                    url_on_logon: urlOnLogon,
                }),
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
                // Check if email is not verified
                if (data.email_not_verified) {
                    // Redirect to verify_email page with email and message
                    const emailParam = encodeURIComponent(email);
                    const messageParam = encodeURIComponent("Your email address has not been verified. Please verify your email to continue.");
                    router.push(`/hazo_auth/verify_email?email=${emailParam}&message=${messageParam}`);
                    return;
                }
                // Login failed for other reasons
                const errorMessage = data.error || "Login failed. Please try again.";
                // Log failed login attempt
                log_login_attempt(false, errorMessage);
                // Set error state (remain on same page)
                setErrors({
                    [LOGIN_FIELD_IDS.EMAIL]: errorMessage,
                });
                setIsSuccess(false);
                return;
            }
            // Login successful
            // Log successful login attempt
            log_login_attempt(true);
            // Trigger auth status refresh in all components (navbar, sidebar, etc.)
            trigger_auth_status_refresh();
            // Refresh the page to update authentication state (cookies are set server-side)
            router.refresh();
            // Use redirectUrl from server response if available, otherwise fall back to redirectRoute prop
            // The server logic already prioritizes: query param > stored DB value > config > default "/"
            const finalRedirectUrl = data.redirectUrl || redirectRoute;
            if (finalRedirectUrl) {
                router.push(finalRedirectUrl);
            }
            else {
                // Otherwise, show success message
                setIsSuccess(true);
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            // Log failed login attempt
            log_login_attempt(false, errorMessage);
            // Set error state (remain on same page)
            setErrors({
                [LOGIN_FIELD_IDS.EMAIL]: errorMessage,
            });
            setIsSuccess(false);
        }
    }, [values, clientIp, log_login_attempt, redirectRoute, router, urlOnLogon]);
    const handleCancel = useCallback(() => {
        setValues(buildInitialValues());
        setErrors({});
        setPasswordVisibility({
            password: false,
        });
        setEmailTouched(false);
        setIsSuccess(false);
    }, []);
    return {
        values,
        errors,
        passwordVisibility,
        isSubmitDisabled,
        emailTouched,
        isSuccess,
        handleFieldChange,
        handleEmailBlur,
        togglePasswordVisibility,
        handleSubmit,
        handleCancel,
    };
};

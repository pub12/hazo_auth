// file_description: hook for managing create firm form state and submission
"use client";
// section: imports
import { useState, useCallback } from "react";
// section: hook
export function use_create_firm_form(options = {}) {
    const { default_org_structure = "Headquarters", onSuccess, redirectRoute = "/", apiBasePath = "/api/hazo_auth", logger, } = options;
    const [values, setValues] = useState({
        firm_name: "",
        org_structure: default_org_structure,
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const handleFieldChange = useCallback((field, value) => {
        setValues((prev) => (Object.assign(Object.assign({}, prev), { [field]: value })));
        // Clear field error when user starts typing
        setErrors((prev) => (Object.assign(Object.assign({}, prev), { [field]: undefined })));
    }, []);
    const validateForm = useCallback(() => {
        const newErrors = {};
        if (!values.firm_name.trim()) {
            newErrors.firm_name = "Firm name is required";
        }
        else if (values.firm_name.length > 100) {
            newErrors.firm_name = "Firm name must be 100 characters or less";
        }
        if (!values.org_structure.trim()) {
            newErrors.org_structure = "Organisation structure is required";
        }
        else if (values.org_structure.length > 50) {
            newErrors.org_structure = "Organisation structure must be 50 characters or less";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [values]);
    const handleSubmit = useCallback(async (e) => {
        var _a, _b;
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
                logger === null || logger === void 0 ? void 0 : logger.error("create_firm_form_error", {
                    error: data.error,
                    status: response.status,
                });
                return;
            }
            setIsSuccess(true);
            logger === null || logger === void 0 ? void 0 : logger.info("create_firm_form_success", {
                scope_id: (_a = data.scope) === null || _a === void 0 ? void 0 : _a.id,
            });
            // Call onSuccess callback if provided
            if (onSuccess && ((_b = data.scope) === null || _b === void 0 ? void 0 : _b.id)) {
                onSuccess(data.scope.id);
            }
            // Redirect after a brief delay to show success
            setTimeout(() => {
                window.location.href = redirectRoute;
            }, 1500);
        }
        catch (error) {
            const error_message = error instanceof Error ? error.message : "Unknown error";
            setErrors({ form: "An unexpected error occurred. Please try again." });
            logger === null || logger === void 0 ? void 0 : logger.error("create_firm_form_error", {
                error: error_message,
            });
        }
        finally {
            setIsSubmitting(false);
        }
    }, [values, validateForm, onSuccess, redirectRoute, apiBasePath, logger]);
    const isSubmitDisabled = isSubmitting || !values.firm_name.trim() || !values.org_structure.trim();
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

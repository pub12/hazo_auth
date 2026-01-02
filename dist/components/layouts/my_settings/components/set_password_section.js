// file_description: Set password section for Google-only users to add email/password login
// section: client_directive
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// section: imports
import { useState, useCallback } from "react";
import { Button } from "../../../ui/button.js";
import { PasswordField } from "../../shared/components/password_field.js";
import { FormFieldWrapper } from "../../shared/components/form_field_wrapper.js";
import { toast } from "sonner";
import { useHazoAuthConfig } from "../../../../contexts/hazo_auth_provider.js";
// section: component
/**
 * Set Password Section for My Settings
 * Allows Google-only users to set a password for email/password login
 * Only shown when user has no password set (Google-only account)
 */
export function SetPasswordSection({ passwordRequirements, onPasswordSet, heading = "Set Password", description = "Add a password to your account to enable email/password login in addition to Google sign-in.", newPasswordLabel = "New Password", confirmPasswordLabel = "Confirm Password", submitButtonLabel = "Set Password", parentLoading = false, }) {
    const { apiBasePath } = useHazoAuthConfig();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [newPasswordVisible, setNewPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    /**
     * Validates password against requirements
     */
    const validatePassword = useCallback((password) => {
        if (!password || password.length < passwordRequirements.minimum_length) {
            return `Password must be at least ${passwordRequirements.minimum_length} characters long`;
        }
        const missingRequirements = [];
        if (passwordRequirements.require_uppercase && !/[A-Z]/.test(password)) {
            missingRequirements.push("uppercase letter");
        }
        if (passwordRequirements.require_lowercase && !/[a-z]/.test(password)) {
            missingRequirements.push("lowercase letter");
        }
        if (passwordRequirements.require_number && !/[0-9]/.test(password)) {
            missingRequirements.push("number");
        }
        if (passwordRequirements.require_special &&
            !/[^A-Za-z0-9]/.test(password)) {
            missingRequirements.push("special character");
        }
        if (missingRequirements.length > 0) {
            return `Password must contain at least one: ${missingRequirements.join(", ")}`;
        }
        return null;
    }, [passwordRequirements]);
    /**
     * Validates the form before submission
     */
    const validateForm = useCallback(() => {
        const newErrors = {};
        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            newErrors.newPassword = passwordError;
        }
        if (!confirmPassword) {
            newErrors.confirmPassword = "Please confirm your new password";
        }
        else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [newPassword, confirmPassword, validatePassword]);
    /**
     * Handles form submission
     */
    const handleSubmit = useCallback(async () => {
        if (!validateForm()) {
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${apiBasePath}/set_password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    new_password: newPassword,
                }),
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
                const errorMessage = data.error || "Failed to set password";
                toast.error(errorMessage);
                return;
            }
            toast.success("Password set successfully! You can now sign in with your email and password.");
            // Reset form
            setNewPassword("");
            setConfirmPassword("");
            setErrors({});
            // Notify parent
            onPasswordSet === null || onPasswordSet === void 0 ? void 0 : onPasswordSet();
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to set password";
            toast.error(errorMessage);
        }
        finally {
            setLoading(false);
        }
    }, [validateForm, newPassword, apiBasePath, onPasswordSet]);
    /**
     * Handles new password field change
     */
    const handleNewPasswordChange = useCallback((value) => {
        setNewPassword(value);
        setErrors((prev) => (Object.assign(Object.assign({}, prev), { newPassword: undefined })));
    }, []);
    /**
     * Handles confirm password field change
     */
    const handleConfirmPasswordChange = useCallback((value) => {
        setConfirmPassword(value);
        setErrors((prev) => (Object.assign(Object.assign({}, prev), { confirmPassword: undefined })));
    }, []);
    const isSubmitDisabled = loading || parentLoading || !newPassword || !confirmPassword;
    return (_jsxs("div", { className: "cls_my_settings_set_password_section bg-white rounded-lg border border-[var(--hazo-border)] p-6", children: [_jsx("h2", { className: "cls_my_settings_section_heading text-lg font-semibold text-[var(--hazo-text-primary)] mb-2", children: heading }), _jsx("p", { className: "cls_set_password_description text-sm text-[var(--hazo-text-muted)] mb-4", children: description }), _jsxs("div", { className: "cls_set_password_fields flex flex-col gap-4", children: [_jsxs("div", { className: "cls_set_password_fields_row grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx(FormFieldWrapper, { fieldId: "set-new-password", label: newPasswordLabel, input: _jsx(PasswordField, { inputId: "set-new-password", ariaLabel: newPasswordLabel, value: newPassword, placeholder: "Enter your new password", autoComplete: "new-password", isVisible: newPasswordVisible, onChange: handleNewPasswordChange, onToggleVisibility: () => setNewPasswordVisible(!newPasswordVisible), errorMessage: errors.newPassword }) }), _jsx(FormFieldWrapper, { fieldId: "set-confirm-password", label: confirmPasswordLabel, input: _jsx(PasswordField, { inputId: "set-confirm-password", ariaLabel: confirmPasswordLabel, value: confirmPassword, placeholder: "Confirm your new password", autoComplete: "new-password", isVisible: confirmPasswordVisible, onChange: handleConfirmPasswordChange, onToggleVisibility: () => setConfirmPasswordVisible(!confirmPasswordVisible), errorMessage: errors.confirmPassword }) })] }), _jsx("div", { className: "cls_set_password_actions flex justify-end", children: _jsx(Button, { type: "button", onClick: handleSubmit, disabled: isSubmitDisabled, className: "cls_set_password_submit_button", "aria-label": submitButtonLabel, children: loading ? "Setting password..." : submitButtonLabel }) })] })] }));
}

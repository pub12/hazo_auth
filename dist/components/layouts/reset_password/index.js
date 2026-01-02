// file_description: reset password layout component built atop shared layout utilities
// section: client_directive
"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// section: imports
import { PasswordField } from "../shared/components/password_field.js";
import { FormFieldWrapper } from "../shared/components/form_field_wrapper.js";
import { FormHeader } from "../shared/components/form_header.js";
import { FormActionButtons } from "../shared/components/form_action_buttons.js";
import { TwoColumnAuthLayout } from "../shared/components/two_column_auth_layout.js";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { AlreadyLoggedInGuard } from "../shared/components/already_logged_in_guard.js";
import { RESET_PASSWORD_FIELD_IDS, createResetPasswordFieldDefinitions, resolveResetPasswordButtonPalette, resolveResetPasswordLabels, resolveResetPasswordPasswordRequirements, } from "./config/reset_password_field_config.js";
import { use_reset_password_form, } from "./hooks/use_reset_password_form.js";
import Link from "next/link";
const ORDERED_FIELDS = [
    RESET_PASSWORD_FIELD_IDS.PASSWORD,
    RESET_PASSWORD_FIELD_IDS.CONFIRM_PASSWORD,
];
// section: component
export default function reset_password_layout({ image_src, image_alt, image_background_color = "#f1f5f9", field_overrides, labels, button_colors, password_requirements, data_client, alreadyLoggedInMessage, showLogoutButton = true, showReturnHomeButton = false, returnHomeButtonLabel = "Return home", returnHomePath = "/", errorMessage = "Reset password link invalid or has expired. Please go to Reset Password page to get a new link.", successMessage = "Password reset successfully. Redirecting to login...", loginPath = "/hazo_auth/login", forgotPasswordPath = "/hazo_auth/forgot_password", }) {
    const fieldDefinitions = createResetPasswordFieldDefinitions(field_overrides);
    const resolvedLabels = resolveResetPasswordLabels(labels);
    const resolvedButtonPalette = resolveResetPasswordButtonPalette(button_colors);
    const resolvedPasswordRequirements = resolveResetPasswordPasswordRequirements(password_requirements);
    const form = use_reset_password_form({
        passwordRequirements: resolvedPasswordRequirements,
        dataClient: data_client,
        loginPath,
    });
    const renderFields = (formState) => {
        return ORDERED_FIELDS.map((fieldId) => {
            const fieldDefinition = fieldDefinitions[fieldId];
            const fieldValue = formState.values[fieldId];
            const fieldError = formState.errors[fieldId];
            const inputElement = (_jsx(PasswordField, { inputId: fieldDefinition.id, ariaLabel: fieldDefinition.ariaLabel, value: fieldValue, placeholder: fieldDefinition.placeholder, autoComplete: fieldDefinition.autoComplete, isVisible: formState.passwordVisibility[fieldDefinition.id], onChange: (nextValue) => formState.handleFieldChange(fieldId, nextValue), onToggleVisibility: () => formState.togglePasswordVisibility(fieldDefinition.id), errorMessage: fieldError }));
            return (_jsx(FormFieldWrapper, { fieldId: fieldDefinition.id, label: fieldDefinition.label, input: inputElement, errorMessage: fieldError }, fieldId));
        });
    };
    // Show success message if password reset was successful
    if (form.isSuccess) {
        return (_jsx(AlreadyLoggedInGuard, { image_src: image_src, image_alt: image_alt, image_background_color: image_background_color, message: alreadyLoggedInMessage, showLogoutButton: showLogoutButton, showReturnHomeButton: showReturnHomeButton, returnHomeButtonLabel: returnHomeButtonLabel, returnHomePath: returnHomePath, children: _jsx(TwoColumnAuthLayout, { imageSrc: image_src, imageAlt: image_alt, imageBackgroundColor: image_background_color, formContent: _jsxs(_Fragment, { children: [_jsx(FormHeader, { heading: resolvedLabels.heading, subHeading: resolvedLabels.subHeading }), _jsxs("div", { className: "cls_reset_password_layout_success flex flex-col items-center justify-center gap-4 p-8 text-center", children: [_jsx(CheckCircle, { className: "cls_reset_password_layout_success_icon h-16 w-16 text-green-600", "aria-hidden": "true" }), _jsx("p", { className: "cls_reset_password_layout_success_message text-lg font-medium text-slate-900", children: successMessage })] })] }) }) }));
    }
    // Show loading state while validating token
    if (form.isValidatingToken) {
        return (_jsx(AlreadyLoggedInGuard, { image_src: image_src, image_alt: image_alt, image_background_color: image_background_color, message: alreadyLoggedInMessage, showLogoutButton: showLogoutButton, showReturnHomeButton: showReturnHomeButton, returnHomeButtonLabel: returnHomeButtonLabel, returnHomePath: returnHomePath, children: _jsx(TwoColumnAuthLayout, { imageSrc: image_src, imageAlt: image_alt, imageBackgroundColor: image_background_color, formContent: _jsxs("div", { className: "cls_reset_password_layout_validating flex flex-col items-center justify-center gap-4 py-8", children: [_jsx(Loader2, { className: "h-12 w-12 animate-spin text-slate-600", "aria-hidden": "true" }), _jsxs("div", { className: "cls_reset_password_layout_validating_text text-center", children: [_jsx("h1", { className: "cls_reset_password_layout_validating_heading text-2xl font-semibold text-slate-900", children: resolvedLabels.heading }), _jsx("p", { className: "cls_reset_password_layout_validating_subheading mt-2 text-sm text-slate-600", children: "Validating reset token..." })] })] }) }) }));
    }
    // Show error message if token is invalid or missing
    if (form.tokenError || !form.token) {
        return (_jsx(AlreadyLoggedInGuard, { image_src: image_src, image_alt: image_alt, image_background_color: image_background_color, message: alreadyLoggedInMessage, showLogoutButton: showLogoutButton, showReturnHomeButton: showReturnHomeButton, returnHomeButtonLabel: returnHomeButtonLabel, returnHomePath: returnHomePath, children: _jsx(TwoColumnAuthLayout, { imageSrc: image_src, imageAlt: image_alt, imageBackgroundColor: image_background_color, formContent: _jsxs("div", { className: "cls_reset_password_layout_error flex flex-col items-center justify-center gap-4 p-8 text-center", children: [_jsx(XCircle, { className: "cls_reset_password_layout_error_icon h-16 w-16 text-red-600", "aria-hidden": "true" }), _jsxs("div", { className: "cls_reset_password_layout_error_text", children: [_jsx("h1", { className: "cls_reset_password_layout_error_heading text-2xl font-semibold text-slate-900", children: "Invalid Reset Link" }), _jsx("p", { className: "cls_reset_password_layout_error_message mt-2 text-sm text-slate-600", children: form.tokenError || errorMessage })] }), _jsx(Link, { href: forgotPasswordPath, className: "cls_reset_password_layout_forgot_password_link mt-4 text-sm text-blue-600 hover:text-blue-800 underline", children: "Go to Reset Password page" })] }) }) }));
    }
    return (_jsx(AlreadyLoggedInGuard, { image_src: image_src, image_alt: image_alt, image_background_color: image_background_color, message: alreadyLoggedInMessage, showLogoutButton: showLogoutButton, showReturnHomeButton: showReturnHomeButton, returnHomeButtonLabel: returnHomeButtonLabel, returnHomePath: returnHomePath, children: _jsx(TwoColumnAuthLayout, { imageSrc: image_src, imageAlt: image_alt, imageBackgroundColor: image_background_color, formContent: _jsxs(_Fragment, { children: [_jsx(FormHeader, { heading: resolvedLabels.heading, subHeading: resolvedLabels.subHeading }), _jsxs("form", { className: "cls_reset_password_layout_form_fields flex flex-col gap-5", onSubmit: form.handleSubmit, "aria-label": "Reset password form", children: [renderFields(form), _jsx(FormActionButtons, { submitLabel: resolvedLabels.submitButton, cancelLabel: resolvedLabels.cancelButton, buttonPalette: resolvedButtonPalette, isSubmitDisabled: form.isSubmitDisabled, onCancel: form.handleCancel, submitAriaLabel: "Submit reset password form", cancelAriaLabel: "Cancel reset password form" }), form.isSubmitting && (_jsx("div", { className: "cls_reset_password_layout_submitting_indicator text-sm text-slate-600 text-center", children: "Resetting password..." }))] })] }) }) }));
}

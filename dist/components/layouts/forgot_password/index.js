// file_description: forgot password layout component built atop shared layout utilities
// section: client_directive
"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// section: imports
import { Input } from "../../ui/input";
import { FormFieldWrapper } from "../shared/components/form_field_wrapper";
import { FormHeader } from "../shared/components/form_header";
import { FormActionButtons } from "../shared/components/form_action_buttons";
import { TwoColumnAuthLayout } from "../shared/components/two_column_auth_layout";
import { AlreadyLoggedInGuard } from "../shared/components/already_logged_in_guard";
import { GoogleSignInButton } from "../shared/components/google_sign_in_button";
import { FORGOT_PASSWORD_FIELD_IDS, createForgotPasswordFieldDefinitions, resolveForgotPasswordButtonPalette, resolveForgotPasswordLabels, } from "./config/forgot_password_field_config";
import { use_forgot_password_form, } from "./hooks/use_forgot_password_form";
import Link from "next/link";
const ORDERED_FIELDS = [
    FORGOT_PASSWORD_FIELD_IDS.EMAIL,
];
// section: component
export default function forgot_password_layout({ image_src, image_alt, image_background_color = "#f1f5f9", field_overrides, labels, button_colors, data_client, sign_in_path = "/hazo_auth/login", sign_in_label = "Sign in", alreadyLoggedInMessage = "You are already logged in", showLogoutButton = true, showReturnHomeButton = false, returnHomeButtonLabel = "Return home", returnHomePath = "/", googleOnlyAccountHeading = "Google Account Detected", googleOnlyAccountMessage = "Your account was created using Google Sign-In and doesn't have a password set.", googleOnlyAccountHelpText = "Sign in with Google, then set a password in your account settings if you'd like to use email/password login.", mySettingsPath = "/hazo_auth/my_settings", mySettingsLabel = "Go to Settings", }) {
    const fieldDefinitions = createForgotPasswordFieldDefinitions(field_overrides);
    const resolvedLabels = resolveForgotPasswordLabels(labels);
    const resolvedButtonPalette = resolveForgotPasswordButtonPalette(button_colors);
    const form = use_forgot_password_form({
        dataClient: data_client,
    });
    const renderFields = (formState) => {
        return ORDERED_FIELDS.map((fieldId) => {
            const fieldDefinition = fieldDefinitions[fieldId];
            const fieldValue = formState.values[fieldId];
            const fieldError = formState.errors[fieldId];
            const inputElement = (_jsx(Input, { id: fieldDefinition.id, type: fieldDefinition.type, value: fieldValue, onChange: (event) => formState.handleFieldChange(fieldId, event.target.value), onBlur: fieldId === FORGOT_PASSWORD_FIELD_IDS.EMAIL
                    ? formState.handleEmailBlur
                    : undefined, autoComplete: fieldDefinition.autoComplete, placeholder: fieldDefinition.placeholder, "aria-label": fieldDefinition.ariaLabel, className: "cls_forgot_password_layout_field_input" }));
            // Only show email error if field has been touched (blurred)
            const shouldShowError = fieldId === FORGOT_PASSWORD_FIELD_IDS.EMAIL
                ? formState.emailTouched && fieldError
                    ? fieldError
                    : undefined
                : fieldError;
            return (_jsx(FormFieldWrapper, { fieldId: fieldDefinition.id, label: fieldDefinition.label, input: inputElement, errorMessage: shouldShowError }, fieldId));
        });
    };
    return (_jsx(AlreadyLoggedInGuard, { image_src: image_src, image_alt: image_alt, image_background_color: image_background_color, message: alreadyLoggedInMessage, showLogoutButton: showLogoutButton, showReturnHomeButton: showReturnHomeButton, returnHomeButtonLabel: returnHomeButtonLabel, returnHomePath: returnHomePath, children: _jsx(TwoColumnAuthLayout, { imageSrc: image_src, imageAlt: image_alt, imageBackgroundColor: image_background_color, formContent: _jsx(_Fragment, { children: form.isGoogleOnlyAccount ? (
                /* Google-only account message */
                _jsxs("div", { className: "cls_forgot_password_google_only flex flex-col gap-5", children: [_jsx(FormHeader, { heading: googleOnlyAccountHeading, subHeading: googleOnlyAccountMessage }), _jsx("p", { className: "cls_forgot_password_google_only_help text-sm text-slate-600", children: googleOnlyAccountHelpText }), _jsxs("div", { className: "cls_forgot_password_google_only_actions flex flex-col gap-3", children: [_jsx(GoogleSignInButton, { label: "Sign in with Google" }), _jsx(Link, { href: mySettingsPath, className: "cls_forgot_password_settings_link text-center text-sm font-medium text-slate-700 hover:text-slate-900 hover:underline", children: mySettingsLabel })] }), _jsx("div", { className: "cls_forgot_password_sign_in_link mt-2 text-center text-sm text-slate-600", children: _jsxs(Link, { href: sign_in_path, className: "font-medium text-slate-900 hover:underline", children: ["Back to ", sign_in_label] }) })] })) : (
                /* Normal forgot password form */
                _jsxs(_Fragment, { children: [_jsx(FormHeader, { heading: resolvedLabels.heading, subHeading: resolvedLabels.subHeading }), _jsxs("form", { className: "cls_forgot_password_layout_form_fields flex flex-col gap-5", onSubmit: form.handleSubmit, "aria-label": "Forgot password form", children: [renderFields(form), _jsx(FormActionButtons, { submitLabel: resolvedLabels.submitButton, cancelLabel: resolvedLabels.cancelButton, buttonPalette: resolvedButtonPalette, isSubmitDisabled: form.isSubmitDisabled, onCancel: form.handleCancel, submitAriaLabel: "Submit forgot password form", cancelAriaLabel: "Cancel forgot password form" }), form.isSubmitting && (_jsx("div", { className: "cls_forgot_password_submitting_indicator text-sm text-slate-600 text-center", children: "Sending reset link..." }))] }), _jsxs("div", { className: "cls_forgot_password_sign_in_link mt-4 text-center text-sm text-slate-600", children: ["Remember your password?", " ", _jsx(Link, { href: sign_in_path, className: "font-medium text-slate-900 hover:underline", children: sign_in_label })] })] })) }) }) }));
}

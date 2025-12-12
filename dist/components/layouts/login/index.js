// file_description: login layout component built atop shared layout utilities
// section: client_directive
"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// section: imports
import Link from "next/link";
import { Input } from "../../ui/input";
import { PasswordField } from "../shared/components/password_field";
import { FormFieldWrapper } from "../shared/components/form_field_wrapper";
import { FormHeader } from "../shared/components/form_header";
import { FormActionButtons } from "../shared/components/form_action_buttons";
import { TwoColumnAuthLayout } from "../shared/components/two_column_auth_layout";
import { CheckCircle } from "lucide-react";
import { AlreadyLoggedInGuard } from "../shared/components/already_logged_in_guard";
import { GoogleSignInButton } from "../shared/components/google_sign_in_button";
import { OAuthDivider } from "../shared/components/oauth_divider";
import { LOGIN_FIELD_IDS, createLoginFieldDefinitions, resolveLoginButtonPalette, resolveLoginLabels, } from "./config/login_field_config";
import { use_login_form, } from "./hooks/use_login_form";
const ORDERED_FIELDS = [
    LOGIN_FIELD_IDS.EMAIL,
    LOGIN_FIELD_IDS.PASSWORD,
];
// section: component
export default function login_layout({ image_src, image_alt, image_background_color = "#f1f5f9", field_overrides, labels, button_colors, data_client, logger, redirectRoute, successMessage = "Successfully logged in", alreadyLoggedInMessage = "You are already logged in", showLogoutButton = true, showReturnHomeButton = false, returnHomeButtonLabel = "Return home", returnHomePath = "/", forgot_password_path = "/hazo_auth/forgot_password", forgot_password_label = "Forgot password?", create_account_path = "/hazo_auth/register", create_account_label = "Create account", urlOnLogon, oauth, }) {
    // Default OAuth config: both enabled
    const oauthConfig = oauth || {
        enable_google: true,
        enable_email_password: true,
        google_button_text: "Continue with Google",
        oauth_divider_text: "or continue with email",
    };
    const fieldDefinitions = createLoginFieldDefinitions(field_overrides);
    const resolvedLabels = resolveLoginLabels(labels);
    const resolvedButtonPalette = resolveLoginButtonPalette(button_colors);
    const form = use_login_form({
        dataClient: data_client,
        logger,
        redirectRoute,
        successMessage,
        urlOnLogon: urlOnLogon,
    });
    const renderFields = (formState) => {
        return ORDERED_FIELDS.map((fieldId) => {
            const fieldDefinition = fieldDefinitions[fieldId];
            const fieldValue = formState.values[fieldId];
            const fieldError = formState.errors[fieldId];
            const isPasswordField = fieldDefinition.type === "password";
            const inputElement = isPasswordField ? (_jsx(PasswordField, { inputId: fieldDefinition.id, ariaLabel: fieldDefinition.ariaLabel, value: fieldValue, placeholder: fieldDefinition.placeholder, autoComplete: fieldDefinition.autoComplete, isVisible: formState.passwordVisibility.password, onChange: (nextValue) => formState.handleFieldChange(fieldId, nextValue), onToggleVisibility: formState.togglePasswordVisibility, errorMessage: fieldError })) : (_jsx(Input, { id: fieldDefinition.id, type: fieldDefinition.type, value: fieldValue, onChange: (event) => formState.handleFieldChange(fieldId, event.target.value), onBlur: fieldId === LOGIN_FIELD_IDS.EMAIL
                    ? formState.handleEmailBlur
                    : undefined, autoComplete: fieldDefinition.autoComplete, placeholder: fieldDefinition.placeholder, "aria-label": fieldDefinition.ariaLabel, className: "cls_login_layout_field_input" }));
            // Only show email error if field has been touched (blurred)
            const shouldShowError = isPasswordField
                ? undefined
                : fieldId === LOGIN_FIELD_IDS.EMAIL
                    ? formState.emailTouched && fieldError
                        ? fieldError
                        : undefined
                    : fieldError;
            return (_jsx(FormFieldWrapper, { fieldId: fieldDefinition.id, label: fieldDefinition.label, input: inputElement, errorMessage: shouldShowError }, fieldId));
        });
    };
    // Show success message if login was successful and no redirect route is provided
    if (form.isSuccess) {
        return (_jsx(TwoColumnAuthLayout, { imageSrc: image_src, imageAlt: image_alt, imageBackgroundColor: image_background_color, formContent: _jsxs(_Fragment, { children: [_jsx(FormHeader, { heading: resolvedLabels.heading, subHeading: resolvedLabels.subHeading }), _jsxs("div", { className: "cls_login_layout_success flex flex-col items-center justify-center gap-4 p-8 text-center", children: [_jsx(CheckCircle, { className: "cls_login_layout_success_icon h-16 w-16 text-green-600", "aria-hidden": "true" }), _jsx("p", { className: "cls_login_layout_success_message text-lg font-medium text-slate-900", children: successMessage })] })] }) }));
    }
    return (_jsx(AlreadyLoggedInGuard, { image_src: image_src, image_alt: image_alt, image_background_color: image_background_color, message: alreadyLoggedInMessage, showLogoutButton: showLogoutButton, showReturnHomeButton: showReturnHomeButton, returnHomeButtonLabel: returnHomeButtonLabel, returnHomePath: returnHomePath, children: _jsx(TwoColumnAuthLayout, { imageSrc: image_src, imageAlt: image_alt, imageBackgroundColor: image_background_color, formContent: _jsxs(_Fragment, { children: [_jsx(FormHeader, { heading: resolvedLabels.heading, subHeading: resolvedLabels.subHeading }), oauthConfig.enable_google && (_jsx("div", { className: "cls_login_layout_oauth_section", children: _jsx(GoogleSignInButton, { label: oauthConfig.google_button_text }) })), oauthConfig.enable_google && oauthConfig.enable_email_password && (_jsx(OAuthDivider, { text: oauthConfig.oauth_divider_text })), oauthConfig.enable_email_password && (_jsxs("form", { className: "cls_login_layout_form_fields flex flex-col gap-5", onSubmit: form.handleSubmit, "aria-label": "Login form", children: [renderFields(form), _jsx(FormActionButtons, { submitLabel: resolvedLabels.submitButton, cancelLabel: resolvedLabels.cancelButton, buttonPalette: resolvedButtonPalette, isSubmitDisabled: form.isSubmitDisabled, onCancel: form.handleCancel, submitAriaLabel: "Submit login form", cancelAriaLabel: "Cancel login form" }), _jsxs("div", { className: "cls_login_layout_support_links flex flex-col gap-1 text-sm text-muted-foreground", children: [_jsx(Link, { href: forgot_password_path, className: "cls_login_layout_forgot_password_link text-primary underline-offset-4 hover:underline", "aria-label": "Go to forgot password page", children: forgot_password_label }), _jsx(Link, { href: create_account_path, className: "cls_login_layout_create_account_link text-primary underline-offset-4 hover:underline", "aria-label": "Go to create account page", children: create_account_label })] })] })), !oauthConfig.enable_email_password && oauthConfig.enable_google && (_jsx("div", { className: "cls_login_layout_support_links mt-4 text-center text-sm text-muted-foreground", children: _jsx(Link, { href: create_account_path, className: "cls_login_layout_create_account_link text-primary underline-offset-4 hover:underline", "aria-label": "Go to create account page", children: create_account_label }) }))] }) }) }));
}

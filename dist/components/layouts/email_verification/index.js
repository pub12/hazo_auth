// file_description: email verification layout component built atop shared layout utilities
// section: client_directive
"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// section: imports
import { Input } from "../../ui/input.js";
import { Button } from "../../ui/button.js";
import { FormFieldWrapper } from "../shared/components/form_field_wrapper.js";
import { FormHeader } from "../shared/components/form_header.js";
import { FormActionButtons } from "../shared/components/form_action_buttons.js";
import { TwoColumnAuthLayout } from "../shared/components/two_column_auth_layout.js";
import { EMAIL_VERIFICATION_FIELD_IDS, createEmailVerificationFieldDefinitions, resolveEmailVerificationButtonPalette, resolveEmailVerificationLabels, EMAIL_VERIFICATION_SUCCESS_LABEL_DEFAULTS, EMAIL_VERIFICATION_ERROR_LABEL_DEFAULTS, } from "./config/email_verification_field_config.js";
import { use_email_verification, } from "./hooks/use_email_verification.js";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { AlreadyLoggedInGuard } from "../shared/components/already_logged_in_guard.js";
import Link from "next/link";
const ORDERED_FIELDS = [
    EMAIL_VERIFICATION_FIELD_IDS.EMAIL,
];
// section: component
export default function email_verification_layout({ image_src, image_alt, image_background_color = "#f1f5f9", field_overrides, labels, button_colors, success_labels, error_labels, redirect_delay = 5, login_path = "/hazo_auth/login", sign_in_label = "Sign in", data_client, already_logged_in_message, showLogoutButton = true, showReturnHomeButton = false, returnHomeButtonLabel = "Return home", returnHomePath = "/", }) {
    const fieldDefinitions = createEmailVerificationFieldDefinitions(field_overrides);
    const resolvedLabels = resolveEmailVerificationLabels(labels);
    const resolvedButtonPalette = resolveEmailVerificationButtonPalette(button_colors);
    const resolvedSuccessLabels = Object.assign(Object.assign({}, EMAIL_VERIFICATION_SUCCESS_LABEL_DEFAULTS), (success_labels !== null && success_labels !== void 0 ? success_labels : {}));
    const resolvedErrorLabels = Object.assign(Object.assign({}, EMAIL_VERIFICATION_ERROR_LABEL_DEFAULTS), (error_labels !== null && error_labels !== void 0 ? error_labels : {}));
    const verification = use_email_verification({
        dataClient: data_client,
        redirectDelay: redirect_delay,
        loginPath: login_path,
    });
    const renderFields = (formState) => {
        return ORDERED_FIELDS.map((fieldId) => {
            const fieldDefinition = fieldDefinitions[fieldId];
            const fieldValue = formState.values[fieldId];
            const fieldError = formState.errors[fieldId];
            const inputElement = (_jsx(Input, { id: fieldDefinition.id, type: fieldDefinition.type, value: fieldValue, onChange: (event) => formState.handleFieldChange(fieldId, event.target.value), onBlur: fieldId === EMAIL_VERIFICATION_FIELD_IDS.EMAIL
                    ? formState.handleEmailBlur
                    : undefined, autoComplete: fieldDefinition.autoComplete, placeholder: fieldDefinition.placeholder, "aria-label": fieldDefinition.ariaLabel, className: "cls_email_verification_layout_field_input" }));
            // Only show email error if field has been touched (blurred)
            const shouldShowError = fieldId === EMAIL_VERIFICATION_FIELD_IDS.EMAIL
                ? formState.emailTouched && fieldError
                    ? fieldError
                    : undefined
                : fieldError;
            return (_jsx(FormFieldWrapper, { fieldId: fieldDefinition.id, label: fieldDefinition.label, input: inputElement, errorMessage: shouldShowError }, fieldId));
        });
    };
    // Verifying state
    if (verification.isVerifying) {
        return (_jsx(AlreadyLoggedInGuard, { image_src: image_src, image_alt: image_alt, image_background_color: image_background_color, message: already_logged_in_message, showLogoutButton: showLogoutButton, showReturnHomeButton: showReturnHomeButton, returnHomeButtonLabel: returnHomeButtonLabel, returnHomePath: returnHomePath, requireEmailVerified: false, children: _jsx(TwoColumnAuthLayout, { imageSrc: image_src, imageAlt: image_alt, imageBackgroundColor: image_background_color, formContent: _jsxs("div", { className: "cls_email_verification_verifying flex flex-col items-center justify-center gap-4 py-8", children: [_jsx(Loader2, { className: "h-12 w-12 animate-spin text-slate-600", "aria-hidden": "true" }), _jsxs("div", { className: "cls_email_verification_verifying_text text-center", children: [_jsx("h1", { className: "cls_email_verification_verifying_heading text-2xl font-semibold text-slate-900", children: resolvedLabels.heading }), _jsx("p", { className: "cls_email_verification_verifying_subheading mt-2 text-sm text-slate-600", children: resolvedLabels.subHeading })] })] }) }) }));
    }
    // Success state
    if (verification.isVerified) {
        return (_jsx(AlreadyLoggedInGuard, { image_src: image_src, image_alt: image_alt, image_background_color: image_background_color, message: already_logged_in_message, showLogoutButton: showLogoutButton, showReturnHomeButton: showReturnHomeButton, returnHomeButtonLabel: returnHomeButtonLabel, returnHomePath: returnHomePath, requireEmailVerified: false, children: _jsx(TwoColumnAuthLayout, { imageSrc: image_src, imageAlt: image_alt, imageBackgroundColor: image_background_color, formContent: _jsxs("div", { className: "cls_email_verification_success flex flex-col gap-6", children: [_jsxs("div", { className: "cls_email_verification_success_content flex flex-col items-center gap-4 text-center", children: [_jsx(CheckCircle, { className: "h-16 w-16 text-green-600", "aria-hidden": "true" }), _jsxs("div", { className: "cls_email_verification_success_text", children: [_jsx("h1", { className: "cls_email_verification_success_heading text-2xl font-semibold text-slate-900", children: resolvedSuccessLabels.heading }), _jsx("p", { className: "cls_email_verification_success_message mt-2 text-sm text-slate-600", children: resolvedSuccessLabels.message })] }), _jsxs("div", { className: "cls_email_verification_redirect_info mt-2 text-sm text-slate-500", children: [resolvedSuccessLabels.redirectMessage, " ", verification.redirectCountdown, " seconds..."] })] }), _jsx("div", { className: "cls_email_verification_success_actions flex justify-center", children: _jsx(Button, { type: "button", onClick: verification.handleGoToLogin, className: "cls_email_verification_go_to_login_button", style: {
                                    backgroundColor: resolvedButtonPalette.submitBackground,
                                    color: resolvedButtonPalette.submitText,
                                }, children: resolvedSuccessLabels.goToLoginButton }) })] }) }) }));
    }
    // Error state with resend form
    return (_jsx(AlreadyLoggedInGuard, { image_src: image_src, image_alt: image_alt, image_background_color: image_background_color, message: already_logged_in_message, showLogoutButton: showLogoutButton, showReturnHomeButton: showReturnHomeButton, returnHomeButtonLabel: returnHomeButtonLabel, returnHomePath: returnHomePath, requireEmailVerified: false, children: _jsx(TwoColumnAuthLayout, { imageSrc: image_src, imageAlt: image_alt, imageBackgroundColor: image_background_color, formContent: _jsxs(_Fragment, { children: [_jsxs("div", { className: "cls_email_verification_error_header flex flex-col items-center gap-4 text-center", children: [_jsx(XCircle, { className: "h-12 w-12 text-red-600", "aria-hidden": "true" }), _jsxs("div", { className: "cls_email_verification_error_text", children: [_jsx("h1", { className: "cls_email_verification_error_heading text-2xl font-semibold text-slate-900", children: resolvedErrorLabels.heading }), _jsx("p", { className: "cls_email_verification_error_message mt-2 text-sm text-slate-600", children: verification.errorMessage || resolvedErrorLabels.message })] })] }), _jsxs("div", { className: "cls_email_verification_resend_form", children: [_jsx(FormHeader, { heading: resolvedErrorLabels.resendFormHeading, subHeading: "Enter your email address to receive a new verification link." }), _jsxs("form", { className: "cls_email_verification_layout_form_fields flex flex-col gap-5", onSubmit: verification.handleResendSubmit, "aria-label": "Resend verification email form", children: [renderFields(verification), _jsx(FormActionButtons, { submitLabel: resolvedLabels.submitButton, cancelLabel: resolvedLabels.cancelButton, buttonPalette: resolvedButtonPalette, isSubmitDisabled: verification.isSubmitDisabled, onCancel: verification.handleCancel, submitAriaLabel: "Submit resend verification email form", cancelAriaLabel: "Cancel resend verification email form" }), verification.isSubmitting && (_jsx("div", { className: "cls_email_verification_submitting_indicator text-sm text-slate-600 text-center", children: "Sending verification email..." }))] }), _jsxs("div", { className: "cls_email_verification_sign_in_link mt-4 text-center text-sm text-slate-600", children: ["Already verified?", " ", _jsx(Link, { href: login_path, className: "font-medium text-slate-900 hover:underline", children: sign_in_label })] })] })] }) }) }));
}

// file_description: create firm layout component for new user onboarding
// section: client_directive
"use client";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Input } from "../../ui/input.js";
import { FormFieldWrapper } from "../shared/components/form_field_wrapper.js";
import { FormHeader } from "../shared/components/form_header.js";
import { FormActionButtons } from "../shared/components/form_action_buttons.js";
import { TwoColumnAuthLayout } from "../shared/components/two_column_auth_layout.js";
import { CheckCircle, Building2 } from "lucide-react";
import { use_create_firm_form, } from "./hooks/use_create_firm_form.js";
import { useHazoAuthConfig } from "../../../contexts/hazo_auth_provider.js";
// section: component
export default function CreateFirmLayout({ image_src, image_alt = "Create your firm", image_background_color = "#f1f5f9", heading = "Create Your Firm", sub_heading = "Set up your organisation to get started", firm_name_label = "Firm Name", firm_name_placeholder = "Enter your firm name", org_structure_label = "Organisation Structure", org_structure_placeholder = "e.g., Headquarters, Head Office", default_org_structure = "Headquarters", submit_button_label = "Create Firm", success_message = "Your firm has been created successfully!", redirect_route = "/", apiBasePath, onSuccess, button_colors, logger, }) {
    const { apiBasePath: contextApiBasePath } = useHazoAuthConfig();
    const resolvedApiBasePath = apiBasePath || contextApiBasePath;
    const form = use_create_firm_form({
        default_org_structure,
        onSuccess,
        redirectRoute: redirect_route,
        apiBasePath: resolvedApiBasePath,
        logger,
    });
    const resolvedButtonPalette = {
        submitBackground: (button_colors === null || button_colors === void 0 ? void 0 : button_colors.submitBackground) || "bg-primary",
        submitText: (button_colors === null || button_colors === void 0 ? void 0 : button_colors.submitText) || "text-primary-foreground",
        cancelBorder: (button_colors === null || button_colors === void 0 ? void 0 : button_colors.cancelBorder) || "border-gray-300",
        cancelText: (button_colors === null || button_colors === void 0 ? void 0 : button_colors.cancelText) || "text-gray-700",
    };
    const renderFields = (formState) => {
        // Handler that works with both onChange and onInput events
        const handleInput = (field, e) => {
            const value = e.target.value;
            formState.handleFieldChange(field, value);
        };
        return (_jsxs(_Fragment, { children: [_jsx(FormFieldWrapper, { fieldId: "firm_name", label: firm_name_label, input: _jsx(Input, { id: "firm_name", ref: formState.firmNameRef, type: "text", value: formState.values.firm_name, onChange: (e) => handleInput("firm_name", e), onInput: (e) => handleInput("firm_name", e), placeholder: firm_name_placeholder, "aria-label": firm_name_label, className: "cls_create_firm_layout_field_input hazo-autofill-detect", autoComplete: "organization" }), errorMessage: formState.errors.firm_name }), _jsx(FormFieldWrapper, { fieldId: "org_structure", label: org_structure_label, input: _jsx(Input, { id: "org_structure", ref: formState.orgStructureRef, type: "text", value: formState.values.org_structure, onChange: (e) => handleInput("org_structure", e), onInput: (e) => handleInput("org_structure", e), placeholder: org_structure_placeholder, "aria-label": org_structure_label, className: "cls_create_firm_layout_field_input hazo-autofill-detect" }), errorMessage: formState.errors.org_structure })] }));
    };
    // Show success message after firm creation
    if (form.isSuccess) {
        return (_jsx(TwoColumnAuthLayout, { imageSrc: image_src, imageAlt: image_alt, imageBackgroundColor: image_background_color, formContent: _jsxs(_Fragment, { children: [_jsx(FormHeader, { heading: heading, subHeading: sub_heading }), _jsxs("div", { className: "cls_create_firm_layout_success flex flex-col items-center justify-center gap-4 p-8 text-center", children: [_jsx(CheckCircle, { className: "cls_create_firm_layout_success_icon h-16 w-16 text-green-600", "aria-hidden": "true" }), _jsx("p", { className: "cls_create_firm_layout_success_message text-lg font-medium text-slate-900", children: success_message }), _jsx("p", { className: "cls_create_firm_layout_redirect_message text-sm text-muted-foreground", children: "Redirecting you to the application..." })] })] }) }));
    }
    return (_jsx(TwoColumnAuthLayout, { imageSrc: image_src, imageAlt: image_alt, imageBackgroundColor: image_background_color, formContent: _jsxs(_Fragment, { children: [_jsx(FormHeader, { heading: heading, subHeading: sub_heading }), _jsxs("div", { className: "cls_create_firm_layout_info mb-6 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4", children: [_jsx(Building2, { className: "mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" }), _jsxs("div", { className: "text-sm text-blue-800", children: [_jsx("p", { className: "font-medium", children: "Welcome!" }), _jsx("p", { children: "Create your firm to start using the application. You'll become the administrator of your firm and can invite team members later." })] })] }), _jsxs("form", { className: "cls_create_firm_layout_form_fields flex flex-col gap-5", onSubmit: form.handleSubmit, "aria-label": "Create firm form", children: [renderFields(form), form.errors.form && (_jsx("div", { className: "cls_create_firm_layout_form_error rounded-md bg-red-50 p-3 text-sm text-red-600", children: form.errors.form })), _jsx(FormActionButtons, { submitLabel: submit_button_label, buttonPalette: resolvedButtonPalette, isSubmitDisabled: form.isSubmitDisabled, submitAriaLabel: "Create your firm", hideCancel: true })] })] }) }));
}
// section: exports
export { CreateFirmLayout };

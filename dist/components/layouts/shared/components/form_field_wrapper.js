import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// file_description: reusable wrapper component for form fields that standardizes label, input, and error message structure
// section: imports
import { Label } from "hazo_auth/components/ui/label";
import { FieldErrorMessage } from "hazo_auth/components/layouts/shared/components/field_error_message";
// section: component
export function FormFieldWrapper({ fieldId, label, input, errorMessage, className, labelClassName, }) {
    return (_jsxs("div", { className: `cls_form_field_wrapper flex flex-col gap-2 ${className !== null && className !== void 0 ? className : ""}`, children: [_jsx(Label, { htmlFor: fieldId, className: `cls_form_field_label text-sm font-medium text-slate-800 ${labelClassName !== null && labelClassName !== void 0 ? labelClassName : ""}`, children: label }), input, errorMessage ? (_jsx("div", { className: "mt-1 min-h-0", children: _jsx(FieldErrorMessage, { message: errorMessage }) })) : null] }));
}

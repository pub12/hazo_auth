import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// file_description: reusable form action buttons component with submit (positive, left) and cancel (negative, right) buttons
// section: imports
import { CircleCheckBig, CircleX } from "lucide-react";
import { Button } from "../../../ui/button";
// section: component
export function FormActionButtons({ submitLabel, cancelLabel, buttonPalette, isSubmitDisabled, onCancel, submitAriaLabel = "Submit form", cancelAriaLabel = "Cancel form", className, }) {
    return (_jsxs("div", { className: `cls_form_action_buttons mt-2 flex flex-wrap items-center justify-end gap-4 ${className !== null && className !== void 0 ? className : ""}`, children: [_jsxs(Button, { type: "submit", disabled: isSubmitDisabled, className: "cls_form_action_submit_button flex shrink-0 items-center gap-2", "aria-label": submitAriaLabel, style: {
                    backgroundColor: buttonPalette.submitBackground,
                    color: buttonPalette.submitText,
                }, children: [_jsx(CircleCheckBig, { className: "h-4 w-4 shrink-0", "aria-hidden": "true" }), _jsx("span", { children: submitLabel })] }), _jsxs(Button, { type: "button", variant: "outline", onClick: onCancel, className: "cls_form_action_cancel_button flex shrink-0 items-center gap-2", "aria-label": cancelAriaLabel, style: {
                    borderColor: buttonPalette.cancelBorder,
                    color: buttonPalette.cancelText,
                }, children: [_jsx(CircleX, { className: "h-4 w-4 shrink-0", "aria-hidden": "true" }), _jsx("span", { children: cancelLabel })] })] }));
}

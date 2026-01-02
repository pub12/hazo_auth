// file_description: reusable password input with visibility toggle and error messaging
// section: client_directive
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// section: imports
import { Eye, EyeOff } from "lucide-react";
import { Button } from "../../../ui/button.js";
import { Input } from "../../../ui/input.js";
import { FieldErrorMessage } from "./field_error_message.js";
// section: component
export function PasswordField({ inputId, ariaLabel, value, placeholder, autoComplete, isVisible, onChange, onToggleVisibility, errorMessage, }) {
    return (_jsxs("div", { className: "cls_password_field_wrapper", children: [_jsxs("div", { className: "cls_password_field_container relative", style: { position: "relative" }, children: [_jsx(Input, { id: inputId, type: isVisible ? "text" : "password", value: value, onChange: (event) => onChange(event.target.value), autoComplete: autoComplete, placeholder: placeholder, "aria-label": ariaLabel, className: "cls_password_field_input pr-11", style: { paddingRight: "2.75rem" } }), _jsx(Button, { type: "button", variant: "ghost", size: "icon", "aria-label": `${isVisible ? "Hide" : "Show"} ${ariaLabel.toLowerCase()}`, onClick: onToggleVisibility, className: "cls_password_field_toggle absolute inset-y-0 right-1 my-auto h-8 w-8 text-muted-foreground hover:bg-transparent hover:text-foreground", style: {
                            position: "absolute",
                            top: "50%",
                            right: "0.25rem",
                            transform: "translateY(-50%)",
                            height: "2rem",
                            width: "2rem",
                        }, children: isVisible ? (_jsx(EyeOff, { className: "h-4 w-4", "aria-hidden": "true" })) : (_jsx(Eye, { className: "h-4 w-4", "aria-hidden": "true" })) })] }), errorMessage ? (_jsx("div", { className: "mt-1 min-h-0", children: _jsx(FieldErrorMessage, { message: errorMessage }) })) : null] }));
}

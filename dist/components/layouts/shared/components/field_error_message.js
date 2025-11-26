import { jsx as _jsx } from "react/jsx-runtime";
// section: component
export function FieldErrorMessage({ message, className, }) {
    const messages = Array.isArray(message) ? message : [message];
    return (_jsx("div", { className: `cls_field_error_message flex flex-col gap-1 text-sm text-red-600 ${className !== null && className !== void 0 ? className : ""}`, role: "alert", "aria-live": "polite", children: messages.map((msg, index) => (_jsx("p", { className: "break-words leading-relaxed", children: msg }, index))) }));
}

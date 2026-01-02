import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// file_description: Visual divider between OAuth buttons and email/password form
// section: imports
import { cn } from "../../../../lib/utils.js";
// section: component
/**
 * Visual divider component to separate OAuth buttons from email/password form
 * Displays a horizontal line with text in the center
 */
export function OAuthDivider({ text = "or continue with email", className, }) {
    return (_jsxs("div", { className: cn("cls_oauth_divider relative my-6", className), role: "separator", "aria-orientation": "horizontal", children: [_jsx("div", { className: "absolute inset-0 flex items-center", "aria-hidden": "true", children: _jsx("span", { className: "w-full border-t border-slate-200" }) }), _jsx("div", { className: "relative flex justify-center text-sm", children: _jsx("span", { className: "bg-white px-3 text-slate-500", children: text }) })] }));
}
export default OAuthDivider;

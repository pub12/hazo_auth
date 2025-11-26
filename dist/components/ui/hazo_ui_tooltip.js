// file_description: reusable tooltip component for hazo_auth with question mark icon
// section: client_directive
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// section: imports
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "hazo_auth/components/ui/tooltip";
// section: component
/**
 * Reusable tooltip component with question mark icon
 * Displays a help icon that shows a tooltip message on hover
 * @param props - Component props including message, icon size, and placement
 * @returns Tooltip component with question mark icon
 */
export function HazoUITooltip({ message, iconSize = 16, iconClassName = "text-slate-400 hover:text-slate-600", side = "top", }) {
    return (_jsx(TooltipProvider, { children: _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx("button", { type: "button", className: "cls_hazo_ui_tooltip_trigger inline-flex items-start focus:outline-none align-super", "aria-label": "Help", style: { verticalAlign: "super" }, children: _jsx(HelpCircle, { size: iconSize, className: `cls_hazo_ui_tooltip_icon ${iconClassName}`, "aria-hidden": "true", style: { transform: "translateY(-0.2em)" } }) }) }), _jsx(TooltipContent, { side: side, className: "cls_hazo_ui_tooltip_content", children: _jsx("p", { className: "cls_hazo_ui_tooltip_message", children: message }) })] }) }));
}

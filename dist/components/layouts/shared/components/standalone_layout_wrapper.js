// file_description: renders a simple full-width shell without the developer sidebar
// section: client_directive
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// section: imports
import { cn } from "../../../../lib/utils.js";
import { AuthNavbar } from "./auth_navbar.js";
// section: component
export function StandaloneLayoutWrapper({ children, heading = "hazo auth", description = "Drop-in authentication flows that inherit your existing theme.", wrapperClassName, contentClassName, showHeading = true, showDescription = true, navbar, verticalCenter = true, }) {
    const hasNavbar = navbar !== null && navbar !== undefined;
    return (
    // Single wrapper with min-h-screen and flexbox for proper layout
    // wrapperClassName applied here for consuming app theming/background
    _jsxs("div", { className: cn("cls_standalone_layout_outer cls_standalone_layout_wrapper flex min-h-screen w-full flex-col bg-background", wrapperClassName), children: [hasNavbar && _jsx(AuthNavbar, Object.assign({}, navbar)), _jsx("div", { className: cn("cls_standalone_layout_content_area flex-1", verticalCenter && "flex items-center justify-center"), children: _jsxs("div", { className: cn("cls_standalone_layout_content mx-auto flex w-full flex-col", verticalCenter ? "max-w-5xl gap-2 p-4" : "max-w-5xl gap-6 p-6", contentClassName), children: [(showHeading || showDescription) && (_jsxs("div", { className: "cls_standalone_layout_header text-center", children: [showHeading && (_jsx("h1", { className: "cls_standalone_layout_title text-2xl font-semibold tracking-tight text-foreground", children: heading })), showDescription && (_jsx("p", { className: "cls_standalone_layout_description mt-2 text-sm text-muted-foreground", children: description }))] })), _jsx("div", { className: "cls_standalone_layout_body", children: children })] }) })] }));
}

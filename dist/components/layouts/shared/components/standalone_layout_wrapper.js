// file_description: renders a simple full-width shell without the developer sidebar
// section: client_directive
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// section: imports
import { cn } from "../../../../lib/utils";
import { AuthNavbar } from "./auth_navbar";
// section: component
export function StandaloneLayoutWrapper({ children, heading = "hazo auth", description = "Drop-in authentication flows that inherit your existing theme.", wrapperClassName, contentClassName, showHeading = true, showDescription = true, navbar, verticalCenter = true, }) {
    var _a;
    const hasNavbar = navbar !== null && navbar !== undefined;
    // Calculate navbar height for vertical centering offset
    const navbarHeight = hasNavbar ? ((_a = navbar === null || navbar === void 0 ? void 0 : navbar.height) !== null && _a !== void 0 ? _a : 64) : 0;
    return (_jsxs("div", { className: cn("cls_standalone_layout_wrapper flex min-h-screen w-full flex-col bg-background", wrapperClassName), children: [hasNavbar && _jsx(AuthNavbar, Object.assign({}, navbar)), _jsx("div", { className: cn("cls_standalone_layout_content_area flex-1", verticalCenter && "flex items-center justify-center"), style: verticalCenter ? { minHeight: `calc(100vh - ${navbarHeight}px)` } : undefined, children: _jsxs("div", { className: cn("cls_standalone_layout_content mx-auto flex w-full max-w-5xl flex-col gap-8 p-6", contentClassName), children: [(showHeading || showDescription) && (_jsxs("div", { className: "cls_standalone_layout_header text-center", children: [showHeading && (_jsx("h1", { className: "cls_standalone_layout_title text-2xl font-semibold tracking-tight text-foreground", children: heading })), showDescription && (_jsx("p", { className: "cls_standalone_layout_description mt-2 text-sm text-muted-foreground", children: description }))] })), _jsx("div", { className: "cls_standalone_layout_body", children: children })] }) })] }));
}

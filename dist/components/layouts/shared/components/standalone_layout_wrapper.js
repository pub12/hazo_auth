// file_description: renders a simple full-width shell without the developer sidebar
// section: client_directive
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// section: imports
import { cn } from "hazo_auth/lib/utils";
// section: component
export function StandaloneLayoutWrapper({ children, heading = "hazo auth", description = "Drop-in authentication flows that inherit your existing theme.", wrapperClassName, contentClassName, showHeading = true, showDescription = true, }) {
    return (_jsx("div", { className: cn("cls_standalone_layout_wrapper min-h-screen w-full bg-background", wrapperClassName), children: _jsxs("div", { className: cn("cls_standalone_layout_content mx-auto flex w-full max-w-5xl flex-col gap-8 p-6", contentClassName), children: [(showHeading || showDescription) && (_jsxs("div", { className: "cls_standalone_layout_header text-center", children: [showHeading && (_jsx("h1", { className: "cls_standalone_layout_title text-2xl font-semibold tracking-tight text-foreground", children: heading })), showDescription && (_jsx("p", { className: "cls_standalone_layout_description mt-2 text-sm text-muted-foreground", children: description }))] })), _jsx("div", { className: "cls_standalone_layout_body", children: children })] }) }));
}

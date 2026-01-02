// file_description: configurable navbar component for auth pages with logo, company name, and home link
// section: client_directive
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// section: imports
import Link from "next/link";
import Image from "next/image";
import { Home } from "lucide-react";
import { cn } from "../../../../lib/utils.js";
// section: component
export function AuthNavbar({ logo_path = "", logo_width = 28, logo_height = 28, company_name = "", home_path = "/", home_label = "Home", show_home_link = true, background_color, text_color, height = 40, className, }) {
    // Only show logo if logo_path is configured (non-empty)
    const showLogo = logo_path !== "";
    const navStyle = Object.assign(Object.assign({ height: `${height}px` }, (background_color && { backgroundColor: background_color })), (text_color && { color: text_color }));
    return (_jsxs("nav", { className: cn("cls_auth_navbar flex w-full items-center justify-between border-b border-border/40 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60", className), style: navStyle, "aria-label": "Authentication page navigation", children: [_jsx("div", { className: "cls_auth_navbar_brand flex items-center gap-3", children: (showLogo || company_name) && (_jsxs(Link, { href: home_path, className: "cls_auth_navbar_logo_link flex items-center gap-3", children: [showLogo && (_jsx(Image, { src: logo_path, alt: company_name ? `${company_name} logo` : "Logo", width: logo_width, height: logo_height, className: "cls_auth_navbar_logo object-contain" })), company_name && (_jsx("span", { className: "cls_auth_navbar_company_name text-lg font-semibold text-foreground", children: company_name }))] })) }), show_home_link && (_jsx("div", { className: "cls_auth_navbar_links flex items-center gap-4", children: _jsxs(Link, { href: home_path, className: "cls_auth_navbar_home_link flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground", "aria-label": `Navigate to ${home_label}`, children: [_jsx(Home, { className: "h-4 w-4", "aria-hidden": "true" }), _jsx("span", { children: home_label })] }) }))] }));
}

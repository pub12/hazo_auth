// file_description: reusable component to show "already logged in" message when user is authenticated
// section: client_directive
"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// section: imports
import { use_auth_status } from "../hooks/use_auth_status";
import { LogoutButton } from "./logout_button";
import { Button } from "../../../ui/button";
import { TwoColumnAuthLayout } from "./two_column_auth_layout";
import { useRouter } from "next/navigation";
import { Home } from "lucide-react";
// section: component
/**
 * Guard component that shows "already logged in" message if user is authenticated
 * Otherwise renders children
 * @param props - Component props including layout config and message customization
 * @returns Either the "already logged in" UI or the children
 */
export function AlreadyLoggedInGuard({ image_src, image_alt, image_background_color = "#f1f5f9", message = "You're already logged in.", showLogoutButton = true, showReturnHomeButton = false, returnHomeButtonLabel = "Return home", returnHomePath = "/", requireEmailVerified = false, children, }) {
    const router = useRouter();
    const authStatus = use_auth_status();
    // Check if user should see "already logged in" message
    // If requireEmailVerified is true, only show if email is verified
    // If requireEmailVerified is false, show if authenticated
    const shouldShowAlreadyLoggedIn = authStatus.authenticated &&
        !authStatus.loading &&
        (!requireEmailVerified || authStatus.email_verified === true);
    if (shouldShowAlreadyLoggedIn) {
        return (_jsx(TwoColumnAuthLayout, { imageSrc: image_src, imageAlt: image_alt, imageBackgroundColor: image_background_color, formContent: _jsxs("div", { className: "cls_already_logged_in_guard flex flex-col items-center justify-center gap-4 p-8 text-center", children: [_jsx("p", { className: "cls_already_logged_in_guard_message text-lg font-medium text-slate-900", children: message }), _jsxs("div", { className: "cls_already_logged_in_guard_actions flex flex-col gap-3 items-center mt-4", children: [showLogoutButton && (_jsx(LogoutButton, { className: "cls_already_logged_in_guard_logout_button", variant: "default" })), showReturnHomeButton && (_jsxs(Button, { onClick: () => router.push(returnHomePath), variant: "outline", className: "cls_already_logged_in_guard_return_home_button", "aria-label": returnHomeButtonLabel, children: [_jsx(Home, { className: "h-4 w-4 mr-2", "aria-hidden": "true" }), returnHomeButtonLabel] }))] })] }) }));
    }
    return _jsx(_Fragment, { children: children });
}

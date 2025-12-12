// file_description: Google Sign-In button component with official Google icon
// section: client_directive
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// section: imports
import { Button } from "../../../ui/button";
import { GoogleIcon } from "./google_icon";
import { cn } from "../../../../lib/utils";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
// section: component
/**
 * Google Sign-In button component
 * Displays the Google logo with configurable text
 * Initiates the Google OAuth flow when clicked
 * Uses next-auth/react signIn function for proper OAuth flow
 */
export function GoogleSignInButton({ label = "Continue with Google", onClick, disabled = false, className, callbackUrl = "/api/hazo_auth/oauth/google/callback", }) {
    const [isLoading, setIsLoading] = useState(false);
    const handleClick = async () => {
        if (disabled || isLoading)
            return;
        if (onClick) {
            onClick();
        }
        else {
            setIsLoading(true);
            try {
                // Use next-auth/react signIn function for proper OAuth flow
                // redirect: false prevents automatic redirect so we can handle errors
                const result = await signIn("google", {
                    callbackUrl,
                    redirect: false,
                });
                console.log("[GoogleSignInButton] signIn result:", result);
                if (result === null || result === void 0 ? void 0 : result.error) {
                    console.error("[GoogleSignInButton] Sign-in error:", result.error);
                    alert(`Google Sign-In Error: ${result.error}`);
                    setIsLoading(false);
                }
                else if (result === null || result === void 0 ? void 0 : result.url) {
                    // Redirect to the OAuth URL
                    window.location.href = result.url;
                }
            }
            catch (error) {
                console.error("[GoogleSignInButton] Sign-in exception:", error);
                alert(`Google Sign-In Exception: ${error}`);
                setIsLoading(false);
            }
        }
    };
    return (_jsxs(Button, { type: "button", variant: "outline", onClick: handleClick, disabled: disabled || isLoading, className: cn("cls_google_sign_in_button w-full flex items-center justify-center gap-3 h-11 border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-colors", className), "aria-label": label, children: [isLoading ? (_jsx(Loader2, { className: "h-5 w-5 animate-spin text-slate-600", "aria-hidden": "true" })) : (_jsx(GoogleIcon, { className: "h-5 w-5" })), _jsx("span", { className: "text-slate-700 font-medium", children: isLoading ? "Signing in..." : label })] }));
}
export default GoogleSignInButton;

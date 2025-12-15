// file_description: Development lock screen layout component
// A simple centered layout for entering the dev lock password
// section: client_directive
"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// section: imports
import { useState, useCallback } from "react";
import Image from "next/image";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Lock, AlertCircle, Loader2 } from "lucide-react";
// section: component
export default function DevLockLayout({ background_color = "#000000", logo_path = "/logo.png", logo_width = 120, logo_height = 120, application_name = "", limited_access_text = "Limited Access", password_placeholder = "Enter access password", submit_button_text = "Unlock", error_message = "Incorrect password", text_color = "#ffffff", accent_color = "#3b82f6", onUnlock, }) {
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const response = await fetch("/api/hazo_auth/dev_lock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });
            if (response.ok) {
                // Success - redirect to home or call onUnlock
                if (onUnlock) {
                    onUnlock();
                }
                else {
                    window.location.href = "/";
                }
            }
            else {
                setError(error_message);
                setPassword("");
            }
        }
        catch (_a) {
            setError("An error occurred. Please try again.");
        }
        finally {
            setIsLoading(false);
        }
    }, [password, error_message, onUnlock]);
    const handlePasswordChange = useCallback((e) => {
        setPassword(e.target.value);
        // Clear error when user starts typing
        if (error) {
            setError(null);
        }
    }, [error]);
    return (_jsx("div", { className: "cls_dev_lock_layout min-h-screen flex flex-col items-center justify-center p-4", style: { backgroundColor: background_color }, children: _jsxs("div", { className: "cls_dev_lock_container flex flex-col items-center gap-6 max-w-sm w-full", children: [_jsx("div", { className: "cls_dev_lock_logo", children: _jsx(Image, { src: logo_path, alt: "Application logo", width: logo_width, height: logo_height, className: "object-contain", priority: true }) }), application_name && (_jsx("h1", { className: "cls_dev_lock_app_name text-2xl font-bold text-center", style: { color: text_color }, children: application_name })), _jsxs("div", { className: "cls_dev_lock_header flex items-center gap-2", children: [_jsx(Lock, { className: "w-5 h-5", style: { color: text_color } }), _jsx("span", { className: "cls_dev_lock_text text-sm font-medium uppercase tracking-wider", style: { color: text_color, opacity: 0.8 }, children: limited_access_text })] }), _jsxs("form", { onSubmit: handleSubmit, className: "cls_dev_lock_form flex flex-col gap-4 w-full", children: [_jsx("div", { className: "cls_dev_lock_input_wrapper relative", children: _jsx(Input, { type: "password", value: password, onChange: handlePasswordChange, placeholder: password_placeholder, className: "cls_dev_lock_input h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20", disabled: isLoading, autoFocus: true, autoComplete: "current-password" }) }), error && (_jsxs("div", { className: "cls_dev_lock_error flex items-center gap-2 text-sm", style: { color: "#ef4444" }, children: [_jsx(AlertCircle, { className: "w-4 h-4 flex-shrink-0" }), _jsx("span", { children: error })] })), _jsx(Button, { type: "submit", className: "cls_dev_lock_button h-12 font-medium transition-colors", style: {
                                backgroundColor: accent_color,
                                color: "#ffffff",
                            }, disabled: isLoading || !password, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 animate-spin mr-2" }), "Verifying..."] })) : (submit_button_text) })] })] }) }));
}
export { DevLockLayout };

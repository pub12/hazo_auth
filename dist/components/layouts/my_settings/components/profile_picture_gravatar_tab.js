// file_description: Gravatar tab component for profile picture dialog
// section: client_directive
"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// section: imports
import { useState, useEffect } from "react";
import { Switch } from "../../../ui/switch.js";
import { Label } from "../../../ui/label.js";
import { Avatar, AvatarImage, AvatarFallback } from "../../../ui/avatar.js";
import { Info } from "lucide-react";
import gravatarUrl from "gravatar-url";
// section: component
/**
 * Gravatar tab component for profile picture dialog
 * Shows Gravatar preview and setup instructions
 * @param props - Component props including email, useGravatar state, and change handler
 * @returns Gravatar tab component
 */
export function ProfilePictureGravatarTab({ email, useGravatar, onUseGravatarChange, disabled = false, gravatarSetupMessage, gravatarNoAccountMessage, gravatarSize, }) {
    const [gravatarUrlState, setGravatarUrlState] = useState("");
    const [gravatarExists, setGravatarExists] = useState(null);
    useEffect(() => {
        if (email) {
            const url = gravatarUrl(email, {
                size: gravatarSize,
                default: "404", // Return 404 if Gravatar doesn't exist
            });
            setGravatarUrlState(url);
            // Check if Gravatar exists by trying to load the image
            const img = new Image();
            img.onload = () => {
                setGravatarExists(true);
            };
            img.onerror = () => {
                setGravatarExists(false);
            };
            img.src = url;
        }
    }, [email]);
    const getInitials = () => {
        var _a;
        if (email) {
            return ((_a = email[0]) === null || _a === void 0 ? void 0 : _a.toUpperCase()) || "?";
        }
        return "?";
    };
    return (_jsxs("div", { className: "cls_profile_picture_gravatar_tab flex flex-col gap-4", children: [_jsxs("div", { className: "cls_profile_picture_gravatar_tab_switch flex items-center gap-3", children: [_jsx(Switch, { id: "use-gravatar", checked: useGravatar, onCheckedChange: onUseGravatarChange, disabled: disabled, className: "cls_profile_picture_gravatar_tab_switch_input", "aria-label": "Use Gravatar photo" }), _jsx(Label, { htmlFor: "use-gravatar", className: "cls_profile_picture_gravatar_tab_switch_label text-sm font-medium text-[var(--hazo-text-secondary)] cursor-pointer", children: "Use Gravatar photo" })] }), _jsx("div", { className: "cls_profile_picture_gravatar_tab_preview flex flex-col items-center gap-4 p-6 border border-[var(--hazo-border)] rounded-lg bg-[var(--hazo-bg-subtle)]", children: gravatarExists === true ? (_jsxs(_Fragment, { children: [_jsxs(Avatar, { className: "cls_profile_picture_gravatar_tab_avatar h-32 w-32", children: [_jsx(AvatarImage, { src: gravatarUrlState, alt: "Gravatar profile picture", className: "cls_profile_picture_gravatar_tab_avatar_image" }), _jsx(AvatarFallback, { className: "cls_profile_picture_gravatar_tab_avatar_fallback bg-[var(--hazo-bg-emphasis)] text-[var(--hazo-text-muted)] text-3xl", children: getInitials() })] }), _jsx("p", { className: "cls_profile_picture_gravatar_tab_success_text text-sm text-[var(--hazo-text-muted)] text-center", children: "Your Gravatar is available and will be used as your profile picture." })] })) : gravatarExists === false ? (_jsx(_Fragment, { children: _jsxs("div", { className: "cls_profile_picture_gravatar_tab_no_gravatar flex flex-col items-center gap-4", children: [_jsx("div", { className: "cls_profile_picture_gravatar_tab_no_gravatar_icon flex items-center justify-center w-16 h-16 rounded-full bg-[var(--hazo-bg-muted)]", children: _jsx(Info, { className: "h-8 w-8 text-[var(--hazo-text-subtle)]", "aria-hidden": "true" }) }), _jsxs("div", { className: "cls_profile_picture_gravatar_tab_no_gravatar_content flex flex-col gap-2 text-center", children: [_jsx("p", { className: "cls_profile_picture_gravatar_tab_no_gravatar_title text-sm font-medium text-[var(--hazo-text-primary)]", children: "No Gravatar found" }), _jsxs("p", { className: "cls_profile_picture_gravatar_tab_no_gravatar_message text-sm text-[var(--hazo-text-muted)]", children: [gravatarSetupMessage, " ", _jsx("span", { className: "font-semibold", children: email }), ":"] }), _jsxs("ol", { className: "cls_profile_picture_gravatar_tab_no_gravatar_steps text-sm text-[var(--hazo-text-muted)] list-decimal list-inside space-y-1 mt-2", children: [_jsxs("li", { children: ["Visit ", _jsx("a", { href: "https://gravatar.com", target: "_blank", rel: "noopener noreferrer", className: "text-blue-600 hover:text-blue-700 underline", children: "gravatar.com" })] }), _jsxs("li", { children: ["Sign up or log in with your email: ", _jsx("span", { className: "font-mono text-xs", children: email })] }), _jsx("li", { children: "Upload a profile picture" }), _jsx("li", { children: "Return here and refresh to see your Gravatar" })] })] })] }) })) : (_jsx(_Fragment, { children: _jsx("div", { className: "cls_profile_picture_gravatar_tab_loading flex items-center justify-center", children: _jsx("p", { className: "cls_profile_picture_gravatar_tab_loading_text text-sm text-[var(--hazo-text-muted)]", children: "Checking Gravatar..." }) }) })) })] }));
}

// file_description: component for displaying and editing profile picture (edit functionality to be implemented later)
// section: client_directive
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// section: imports
import { Avatar, AvatarImage, AvatarFallback } from "hazo_auth/components/ui/avatar";
// section: component
/**
 * Profile picture display component
 * Shows profile picture with fallback to initials or default icon
 * Displays pencil icon for editing (functionality to be implemented later)
 * @param props - Component props including profile picture URL, name, email, onEdit callback
 * @returns Profile picture display component
 */
export function ProfilePictureDisplay({ profilePictureUrl, name, email, onEdit, disabled = false, }) {
    // Get initials from name or email
    const getInitials = () => {
        var _a, _b;
        if (name) {
            const parts = name.trim().split(" ");
            if (parts.length >= 2) {
                return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
            }
            return ((_a = name[0]) === null || _a === void 0 ? void 0 : _a.toUpperCase()) || "";
        }
        if (email) {
            return ((_b = email[0]) === null || _b === void 0 ? void 0 : _b.toUpperCase()) || "";
        }
        return "?";
    };
    const initials = getInitials();
    return (_jsx("div", { className: "cls_profile_picture_display", children: _jsxs(Avatar, { className: "cls_profile_picture_display_avatar h-32 w-32", children: [_jsx(AvatarImage, { src: profilePictureUrl, alt: name ? `Profile picture of ${name}` : "Profile picture", className: "cls_profile_picture_display_image" }), _jsx(AvatarFallback, { className: "cls_profile_picture_display_fallback bg-slate-200 text-slate-600 text-3xl", children: initials })] }) }));
}

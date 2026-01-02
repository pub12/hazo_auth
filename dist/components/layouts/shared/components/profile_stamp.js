// file_description: ProfileStamp component - circular profile picture with hover card showing user details
// section: client_directive
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// section: imports
import { Avatar, AvatarImage, AvatarFallback } from "../../../ui/avatar.js";
import { HoverCard, HoverCardTrigger, HoverCardContent, } from "../../../ui/hover-card.js";
import { use_auth_status } from "../hooks/use_auth_status.js";
// section: component
/**
 * ProfileStamp component - displays a circular profile picture with a hover card
 * showing the user's name, email, and any custom fields.
 *
 * Use this component to add profile attribution to notes, comments, or any
 * user-generated content in your application.
 *
 * @example
 * // Basic usage
 * <ProfileStamp />
 *
 * @example
 * // With custom fields
 * <ProfileStamp
 *   size="lg"
 *   custom_fields={[
 *     { label: "Role", value: "Admin" },
 *     { label: "Department", value: "Engineering" }
 *   ]}
 * />
 */
export function ProfileStamp({ size = "default", custom_fields = [], className, show_name = true, show_email = true, }) {
    const authStatus = use_auth_status();
    // Avatar size classes
    const avatarSizeClasses = {
        sm: "h-6 w-6",
        default: "h-8 w-8",
        lg: "h-10 w-10",
    };
    // Get initials from name or email
    const getInitials = () => {
        var _a, _b;
        if (authStatus.name) {
            const parts = authStatus.name.trim().split(" ");
            if (parts.length >= 2) {
                return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
            }
            return ((_a = authStatus.name[0]) === null || _a === void 0 ? void 0 : _a.toUpperCase()) || "";
        }
        if (authStatus.email) {
            return ((_b = authStatus.email[0]) === null || _b === void 0 ? void 0 : _b.toUpperCase()) || "";
        }
        return "?";
    };
    // Show loading skeleton
    if (authStatus.loading) {
        return (_jsx("div", { className: `cls_profile_stamp inline-block ${className || ""}`, children: _jsx("div", { className: `${avatarSizeClasses[size]} rounded-full bg-[var(--hazo-bg-emphasis)] animate-pulse`, "aria-label": "Loading profile" }) }));
    }
    // Not authenticated - show placeholder
    if (!authStatus.authenticated) {
        return (_jsx("div", { className: `cls_profile_stamp inline-block ${className || ""}`, children: _jsx(Avatar, { className: `cls_profile_stamp_avatar ${avatarSizeClasses[size]}`, children: _jsx(AvatarFallback, { className: "cls_profile_stamp_fallback bg-[var(--hazo-bg-emphasis)] text-[var(--hazo-text-muted)]", children: "?" }) }) }));
    }
    // Check if there's any content to show in the hover card
    const hasHoverContent = (show_name && authStatus.name) ||
        (show_email && authStatus.email) ||
        custom_fields.length > 0;
    // If no hover content, just show the avatar without hover card
    if (!hasHoverContent) {
        return (_jsx("div", { className: `cls_profile_stamp inline-block ${className || ""}`, children: _jsxs(Avatar, { className: `cls_profile_stamp_avatar ${avatarSizeClasses[size]}`, children: [_jsx(AvatarImage, { src: authStatus.profile_picture_url, alt: authStatus.name ? `Profile picture of ${authStatus.name}` : "Profile picture", className: "cls_profile_stamp_image" }), _jsx(AvatarFallback, { className: "cls_profile_stamp_fallback bg-[var(--hazo-bg-emphasis)] text-[var(--hazo-text-muted)]", children: getInitials() })] }) }));
    }
    // Authenticated with hover content - show avatar with hover card
    return (_jsx("div", { className: `cls_profile_stamp inline-block ${className || ""}`, children: _jsxs(HoverCard, { children: [_jsx(HoverCardTrigger, { asChild: true, children: _jsx("button", { type: "button", className: "cls_profile_stamp_trigger cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary rounded-full", "aria-label": `View profile information for ${authStatus.name || authStatus.email || "user"}`, children: _jsxs(Avatar, { className: `cls_profile_stamp_avatar ${avatarSizeClasses[size]}`, children: [_jsx(AvatarImage, { src: authStatus.profile_picture_url, alt: authStatus.name ? `Profile picture of ${authStatus.name}` : "Profile picture", className: "cls_profile_stamp_image" }), _jsx(AvatarFallback, { className: "cls_profile_stamp_fallback bg-[var(--hazo-bg-emphasis)] text-[var(--hazo-text-muted)]", children: getInitials() })] }) }) }), _jsx(HoverCardContent, { align: "start", className: "cls_profile_stamp_hover_card w-auto min-w-[200px]", children: _jsxs("div", { className: "cls_profile_stamp_hover_content flex flex-col gap-2", children: [show_name && authStatus.name && (_jsx("div", { className: "cls_profile_stamp_name text-sm font-semibold text-foreground", children: authStatus.name })), show_email && authStatus.email && (_jsx("div", { className: "cls_profile_stamp_email text-sm text-muted-foreground", children: authStatus.email })), custom_fields.length > 0 && (_jsx("div", { className: "cls_profile_stamp_custom_fields flex flex-col gap-1 pt-2 border-t", children: custom_fields.map((field, index) => (_jsxs("div", { className: "cls_profile_stamp_custom_field flex justify-between gap-4 text-sm", children: [_jsxs("span", { className: "cls_profile_stamp_field_label text-muted-foreground", children: [field.label, ":"] }), _jsx("span", { className: "cls_profile_stamp_field_value text-foreground font-medium", children: field.value })] }, `${field.label}-${index}`))) }))] }) })] }) }));
}

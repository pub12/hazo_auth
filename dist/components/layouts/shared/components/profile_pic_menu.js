// file_description: profile picture menu component for navbar or sidebar - shows profile picture when logged in, or sign up/sign in buttons when not logged in
// Supports both dropdown (navbar) and sidebar variants
// section: client_directive
"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// section: imports
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "../../../ui/avatar";
import { Button } from "../../../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "../../../ui/dropdown-menu";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, } from "../../../ui/sidebar";
import { Settings, LogOut } from "lucide-react";
import { toast } from "sonner";
import { use_auth_status, trigger_auth_status_refresh } from "../hooks/use_auth_status";
import { useHazoAuthConfig } from "../../../../contexts/hazo_auth_provider";
// section: component
/**
 * Profile picture menu component
 * Shows user profile picture when authenticated, or sign up/sign in buttons when not authenticated
 * Supports two variants:
 * - "dropdown" (default): Clicking profile picture opens dropdown menu (for navbar/header)
 * - "sidebar": Shows profile picture and name in sidebar, clicking opens dropdown menu (for sidebar navigation)
 * @param props - Component props including configuration options
 * @returns Profile picture menu component
 */
export function ProfilePicMenu({ show_single_button = false, sign_up_label = "Sign Up", sign_in_label = "Sign In", register_path = "/hazo_auth/register", login_path = "/hazo_auth/login", settings_path = "/hazo_auth/my_settings", logout_path, custom_menu_items = [], className, avatar_size = "default", variant = "dropdown", sidebar_group_label = "Account", }) {
    const { apiBasePath } = useHazoAuthConfig();
    const router = useRouter();
    const authStatus = use_auth_status();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    // Use provided logout_path or default to context-based path
    const effectiveLogoutPath = logout_path || `${apiBasePath}/logout`;
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
    // Handle logout
    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            const response = await fetch(effectiveLogoutPath, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.error || "Logout failed");
            }
            toast.success("Logged out successfully");
            // Trigger auth status refresh in all components
            trigger_auth_status_refresh();
            // Refresh the page to update authentication state
            router.refresh();
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Logout failed. Please try again.";
            toast.error(errorMessage);
        }
        finally {
            setIsLoggingOut(false);
        }
    };
    // Build menu items with default items and custom items
    const menuItems = useMemo(() => {
        const items = [];
        // Add default info items (only if authenticated)
        if (authStatus.authenticated) {
            // User name (info, order: 1)
            if (authStatus.name) {
                items.push({
                    type: "info",
                    value: authStatus.name,
                    order: 1,
                    id: "default_name",
                });
            }
            // Email address (info, order: 2)
            if (authStatus.email) {
                items.push({
                    type: "info",
                    value: authStatus.email,
                    order: 2,
                    id: "default_email",
                });
            }
            // Separator (order: 1)
            items.push({
                type: "separator",
                order: 1,
                id: "default_separator",
            });
            // Settings (link, order: 1)
            items.push({
                type: "link",
                label: "Settings",
                href: settings_path,
                order: 1,
                id: "default_settings",
            });
            // Logout (link, order: 2)
            items.push({
                type: "link",
                label: "Logout",
                href: effectiveLogoutPath,
                order: 2,
                id: "default_logout",
            });
        }
        // Add custom menu items
        items.push(...custom_menu_items);
        // Sort items by type group and order
        // Order: info items first, then separators, then links
        items.sort((a, b) => {
            // Define type priority: info = 0, separator = 1, link = 2
            const typePriority = { info: 0, separator: 1, link: 2 };
            const aPriority = typePriority[a.type];
            const bPriority = typePriority[b.type];
            if (aPriority !== bPriority) {
                return aPriority - bPriority;
            }
            // Within same type, sort by order
            return a.order - b.order;
        });
        return items;
    }, [authStatus.authenticated, authStatus.name, authStatus.email, settings_path, effectiveLogoutPath, custom_menu_items]);
    // Avatar size classes
    const avatarSizeClasses = {
        sm: "h-8 w-8",
        default: "h-10 w-10",
        lg: "h-12 w-12",
    };
    // Show loading state
    if (authStatus.loading) {
        if (variant === "sidebar") {
            return (_jsxs(SidebarGroup, { className: `cls_profile_pic_menu_sidebar ${className || ""}`, children: [_jsx(SidebarGroupLabel, { children: sidebar_group_label }), _jsx(SidebarMenu, { children: _jsx(SidebarMenuItem, { children: _jsx("div", { className: "h-10 w-10 rounded-full bg-[var(--hazo-bg-emphasis)] animate-pulse" }) }) })] }));
        }
        return (_jsx("div", { className: `cls_profile_pic_menu ${className || ""}`, children: _jsx("div", { className: "h-10 w-10 rounded-full bg-[var(--hazo-bg-emphasis)] animate-pulse" }) }));
    }
    // Not authenticated - show sign up/sign in buttons
    if (!authStatus.authenticated) {
        if (variant === "sidebar") {
            return (_jsxs(SidebarGroup, { className: `cls_profile_pic_menu_sidebar ${className || ""}`, children: [_jsx(SidebarGroupLabel, { children: sidebar_group_label }), _jsx(SidebarMenu, { children: show_single_button ? (_jsx(SidebarMenuItem, { children: _jsx(SidebarMenuButton, { asChild: true, children: _jsx(Link, { href: register_path, className: "cls_profile_pic_menu_sign_up", children: sign_up_label }) }) })) : (_jsxs(_Fragment, { children: [_jsx(SidebarMenuItem, { children: _jsx(SidebarMenuButton, { asChild: true, children: _jsx(Link, { href: register_path, className: "cls_profile_pic_menu_sign_up", children: sign_up_label }) }) }), _jsx(SidebarMenuItem, { children: _jsx(SidebarMenuButton, { asChild: true, children: _jsx(Link, { href: login_path, className: "cls_profile_pic_menu_sign_in", children: sign_in_label }) }) })] })) })] }));
        }
        return (_jsx("div", { className: `cls_profile_pic_menu flex items-center gap-2 ${className || ""}`, children: show_single_button ? (_jsx(Button, { asChild: true, variant: "default", size: "sm", children: _jsx(Link, { href: register_path, className: "cls_profile_pic_menu_sign_up", children: sign_up_label }) })) : (_jsxs(_Fragment, { children: [_jsx(Button, { asChild: true, variant: "outline", size: "sm", children: _jsx(Link, { href: register_path, className: "cls_profile_pic_menu_sign_up", children: sign_up_label }) }), _jsx(Button, { asChild: true, variant: "default", size: "sm", children: _jsx(Link, { href: login_path, className: "cls_profile_pic_menu_sign_in", children: sign_in_label }) })] })) }));
    }
    // Authenticated - render based on variant
    if (variant === "sidebar") {
        // Sidebar variant: show profile picture and name only, clicking opens dropdown
        return (_jsxs(SidebarGroup, { className: `cls_profile_pic_menu_sidebar ${className || ""}`, children: [_jsx(SidebarGroupLabel, { className: "cls_profile_pic_menu_sidebar_label", children: sidebar_group_label }), _jsx(SidebarMenu, { className: "cls_profile_pic_menu_sidebar_menu", children: _jsx(SidebarMenuItem, { className: "cls_profile_pic_menu_sidebar_user_info", children: _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx("button", { className: "cls_profile_pic_menu_sidebar_trigger w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary rounded-md", "aria-label": "Profile menu", children: _jsxs("div", { className: "cls_profile_pic_menu_sidebar_user flex items-center gap-3 px-2 py-2 hover:bg-sidebar-accent rounded-md transition-colors", children: [_jsxs(Avatar, { className: `cls_profile_pic_menu_avatar ${avatarSizeClasses[avatar_size]} cursor-pointer`, children: [_jsx(AvatarImage, { src: authStatus.profile_picture_url, alt: authStatus.name ? `Profile picture of ${authStatus.name}` : "Profile picture", className: "cls_profile_pic_menu_image" }), _jsx(AvatarFallback, { className: "cls_profile_pic_menu_fallback bg-[var(--hazo-bg-emphasis)] text-[var(--hazo-text-muted)]", children: getInitials() })] }), authStatus.name && (_jsx("span", { className: "cls_profile_pic_menu_sidebar_user_name text-sm font-medium text-sidebar-foreground truncate", children: authStatus.name }))] }) }) }), _jsx(DropdownMenuContent, { align: "end", className: "cls_profile_pic_menu_dropdown w-56", children: menuItems.map((item) => {
                                        if (item.type === "separator") {
                                            return _jsx(DropdownMenuSeparator, { className: "cls_profile_pic_menu_separator" }, item.id);
                                        }
                                        if (item.type === "info") {
                                            return (_jsx("div", { className: "cls_profile_pic_menu_info", children: item.value && (_jsx("div", { className: "cls_profile_pic_menu_info_value px-2 py-1.5 text-sm text-foreground", children: item.value })) }, item.id));
                                        }
                                        if (item.type === "link") {
                                            // Special handling for logout
                                            if (item.id === "default_logout") {
                                                return (_jsxs(DropdownMenuItem, { onClick: handleLogout, disabled: isLoggingOut, className: "cls_profile_pic_menu_logout cursor-pointer text-destructive focus:text-destructive", children: [_jsx(LogOut, { className: "mr-2 h-4 w-4" }), isLoggingOut ? "Logging out..." : item.label] }, item.id));
                                            }
                                            // Special handling for settings
                                            if (item.id === "default_settings") {
                                                return (_jsx(DropdownMenuItem, { asChild: true, className: "cls_profile_pic_menu_settings cursor-pointer", children: _jsxs(Link, { href: item.href || settings_path, children: [_jsx(Settings, { className: "mr-2 h-4 w-4" }), item.label] }) }, item.id));
                                            }
                                            // Generic link handling
                                            return (_jsx(DropdownMenuItem, { asChild: true, className: "cls_profile_pic_menu_link cursor-pointer", children: _jsx(Link, { href: item.href || "#", children: item.label }) }, item.id));
                                        }
                                        return null;
                                    }) })] }) }) })] }));
    }
    // Default dropdown variant: show profile picture with dropdown menu
    return (_jsx("div", { className: `cls_profile_pic_menu ${className || ""}`, children: _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx("button", { className: "cls_profile_pic_menu_trigger focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary rounded-full", "aria-label": "Profile menu", children: _jsxs(Avatar, { className: `cls_profile_pic_menu_avatar ${avatarSizeClasses[avatar_size]} cursor-pointer`, children: [_jsx(AvatarImage, { src: authStatus.profile_picture_url, alt: authStatus.name ? `Profile picture of ${authStatus.name}` : "Profile picture", className: "cls_profile_pic_menu_image" }), _jsx(AvatarFallback, { className: "cls_profile_pic_menu_fallback bg-[var(--hazo-bg-emphasis)] text-[var(--hazo-text-muted)]", children: getInitials() })] }) }) }), _jsx(DropdownMenuContent, { align: "end", className: "cls_profile_pic_menu_dropdown w-56", children: menuItems.map((item) => {
                        if (item.type === "separator") {
                            return _jsx(DropdownMenuSeparator, { className: "cls_profile_pic_menu_separator" }, item.id);
                        }
                        if (item.type === "info") {
                            return (_jsx("div", { className: "cls_profile_pic_menu_info", children: item.value && (_jsx("div", { className: "cls_profile_pic_menu_info_value px-2 py-1.5 text-sm text-foreground", children: item.value })) }, item.id));
                        }
                        if (item.type === "link") {
                            // Special handling for logout
                            if (item.id === "default_logout") {
                                return (_jsxs(DropdownMenuItem, { onClick: handleLogout, disabled: isLoggingOut, className: "cls_profile_pic_menu_logout cursor-pointer text-destructive focus:text-destructive", children: [_jsx(LogOut, { className: "mr-2 h-4 w-4" }), isLoggingOut ? "Logging out..." : item.label] }, item.id));
                            }
                            // Special handling for settings
                            if (item.id === "default_settings") {
                                return (_jsx(DropdownMenuItem, { asChild: true, className: "cls_profile_pic_menu_settings cursor-pointer", children: _jsxs(Link, { href: item.href || settings_path, children: [_jsx(Settings, { className: "mr-2 h-4 w-4" }), item.label] }) }, item.id));
                            }
                            // Generic link handling
                            return (_jsx(DropdownMenuItem, { asChild: true, className: "cls_profile_pic_menu_link cursor-pointer", children: _jsx(Link, { href: item.href || "#", children: item.label }) }, item.id));
                        }
                        return null;
                    }) })] }) }));
}

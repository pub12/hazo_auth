// file_description: profile picture menu component for navbar or sidebar - shows profile picture when logged in, or sign up/sign in buttons when not logged in
// section: client_directive
"use client";

// section: imports
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "hazo_auth/components/ui/avatar";
import { Button } from "hazo_auth/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "hazo_auth/components/ui/dropdown-menu";
import { Settings, LogOut } from "lucide-react";
import { toast } from "sonner";
import { use_auth_status, trigger_auth_status_refresh } from "hazo_auth/components/layouts/shared/hooks/use_auth_status";
// Type-only import from server file is safe (types are erased at runtime)
import type { ProfilePicMenuMenuItem } from "hazo_auth/lib/profile_pic_menu_config.server";

// section: types
export type ProfilePicMenuProps = {
  show_single_button?: boolean;
  sign_up_label?: string;
  sign_in_label?: string;
  register_path?: string;
  login_path?: string;
  settings_path?: string;
  logout_path?: string;
  custom_menu_items?: ProfilePicMenuMenuItem[];
  className?: string;
  avatar_size?: "default" | "sm" | "lg";
};

// section: component
/**
 * Profile picture menu component
 * Shows user profile picture when authenticated, or sign up/sign in buttons when not authenticated
 * Clicking profile picture opens dropdown menu with user info and actions
 * @param props - Component props including configuration options
 * @returns Profile picture menu component
 */
export function ProfilePicMenu({
  show_single_button = false,
  sign_up_label = "Sign Up",
  sign_in_label = "Sign In",
  register_path = "/hazo_auth/register",
  login_path = "/hazo_auth/login",
  settings_path = "/hazo_auth/my_settings",
  logout_path = "/api/hazo_auth/logout",
  custom_menu_items = [],
  className,
  avatar_size = "default",
}: ProfilePicMenuProps) {
  const router = useRouter();
  const authStatus = use_auth_status();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Get initials from name or email
  const getInitials = (): string => {
    if (authStatus.name) {
      const parts = authStatus.name.trim().split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return authStatus.name[0]?.toUpperCase() || "";
    }
    if (authStatus.email) {
      return authStatus.email[0]?.toUpperCase() || "";
    }
    return "?";
  };

  // Handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const response = await fetch(logout_path, {
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
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Logout failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Build menu items with default items and custom items
  const menuItems = useMemo(() => {
    const items: ProfilePicMenuMenuItem[] = [];

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
        href: logout_path,
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
  }, [authStatus.authenticated, authStatus.name, authStatus.email, settings_path, logout_path, custom_menu_items]);

  // Avatar size classes
  const avatarSizeClasses = {
    sm: "h-8 w-8",
    default: "h-10 w-10",
    lg: "h-12 w-12",
  };

  // Show loading state
  if (authStatus.loading) {
    return (
      <div className={`cls_profile_pic_menu ${className || ""}`}>
        <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse" />
      </div>
    );
  }

  // Not authenticated - show sign up/sign in buttons
  if (!authStatus.authenticated) {
    return (
      <div className={`cls_profile_pic_menu flex items-center gap-2 ${className || ""}`}>
        {show_single_button ? (
          <Button asChild variant="default" size="sm">
            <Link href={register_path} className="cls_profile_pic_menu_sign_up">
              {sign_up_label}
            </Link>
          </Button>
        ) : (
          <>
            <Button asChild variant="outline" size="sm">
              <Link href={register_path} className="cls_profile_pic_menu_sign_up">
                {sign_up_label}
              </Link>
            </Button>
            <Button asChild variant="default" size="sm">
              <Link href={login_path} className="cls_profile_pic_menu_sign_in">
                {sign_in_label}
              </Link>
            </Button>
          </>
        )}
      </div>
    );
  }

  // Authenticated - show profile picture with dropdown menu
  return (
    <div className={`cls_profile_pic_menu ${className || ""}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="cls_profile_pic_menu_trigger focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary rounded-full"
            aria-label="Profile menu"
          >
            <Avatar className={`cls_profile_pic_menu_avatar ${avatarSizeClasses[avatar_size]} cursor-pointer`}>
              <AvatarImage
                src={authStatus.profile_picture_url}
                alt={authStatus.name ? `Profile picture of ${authStatus.name}` : "Profile picture"}
                className="cls_profile_pic_menu_image"
              />
              <AvatarFallback className="cls_profile_pic_menu_fallback bg-slate-200 text-slate-600">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="cls_profile_pic_menu_dropdown w-56">
          {menuItems.map((item) => {
            if (item.type === "separator") {
              return <DropdownMenuSeparator key={item.id} className="cls_profile_pic_menu_separator" />;
            }

            if (item.type === "info") {
              return (
                <div key={item.id} className="cls_profile_pic_menu_info">
                  {item.value && (
                    <div className="cls_profile_pic_menu_info_value px-2 py-1.5 text-sm text-foreground">
                      {item.value}
                    </div>
                  )}
                </div>
              );
            }

            if (item.type === "link") {
              // Special handling for logout
              if (item.id === "default_logout") {
                return (
                  <DropdownMenuItem
                    key={item.id}
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="cls_profile_pic_menu_logout cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {isLoggingOut ? "Logging out..." : item.label}
                  </DropdownMenuItem>
                );
              }

              // Special handling for settings
              if (item.id === "default_settings") {
                return (
                  <DropdownMenuItem
                    key={item.id}
                    asChild
                    className="cls_profile_pic_menu_settings cursor-pointer"
                  >
                    <Link href={item.href || settings_path}>
                      <Settings className="mr-2 h-4 w-4" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                );
              }

              // Generic link handling
              return (
                <DropdownMenuItem
                  key={item.id}
                  asChild
                  className="cls_profile_pic_menu_link cursor-pointer"
                >
                  <Link href={item.href || "#"}>
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              );
            }

            return null;
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}


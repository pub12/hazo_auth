// file_description: ProfileStamp component - circular profile picture with hover card showing user details
// section: client_directive
"use client";

// section: imports
import { Avatar, AvatarImage, AvatarFallback } from "../../../ui/avatar";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "../../../ui/hover-card";
import { use_auth_status } from "../hooks/use_auth_status";

// section: types
/**
 * Custom field to display in the hover card
 */
export type ProfileStampCustomField = {
  label: string;
  value: string;
};

/**
 * Props for the ProfileStamp component
 */
export type ProfileStampProps = {
  /**
   * Size variant for the avatar
   * - sm: h-6 w-6 (24px)
   * - default: h-8 w-8 (32px)
   * - lg: h-10 w-10 (40px)
   */
  size?: "sm" | "default" | "lg";
  /**
   * Custom fields to display in the hover card
   */
  custom_fields?: ProfileStampCustomField[];
  /**
   * Additional CSS classes to apply to the wrapper
   */
  className?: string;
  /**
   * Whether to show the user's name in the hover card (default: true)
   */
  show_name?: boolean;
  /**
   * Whether to show the user's email in the hover card (default: true)
   */
  show_email?: boolean;
};

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
export function ProfileStamp({
  size = "default",
  custom_fields = [],
  className,
  show_name = true,
  show_email = true,
}: ProfileStampProps) {
  const authStatus = use_auth_status();

  // Avatar size classes
  const avatarSizeClasses = {
    sm: "h-6 w-6",
    default: "h-8 w-8",
    lg: "h-10 w-10",
  };

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

  // Show loading skeleton
  if (authStatus.loading) {
    return (
      <div className={`cls_profile_stamp inline-block ${className || ""}`}>
        <div
          className={`${avatarSizeClasses[size]} rounded-full bg-[var(--hazo-bg-emphasis)] animate-pulse`}
          aria-label="Loading profile"
        />
      </div>
    );
  }

  // Not authenticated - show placeholder
  if (!authStatus.authenticated) {
    return (
      <div className={`cls_profile_stamp inline-block ${className || ""}`}>
        <Avatar className={`cls_profile_stamp_avatar ${avatarSizeClasses[size]}`}>
          <AvatarFallback className="cls_profile_stamp_fallback bg-[var(--hazo-bg-emphasis)] text-[var(--hazo-text-muted)]">
            ?
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }

  // Check if there's any content to show in the hover card
  const hasHoverContent =
    (show_name && authStatus.name) ||
    (show_email && authStatus.email) ||
    custom_fields.length > 0;

  // If no hover content, just show the avatar without hover card
  if (!hasHoverContent) {
    return (
      <div className={`cls_profile_stamp inline-block ${className || ""}`}>
        <Avatar className={`cls_profile_stamp_avatar ${avatarSizeClasses[size]}`}>
          <AvatarImage
            src={authStatus.profile_picture_url}
            alt={authStatus.name ? `Profile picture of ${authStatus.name}` : "Profile picture"}
            className="cls_profile_stamp_image"
          />
          <AvatarFallback className="cls_profile_stamp_fallback bg-[var(--hazo-bg-emphasis)] text-[var(--hazo-text-muted)]">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }

  // Authenticated with hover content - show avatar with hover card
  return (
    <div className={`cls_profile_stamp inline-block ${className || ""}`}>
      <HoverCard>
        <HoverCardTrigger asChild>
          <button
            type="button"
            className="cls_profile_stamp_trigger cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary rounded-full"
            aria-label={`View profile information for ${authStatus.name || authStatus.email || "user"}`}
          >
            <Avatar className={`cls_profile_stamp_avatar ${avatarSizeClasses[size]}`}>
              <AvatarImage
                src={authStatus.profile_picture_url}
                alt={authStatus.name ? `Profile picture of ${authStatus.name}` : "Profile picture"}
                className="cls_profile_stamp_image"
              />
              <AvatarFallback className="cls_profile_stamp_fallback bg-[var(--hazo-bg-emphasis)] text-[var(--hazo-text-muted)]">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </button>
        </HoverCardTrigger>
        <HoverCardContent
          align="start"
          className="cls_profile_stamp_hover_card w-auto min-w-[200px]"
        >
          <div className="cls_profile_stamp_hover_content flex flex-col gap-2">
            {/* User name */}
            {show_name && authStatus.name && (
              <div className="cls_profile_stamp_name text-sm font-semibold text-foreground">
                {authStatus.name}
              </div>
            )}
            {/* User email */}
            {show_email && authStatus.email && (
              <div className="cls_profile_stamp_email text-sm text-muted-foreground">
                {authStatus.email}
              </div>
            )}
            {/* Custom fields */}
            {custom_fields.length > 0 && (
              <div className="cls_profile_stamp_custom_fields flex flex-col gap-1 pt-2 border-t">
                {custom_fields.map((field, index) => (
                  <div
                    key={`${field.label}-${index}`}
                    className="cls_profile_stamp_custom_field flex justify-between gap-4 text-sm"
                  >
                    <span className="cls_profile_stamp_field_label text-muted-foreground">
                      {field.label}:
                    </span>
                    <span className="cls_profile_stamp_field_value text-foreground font-medium">
                      {field.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}

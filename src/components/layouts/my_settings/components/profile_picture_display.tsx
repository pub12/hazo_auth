// file_description: component for displaying and editing profile picture (edit functionality to be implemented later)
// section: client_directive
"use client";

// section: imports
import { Avatar, AvatarImage, AvatarFallback } from "hazo_auth/components/ui/avatar";
import { Button } from "hazo_auth/components/ui/button";
import { Pencil } from "lucide-react";

// section: types
export type ProfilePictureDisplayProps = {
  profilePictureUrl?: string;
  name?: string;
  email?: string;
  onEdit?: () => void;
  disabled?: boolean;
};

// section: component
/**
 * Profile picture display component
 * Shows profile picture with fallback to initials or default icon
 * Displays pencil icon for editing (functionality to be implemented later)
 * @param props - Component props including profile picture URL, name, email, onEdit callback
 * @returns Profile picture display component
 */
export function ProfilePictureDisplay({
  profilePictureUrl,
  name,
  email,
  onEdit,
  disabled = false,
}: ProfilePictureDisplayProps) {
  // Get initials from name or email
  const getInitials = (): string => {
    if (name) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return name[0]?.toUpperCase() || "";
    }
    if (email) {
      return email[0]?.toUpperCase() || "";
    }
    return "?";
  };

  const initials = getInitials();

  return (
    <div className="cls_profile_picture_display">
      <Avatar className="cls_profile_picture_display_avatar h-32 w-32">
        <AvatarImage
          src={profilePictureUrl}
          alt={name ? `Profile picture of ${name}` : "Profile picture"}
          className="cls_profile_picture_display_image"
        />
        <AvatarFallback className="cls_profile_picture_display_fallback bg-slate-200 text-slate-600 text-3xl">
          {initials}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}


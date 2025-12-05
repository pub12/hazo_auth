// file_description: my settings layout component with tabs for profile and security settings
// section: client_directive
"use client";

// section: imports
import { Button } from "../../ui/button";
import { EditableField } from "./components/editable_field";
import { ProfilePictureDisplay } from "./components/profile_picture_display";
import { ProfilePictureDialog } from "./components/profile_picture_dialog";
import { UnauthorizedGuard } from "../shared/components/unauthorized_guard";
import { use_my_settings } from "./hooks/use_my_settings";
import {
  resolveMySettingsLabels,
  resolveMySettingsButtonPalette,
  type MySettingsLabelOverrides,
} from "./config/my_settings_field_config";
import type {
  PasswordRequirementOptions,
  ButtonPaletteOverrides,
} from "../shared/config/layout_customization";
import { formatDistanceToNow } from "date-fns";
import { PasswordField } from "../shared/components/password_field";
import { FormFieldWrapper } from "../shared/components/form_field_wrapper";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "../../../lib/utils";

// section: types
export type MySettingsLayoutProps = {
  className?: string;
  labels?: MySettingsLabelOverrides;
  button_colors?: ButtonPaletteOverrides;
  password_requirements: PasswordRequirementOptions;
  profilePicture: {
    allow_photo_upload: boolean;
    upload_photo_path?: string;
    max_photo_size: number;
    user_photo_default: boolean;
    user_photo_default_priority1: "gravatar" | "library";
    user_photo_default_priority2?: "library" | "gravatar";
    library_photo_path: string;
  };
  userFields: {
    show_name_field: boolean;
    show_email_field: boolean;
    show_password_field: boolean;
  };
  unauthorizedMessage?: string;
  loginButtonLabel?: string;
  loginPath?: string;
  heading?: string;
  subHeading?: string;
  profilePhotoLabel?: string;
  profilePhotoRecommendation?: string;
  uploadPhotoButtonLabel?: string;
  removePhotoButtonLabel?: string;
  profileInformationLabel?: string;
  passwordLabel?: string;
  currentPasswordLabel?: string;
  newPasswordLabel?: string;
  confirmPasswordLabel?: string;
  messages: {
    photo_upload_disabled_message: string;
    gravatar_setup_message: string;
    gravatar_no_account_message: string;
    library_tooltip_message: string;
  };
  uiSizes: {
    gravatar_size: number;
    profile_picture_size: number;
    tooltip_icon_size_default: number;
    tooltip_icon_size_small: number;
    library_photo_grid_columns: number;
    library_photo_preview_size: number;
    image_compression_max_dimension: number;
    upload_file_hard_limit_bytes: number;
  };
  fileTypes: {
    allowed_image_extensions: string[];
    allowed_image_mime_types: string[];
  };
};

// section: component
/**
 * My Settings layout component with tabs for profile and security settings
 * Shows editable fields for name, email, and password change dialog
 * Displays profile picture and last logged in information
 * @param props - Component props including labels, button colors, password requirements, etc.
 * @returns My settings layout component
 */
export default function my_settings_layout({
  className,
  labels,
  button_colors,
  password_requirements,
  profilePicture,
  userFields,
  unauthorizedMessage = "You must be logged in to access this page.",
  loginButtonLabel = "Go to login",
  loginPath = "/hazo_auth/login",
  heading = "Account Settings",
  subHeading = "Manage your profile, password, and email preferences.",
  profilePhotoLabel = "Profile Photo",
  profilePhotoRecommendation = "Recommended size: 200x200px. JPG, PNG.",
  uploadPhotoButtonLabel = "Upload New Photo",
  removePhotoButtonLabel = "Remove",
  profileInformationLabel = "Profile Information",
  passwordLabel = "Password",
  currentPasswordLabel = "Current Password",
  newPasswordLabel = "New Password",
  confirmPasswordLabel = "Confirm Password",
  messages,
  uiSizes,
  fileTypes,
}: MySettingsLayoutProps) {
  const resolvedLabels = resolveMySettingsLabels(labels);
  const resolvedButtonPalette = resolveMySettingsButtonPalette(button_colors);

  const settings = use_my_settings({
    passwordRequirements: password_requirements,
  });

  return (
    <UnauthorizedGuard
      message={unauthorizedMessage}
      loginButtonLabel={loginButtonLabel}
      loginPath={loginPath}
    >
      <div className={cn("cls_my_settings_layout flex flex-col gap-6 p-6 w-full", className)}>
        {/* Header Section */}
        <div className="cls_my_settings_layout_header flex flex-col gap-2">
          <h1 className="cls_my_settings_layout_heading text-3xl font-bold text-[var(--hazo-text-primary)]">
            {heading}
          </h1>
          <p className="cls_my_settings_layout_subheading text-[var(--hazo-text-muted)]">
            {subHeading}
          </p>
        </div>

        {/* Profile Photo Section */}
        <div className="cls_my_settings_layout_profile_photo_section bg-white rounded-lg border border-[var(--hazo-border)] p-6">
          <h2 className="cls_my_settings_layout_section_heading text-lg font-semibold text-[var(--hazo-text-primary)] mb-4">
            {profilePhotoLabel}
          </h2>
          <div className="cls_my_settings_layout_profile_photo_content flex flex-col items-center">
            <div className="cls_my_settings_layout_profile_photo_display relative">
              <ProfilePictureDisplay
                profilePictureUrl={settings.profilePictureUrl}
                name={settings.name}
                email={settings.email}
                onEdit={settings.handleProfilePictureEdit}
              />
              <div className="cls_my_settings_layout_profile_photo_actions absolute left-0 right-0 flex items-center justify-between px-2" style={{ bottom: '-20px' }}>
                <Button
                  type="button"
                  onClick={settings.handleProfilePictureEdit}
                  disabled={settings.loading}
                  variant="ghost"
                  size="icon"
                  className="cls_my_settings_layout_upload_photo_button"
                  aria-label={uploadPhotoButtonLabel}
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  onClick={settings.handleProfilePictureRemove}
                  disabled={settings.loading || !settings.profilePictureUrl}
                  variant="ghost"
                  size="icon"
                  className="cls_my_settings_layout_remove_photo_button text-red-600 hover:text-red-700 hover:bg-red-50"
                  aria-label={removePhotoButtonLabel}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information Section */}
        <div className="cls_my_settings_layout_profile_information_section bg-white rounded-lg border border-[var(--hazo-border)] p-6">
          <h2 className="cls_my_settings_layout_section_heading text-lg font-semibold text-[var(--hazo-text-primary)] mb-4">
            {profileInformationLabel}
          </h2>
          <div className="cls_my_settings_layout_profile_information_fields grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Field */}
            {userFields.show_name_field && (
              <EditableField
                label="Full Name"
                value={settings.name}
                type="text"
                placeholder="Enter your full name"
                onSave={settings.handleNameSave}
                validation={validateName}
                disabled={settings.loading}
                ariaLabel="Full name input field"
              />
            )}

            {/* Email Field */}
            {userFields.show_email_field && (
              <EditableField
                label="Email Address"
                value={settings.email}
                type="email"
                placeholder="Enter your email address"
                onSave={settings.handleEmailSave}
                validation={validateEmail}
                disabled={settings.loading}
                ariaLabel="Email address input field"
              />
            )}
          </div>
        </div>

        {/* Password Section */}
        {userFields.show_password_field && (
          <div className="cls_my_settings_layout_password_section bg-white rounded-lg border border-[var(--hazo-border)] p-6">
            <h2 className="cls_my_settings_layout_section_heading text-lg font-semibold text-[var(--hazo-text-primary)] mb-4">
              {passwordLabel}
            </h2>
            <div className="cls_my_settings_layout_password_fields flex flex-col gap-6">
              {/* Current Password Field - Full Width */}
              <FormFieldWrapper
                fieldId="current-password"
                label={currentPasswordLabel}
                input={
                  <PasswordField
                    inputId="current-password"
                    ariaLabel={currentPasswordLabel}
                    value={settings.passwordFields?.currentPassword || ""}
                    placeholder="Enter your current password"
                    autoComplete="current-password"
                    isVisible={settings.passwordFields?.currentPasswordVisible || false}
                    onChange={(value) => settings.handlePasswordFieldChange("currentPassword", value)}
                    onToggleVisibility={() => settings.togglePasswordVisibility("currentPassword")}
                    errorMessage={settings.passwordFields?.errors?.currentPassword}
                  />
                }
              />

              {/* New Password and Confirm Password Fields - Side by Side */}
              <div className="cls_my_settings_layout_password_fields_row grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* New Password Field */}
                <FormFieldWrapper
                  fieldId="new-password"
                  label={newPasswordLabel}
                  input={
                    <PasswordField
                      inputId="new-password"
                      ariaLabel={newPasswordLabel}
                      value={settings.passwordFields?.newPassword || ""}
                      placeholder="Enter your new password"
                      autoComplete="new-password"
                      isVisible={settings.passwordFields?.newPasswordVisible || false}
                      onChange={(value) => settings.handlePasswordFieldChange("newPassword", value)}
                      onToggleVisibility={() => settings.togglePasswordVisibility("newPassword")}
                      errorMessage={settings.passwordFields?.errors?.newPassword}
                    />
                  }
                />

                {/* Confirm Password Field */}
                <FormFieldWrapper
                  fieldId="confirm-password"
                  label={confirmPasswordLabel}
                  input={
                    <PasswordField
                      inputId="confirm-password"
                      ariaLabel={confirmPasswordLabel}
                      value={settings.passwordFields?.confirmPassword || ""}
                      placeholder="Confirm your new password"
                      autoComplete="new-password"
                      isVisible={settings.passwordFields?.confirmPasswordVisible || false}
                      onChange={(value) => settings.handlePasswordFieldChange("confirmPassword", value)}
                      onToggleVisibility={() => settings.togglePasswordVisibility("confirmPassword")}
                      errorMessage={settings.passwordFields?.errors?.confirmPassword}
                    />
                  }
                />
              </div>
            </div>
            {/* Save Password Button */}
            <div className="cls_my_settings_layout_password_actions flex justify-end mt-4">
              <Button
                type="button"
                onClick={settings.handlePasswordSave}
                disabled={settings.loading || settings.isPasswordSaveDisabled}
                className="cls_my_settings_layout_save_password_button"
                style={{
                  backgroundColor: resolvedButtonPalette.submitBackground,
                  color: resolvedButtonPalette.submitText,
                }}
                aria-label="Save password"
              >
                Save Password
              </Button>
            </div>
          </div>
        )}

        {/* Profile Picture Dialog */}
        <ProfilePictureDialog
          open={settings.profilePictureDialogOpen}
          onOpenChange={(open) => {
            if (open) {
              settings.handleProfilePictureEdit();
            } else {
              settings.handleProfilePictureDialogClose();
            }
          }}
          onSave={settings.handleProfilePictureSave}
          email={settings.email}
          allowPhotoUpload={profilePicture.allow_photo_upload}
          maxPhotoSize={profilePicture.max_photo_size}
          libraryPhotoPath={profilePicture.library_photo_path}
          currentProfilePictureUrl={settings.profilePictureUrl}
          currentProfileSource={settings.profileSource}
          disabled={settings.loading}
          messages={messages}
          uiSizes={uiSizes}
          fileTypes={fileTypes}
        />
      </div>
    </UnauthorizedGuard>
  );
}

// section: validation_helpers
/**
 * Validates name (optional, but if provided should not be empty)
 */
function validateName(name: string): string | null {
  if (name.trim() === "") {
    return "Name cannot be empty";
  }
  return null;
}

/**
 * Validates email format
 */
function validateEmail(email: string): string | null {
  if (!email || email.trim() === "") {
    return "Email is required";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Invalid email address format";
  }
  return null;
}


// file_description: client component for my settings page that initializes hazo_connect and renders my settings layout
// section: client_directive
"use client";

// section: imports
import { useEffect, useState } from "react";
import my_settings_layout from "../../../components/layouts/my_settings";
import type { LayoutDataClient } from "../../../components/layouts/shared/data/layout_data_client";
import type { PasswordRequirementOptions } from "../../../components/layouts/shared/config/layout_customization";

// section: types
type MySettingsPageClientProps = {
  userFields: {
    show_name_field: boolean;
    show_email_field: boolean;
    show_password_field: boolean;
  };
  passwordRequirements: PasswordRequirementOptions;
  profilePicture: {
    allow_photo_upload: boolean;
    upload_photo_path?: string;
    max_photo_size: number;
    user_photo_default: boolean;
    user_photo_default_priority1: "gravatar" | "library";
    user_photo_default_priority2?: "library" | "gravatar";
    library_photo_path: string;
  };
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
  savePasswordButtonLabel?: string;
  unauthorizedMessage?: string;
  loginButtonLabel?: string;
  loginPath?: string;
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
export function MySettingsPageClient({
  userFields,
  passwordRequirements,
  profilePicture,
  heading,
  subHeading,
  profilePhotoLabel,
  profilePhotoRecommendation,
  uploadPhotoButtonLabel,
  removePhotoButtonLabel,
  profileInformationLabel,
  passwordLabel,
  currentPasswordLabel,
  newPasswordLabel,
  confirmPasswordLabel,
  savePasswordButtonLabel,
  unauthorizedMessage,
  loginButtonLabel,
  loginPath,
  messages,
  uiSizes,
  fileTypes,
}: MySettingsPageClientProps) {
  // Note: hazo_connect is not needed for this component as it's a self-service feature
  // All data is fetched via API routes using cookies for authentication
  // The layout component uses use_auth_status hook which calls /api/auth/me

  const MySettingsLayout = my_settings_layout;

  return (
    <MySettingsLayout
      userFields={userFields}
      password_requirements={passwordRequirements}
      profilePicture={profilePicture}
      heading={heading}
      subHeading={subHeading}
      profilePhotoLabel={profilePhotoLabel}
      profilePhotoRecommendation={profilePhotoRecommendation}
      uploadPhotoButtonLabel={uploadPhotoButtonLabel}
      removePhotoButtonLabel={removePhotoButtonLabel}
      profileInformationLabel={profileInformationLabel}
      passwordLabel={passwordLabel}
      currentPasswordLabel={currentPasswordLabel}
      newPasswordLabel={newPasswordLabel}
      confirmPasswordLabel={confirmPasswordLabel}
      unauthorizedMessage={unauthorizedMessage}
      loginButtonLabel={loginButtonLabel}
      loginPath={loginPath}
      messages={messages}
      uiSizes={uiSizes}
      fileTypes={fileTypes}
    />
  );
}


// file_description: server-only helper to read email verification layout configuration from hazo_auth_config.ini
// section: imports
import { get_already_logged_in_config } from "./already_logged_in_config.server";
import { get_config_value } from "./config/config_loader.server";
import verifyEmailDefaultImage from "../assets/images/verify_email_default.jpg";

// section: types
import type { StaticImageData } from "next/image";

export type EmailVerificationConfig = {
  alreadyLoggedInMessage: string;
  showLogoutButton: boolean;
  showReturnHomeButton: boolean;
  returnHomeButtonLabel: string;
  returnHomePath: string;
  imageSrc: string | StaticImageData;
  imageAlt: string;
  imageBackgroundColor: string;
};

// section: helpers
/**
 * Reads email verification layout configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns Email verification configuration options
 */
export function get_email_verification_config(): EmailVerificationConfig {
  const section = "hazo_auth__email_verification_layout";

  // Get shared already logged in config
  const alreadyLoggedInConfig = get_already_logged_in_config();

  // Read image configuration
  // If not set in config, falls back to default image from assets
  const imageSrc = get_config_value(
    section,
    "image_src",
    "" // Empty string means not set in config
  ) || verifyEmailDefaultImage;

  const imageAlt = get_config_value(
    section,
    "image_alt",
    "Email verification illustration"
  );
  const imageBackgroundColor = get_config_value(
    section,
    "image_background_color",
    "#f1f5f9"
  );

  return {
    alreadyLoggedInMessage: alreadyLoggedInConfig.message,
    showLogoutButton: alreadyLoggedInConfig.showLogoutButton,
    showReturnHomeButton: alreadyLoggedInConfig.showReturnHomeButton,
    returnHomeButtonLabel: alreadyLoggedInConfig.returnHomeButtonLabel,
    returnHomePath: alreadyLoggedInConfig.returnHomePath,
    imageSrc,
    imageAlt,
    imageBackgroundColor,
  };
}


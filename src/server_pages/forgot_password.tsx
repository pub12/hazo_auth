// file_description: Zero-config ForgotPasswordPage server component - drop in and use with no configuration required

// section: imports
import { get_forgot_password_config } from "../lib/forgot_password_config.server";
import { ForgotPasswordClientWrapper } from "./forgot_password_client_wrapper";
import { DEFAULT_FORGOT_PASSWORD } from "../lib/config/default_config";
import type { StaticImageData } from "next/image";

export type ForgotPasswordPageProps = {
  /**
   * Optional image source for the visual panel
   * Defaults from hazo_auth_config.ini or package default image
   */
  image_src?: string | StaticImageData;

  /**
   * Optional image alt text
   * Defaults to "Password recovery illustration"
   */
  image_alt?: string;

  /**
   * Optional image background color
   * Defaults to "#f1f5f9"
   */
  image_background_color?: string;

  /**
   * Optional sign in path
   * Defaults from DEFAULT_FORGOT_PASSWORD.loginPath
   */
  sign_in_path?: string;

  /**
   * Optional sign in label
   * Defaults from DEFAULT_FORGOT_PASSWORD.loginLabel
   */
  sign_in_label?: string;
};

// section: component
/**
 * Zero-config ForgotPasswordPage server component
 *
 * This component initializes everything server-side:
 * - Configuration from hazo_auth_config.ini (with sensible defaults)
 *
 * The data client is initialized on the client side to avoid serialization issues.
 *
 * Usage in consuming apps:
 * ```tsx
 * // app/forgot-password/page.tsx
 * import { ForgotPasswordPage } from "hazo_auth/pages/forgot_password";
 *
 * export default function Page() {
 *   return <ForgotPasswordPage />;
 * }
 * ```
 *
 * Zero configuration required - works out of the box!
 *
 * @param props - Optional visual and navigation customization props
 * @returns Server-rendered forgot password page
 */
export default function ForgotPasswordPage({
  image_src,
  image_alt,
  image_background_color,
  sign_in_path = DEFAULT_FORGOT_PASSWORD.loginPath,
  sign_in_label = DEFAULT_FORGOT_PASSWORD.loginLabel,
}: ForgotPasswordPageProps = {}) {
  // Load configuration from INI file (with defaults including asset images)
  const config = get_forgot_password_config();

  // Use props if provided, otherwise fall back to config (which includes default asset image)
  const finalImageSrc = image_src || config.imageSrc;
  const finalImageAlt = image_alt || config.imageAlt;
  const finalImageBackgroundColor = image_background_color || config.imageBackgroundColor;

  // Pass serializable config to client wrapper
  return (
    <ForgotPasswordClientWrapper
      image_src={finalImageSrc}
      image_alt={finalImageAlt}
      image_background_color={finalImageBackgroundColor}
      sign_in_path={sign_in_path}
      sign_in_label={sign_in_label}
      alreadyLoggedInMessage={config.alreadyLoggedInMessage}
      showLogoutButton={config.showLogoutButton}
      showReturnHomeButton={config.showReturnHomeButton}
      returnHomeButtonLabel={config.returnHomeButtonLabel}
      returnHomePath={config.returnHomePath}
    />
  );
}

// Named export for direct imports
export { ForgotPasswordPage };

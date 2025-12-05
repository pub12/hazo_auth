// file_description: Zero-config LoginPage server component - drop in and use with no configuration required

// section: imports
import { get_login_config } from "../lib/login_config.server";
import { LoginClientWrapper } from "./login_client_wrapper";
import type { StaticImageData } from "next/image";

export type LoginPageProps = {
  /**
   * Optional image source for the visual panel
   * Defaults from hazo_auth_config.ini or package default image
   */
  image_src?: string | StaticImageData;

  /**
   * Optional image alt text
   * Defaults to "Secure login illustration"
   */
  image_alt?: string;

  /**
   * Optional image background color
   * Defaults to "#f1f5f9"
   */
  image_background_color?: string;
};

// section: component
/**
 * Zero-config LoginPage server component
 *
 * This component initializes everything server-side:
 * - Configuration from hazo_auth_config.ini (with sensible defaults)
 *
 * The data client and logger are initialized on the client side to avoid serialization issues.
 *
 * Usage in consuming apps:
 * ```tsx
 * // app/login/page.tsx
 * import { LoginPage } from "hazo_auth/pages/login";
 *
 * export default function Page() {
 *   return <LoginPage />;
 * }
 * ```
 *
 * Zero configuration required - works out of the box!
 *
 * @param props - Optional visual customization props
 * @returns Server-rendered login page
 */
export default function LoginPage({
  image_src,
  image_alt,
  image_background_color,
}: LoginPageProps = {}) {
  // Load configuration from INI file (with defaults including asset images)
  const config = get_login_config();

  // Use props if provided, otherwise fall back to config (which includes default asset image)
  const finalImageSrc = image_src || config.imageSrc;
  const finalImageAlt = image_alt || config.imageAlt;
  const finalImageBackgroundColor = image_background_color || config.imageBackgroundColor;

  // Pass serializable config to client wrapper
  return (
    <LoginClientWrapper
      image_src={finalImageSrc}
      image_alt={finalImageAlt}
      image_background_color={finalImageBackgroundColor}
      redirectRoute={config.redirectRoute}
      successMessage={config.successMessage}
      alreadyLoggedInMessage={config.alreadyLoggedInMessage}
      showLogoutButton={config.showLogoutButton}
      showReturnHomeButton={config.showReturnHomeButton}
      returnHomeButtonLabel={config.returnHomeButtonLabel}
      returnHomePath={config.returnHomePath}
      forgotPasswordPath={config.forgotPasswordPath}
      forgotPasswordLabel={config.forgotPasswordLabel}
      createAccountPath={config.createAccountPath}
      createAccountLabel={config.createAccountLabel}
    />
  );
}

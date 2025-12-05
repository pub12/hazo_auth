// file_description: Zero-config RegisterPage server component - drop in and use with no configuration required

// section: imports
import { get_register_config } from "../lib/register_config.server";
import { RegisterClientWrapper } from "./register_client_wrapper";
import type { StaticImageData } from "next/image";

export type RegisterPageProps = {
  /**
   * Optional image source for the visual panel
   * Defaults from hazo_auth_config.ini or package default image
   */
  image_src?: string | StaticImageData;

  /**
   * Optional image alt text
   * Defaults from hazo_auth_config.ini or "Modern building representing user registration"
   */
  image_alt?: string;

  /**
   * Optional image background color
   * Defaults from hazo_auth_config.ini or "#e2e8f0"
   */
  image_background_color?: string;
};


// section: component
/**
 * Zero-config RegisterPage server component
 *
 * This component initializes everything server-side:
 * - Configuration from hazo_auth_config.ini (with sensible defaults)
 * - Password requirements
 * - User field visibility
 *
 * The data client is initialized on the client side to avoid serialization issues.
 *
 * Usage in consuming apps:
 * ```tsx
 * // app/register/page.tsx
 * import { RegisterPage } from "hazo_auth/pages/register";
 *
 * export default function Page() {
 *   return <RegisterPage />;
 * }
 * ```
 *
 * Zero configuration required - works out of the box!
 *
 * @param props - Optional visual customization props
 * @returns Server-rendered register page
 */
export default function RegisterPage({
  image_src,
  image_alt,
  image_background_color,
}: RegisterPageProps = {}) {
  // Load configuration from INI file (with defaults including asset images)
  const config = get_register_config();

  // Use props if provided, otherwise fall back to config (which includes default asset image)
  const finalImageSrc = image_src || config.imageSrc;
  const finalImageAlt = image_alt || config.imageAlt;
  const finalImageBackgroundColor = image_background_color || config.imageBackgroundColor;

  // Pass serializable config to client wrapper
  return (
    <RegisterClientWrapper
      image_src={finalImageSrc}
      image_alt={finalImageAlt}
      image_background_color={finalImageBackgroundColor}
      showNameField={config.showNameField}
      passwordRequirements={config.passwordRequirements}
      alreadyLoggedInMessage={config.alreadyLoggedInMessage}
      showLogoutButton={config.showLogoutButton}
      showReturnHomeButton={config.showReturnHomeButton}
      returnHomeButtonLabel={config.returnHomeButtonLabel}
      returnHomePath={config.returnHomePath}
      signInPath={config.signInPath}
      signInLabel={config.signInLabel}
    />
  );
}

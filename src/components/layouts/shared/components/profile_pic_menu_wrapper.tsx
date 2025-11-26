// file_description: server wrapper component that loads profile picture menu configuration and passes to client component
// section: imports
import { ProfilePicMenu } from "hazo_auth/components/layouts/shared/components/profile_pic_menu";
import { get_profile_pic_menu_config } from "hazo_auth/lib/profile_pic_menu_config.server";

// section: types
export type ProfilePicMenuWrapperProps = {
  className?: string;
  avatar_size?: "default" | "sm" | "lg";
};

// section: component
/**
 * Server wrapper component that loads profile picture menu configuration from hazo_auth_config.ini
 * and passes it to the client ProfilePicMenu component
 * @param props - Component props including className and avatar_size
 * @returns ProfilePicMenu component with loaded configuration
 */
export function ProfilePicMenuWrapper({
  className,
  avatar_size,
}: ProfilePicMenuWrapperProps) {
  const config = get_profile_pic_menu_config();

  return (
    <ProfilePicMenu
      show_single_button={config.show_single_button}
      sign_up_label={config.sign_up_label}
      sign_in_label={config.sign_in_label}
      register_path={config.register_path}
      login_path={config.login_path}
      settings_path={config.settings_path}
      logout_path={config.logout_path}
      custom_menu_items={config.custom_menu_items}
      className={className}
      avatar_size={avatar_size}
    />
  );
}


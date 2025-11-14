// file_description: server-only helper to read profile picture menu configuration from hazo_auth_config.ini
// section: imports
import { get_config_value, get_config_boolean, get_config_array } from "./config/config_loader.server";

// section: types
// Note: These types are also used in client components, but TypeScript types are erased at runtime
// so importing from a server file is safe for type-only imports
export type MenuItemType = "info" | "link" | "separator";

export type ProfilePicMenuMenuItem = {
  type: MenuItemType;
  label?: string; // For info and link types
  value?: string; // For info type (e.g., user name, email)
  href?: string; // For link type
  order: number; // Ordering within type group
  id: string; // Unique identifier for the item
};

export type ProfilePicMenuConfig = {
  show_single_button: boolean;
  sign_up_label: string;
  sign_in_label: string;
  register_path: string;
  login_path: string;
  settings_path: string;
  logout_path: string;
  custom_menu_items: ProfilePicMenuMenuItem[];
};

// section: helpers
/**
 * Parses custom menu items from config string
 * Format: "type:label:order" or "type:label:href:order" for links
 * Example: "link:My Custom Link:/custom:3"
 * @param items_string - Comma-separated string of menu items
 * @returns Array of parsed menu items
 */
function parse_custom_menu_items(items_string: string[]): ProfilePicMenuMenuItem[] {
  const items: ProfilePicMenuMenuItem[] = [];
  
  items_string.forEach((item_string, index) => {
    const parts = item_string.split(":").map((p) => p.trim());
    
    if (parts.length < 3) {
      return; // Invalid format, skip
    }
    
    const type = parts[0] as MenuItemType;
    if (type !== "info" && type !== "link" && type !== "separator") {
      return; // Invalid type, skip
    }
    
    if (type === "separator") {
      const order = parseInt(parts[1] || "1", 10);
      items.push({
        type: "separator",
        order: isNaN(order) ? 1 : order,
        id: `custom_separator_${index}`,
      });
      return;
    }
    
    if (type === "info") {
      const label = parts[1] || "";
      const value = parts[2] || "";
      const order = parseInt(parts[3] || "1", 10);
      
      if (!label || !value) {
        return; // Invalid format, skip
      }
      
      items.push({
        type: "info",
        label,
        value,
        order: isNaN(order) ? 1 : order,
        id: `custom_info_${index}`,
      });
      return;
    }
    
    if (type === "link") {
      const label = parts[1] || "";
      const href = parts[2] || "";
      const order = parseInt(parts[3] || "1", 10);
      
      if (!label || !href) {
        return; // Invalid format, skip
      }
      
      items.push({
        type: "link",
        label,
        href,
        order: isNaN(order) ? 1 : order,
        id: `custom_link_${index}`,
      });
    }
  });
  
  return items;
}

/**
 * Reads profile picture menu configuration from hazo_auth_config.ini file
 * Falls back to defaults if hazo_auth_config.ini is not found or section is missing
 * @returns Profile picture menu configuration options
 */
export function get_profile_pic_menu_config(): ProfilePicMenuConfig {
  const section = "hazo_auth__profile_pic_menu";

  // Read button configuration
  const show_single_button = get_config_boolean(section, "show_single_button", false);
  const sign_up_label = get_config_value(section, "sign_up_label", "Sign Up");
  const sign_in_label = get_config_value(section, "sign_in_label", "Sign In");
  const register_path = get_config_value(section, "register_path", "/register");
  const login_path = get_config_value(section, "login_path", "/login");

  // Read menu paths
  const settings_path = get_config_value(section, "settings_path", "/my_settings");
  const logout_path = get_config_value(section, "logout_path", "/api/auth/logout");

  // Read custom menu items
  const custom_items_string = get_config_array(section, "custom_menu_items", []);
  const custom_menu_items = parse_custom_menu_items(custom_items_string);

  return {
    show_single_button,
    sign_up_label,
    sign_in_label,
    register_path,
    login_path,
    settings_path,
    logout_path,
    custom_menu_items,
  };
}


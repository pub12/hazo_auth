import { resolveButtonPalette, } from "../../shared/config/layout_customization";
// section: field_identifiers
export const MY_SETTINGS_FIELD_IDS = {
    NAME: "name",
    EMAIL: "email_address",
    PASSWORD: "password",
};
const MY_SETTINGS_LABEL_DEFAULTS = {
    heading: "My Settings",
    profileTab: "Profile",
    securityTab: "Security",
    lastLoggedInLabel: "Last logged in",
    profilePictureLabel: "Profile Picture",
    changePasswordButton: "Change Password",
};
export const resolveMySettingsLabels = (overrides) => {
    return Object.assign(Object.assign({}, MY_SETTINGS_LABEL_DEFAULTS), overrides);
};
// section: button_palette_defaults
const MY_SETTINGS_BUTTON_PALETTE_DEFAULTS = {
    submitBackground: "#0f172a",
    submitText: "#ffffff",
    cancelBorder: "#cbd5f5",
    cancelText: "#0f172a",
};
export const resolveMySettingsButtonPalette = (overrides) => resolveButtonPalette(MY_SETTINGS_BUTTON_PALETTE_DEFAULTS, overrides);

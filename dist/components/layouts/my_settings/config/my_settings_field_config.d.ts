import { type ButtonPaletteDefaults, type ButtonPaletteOverrides } from "../../shared/config/layout_customization";
export declare const MY_SETTINGS_FIELD_IDS: {
    readonly NAME: "name";
    readonly EMAIL: "email_address";
    readonly PASSWORD: "password";
};
export type MySettingsFieldId = (typeof MY_SETTINGS_FIELD_IDS)[keyof typeof MY_SETTINGS_FIELD_IDS];
export type MySettingsLabelDefaults = {
    heading: string;
    profileTab: string;
    securityTab: string;
    lastLoggedInLabel: string;
    profilePictureLabel: string;
    changePasswordButton: string;
};
export type MySettingsLabelOverrides = Partial<MySettingsLabelDefaults>;
export declare const resolveMySettingsLabels: (overrides?: MySettingsLabelOverrides) => MySettingsLabelDefaults;
export declare const resolveMySettingsButtonPalette: (overrides?: ButtonPaletteOverrides) => ButtonPaletteDefaults;
//# sourceMappingURL=my_settings_field_config.d.ts.map
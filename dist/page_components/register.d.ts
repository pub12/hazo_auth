import type { PasswordRequirementOverrides } from "../components/layouts/shared/config/layout_customization";
export type RegisterPageProps = {
    showNameField?: boolean;
    passwordRequirements?: PasswordRequirementOverrides;
    alreadyLoggedInMessage?: string;
    showLogoutButton?: boolean;
    showReturnHomeButton?: boolean;
    returnHomeButtonLabel?: string;
    returnHomePath?: string;
    signInPath?: string;
    signInLabel?: string;
    urlOnLogon?: string;
    imageSrc?: string;
    imageAlt?: string;
    imageBackgroundColor?: string;
};
/**
 * Zero-config register page component
 * Uses sensible defaults and can be customized via props
 * @param props - Optional configuration overrides
 * @returns Register page component
 */
export declare function RegisterPage({ showNameField, passwordRequirements, alreadyLoggedInMessage, showLogoutButton, showReturnHomeButton, returnHomeButtonLabel, returnHomePath, signInPath, signInLabel, urlOnLogon, imageSrc, imageAlt, imageBackgroundColor, }?: RegisterPageProps): import("react/jsx-runtime").JSX.Element;
export default RegisterPage;
//# sourceMappingURL=register.d.ts.map
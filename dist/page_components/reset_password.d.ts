import type { PasswordRequirementOverrides } from "../components/layouts/shared/config/layout_customization";
export type ResetPasswordPageProps = {
    errorMessage?: string;
    successMessage?: string;
    loginPath?: string;
    forgotPasswordPath?: string;
    passwordRequirements?: PasswordRequirementOverrides;
    alreadyLoggedInMessage?: string;
    showLogoutButton?: boolean;
    showReturnHomeButton?: boolean;
    returnHomeButtonLabel?: string;
    returnHomePath?: string;
    imageSrc?: string;
    imageAlt?: string;
    imageBackgroundColor?: string;
};
/**
 * Zero-config reset password page component
 * Uses sensible defaults and can be customized via props
 * @param props - Optional configuration overrides
 * @returns Reset password page component
 */
export declare function ResetPasswordPage({ errorMessage, successMessage, loginPath, forgotPasswordPath, passwordRequirements, alreadyLoggedInMessage, showLogoutButton, showReturnHomeButton, returnHomeButtonLabel, returnHomePath, imageSrc, imageAlt, imageBackgroundColor, }?: ResetPasswordPageProps): import("react/jsx-runtime").JSX.Element;
export default ResetPasswordPage;
//# sourceMappingURL=reset_password.d.ts.map
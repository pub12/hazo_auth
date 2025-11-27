export type ForgotPasswordPageProps = {
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
 * Zero-config forgot password page component
 * Uses sensible defaults and can be customized via props
 * @param props - Optional configuration overrides
 * @returns Forgot password page component
 */
export declare function ForgotPasswordPage({ alreadyLoggedInMessage, showLogoutButton, showReturnHomeButton, returnHomeButtonLabel, returnHomePath, imageSrc, imageAlt, imageBackgroundColor, }?: ForgotPasswordPageProps): import("react/jsx-runtime").JSX.Element;
export default ForgotPasswordPage;
//# sourceMappingURL=forgot_password.d.ts.map
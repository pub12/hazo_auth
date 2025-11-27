export type LoginPageProps = {
    redirectRoute?: string;
    successMessage?: string;
    alreadyLoggedInMessage?: string;
    showLogoutButton?: boolean;
    showReturnHomeButton?: boolean;
    returnHomeButtonLabel?: string;
    returnHomePath?: string;
    forgotPasswordPath?: string;
    forgotPasswordLabel?: string;
    createAccountPath?: string;
    createAccountLabel?: string;
    urlOnLogon?: string;
    imageSrc?: string;
    imageAlt?: string;
    imageBackgroundColor?: string;
};
/**
 * Zero-config login page component
 * Uses sensible defaults and can be customized via props
 * @param props - Optional configuration overrides
 * @returns Login page component
 */
export declare function LoginPage({ redirectRoute, successMessage, alreadyLoggedInMessage, showLogoutButton, showReturnHomeButton, returnHomeButtonLabel, returnHomePath, forgotPasswordPath, forgotPasswordLabel, createAccountPath, createAccountLabel, urlOnLogon, imageSrc, imageAlt, imageBackgroundColor, }?: LoginPageProps): import("react/jsx-runtime").JSX.Element;
export default LoginPage;
//# sourceMappingURL=login.d.ts.map
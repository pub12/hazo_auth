/**
 * @deprecated This client component is deprecated in hazo_auth v2.0+
 * Use the new server component version instead: `import { LoginPage } from "hazo_auth/pages/login"`
 */
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
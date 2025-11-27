export type VerifyEmailPageProps = {
    alreadyLoggedInMessage?: string;
    showLogoutButton?: boolean;
    showReturnHomeButton?: boolean;
    returnHomeButtonLabel?: string;
    returnHomePath?: string;
    redirectDelay?: number;
    loginPath?: string;
    imageSrc?: string;
    imageAlt?: string;
    imageBackgroundColor?: string;
};
/**
 * Zero-config verify email page component
 * Uses sensible defaults and can be customized via props
 * @param props - Optional configuration overrides
 * @returns Verify email page component
 */
export declare function VerifyEmailPage({ alreadyLoggedInMessage, showLogoutButton, showReturnHomeButton, returnHomeButtonLabel, returnHomePath, redirectDelay, loginPath, imageSrc, imageAlt, imageBackgroundColor, }?: VerifyEmailPageProps): import("react/jsx-runtime").JSX.Element;
export default VerifyEmailPage;
//# sourceMappingURL=verify_email.d.ts.map
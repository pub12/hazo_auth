export type GoogleSignInButtonProps = {
    /** Text displayed on the button */
    label?: string;
    /** Custom click handler - if not provided, redirects to Google OAuth */
    onClick?: () => void;
    /** Disable the button */
    disabled?: boolean;
    /** Additional CSS classes */
    className?: string;
    /** Callback URL after OAuth (default: /api/hazo_auth/oauth/google/callback) */
    callbackUrl?: string;
};
/**
 * Google Sign-In button component
 * Displays the Google logo with configurable text
 * Initiates the Google OAuth flow when clicked
 * Uses next-auth/react signIn function for proper OAuth flow
 */
export declare function GoogleSignInButton({ label, onClick, disabled, className, callbackUrl, }: GoogleSignInButtonProps): import("react/jsx-runtime").JSX.Element;
export default GoogleSignInButton;
//# sourceMappingURL=google_sign_in_button.d.ts.map
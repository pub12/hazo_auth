import type { HazoConnectAdapter } from "hazo_connect";
export type PostVerificationAction = "redirect" | "create_firm";
export type PostVerificationResult = {
    success: boolean;
    action: PostVerificationAction;
    redirect_url?: string;
    invitation_accepted?: boolean;
    error?: string;
};
export type PostVerificationOptions = {
    default_redirect_url?: string;
    create_firm_url?: string;
};
export type PostLoginRedirectOptions = {
    /** Default redirect for users with scopes (default: "/") */
    default_redirect?: string;
    /** URL for users who need to create a firm (default: "/hazo_auth/create_firm") */
    create_firm_url?: string;
    /** Skip invitation table check (set true if not using invitations) */
    skip_invitation_check?: boolean;
    /** Redirect when skip_invitation_check=true and user has no scope */
    no_scope_redirect?: string;
};
export type PostLoginRedirectResult = {
    /** The URL to redirect the user to */
    redirect_url: string;
    /** True if user needs onboarding (no scope, create firm, etc.) */
    needs_onboarding: boolean;
    /** True if invitation check was skipped due to config */
    invitation_check_skipped?: boolean;
    /** True if invitation table query failed (table missing) */
    invitation_table_error?: boolean;
};
/**
 * Handles the post-email-verification flow
 *
 * Flow:
 * 1. Check if user has entry in hazo_user_scopes
 *    - If YES: redirect to url_on_logon or default
 * 2. If NO hazo_user_scopes entry:
 *    - Check hazo_invitations for pending invitation
 *    - If invitation exists: accept it, create user_scope, redirect
 * 3. If NO invitation:
 *    - Return action='create_firm' (user needs to create their firm)
 *
 * @param adapter - HazoConnect adapter
 * @param user_id - User ID (after email verification)
 * @param user_email - User email (for invitation lookup)
 * @param options - Configuration options
 */
export declare function handle_post_verification(adapter: HazoConnectAdapter, user_id: string, user_email: string, options?: PostVerificationOptions): Promise<PostVerificationResult>;
/**
 * Simplified version for login flow - checks if user needs to complete onboarding
 * Returns true if user has no scope assignment (needs to create firm or check invitation)
 */
export declare function needs_onboarding(adapter: HazoConnectAdapter, user_id: string): Promise<boolean>;
/**
 * Gets the appropriate redirect URL for a user after login
 * Takes into account scope status, invitations, and url_on_logon
 *
 * @param adapter - HazoConnect adapter
 * @param user_id - User ID
 * @param user_email - User email (for invitation lookup)
 * @param options - Configuration options (or string for backwards compatibility)
 */
export declare function get_post_login_redirect(adapter: HazoConnectAdapter, user_id: string, user_email: string, options?: PostLoginRedirectOptions | string): Promise<PostLoginRedirectResult>;
//# sourceMappingURL=post_verification_service.d.ts.map
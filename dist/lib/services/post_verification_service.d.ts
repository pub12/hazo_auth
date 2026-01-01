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
 * Takes into account scope status and url_on_logon
 */
export declare function get_post_login_redirect(adapter: HazoConnectAdapter, user_id: string, user_email: string, default_redirect?: string): Promise<{
    redirect_url: string;
    needs_onboarding: boolean;
}>;
//# sourceMappingURL=post_verification_service.d.ts.map
// file_description: service for handling post-email-verification flow
// section: imports
import type { HazoConnectAdapter } from "hazo_connect";
import { createCrudService } from "hazo_connect/server";
import { create_app_logger } from "../app_logger";
import { sanitize_error_for_user } from "../utils/error_sanitizer";
import { user_has_any_scope } from "./user_scope_service";
import {
  get_pending_invitation_by_email,
  accept_invitation,
} from "./invitation_service";

// section: types

export type PostVerificationAction = "redirect" | "create_firm";

export type PostVerificationResult = {
  success: boolean;
  action: PostVerificationAction;
  redirect_url?: string;
  invitation_accepted?: boolean;
  error?: string;
};

export type PostVerificationOptions = {
  default_redirect_url?: string; // Default: "/"
  create_firm_url?: string; // Default: "/hazo_auth/create_firm"
};

// section: constants

const DEFAULT_REDIRECT_URL = "/";
const CREATE_FIRM_URL = "/hazo_auth/create_firm";

// section: helpers

/**
 * Gets the user's url_on_logon from the database
 */
async function get_user_url_on_logon(
  adapter: HazoConnectAdapter,
  user_id: string,
): Promise<string | null> {
  try {
    const user_service = createCrudService(adapter, "hazo_users");
    const users = await user_service.findBy({ id: user_id });

    if (Array.isArray(users) && users.length > 0) {
      return (users[0] as { url_on_logon?: string | null }).url_on_logon || null;
    }

    return null;
  } catch {
    return null;
  }
}

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
export async function handle_post_verification(
  adapter: HazoConnectAdapter,
  user_id: string,
  user_email: string,
  options?: PostVerificationOptions,
): Promise<PostVerificationResult> {
  try {
    const default_redirect = options?.default_redirect_url || DEFAULT_REDIRECT_URL;
    const create_firm_url = options?.create_firm_url || CREATE_FIRM_URL;

    // Step 1: Check if user already has a scope assignment
    const has_scope = await user_has_any_scope(adapter, user_id);

    if (has_scope) {
      // User already has scope - redirect to their landing page
      const url_on_logon = await get_user_url_on_logon(adapter, user_id);

      return {
        success: true,
        action: "redirect",
        redirect_url: url_on_logon || default_redirect,
      };
    }

    // Step 2: Check for pending invitation
    const invitation_result = await get_pending_invitation_by_email(
      adapter,
      user_email,
    );

    if (invitation_result.success && invitation_result.invitation) {
      // Accept the invitation
      const accept_result = await accept_invitation(
        adapter,
        invitation_result.invitation.id,
        user_id,
      );

      if (accept_result.success) {
        // Invitation accepted - redirect to landing page
        const url_on_logon = await get_user_url_on_logon(adapter, user_id);

        return {
          success: true,
          action: "redirect",
          redirect_url: url_on_logon || default_redirect,
          invitation_accepted: true,
        };
      } else {
        // Failed to accept invitation - log but continue to create_firm
        const logger = create_app_logger();
        logger.warn("accept_invitation_failed", {
          filename: "post_verification_service.ts",
          line_number: 0,
          user_id,
          invitation_id: invitation_result.invitation.id,
          error: accept_result.error,
        });
      }
    }

    // Step 3: No scope and no invitation - user needs to create a firm
    return {
      success: true,
      action: "create_firm",
      redirect_url: create_firm_url,
    };
  } catch (error) {
    const logger = create_app_logger();
    const error_message = sanitize_error_for_user(error, {
      logToConsole: true,
      logToLogger: true,
      logger,
      context: {
        filename: "post_verification_service.ts",
        line_number: 0,
        operation: "handle_post_verification",
        user_id,
        user_email,
      },
    });

    // On error, default to create_firm action
    return {
      success: false,
      action: "create_firm",
      redirect_url: options?.create_firm_url || CREATE_FIRM_URL,
      error: error_message,
    };
  }
}

/**
 * Simplified version for login flow - checks if user needs to complete onboarding
 * Returns true if user has no scope assignment (needs to create firm or check invitation)
 */
export async function needs_onboarding(
  adapter: HazoConnectAdapter,
  user_id: string,
): Promise<boolean> {
  try {
    return !(await user_has_any_scope(adapter, user_id));
  } catch {
    return true; // On error, assume onboarding needed
  }
}

/**
 * Gets the appropriate redirect URL for a user after login
 * Takes into account scope status and url_on_logon
 */
export async function get_post_login_redirect(
  adapter: HazoConnectAdapter,
  user_id: string,
  user_email: string,
  default_redirect: string = DEFAULT_REDIRECT_URL,
): Promise<{ redirect_url: string; needs_onboarding: boolean }> {
  try {
    // Check if user has scope
    const has_scope = await user_has_any_scope(adapter, user_id);

    if (!has_scope) {
      // Check for invitation
      const invitation_result = await get_pending_invitation_by_email(
        adapter,
        user_email,
      );

      if (invitation_result.success && invitation_result.invitation) {
        // Has invitation - they need to complete the flow
        return {
          redirect_url: CREATE_FIRM_URL,
          needs_onboarding: true,
        };
      }

      // No scope, no invitation - needs to create firm
      return {
        redirect_url: CREATE_FIRM_URL,
        needs_onboarding: true,
      };
    }

    // Has scope - get their url_on_logon
    const url_on_logon = await get_user_url_on_logon(adapter, user_id);

    return {
      redirect_url: url_on_logon || default_redirect,
      needs_onboarding: false,
    };
  } catch {
    return {
      redirect_url: default_redirect,
      needs_onboarding: false,
    };
  }
}

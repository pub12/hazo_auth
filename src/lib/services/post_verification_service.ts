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
import { is_multi_tenancy_enabled } from "../multi_tenancy_config.server";

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

    // If multi-tenancy is disabled, skip all scope/invitation checks
    if (!is_multi_tenancy_enabled()) {
      return {
        success: true,
        action: "redirect",
        redirect_url: default_redirect,
      };
    }

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
  // If multi-tenancy is disabled, no onboarding needed
  if (!is_multi_tenancy_enabled()) {
    return false;
  }

  try {
    return !(await user_has_any_scope(adapter, user_id));
  } catch {
    return true; // On error, assume onboarding needed
  }
}

/**
 * Gets the appropriate redirect URL for a user after login
 * Takes into account scope status, invitations, and url_on_logon
 *
 * @param adapter - HazoConnect adapter
 * @param user_id - User ID
 * @param user_email - User email (for invitation lookup)
 * @param options - Configuration options (or string for backwards compatibility)
 */
export async function get_post_login_redirect(
  adapter: HazoConnectAdapter,
  user_id: string,
  user_email: string,
  options?: PostLoginRedirectOptions | string,
): Promise<PostLoginRedirectResult> {
  // Handle backwards compatibility: if options is a string, treat it as default_redirect
  const opts: PostLoginRedirectOptions = typeof options === "string"
    ? { default_redirect: options }
    : options || {};

  const default_redirect = opts.default_redirect || DEFAULT_REDIRECT_URL;
  const create_firm_url = opts.create_firm_url || CREATE_FIRM_URL;
  const skip_invitation_check = opts.skip_invitation_check || false;
  const no_scope_redirect = opts.no_scope_redirect || DEFAULT_REDIRECT_URL;

  // If multi-tenancy is disabled, skip all scope/invitation checks
  if (!is_multi_tenancy_enabled()) {
    return {
      redirect_url: default_redirect,
      needs_onboarding: false,
    };
  }

  try {
    // Check if user has scope
    const has_scope = await user_has_any_scope(adapter, user_id);

    if (!has_scope) {
      // User has no scope - check invitations (unless skipped)
      if (skip_invitation_check) {
        // Invitation check skipped via config - redirect to no_scope_redirect
        return {
          redirect_url: no_scope_redirect,
          needs_onboarding: true,
          invitation_check_skipped: true,
        };
      }

      // Check for invitation
      const invitation_result = await get_pending_invitation_by_email(
        adapter,
        user_email,
      );

      // Check if invitation table is missing
      if (invitation_result.table_missing) {
        // Table doesn't exist - redirect to create_firm_url but flag the error
        return {
          redirect_url: create_firm_url,
          needs_onboarding: true,
          invitation_table_error: true,
        };
      }

      if (invitation_result.success && invitation_result.invitation) {
        // Has invitation - they need to complete the flow
        return {
          redirect_url: create_firm_url,
          needs_onboarding: true,
        };
      }

      // No scope, no invitation - needs to create firm
      return {
        redirect_url: create_firm_url,
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

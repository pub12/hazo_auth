// file_description: service for managing user invitations using hazo_connect
// section: imports
import type { HazoConnectAdapter } from "hazo_connect";
import { createCrudService } from "hazo_connect/server";
import { create_app_logger } from "../app_logger";
import { sanitize_error_for_user } from "../utils/error_sanitizer";
import { assign_user_scope } from "./user_scope_service";
import { get_scope_by_id, get_root_scope_id } from "./scope_service";

// section: types

export type InvitationStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";

export type InvitationRecord = {
  id: string;
  email_address: string;
  scope_id: string;
  role_id: string;
  status: InvitationStatus;
  invited_by: string | null;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
  changed_at: string;
};

export type InvitationServiceResult = {
  success: boolean;
  invitation?: InvitationRecord;
  invitations?: InvitationRecord[];
  error?: string;
  /** Set to true when the hazo_invitations table doesn't exist */
  table_missing?: boolean;
};

export type CreateInvitationData = {
  email_address: string;
  scope_id: string;
  role_id: string;
  invited_by?: string;
  expires_in_hours?: number; // Default: 48
};

// section: constants

const DEFAULT_EXPIRY_HOURS = 48;
const MAX_PENDING_PER_EMAIL = 5;

// section: helpers

/**
 * Creates a new invitation
 */
export async function create_invitation(
  adapter: HazoConnectAdapter,
  data: CreateInvitationData,
): Promise<InvitationServiceResult> {
  try {
    const invitation_service = createCrudService(adapter, "hazo_invitations");
    const now = new Date();

    // Validate scope exists
    const scope_result = await get_scope_by_id(adapter, data.scope_id);
    if (!scope_result.success) {
      return {
        success: false,
        error: "Scope not found",
      };
    }

    // Check max pending invitations per email
    const existing = await invitation_service.findBy({
      email_address: data.email_address.toLowerCase(),
      status: "PENDING",
    });

    if (Array.isArray(existing) && existing.length >= MAX_PENDING_PER_EMAIL) {
      return {
        success: false,
        error: `Maximum of ${MAX_PENDING_PER_EMAIL} pending invitations per email reached`,
      };
    }

    // Calculate expiration
    const expires_hours = data.expires_in_hours || DEFAULT_EXPIRY_HOURS;
    const expires_at = new Date(now.getTime() + expires_hours * 60 * 60 * 1000);

    const inserted = await invitation_service.insert({
      email_address: data.email_address.toLowerCase(),
      scope_id: data.scope_id,
      role_id: data.role_id,
      status: "PENDING",
      invited_by: data.invited_by || null,
      expires_at: expires_at.toISOString(),
      accepted_at: null,
      created_at: now.toISOString(),
      changed_at: now.toISOString(),
    });

    if (!Array.isArray(inserted) || inserted.length === 0) {
      return {
        success: false,
        error: "Failed to create invitation",
      };
    }

    return {
      success: true,
      invitation: inserted[0] as InvitationRecord,
    };
  } catch (error) {
    const logger = create_app_logger();
    const error_message = sanitize_error_for_user(error, {
      logToConsole: true,
      logToLogger: true,
      logger,
      context: {
        filename: "invitation_service.ts",
        line_number: 0,
        operation: "create_invitation",
        email_address: data.email_address,
      },
    });

    return {
      success: false,
      error: error_message,
    };
  }
}

/**
 * Gets a pending invitation by email address
 * Returns the most recent pending invitation if multiple exist
 */
export async function get_pending_invitation_by_email(
  adapter: HazoConnectAdapter,
  email_address: string,
): Promise<InvitationServiceResult> {
  try {
    const invitation_service = createCrudService(adapter, "hazo_invitations");
    const now = new Date();

    const invitations = await invitation_service.findBy({
      email_address: email_address.toLowerCase(),
      status: "PENDING",
    });

    if (!Array.isArray(invitations) || invitations.length === 0) {
      return {
        success: false,
        error: "No pending invitation found",
      };
    }

    // Filter out expired invitations and sort by created_at desc
    const valid_invitations = (invitations as InvitationRecord[])
      .filter((inv) => new Date(inv.expires_at) > now)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

    if (valid_invitations.length === 0) {
      return {
        success: false,
        error: "No valid pending invitation found (all expired)",
      };
    }

    return {
      success: true,
      invitation: valid_invitations[0],
    };
  } catch (error) {
    const logger = create_app_logger();

    // Check if the error indicates the table doesn't exist
    const error_string = error instanceof Error ? error.message : String(error);
    const is_table_missing =
      // SQLite: "no such table: hazo_invitations"
      error_string.toLowerCase().includes("no such table") ||
      // PostgreSQL: 'relation "hazo_invitations" does not exist'
      (error_string.toLowerCase().includes("relation") && error_string.toLowerCase().includes("does not exist")) ||
      // PostgREST: 404 response for missing table
      (error_string.includes("404") && error_string.includes("hazo_invitations"));

    if (is_table_missing) {
      logger.warn("invitation_table_missing", {
        filename: "invitation_service.ts",
        line_number: 0,
        operation: "get_pending_invitation_by_email",
        email_address,
        note: "hazo_invitations table does not exist - run migration or set skip_invitation_check=true",
      });

      return {
        success: false,
        error: "Invitation table not found",
        table_missing: true,
      };
    }

    const error_message = sanitize_error_for_user(error, {
      logToConsole: true,
      logToLogger: true,
      logger,
      context: {
        filename: "invitation_service.ts",
        line_number: 0,
        operation: "get_pending_invitation_by_email",
        email_address,
      },
    });

    return {
      success: false,
      error: error_message,
    };
  }
}

/**
 * Gets an invitation by ID
 */
export async function get_invitation_by_id(
  adapter: HazoConnectAdapter,
  invitation_id: string,
): Promise<InvitationServiceResult> {
  try {
    const invitation_service = createCrudService(adapter, "hazo_invitations");
    const invitations = await invitation_service.findBy({ id: invitation_id });

    if (!Array.isArray(invitations) || invitations.length === 0) {
      return {
        success: false,
        error: "Invitation not found",
      };
    }

    return {
      success: true,
      invitation: invitations[0] as InvitationRecord,
    };
  } catch (error) {
    const logger = create_app_logger();
    const error_message = sanitize_error_for_user(error, {
      logToConsole: true,
      logToLogger: true,
      logger,
      context: {
        filename: "invitation_service.ts",
        line_number: 0,
        operation: "get_invitation_by_id",
        invitation_id,
      },
    });

    return {
      success: false,
      error: error_message,
    };
  }
}

/**
 * Accepts an invitation and creates the user scope assignment
 */
export async function accept_invitation(
  adapter: HazoConnectAdapter,
  invitation_id: string,
  user_id: string,
): Promise<InvitationServiceResult> {
  try {
    const invitation_service = createCrudService(adapter, "hazo_invitations");
    const now = new Date();

    // Get the invitation
    const invitation_result = await get_invitation_by_id(
      adapter,
      invitation_id,
    );
    if (!invitation_result.success || !invitation_result.invitation) {
      return invitation_result;
    }

    const invitation = invitation_result.invitation;

    // Check status
    if (invitation.status !== "PENDING") {
      return {
        success: false,
        error: `Invitation is ${invitation.status}, not PENDING`,
      };
    }

    // Check expiration
    if (new Date(invitation.expires_at) < now) {
      // Mark as expired
      await invitation_service.updateById(invitation_id, {
        status: "EXPIRED",
        changed_at: now.toISOString(),
      });

      return {
        success: false,
        error: "Invitation has expired",
      };
    }

    // Get root_scope_id for the scope
    const root_scope_id = await get_root_scope_id(adapter, invitation.scope_id);

    // Create user scope assignment
    const scope_result = await assign_user_scope(adapter, {
      user_id,
      scope_id: invitation.scope_id,
      role_id: invitation.role_id,
      root_scope_id: root_scope_id || invitation.scope_id,
    });

    if (!scope_result.success) {
      return {
        success: false,
        error: scope_result.error || "Failed to assign scope to user",
      };
    }

    // Mark invitation as accepted
    const updated = await invitation_service.updateById(invitation_id, {
      status: "ACCEPTED",
      accepted_at: now.toISOString(),
      changed_at: now.toISOString(),
    });

    if (!Array.isArray(updated) || updated.length === 0) {
      return {
        success: false,
        error: "Failed to update invitation status",
      };
    }

    return {
      success: true,
      invitation: updated[0] as InvitationRecord,
    };
  } catch (error) {
    const logger = create_app_logger();
    const error_message = sanitize_error_for_user(error, {
      logToConsole: true,
      logToLogger: true,
      logger,
      context: {
        filename: "invitation_service.ts",
        line_number: 0,
        operation: "accept_invitation",
        invitation_id,
        user_id,
      },
    });

    return {
      success: false,
      error: error_message,
    };
  }
}

/**
 * Revokes an invitation
 */
export async function revoke_invitation(
  adapter: HazoConnectAdapter,
  invitation_id: string,
): Promise<InvitationServiceResult> {
  try {
    const invitation_service = createCrudService(adapter, "hazo_invitations");
    const now = new Date();

    // Get the invitation
    const invitation_result = await get_invitation_by_id(
      adapter,
      invitation_id,
    );
    if (!invitation_result.success || !invitation_result.invitation) {
      return invitation_result;
    }

    // Check status
    if (invitation_result.invitation.status !== "PENDING") {
      return {
        success: false,
        error: `Cannot revoke invitation with status ${invitation_result.invitation.status}`,
      };
    }

    // Mark as revoked
    const updated = await invitation_service.updateById(invitation_id, {
      status: "REVOKED",
      changed_at: now.toISOString(),
    });

    if (!Array.isArray(updated) || updated.length === 0) {
      return {
        success: false,
        error: "Failed to revoke invitation",
      };
    }

    return {
      success: true,
      invitation: updated[0] as InvitationRecord,
    };
  } catch (error) {
    const logger = create_app_logger();
    const error_message = sanitize_error_for_user(error, {
      logToConsole: true,
      logToLogger: true,
      logger,
      context: {
        filename: "invitation_service.ts",
        line_number: 0,
        operation: "revoke_invitation",
        invitation_id,
      },
    });

    return {
      success: false,
      error: error_message,
    };
  }
}

/**
 * Lists invitations by scope
 */
export async function list_invitations_by_scope(
  adapter: HazoConnectAdapter,
  scope_id: string,
  status?: InvitationStatus,
): Promise<InvitationServiceResult> {
  try {
    const invitation_service = createCrudService(adapter, "hazo_invitations");

    const filters: Record<string, unknown> = { scope_id };
    if (status) {
      filters.status = status;
    }

    const invitations = await invitation_service.findBy(filters);

    return {
      success: true,
      invitations: Array.isArray(invitations)
        ? (invitations as InvitationRecord[])
        : [],
    };
  } catch (error) {
    const logger = create_app_logger();
    const error_message = sanitize_error_for_user(error, {
      logToConsole: true,
      logToLogger: true,
      logger,
      context: {
        filename: "invitation_service.ts",
        line_number: 0,
        operation: "list_invitations_by_scope",
        scope_id,
      },
    });

    return {
      success: false,
      error: error_message,
    };
  }
}

/**
 * Lists all invitations (for super admin)
 */
export async function list_all_invitations(
  adapter: HazoConnectAdapter,
  status?: InvitationStatus,
): Promise<InvitationServiceResult> {
  try {
    const invitation_service = createCrudService(adapter, "hazo_invitations");

    const filters: Record<string, unknown> = {};
    if (status) {
      filters.status = status;
    }

    const invitations = await invitation_service.findBy(filters);

    return {
      success: true,
      invitations: Array.isArray(invitations)
        ? (invitations as InvitationRecord[])
        : [],
    };
  } catch (error) {
    const logger = create_app_logger();
    const error_message = sanitize_error_for_user(error, {
      logToConsole: true,
      logToLogger: true,
      logger,
      context: {
        filename: "invitation_service.ts",
        line_number: 0,
        operation: "list_all_invitations",
      },
    });

    return {
      success: false,
      error: error_message,
    };
  }
}

/**
 * Expires old pending invitations (batch operation)
 * Returns count of expired invitations
 */
export async function expire_old_invitations(
  adapter: HazoConnectAdapter,
): Promise<{ success: boolean; expired_count?: number; error?: string }> {
  try {
    const invitation_service = createCrudService(adapter, "hazo_invitations");
    const now = new Date();

    // Get all pending invitations
    const invitations = await invitation_service.findBy({ status: "PENDING" });

    if (!Array.isArray(invitations)) {
      return { success: true, expired_count: 0 };
    }

    let expired_count = 0;
    for (const inv of invitations as InvitationRecord[]) {
      if (new Date(inv.expires_at) < now) {
        await invitation_service.updateById(inv.id, {
          status: "EXPIRED",
          changed_at: now.toISOString(),
        });
        expired_count++;
      }
    }

    return { success: true, expired_count };
  } catch (error) {
    const logger = create_app_logger();
    const error_message = sanitize_error_for_user(error, {
      logToConsole: true,
      logToLogger: true,
      logger,
      context: {
        filename: "invitation_service.ts",
        line_number: 0,
        operation: "expire_old_invitations",
      },
    });

    return {
      success: false,
      error: error_message,
    };
  }
}

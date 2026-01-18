import type { HazoConnectAdapter } from "hazo_connect";
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
    expires_in_hours?: number;
};
/**
 * Creates a new invitation
 */
export declare function create_invitation(adapter: HazoConnectAdapter, data: CreateInvitationData): Promise<InvitationServiceResult>;
/**
 * Gets a pending invitation by email address
 * Returns the most recent pending invitation if multiple exist
 */
export declare function get_pending_invitation_by_email(adapter: HazoConnectAdapter, email_address: string): Promise<InvitationServiceResult>;
/**
 * Gets an invitation by ID
 */
export declare function get_invitation_by_id(adapter: HazoConnectAdapter, invitation_id: string): Promise<InvitationServiceResult>;
/**
 * Accepts an invitation and creates the user scope assignment
 */
export declare function accept_invitation(adapter: HazoConnectAdapter, invitation_id: string, user_id: string): Promise<InvitationServiceResult>;
/**
 * Revokes an invitation
 */
export declare function revoke_invitation(adapter: HazoConnectAdapter, invitation_id: string): Promise<InvitationServiceResult>;
/**
 * Lists invitations by scope
 */
export declare function list_invitations_by_scope(adapter: HazoConnectAdapter, scope_id: string, status?: InvitationStatus): Promise<InvitationServiceResult>;
/**
 * Lists all invitations (for super admin)
 */
export declare function list_all_invitations(adapter: HazoConnectAdapter, status?: InvitationStatus): Promise<InvitationServiceResult>;
/**
 * Expires old pending invitations (batch operation)
 * Returns count of expired invitations
 */
export declare function expire_old_invitations(adapter: HazoConnectAdapter): Promise<{
    success: boolean;
    expired_count?: number;
    error?: string;
}>;
//# sourceMappingURL=invitation_service.d.ts.map
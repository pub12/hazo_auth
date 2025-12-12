// file_description: Connected accounts section showing linked OAuth providers
// section: client_directive
"use client";

// section: imports
import { GoogleIcon } from "../../shared/components/google_icon";

// section: types
export type ConnectedAccountsSectionProps = {
  /** Whether Google account is connected */
  googleConnected: boolean;
  /** User's email address (shown when Google is connected) */
  email?: string;
  /** Section heading */
  heading?: string;
  /** Loading state */
  loading?: boolean;
};

// section: component
/**
 * Connected Accounts Section for My Settings
 * Shows which OAuth providers are linked to the user's account
 * Currently supports Google, designed for future extensibility
 */
export function ConnectedAccountsSection({
  googleConnected,
  email,
  heading = "Connected Accounts",
  loading = false,
}: ConnectedAccountsSectionProps) {
  return (
    <div className="cls_my_settings_connected_accounts_section bg-white rounded-lg border border-[var(--hazo-border)] p-6">
      <h2 className="cls_my_settings_section_heading text-lg font-semibold text-[var(--hazo-text-primary)] mb-4">
        {heading}
      </h2>
      <div className="cls_connected_accounts_list flex flex-col gap-3">
        {/* Google Account */}
        <div className="cls_connected_account_item flex items-center justify-between p-3 rounded-md border border-[var(--hazo-border)] bg-[var(--hazo-surface-muted)]">
          <div className="cls_connected_account_info flex items-center gap-3">
            <div className="cls_connected_account_icon flex items-center justify-center w-10 h-10 rounded-full bg-white border border-[var(--hazo-border)]">
              <GoogleIcon width={20} height={20} />
            </div>
            <div className="cls_connected_account_details flex flex-col">
              <span className="cls_connected_account_name font-medium text-[var(--hazo-text-primary)]">
                Google
              </span>
              {googleConnected && email && (
                <span className="cls_connected_account_email text-sm text-[var(--hazo-text-muted)]">
                  {email}
                </span>
              )}
            </div>
          </div>
          <div className="cls_connected_account_status">
            {loading ? (
              <span className="cls_connected_account_loading text-sm text-[var(--hazo-text-muted)] animate-pulse">
                Loading...
              </span>
            ) : googleConnected ? (
              <span className="cls_connected_account_connected inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <span className="cls_connected_indicator w-1.5 h-1.5 rounded-full bg-green-500" />
                Connected
              </span>
            ) : (
              <span className="cls_connected_account_not_connected inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                <span className="cls_not_connected_indicator w-1.5 h-1.5 rounded-full bg-slate-400" />
                Not connected
              </span>
            )}
          </div>
        </div>
      </div>
      <p className="cls_connected_accounts_help text-sm text-[var(--hazo-text-muted)] mt-4">
        {googleConnected
          ? "Your Google account is linked. You can sign in using either your password or Google."
          : "Link your Google account to enable quick sign-in with Google."}
      </p>
    </div>
  );
}

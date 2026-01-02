// file_description: Connected accounts section showing linked OAuth providers
// section: client_directive
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// section: imports
import { GoogleIcon } from "../../shared/components/google_icon.js";
// section: component
/**
 * Connected Accounts Section for My Settings
 * Shows which OAuth providers are linked to the user's account
 * Currently supports Google, designed for future extensibility
 */
export function ConnectedAccountsSection({ googleConnected, email, heading = "Connected Accounts", loading = false, }) {
    return (_jsxs("div", { className: "cls_my_settings_connected_accounts_section bg-white rounded-lg border border-[var(--hazo-border)] p-6", children: [_jsx("h2", { className: "cls_my_settings_section_heading text-lg font-semibold text-[var(--hazo-text-primary)] mb-4", children: heading }), _jsx("div", { className: "cls_connected_accounts_list flex flex-col gap-3", children: _jsxs("div", { className: "cls_connected_account_item flex items-center justify-between p-3 rounded-md border border-[var(--hazo-border)] bg-[var(--hazo-surface-muted)]", children: [_jsxs("div", { className: "cls_connected_account_info flex items-center gap-3", children: [_jsx("div", { className: "cls_connected_account_icon flex items-center justify-center w-10 h-10 rounded-full bg-white border border-[var(--hazo-border)]", children: _jsx(GoogleIcon, { width: 20, height: 20 }) }), _jsxs("div", { className: "cls_connected_account_details flex flex-col", children: [_jsx("span", { className: "cls_connected_account_name font-medium text-[var(--hazo-text-primary)]", children: "Google" }), googleConnected && email && (_jsx("span", { className: "cls_connected_account_email text-sm text-[var(--hazo-text-muted)]", children: email }))] })] }), _jsx("div", { className: "cls_connected_account_status", children: loading ? (_jsx("span", { className: "cls_connected_account_loading text-sm text-[var(--hazo-text-muted)] animate-pulse", children: "Loading..." })) : googleConnected ? (_jsxs("span", { className: "cls_connected_account_connected inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700", children: [_jsx("span", { className: "cls_connected_indicator w-1.5 h-1.5 rounded-full bg-green-500" }), "Connected"] })) : (_jsxs("span", { className: "cls_connected_account_not_connected inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600", children: [_jsx("span", { className: "cls_not_connected_indicator w-1.5 h-1.5 rounded-full bg-slate-400" }), "Not connected"] })) })] }) }), _jsx("p", { className: "cls_connected_accounts_help text-sm text-[var(--hazo-text-muted)] mt-4", children: googleConnected
                    ? "Your Google account is linked. You can sign in using either your password or Google."
                    : "Link your Google account to enable quick sign-in with Google." })] }));
}

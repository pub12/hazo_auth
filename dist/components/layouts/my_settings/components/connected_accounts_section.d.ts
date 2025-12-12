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
/**
 * Connected Accounts Section for My Settings
 * Shows which OAuth providers are linked to the user's account
 * Currently supports Google, designed for future extensibility
 */
export declare function ConnectedAccountsSection({ googleConnected, email, heading, loading, }: ConnectedAccountsSectionProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=connected_accounts_section.d.ts.map
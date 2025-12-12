import type { PasswordRequirementOptions } from "../../shared/config/layout_customization";
export type SetPasswordSectionProps = {
    /** Password requirements for validation */
    passwordRequirements: PasswordRequirementOptions;
    /** Callback when password is successfully set */
    onPasswordSet?: () => void;
    /** Section heading */
    heading?: string;
    /** Description text */
    description?: string;
    /** New password label */
    newPasswordLabel?: string;
    /** Confirm password label */
    confirmPasswordLabel?: string;
    /** Submit button label */
    submitButtonLabel?: string;
    /** Loading state from parent */
    parentLoading?: boolean;
};
/**
 * Set Password Section for My Settings
 * Allows Google-only users to set a password for email/password login
 * Only shown when user has no password set (Google-only account)
 */
export declare function SetPasswordSection({ passwordRequirements, onPasswordSet, heading, description, newPasswordLabel, confirmPasswordLabel, submitButtonLabel, parentLoading, }: SetPasswordSectionProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=set_password_section.d.ts.map
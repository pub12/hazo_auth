import type { PasswordRequirementOptions } from "hazo_auth/components/layouts/shared/config/layout_customization";
export type PasswordFields = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    currentPasswordVisible: boolean;
    newPasswordVisible: boolean;
    confirmPasswordVisible: boolean;
    errors: {
        currentPassword?: string;
        newPassword?: string | string[];
        confirmPassword?: string;
    };
};
export type UseMySettingsResult = {
    name: string;
    email: string;
    profilePictureUrl?: string;
    profileSource?: "upload" | "library" | "gravatar" | "custom";
    lastLogon?: string;
    loading: boolean;
    passwordFields?: PasswordFields;
    handlePasswordFieldChange: (field: "currentPassword" | "newPassword" | "confirmPassword", value: string) => void;
    togglePasswordVisibility: (field: "currentPassword" | "newPassword" | "confirmPassword") => void;
    handlePasswordSave: () => Promise<void>;
    isPasswordSaveDisabled: boolean;
    profilePictureDialogOpen: boolean;
    handleProfilePictureEdit: () => void;
    handleProfilePictureDialogClose: () => void;
    handleProfilePictureSave: (profilePictureUrl: string, profileSource: "upload" | "library" | "gravatar") => Promise<void>;
    handleProfilePictureRemove: () => Promise<void>;
    handleNameSave: (value: string) => Promise<void>;
    handleEmailSave: (value: string) => Promise<void>;
    refreshUserData: () => Promise<void>;
};
export type UseMySettingsParams = {
    passwordRequirements: PasswordRequirementOptions;
};
/**
 * Hook for managing my settings state and API calls
 * Handles user data loading, field editing, and API calls for updates
 * @param params - Hook parameters including password requirements
 * @returns My settings hook result with state and actions
 */
export declare function use_my_settings({ passwordRequirements, }: UseMySettingsParams): UseMySettingsResult;
//# sourceMappingURL=use_my_settings.d.ts.map
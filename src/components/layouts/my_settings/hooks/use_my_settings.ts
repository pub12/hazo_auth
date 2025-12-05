// file_description: hook for managing my settings state and API calls
// section: client_directive
"use client";

// section: imports
import { useState, useEffect, useCallback } from "react";
import { use_auth_status, trigger_auth_status_refresh } from "../../shared/hooks/use_auth_status";
import { toast } from "sonner";
import type { PasswordRequirementOptions } from "../../shared/config/layout_customization";
import { useHazoAuthConfig } from "../../../../contexts/hazo_auth_provider";

// section: types
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
  // User data
  name: string;
  email: string;
  profilePictureUrl?: string;
  profileSource?: "upload" | "library" | "gravatar" | "custom";
  lastLogon?: string;
  loading: boolean;

  // Password fields
  passwordFields?: PasswordFields;
  handlePasswordFieldChange: (field: "currentPassword" | "newPassword" | "confirmPassword", value: string) => void;
  togglePasswordVisibility: (field: "currentPassword" | "newPassword" | "confirmPassword") => void;
  handlePasswordSave: () => Promise<void>;
  isPasswordSaveDisabled: boolean;

  // Profile picture
  profilePictureDialogOpen: boolean;
  handleProfilePictureEdit: () => void;
  handleProfilePictureDialogClose: () => void;
  handleProfilePictureSave: (profilePictureUrl: string, profileSource: "upload" | "library" | "gravatar") => Promise<void>;
  handleProfilePictureRemove: () => Promise<void>;

  // Actions
  handleNameSave: (value: string) => Promise<void>;
  handleEmailSave: (value: string) => Promise<void>;

  // Refresh
  refreshUserData: () => Promise<void>;
};

export type UseMySettingsParams = {
  passwordRequirements: PasswordRequirementOptions;
};

// section: helpers
/**
 * Validates email format
 */
const validateEmail = (email: string): string | null => {
  if (!email || email.trim() === "") {
    return "Email is required";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Invalid email address format";
  }
  return null;
};

/**
 * Validates name (optional, but if provided should not be empty)
 */
const validateName = (name: string): string | null => {
  if (name.trim() === "") {
    return "Name cannot be empty";
  }
  return null;
};

// section: hook
/**
 * Hook for managing my settings state and API calls
 * Handles user data loading, field editing, and API calls for updates
 * @param params - Hook parameters including password requirements
 * @returns My settings hook result with state and actions
 */
export function use_my_settings({
  passwordRequirements,
}: UseMySettingsParams): UseMySettingsResult {
  const { apiBasePath } = useHazoAuthConfig();
  const authStatus = use_auth_status();
  
  // Password fields state
  const [passwordFields, setPasswordFields] = useState<PasswordFields>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    currentPasswordVisible: false,
    newPasswordVisible: false,
    confirmPasswordVisible: false,
    errors: {},
  });

  // Get user data from auth status
  const name = authStatus.name || "";
  const email = authStatus.email || "";
  const profilePictureUrl = authStatus.profile_picture_url;
  const profileSource = authStatus.profile_source;
  const lastLogon = authStatus.last_logon;
  const loading = authStatus.loading;

  /**
   * Refreshes user data by triggering auth status refresh
   */
  const refreshUserData = useCallback(async () => {
    trigger_auth_status_refresh();
    // Also call the refresh method directly
    await authStatus.refresh();
  }, [authStatus]);

  /**
   * Updates user name
   */
  const handleNameSave = useCallback(async (value: string) => {
    const validationError = validateName(value);
    if (validationError) {
      toast.error(validationError);
      throw new Error(validationError);
    }

    try {
      const response = await fetch(`${apiBasePath}/update_user`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name: value }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage = data.error || "Failed to update name";
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      toast.success("Name updated successfully");
      await refreshUserData();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update name";
      toast.error(errorMessage);
      throw error;
    }
  }, [refreshUserData]);

  /**
   * Updates user email
   */
  const handleEmailSave = useCallback(async (value: string) => {
    const validationError = validateEmail(value);
    if (validationError) {
      toast.error(validationError);
      throw new Error(validationError);
    }

    try {
      const response = await fetch(`${apiBasePath}/update_user`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email: value }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage = data.error || "Failed to update email";
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      if (data.email_changed) {
        toast.success("Email updated successfully. Please verify your new email address.");
      } else {
        toast.success("Email updated successfully");
      }

      await refreshUserData();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update email";
      toast.error(errorMessage);
      throw error;
    }
  }, [refreshUserData]);

  /**
   * Validates password requirements
   */
  const validatePassword = useCallback((password: string): string | null => {
    if (!password || password.length < passwordRequirements.minimum_length) {
      return `Password must be at least ${passwordRequirements.minimum_length} characters long`;
    }

    const errors: string[] = [];

    if (passwordRequirements.require_uppercase && !/[A-Z]/.test(password)) {
      errors.push("uppercase letter");
    }

    if (passwordRequirements.require_lowercase && !/[a-z]/.test(password)) {
      errors.push("lowercase letter");
    }

    if (passwordRequirements.require_number && !/[0-9]/.test(password)) {
      errors.push("number");
    }

    if (passwordRequirements.require_special && !/[^A-Za-z0-9]/.test(password)) {
      errors.push("special character");
    }

    if (errors.length > 0) {
      return `Password must contain at least one: ${errors.join(", ")}`;
    }

    return null;
  }, [passwordRequirements]);

  /**
   * Handles password field change
   */
  const handlePasswordFieldChange = useCallback((field: "currentPassword" | "newPassword" | "confirmPassword", value: string) => {
    setPasswordFields((prev) => {
      const newFields = { ...prev, [field]: value };
      // Clear errors for this field when user types
      if (newFields.errors[field as keyof typeof newFields.errors]) {
        newFields.errors = { ...newFields.errors, [field]: undefined };
      }
      return newFields;
    });
  }, []);

  /**
   * Toggles password visibility
   */
  const togglePasswordVisibility = useCallback((field: "currentPassword" | "newPassword" | "confirmPassword") => {
    setPasswordFields((prev) => {
      const fieldKey = `${field}Visible` as keyof PasswordFields;
      const currentValue = prev[fieldKey] as boolean;
      return {
        ...prev,
        [fieldKey]: !currentValue,
      };
    });
  }, []);

  /**
   * Validates password form
   */
  const validatePasswordForm = useCallback((): boolean => {
    const errors: PasswordFields["errors"] = {};

    if (!passwordFields.currentPassword) {
      errors.currentPassword = "Current password is required";
    }

    const newPasswordError = validatePassword(passwordFields.newPassword);
    if (newPasswordError) {
      errors.newPassword = newPasswordError;
    }

    if (!passwordFields.confirmPassword) {
      errors.confirmPassword = "Please confirm your new password";
    } else if (passwordFields.newPassword !== passwordFields.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setPasswordFields((prev) => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  }, [passwordFields, validatePassword]);

  /**
   * Checks if password save should be disabled
   */
  const isPasswordSaveDisabled = useCallback((): boolean => {
    return !passwordFields.currentPassword || !passwordFields.newPassword || !passwordFields.confirmPassword;
  }, [passwordFields]);

  /**
   * Saves password changes
   */
  const handlePasswordSave = useCallback(async () => {
    if (!validatePasswordForm()) {
      return;
    }

    try {
      const response = await fetch(`${apiBasePath}/change_password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          current_password: passwordFields.currentPassword,
          new_password: passwordFields.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage = data.error || "Failed to change password";
        setPasswordFields((prev) => ({
          ...prev,
          errors: { currentPassword: errorMessage },
        }));
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      toast.success("Password changed successfully");
      // Reset password fields
      setPasswordFields({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        currentPasswordVisible: false,
        newPasswordVisible: false,
        confirmPasswordVisible: false,
        errors: {},
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to change password";
      toast.error(errorMessage);
      throw error;
    }
  }, [passwordFields, validatePasswordForm]);

  /**
   * Profile picture dialog state
   */
  const [profilePictureDialogOpen, setProfilePictureDialogOpen] = useState(false);

  /**
   * Opens profile picture dialog
   */
  const handleProfilePictureEdit = useCallback(() => {
    setProfilePictureDialogOpen(true);
  }, []);

  /**
   * Closes profile picture dialog
   */
  const handleProfilePictureDialogClose = useCallback(() => {
    setProfilePictureDialogOpen(false);
  }, []);

  /**
   * Saves profile picture changes
   * Note: profilePictureUrl is already a fully-formed URL (Gravatar URL is generated in the dialog)
   */
  const handleProfilePictureSave = useCallback(async (profilePictureUrl: string, profileSource: "upload" | "library" | "gravatar") => {
    try {
      const response = await fetch(`${apiBasePath}/update_user`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          profile_picture_url: profilePictureUrl,
          profile_source: profileSource,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage = data.error || "Failed to update profile picture";
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      toast.success("Profile picture updated successfully");
      await refreshUserData();
      setProfilePictureDialogOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile picture";
      toast.error(errorMessage);
      throw error;
    }
  }, [refreshUserData]);

  /**
   * Removes profile picture
   * - If upload: deletes the file and clears profile_picture_url and profile_source
   * - If gravatar/library: clears profile_picture_url and profile_source
   */
  const handleProfilePictureRemove = useCallback(async () => {
    try {
      const response = await fetch(`${apiBasePath}/remove_profile_picture`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage = data.error || "Failed to remove profile picture";
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      toast.success("Profile picture removed successfully");
      await refreshUserData();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to remove profile picture";
      toast.error(errorMessage);
      throw error;
    }
  }, [refreshUserData]);

  return {
    name,
    email,
    profilePictureUrl,
    profileSource,
    lastLogon,
    loading,
    passwordFields,
    handlePasswordFieldChange,
    togglePasswordVisibility,
    handlePasswordSave,
    isPasswordSaveDisabled: isPasswordSaveDisabled(),
    profilePictureDialogOpen,
    handleProfilePictureEdit,
    handleProfilePictureDialogClose,
    handleProfilePictureSave,
    handleProfilePictureRemove,
    handleNameSave,
    handleEmailSave,
    refreshUserData,
  };
}


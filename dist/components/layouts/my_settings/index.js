// file_description: my settings layout component with tabs for profile and security settings
// section: client_directive
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// section: imports
import { Button } from "../../ui/button.js";
import { EditableField } from "./components/editable_field.js";
import { ProfilePictureDisplay } from "./components/profile_picture_display.js";
import { ProfilePictureDialog } from "./components/profile_picture_dialog.js";
import { ConnectedAccountsSection } from "./components/connected_accounts_section.js";
import { SetPasswordSection } from "./components/set_password_section.js";
import { UnauthorizedGuard } from "../shared/components/unauthorized_guard.js";
import { use_my_settings } from "./hooks/use_my_settings.js";
import { resolveMySettingsLabels, resolveMySettingsButtonPalette, } from "./config/my_settings_field_config.js";
import { PasswordField } from "../shared/components/password_field.js";
import { FormFieldWrapper } from "../shared/components/form_field_wrapper.js";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "../../../lib/utils.js";
// section: component
/**
 * My Settings layout component with tabs for profile and security settings
 * Shows editable fields for name, email, and password change dialog
 * Displays profile picture and last logged in information
 * @param props - Component props including labels, button colors, password requirements, etc.
 * @returns My settings layout component
 */
export default function my_settings_layout({ className, labels, button_colors, password_requirements, profilePicture, userFields, unauthorizedMessage = "You must be logged in to access this page.", loginButtonLabel = "Go to login", loginPath = "/hazo_auth/login", heading = "Account Settings", subHeading = "Manage your profile, password, and email preferences.", profilePhotoLabel = "Profile Photo", profilePhotoRecommendation = "Recommended size: 200x200px. JPG, PNG.", uploadPhotoButtonLabel = "Upload New Photo", removePhotoButtonLabel = "Remove", profileInformationLabel = "Profile Information", passwordLabel = "Password", currentPasswordLabel = "Current Password", newPasswordLabel = "New Password", confirmPasswordLabel = "Confirm Password", messages, uiSizes, fileTypes, }) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    const resolvedLabels = resolveMySettingsLabels(labels);
    const resolvedButtonPalette = resolveMySettingsButtonPalette(button_colors);
    const settings = use_my_settings({
        passwordRequirements: password_requirements,
    });
    return (_jsx(UnauthorizedGuard, { message: unauthorizedMessage, loginButtonLabel: loginButtonLabel, loginPath: loginPath, children: _jsxs("div", { className: cn("cls_my_settings_layout flex flex-col gap-6 p-6 w-full", className), children: [_jsxs("div", { className: "cls_my_settings_layout_header flex flex-col gap-2", children: [_jsx("h1", { className: "cls_my_settings_layout_heading text-3xl font-bold text-[var(--hazo-text-primary)]", children: heading }), _jsx("p", { className: "cls_my_settings_layout_subheading text-[var(--hazo-text-muted)]", children: subHeading })] }), _jsxs("div", { className: "cls_my_settings_layout_profile_photo_section bg-white rounded-lg border border-[var(--hazo-border)] p-6", children: [_jsx("h2", { className: "cls_my_settings_layout_section_heading text-lg font-semibold text-[var(--hazo-text-primary)] mb-4", children: profilePhotoLabel }), _jsx("div", { className: "cls_my_settings_layout_profile_photo_content flex flex-col items-center", children: _jsxs("div", { className: "cls_my_settings_layout_profile_photo_display relative", children: [_jsx(ProfilePictureDisplay, { profilePictureUrl: settings.profilePictureUrl, name: settings.name, email: settings.email, onEdit: settings.handleProfilePictureEdit }), _jsxs("div", { className: "cls_my_settings_layout_profile_photo_actions absolute left-0 right-0 flex items-center justify-between px-2", style: { bottom: '-20px' }, children: [_jsx(Button, { type: "button", onClick: settings.handleProfilePictureEdit, disabled: settings.loading, variant: "ghost", size: "icon", className: "cls_my_settings_layout_upload_photo_button", "aria-label": uploadPhotoButtonLabel, children: _jsx(Pencil, { className: "h-4 w-4", "aria-hidden": "true" }) }), _jsx(Button, { type: "button", onClick: settings.handleProfilePictureRemove, disabled: settings.loading || !settings.profilePictureUrl, variant: "ghost", size: "icon", className: "cls_my_settings_layout_remove_photo_button text-red-600 hover:text-red-700 hover:bg-red-50", "aria-label": removePhotoButtonLabel, children: _jsx(Trash2, { className: "h-4 w-4", "aria-hidden": "true" }) })] })] }) })] }), _jsxs("div", { className: "cls_my_settings_layout_profile_information_section bg-white rounded-lg border border-[var(--hazo-border)] p-6", children: [_jsx("h2", { className: "cls_my_settings_layout_section_heading text-lg font-semibold text-[var(--hazo-text-primary)] mb-4", children: profileInformationLabel }), _jsxs("div", { className: "cls_my_settings_layout_profile_information_fields grid grid-cols-1 md:grid-cols-2 gap-6", children: [userFields.show_name_field && (_jsx(EditableField, { label: "Full Name", value: settings.name, type: "text", placeholder: "Enter your full name", onSave: settings.handleNameSave, validation: validateName, disabled: settings.loading, ariaLabel: "Full name input field" })), userFields.show_email_field && (_jsx(EditableField, { label: "Email Address", value: settings.email, type: "email", placeholder: "Enter your email address", onSave: settings.handleEmailSave, validation: validateEmail, disabled: settings.loading, ariaLabel: "Email address input field" }))] })] }), userFields.show_password_field && settings.hasPassword && (_jsxs("div", { className: "cls_my_settings_layout_password_section bg-white rounded-lg border border-[var(--hazo-border)] p-6", children: [_jsx("h2", { className: "cls_my_settings_layout_section_heading text-lg font-semibold text-[var(--hazo-text-primary)] mb-4", children: passwordLabel }), _jsxs("div", { className: "cls_my_settings_layout_password_fields flex flex-col gap-6", children: [_jsx(FormFieldWrapper, { fieldId: "current-password", label: currentPasswordLabel, input: _jsx(PasswordField, { inputId: "current-password", ariaLabel: currentPasswordLabel, value: ((_a = settings.passwordFields) === null || _a === void 0 ? void 0 : _a.currentPassword) || "", placeholder: "Enter your current password", autoComplete: "current-password", isVisible: ((_b = settings.passwordFields) === null || _b === void 0 ? void 0 : _b.currentPasswordVisible) || false, onChange: (value) => settings.handlePasswordFieldChange("currentPassword", value), onToggleVisibility: () => settings.togglePasswordVisibility("currentPassword"), errorMessage: (_d = (_c = settings.passwordFields) === null || _c === void 0 ? void 0 : _c.errors) === null || _d === void 0 ? void 0 : _d.currentPassword }) }), _jsxs("div", { className: "cls_my_settings_layout_password_fields_row grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsx(FormFieldWrapper, { fieldId: "new-password", label: newPasswordLabel, input: _jsx(PasswordField, { inputId: "new-password", ariaLabel: newPasswordLabel, value: ((_e = settings.passwordFields) === null || _e === void 0 ? void 0 : _e.newPassword) || "", placeholder: "Enter your new password", autoComplete: "new-password", isVisible: ((_f = settings.passwordFields) === null || _f === void 0 ? void 0 : _f.newPasswordVisible) || false, onChange: (value) => settings.handlePasswordFieldChange("newPassword", value), onToggleVisibility: () => settings.togglePasswordVisibility("newPassword"), errorMessage: (_h = (_g = settings.passwordFields) === null || _g === void 0 ? void 0 : _g.errors) === null || _h === void 0 ? void 0 : _h.newPassword }) }), _jsx(FormFieldWrapper, { fieldId: "confirm-password", label: confirmPasswordLabel, input: _jsx(PasswordField, { inputId: "confirm-password", ariaLabel: confirmPasswordLabel, value: ((_j = settings.passwordFields) === null || _j === void 0 ? void 0 : _j.confirmPassword) || "", placeholder: "Confirm your new password", autoComplete: "new-password", isVisible: ((_k = settings.passwordFields) === null || _k === void 0 ? void 0 : _k.confirmPasswordVisible) || false, onChange: (value) => settings.handlePasswordFieldChange("confirmPassword", value), onToggleVisibility: () => settings.togglePasswordVisibility("confirmPassword"), errorMessage: (_m = (_l = settings.passwordFields) === null || _l === void 0 ? void 0 : _l.errors) === null || _m === void 0 ? void 0 : _m.confirmPassword }) })] })] }), _jsx("div", { className: "cls_my_settings_layout_password_actions flex justify-end mt-4", children: _jsx(Button, { type: "button", onClick: settings.handlePasswordSave, disabled: settings.loading || settings.isPasswordSaveDisabled, className: "cls_my_settings_layout_save_password_button", style: {
                                    backgroundColor: resolvedButtonPalette.submitBackground,
                                    color: resolvedButtonPalette.submitText,
                                }, "aria-label": "Save password", children: "Save Password" }) })] })), !settings.hasPassword && settings.googleConnected && (_jsx(SetPasswordSection, { passwordRequirements: password_requirements, onPasswordSet: settings.refreshUserData, parentLoading: settings.loading })), _jsx(ConnectedAccountsSection, { googleConnected: settings.googleConnected || false, email: settings.email, loading: settings.loading }), _jsx(ProfilePictureDialog, { open: settings.profilePictureDialogOpen, onOpenChange: (open) => {
                        if (open) {
                            settings.handleProfilePictureEdit();
                        }
                        else {
                            settings.handleProfilePictureDialogClose();
                        }
                    }, onSave: settings.handleProfilePictureSave, email: settings.email, allowPhotoUpload: profilePicture.allow_photo_upload, maxPhotoSize: profilePicture.max_photo_size, libraryPhotoPath: profilePicture.library_photo_path, currentProfilePictureUrl: settings.profilePictureUrl, currentProfileSource: settings.profileSource, disabled: settings.loading, messages: messages, uiSizes: uiSizes, fileTypes: fileTypes })] }) }));
}
// section: validation_helpers
/**
 * Validates name (optional, but if provided should not be empty)
 */
function validateName(name) {
    if (name.trim() === "") {
        return "Name cannot be empty";
    }
    return null;
}
/**
 * Validates email format
 */
function validateEmail(email) {
    if (!email || email.trim() === "") {
        return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return "Invalid email address format";
    }
    return null;
}

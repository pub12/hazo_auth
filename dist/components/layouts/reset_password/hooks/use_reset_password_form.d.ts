import type { LayoutDataClient } from "../../shared/data/layout_data_client";
import type { PasswordRequirementOptions } from "../../shared/config/layout_customization";
import { type ResetPasswordFieldId } from "../config/reset_password_field_config";
export type ResetPasswordFormValues = Record<ResetPasswordFieldId, string>;
export type ResetPasswordFormErrors = Partial<Record<ResetPasswordFieldId, string | string[]>>;
export type PasswordVisibilityState = Record<Extract<ResetPasswordFieldId, "password" | "confirm_password">, boolean>;
export type UseResetPasswordFormParams<TClient = unknown> = {
    passwordRequirements: PasswordRequirementOptions;
    dataClient: LayoutDataClient<TClient>;
    loginPath?: string;
};
export type UseResetPasswordFormResult = {
    values: ResetPasswordFormValues;
    errors: ResetPasswordFormErrors;
    passwordVisibility: PasswordVisibilityState;
    isSubmitDisabled: boolean;
    isSubmitting: boolean;
    isSuccess: boolean;
    token: string | null;
    isValidatingToken: boolean;
    tokenError: string | null;
    handleFieldChange: (fieldId: ResetPasswordFieldId, value: string) => void;
    togglePasswordVisibility: (fieldId: "password" | "confirm_password") => void;
    handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    handleCancel: () => void;
};
export declare const use_reset_password_form: <TClient>({ passwordRequirements, dataClient, loginPath, }: UseResetPasswordFormParams<TClient>) => UseResetPasswordFormResult;
//# sourceMappingURL=use_reset_password_form.d.ts.map
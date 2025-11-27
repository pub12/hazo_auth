import type { LayoutDataClient } from "../../shared/data/layout_data_client";
import type { PasswordRequirementOptions, PasswordRequirementOverrides } from "../../shared/config/layout_customization";
import { type RegisterFieldId } from "../config/register_field_config";
export type RegisterFormValues = Record<RegisterFieldId, string>;
export type RegisterFormErrors = Partial<Record<RegisterFieldId, string | string[]>> & {
    submit?: string;
};
export type PasswordVisibilityState = Record<Extract<RegisterFieldId, "password" | "confirm_password">, boolean>;
export type UseRegisterFormParams<TClient = unknown> = {
    showNameField: boolean;
    passwordRequirements: PasswordRequirementOptions;
    passwordRequirementOverrides?: PasswordRequirementOverrides;
    dataClient: LayoutDataClient<TClient>;
    urlOnLogon?: string;
};
export type UseRegisterFormResult = {
    values: RegisterFormValues;
    errors: RegisterFormErrors;
    passwordVisibility: PasswordVisibilityState;
    isSubmitDisabled: boolean;
    isSubmitting: boolean;
    emailTouched: boolean;
    handleFieldChange: (fieldId: RegisterFieldId, value: string) => void;
    handleEmailBlur: () => void;
    togglePasswordVisibility: (fieldId: "password" | "confirm_password") => void;
    handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    handleCancel: () => void;
};
export declare const use_register_form: <TClient>({ showNameField, passwordRequirements, dataClient, urlOnLogon, }: UseRegisterFormParams<TClient>) => UseRegisterFormResult;
//# sourceMappingURL=use_register_form.d.ts.map
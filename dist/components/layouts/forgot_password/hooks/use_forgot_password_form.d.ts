import type { LayoutDataClient } from "../../shared/data/layout_data_client";
import { type ForgotPasswordFieldId } from "../config/forgot_password_field_config";
export type ForgotPasswordFormValues = Record<ForgotPasswordFieldId, string>;
export type ForgotPasswordFormErrors = Partial<Record<ForgotPasswordFieldId, string>> & {
    submit?: string;
};
export type UseForgotPasswordFormParams<TClient = unknown> = {
    dataClient: LayoutDataClient<TClient>;
};
export type UseForgotPasswordFormResult = {
    values: ForgotPasswordFormValues;
    errors: ForgotPasswordFormErrors;
    isSubmitDisabled: boolean;
    isSubmitting: boolean;
    emailTouched: boolean;
    handleFieldChange: (fieldId: ForgotPasswordFieldId, value: string) => void;
    handleEmailBlur: () => void;
    handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    handleCancel: () => void;
};
export declare const use_forgot_password_form: <TClient>({ dataClient, }: UseForgotPasswordFormParams<TClient>) => UseForgotPasswordFormResult;
//# sourceMappingURL=use_forgot_password_form.d.ts.map
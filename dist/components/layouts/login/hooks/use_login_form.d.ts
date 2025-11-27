import type { LayoutDataClient } from "../../shared/data/layout_data_client";
import { type LoginFieldId } from "../config/login_field_config";
export type LoginFormValues = Record<LoginFieldId, string>;
export type LoginFormErrors = Partial<Record<LoginFieldId, string>>;
export type PasswordVisibilityState = {
    password: boolean;
};
export type UseLoginFormParams<TClient = unknown> = {
    dataClient: LayoutDataClient<TClient>;
    logger?: {
        info: (message: string, data?: Record<string, unknown>) => void;
        error: (message: string, data?: Record<string, unknown>) => void;
        warn: (message: string, data?: Record<string, unknown>) => void;
        debug: (message: string, data?: Record<string, unknown>) => void;
    };
    redirectRoute?: string;
    successMessage?: string;
    urlOnLogon?: string;
};
export type UseLoginFormResult = {
    values: LoginFormValues;
    errors: LoginFormErrors;
    passwordVisibility: PasswordVisibilityState;
    isSubmitDisabled: boolean;
    emailTouched: boolean;
    isSuccess: boolean;
    handleFieldChange: (fieldId: LoginFieldId, value: string) => void;
    handleEmailBlur: () => void;
    togglePasswordVisibility: () => void;
    handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    handleCancel: () => void;
};
export declare const use_login_form: <TClient>({ dataClient, logger, redirectRoute, successMessage, urlOnLogon, }: UseLoginFormParams<TClient>) => UseLoginFormResult;
//# sourceMappingURL=use_login_form.d.ts.map
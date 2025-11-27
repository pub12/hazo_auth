import type { LayoutDataClient } from "../../shared/data/layout_data_client";
import { type EmailVerificationFieldId } from "../config/email_verification_field_config";
export type EmailVerificationFormValues = Record<EmailVerificationFieldId, string>;
export type EmailVerificationFormErrors = Partial<Record<EmailVerificationFieldId, string>> & {
    submit?: string;
};
export type UseEmailVerificationParams<TClient = unknown> = {
    dataClient: LayoutDataClient<TClient>;
    redirectDelay?: number;
    loginPath?: string;
};
export type UseEmailVerificationResult = {
    isVerifying: boolean;
    isVerified: boolean;
    isError: boolean;
    errorMessage?: string;
    email?: string;
    values: EmailVerificationFormValues;
    errors: EmailVerificationFormErrors;
    isSubmitDisabled: boolean;
    isSubmitting: boolean;
    emailTouched: boolean;
    redirectCountdown: number;
    handleFieldChange: (fieldId: EmailVerificationFieldId, value: string) => void;
    handleEmailBlur: () => void;
    handleResendSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    handleCancel: () => void;
    handleGoToLogin: () => void;
};
export declare const use_email_verification: <TClient>({ dataClient, redirectDelay, loginPath, }: UseEmailVerificationParams<TClient>) => UseEmailVerificationResult;
//# sourceMappingURL=use_email_verification.d.ts.map
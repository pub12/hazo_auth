import { FormEvent } from "react";
export type CreateFirmFormValues = {
    firm_name: string;
    org_structure: string;
};
export type CreateFirmFormErrors = {
    firm_name?: string;
    org_structure?: string;
    form?: string;
};
export type UseCreateFirmFormOptions = {
    default_org_structure?: string;
    onSuccess?: (scope_id: string) => void;
    redirectRoute?: string;
    /** API base path for hazo_auth endpoints */
    apiBasePath?: string;
    logger?: {
        info: (message: string, data?: Record<string, unknown>) => void;
        error: (message: string, data?: Record<string, unknown>) => void;
    };
};
export type UseCreateFirmFormResult = {
    values: CreateFirmFormValues;
    errors: CreateFirmFormErrors;
    isSubmitting: boolean;
    isSuccess: boolean;
    isSubmitDisabled: boolean;
    /** True when Chrome autofill preview is shown but value not yet committed */
    hasAutofillPreview: boolean;
    handleFieldChange: (field: keyof CreateFirmFormValues, value: string) => void;
    handleSubmit: (e: FormEvent) => Promise<void>;
    /** Ref to attach to firm_name input for DOM value sync */
    firmNameRef: React.RefObject<HTMLInputElement>;
    /** Ref to attach to org_structure input for DOM value sync */
    orgStructureRef: React.RefObject<HTMLInputElement>;
    /** Sync React state from DOM values (call on autofill detection) */
    syncFromDOM: () => void;
};
export declare function use_create_firm_form(options?: UseCreateFirmFormOptions): UseCreateFirmFormResult;
//# sourceMappingURL=use_create_firm_form.d.ts.map
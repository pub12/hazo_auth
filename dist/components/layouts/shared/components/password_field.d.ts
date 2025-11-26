export type PasswordFieldProps = {
    inputId: string;
    ariaLabel: string;
    value: string;
    placeholder: string;
    autoComplete?: string;
    isVisible: boolean;
    onChange: (value: string) => void;
    onToggleVisibility: () => void;
    errorMessage?: string | string[];
};
export declare function PasswordField({ inputId, ariaLabel, value, placeholder, autoComplete, isVisible, onChange, onToggleVisibility, errorMessage, }: PasswordFieldProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=password_field.d.ts.map
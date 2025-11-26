export type EditableFieldProps = {
    label: string;
    value: string;
    type?: "text" | "email" | "tel" | "url";
    placeholder?: string;
    onSave: (value: string) => Promise<void>;
    onCancel?: () => void;
    validation?: (value: string) => string | null;
    disabled?: boolean;
    ariaLabel?: string;
};
/**
 * Editable field component with pencil icon for edit mode
 * Shows check (green) and cancel (red) icons when in edit mode
 * @param props - Component props including label, value, onSave callback, etc.
 * @returns Editable field component
 */
export declare function EditableField({ label, value, type, placeholder, onSave, onCancel, validation, disabled, ariaLabel, }: EditableFieldProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=editable_field.d.ts.map
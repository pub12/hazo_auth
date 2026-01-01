import type { ButtonPaletteDefaults } from "../config/layout_customization";
type FormActionButtonsProps = {
    submitLabel: string;
    cancelLabel?: string;
    buttonPalette: ButtonPaletteDefaults;
    isSubmitDisabled: boolean;
    onCancel?: () => void;
    submitAriaLabel?: string;
    cancelAriaLabel?: string;
    className?: string;
    /** Hide the cancel button (default: false) */
    hideCancel?: boolean;
};
export declare function FormActionButtons({ submitLabel, cancelLabel, buttonPalette, isSubmitDisabled, onCancel, submitAriaLabel, cancelAriaLabel, className, hideCancel, }: FormActionButtonsProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=form_action_buttons.d.ts.map
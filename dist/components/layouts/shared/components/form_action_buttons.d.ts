import type { ButtonPaletteDefaults } from "hazo_auth/components/layouts/shared/config/layout_customization";
type FormActionButtonsProps = {
    submitLabel: string;
    cancelLabel: string;
    buttonPalette: ButtonPaletteDefaults;
    isSubmitDisabled: boolean;
    onCancel: () => void;
    submitAriaLabel?: string;
    cancelAriaLabel?: string;
    className?: string;
};
export declare function FormActionButtons({ submitLabel, cancelLabel, buttonPalette, isSubmitDisabled, onCancel, submitAriaLabel, cancelAriaLabel, className, }: FormActionButtonsProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=form_action_buttons.d.ts.map
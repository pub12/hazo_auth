// file_description: reusable form action buttons component with submit (positive, left) and cancel (negative, right) buttons
// section: imports
import { CircleCheckBig, CircleX } from "lucide-react";
import { Button } from "../../../ui/button";
import type { ButtonPaletteDefaults } from "../config/layout_customization";

// section: types
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

// section: component
export function FormActionButtons({
  submitLabel,
  cancelLabel = "Cancel",
  buttonPalette,
  isSubmitDisabled,
  onCancel,
  submitAriaLabel = "Submit form",
  cancelAriaLabel = "Cancel form",
  className,
  hideCancel = false,
}: FormActionButtonsProps) {
  return (
    <div
      className={`cls_form_action_buttons mt-2 flex flex-wrap items-center justify-end gap-4 ${className ?? ""}`}
    >
      <Button
        type="submit"
        disabled={isSubmitDisabled}
        className="cls_form_action_submit_button flex shrink-0 items-center gap-2"
        aria-label={submitAriaLabel}
        style={{
          backgroundColor: buttonPalette.submitBackground,
          color: buttonPalette.submitText,
        }}
      >
        <CircleCheckBig className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{submitLabel}</span>
      </Button>
      {!hideCancel && onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="cls_form_action_cancel_button flex shrink-0 items-center gap-2"
          aria-label={cancelAriaLabel}
          style={{
            borderColor: buttonPalette.cancelBorder,
            color: buttonPalette.cancelText,
          }}
        >
          <CircleX className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{cancelLabel}</span>
        </Button>
      )}
    </div>
  );
}


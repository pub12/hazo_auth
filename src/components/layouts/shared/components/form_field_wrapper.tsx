// file_description: reusable wrapper component for form fields that standardizes label, input, and error message structure
// section: imports
import { Label } from "hazo_auth/components/ui/label";
import { FieldErrorMessage } from "hazo_auth/components/layouts/shared/components/field_error_message";

// section: types
type FormFieldWrapperProps = {
  fieldId: string;
  label: string;
  input: React.ReactNode;
  errorMessage?: string | string[];
  className?: string;
  labelClassName?: string;
};

// section: component
export function FormFieldWrapper({
  fieldId,
  label,
  input,
  errorMessage,
  className,
  labelClassName,
}: FormFieldWrapperProps) {
  return (
    <div
      className={`cls_form_field_wrapper flex flex-col gap-2 ${className ?? ""}`}
    >
      <Label
        htmlFor={fieldId}
        className={`cls_form_field_label text-sm font-medium text-slate-800 ${labelClassName ?? ""}`}
      >
        {label}
      </Label>
      {input}
      {errorMessage ? (
        <div className="mt-1 min-h-0">
          <FieldErrorMessage message={errorMessage} />
        </div>
      ) : null}
    </div>
  );
}


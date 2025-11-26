// file_description: reusable password input with visibility toggle and error messaging
// section: client_directive
"use client";

// section: imports
import { Eye, EyeOff } from "lucide-react";
import { Button } from "hazo_auth/components/ui/button";
import { Input } from "hazo_auth/components/ui/input";
import { FieldErrorMessage } from "hazo_auth/components/layouts/shared/components/field_error_message";

// section: types
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

// section: component
export function PasswordField({
  inputId,
  ariaLabel,
  value,
  placeholder,
  autoComplete,
  isVisible,
  onChange,
  onToggleVisibility,
  errorMessage,
}: PasswordFieldProps) {
  return (
    <div className="cls_password_field_wrapper">
      <div className="relative">
        <Input
          id={inputId}
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-label={ariaLabel}
          className="cls_password_field_input pr-11"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`${isVisible ? "Hide" : "Show"} ${ariaLabel.toLowerCase()}`}
          onClick={onToggleVisibility}
          className="cls_password_field_toggle absolute right-1 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900"
        >
          {isVisible ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </div>
      {errorMessage ? (
        <div className="mt-1 min-h-0">
          <FieldErrorMessage message={errorMessage} />
        </div>
      ) : null}
    </div>
  );
}


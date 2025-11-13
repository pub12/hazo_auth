// file_description: reusable error message component for form field validation errors
// section: types
type FieldErrorMessageProps = {
  message: string | string[];
  className?: string;
};

// section: component
export function FieldErrorMessage({
  message,
  className,
}: FieldErrorMessageProps) {
  const messages = Array.isArray(message) ? message : [message];

  return (
    <div
      className={`cls_field_error_message flex flex-col gap-1 text-sm text-red-600 ${className ?? ""}`}
      role="alert"
      aria-live="polite"
    >
      {messages.map((msg, index) => (
        <p key={index} className="break-words leading-relaxed">
          {msg}
        </p>
      ))}
    </div>
  );
}


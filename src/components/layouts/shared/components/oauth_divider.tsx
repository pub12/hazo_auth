// file_description: Visual divider between OAuth buttons and email/password form
// section: imports
import { cn } from "../../../../lib/utils";

// section: types
export type OAuthDividerProps = {
  /** Text displayed in the divider */
  text?: string;
  /** Additional CSS classes */
  className?: string;
};

// section: component
/**
 * Visual divider component to separate OAuth buttons from email/password form
 * Displays a horizontal line with text in the center
 */
export function OAuthDivider({
  text = "or continue with email",
  className,
}: OAuthDividerProps) {
  return (
    <div
      className={cn(
        "cls_oauth_divider relative my-6",
        className
      )}
      role="separator"
      aria-orientation="horizontal"
    >
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <span className="w-full border-t border-slate-200" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="bg-white px-3 text-slate-500">
          {text}
        </span>
      </div>
    </div>
  );
}

export default OAuthDivider;

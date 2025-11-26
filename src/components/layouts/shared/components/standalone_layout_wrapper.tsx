// file_description: renders a simple full-width shell without the developer sidebar
// section: client_directive
"use client";

// section: imports
import { cn } from "hazo_auth/lib/utils";

// section: types
export type StandaloneLayoutWrapperProps = {
  children: React.ReactNode;
  heading?: string;
  description?: string;
  wrapperClassName?: string;
  contentClassName?: string;
  showHeading?: boolean;
  showDescription?: boolean;
};

// section: component
export function StandaloneLayoutWrapper({
  children,
  heading = "hazo auth",
  description = "Drop-in authentication flows that inherit your existing theme.",
  wrapperClassName,
  contentClassName,
  showHeading = true,
  showDescription = true,
}: StandaloneLayoutWrapperProps) {
  return (
    <div className={cn("cls_standalone_layout_wrapper min-h-screen w-full bg-background", wrapperClassName)}>
      <div className={cn("cls_standalone_layout_content mx-auto flex w-full max-w-5xl flex-col gap-8 p-6", contentClassName)}>
        {(showHeading || showDescription) && (
          <div className="cls_standalone_layout_header text-center">
            {showHeading && (
              <h1 className="cls_standalone_layout_title text-2xl font-semibold tracking-tight text-foreground">
                {heading}
              </h1>
            )}
            {showDescription && (
              <p className="cls_standalone_layout_description mt-2 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        )}
        <div className="cls_standalone_layout_body">{children}</div>
      </div>
    </div>
  );
}




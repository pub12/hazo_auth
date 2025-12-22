// file_description: renders a simple full-width shell without the developer sidebar
// section: client_directive
"use client";

// section: imports
import { cn } from "../../../../lib/utils";
import { AuthNavbar, type AuthNavbarProps } from "./auth_navbar";

// section: types
export type StandaloneLayoutWrapperProps = {
  children: React.ReactNode;
  heading?: string;
  description?: string;
  wrapperClassName?: string;
  contentClassName?: string;
  showHeading?: boolean;
  showDescription?: boolean;
  /** Navbar configuration (pass null to disable navbar) */
  navbar?: AuthNavbarProps | null;
  /** Enable vertical centering of content (default: true) */
  verticalCenter?: boolean;
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
  navbar,
  verticalCenter = true,
}: StandaloneLayoutWrapperProps) {
  const hasNavbar = navbar !== null && navbar !== undefined;

  // Calculate navbar height for vertical centering offset
  const navbarHeight = hasNavbar ? (navbar?.height ?? 64) : 0;

  return (
    <div
      className={cn(
        "cls_standalone_layout_wrapper flex min-h-screen w-full flex-col bg-background",
        wrapperClassName
      )}
    >
      {/* Navbar */}
      {hasNavbar && <AuthNavbar {...navbar} />}

      {/* Main content area with vertical centering */}
      <div
        className={cn(
          "cls_standalone_layout_content_area flex-1",
          verticalCenter && "flex items-center justify-center"
        )}
        style={
          verticalCenter ? { minHeight: `calc(100vh - ${navbarHeight}px)` } : undefined
        }
      >
        <div
          className={cn(
            "cls_standalone_layout_content mx-auto flex w-full max-w-5xl flex-col gap-8 p-6",
            contentClassName
          )}
        >
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
    </div>
  );
}

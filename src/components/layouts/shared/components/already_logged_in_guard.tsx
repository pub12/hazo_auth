// file_description: reusable component to show "already logged in" message when user is authenticated
// section: client_directive
"use client";

// section: imports
import { use_auth_status } from "../hooks/use_auth_status";
import { LogoutButton } from "./logout_button";
import { Button } from "../../../ui/button";
import { TwoColumnAuthLayout } from "./two_column_auth_layout";
import { useRouter } from "next/navigation";
import { Home } from "lucide-react";
import type { StaticImageData } from "next/image";

// section: types
export type AlreadyLoggedInGuardProps = {
  image_src: string | StaticImageData;
  image_alt: string;
  image_background_color?: string;
  message?: string;
  showLogoutButton?: boolean;
  showReturnHomeButton?: boolean;
  returnHomeButtonLabel?: string;
  returnHomePath?: string;
  requireEmailVerified?: boolean;
  children: React.ReactNode;
};

// section: component
/**
 * Guard component that shows "already logged in" message if user is authenticated
 * Otherwise renders children
 * @param props - Component props including layout config and message customization
 * @returns Either the "already logged in" UI or the children
 */
export function AlreadyLoggedInGuard({
  image_src,
  image_alt,
  image_background_color = "#f1f5f9",
  message = "You're already logged in.",
  showLogoutButton = true,
  showReturnHomeButton = false,
  returnHomeButtonLabel = "Return home",
  returnHomePath = "/",
  requireEmailVerified = false,
  children,
}: AlreadyLoggedInGuardProps) {
  const router = useRouter();
  const authStatus = use_auth_status();

  // Check if user should see "already logged in" message
  // If requireEmailVerified is true, only show if email is verified
  // If requireEmailVerified is false, show if authenticated
  const shouldShowAlreadyLoggedIn =
    authStatus.authenticated &&
    !authStatus.loading &&
    (!requireEmailVerified || authStatus.email_verified === true);

  if (shouldShowAlreadyLoggedIn) {
    return (
      <TwoColumnAuthLayout
        imageSrc={image_src}
        imageAlt={image_alt}
        imageBackgroundColor={image_background_color}
        formContent={
          <div className="cls_already_logged_in_guard flex flex-col items-center justify-center gap-4 p-8 text-center">
            <p className="cls_already_logged_in_guard_message text-lg font-medium text-slate-900">
              {message}
            </p>
            <div className="cls_already_logged_in_guard_actions flex flex-col gap-3 items-center mt-4">
              {showLogoutButton && (
                <LogoutButton
                  className="cls_already_logged_in_guard_logout_button"
                  variant="default"
                />
              )}
              {showReturnHomeButton && (
                <Button
                  onClick={() => router.push(returnHomePath)}
                  variant="outline"
                  className="cls_already_logged_in_guard_return_home_button"
                  aria-label={returnHomeButtonLabel}
                >
                  <Home className="h-4 w-4 mr-2" aria-hidden="true" />
                  {returnHomeButtonLabel}
                </Button>
              )}
            </div>
          </div>
        }
      />
    );
  }

  return <>{children}</>;
}


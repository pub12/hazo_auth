// file_description: reusable component to show unauthorized message when user is not authenticated
// section: client_directive
"use client";

// section: imports
import { use_auth_status } from "@/components/layouts/shared/hooks/use_auth_status";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

// section: types
export type UnauthorizedGuardProps = {
  message?: string;
  loginButtonLabel?: string;
  loginPath?: string;
  children: React.ReactNode;
};

// section: component
/**
 * Guard component that shows unauthorized message if user is not authenticated
 * Otherwise renders children
 * @param props - Component props including message and login button customization
 * @returns Either the unauthorized UI or the children
 */
export function UnauthorizedGuard({
  message = "You must be logged in to access this page.",
  loginButtonLabel = "Go to login",
  loginPath = "/login",
  children,
}: UnauthorizedGuardProps) {
  const router = useRouter();
  const authStatus = use_auth_status();

  // Check if user should see unauthorized message
  const shouldShowUnauthorized = !authStatus.authenticated && !authStatus.loading;

  if (shouldShowUnauthorized) {
    return (
      <div className="cls_unauthorized_guard flex flex-col items-center justify-center min-h-screen p-8">
        <div className="cls_unauthorized_guard_content flex flex-col items-center gap-4 text-center max-w-md">
          <div className="cls_unauthorized_guard_icon flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
            <LogIn className="h-8 w-8 text-red-600" aria-hidden="true" />
          </div>
          <div className="cls_unauthorized_guard_text">
            <h1 className="cls_unauthorized_guard_heading text-2xl font-semibold text-slate-900 mb-2">
              Access Denied
            </h1>
            <p className="cls_unauthorized_guard_message text-slate-600">
              {message}
            </p>
          </div>
          <Button
            onClick={() => router.push(loginPath)}
            variant="default"
            className="cls_unauthorized_guard_login_button mt-4"
            aria-label={loginButtonLabel}
          >
            <LogIn className="h-4 w-4 mr-2" aria-hidden="true" />
            {loginButtonLabel}
          </Button>
        </div>
      </div>
    );
  }

  // Show loading state while checking authentication
  if (authStatus.loading) {
    return (
      <div className="cls_unauthorized_guard_loading flex items-center justify-center min-h-screen">
        <div className="cls_unauthorized_guard_loading_text text-slate-600">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}


// file_description: logout button component for user logout functionality
// section: client_directive
"use client";

// section: imports
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { trigger_auth_status_refresh } from "@/components/layouts/shared/hooks/use_auth_status";

// section: types
export type LogoutButtonProps = {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
};

// section: component
export function LogoutButton({
  className,
  variant = "outline",
  size = "default",
}: LogoutButtonProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/hazo_auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Logout failed");
      }

      toast.success("Logged out successfully");
      
      // Trigger auth status refresh in all components (navbar, sidebar, etc.)
      trigger_auth_status_refresh();
      
      // Refresh the page to update authentication state (cookies are cleared server-side)
      router.refresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Logout failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoggingOut}
      variant={variant}
      size={size}
      className={className}
      aria-label="Logout"
    >
      <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
      {isLoggingOut ? "Logging out..." : "Logout"}
    </Button>
  );
}


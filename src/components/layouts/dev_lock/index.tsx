// file_description: Development lock screen layout component
// A simple centered layout for entering the dev lock password
// section: client_directive
"use client";

// section: imports
import { useState, useCallback } from "react";
import Image from "next/image";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Lock, AlertCircle, Loader2 } from "lucide-react";

// section: types
export type DevLockLayoutProps = {
  /** Background color (default: #000000 - black) */
  background_color?: string;
  /** Logo image path (empty = no logo shown, configure to show) */
  logo_path?: string;
  /** Logo width in pixels (default: 120) */
  logo_width?: number;
  /** Logo height in pixels (default: 120) */
  logo_height?: number;
  /** Application name displayed below logo */
  application_name?: string;
  /** Limited access text displayed with lock icon (default: "Limited Access") */
  limited_access_text?: string;
  /** Password input placeholder (default: "Enter access password") */
  password_placeholder?: string;
  /** Submit button text (default: "Unlock") */
  submit_button_text?: string;
  /** Error message for incorrect password (default: "Incorrect password") */
  error_message?: string;
  /** Text color for labels (default: #ffffff - white) */
  text_color?: string;
  /** Accent color for button (default: #3b82f6 - blue) */
  accent_color?: string;
  /** Callback when unlock is successful */
  onUnlock?: () => void;
};

// section: component
export default function DevLockLayout({
  background_color = "#000000",
  logo_path = "",
  logo_width = 120,
  logo_height = 120,
  application_name = "",
  limited_access_text = "Limited Access",
  password_placeholder = "Enter access password",
  submit_button_text = "Unlock",
  error_message = "Incorrect password",
  text_color = "#ffffff",
  accent_color = "#3b82f6",
  onUnlock,
}: DevLockLayoutProps) {
  // Only show logo if logo_path is configured (non-empty)
  const showLogo = logo_path !== "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setIsLoading(true);

      try {
        const response = await fetch("/api/hazo_auth/dev_lock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });

        if (response.ok) {
          // Success - redirect to home or call onUnlock
          if (onUnlock) {
            onUnlock();
          } else {
            window.location.href = "/";
          }
        } else {
          setError(error_message);
          setPassword("");
        }
      } catch {
        setError("An error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [password, error_message, onUnlock]
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
      // Clear error when user starts typing
      if (error) {
        setError(null);
      }
    },
    [error]
  );

  return (
    <div
      className="cls_dev_lock_layout min-h-screen flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: background_color }}
    >
      <div className="cls_dev_lock_container flex flex-col items-center gap-6 max-w-sm w-full">
        {/* Logo - only shown if configured */}
        {showLogo && (
          <div className="cls_dev_lock_logo">
            <Image
              src={logo_path}
              alt="Application logo"
              width={logo_width}
              height={logo_height}
              className="object-contain"
              priority
            />
          </div>
        )}

        {/* Application Name */}
        {application_name && (
          <h1
            className="cls_dev_lock_app_name text-2xl font-bold text-center"
            style={{ color: text_color }}
          >
            {application_name}
          </h1>
        )}

        {/* Lock Icon and Limited Access Text */}
        <div className="cls_dev_lock_header flex items-center gap-2">
          <Lock className="w-5 h-5" style={{ color: text_color }} />
          <span
            className="cls_dev_lock_text text-sm font-medium uppercase tracking-wider"
            style={{ color: text_color, opacity: 0.8 }}
          >
            {limited_access_text}
          </span>
        </div>

        {/* Password Form */}
        <form
          onSubmit={handleSubmit}
          className="cls_dev_lock_form flex flex-col gap-4 w-full"
        >
          <div className="cls_dev_lock_input_wrapper relative">
            <Input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder={password_placeholder}
              className="cls_dev_lock_input h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20"
              disabled={isLoading}
              autoFocus
              autoComplete="current-password"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="cls_dev_lock_error flex items-center gap-2 text-sm"
              style={{ color: "#ef4444" }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="cls_dev_lock_button h-12 font-medium transition-colors"
            style={{
              backgroundColor: accent_color,
              color: "#ffffff",
            }}
            disabled={isLoading || !password}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              submit_button_text
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

export { DevLockLayout };

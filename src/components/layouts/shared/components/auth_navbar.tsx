// file_description: configurable navbar component for auth pages with logo, company name, and home link
// section: client_directive
"use client";

// section: imports
import Link from "next/link";
import Image from "next/image";
import { Home } from "lucide-react";
import { cn } from "../../../../lib/utils";

// section: types
export type AuthNavbarProps = {
  /** Logo image path (empty string = no logo shown) */
  logo_path?: string;
  /** Logo width in pixels */
  logo_width?: number;
  /** Logo height in pixels */
  logo_height?: number;
  /** Company/application name displayed next to logo */
  company_name?: string;
  /** Home link path */
  home_path?: string;
  /** Home link label */
  home_label?: string;
  /** Show home link */
  show_home_link?: boolean;
  /** Navbar background color */
  background_color?: string;
  /** Navbar text color */
  text_color?: string;
  /** Navbar height in pixels */
  height?: number;
  /** Additional CSS class */
  className?: string;
};

// section: component
export function AuthNavbar({
  logo_path = "",
  logo_width = 28,
  logo_height = 28,
  company_name = "",
  home_path = "/",
  home_label = "Home",
  show_home_link = true,
  background_color,
  text_color,
  height = 48,
  className,
}: AuthNavbarProps) {
  // Only show logo if logo_path is configured (non-empty)
  const showLogo = logo_path !== "";
  const navStyle: React.CSSProperties = {
    height: `${height}px`,
    ...(background_color && { backgroundColor: background_color }),
    ...(text_color && { color: text_color }),
  };

  return (
    <nav
      className={cn(
        "cls_auth_navbar flex w-full items-center justify-between border-b border-border/40 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
      style={navStyle}
      aria-label="Authentication page navigation"
    >
      {/* Left: Logo and Company Name */}
      <div className="cls_auth_navbar_brand flex items-center gap-3">
        {(showLogo || company_name) && (
          <Link href={home_path} className="cls_auth_navbar_logo_link flex items-center gap-3">
            {showLogo && (
              <Image
                src={logo_path}
                alt={company_name ? `${company_name} logo` : "Logo"}
                width={logo_width}
                height={logo_height}
                className="cls_auth_navbar_logo object-contain"
              />
            )}
            {company_name && (
              <span className="cls_auth_navbar_company_name text-lg font-semibold text-foreground">
                {company_name}
              </span>
            )}
          </Link>
        )}
      </div>

      {/* Right: Home Link */}
      {show_home_link && (
        <div className="cls_auth_navbar_links flex items-center gap-4">
          <Link
            href={home_path}
            className="cls_auth_navbar_home_link flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            aria-label={`Navigate to ${home_label}`}
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            <span>{home_label}</span>
          </Link>
        </div>
      )}
    </nav>
  );
}

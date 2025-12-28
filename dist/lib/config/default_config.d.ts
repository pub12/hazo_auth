export declare const DEFAULT_PASSWORD_REQUIREMENTS: {
    readonly minimum_length: 8;
    readonly require_uppercase: false;
    readonly require_lowercase: false;
    readonly require_number: false;
    readonly require_special: false;
};
export declare const DEFAULT_USER_FIELDS: {
    readonly show_name_field: true;
    readonly show_email_field: true;
    readonly show_password_field: true;
};
export declare const DEFAULT_PROFILE_PICTURE: {
    readonly allow_photo_upload: true;
    readonly max_photo_size: 5242880;
    readonly user_photo_default: true;
    readonly user_photo_default_priority1: "gravatar";
    readonly user_photo_default_priority2: "library";
    readonly library_photo_path: "/profile_pictures/library";
};
export declare const DEFAULT_UI_SIZES: {
    readonly gravatar_size: 200;
    readonly profile_picture_size: 128;
    readonly tooltip_icon_size_default: 16;
    readonly tooltip_icon_size_small: 14;
    readonly library_photo_grid_columns: 4;
    readonly library_photo_preview_size: 80;
    readonly image_compression_max_dimension: 800;
    readonly upload_file_hard_limit_bytes: 10485760;
};
export declare const DEFAULT_FILE_TYPES: {
    readonly allowed_image_extensions: readonly [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    readonly allowed_image_mime_types: readonly ["image/jpeg", "image/png", "image/gif", "image/webp"];
};
export declare const DEFAULT_MESSAGES: {
    readonly photo_upload_disabled_message: "Photo upload is currently disabled. Contact your administrator.";
    readonly gravatar_setup_message: "To use Gravatar, create a free account at gravatar.com with the same email address you use here.";
    readonly gravatar_no_account_message: "No Gravatar account found for your email. Using library photo instead.";
    readonly library_tooltip_message: "Choose from our library of profile pictures";
};
export declare const DEFAULT_ALREADY_LOGGED_IN: {
    readonly message: "You are already logged in";
    readonly showLogoutButton: true;
    readonly showReturnHomeButton: true;
    readonly returnHomeButtonLabel: "Return Home";
    readonly returnHomePath: "/";
};
export declare const DEFAULT_LOGIN: {
    readonly redirectRoute: string | undefined;
    readonly successMessage: "Successfully logged in";
    readonly forgotPasswordPath: "/hazo_auth/forgot_password";
    readonly forgotPasswordLabel: "Forgot password?";
    readonly createAccountPath: "/hazo_auth/register";
    readonly createAccountLabel: "Create account";
};
export declare const DEFAULT_REGISTER: {
    readonly redirectRoute: string | undefined;
    readonly successMessage: "Registration successful! Please check your email to verify your account.";
    readonly loginPath: "/hazo_auth/login";
    readonly loginLabel: "Already have an account? Sign in";
    readonly requireEmailVerification: true;
};
export declare const DEFAULT_FORGOT_PASSWORD: {
    readonly successMessage: "If an account with that email exists, a password reset link has been sent.";
    readonly loginPath: "/hazo_auth/login";
    readonly loginLabel: "Back to login";
};
export declare const DEFAULT_RESET_PASSWORD: {
    readonly successMessage: "Password reset successfully. You can now log in with your new password.";
    readonly loginPath: "/hazo_auth/login";
    readonly redirectDelay: 2;
};
export declare const DEFAULT_EMAIL_VERIFICATION: {
    readonly successMessage: "Email verified successfully! Redirecting to login...";
    readonly errorMessage: "Email verification failed. The link may have expired.";
    readonly loginPath: "/hazo_auth/login";
    readonly redirectDelay: 5;
};
export declare const DEFAULT_MY_SETTINGS: {
    readonly showNameField: true;
    readonly showEmailField: true;
    readonly showPasswordField: true;
    readonly showProfilePicture: true;
};
export declare const DEFAULT_USER_MANAGEMENT: {
    readonly enableUserManagement: true;
    readonly enableRoleManagement: true;
    readonly enablePermissionManagement: true;
};
export declare const DEFAULT_AUTH_UTILITY: {
    readonly sessionCookieName: "hazo_session";
    readonly sessionDuration: 86400;
    readonly requireEmailVerification: true;
};
export declare const DEFAULT_UI_SHELL: {
    readonly layout_mode: "standalone" | "test_sidebar";
    readonly image_src: "/globe.svg";
    readonly image_width: 400;
    readonly image_height: 400;
    readonly show_visual_panel: true;
};
export declare const DEFAULT_PROFILE_PIC_MENU: {
    readonly show_single_button: false;
    readonly sign_up_label: "Sign Up";
    readonly sign_in_label: "Sign In";
    readonly register_path: "/hazo_auth/register";
    readonly login_path: "/hazo_auth/login";
    readonly settings_path: "/hazo_auth/my_settings";
    readonly logout_path: "/api/hazo_auth/logout";
};
export declare const DEFAULT_API_PATHS: {
    readonly apiBasePath: "/api/hazo_auth";
};
export declare const DEFAULT_OAUTH: {
    /** Enable Google OAuth login (requires HAZO_AUTH_GOOGLE_CLIENT_ID and HAZO_AUTH_GOOGLE_CLIENT_SECRET env vars) */
    readonly enable_google: true;
    /** Enable traditional email/password login */
    readonly enable_email_password: true;
    /** Auto-link Google login to existing unverified email/password accounts and mark as verified */
    readonly auto_link_unverified_accounts: true;
    /** Text displayed on the Google sign-in button */
    readonly google_button_text: "Continue with Google";
    /** Text displayed on the divider between OAuth and email/password form */
    readonly oauth_divider_text: "or continue with email";
};
export declare const DEFAULT_MULTI_TENANCY: {
    /** Enable multi-tenancy support (default: false) */
    readonly enable_multi_tenancy: false;
    /** Cache TTL in minutes for org lookups (default: 15) */
    readonly org_cache_ttl_minutes: 15;
    /** Maximum entries in org cache (default: 1000) */
    readonly org_cache_max_entries: 1000;
    /** Default user limit per organization (0 = unlimited) */
    readonly default_user_limit: 0;
};
export declare const DEFAULT_NAVBAR: {
    /** Enable navbar on auth pages */
    readonly enable_navbar: true;
    /** Logo image path (empty = no logo shown, configure to show) */
    readonly logo_path: "";
    /** Logo width in pixels */
    readonly logo_width: 32;
    /** Logo height in pixels */
    readonly logo_height: 32;
    /** Company/application name displayed next to logo */
    readonly company_name: "";
    /** Home link path */
    readonly home_path: "/";
    /** Home link label */
    readonly home_label: "Home";
    /** Show home link */
    readonly show_home_link: true;
    /** Navbar background color (empty = transparent/inherit) */
    readonly background_color: "";
    /** Navbar text color (empty = inherit) */
    readonly text_color: "";
    /** Navbar height in pixels */
    readonly height: 64;
};
export declare const DEFAULT_USER_TYPES: {
    /** Enable user types feature (default: false) */
    readonly enable_user_types: false;
    /** Default user type for new users (empty = no default) */
    readonly default_user_type: "";
};
export declare const DEFAULT_DEV_LOCK: {
    /** Enable the development lock screen (also requires HAZO_AUTH_DEV_LOCK_ENABLED env var) */
    readonly enable: false;
    /** Session duration in days */
    readonly session_duration_days: 7;
    /** Background color (default: black) */
    readonly background_color: "#000000";
    /** Logo image path (empty = no logo shown, configure to show) */
    readonly logo_path: "";
    /** Logo width in pixels */
    readonly logo_width: 120;
    /** Logo height in pixels */
    readonly logo_height: 120;
    /** Application name displayed below logo */
    readonly application_name: "";
    /** Limited access text displayed with lock icon */
    readonly limited_access_text: "Limited Access";
    /** Password input placeholder text */
    readonly password_placeholder: "Enter access password";
    /** Submit button text */
    readonly submit_button_text: "Unlock";
    /** Error message for incorrect password */
    readonly error_message: "Incorrect password";
    /** Text color for labels (default: white) */
    readonly text_color: "#ffffff";
    /** Accent color for button (default: blue) */
    readonly accent_color: "#3b82f6";
};
/**
 * All default configuration values combined in one object
 * This makes it easy to see all defaults at a glance and export them as needed
 */
export declare const HAZO_AUTH_DEFAULTS: {
    readonly passwordRequirements: {
        readonly minimum_length: 8;
        readonly require_uppercase: false;
        readonly require_lowercase: false;
        readonly require_number: false;
        readonly require_special: false;
    };
    readonly userFields: {
        readonly show_name_field: true;
        readonly show_email_field: true;
        readonly show_password_field: true;
    };
    readonly profilePicture: {
        readonly allow_photo_upload: true;
        readonly max_photo_size: 5242880;
        readonly user_photo_default: true;
        readonly user_photo_default_priority1: "gravatar";
        readonly user_photo_default_priority2: "library";
        readonly library_photo_path: "/profile_pictures/library";
    };
    readonly uiSizes: {
        readonly gravatar_size: 200;
        readonly profile_picture_size: 128;
        readonly tooltip_icon_size_default: 16;
        readonly tooltip_icon_size_small: 14;
        readonly library_photo_grid_columns: 4;
        readonly library_photo_preview_size: 80;
        readonly image_compression_max_dimension: 800;
        readonly upload_file_hard_limit_bytes: 10485760;
    };
    readonly fileTypes: {
        readonly allowed_image_extensions: readonly [".jpg", ".jpeg", ".png", ".gif", ".webp"];
        readonly allowed_image_mime_types: readonly ["image/jpeg", "image/png", "image/gif", "image/webp"];
    };
    readonly messages: {
        readonly photo_upload_disabled_message: "Photo upload is currently disabled. Contact your administrator.";
        readonly gravatar_setup_message: "To use Gravatar, create a free account at gravatar.com with the same email address you use here.";
        readonly gravatar_no_account_message: "No Gravatar account found for your email. Using library photo instead.";
        readonly library_tooltip_message: "Choose from our library of profile pictures";
    };
    readonly alreadyLoggedIn: {
        readonly message: "You are already logged in";
        readonly showLogoutButton: true;
        readonly showReturnHomeButton: true;
        readonly returnHomeButtonLabel: "Return Home";
        readonly returnHomePath: "/";
    };
    readonly login: {
        readonly redirectRoute: string | undefined;
        readonly successMessage: "Successfully logged in";
        readonly forgotPasswordPath: "/hazo_auth/forgot_password";
        readonly forgotPasswordLabel: "Forgot password?";
        readonly createAccountPath: "/hazo_auth/register";
        readonly createAccountLabel: "Create account";
    };
    readonly register: {
        readonly redirectRoute: string | undefined;
        readonly successMessage: "Registration successful! Please check your email to verify your account.";
        readonly loginPath: "/hazo_auth/login";
        readonly loginLabel: "Already have an account? Sign in";
        readonly requireEmailVerification: true;
    };
    readonly forgotPassword: {
        readonly successMessage: "If an account with that email exists, a password reset link has been sent.";
        readonly loginPath: "/hazo_auth/login";
        readonly loginLabel: "Back to login";
    };
    readonly resetPassword: {
        readonly successMessage: "Password reset successfully. You can now log in with your new password.";
        readonly loginPath: "/hazo_auth/login";
        readonly redirectDelay: 2;
    };
    readonly emailVerification: {
        readonly successMessage: "Email verified successfully! Redirecting to login...";
        readonly errorMessage: "Email verification failed. The link may have expired.";
        readonly loginPath: "/hazo_auth/login";
        readonly redirectDelay: 5;
    };
    readonly mySettings: {
        readonly showNameField: true;
        readonly showEmailField: true;
        readonly showPasswordField: true;
        readonly showProfilePicture: true;
    };
    readonly userManagement: {
        readonly enableUserManagement: true;
        readonly enableRoleManagement: true;
        readonly enablePermissionManagement: true;
    };
    readonly authUtility: {
        readonly sessionCookieName: "hazo_session";
        readonly sessionDuration: 86400;
        readonly requireEmailVerification: true;
    };
    readonly uiShell: {
        readonly layout_mode: "standalone" | "test_sidebar";
        readonly image_src: "/globe.svg";
        readonly image_width: 400;
        readonly image_height: 400;
        readonly show_visual_panel: true;
    };
    readonly profilePicMenu: {
        readonly show_single_button: false;
        readonly sign_up_label: "Sign Up";
        readonly sign_in_label: "Sign In";
        readonly register_path: "/hazo_auth/register";
        readonly login_path: "/hazo_auth/login";
        readonly settings_path: "/hazo_auth/my_settings";
        readonly logout_path: "/api/hazo_auth/logout";
    };
    readonly apiPaths: {
        readonly apiBasePath: "/api/hazo_auth";
    };
    readonly oauth: {
        /** Enable Google OAuth login (requires HAZO_AUTH_GOOGLE_CLIENT_ID and HAZO_AUTH_GOOGLE_CLIENT_SECRET env vars) */
        readonly enable_google: true;
        /** Enable traditional email/password login */
        readonly enable_email_password: true;
        /** Auto-link Google login to existing unverified email/password accounts and mark as verified */
        readonly auto_link_unverified_accounts: true;
        /** Text displayed on the Google sign-in button */
        readonly google_button_text: "Continue with Google";
        /** Text displayed on the divider between OAuth and email/password form */
        readonly oauth_divider_text: "or continue with email";
    };
    readonly devLock: {
        /** Enable the development lock screen (also requires HAZO_AUTH_DEV_LOCK_ENABLED env var) */
        readonly enable: false;
        /** Session duration in days */
        readonly session_duration_days: 7;
        /** Background color (default: black) */
        readonly background_color: "#000000";
        /** Logo image path (empty = no logo shown, configure to show) */
        readonly logo_path: "";
        /** Logo width in pixels */
        readonly logo_width: 120;
        /** Logo height in pixels */
        readonly logo_height: 120;
        /** Application name displayed below logo */
        readonly application_name: "";
        /** Limited access text displayed with lock icon */
        readonly limited_access_text: "Limited Access";
        /** Password input placeholder text */
        readonly password_placeholder: "Enter access password";
        /** Submit button text */
        readonly submit_button_text: "Unlock";
        /** Error message for incorrect password */
        readonly error_message: "Incorrect password";
        /** Text color for labels (default: white) */
        readonly text_color: "#ffffff";
        /** Accent color for button (default: blue) */
        readonly accent_color: "#3b82f6";
    };
    readonly multiTenancy: {
        /** Enable multi-tenancy support (default: false) */
        readonly enable_multi_tenancy: false;
        /** Cache TTL in minutes for org lookups (default: 15) */
        readonly org_cache_ttl_minutes: 15;
        /** Maximum entries in org cache (default: 1000) */
        readonly org_cache_max_entries: 1000;
        /** Default user limit per organization (0 = unlimited) */
        readonly default_user_limit: 0;
    };
    readonly navbar: {
        /** Enable navbar on auth pages */
        readonly enable_navbar: true;
        /** Logo image path (empty = no logo shown, configure to show) */
        readonly logo_path: "";
        /** Logo width in pixels */
        readonly logo_width: 32;
        /** Logo height in pixels */
        readonly logo_height: 32;
        /** Company/application name displayed next to logo */
        readonly company_name: "";
        /** Home link path */
        readonly home_path: "/";
        /** Home link label */
        readonly home_label: "Home";
        /** Show home link */
        readonly show_home_link: true;
        /** Navbar background color (empty = transparent/inherit) */
        readonly background_color: "";
        /** Navbar text color (empty = inherit) */
        readonly text_color: "";
        /** Navbar height in pixels */
        readonly height: 64;
    };
    readonly userTypes: {
        /** Enable user types feature (default: false) */
        readonly enable_user_types: false;
        /** Default user type for new users (empty = no default) */
        readonly default_user_type: "";
    };
};
/**
 * Type representing the complete default configuration structure
 */
export type HazoAuthDefaults = typeof HAZO_AUTH_DEFAULTS;
//# sourceMappingURL=default_config.d.ts.map
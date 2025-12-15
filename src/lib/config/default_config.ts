// file_description: Centralized default configuration for hazo_auth
// All default values in one place for easy reference and maintenance
// These defaults are used when hazo_auth_config.ini is missing or incomplete

// section: password_requirements
export const DEFAULT_PASSWORD_REQUIREMENTS = {
  minimum_length: 8,
  require_uppercase: false,
  require_lowercase: false,
  require_number: false,
  require_special: false,
} as const;

// section: user_fields
export const DEFAULT_USER_FIELDS = {
  show_name_field: true,
  show_email_field: true,
  show_password_field: true,
} as const;

// section: profile_picture
export const DEFAULT_PROFILE_PICTURE = {
  allow_photo_upload: true,
  max_photo_size: 5242880, // 5MB in bytes
  user_photo_default: true,
  user_photo_default_priority1: "gravatar" as const,
  user_photo_default_priority2: "library" as const,
  library_photo_path: "/profile_pictures/library",
} as const;

// section: ui_sizes
export const DEFAULT_UI_SIZES = {
  gravatar_size: 200,
  profile_picture_size: 128,
  tooltip_icon_size_default: 16,
  tooltip_icon_size_small: 14,
  library_photo_grid_columns: 4,
  library_photo_preview_size: 80,
  image_compression_max_dimension: 800,
  upload_file_hard_limit_bytes: 10485760, // 10MB
} as const;

// section: file_types
export const DEFAULT_FILE_TYPES = {
  allowed_image_extensions: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
  allowed_image_mime_types: ["image/jpeg", "image/png", "image/gif", "image/webp"],
} as const;

// section: messages
export const DEFAULT_MESSAGES = {
  photo_upload_disabled_message: "Photo upload is currently disabled. Contact your administrator.",
  gravatar_setup_message: "To use Gravatar, create a free account at gravatar.com with the same email address you use here.",
  gravatar_no_account_message: "No Gravatar account found for your email. Using library photo instead.",
  library_tooltip_message: "Choose from our library of profile pictures",
} as const;

// section: already_logged_in
export const DEFAULT_ALREADY_LOGGED_IN = {
  message: "You are already logged in",
  showLogoutButton: true,
  showReturnHomeButton: true,
  returnHomeButtonLabel: "Return Home",
  returnHomePath: "/",
} as const;

// section: login
export const DEFAULT_LOGIN = {
  redirectRoute: undefined as string | undefined,
  successMessage: "Successfully logged in",
  forgotPasswordPath: "/hazo_auth/forgot_password",
  forgotPasswordLabel: "Forgot password?",
  createAccountPath: "/hazo_auth/register",
  createAccountLabel: "Create account",
} as const;

// section: register
export const DEFAULT_REGISTER = {
  redirectRoute: undefined as string | undefined,
  successMessage: "Registration successful! Please check your email to verify your account.",
  loginPath: "/hazo_auth/login",
  loginLabel: "Already have an account? Sign in",
  requireEmailVerification: true,
} as const;

// section: forgot_password
export const DEFAULT_FORGOT_PASSWORD = {
  successMessage: "If an account with that email exists, a password reset link has been sent.",
  loginPath: "/hazo_auth/login",
  loginLabel: "Back to login",
} as const;

// section: reset_password
export const DEFAULT_RESET_PASSWORD = {
  successMessage: "Password reset successfully. You can now log in with your new password.",
  loginPath: "/hazo_auth/login",
  redirectDelay: 2, // seconds
} as const;

// section: email_verification
export const DEFAULT_EMAIL_VERIFICATION = {
  successMessage: "Email verified successfully! Redirecting to login...",
  errorMessage: "Email verification failed. The link may have expired.",
  loginPath: "/hazo_auth/login",
  redirectDelay: 5, // seconds
} as const;

// section: my_settings
export const DEFAULT_MY_SETTINGS = {
  showNameField: true,
  showEmailField: true,
  showPasswordField: true,
  showProfilePicture: true,
} as const;

// section: user_management
export const DEFAULT_USER_MANAGEMENT = {
  enableUserManagement: true,
  enableRoleManagement: true,
  enablePermissionManagement: true,
} as const;

// section: auth_utility
export const DEFAULT_AUTH_UTILITY = {
  sessionCookieName: "hazo_session",
  sessionDuration: 86400, // 24 hours in seconds
  requireEmailVerification: true,
} as const;

// section: ui_shell
export const DEFAULT_UI_SHELL = {
  layout_mode: "standalone" as "standalone" | "test_sidebar",
  image_src: "/globe.svg",
  image_width: 400,
  image_height: 400,
  show_visual_panel: true,
} as const;

// section: profile_pic_menu
export const DEFAULT_PROFILE_PIC_MENU = {
  show_single_button: false,
  sign_up_label: "Sign Up",
  sign_in_label: "Sign In",
  register_path: "/hazo_auth/register",
  login_path: "/hazo_auth/login",
  settings_path: "/hazo_auth/my_settings",
  logout_path: "/api/hazo_auth/logout",
} as const;

// section: api_paths
export const DEFAULT_API_PATHS = {
  apiBasePath: "/api/hazo_auth",
} as const;

// section: oauth
export const DEFAULT_OAUTH = {
  /** Enable Google OAuth login (requires HAZO_AUTH_GOOGLE_CLIENT_ID and HAZO_AUTH_GOOGLE_CLIENT_SECRET env vars) */
  enable_google: true,
  /** Enable traditional email/password login */
  enable_email_password: true,
  /** Auto-link Google login to existing unverified email/password accounts and mark as verified */
  auto_link_unverified_accounts: true,
  /** Text displayed on the Google sign-in button */
  google_button_text: "Continue with Google",
  /** Text displayed on the divider between OAuth and email/password form */
  oauth_divider_text: "or continue with email",
} as const;

// section: multi_tenancy
export const DEFAULT_MULTI_TENANCY = {
  /** Enable multi-tenancy support (default: false) */
  enable_multi_tenancy: false,
  /** Cache TTL in minutes for org lookups (default: 15) */
  org_cache_ttl_minutes: 15,
  /** Maximum entries in org cache (default: 1000) */
  org_cache_max_entries: 1000,
  /** Default user limit per organization (0 = unlimited) */
  default_user_limit: 0,
} as const;

// section: dev_lock
export const DEFAULT_DEV_LOCK = {
  /** Enable the development lock screen (also requires HAZO_AUTH_DEV_LOCK_ENABLED env var) */
  enable: false,
  /** Session duration in days */
  session_duration_days: 7,
  /** Background color (default: black) */
  background_color: "#000000",
  /** Logo image path (default: /logo.png in public folder) */
  logo_path: "/logo.png",
  /** Logo width in pixels */
  logo_width: 120,
  /** Logo height in pixels */
  logo_height: 120,
  /** Application name displayed below logo */
  application_name: "",
  /** Limited access text displayed with lock icon */
  limited_access_text: "Limited Access",
  /** Password input placeholder text */
  password_placeholder: "Enter access password",
  /** Submit button text */
  submit_button_text: "Unlock",
  /** Error message for incorrect password */
  error_message: "Incorrect password",
  /** Text color for labels (default: white) */
  text_color: "#ffffff",
  /** Accent color for button (default: blue) */
  accent_color: "#3b82f6",
} as const;

// section: combined_defaults
/**
 * All default configuration values combined in one object
 * This makes it easy to see all defaults at a glance and export them as needed
 */
export const HAZO_AUTH_DEFAULTS = {
  passwordRequirements: DEFAULT_PASSWORD_REQUIREMENTS,
  userFields: DEFAULT_USER_FIELDS,
  profilePicture: DEFAULT_PROFILE_PICTURE,
  uiSizes: DEFAULT_UI_SIZES,
  fileTypes: DEFAULT_FILE_TYPES,
  messages: DEFAULT_MESSAGES,
  alreadyLoggedIn: DEFAULT_ALREADY_LOGGED_IN,
  login: DEFAULT_LOGIN,
  register: DEFAULT_REGISTER,
  forgotPassword: DEFAULT_FORGOT_PASSWORD,
  resetPassword: DEFAULT_RESET_PASSWORD,
  emailVerification: DEFAULT_EMAIL_VERIFICATION,
  mySettings: DEFAULT_MY_SETTINGS,
  userManagement: DEFAULT_USER_MANAGEMENT,
  authUtility: DEFAULT_AUTH_UTILITY,
  uiShell: DEFAULT_UI_SHELL,
  profilePicMenu: DEFAULT_PROFILE_PIC_MENU,
  apiPaths: DEFAULT_API_PATHS,
  oauth: DEFAULT_OAUTH,
  devLock: DEFAULT_DEV_LOCK,
  multiTenancy: DEFAULT_MULTI_TENANCY,
} as const;

// section: types
/**
 * Type representing the complete default configuration structure
 */
export type HazoAuthDefaults = typeof HAZO_AUTH_DEFAULTS;

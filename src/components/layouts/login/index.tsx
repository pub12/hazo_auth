// file_description: login layout component built atop shared layout utilities
// section: client_directive
"use client";

// section: imports
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { StaticImageData } from "next/image";
import { Input } from "../../ui/input";
import { PasswordField } from "../shared/components/password_field";
import { FormFieldWrapper } from "../shared/components/form_field_wrapper";
import { FormHeader } from "../shared/components/form_header";
import { FormActionButtons } from "../shared/components/form_action_buttons";
import { TwoColumnAuthLayout } from "../shared/components/two_column_auth_layout";
import { CheckCircle, AlertCircle } from "lucide-react";
import { AlreadyLoggedInGuard } from "../shared/components/already_logged_in_guard";
import { GoogleSignInButton } from "../shared/components/google_sign_in_button";
import { OAuthDivider } from "../shared/components/oauth_divider";
import {
  type ButtonPaletteOverrides,
  type LayoutFieldMapOverrides,
  type LayoutLabelOverrides,
} from "../shared/config/layout_customization";
import {
  LOGIN_FIELD_IDS,
  createLoginFieldDefinitions,
  resolveLoginButtonPalette,
  resolveLoginLabels,
} from "./config/login_field_config";
import {
  use_login_form,
  type UseLoginFormResult,
} from "./hooks/use_login_form";
import { type LayoutDataClient } from "../shared/data/layout_data_client";

// section: types
export type OAuthLayoutConfig = {
  /** Enable Google OAuth login */
  enable_google: boolean;
  /** Enable traditional email/password login */
  enable_email_password: boolean;
  /** Text displayed on the Google sign-in button */
  google_button_text: string;
  /** Text displayed on the divider between OAuth and email/password form */
  oauth_divider_text: string;
};

export type LoginLayoutProps<TClient = unknown> = {
  image_src: string | StaticImageData;
  image_alt: string;
  image_background_color?: string;
  field_overrides?: LayoutFieldMapOverrides;
  labels?: LayoutLabelOverrides;
  button_colors?: ButtonPaletteOverrides;
  data_client: LayoutDataClient<TClient>;
  logger?: {
    info: (message: string, data?: Record<string, unknown>) => void;
    error: (message: string, data?: Record<string, unknown>) => void;
    warn: (message: string, data?: Record<string, unknown>) => void;
    debug: (message: string, data?: Record<string, unknown>) => void;
  };
  redirectRoute?: string;
  successMessage?: string;
  alreadyLoggedInMessage?: string;
  showLogoutButton?: boolean;
  showReturnHomeButton?: boolean;
  returnHomeButtonLabel?: string;
  returnHomePath?: string;
  forgot_password_path?: string;
  forgot_password_label?: string;
  create_account_path?: string;
  create_account_label?: string;
  /** Show/hide "Create account" link (default: true) */
  show_create_account_link?: boolean;
  urlOnLogon?: string;
  /** OAuth configuration */
  oauth?: OAuthLayoutConfig;
};

const ORDERED_FIELDS: LoginFieldId[] = [
  LOGIN_FIELD_IDS.EMAIL,
  LOGIN_FIELD_IDS.PASSWORD,
];

type LoginFieldId = (typeof LOGIN_FIELD_IDS)[keyof typeof LOGIN_FIELD_IDS];

// section: component
export default function login_layout<TClient>({
  image_src,
  image_alt,
  image_background_color = "#f1f5f9",
  field_overrides,
  labels,
  button_colors,
  data_client,
  logger,
  redirectRoute,
  successMessage = "Successfully logged in",
  alreadyLoggedInMessage = "You are already logged in",
  showLogoutButton = true,
  showReturnHomeButton = false,
  returnHomeButtonLabel = "Return home",
  returnHomePath = "/",
  forgot_password_path = "/hazo_auth/forgot_password",
  forgot_password_label = "Forgot password?",
  create_account_path = "/hazo_auth/register",
  create_account_label = "Create account",
  show_create_account_link = true,
  urlOnLogon,
  oauth,
}: LoginLayoutProps<TClient>) {
  // Default OAuth config: both enabled
  const oauthConfig = oauth || {
    enable_google: true,
    enable_email_password: true,
    google_button_text: "Continue with Google",
    oauth_divider_text: "or continue with email",
  };

  // Read OAuth error from URL query params (e.g., ?error=AccessDenied)
  const searchParams = useSearchParams();
  const oauthError = searchParams.get("error");

  const getOAuthErrorMessage = (error: string): string => {
    switch (error) {
      case "AccessDenied":
        return "Access was denied. You may have cancelled the sign-in or your account is not authorized.";
      case "OAuthSignin":
      case "OAuthCallback":
      case "OAuthCreateAccount":
        return "Something went wrong with Google sign-in. Please try again.";
      default:
        return "An error occurred during sign-in. Please try again.";
    }
  };

  const fieldDefinitions = createLoginFieldDefinitions(field_overrides);
  const resolvedLabels = resolveLoginLabels(labels);
  const resolvedButtonPalette = resolveLoginButtonPalette(button_colors);

  const form = use_login_form({
    dataClient: data_client,
    logger,
    redirectRoute,
    successMessage,
    urlOnLogon: urlOnLogon,
  });

  const renderFields = (formState: UseLoginFormResult) => {
    return ORDERED_FIELDS.map((fieldId) => {
      const fieldDefinition = fieldDefinitions[fieldId];
      const fieldValue = formState.values[fieldId];
      const fieldError = formState.errors[fieldId];

      const isPasswordField = fieldDefinition.type === "password";

      const inputElement = isPasswordField ? (
        <PasswordField
          inputId={fieldDefinition.id}
          ariaLabel={fieldDefinition.ariaLabel}
          value={fieldValue}
          placeholder={fieldDefinition.placeholder}
          autoComplete={fieldDefinition.autoComplete}
          isVisible={formState.passwordVisibility.password}
          onChange={(nextValue) => formState.handleFieldChange(fieldId, nextValue)}
          onToggleVisibility={formState.togglePasswordVisibility}
          errorMessage={fieldError}
        />
      ) : (
        <Input
          id={fieldDefinition.id}
          type={fieldDefinition.type}
          value={fieldValue}
          onChange={(event) =>
            formState.handleFieldChange(fieldId, event.target.value)
          }
          onBlur={
            fieldId === LOGIN_FIELD_IDS.EMAIL
              ? formState.handleEmailBlur
              : undefined
          }
          autoComplete={fieldDefinition.autoComplete}
          placeholder={fieldDefinition.placeholder}
          aria-label={fieldDefinition.ariaLabel}
          className="cls_login_layout_field_input"
        />
      );

      // Only show email error if field has been touched (blurred)
      const shouldShowError =
        isPasswordField
          ? undefined
          : fieldId === LOGIN_FIELD_IDS.EMAIL
            ? formState.emailTouched && fieldError
              ? fieldError
              : undefined
            : fieldError;

      return (
        <FormFieldWrapper
          key={fieldId}
          fieldId={fieldDefinition.id}
          label={fieldDefinition.label}
          input={inputElement}
          errorMessage={shouldShowError}
        />
      );
    });
  };

  // Show success message if login was successful and no redirect route is provided
  if (form.isSuccess) {
    return (
      <TwoColumnAuthLayout
        imageSrc={image_src}
        imageAlt={image_alt}
        imageBackgroundColor={image_background_color}
        formContent={
          <>
            <FormHeader
              heading={resolvedLabels.heading}
              subHeading={resolvedLabels.subHeading}
            />
            <div className="cls_login_layout_success flex flex-col items-center justify-center gap-4 p-8 text-center">
              <CheckCircle
                className="cls_login_layout_success_icon h-16 w-16 text-green-600"
                aria-hidden="true"
              />
              <p className="cls_login_layout_success_message text-lg font-medium text-slate-900">
                {successMessage}
              </p>
            </div>
          </>
        }
      />
    );
  }

  return (
    <AlreadyLoggedInGuard
      image_src={image_src}
      image_alt={image_alt}
      image_background_color={image_background_color}
      message={alreadyLoggedInMessage}
      showLogoutButton={showLogoutButton}
      showReturnHomeButton={showReturnHomeButton}
      returnHomeButtonLabel={returnHomeButtonLabel}
      returnHomePath={returnHomePath}
    >
      <TwoColumnAuthLayout
        imageSrc={image_src}
        imageAlt={image_alt}
        imageBackgroundColor={image_background_color}
        formContent={
          <>
            <FormHeader
              heading={resolvedLabels.heading}
              subHeading={resolvedLabels.subHeading}
            />

            {/* OAuth Error Banner */}
            {oauthError && (
              <div className="cls_login_layout_oauth_error flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{getOAuthErrorMessage(oauthError)}</span>
              </div>
            )}

            {/* OAuth Section - Google Sign-In Button */}
            {oauthConfig.enable_google && (
              <div className="cls_login_layout_oauth_section">
                <GoogleSignInButton
                  label={oauthConfig.google_button_text}
                />
              </div>
            )}

            {/* OAuth Divider - Show when both OAuth and email/password are enabled */}
            {oauthConfig.enable_google && oauthConfig.enable_email_password && (
              <OAuthDivider text={oauthConfig.oauth_divider_text} />
            )}

            {/* Email/Password Form - Only show if enabled */}
            {oauthConfig.enable_email_password && (
              <form
                className="cls_login_layout_form_fields flex flex-col gap-5"
                onSubmit={form.handleSubmit}
                aria-label="Login form"
              >
                {renderFields(form)}
                <FormActionButtons
                  submitLabel={resolvedLabels.submitButton}
                  cancelLabel={resolvedLabels.cancelButton}
                  buttonPalette={resolvedButtonPalette}
                  isSubmitDisabled={form.isSubmitDisabled}
                  onCancel={form.handleCancel}
                  submitAriaLabel="Submit login form"
                  cancelAriaLabel="Cancel login form"
                />
                <div className="cls_login_layout_support_links flex flex-col gap-1 text-sm text-muted-foreground">
                  <Link
                    href={forgot_password_path}
                    className="cls_login_layout_forgot_password_link text-primary underline-offset-4 hover:underline"
                    aria-label="Go to forgot password page"
                  >
                    {forgot_password_label}
                  </Link>
                  {show_create_account_link && (
                    <Link
                      href={create_account_path}
                      className="cls_login_layout_create_account_link text-primary underline-offset-4 hover:underline"
                      aria-label="Go to create account page"
                    >
                      {create_account_label}
                    </Link>
                  )}
                </div>
              </form>
            )}

            {/* Create account link - Only show if email/password is disabled but OAuth is enabled */}
            {show_create_account_link && !oauthConfig.enable_email_password && oauthConfig.enable_google && (
              <div className="cls_login_layout_support_links mt-4 text-center text-sm text-muted-foreground">
                <Link
                  href={create_account_path}
                  className="cls_login_layout_create_account_link text-primary underline-offset-4 hover:underline"
                  aria-label="Go to create account page"
                >
                  {create_account_label}
                </Link>
              </div>
            )}
          </>
        }
      />
    </AlreadyLoggedInGuard>
  );
}


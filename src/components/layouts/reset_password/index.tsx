// file_description: reset password layout component built atop shared layout utilities
// section: client_directive
"use client";

// section: imports
import { PasswordField } from "@/components/layouts/shared/components/password_field";
import { FormFieldWrapper } from "@/components/layouts/shared/components/form_field_wrapper";
import { FormHeader } from "@/components/layouts/shared/components/form_header";
import { FormActionButtons } from "@/components/layouts/shared/components/form_action_buttons";
import { TwoColumnAuthLayout } from "@/components/layouts/shared/components/two_column_auth_layout";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { AlreadyLoggedInGuard } from "@/components/layouts/shared/components/already_logged_in_guard";
import {
  type ButtonPaletteOverrides,
  type LayoutFieldMapOverrides,
  type LayoutLabelOverrides,
  type PasswordRequirementOverrides,
} from "@/components/layouts/shared/config/layout_customization";
import {
  RESET_PASSWORD_FIELD_IDS,
  createResetPasswordFieldDefinitions,
  resolveResetPasswordButtonPalette,
  resolveResetPasswordLabels,
  resolveResetPasswordPasswordRequirements,
} from "@/components/layouts/reset_password/config/reset_password_field_config";
import {
  use_reset_password_form,
  type UseResetPasswordFormResult,
} from "@/components/layouts/reset_password/hooks/use_reset_password_form";
import { type LayoutDataClient } from "@/components/layouts/shared/data/layout_data_client";
import Link from "next/link";

// section: types
export type ResetPasswordLayoutProps<TClient = unknown> = {
  image_src: string;
  image_alt: string;
  image_background_color?: string;
  field_overrides?: LayoutFieldMapOverrides;
  labels?: LayoutLabelOverrides;
  button_colors?: ButtonPaletteOverrides;
  password_requirements?: PasswordRequirementOverrides;
  data_client: LayoutDataClient<TClient>;
  alreadyLoggedInMessage?: string;
  showLogoutButton?: boolean;
  showReturnHomeButton?: boolean;
  returnHomeButtonLabel?: string;
  returnHomePath?: string;
  errorMessage?: string;
  successMessage?: string;
  loginPath?: string;
  forgotPasswordPath?: string;
};

const ORDERED_FIELDS: ResetPasswordFieldId[] = [
  RESET_PASSWORD_FIELD_IDS.PASSWORD,
  RESET_PASSWORD_FIELD_IDS.CONFIRM_PASSWORD,
];

type ResetPasswordFieldId = (typeof RESET_PASSWORD_FIELD_IDS)[keyof typeof RESET_PASSWORD_FIELD_IDS];

// section: component
export default function reset_password_layout<TClient>({
  image_src,
  image_alt,
  image_background_color = "#f1f5f9",
  field_overrides,
  labels,
  button_colors,
  password_requirements,
  data_client,
  alreadyLoggedInMessage,
  showLogoutButton = true,
  showReturnHomeButton = false,
  returnHomeButtonLabel = "Return home",
  returnHomePath = "/",
  errorMessage = "Reset password link invalid or has expired. Please go to Reset Password page to get a new link.",
  successMessage = "Password reset successfully. Redirecting to login...",
  loginPath = "/login",
  forgotPasswordPath = "/forgot_password",
}: ResetPasswordLayoutProps<TClient>) {
  const fieldDefinitions = createResetPasswordFieldDefinitions(field_overrides);
  const resolvedLabels = resolveResetPasswordLabels(labels);
  const resolvedButtonPalette = resolveResetPasswordButtonPalette(button_colors);
  const resolvedPasswordRequirements = resolveResetPasswordPasswordRequirements(
    password_requirements,
  );

  const form = use_reset_password_form({
    passwordRequirements: resolvedPasswordRequirements,
    dataClient: data_client,
    loginPath,
  });

  const renderFields = (formState: UseResetPasswordFormResult) => {
    return ORDERED_FIELDS.map((fieldId) => {
      const fieldDefinition = fieldDefinitions[fieldId];
      const fieldValue = formState.values[fieldId];
      const fieldError = formState.errors[fieldId];

      const inputElement = (
        <PasswordField
          inputId={fieldDefinition.id}
          ariaLabel={fieldDefinition.ariaLabel}
          value={fieldValue}
          placeholder={fieldDefinition.placeholder}
          autoComplete={fieldDefinition.autoComplete}
          isVisible={formState.passwordVisibility[fieldDefinition.id as "password" | "confirm_password"]}
          onChange={(nextValue) => formState.handleFieldChange(fieldId, nextValue)}
          onToggleVisibility={() =>
            formState.togglePasswordVisibility(fieldDefinition.id as "password" | "confirm_password")
          }
          errorMessage={fieldError as string | string[] | undefined}
        />
      );

      return (
        <FormFieldWrapper
          key={fieldId}
          fieldId={fieldDefinition.id}
          label={fieldDefinition.label}
          input={inputElement}
          errorMessage={fieldError as string | string[] | undefined}
        />
      );
    });
  };

  // Show success message if password reset was successful
  if (form.isSuccess) {
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
              <div className="cls_reset_password_layout_success flex flex-col items-center justify-center gap-4 p-8 text-center">
                <CheckCircle
                  className="cls_reset_password_layout_success_icon h-16 w-16 text-green-600"
                  aria-hidden="true"
                />
                <p className="cls_reset_password_layout_success_message text-lg font-medium text-slate-900">
                  {successMessage}
                </p>
              </div>
            </>
          }
        />
      </AlreadyLoggedInGuard>
    );
  }

  // Show loading state while validating token
  if (form.isValidatingToken) {
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
            <div className="cls_reset_password_layout_validating flex flex-col items-center justify-center gap-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin text-slate-600" aria-hidden="true" />
              <div className="cls_reset_password_layout_validating_text text-center">
                <h1 className="cls_reset_password_layout_validating_heading text-2xl font-semibold text-slate-900">
                  {resolvedLabels.heading}
                </h1>
                <p className="cls_reset_password_layout_validating_subheading mt-2 text-sm text-slate-600">
                  Validating reset token...
                </p>
              </div>
            </div>
          }
        />
      </AlreadyLoggedInGuard>
    );
  }

  // Show error message if token is invalid or missing
  if (form.tokenError || !form.token) {
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
            <div className="cls_reset_password_layout_error flex flex-col items-center justify-center gap-4 p-8 text-center">
              <XCircle
                className="cls_reset_password_layout_error_icon h-16 w-16 text-red-600"
                aria-hidden="true"
              />
              <div className="cls_reset_password_layout_error_text">
                <h1 className="cls_reset_password_layout_error_heading text-2xl font-semibold text-slate-900">
                  Invalid Reset Link
                </h1>
                <p className="cls_reset_password_layout_error_message mt-2 text-sm text-slate-600">
                  {form.tokenError || errorMessage}
                </p>
              </div>
              <Link
                href={forgotPasswordPath}
                className="cls_reset_password_layout_forgot_password_link mt-4 text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Go to Reset Password page
              </Link>
            </div>
          }
        />
      </AlreadyLoggedInGuard>
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
            <form
              className="cls_reset_password_layout_form_fields flex flex-col gap-5"
              onSubmit={form.handleSubmit}
              aria-label="Reset password form"
            >
              {renderFields(form)}
              <FormActionButtons
                submitLabel={resolvedLabels.submitButton}
                cancelLabel={resolvedLabels.cancelButton}
                buttonPalette={resolvedButtonPalette}
                isSubmitDisabled={form.isSubmitDisabled}
                onCancel={form.handleCancel}
                submitAriaLabel="Submit reset password form"
                cancelAriaLabel="Cancel reset password form"
              />
              {form.isSubmitting && (
                <div className="cls_reset_password_layout_submitting_indicator text-sm text-slate-600 text-center">
                  Resetting password...
                </div>
              )}
            </form>
          </>
        }
      />
    </AlreadyLoggedInGuard>
  );
}


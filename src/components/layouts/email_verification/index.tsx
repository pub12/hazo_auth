// file_description: email verification layout component built atop shared layout utilities
// section: client_directive
"use client";

// section: imports
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormFieldWrapper } from "@/components/layouts/shared/components/form_field_wrapper";
import { FormHeader } from "@/components/layouts/shared/components/form_header";
import { FormActionButtons } from "@/components/layouts/shared/components/form_action_buttons";
import { TwoColumnAuthLayout } from "@/components/layouts/shared/components/two_column_auth_layout";
import {
  type ButtonPaletteOverrides,
  type LayoutFieldMapOverrides,
  type LayoutLabelOverrides,
} from "@/components/layouts/shared/config/layout_customization";
import {
  EMAIL_VERIFICATION_FIELD_IDS,
  createEmailVerificationFieldDefinitions,
  resolveEmailVerificationButtonPalette,
  resolveEmailVerificationLabels,
  EMAIL_VERIFICATION_SUCCESS_LABEL_DEFAULTS,
  EMAIL_VERIFICATION_ERROR_LABEL_DEFAULTS,
  type EmailVerificationSuccessLabels,
  type EmailVerificationErrorLabels,
} from "@/components/layouts/email_verification/config/email_verification_field_config";
import {
  use_email_verification,
  type UseEmailVerificationResult,
} from "@/components/layouts/email_verification/hooks/use_email_verification";
import { type LayoutDataClient } from "@/components/layouts/shared/data/layout_data_client";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { AlreadyLoggedInGuard } from "@/components/layouts/shared/components/already_logged_in_guard";

// section: types
export type EmailVerificationLayoutProps<TClient = unknown> = {
  image_src: string;
  image_alt: string;
  image_background_color?: string;
  field_overrides?: LayoutFieldMapOverrides;
  labels?: LayoutLabelOverrides;
  button_colors?: ButtonPaletteOverrides;
  success_labels?: Partial<EmailVerificationSuccessLabels>;
  error_labels?: Partial<EmailVerificationErrorLabels>;
  redirect_delay?: number;
  login_path?: string;
  already_logged_in_message?: string;
  showLogoutButton?: boolean;
  showReturnHomeButton?: boolean;
  returnHomeButtonLabel?: string;
  returnHomePath?: string;
  data_client: LayoutDataClient<TClient>;
};

const ORDERED_FIELDS: EmailVerificationFieldId[] = [
  EMAIL_VERIFICATION_FIELD_IDS.EMAIL,
];

type EmailVerificationFieldId = (typeof EMAIL_VERIFICATION_FIELD_IDS)[keyof typeof EMAIL_VERIFICATION_FIELD_IDS];

// section: component
export default function email_verification_layout<TClient>({
  image_src,
  image_alt,
  image_background_color = "#f1f5f9",
  field_overrides,
  labels,
  button_colors,
  success_labels,
  error_labels,
  redirect_delay = 5,
  login_path = "/login",
  data_client,
  already_logged_in_message,
  showLogoutButton = true,
  showReturnHomeButton = false,
  returnHomeButtonLabel = "Return home",
  returnHomePath = "/",
}: EmailVerificationLayoutProps<TClient>) {
  const fieldDefinitions = createEmailVerificationFieldDefinitions(field_overrides);
  const resolvedLabels = resolveEmailVerificationLabels(labels);
  const resolvedButtonPalette = resolveEmailVerificationButtonPalette(button_colors);
  const resolvedSuccessLabels = {
    ...EMAIL_VERIFICATION_SUCCESS_LABEL_DEFAULTS,
    ...(success_labels ?? {}),
  };
  const resolvedErrorLabels = {
    ...EMAIL_VERIFICATION_ERROR_LABEL_DEFAULTS,
    ...(error_labels ?? {}),
  };

  const verification = use_email_verification({
    dataClient: data_client,
    redirectDelay: redirect_delay,
    loginPath: login_path,
  });

  const renderFields = (formState: UseEmailVerificationResult) => {
    return ORDERED_FIELDS.map((fieldId) => {
      const fieldDefinition = fieldDefinitions[fieldId];
      const fieldValue = formState.values[fieldId];
      const fieldError = formState.errors[fieldId];

      const inputElement = (
        <Input
          id={fieldDefinition.id}
          type={fieldDefinition.type}
          value={fieldValue}
          onChange={(event) =>
            formState.handleFieldChange(fieldId, event.target.value)
          }
          onBlur={
            fieldId === EMAIL_VERIFICATION_FIELD_IDS.EMAIL
              ? formState.handleEmailBlur
              : undefined
          }
          autoComplete={fieldDefinition.autoComplete}
          placeholder={fieldDefinition.placeholder}
          aria-label={fieldDefinition.ariaLabel}
          className="cls_email_verification_layout_field_input"
        />
      );

      // Only show email error if field has been touched (blurred)
      const shouldShowError =
        fieldId === EMAIL_VERIFICATION_FIELD_IDS.EMAIL
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

  // Verifying state
  if (verification.isVerifying) {
    return (
      <AlreadyLoggedInGuard
        image_src={image_src}
        image_alt={image_alt}
        image_background_color={image_background_color}
        message={already_logged_in_message}
        showLogoutButton={showLogoutButton}
        showReturnHomeButton={showReturnHomeButton}
        returnHomeButtonLabel={returnHomeButtonLabel}
        returnHomePath={returnHomePath}
        requireEmailVerified={false}
      >
        <TwoColumnAuthLayout
        imageSrc={image_src}
        imageAlt={image_alt}
        imageBackgroundColor={image_background_color}
        formContent={
          <div className="cls_email_verification_verifying flex flex-col items-center justify-center gap-4 py-8">
            <Loader2 className="h-12 w-12 animate-spin text-slate-600" aria-hidden="true" />
            <div className="cls_email_verification_verifying_text text-center">
              <h1 className="cls_email_verification_verifying_heading text-2xl font-semibold text-slate-900">
                {resolvedLabels.heading}
              </h1>
              <p className="cls_email_verification_verifying_subheading mt-2 text-sm text-slate-600">
                {resolvedLabels.subHeading}
              </p>
            </div>
          </div>
        }
      />
      </AlreadyLoggedInGuard>
    );
  }

  // Success state
  if (verification.isVerified) {
    return (
      <AlreadyLoggedInGuard
        image_src={image_src}
        image_alt={image_alt}
        image_background_color={image_background_color}
        message={already_logged_in_message}
        showLogoutButton={showLogoutButton}
        showReturnHomeButton={showReturnHomeButton}
        returnHomeButtonLabel={returnHomeButtonLabel}
        returnHomePath={returnHomePath}
        requireEmailVerified={false}
      >
        <TwoColumnAuthLayout
        imageSrc={image_src}
        imageAlt={image_alt}
        imageBackgroundColor={image_background_color}
        formContent={
          <div className="cls_email_verification_success flex flex-col gap-6">
            <div className="cls_email_verification_success_content flex flex-col items-center gap-4 text-center">
              <CheckCircle className="h-16 w-16 text-green-600" aria-hidden="true" />
              <div className="cls_email_verification_success_text">
                <h1 className="cls_email_verification_success_heading text-2xl font-semibold text-slate-900">
                  {resolvedSuccessLabels.heading}
                </h1>
                <p className="cls_email_verification_success_message mt-2 text-sm text-slate-600">
                  {resolvedSuccessLabels.message}
                </p>
              </div>
              <div className="cls_email_verification_redirect_info mt-2 text-sm text-slate-500">
                {resolvedSuccessLabels.redirectMessage} {verification.redirectCountdown} seconds...
              </div>
            </div>
            <div className="cls_email_verification_success_actions flex justify-center">
              <Button
                type="button"
                onClick={verification.handleGoToLogin}
                className="cls_email_verification_go_to_login_button"
                style={{
                  backgroundColor: resolvedButtonPalette.submitBackground,
                  color: resolvedButtonPalette.submitText,
                }}
              >
                {resolvedSuccessLabels.goToLoginButton}
              </Button>
            </div>
          </div>
        }
      />
      </AlreadyLoggedInGuard>
    );
  }

  // Error state with resend form
  return (
    <AlreadyLoggedInGuard
      image_src={image_src}
      image_alt={image_alt}
      image_background_color={image_background_color}
      message={already_logged_in_message}
      showLogoutButton={showLogoutButton}
      showReturnHomeButton={showReturnHomeButton}
      returnHomeButtonLabel={returnHomeButtonLabel}
      returnHomePath={returnHomePath}
      requireEmailVerified={false}
    >
      <TwoColumnAuthLayout
      imageSrc={image_src}
      imageAlt={image_alt}
      imageBackgroundColor={image_background_color}
      formContent={
        <>
          <div className="cls_email_verification_error_header flex flex-col items-center gap-4 text-center">
            <XCircle className="h-12 w-12 text-red-600" aria-hidden="true" />
            <div className="cls_email_verification_error_text">
              <h1 className="cls_email_verification_error_heading text-2xl font-semibold text-slate-900">
                {resolvedErrorLabels.heading}
              </h1>
              <p className="cls_email_verification_error_message mt-2 text-sm text-slate-600">
                {verification.errorMessage || resolvedErrorLabels.message}
              </p>
            </div>
          </div>
          <div className="cls_email_verification_resend_form">
            <FormHeader
              heading={resolvedErrorLabels.resendFormHeading}
              subHeading="Enter your email address to receive a new verification link."
            />
            <form
              className="cls_email_verification_layout_form_fields flex flex-col gap-5"
              onSubmit={verification.handleResendSubmit}
              aria-label="Resend verification email form"
            >
              {renderFields(verification)}
              <FormActionButtons
                submitLabel={resolvedLabels.submitButton}
                cancelLabel={resolvedLabels.cancelButton}
                buttonPalette={resolvedButtonPalette}
                isSubmitDisabled={verification.isSubmitDisabled}
                onCancel={verification.handleCancel}
                submitAriaLabel="Submit resend verification email form"
                cancelAriaLabel="Cancel resend verification email form"
              />
              {verification.isSubmitting && (
                <div className="cls_email_verification_submitting_indicator text-sm text-slate-600 text-center">
                  Sending verification email...
                </div>
              )}
            </form>
          </div>
        </>
      }
    />
    </AlreadyLoggedInGuard>
  );
}


// file_description: forgot password layout component built atop shared layout utilities
// section: client_directive
"use client";

// section: imports
import { Input } from "../../ui/input";
import { FormFieldWrapper } from "../shared/components/form_field_wrapper";
import { FormHeader } from "../shared/components/form_header";
import { FormActionButtons } from "../shared/components/form_action_buttons";
import { TwoColumnAuthLayout } from "../shared/components/two_column_auth_layout";
import { AlreadyLoggedInGuard } from "../shared/components/already_logged_in_guard";
import {
  type ButtonPaletteOverrides,
  type LayoutFieldMapOverrides,
  type LayoutLabelOverrides,
} from "../shared/config/layout_customization";
import {
  FORGOT_PASSWORD_FIELD_IDS,
  createForgotPasswordFieldDefinitions,
  resolveForgotPasswordButtonPalette,
  resolveForgotPasswordLabels,
} from "./config/forgot_password_field_config";
import {
  use_forgot_password_form,
  type UseForgotPasswordFormResult,
} from "./hooks/use_forgot_password_form";
import { type LayoutDataClient } from "../shared/data/layout_data_client";

// section: types
export type ForgotPasswordLayoutProps<TClient = unknown> = {
  image_src: string;
  image_alt: string;
  image_background_color?: string;
  field_overrides?: LayoutFieldMapOverrides;
  labels?: LayoutLabelOverrides;
  button_colors?: ButtonPaletteOverrides;
  data_client: LayoutDataClient<TClient>;
  alreadyLoggedInMessage?: string;
  showLogoutButton?: boolean;
  showReturnHomeButton?: boolean;
  returnHomeButtonLabel?: string;
  returnHomePath?: string;
};

const ORDERED_FIELDS: ForgotPasswordFieldId[] = [
  FORGOT_PASSWORD_FIELD_IDS.EMAIL,
];

type ForgotPasswordFieldId = (typeof FORGOT_PASSWORD_FIELD_IDS)[keyof typeof FORGOT_PASSWORD_FIELD_IDS];

// section: component
export default function forgot_password_layout<TClient>({
  image_src,
  image_alt,
  image_background_color = "#f1f5f9",
  field_overrides,
  labels,
  button_colors,
  data_client,
  alreadyLoggedInMessage = "You are already logged in",
  showLogoutButton = true,
  showReturnHomeButton = false,
  returnHomeButtonLabel = "Return home",
  returnHomePath = "/",
}: ForgotPasswordLayoutProps<TClient>) {
  const fieldDefinitions = createForgotPasswordFieldDefinitions(field_overrides);
  const resolvedLabels = resolveForgotPasswordLabels(labels);
  const resolvedButtonPalette = resolveForgotPasswordButtonPalette(button_colors);

  const form = use_forgot_password_form({
    dataClient: data_client,
  });

  const renderFields = (formState: UseForgotPasswordFormResult) => {
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
            fieldId === FORGOT_PASSWORD_FIELD_IDS.EMAIL
              ? formState.handleEmailBlur
              : undefined
          }
          autoComplete={fieldDefinition.autoComplete}
          placeholder={fieldDefinition.placeholder}
          aria-label={fieldDefinition.ariaLabel}
          className="cls_forgot_password_layout_field_input"
        />
      );

      // Only show email error if field has been touched (blurred)
      const shouldShowError =
        fieldId === FORGOT_PASSWORD_FIELD_IDS.EMAIL
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
              className="cls_forgot_password_layout_form_fields flex flex-col gap-5"
              onSubmit={form.handleSubmit}
              aria-label="Forgot password form"
            >
              {renderFields(form)}
              <FormActionButtons
                submitLabel={resolvedLabels.submitButton}
                cancelLabel={resolvedLabels.cancelButton}
                buttonPalette={resolvedButtonPalette}
                isSubmitDisabled={form.isSubmitDisabled}
                onCancel={form.handleCancel}
                submitAriaLabel="Submit forgot password form"
                cancelAriaLabel="Cancel forgot password form"
              />
              {form.isSubmitting && (
                <div className="cls_forgot_password_submitting_indicator text-sm text-slate-600 text-center">
                  Sending reset link...
                </div>
              )}
            </form>
          </>
        }
      />
    </AlreadyLoggedInGuard>
  );
}


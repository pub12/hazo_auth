// file_description: login layout component built atop shared layout utilities
// section: client_directive
"use client";

// section: imports
import { Input } from "@/components/ui/input";
import { PasswordField } from "@/components/layouts/shared/components/password_field";
import { FormFieldWrapper } from "@/components/layouts/shared/components/form_field_wrapper";
import { FormHeader } from "@/components/layouts/shared/components/form_header";
import { FormActionButtons } from "@/components/layouts/shared/components/form_action_buttons";
import { TwoColumnAuthLayout } from "@/components/layouts/shared/components/two_column_auth_layout";
import { CheckCircle } from "lucide-react";
import { AlreadyLoggedInGuard } from "@/components/layouts/shared/components/already_logged_in_guard";
import {
  type ButtonPaletteOverrides,
  type LayoutFieldMapOverrides,
  type LayoutLabelOverrides,
} from "@/components/layouts/shared/config/layout_customization";
import {
  LOGIN_FIELD_IDS,
  createLoginFieldDefinitions,
  resolveLoginButtonPalette,
  resolveLoginLabels,
} from "@/components/layouts/login/config/login_field_config";
import {
  use_login_form,
  type UseLoginFormResult,
} from "@/components/layouts/login/hooks/use_login_form";
import { type LayoutDataClient } from "@/components/layouts/shared/data/layout_data_client";

// section: types
export type LoginLayoutProps<TClient = unknown> = {
  image_src: string;
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
}: LoginLayoutProps<TClient>) {
  const fieldDefinitions = createLoginFieldDefinitions(field_overrides);
  const resolvedLabels = resolveLoginLabels(labels);
  const resolvedButtonPalette = resolveLoginButtonPalette(button_colors);

  const form = use_login_form({
    dataClient: data_client,
    logger,
    redirectRoute,
    successMessage,
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
            </form>
          </>
        }
      />
    </AlreadyLoggedInGuard>
  );
}


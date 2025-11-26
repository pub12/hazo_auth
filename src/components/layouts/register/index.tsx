// file_description: register layout component built atop shared layout utilities
// section: client_directive
"use client";

// section: imports
import Link from "next/link";
import { Input } from "hazo_auth/components/ui/input";
import { PasswordField } from "hazo_auth/components/layouts/shared/components/password_field";
import { FormFieldWrapper } from "hazo_auth/components/layouts/shared/components/form_field_wrapper";
import { FormHeader } from "hazo_auth/components/layouts/shared/components/form_header";
import { FormActionButtons } from "hazo_auth/components/layouts/shared/components/form_action_buttons";
import { TwoColumnAuthLayout } from "hazo_auth/components/layouts/shared/components/two_column_auth_layout";
import { AlreadyLoggedInGuard } from "hazo_auth/components/layouts/shared/components/already_logged_in_guard";
import {
  type ButtonPaletteOverrides,
  type LayoutFieldMapOverrides,
  type LayoutLabelOverrides,
  type PasswordRequirementOverrides,
} from "hazo_auth/components/layouts/shared/config/layout_customization";
import {
  REGISTER_FIELD_IDS,
  createRegisterFieldDefinitions,
  resolveRegisterButtonPalette,
  resolveRegisterLabels,
  resolveRegisterPasswordRequirements,
} from "hazo_auth/components/layouts/register/config/register_field_config";
import {
  use_register_form,
  type UseRegisterFormResult,
} from "hazo_auth/components/layouts/register/hooks/use_register_form";
import { type LayoutDataClient } from "hazo_auth/components/layouts/shared/data/layout_data_client";

// section: types
export type RegisterLayoutProps<TClient = unknown> = {
  image_src: string;
  image_alt: string;
  image_background_color?: string;
  field_overrides?: LayoutFieldMapOverrides;
  labels?: LayoutLabelOverrides;
  button_colors?: ButtonPaletteOverrides;
  password_requirements?: PasswordRequirementOverrides;
  show_name_field?: boolean;
  data_client: LayoutDataClient<TClient>;
  alreadyLoggedInMessage?: string;
  showLogoutButton?: boolean;
  showReturnHomeButton?: boolean;
  returnHomeButtonLabel?: string;
  returnHomePath?: string;
  signInPath?: string;
  signInLabel?: string;
  urlOnLogon?: string;
};

const ORDERED_FIELDS: RegisterFieldId[] = [
  REGISTER_FIELD_IDS.NAME,
  REGISTER_FIELD_IDS.EMAIL,
  REGISTER_FIELD_IDS.PASSWORD,
  REGISTER_FIELD_IDS.CONFIRM_PASSWORD,
];

type RegisterFieldId = (typeof REGISTER_FIELD_IDS)[keyof typeof REGISTER_FIELD_IDS];

// section: component
export default function register_layout<TClient>({
  image_src,
  image_alt,
  image_background_color = "#f1f5f9",
  field_overrides,
  labels,
  button_colors,
  password_requirements,
  show_name_field = true,
  data_client,
  alreadyLoggedInMessage = "You are already logged in",
  showLogoutButton = true,
  showReturnHomeButton = false,
  returnHomeButtonLabel = "Return home",
  returnHomePath = "/",
  signInPath = "/hazo_auth/login",
  signInLabel = "Sign in",
  urlOnLogon,
}: RegisterLayoutProps<TClient>) {
  const fieldDefinitions = createRegisterFieldDefinitions(field_overrides);
  const resolvedLabels = resolveRegisterLabels(labels);
  const resolvedButtonPalette = resolveRegisterButtonPalette(button_colors);
  const resolvedPasswordRequirements = resolveRegisterPasswordRequirements(
    password_requirements,
  );

  const form = use_register_form({
    showNameField: show_name_field,
    passwordRequirements: resolvedPasswordRequirements,
    dataClient: data_client,
    urlOnLogon: urlOnLogon,
  });

  const renderFields = (formState: UseRegisterFormResult) => {
    const renderOrder = ORDERED_FIELDS.filter(
      (fieldId) => show_name_field || fieldId !== REGISTER_FIELD_IDS.NAME,
    );

    return renderOrder.map((fieldId) => {
      const fieldDefinition = fieldDefinitions[fieldId];
      const fieldValue = formState.values[fieldId];
      const fieldError = formState.errors[fieldId];

      const isPasswordField =
        fieldDefinition.type === "password" &&
        (fieldId === REGISTER_FIELD_IDS.PASSWORD ||
          fieldId === REGISTER_FIELD_IDS.CONFIRM_PASSWORD);

      const inputElement = isPasswordField ? (
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
      ) : (
        <Input
          id={fieldDefinition.id}
          type={fieldDefinition.type}
          value={fieldValue}
          onChange={(event) =>
            formState.handleFieldChange(fieldId, event.target.value)
          }
          onBlur={
            fieldId === REGISTER_FIELD_IDS.EMAIL
              ? formState.handleEmailBlur
              : undefined
          }
          autoComplete={fieldDefinition.autoComplete}
          placeholder={fieldDefinition.placeholder}
          aria-label={fieldDefinition.ariaLabel}
          className="cls_register_layout_field_input"
        />
      );

      // Only show email error if field has been touched (blurred)
      const shouldShowError =
        isPasswordField
          ? undefined
          : fieldId === REGISTER_FIELD_IDS.EMAIL
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
              className="cls_register_layout_form_fields flex flex-col gap-5"
              onSubmit={form.handleSubmit}
              aria-label="Registration form"
            >
              {renderFields(form)}
              <FormActionButtons
                submitLabel={resolvedLabels.submitButton}
                cancelLabel={resolvedLabels.cancelButton}
                buttonPalette={resolvedButtonPalette}
                isSubmitDisabled={form.isSubmitDisabled}
                onCancel={form.handleCancel}
                submitAriaLabel="Submit registration form"
                cancelAriaLabel="Cancel registration form"
              />
              <div className="cls_register_layout_sign_in_link flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <span>Already have an account?</span>
                <Link
                  href={signInPath}
                  className="cls_register_layout_sign_in_link_text text-primary underline-offset-4 hover:underline"
                  aria-label="Go to sign in page"
                >
                  {signInLabel}
                </Link>
              </div>
              {form.isSubmitting && (
                <div className="cls_register_submitting_indicator text-sm text-slate-600 text-center">
                  Registering...
                </div>
              )}
            </form>
          </>
        }
      />
    </AlreadyLoggedInGuard>
  );
}


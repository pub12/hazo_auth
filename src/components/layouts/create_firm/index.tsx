// file_description: create firm layout component for new user onboarding
// section: client_directive
"use client";

// section: imports
import type { StaticImageData } from "next/image";
import { Input } from "../../ui/input";
import { FormFieldWrapper } from "../shared/components/form_field_wrapper";
import { FormHeader } from "../shared/components/form_header";
import { FormActionButtons } from "../shared/components/form_action_buttons";
import { TwoColumnAuthLayout } from "../shared/components/two_column_auth_layout";
import { CheckCircle, Building2 } from "lucide-react";
import {
  type ButtonPaletteOverrides,
} from "../shared/config/layout_customization";
import {
  use_create_firm_form,
  type UseCreateFirmFormResult,
} from "./hooks/use_create_firm_form";
import { useHazoAuthConfig } from "../../../contexts/hazo_auth_provider";

// section: types
export type CreateFirmLayoutProps = {
  /** Image source for the left panel */
  image_src: string | StaticImageData;
  /** Alt text for the image */
  image_alt?: string;
  /** Background color for the image panel */
  image_background_color?: string;
  /** Page heading */
  heading?: string;
  /** Page sub-heading */
  sub_heading?: string;
  /** Label for firm name field */
  firm_name_label?: string;
  /** Placeholder for firm name field */
  firm_name_placeholder?: string;
  /** Label for org structure field */
  org_structure_label?: string;
  /** Placeholder for org structure field */
  org_structure_placeholder?: string;
  /** Default value for org structure */
  default_org_structure?: string;
  /** Label for submit button */
  submit_button_label?: string;
  /** Success message shown after firm creation */
  success_message?: string;
  /** Route to redirect after success */
  redirect_route?: string;
  /** API base path for hazo_auth endpoints */
  apiBasePath?: string;
  /** Callback when firm is successfully created */
  onSuccess?: (scope_id: string) => void;
  /** Button color overrides */
  button_colors?: ButtonPaletteOverrides;
  /** Logger for debugging */
  logger?: {
    info: (message: string, data?: Record<string, unknown>) => void;
    error: (message: string, data?: Record<string, unknown>) => void;
  };
};

// section: component
export default function CreateFirmLayout({
  image_src,
  image_alt = "Create your firm",
  image_background_color = "#f1f5f9",
  heading = "Create Your Firm",
  sub_heading = "Set up your organisation to get started",
  firm_name_label = "Firm Name",
  firm_name_placeholder = "Enter your firm name",
  org_structure_label = "Organisation Structure",
  org_structure_placeholder = "e.g., Headquarters, Head Office",
  default_org_structure = "Headquarters",
  submit_button_label = "Create Firm",
  success_message = "Your firm has been created successfully!",
  redirect_route = "/",
  apiBasePath,
  onSuccess,
  button_colors,
  logger,
}: CreateFirmLayoutProps) {
  const { apiBasePath: contextApiBasePath } = useHazoAuthConfig();
  const resolvedApiBasePath = apiBasePath || contextApiBasePath;

  const form = use_create_firm_form({
    default_org_structure,
    onSuccess,
    redirectRoute: redirect_route,
    apiBasePath: resolvedApiBasePath,
    logger,
  });

  const resolvedButtonPalette = {
    submitBackground: button_colors?.submitBackground || "bg-primary",
    submitText: button_colors?.submitText || "text-primary-foreground",
    cancelBorder: button_colors?.cancelBorder || "border-gray-300",
    cancelText: button_colors?.cancelText || "text-gray-700",
  };

  const renderFields = (formState: UseCreateFirmFormResult) => {
    return (
      <>
        <FormFieldWrapper
          fieldId="firm_name"
          label={firm_name_label}
          input={
            <Input
              id="firm_name"
              type="text"
              value={formState.values.firm_name}
              onChange={(e) =>
                formState.handleFieldChange("firm_name", e.target.value)
              }
              placeholder={firm_name_placeholder}
              aria-label={firm_name_label}
              className="cls_create_firm_layout_field_input"
              autoComplete="organization"
            />
          }
          errorMessage={formState.errors.firm_name}
        />
        <FormFieldWrapper
          fieldId="org_structure"
          label={org_structure_label}
          input={
            <Input
              id="org_structure"
              type="text"
              value={formState.values.org_structure}
              onChange={(e) =>
                formState.handleFieldChange("org_structure", e.target.value)
              }
              placeholder={org_structure_placeholder}
              aria-label={org_structure_label}
              className="cls_create_firm_layout_field_input"
            />
          }
          errorMessage={formState.errors.org_structure}
        />
      </>
    );
  };

  // Show success message after firm creation
  if (form.isSuccess) {
    return (
      <TwoColumnAuthLayout
        imageSrc={image_src}
        imageAlt={image_alt}
        imageBackgroundColor={image_background_color}
        formContent={
          <>
            <FormHeader heading={heading} subHeading={sub_heading} />
            <div className="cls_create_firm_layout_success flex flex-col items-center justify-center gap-4 p-8 text-center">
              <CheckCircle
                className="cls_create_firm_layout_success_icon h-16 w-16 text-green-600"
                aria-hidden="true"
              />
              <p className="cls_create_firm_layout_success_message text-lg font-medium text-slate-900">
                {success_message}
              </p>
              <p className="cls_create_firm_layout_redirect_message text-sm text-muted-foreground">
                Redirecting you to the application...
              </p>
            </div>
          </>
        }
      />
    );
  }

  return (
    <TwoColumnAuthLayout
      imageSrc={image_src}
      imageAlt={image_alt}
      imageBackgroundColor={image_background_color}
      formContent={
        <>
          <FormHeader heading={heading} subHeading={sub_heading} />

          {/* Info banner */}
          <div className="cls_create_firm_layout_info mb-6 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <Building2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Welcome!</p>
              <p>
                Create your firm to start using the application. You&apos;ll
                become the administrator of your firm and can invite team
                members later.
              </p>
            </div>
          </div>

          <form
            className="cls_create_firm_layout_form_fields flex flex-col gap-5"
            onSubmit={form.handleSubmit}
            aria-label="Create firm form"
          >
            {renderFields(form)}

            {/* Form-level error */}
            {form.errors.form && (
              <div className="cls_create_firm_layout_form_error rounded-md bg-red-50 p-3 text-sm text-red-600">
                {form.errors.form}
              </div>
            )}

            <FormActionButtons
              submitLabel={submit_button_label}
              buttonPalette={resolvedButtonPalette}
              isSubmitDisabled={form.isSubmitDisabled}
              submitAriaLabel="Create your firm"
              hideCancel={true}
            />
          </form>
        </>
      }
    />
  );
}

// section: exports
export { CreateFirmLayout };

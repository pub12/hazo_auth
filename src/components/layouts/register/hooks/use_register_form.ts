// file_description: encapsulate register form state, validation, and data interactions
// section: imports
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import type { LayoutDataClient } from "../../shared/data/layout_data_client";
import type { PasswordRequirementOptions, PasswordRequirementOverrides } from "../../shared/config/layout_customization";
import { REGISTER_FIELD_IDS, type RegisterFieldId } from "../config/register_field_config";
import { validateEmail, validatePassword } from "../../shared/utils/validation";

// section: constants
const PASSWORD_FIELDS: Array<RegisterFieldId> = [
  REGISTER_FIELD_IDS.PASSWORD,
  REGISTER_FIELD_IDS.CONFIRM_PASSWORD,
];

// section: types
export type RegisterFormValues = Record<RegisterFieldId, string>;
export type RegisterFormErrors = Partial<Record<RegisterFieldId, string | string[]>> & {
  submit?: string;
};
export type PasswordVisibilityState = Record<
  Extract<RegisterFieldId, "password" | "confirm_password">,
  boolean
>;

export type UseRegisterFormParams<TClient = unknown> = {
  showNameField: boolean;
  passwordRequirements: PasswordRequirementOptions;
  passwordRequirementOverrides?: PasswordRequirementOverrides;
  dataClient: LayoutDataClient<TClient>;
  urlOnLogon?: string;
};

export type UseRegisterFormResult = {
  values: RegisterFormValues;
  errors: RegisterFormErrors;
  passwordVisibility: PasswordVisibilityState;
  isSubmitDisabled: boolean;
  isSubmitting: boolean;
  emailTouched: boolean;
  handleFieldChange: (fieldId: RegisterFieldId, value: string) => void;
  handleEmailBlur: () => void;
  togglePasswordVisibility: (fieldId: "password" | "confirm_password") => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  handleCancel: () => void;
};

// section: helpers
const buildInitialValues = (): RegisterFormValues => ({
  [REGISTER_FIELD_IDS.NAME]: "",
  [REGISTER_FIELD_IDS.EMAIL]: "",
  [REGISTER_FIELD_IDS.PASSWORD]: "",
  [REGISTER_FIELD_IDS.CONFIRM_PASSWORD]: "",
});


// section: hook
export const use_register_form = <TClient,>({
  showNameField,
  passwordRequirements,
  dataClient,
  urlOnLogon,
}: UseRegisterFormParams<TClient>): UseRegisterFormResult => {
  const initialValues = useMemo(() => buildInitialValues(), []);
  const [values, setValues] = useState<RegisterFormValues>(initialValues);
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [passwordVisibility, setPasswordVisibility] = useState<PasswordVisibilityState>({
    password: false,
    confirm_password: false,
  });
  const [emailTouched, setEmailTouched] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Check if form has been edited (changed from initial state)
  const isFormEdited = useMemo(() => {
    return Object.entries(values).some(([fieldId, fieldValue]) => {
      if (fieldId === REGISTER_FIELD_IDS.NAME && !showNameField) {
        return false;
      }
      return fieldValue.trim() !== initialValues[fieldId as RegisterFieldId].trim();
    });
  }, [values, initialValues, showNameField]);

  const isSubmitDisabled = useMemo(() => {
    // Disable if submitting
    if (isSubmitting) {
      return true;
    }

    // Disable if form hasn't been edited
    if (!isFormEdited) {
      return true;
    }

    // Disable if there are validation errors (excluding submit errors)
    const validationErrors = { ...errors };
    delete validationErrors.submit;
    const hasErrors = Object.keys(validationErrors).length > 0;
    if (hasErrors) {
      return true;
    }

    // Disable if required fields are empty
    const hasEmptyField = Object.entries(values).some(([fieldId, fieldValue]) => {
      if (fieldId === REGISTER_FIELD_IDS.NAME && !showNameField) {
        return false;
      }
      return fieldValue.trim() === "";
    });
    if (hasEmptyField) {
      return true;
    }

    // Enable if form is edited, has no errors, and all required fields are filled
    return false;
  }, [errors, showNameField, values, isSubmitting, isFormEdited]);

  const togglePasswordVisibility = useCallback((fieldId: "password" | "confirm_password") => {
    setPasswordVisibility((previous) => ({
      ...previous,
      [fieldId]: !previous[fieldId],
    }));
  }, []);

  const handleFieldChange = useCallback(
    (fieldId: RegisterFieldId, value: string) => {
      setValues((previousValues) => {
        const nextValues: RegisterFormValues = {
          ...previousValues,
          [fieldId]: value,
        };

        setErrors((previousErrors) => {
          const updatedErrors: RegisterFormErrors = { ...previousErrors };

          // Only validate email on change if it has been touched (blurred)
          if (fieldId === REGISTER_FIELD_IDS.EMAIL && emailTouched) {
            const emailError = validateEmail(value);
            if (emailError) {
              updatedErrors[REGISTER_FIELD_IDS.EMAIL] = emailError;
            } else {
              delete updatedErrors[REGISTER_FIELD_IDS.EMAIL];
            }
          }

          if (PASSWORD_FIELDS.includes(fieldId)) {
            const passwordError = validatePassword(
              nextValues[REGISTER_FIELD_IDS.PASSWORD],
              passwordRequirements,
            );

            if (passwordError) {
              updatedErrors[REGISTER_FIELD_IDS.PASSWORD] = passwordError;
            } else {
              delete updatedErrors[REGISTER_FIELD_IDS.PASSWORD];
            }

            if (
              nextValues[REGISTER_FIELD_IDS.CONFIRM_PASSWORD].trim().length > 0 &&
              nextValues[REGISTER_FIELD_IDS.PASSWORD] !==
                nextValues[REGISTER_FIELD_IDS.CONFIRM_PASSWORD]
            ) {
              updatedErrors[REGISTER_FIELD_IDS.CONFIRM_PASSWORD] = "passwords do not match";
            } else {
              delete updatedErrors[REGISTER_FIELD_IDS.CONFIRM_PASSWORD];
            }
          }

          return updatedErrors;
        });

        return nextValues;
      });
    },
    [passwordRequirements, emailTouched],
  );

  const handleEmailBlur = useCallback(() => {
    setEmailTouched(true);
    // Validate email on blur
    setErrors((previousErrors) => {
      const updatedErrors: RegisterFormErrors = { ...previousErrors };
      const emailValue = values[REGISTER_FIELD_IDS.EMAIL];
      const emailError = validateEmail(emailValue);
      if (emailError) {
        updatedErrors[REGISTER_FIELD_IDS.EMAIL] = emailError;
      } else {
        delete updatedErrors[REGISTER_FIELD_IDS.EMAIL];
      }
      return updatedErrors;
    });
  }, [values]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      // Final validation
      const emailError = validateEmail(values[REGISTER_FIELD_IDS.EMAIL]);
      const passwordError = validatePassword(
        values[REGISTER_FIELD_IDS.PASSWORD],
        passwordRequirements,
      );

      if (emailError || passwordError) {
        setErrors({
          ...(emailError ? { [REGISTER_FIELD_IDS.EMAIL]: emailError } : {}),
          ...(passwordError ? { [REGISTER_FIELD_IDS.PASSWORD]: passwordError } : {}),
        });
        return;
      }

      // Check password match
      if (
        values[REGISTER_FIELD_IDS.PASSWORD] !==
        values[REGISTER_FIELD_IDS.CONFIRM_PASSWORD]
      ) {
        setErrors({
          [REGISTER_FIELD_IDS.CONFIRM_PASSWORD]: "passwords do not match",
        });
        return;
      }

      setIsSubmitting(true);
      setErrors({});

      try {
        const response = await fetch("/api/hazo_auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: values[REGISTER_FIELD_IDS.NAME] || undefined,
            email: values[REGISTER_FIELD_IDS.EMAIL],
            password: values[REGISTER_FIELD_IDS.PASSWORD],
            url_on_logon: urlOnLogon,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Registration failed");
        }

        // Show success notification
        toast.success("Registration successful!", {
          description: "Your account has been created successfully.",
        });

        // Reset form on success
        const resetValues = buildInitialValues();
        setValues(resetValues);
        setErrors({});
        setPasswordVisibility({
          password: false,
          confirm_password: false,
        });
        setEmailTouched(false);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Registration failed. Please try again.";

        // Show error notification
        toast.error("Registration failed", {
          description: errorMessage,
        });

        // Set error state
        setErrors({
          submit: errorMessage,
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, passwordRequirements, dataClient, urlOnLogon],
  );

  const handleCancel = useCallback(() => {
    const resetValues = buildInitialValues();
    setValues(resetValues);
    setErrors({});
    setPasswordVisibility({
      password: false,
      confirm_password: false,
    });
    setEmailTouched(false);
  }, []);

  return {
    values,
    errors,
    passwordVisibility,
    isSubmitDisabled,
    isSubmitting,
    emailTouched,
    handleFieldChange,
    handleEmailBlur,
    togglePasswordVisibility,
    handleSubmit,
    handleCancel,
  };
};


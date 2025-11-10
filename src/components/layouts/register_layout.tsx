// file_description: render the register layout component with a visual panel and editable form column
// section: client_directive
"use client";

// section: imports
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { CircleCheckBig, CircleX, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// section: types
type editable_field_key =
  | "name"
  | "email_address"
  | "password"
  | "confirm_password";

type field_config = {
  id: editable_field_key;
  default_label: string;
  type: string;
  auto_complete: string;
  default_placeholder: string;
  default_aria_label: string;
};

type field_state = Record<editable_field_key, string>;

type register_layout_labels = {
  heading?: string;
  sub_heading?: string;
  name_label?: string;
  name_placeholder?: string;
  email_label?: string;
  email_placeholder?: string;
  password_label?: string;
  password_placeholder?: string;
  confirm_password_label?: string;
  confirm_password_placeholder?: string;
  register_button?: string;
  cancel_button?: string;
};

type password_requirement_options = {
  minimum_length?: number;
  require_uppercase?: boolean;
  require_lowercase?: boolean;
  require_number?: boolean;
  require_special?: boolean;
};

type button_color_options = {
  register_background?: string;
  register_text?: string;
  cancel_border?: string;
  cancel_text?: string;
};

type register_layout_props = {
  image_src: string;
  image_alt: string;
  image_background_color?: string;
  labels?: register_layout_labels;
  show_name_field?: boolean;
  password_requirements?: password_requirement_options;
  button_colors?: button_color_options;
};

// section: constants
const register_field_definitions: field_config[] = [
  {
    id: "name",
    default_label: "Full name",
    type: "text",
    auto_complete: "name",
    default_placeholder: "Enter your full name",
    default_aria_label: "Full name input field",
  },
  {
    id: "email_address",
    default_label: "Email address",
    type: "email",
    auto_complete: "email",
    default_placeholder: "Enter your email address",
    default_aria_label: "Email address input field",
  },
  {
    id: "password",
    default_label: "Password",
    type: "password",
    auto_complete: "new-password",
    default_placeholder: "Enter your password",
    default_aria_label: "Password input field",
  },
  {
    id: "confirm_password",
    default_label: "Re-enter password",
    type: "password",
    auto_complete: "new-password",
    default_placeholder: "Re-enter your password",
    default_aria_label: "Password confirmation input field",
  },
];

// section: field_lookup
const register_field_lookup: Record<editable_field_key, field_config> =
  register_field_definitions.reduce((accumulator, definition) => {
    return {
      ...accumulator,
      [definition.id]: definition,
    };
  }, {} as Record<editable_field_key, field_config>);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// section: helper_functions
const create_initial_field_state = (): field_state => ({
  name: "",
  email_address: "",
  password: "",
  confirm_password: "",
});

// section: component
export default function register_layout({
  image_src,
  image_alt,
  image_background_color = "#f1f5f9",
  labels = {},
  show_name_field = true,
  password_requirements,
  button_colors,
}: register_layout_props) {
  const [field_values, set_field_values] = useState<field_state>(
    create_initial_field_state(),
  );
  const [field_errors, set_field_errors] = useState<
    Partial<Record<editable_field_key, string>>
  >({});
  const [password_visibility, set_password_visibility] = useState<
    Record<"password" | "confirm_password", boolean>
  >({
    password: false,
    confirm_password: false,
  });

  const password_rules = useMemo(() => {
    return {
      minimum_length: password_requirements?.minimum_length ?? 8,
      require_uppercase: password_requirements?.require_uppercase ?? true,
      require_lowercase: password_requirements?.require_lowercase ?? true,
      require_number: password_requirements?.require_number ?? true,
      require_special: password_requirements?.require_special ?? true,
    } satisfies Required<password_requirement_options>;
  }, [password_requirements]);

  const resolved_button_colors = useMemo(() => {
    return {
      register_background: button_colors?.register_background ?? "#0f172a",
      register_text: button_colors?.register_text ?? "#ffffff",
      cancel_border: button_colors?.cancel_border ?? "#cbd5f5",
      cancel_text: button_colors?.cancel_text ?? "#0f172a",
    } satisfies Required<button_color_options>;
  }, [button_colors]);

  const get_password_error_message = useCallback(
    (password_value: string) => {
      if (password_value.trim().length === 0) {
        return undefined;
      }

      const requirement_messages: string[] = [];

      if (
        password_rules.minimum_length &&
        password_value.length < password_rules.minimum_length
      ) {
        requirement_messages.push(
          `Password must be at least ${password_rules.minimum_length} characters.`,
        );
      }

      if (
        password_rules.require_uppercase &&
        !/[A-Z]/.test(password_value)
      ) {
        requirement_messages.push(
          "Password must include at least one uppercase letter.",
        );
      }

      if (
        password_rules.require_lowercase &&
        !/[a-z]/.test(password_value)
      ) {
        requirement_messages.push(
          "Password must include at least one lowercase letter.",
        );
      }

      if (password_rules.require_number && !/\d/.test(password_value)) {
        requirement_messages.push(
          "Password must include at least one number.",
        );
      }

      if (
        password_rules.require_special &&
        !/[!@#$%^&*(),.?":{}|<>\-_+=\[\];'/\\]/.test(password_value)
      ) {
        requirement_messages.push(
          "Password must include at least one special character.",
        );
      }

      if (requirement_messages.length === 0) {
        return undefined;
      }

      return requirement_messages.join(" ");
    },
    [password_rules],
  );

  const is_submit_disabled = useMemo(() => {
    const has_empty_fields = Object.entries(field_values).some(([key, value]) => {
      if (key === "name" && show_name_field === false) {
        return false;
      }
      return value.trim() === "";
    });

    const has_errors = Object.keys(field_errors).length > 0;
    return has_empty_fields || has_errors;
  }, [field_errors, field_values, show_name_field]);

  const handle_field_change = useCallback(
    (field_key: editable_field_key, value: string) => {
      set_field_values((previous_state) => {
        const next_state = {
          ...previous_state,
          [field_key]: value,
        };

        set_field_errors((previous_errors) => {
          const updated_errors: Partial<Record<editable_field_key, string>> = {
            ...previous_errors,
          };

          const trimmed_email = next_state.email_address.trim();
          if (trimmed_email.length > 0 && !EMAIL_PATTERN.test(trimmed_email)) {
            updated_errors.email_address = "enter a valid email address";
          } else {
            delete updated_errors.email_address;
          }

          const password_error = get_password_error_message(next_state.password);
          if (password_error) {
            updated_errors.password = password_error;
          } else {
            delete updated_errors.password;
          }

          const confirm_value = next_state.confirm_password;
          if (
            confirm_value.trim().length > 0 &&
            next_state.password !== confirm_value
          ) {
            updated_errors.confirm_password = "passwords do not match";
          } else {
            delete updated_errors.confirm_password;
          }

          if (!show_name_field) {
            delete updated_errors.name;
          }

          return updated_errors;
        });

        return next_state;
      });
    },
    [get_password_error_message, show_name_field],
  );

  const handle_form_submit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  }, []);

  const handle_form_cancel = useCallback(() => {
    set_field_values(create_initial_field_state());
    set_field_errors({});
    set_password_visibility({ password: false, confirm_password: false });
  }, []);

  const resolved_field_definitions = register_field_definitions.filter(
    (field_definition) =>
      field_definition.id !== "name" || show_name_field === true,
  );

  const resolved_labels = {
    heading: labels.heading ?? "Create your hazo account",
    sub_heading:
      labels.sub_heading ??
      "Secure your access with editable fields powered by shadcn components.",
    register_button: labels.register_button ?? "Register",
    cancel_button: labels.cancel_button ?? "Cancel",
  };

  const field_label_overrides: Record<
    editable_field_key,
    {
      label: string;
      placeholder: string;
      aria_label: string;
    }
  > = {
    name: {
      label:
        labels.name_label ?? register_field_lookup.name.default_label,
      placeholder:
        labels.name_placeholder ??
        register_field_lookup.name.default_placeholder,
      aria_label: `${
        labels.name_label ?? register_field_lookup.name.default_label
      } input field`,
    },
    email_address: {
      label:
        labels.email_label ??
        register_field_lookup.email_address.default_label,
      placeholder:
        labels.email_placeholder ??
        register_field_lookup.email_address.default_placeholder,
      aria_label: `${
        labels.email_label ??
        register_field_lookup.email_address.default_label
      } input field`,
    },
    password: {
      label:
        labels.password_label ??
        register_field_lookup.password.default_label,
      placeholder:
        labels.password_placeholder ??
        register_field_lookup.password.default_placeholder,
      aria_label: `${
        labels.password_label ??
        register_field_lookup.password.default_label
      } input field`,
    },
    confirm_password: {
      label:
        labels.confirm_password_label ??
        register_field_lookup.confirm_password.default_label,
      placeholder:
        labels.confirm_password_placeholder ??
        register_field_lookup.confirm_password.default_placeholder,
      aria_label: `${
        labels.confirm_password_label ??
        register_field_lookup.confirm_password.default_label
      } input field`,
    },
  };

  const toggle_password_visibility = useCallback(
    (field_key: "password" | "confirm_password") => {
      set_password_visibility((previous_state) => ({
        ...previous_state,
        [field_key]: !previous_state[field_key],
      }));
    },
    [],
  );

  return (
    <div className="cls_register_layout_component mx-auto grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:grid-cols-2 md:min-h-[520px]">
      <div
        className="cls_register_layout_visual_panel relative hidden h-full w-full items-center justify-center md:flex"
        style={{ backgroundColor: image_background_color }}
      >
        <div className="cls_register_layout_visual_image_wrapper relative h-full w-full">
          <Image
            src={image_src}
            alt={image_alt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="cls_register_layout_visual_image object-cover"
            priority
          />
        </div>
      </div>

      <div className="cls_register_layout_form_container flex flex-col gap-6 p-8">
        <header className="cls_register_layout_form_header flex flex-col gap-2 text-center md:text-left">
          <h1 className="cls_register_layout_form_title text-2xl font-semibold text-slate-900">
            {resolved_labels.heading}
          </h1>
          <p className="cls_register_layout_form_subtitle text-sm text-slate-600">
            {resolved_labels.sub_heading}
          </p>
        </header>

        <form
          className="cls_register_layout_form_fields flex flex-col gap-5"
          onSubmit={handle_form_submit}
          aria-label="Registration form"
        >
          {resolved_field_definitions.map(
            ({
              id,
              default_label,
              type,
              auto_complete,
              default_placeholder,
              default_aria_label,
            }) => {
              const field_metadata = field_label_overrides[id];
              const label_text = field_metadata?.label ?? default_label;
              const placeholder_text =
                field_metadata?.placeholder ?? default_placeholder;
              const aria_text = field_metadata?.aria_label ?? default_aria_label;
              const is_password_field =
                id === "password" || id === "confirm_password";
              const input_type =
                is_password_field && password_visibility[id]
                  ? "text"
                  : type;
              const password_toggle_label = is_password_field
                ? `${password_visibility[id] ? "Hide" : "Show"} ${label_text.toLowerCase()}`
                : undefined;

              return (
                <div
                  key={id}
                  className="cls_register_layout_field_group flex flex-col gap-2"
                >
                  <Label
                    htmlFor={id}
                    className="cls_register_layout_field_label text-sm font-medium text-slate-800"
                  >
                    {label_text}
                  </Label>
                  <div className="cls_register_layout_input_wrapper relative">
                    <Input
                      id={id}
                      type={input_type}
                      value={field_values[id]}
                      onChange={(event) =>
                        handle_field_change(id, event.target.value)
                      }
                      autoComplete={auto_complete}
                      placeholder={placeholder_text}
                      aria-label={aria_text}
                      className={
                        is_password_field
                          ? "cls_register_layout_field_input pr-11"
                          : "cls_register_layout_field_input"
                      }
                    />
                    {is_password_field ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="cls_register_layout_password_toggle absolute right-1 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900"
                        aria-label={password_toggle_label}
                        onClick={() =>
                          toggle_password_visibility(
                            id as "password" | "confirm_password",
                          )
                        }
                      >
                        {password_visibility[id] ? (
                          <EyeOff className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        )}
                      </Button>
                    ) : null}
                  </div>
                  {field_errors[id] ? (
                    <p className="cls_register_layout_field_error text-sm text-red-600">
                      {field_errors[id]}
                    </p>
                  ) : null}
                </div>
              );
            },
          )}

          <div className="cls_register_layout_form_actions mt-2 flex items-center justify-end gap-4">
            <Button
              type="submit"
              disabled={is_submit_disabled}
              className="cls_register_layout_submit_button flex items-center gap-2"
              aria-label="Submit registration form"
              style={{
                backgroundColor: resolved_button_colors.register_background,
                color: resolved_button_colors.register_text,
              }}
            >
              <CircleCheckBig className="h-4 w-4" aria-hidden="true" />
              <span>{resolved_labels.register_button}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handle_form_cancel}
              className="cls_register_layout_cancel_button flex items-center gap-2"
              aria-label="Cancel registration form"
              style={{
                borderColor: resolved_button_colors.cancel_border,
                color: resolved_button_colors.cancel_text,
              }}
            >
              <CircleX className="h-4 w-4" aria-hidden="true" />
              <span>{resolved_labels.cancel_button}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


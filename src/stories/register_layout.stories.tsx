// file_description: showcase the register_layout component within storybook for review and testing
// section: imports
import type { Meta, StoryObj } from "@storybook/react";
import RegisterLayout from "@/components/layouts/register_layout";

// section: metadata
const meta: Meta<typeof RegisterLayout> = {
  title: "layouts/register_layout",
  id: "forms-register-form",
  component: RegisterLayout,
  parameters: {
    layout: "centered",
  },
};

export default meta;

// section: stories
type story = StoryObj<typeof RegisterLayout>;

// section: default_story
export const default_state: story = {
  name: "default_state",
  args: {
    image_src: "/globe.svg",
    image_alt:
      "Decorative globe illustrating the global reach of the hazo authentication platform",
    image_background_color: "#e2e8f0",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Default presentation of the register layout with all fields locked until edited with the pencil toggles.",
      },
    },
  },
};

export const custom_configuration: story = {
  name: "custom_configuration",
  args: {
    image_src: "/globe.svg",
    image_alt:
      "Decorative globe illustrating the global reach of the hazo authentication platform",
    image_background_color: "#dbeafe",
    show_name_field: false,
    labels: {
      heading: "Join the hazo beta now",
      sub_heading: "Configure your secure workspace credentials in minutes.",
      email_label: "Work email",
      email_placeholder: "Enter your work email",
      password_label: "Create password",
      password_placeholder: "Choose a strong password now",
      confirm_password_label: "Confirm password",
      confirm_password_placeholder: "Re-enter the password",
      register_button: "Create account",
      cancel_button: "Cancel setup",
    },
    password_requirements: {
      minimum_length: 12,
      require_uppercase: true,
      require_lowercase: true,
      require_number: true,
      require_special: true,
    },
    button_colors: {
      register_background: "#5b21b6",
      register_text: "#ffffff",
      cancel_border: "#7c3aed",
      cancel_text: "#5b21b6",
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates how teams can toggle the full name field, customise button styling, and adjust password policy messaging for alternative onboarding flows.",
      },
    },
  },
};


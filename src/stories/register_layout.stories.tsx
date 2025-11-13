// file_description: showcase the register_layout component within storybook for review and testing
// section: imports
import type { Meta, StoryObj } from "@storybook/react";
import RegisterLayout from "@/components/layouts/register";
import { createLayoutDataClient } from "@/components/layouts/shared/data/layout_data_client";

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

// section: helpers
// Create mock hazo_connect instance for Storybook (browser environment)
// Note: Real SQLite database cannot be used in browser/Storybook context
// This mock satisfies the LayoutDataClient interface requirements
const create_storybook_hazo_connect = () => {
  return {
    healthCheck: async () => {
      // Mock health check for Storybook - no-op in browser context
      return Promise.resolve();
    },
  };
};

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
    data_client: createLayoutDataClient(create_storybook_hazo_connect()),
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
    data_client: createLayoutDataClient(create_storybook_hazo_connect()),
    labels: {
      heading: "Join the hazo beta now",
      subHeading: "Configure your secure workspace credentials in minutes.",
      submitButton: "Create account",
      cancelButton: "Cancel setup",
    },
    field_overrides: {
      email_address: {
        label: "Work email",
        placeholder: "Enter your work email",
      },
      password: {
        label: "Create password",
        placeholder: "Choose a strong password now",
      },
      confirm_password: {
        label: "Confirm password",
        placeholder: "Re-enter the password",
      },
    },
    password_requirements: {
      minimum_length: 12,
      require_uppercase: true,
      require_lowercase: true,
      require_number: true,
      require_special: true,
    },
    button_colors: {
      submitBackground: "#5b21b6",
      submitText: "#ffffff",
      cancelBorder: "#7c3aed",
      cancelText: "#5b21b6",
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


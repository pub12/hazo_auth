// file_description: showcase the forgot_password_layout component within storybook for review and testing
// section: imports
import type { Meta, StoryObj } from "@storybook/react";
import ForgotPasswordLayout from "../components/layouts/forgot_password";
import { createLayoutDataClient } from "../components/layouts/shared/data/layout_data_client";

// section: metadata
const meta: Meta<typeof ForgotPasswordLayout> = {
  title: "layouts/forgot_password_layout",
  id: "forms-forgot-password-form",
  component: ForgotPasswordLayout,
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
type story = StoryObj<typeof ForgotPasswordLayout>;

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
          "Default presentation of the forgot password layout with email field.",
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
    data_client: createLayoutDataClient(create_storybook_hazo_connect()),
    labels: {
      heading: "Reset your password",
      subHeading: "We'll send you a secure link to reset your password.",
      submitButton: "Send reset email",
      cancelButton: "Back to login",
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
          "Demonstrates how teams can customise labels, button styling, and background images for alternative forgot password flows.",
      },
    },
  },
};


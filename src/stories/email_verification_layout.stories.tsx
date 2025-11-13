// file_description: showcase the email_verification_layout component within storybook for review and testing
// section: imports
import type { Meta, StoryObj } from "@storybook/react";
import EmailVerificationLayout from "@/components/layouts/email_verification";
import { createLayoutDataClient } from "@/components/layouts/shared/data/layout_data_client";

// section: metadata
const meta: Meta<typeof EmailVerificationLayout> = {
  title: "layouts/email_verification_layout",
  id: "forms-email-verification-form",
  component: EmailVerificationLayout,
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
type story = StoryObj<typeof EmailVerificationLayout>;

// section: verifying_state_story
export const verifying_state: story = {
  name: "verifying_state",
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
          "Loading state shown while verifying the email verification token. Note: In Storybook, this will attempt to verify a token from the URL query string.",
      },
    },
  },
};

// section: success_state_story
export const success_state: story = {
  name: "success_state",
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
          "Success state shown after email verification is complete, with redirect countdown.",
      },
    },
  },
};

// section: error_state_story
export const error_state: story = {
  name: "error_state",
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
          "Error state shown when verification fails, with form to resend verification email.",
      },
    },
  },
};

// section: custom_configuration_story
export const custom_configuration: story = {
  name: "custom_configuration",
  args: {
    image_src: "/globe.svg",
    image_alt:
      "Decorative globe illustrating the global reach of the hazo authentication platform",
    image_background_color: "#dbeafe",
    data_client: createLayoutDataClient(create_storybook_hazo_connect()),
    labels: {
      heading: "Verify your email",
      subHeading: "Please wait while we verify your email address.",
      submitButton: "Resend email",
      cancelButton: "Back to login",
    },
    success_labels: {
      heading: "Email confirmed!",
      message: "Your email address has been successfully verified.",
      redirectMessage: "You will be redirected in",
      goToLoginButton: "Continue to login",
    },
    error_labels: {
      heading: "Verification link expired",
      message: "The verification link is no longer valid.",
      resendFormHeading: "Get a new verification link",
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
          "Demonstrates how teams can customise labels, button styling, and background images for alternative email verification flows.",
      },
    },
  },
};


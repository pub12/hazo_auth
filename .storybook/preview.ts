// file_description: declare global preview parameters and styles for storybook
import type { Preview } from "@storybook/nextjs";
import "../src/app/globals.css";

// section: preview_configuration
const preview_config: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview_config;
// file_description: configure jest for the hazo_auth project
import nextJest from "next/jest.js";
import type { Config } from "jest";

const createJestConfig = nextJest({ dir: "./" });

const customJestConfig: Config = {
  verbose: true,
  testEnvironment: "jest-environment-jsdom",
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^hazo_config/server$": "<rootDir>/test-utils/mocks/hazo_config_lib.ts",
  },
  setupFiles: ["dotenv/config", "<rootDir>/jest.setup.ts"],
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
};

// Wrap to override transformIgnorePatterns from next/jest
const jestConfig = async () => {
  const baseConfig = await createJestConfig(customJestConfig)();
  return {
    ...baseConfig,
    // Transform ESM modules from hazo packages - must override next/jest's default
    transformIgnorePatterns: [
      "/node_modules/(?!(hazo_logs)/)",
    ],
  };
};

export default jestConfig;

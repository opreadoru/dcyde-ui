import { defineConfig, mergeConfig } from "vitest/config";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import viteConfig from "./vite.config";

// Runs every story in a real headless Chromium: it renders the story, runs its
// play function (the keyboard tests), and runs the axe accessibility check.
// Each story runs twice, once per theme.
const storybookProject = (theme: "light" | "dark") => ({
  extends: true,
  plugins: [storybookTest({ configDir: ".storybook" })],
  define: { __TEST_THEME__: JSON.stringify(theme) },
  test: {
    name: `storybook-${theme}`,
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" as const }],
    },
  },
});

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      projects: [storybookProject("light"), storybookProject("dark")],
    },
  }),
);

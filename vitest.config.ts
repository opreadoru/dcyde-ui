import { defineConfig, mergeConfig } from "vitest/config";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import viteConfig from "./vite.config";

// Runs every story in a real headless Chromium: it renders the story, runs its
// play function (the keyboard tests), and runs the axe accessibility check.
// Each story runs four times: light and dark, in English and in French.
const storybookProject = (theme: "light" | "dark", locale: "en" | "fr") => ({
  extends: true,
  plugins: [storybookTest({ configDir: ".storybook" })],
  define: {
    __TEST_THEME__: JSON.stringify(theme),
    __TEST_LOCALE__: JSON.stringify(locale),
  },
  test: {
    name: `storybook-${theme}-${locale}`,
    // Four browsers start at once, so the first story in each file can take a
    // while to load. Real failures show up as assertion errors, not timeouts.
    testTimeout: 60_000,
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
      projects: [
        storybookProject("light", "en"),
        storybookProject("dark", "en"),
        storybookProject("light", "fr"),
        storybookProject("dark", "fr"),
      ],
    },
  }),
);

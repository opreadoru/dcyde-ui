import { useLayoutEffect } from "react";
import type { Decorator, Preview } from "@storybook/react-vite";
import i18n from "../src/i18n";
import { ToastProvider } from "../src/lib/toast";
import "../src/styles/theme.css";

declare const __TEST_THEME__: "light" | "dark" | undefined;
declare const __TEST_LOCALE__: "en" | "fr" | undefined;

// Theme and language live on <html>, so dialogs and popovers that render
// outside the story (in a portal) pick them up too.
const withThemeAndLocale: Decorator = (Story, context) => {
  const theme = context.globals.theme as "light" | "dark";
  const locale = context.globals.locale as "en" | "fr";

  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useLayoutEffect(() => {
    document.documentElement.setAttribute("lang", locale);
    i18n.changeLanguage(locale);
  }, [locale]);

  return (
    <ToastProvider>
      <Story />
    </ToastProvider>
  );
};

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Color theme",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
    locale: {
      description: "Language",
      toolbar: {
        title: "Language",
        icon: "globe",
        items: [
          { value: "en", title: "English" },
          { value: "fr", title: "Français" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    // The test runner sets these to run every story in both themes and both languages.
    theme: typeof __TEST_THEME__ === "undefined" ? "light" : __TEST_THEME__,
    locale: typeof __TEST_LOCALE__ === "undefined" ? "en" : __TEST_LOCALE__,
  },
  decorators: [withThemeAndLocale],
  // Runs before every story renders, so its first paint and its play function
  // already see the chosen theme and language.
  beforeEach: async ({ globals }) => {
    document.documentElement.setAttribute("data-theme", globals.theme);
    document.documentElement.setAttribute("lang", globals.locale);
    await i18n.changeLanguage(globals.locale);
  },
  parameters: {
    layout: "padded",
    options: {
      storySort: { order: ["Foundations", "Atoms", "Molecules", "Organisms"] },
    },
    backgrounds: { disable: true },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // Treat any axe violation as a failure, not a warning.
      test: "error",
    },
  },
};

export default preview;

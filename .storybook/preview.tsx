import { useEffect } from "react";
import type { Decorator, Preview } from "@storybook/react-vite";
import i18n from "../src/i18n";
import { ToastProvider } from "../src/lib/toast";
import "../src/styles/theme.css";

declare const __TEST_THEME__: "light" | "dark" | undefined;

// Theme and language live on <html>, so dialogs and popovers that render
// outside the story (in a portal) pick them up too.
const withThemeAndLocale: Decorator = (Story, context) => {
  const theme = context.globals.theme as "light" | "dark";
  const locale = context.globals.locale as "en" | "fr";

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
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
    // The test runner sets __TEST_THEME__ to run every story in both themes.
    theme: typeof __TEST_THEME__ === "undefined" ? "light" : __TEST_THEME__,
    locale: "en",
  },
  decorators: [withThemeAndLocale],
  parameters: {
    layout: "padded",
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

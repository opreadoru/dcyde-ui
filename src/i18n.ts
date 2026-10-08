import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "./locales/en/common.json";
import enFeed from "./locales/en/feed.json";
import enFilters from "./locales/en/filters.json";
import enCompose from "./locales/en/compose.json";
import frCommon from "./locales/fr/common.json";
import frFeed from "./locales/fr/feed.json";
import frFilters from "./locales/fr/filters.json";
import frCompose from "./locales/fr/compose.json";

// One small setup for Storybook and any app that uses these components.
// The language comes from the caller (the Storybook toolbar), never from
// browser detection, so every story renders the same way for everyone.
i18n.use(initReactI18next).init({
  resources: {
    en: { common: enCommon, feed: enFeed, filters: enFilters, compose: enCompose },
    fr: { common: frCommon, feed: frFeed, filters: frFilters, compose: frCompose },
  },
  lng: "en",
  fallbackLng: "en",
  defaultNS: "common",
  ns: ["common", "feed", "filters", "compose"],
  interpolation: { escapeValue: false },
});

export default i18n;

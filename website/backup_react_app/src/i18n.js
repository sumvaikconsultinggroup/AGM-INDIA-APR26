import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

// Initialize i18next
i18next
  .use(Backend) // Load translations from separate files
  .use(LanguageDetector) // Auto detect user language
  .use(initReactI18next) // Initialize react-i18next
  .init({
    fallbackLng: "en",
    debug: import.meta.env.DEV, // Enable debug in development

    // Default namespace and additional namespaces
    defaultNS: "common",
    ns: ["common", "about", "home", "contact"],

    // Supported languages
    supportedLngs: ["en", "hi", "sa", "gu", "ml"],

    // Control how long translations are cached in browser
    cache: {
      enabled: true,
      expirationTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    },

    // Interpolation configuration
    interpolation: {
      escapeValue: false, // React already protects from XSS
    },

    // Backends to load translation resources
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },

    // React specific options
    react: {
      useSuspense: true,
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ["br", "strong", "i", "p", "span", "em"],
    },
  });

export default i18next;

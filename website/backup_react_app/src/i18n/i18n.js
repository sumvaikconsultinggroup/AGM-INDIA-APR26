import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import enTranslation from "../../public/locales/en/translation.json";
import hiTranslation from "../../public/locales/hi/translation.json";

// Initialize i18next
i18n
  .use(Backend) // Load translations from server (useful for larger translation files)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: ["en", "hi"], // Only English and Hindi
    resources: {
      en: {
        translation: enTranslation,
      },
      hi: {
        translation: hiTranslation,
      },
    },
    ns: ["translation", "common", "home", "journey", "teachings"], // Namespaces for different sections
    defaultNS: "translation",
    interpolation: {
      escapeValue: false, // React already escapes content
    },
    detection: {
      order: ["querystring", "localStorage", "navigator", "htmlTag"],
      lookupQuerystring: "lang",
      caches: ["localStorage"],
    },
    react: {
      useSuspense: false, // Disable suspense to avoid loading issues
    },
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json", // Path to load resources
    },
  });

// Language switcher helper function
export const changeLanguage = async (language) => {
  try {
    await i18n.changeLanguage(language);
    document.documentElement.lang = language;
    localStorage.setItem("i18nextLng", language);
    return true;
  } catch (error) {
    console.error("Failed to change language:", error);
    return false;
  }
};

// Export language options for UI
export const languageOptions = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
];

export default i18n;

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDownIcon, LanguageIcon } from "@heroicons/react/24/outline";

const LanguageSelector = ({ scrolled, getTextStyle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { i18n, t } = useTranslation();

  const languages = [
    { code: "en", label: "English (Default)" },
    { code: "hi", label: "हिंदी (Hindi)" },
  ];

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center space-x-1 transition-colors duration-200 ${
            scrolled ? "text-[#1E293B] hover:text-[#B82A1E]" : "text-white hover:text-[#B82A1E]"
          }`}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label={t("rightSection.language")}
        >
          <LanguageIcon className={`h-6 w-6 ${getTextStyle()}`} />
          <ChevronDownIcon className={`h-4 w-4 ${getTextStyle()}`} />
        </button>

        {isOpen && (
          <div
            className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="language-menu"
          >
            <div className="py-1" role="none">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => changeLanguage(language.code)}
                  className={`block px-4 py-2 text-sm w-full text-left ${
                    i18n.language === language.code
                      ? "bg-gray-100 text-[#B82A1E] font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  role="menuitem"
                >
                  {language.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LanguageSelector;

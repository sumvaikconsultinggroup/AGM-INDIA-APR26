import { useState } from "react";
import { ChevronDown, ChevronUp, UserIcon } from "lucide-react";
import { useNavLinks } from "../constants";
import { useAuth } from "../../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const MobileNavLinks = () => {
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const { navLinks, secondaryNavLinks } = useNavLinks();
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();

  // const toggleSubmenu = (name) => {
  //   setOpenSubmenu(openSubmenu === name ? null : name);
  // };

  const toggleSubmenu = (name, hasDropdown, event) => {
    if (hasDropdown) {
      event.preventDefault(); // Prevent navigation when toggling submenu
      setOpenSubmenu(openSubmenu === name ? null : name);
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setOpenSubmenu(null);
  };

  return (
    <div className="space-y-1 p-4">
      {/* Profile Section */}
      <div className="px-4">
        {user ? (
          <div className="space-y-2">
            <Link
              to="/profile"
              className="flex items-center space-x-3 py-2 text-[#1E293B] hover:text-[#DC2626]"
            >
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-[#DC2626] font-medium">
                  {user.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm">{t("profile")}</span>
            </Link>
            <button
              onClick={logout}
              className="w-full text-left py-2 text-sm text-[#DC2626] hover:text-red-700"
            >
              {t("logout")}
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center space-x-2 py-2 text-[#1E293B] hover:text-[#DC2626]"
          >
            <UserIcon className="h-5 w-5" />
            <span className="text-sm">{t("login")}</span>
          </Link>
        )}
      </div>

      {/* Language Section */}
      <div>
        <button
          onClick={(e) => toggleSubmenu("language", true, e)}
          className="flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-left text-sm hover:bg-gray-50 text-[#1E293B]"
        >
          <span className="text-sm flex items-center">{t("language")}</span>
          {openSubmenu === "language" ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {openSubmenu === "language" && (
          <div className="ml-4 space-y-1 border-l pl-4">
            <button
              onClick={() => changeLanguage("en")}
              className={`block w-full text-left py-2 text-sm ${
                i18n.language === "en"
                  ? "text-[#DC2626]"
                  : "text-gray-600 hover:text-[#DC2626]"
              }`}
            >
              English
            </button>
            <button
              onClick={() => changeLanguage("hi")}
              className={`block w-full text-left py-2 text-sm ${
                i18n.language === "hi"
                  ? "text-[#DC2626]"
                  : "text-gray-600 hover:text-[#DC2626]"
              }`}
            >
              हिंदी
            </button>
          </div>
        )}
      </div>

      {navLinks.map((link) => (
        <div key={link.name}>
          <button
            // onClick={() => link.hasDropdown && toggleSubmenu(link.name)}
            onClick={(e) => toggleSubmenu(link.name, link.hasDropdown, e)}
            className={`flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-left text-sm hover:bg-gray-50 ${
              link.color || "text-[#1E293B]"
            }`}
          >
            <a
              href={link.href}
              className={`text-sm ${
                link.color || "text-[#1E293B]"
              } hover:text-[#DC2626] flex items-center`}
            >
              {link.name}
            </a>
            {link.hasDropdown &&
              (openSubmenu === link.name ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              ))}
          </button>

          {link.hasDropdown && openSubmenu === link.name && (
            <div className="ml-4 space-y-1 border-l pl-4">
              <a
                href="#"
                className="block py-2 text-sm text-gray-600 hover:text-[#DC2626]"
              >
                Bhagavad Gita
              </a>
              <a
                href="#"
                className="block py-2 text-sm text-gray-600 hover:text-[#DC2626]"
              >
                Vedant Samhita
              </a>
              <a
                href="#"
                className="block py-2 text-sm text-gray-600 hover:text-[#DC2626]"
              >
                Sanskrit Classes
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MobileNavLinks;

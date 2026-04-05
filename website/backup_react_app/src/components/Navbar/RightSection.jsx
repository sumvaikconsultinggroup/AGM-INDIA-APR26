import { useEffect } from "react";
import LanguageSelector from "./LanguageSelector";
import ContactButton from "./ContactButton";
import MobileMenu from "./MobileMenu";
// import ThemeSwitch from "./ThemeSwitch";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

const RightSection = ({ scrolled, setScrolled }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isHomePage = location.pathname === "/";
  const isLoginPage = location.pathname === "/login" || location.pathname === "/userregister";
  const isSchedulePage = location.pathname === "/schedule";

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined") {
        setScrolled(window.scrollY > 300);
      }
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [setScrolled]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const getTextStyle = () => {
    if (isHomePage) {
      return scrolled
        ? "text-black hover:text-[#B82A1E] hover:border-[#B82A1E]"
        : "text-white hover:text-[#B82A1E] hover:border-[#B82A1E]";
    } else if (isLoginPage) {
      // Special styling for login/register pages
      return "text-black hover:text-[#B82A1E] hover:border-[#B82A1E] hover:border-[#B82A1E] ";
    } else if (isSchedulePage) {

      return scrolled
        ? "text-black hover:text-[#B82A1E] hover:border-[#B82A1E]"
        : "text-white hover:text-[#B82A1E] hover:border-[#B82A1E]";
    } else {
      // Other pages: white text before scroll, black after scroll
      return scrolled
        ? "text-black hover:text-[#B82A1E] hover:border-[#B82A1E]"
        : "text-white hover:text-slate-300 hover:border-slate-300";
    }
  };

  return (
    <div className="flex items-center gap-6">
      <div className="hidden lg:flex items-center gap-6">
        <Link
          to="/donate"
          className="text-md font-semibold text-white bg-[#B82A1E] px-8 py-2 rounded-full shadow-md hover:bg-red-700 transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          {t("navLinks.donate")}
        </Link>
        <LanguageSelector scrolled={scrolled} getTextStyle={getTextStyle} />
      </div>

      {/* Login/Logout section */}
      <div className="hidden sm:flex items-center space-x-4">
        {isAuthenticated ? (
          <div className="flex items-center space-x-4">
            <Link
              to="/profile"
              className={`flex items-center space-x-1 transition-colors duration-200 ${getTextStyle()}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${
                  scrolled ? "bg-[#FDEDED]" : "bg-orange-100 dark:bg-orange-900"
                }`}
              >
                <span
                  className={`font-medium transition-colors duration-200 ${
                    scrolled ? "text-[#B82A1E]" : "text-orange-600 dark:text-orange-400"
                  }`}
                >
                  {user.email.charAt(0).toUpperCase()}
                </span>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className={`text-sm transition-colors duration-200 ${getTextStyle()}`}
            >
              {t("rightSection.logout")}
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className={`flex items-center space-x-1 transition-colors duration-200 ${getTextStyle()}`}
          >
            <UserIcon className={`h-5 w-5 transition-colors duration-200 ${getTextStyle()}`} />
            <span className={`transition-colors duration-200 ${getTextStyle()}`}>
              {t("rightSection.login")}
            </span>
          </Link>
        )}
      </div>

      <div className="lg:hidden">
        <MobileMenu getTextStyle={getTextStyle} />
      </div>
    </div>
  );
};

export default RightSection;

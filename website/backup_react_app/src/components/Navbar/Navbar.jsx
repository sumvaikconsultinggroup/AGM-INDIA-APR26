import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link as RouterLink } from "react-router-dom";
import RightSection from "./RightSection";

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useIsMissionDomain } from "../../utils/isMission";
import "./Navbar.css"; // Import the CSS file for blinking effect

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isWisdomLibraryOpen, setWisdomLibraryOpen] = useState(false);
  const leaveTimeoutRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isMissionDomain = useIsMissionDomain();

  // Page detection for styling
  const isHomePage = location.pathname === "/";
  const isLoginPage = location.pathname === "/login" || location.pathname === "/userregister";
  const isSchedulePage = location.pathname === "/schedule";

  const validPaths = [
    "/",
    "/about",
    "/books",
    "/profile",
    "/podcasts",
    "/articles",
    "/video-series",
    "/donate",
    "/schedule",
    "/volunteer",
    "/login",
    "/userregister",
    "/mantra-diksha",
    "/privacy-policys",
    "/terms-and-conditions",
    "/image-library",
    "/donate-form",
    "/image-library",
  ];
  const isNotFoundPage = !validPaths.some(
    (path) => location.pathname === path || location.pathname.startsWith(`${path}/`)
  );

  // Sub-items for the Wisdom Library dropdown
  const wisdomLibraryItems = [
    { name: t("navLinks.books"), path: "/books" },
    { name: t("navLinks.podcasts"), path: "/podcasts" },
    { name: t("navLinks.articles"), path: "/articles" },
    { name: t("navLinks.videoSeries"), path: "/video-series" },
  ];

  // Navigation structure with paths and translations
  const navItems = [
    { name: t("navLinks.home"), path: "/" },
    { name: t("navLinks.about"), path: "/about" },
    { name: t("navLinks.wisdomLibrary", "Wisdom Library"), items: wisdomLibraryItems },
    { name: t("navLinks.schedule"), path: "/schedule" },
    { name: t("navLinks.volunteer"), path: "/volunteer" },
    { name: t("navLinks.imageLibrary"), path: "/image-library" },
  ].filter(Boolean);

  // Assuming the same structure for the mission domain, but you can adjust as needed.
  const navItemsMission = [
    { name: t("navLinks.home"), path: "/" },
    { name: t("navLinks.about"), path: "/about" },
    { name: t("navLinks.wisdomLibrary", "Wisdom Library"), items: wisdomLibraryItems },
    { name: t("navLinks.schedule"), path: "/schedule" },
    { name: t("navLinks.imageLibrary"), path: "/image-library" },
    { name: t("navLinks.volunteer"), path: "/volunteer" },
    { name: t("navLinks.mantraDiksha"), path: "/mantra-diksha", special: "blink" },
  ];

  const handleClick = (fullPath) => {
    // Close mobile menu if open
    setIsNavOpen(false);
    setWisdomLibraryOpen(false);

    // Separate the path from the hash/sectionId
    const [path, hash] = fullPath.split("#");
    const sectionId = hash || null;

    if (location.pathname === path && sectionId) {
      // If on the same page, just scroll smoothly
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    } else {
      // If on a different page, navigate and pass sectionId in state
      if (sectionId) {
        navigate(path, { state: { sectionId } });
      } else {
        // If no sectionId, just navigate and scroll to top
        navigate(path);
        window.scrollTo(0, 0);
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined") {
        setScrolled(window.scrollY > 10);
      }
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Handle language change - update nav items when language changes
  useEffect(() => {
    // Navigation items are automatically updated when t() re-renders
  }, [i18n.language]);

  const getNavbarStyle = () => {
    if (isHomePage) {
      return scrolled ? "bg-white text-black shadow-md translate-y-0" : "bg-transparent text-white";
    } else if (isLoginPage) {
      return scrolled ? "bg-white text-black shadow-md translate-y-0" : "bg-transparent text-black";
    } else if (isSchedulePage) {
      return scrolled ? "bg-white text-black shadow-md translate-y-0" : "bg-transparent text-white";
    } else if (isNotFoundPage) {
      return scrolled ? "bg-white text-black shadow-md translate-y-0" : "bg-transparent text-black";
    } else {
      return scrolled ? "bg-white text-black shadow-md translate-y-0" : "bg-transparent text-white";
    }
  };

  const getTextStyle = () => {
    if (isHomePage) {
      return scrolled
        ? "text-black hover:text-[#B82A1E] hover:border-[#B82A1E]"
        : "text-white hover:text-[#B82A1E] hover:border-[#B82A1E]";
    } else if (isLoginPage) {
      return scrolled
        ? "text-black hover:text-[#B82A1E] hover:border-[#B82A1E]"
        : "text-black hover:text-[#B82A1E] hover:border-[#B82A1E]";
    } else if (isSchedulePage) {
      return scrolled
        ? "text-black hover:text-[#B82A1E] hover:border-[#B82A1E]"
        : "text-white hover:text-[#B82A1E] hover:border-slate-300 hover:text-slate-300";
    } else if (isNotFoundPage) {
      return scrolled
        ? "text-black hover:text-[#B82A1E] hover:border-[#B82A1E]"
        : "text-black hover:text-[#B82A1E] hover:border-[#B82A1E]";
    } else {
      return scrolled
        ? "text-black hover:text-[#B82A1E] hover:border-[#B82A1E]"
        : "text-white hover:text-[#B82A1E] hover:border-slate-300 hover:text-slate-300";
    }
  };

  const getActiveStyle = (path) => {
    const isActive = location.pathname === path;
    return isActive ? "border-b-2 border-[#B82A1E] font-medium" : "border-b-2 border-transparent";
  };

  // Function to get button styling with special effects
  const getButtonStyling = (item) => {
    const baseStyles = `transition-all duration-200 ${getTextStyle()} ${getActiveStyle(item.path)}`;

    // Add blinking effect for Mantra Diksha
    if (item.special === "blink") {
      return `${baseStyles} btn-gradient-outline`;
    }

    return baseStyles;
  };

  const isWisdomLibraryActive = () => {
    return wisdomLibraryItems.some((item) => location.pathname === item.path);
  };

  const wisdomLibraryRef = useRef(null);

  const handleWisdomLibraryEnter = () => {
    clearTimeout(leaveTimeoutRef.current);
    setWisdomLibraryOpen(true);
  };

  const handleWisdomLibraryLeave = () => {
    leaveTimeoutRef.current = setTimeout(() => {
      setWisdomLibraryOpen(false);
    }, 200); // 200ms delay before closing
  };

  return (
    <>
      <header
        className={`w-full fixed top-0 z-50 transition-all duration-300 ease-in-out ${getNavbarStyle()}`}
      >
        {/* <TopBanner /> */}

        <div className="container mx-auto px-4 pb-3">
          <div className="flex flex-col items-center py-6">
            {/* Main Navigation */}
            <div className="flex items-center justify-between w-full px-4">
              {/* Left side logo on small screens */}
              <div className="flex items-center justify-start pt-2">
                <Link to="/" aria-label={t("navLinks.home")}>
                  <img
                    src={
                      scrolled
                        ? "/assets/Avdheshanandg mission logo.png"
                        : "/assets/Non Scroll Logo.svg"
                    }
                    alt="Avdheshanand Mission"
                    className={`transition-all duration-300 ${
                      scrolled ? "h-20 w-auto" : "h-24 w-auto"
                    }`}
                  />
                </Link>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex flex-1 w-full whitespace-nowrap justify-center space-x-6 text-sm sm:text-base md:text-lg">
                {isMissionDomain
                  ? navItems.map((item) =>
                      item.items ? (
                        <div
                          key={item.name} // Use item.name for the key on the outer container
                          onMouseEnter={handleWisdomLibraryEnter}
                          onMouseLeave={handleWisdomLibraryLeave}
                          className="relative" // This container handles the hover state
                        >
                          <div className="relative " ref={wisdomLibraryRef}>
                            <button
                              className={`${getButtonStyling({ path: "wisdom-library" })} ${
                                isWisdomLibraryActive()
                                  ? "border-b-2 border-[#B82A1E]  font-medium"
                                  : ""
                              }`}
                            >
                              {item.name}
                            </button>
                          </div>
                          {isWisdomLibraryOpen && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1">
                              {item.items.map((subItem) => (
                                <RouterLink
                                  key={subItem.path}
                                  to={subItem.path}
                                  onClick={() => setWisdomLibraryOpen(false)}
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#B82A1E]"
                                >
                                  {subItem.name}
                                </RouterLink>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          key={item.path}
                          onClick={() => handleClick(item.path)}
                          className={getButtonStyling(item)}
                        >
                          {item.name}
                        </button>
                      )
                    )
                  : navItemsMission.map((item) =>
                      item.items ? (
                        <div
                          key={item.name} // Use item.name for the key on the outer container
                          onMouseEnter={handleWisdomLibraryEnter}
                          onMouseLeave={handleWisdomLibraryLeave}
                          className="relative" // This container handles the hover state
                        >
                          <div className="relative top-[10px]" ref={wisdomLibraryRef}>
                            <button
                              className={`${getButtonStyling({ path: "wisdom-library" })} ${
                                isWisdomLibraryActive()
                                  ? "border-b-2 border-[#B82A1E] font-medium"
                                  : ""
                              }`}
                            >
                              {item.name}
                            </button>
                          </div>
                          {isWisdomLibraryOpen && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1">
                              {item.items.map((subItem) => (
                                <RouterLink
                                  key={subItem.path}
                                  to={subItem.path}
                                  onClick={() => setWisdomLibraryOpen(false)}
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#B82A1E]"
                                >
                                  {subItem.name}
                                </RouterLink>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          key={item.path}
                          onClick={() => handleClick(item.path)}
                          className={getButtonStyling(item)}
                        >
                          {item.name}
                        </button>
                      )
                    )}
              </nav>

              {/* Right Section */}
              <div className="flex justify-end flex-none ml-4">
                <RightSection scrolled={scrolled} setScrolled={setScrolled} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation - Moved outside header to ensure full height */}
      {isNavOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col" style={{ height: "100%" }}>
          <div className="bg-white w-full shadow-md flex flex-col h-full overflow-y-auto">
            {/* Close button */}
            <div className="flex justify-end p-4 border-b">
              <button
                onClick={() => setIsNavOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label={t("accessibility.closeMenu")}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Navigation items */}
            <nav
              className="flex-1 py-4 px-6 flex flex-col items-center space-y-4"
              role="navigation"
              aria-label="Mobile navigation menu"
            >
              {isMissionDomain
                ? navItems.map((item) =>
                    item.items ? (
                      <div key={item.name} className="text-center">
                        <button className={getButtonStyling({ path: "wisdom-library" })}>
                          {item.name}
                        </button>
                        <div className="flex flex-col items-center space-y-2 mt-2">
                          {item.items.map((subItem) => (
                            <button
                              key={subItem.path}
                              onClick={() => handleClick(subItem.path)}
                              className="text-gray-600 hover:text-[#B82A1E] text-sm"
                            >
                              {subItem.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <button
                        key={item.path}
                        onClick={() => handleClick(item.path)}
                        className={getButtonStyling(item)}
                      >
                        {item.name}
                      </button>
                    )
                  )
                : navItemsMission.map((item) =>
                    item.items ? (
                      <div key={item.name} className="text-center">
                        <button
                          className={`${getButtonStyling({ path: "wisdom-library" })} ${
                            isWisdomLibraryActive() ? "border-b-2 border-[#B82A1E] font-medium" : ""
                          }`}
                        >
                          {item.name}
                        </button>
                        <div className="flex flex-col items-center space-y-2 mt-2">
                          {item.items.map((subItem) => (
                            <button
                              key={subItem.path}
                              onClick={() => handleClick(subItem.path)}
                              className="text-gray-600 hover:text-[#B82A1E] text-sm"
                            >
                              {subItem.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <button
                        key={item.path}
                        onClick={() => handleClick(item.path)}
                        className={getButtonStyling(item)}
                      >
                        {item.name}
                      </button>
                    )
                  )}
            </nav>
          </div>
        </div>
      )}

      {/* Page overlay for mobile menu */}
      {isNavOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsNavOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Navbar;

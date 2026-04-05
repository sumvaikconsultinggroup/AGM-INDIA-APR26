import React from "react";
import { useNavLinks } from "./constants";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const SecondaryNav = ({ scrolled, setScrolled }) => {
  const { secondaryNavLinks } = useNavLinks();
  const location = useLocation();
    const isHomePage = location.pathname === "/";
  
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
  }, []);

  const getNavbarStyle = () => {
    if (isHomePage) {
      return scrolled ? "bg-white text-black shadow-md translate-y-0" : "bg-transparent text-white";
    } else {
      return scrolled ? "bg-white text-black shadow-md translate-y-0" : "bg-transparent text-black";
    }
  };

  const getTextStyle = () => {
    if (isHomePage) {
      return scrolled
        ? "text-black hover:text-[#B82A1E] hover:border-[#B82A1E]"
        : "text-white hover:text-[#B82A1E] hover:border-[#B82A1E]";
    } else {
      return "text-black hover:text-[#B82A1E] hover:border-[#B82A1E]";
    }
  };
  return (
    <div className="border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className={`flex h-12 items-center gap-6 ${getNavbarStyle()}`}>
          {secondaryNavLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`text-sm transition-colors duration-200  ${getTextStyle()}`}
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SecondaryNav;

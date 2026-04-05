import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import DonateBanner from "../components/Donate/DonateBanner";
import FundraisingSection from "../components/Donate/Fundraising/FundraisingSection";

const Donate = () => {
  const { t } = useTranslation();
  const location = useLocation(); // Get the location object
  const { sectionId } = location.state || {}; // Extract sectionId from location.state

  useEffect(() => {
    // This effect handles scrolling when a sectionId is passed in the route state
    if (sectionId) {
      const element = document.getElementById(sectionId);
      if (element) {
        // A short timeout ensures the element is in the DOM before scrolling
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } else {
      // If no sectionId is provided, scroll to the top of the page.
      window.scrollTo(0, 0);
    }
  }, [location, sectionId]);

  return (
    <>
      {/* Red Banner */}
      <div
        id="donateTop"
        className="relative h-[60vh] bg-[#7B0000] flex items-center justify-center"
      >
        {/* Content */}
        <div className="relative z-20 text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-serif mb-4">{t("donate.hero.title")}</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto font-light">
            {t("donate.hero.subtitle")}
          </p>
          <div className="mt-8 inline-block">
            <div className="h-0.5 w-20 bg-white/70 mx-auto"></div>
            <div className="h-0.5 w-12 bg-white/50 mx-auto mt-1"></div>
            <div className="h-0.5 w-6 bg-white/30 mx-auto mt-1"></div>
          </div>
        </div>

        {/* Decorative Om Symbol */}
        <div className="absolute bottom-4 right-4 text-white/20 text-6xl font-serif z-10">ॐ</div>
      </div>

      <FundraisingSection/>

      <DonateBanner />
    </>
  );
};

export default Donate;

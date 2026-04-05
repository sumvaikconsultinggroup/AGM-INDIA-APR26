import { useTranslation } from "react-i18next";

const Hero = () => {
  const { t } = useTranslation();

  // Smooth scroll function
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // Adjust for fixed header if needed
      const headerOffset = 80; // Approximate header height in pixels
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <header className="relative bottom-11 h-[100vh] overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full">
        <video autoPlay loop muted playsInline className="absolute w-full h-full object-cover">
          <source src="/assets/video/website.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-4">
        <h1 className="text-5xl md:text-7xl font-light mb-4 animate-fadeIn">{t("hero.title")}</h1>
        <h2 className="text-2xl md:text-3xl italic font-light mb-12 animate-fadeIn animation-delay-300">
          {t("hero.subtitle")}
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 animate-fadeIn animation-delay-500">
          <button
            onClick={() => scrollToSection("about")}
            className="w-full sm:w-auto px-8 py-3 bg-white text-[#FF0000] rounded-lg transition-all duration-300 "
          >
            {t("hero.discoverMore")}
          </button>
          <button
            onClick={() => scrollToSection("contactwithus")}
            className="w-full sm:w-auto px-8 py-3 border-2 border-white rounded-lg hover:bg-white hover:text-[#FF0000] transition-all duration-300"
          >
            {t("hero.connect")}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Hero;

import { useTranslation } from "react-i18next"; // Add this import
import ImageGallery from "./ImageGallery";
import PrintMedia from "./PrintMedia";

const GlimpsesSection = () => {
  const { t } = useTranslation(); // Add translation hook

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl mb-10 text-center font-semibold w-full relative inline-block after:block after:w-20 after:h-1 after:bg-[#6E0000] after:mx-auto after:mt-2">
            {t("glimpses.sectionTitle")}
          </h2>
          <p className="mx-auto max-w-4xl text-center text-[#6E0000]">
            {t("glimpses.paragraph1.beforeHighlight")}{" "}
            <span className="text-[#6E0000]">{t("glimpses.paragraph1.highlight")}</span>
            {t("glimpses.paragraph1.afterHighlight")}
          </p>
          <p className="mx-auto mt-2 max-w-4xl text-center text-[#6E0000]">
            {t("glimpses.paragraph2")}
          </p>
          <div className="text-center mt-5 flex justify-center">
            {/* <button className="group relative overflow-hidden bg-gradient-to-r from-[#B82A1E] to-[#8a1f16] text-white font-medium py-2 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-sm flex items-center gap-1">
              {t("common.seeAll")} →
            </button> */}
          </div>
        </div>

        {/* Image Gallery */}
        <ImageGallery />

        {/* Print Media Section */}
        <PrintMedia />
      </div>
    </section>
  );
};

export default GlimpsesSection;

import TalksCarousel from "./TalksCarousel";
import { useTranslation } from "react-i18next";

const InstitutionalTalks = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-5">
      <div className="mb-12 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-10 w-full relative inline-block after:block after:rounded-xl after:w-20 after:h-1 after:bg-[#6E0000] after:mx-auto after:mt-2">
          {t("institutionalTalks.sectionTitle")}
        </h2>

        {/* Centered paragraphs */}
        <div className="max-w-5xl mx-auto space-y-2">
          <p className="text-lg text-[#6E0000]">{t("institutionalTalks.paragraph1")}</p>
          <p className="text-lg text-[#6E0000]">{t("institutionalTalks.paragraph2")}</p>
          <p className="text-lg text-[#6E0000]">{t("institutionalTalks.paragraph3")}</p>
        </div>
      </div>

      <TalksCarousel />
    </div>
  );
};

export default InstitutionalTalks;

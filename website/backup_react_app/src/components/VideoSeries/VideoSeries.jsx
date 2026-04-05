import VideoCarousel from "./VideoCarousel";
import { ArrowUpRight } from 'lucide-react';
import { useNavigate } from "react-router-dom"; // Add this import
import { useTranslation } from "react-i18next"; // Add this import

const VideoSeries = () => {
  const { t } = useTranslation(); // Add translation hook
  const navigate = useNavigate(); // Initialize navigate function

  return (
    <div className="px-4 sm:px-6 py-8 sm:py-16  mb-4">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl mb-10 text-center w-full relative text-black font-semibold inline-block after:block md:after:w-80 after:w-32 after:h-1 after:bg-[#6E0000] after:mx-auto after:mt-2">
          {t("videoSeries.sectionTitle")}
        </h2>
        <div className="flex flex-col items-center text-center">
          <p className="text-lg sm:text-xl text-[#6E0000] mb-6">{t("videoSeries.introText")}</p>
          <div className="flex flex-col sm:flex-col gap-6 mb-8 max-w-3xl">
            <p className="text-base sm:text-lg text-[#6E0000] ">
              {t("videoSeries.paragraph1.beforeHighlight")}{" "}
              <span className="text-[#6E0000] font-semibold">
                {t("videoSeries.paragraph1.highlight")}
              </span>
              {t("videoSeries.paragraph1.afterHighlight")}
            </p>
            <p className="text-base sm:text-lg text-[#6E0000]">{t("videoSeries.paragraph2")}</p>
          </div>
        </div>

      </div>

      {/* Wrapper to control overflow */}
      <div className=" container overflow-hidden px-0">
        <VideoCarousel />
      </div>

      <div className="mt-8 sm:mt-12 text-center text-lg sm:text-xl text-[#6E0000] italic px-4">
        {t("videoSeries.quote")}
         <div className="flex items-center  justify-center mt-6 space-x-0">
                {/* Main red pill button */}
                <button onClick={() => navigate("/video-series")} className="bg-[#6E0000] hover:shadow-xl
  transform transition-all duration-500 ease-in-out
  hover:-translate-y-1 text-white px-8 py-2 rounded-full font-medium">
                    View  More videos
                </button>

                {/* Arrow inside a circle */}
                <span className="w-10 h-10 flex items-center hover:shadow-xl
  transform transition-all duration-500 ease-in-out
  hover:-translate-y-1 justify-center rounded-full bg-[#6E0000] text-white">
                    <ArrowUpRight className="w-5 h-5" />
                </span>
            </div>
      </div>
    </div>
  );
};

export default VideoSeries;

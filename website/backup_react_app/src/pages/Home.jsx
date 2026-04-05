import { useTranslation } from "react-i18next";
import Hero from "../components/Hero/Hero";
import PodcastSection from "../components/PodcastSection/PodcastSection";
import JourneySection from "./../components/Journey/JourneySection";
import GlimpsesSection from "../components/Glimpses/GlimpsesSection";
import InstitutionalTalks from "../components/InstitutionalAndBooks/InstitutionalTalks";
import Books from "../components/InstitutionalAndBooks/Books";
import VideoSeries from "../components/VideoSeries/VideoSeries";
import { useNavigate } from "react-router-dom";
import SpiritualContactSection from "../components/SpiritualContactSection";
import SocialInitiativePage from "../components/SocialInitative";
import FaqSection from "../components/FaqSection";
import { ArrowUpRight } from "lucide-react";
import MonasticOrderPage from "../components/MonasticOrder";
import BlogSection from "../components/BlogSection";
import EventsSection from "../components/EventSection";

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const faqData = [
    {
      id: "q1_en",
      category: "spiritual",
      question: "Who is Swami Avdheshanand Giri Ji Maharaj?",
      answer:
        "Swami Ji is the Acharya Mahamandaleshwar of Juna Akhara and President of the Hindu Dharma Acharya Sabha. He is a globally respected spiritual leader, Vedanta scholar, humanitarian, and guide to millions of seekers.",
    },
    {
      id: "q2_en",
      category: "spiritual",
      question: "What is Avdheshanandgmission (AGM)?",
      answer:
        "AGM (Avdheshanandgmission, India) is a spiritual and social organization founded under Swami Ji’s guidance. Its aim is to spread Vedantic wisdom and serve humanity through education, healthcare, rural development, and spiritual upliftment.",
    },
    {
      id: "q3_en",
      category: "community",
      question: " How can I attend Swami Ji’s satsangs and discourses?",
      answer:
        "You may join Swami Ji’s live discourses at ashrams and events listed in the Schedule section. His teachings are also broadcast on Sanskar, Aastha TV, YouTube, and the official Swami Ji App.",
    },
    {
      id: "q4_en",
      category: "spiritual",
      question: "Where are Swami Ji’s ashrams located?",
      answer:
        "Swami Ji has established several ashrams in India, run under different charitable trusts. The prominent ashrams are located in Haridwar (Kankhal) and Ambala (Haryana), serving as centers for satsangs, seva, and spiritual learning.",
    },
    {
      id: "q5_en",
      category: "spiritual",
      question: "How can I contribute to Swami Ji’s mission?",
      answer:
        "You can support AGM (Avdheshanandgmission, India) through donations or volunteering. All contributions help sustain Swami Ji’s vision of seva (service) and spiritual upliftment.",
    },
    {
      id: "q6_en",
      category: "events",
      question: "How can I meet Swami Ji personally?",
      answer:
        "Appointments can be requested through official channels. The seva teams managing his ashrams and trusts review requests and confirm availability when possible.",
    },
  ];

  return (
    <>
      <Hero />
      <PodcastSection />
      {/* About Section */}
      <section id="about" className="pt-10 pb-20 relative bg-white overflow-hidden">
        {/* Background patterns - visible behind content */}
        <div className="absolute -left-12 top-28 -translate-y-1/2 rotate-[220deg] z-0 opacity-65">
          <img
            src="/newassets/aboutleft.png"
            alt=""
            className="h-[30vh] sm:h-[40vh] lg:h-[40vh] object-contain opacity-80"
            aria-hidden="true"
          />
        </div>

        <div className="absolute right-0 top-1/2 -translate-y-1/2 rotate-90 z-0 opacity-65">
          <img
            src="/newassets/aboutright.png"
            alt=""
            className="h-[40vh] sm:h-[50vh] lg:h-[50vh] object-contain opacity-80"
            aria-hidden="true"
          />
        </div>

        {/* Content container */}
        <div className="relative z-10">
          {/* Section Title */}
          <h1
            className="text-2xl sm:text-3xl lg:text-4xl mb-4 sm:mb-6 lg:mb-8 text-center w-full font-semibold inline-block
    after:block after:w-32 after:sm:w-36 after:lg:w-44 after:h-1 after:bg-[#6E0000] after:rounded-full after:mx-auto after:mt-2"
          >
            {t("about.sectionTitle")}
          </h1>

          {/* Main content container */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Flex layout - responsive direction change */}
            <div className="flex flex-col lg:flex-row lg:gap-x-8 xl:gap-x-12 items-center">
              {/* Text content section */}
              <div className="flex-1 w-full lg:max-w-none mt-6 sm:mt-8 lg:mt-0 order-2 lg:order-1">
                {/* Quote block */}
                <div className="p-4 sm:p-6 lg:p-8 rounded-lg mb-4 sm:mb-6">
                  <blockquote className="text-lg sm:text-xl md:text-2xl lg:text-3xl italic font-medium text-gray-700 mb-3 sm:mb-4 leading-relaxed">
                    {t("about.quotee.text")}
                  </blockquote>
                  <p className="text-right text-[#B82A1E] font-semibold text-sm sm:text-base">
                    {t("about.quoteAuthor")}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex justify-center lg:justify-start items-center pl-12">
                  {/* Primary CTA button */}
                  <button
                    onClick={() => navigate("/about")}
                    className="group relative overflow-hidden bg-[#6E0000]
              text-white font-medium py-2.5 px-8 sm:py-3 sm:px-10 lg:px-12 
              rounded-full shadow-lg hover:shadow-xl
              transition-all duration-300 transform hover:-translate-y-1
              text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#6E0000] focus:ring-offset-2"
                  >
                    <span className="relative">{t("common.viewMore")}</span>
                  </button>
                  {/* Secondary arrow button */}
                  <button
                    onClick={() => navigate("/about")}
                    className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 
              rounded-full bg-[#6E0000] text-white shadow-lg hover:shadow-xl 
              transition-all duration-300 transform hover:-translate-y-1
              focus:outline-none focus:ring-2 focus:ring-[#6E0000] focus:ring-offset-2"
                  >
                    <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>

              {/* Image section */}
              <div className="flex-1 w-full flex justify-center order-1 lg:order-2 mb-6 lg:mb-0">
                <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl">
                  <div className="rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
                    <img
                      src="/assets/Prabhushree ji 01_.webp"
                      alt={t("about.swamiImageAlt")}
                      className="object-cover object-top w-full h-auto"
                      style={{
                        aspectRatio: "16/10",
                        minHeight: "280px",
                      }}
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="teachings" className="py-20 bg-[#f8f5f2] text-center relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 w-full h-full z-0 opacity-25">
          <img
            src="/newassets/coreteachingbg.png"
            alt=""
            className="w-full h-full object-cover"
            aria-hidden="true"
          />
        </div>

        {/* Content container */}
        <div className="container mx-auto px-4 min-w-[320px] relative z-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl mb-4 relative font-semibold inline-block after:block after:w-20 after:h-1 after:bg-[#6E0000] after:mx-auto after:mt-2">
            {t("teachings.sectionTitle")}
          </h2>
          <p className="mb-10 text-xl text-[#6E0000]">{t("teachings.sectionDescription")}</p>

          {/* Grid images with text */}
          <div className="grid gap-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                image: "/newassets/meditation.webp",
                titleKey: "meditation",
              },
              {
                image: "/newassets/vedant.webp",
                titleKey: "vedanta",
              },
              {
                image: "/newassets/conscious.webp",
                titleKey: "consciousLiving",
              },
              {
                image: "/newassets/service.webp",
                titleKey: "compassionateService",
              },
            ].map(({ image, titleKey }) => (
              <div key={titleKey} className="flex flex-col items-center text-center">
                {/* Rounded image */}
                <img
                  src={image}
                  alt={t(`teachings.${titleKey}.title`)}
                  className=" w-72 h-72 object-cover rounded-2xl mb-4"
                />

                {/* Text below image */}
                <h3 className="text-xl text-[#6E0000] font-semibold mb-2">
                  {t(`teachings.${titleKey}.title`)}
                </h3>
                <p className=" text-[#785303] max-w-xs">{t(`teachings.${titleKey}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MonasticOrderPage />

      <JourneySection />
      <SocialInitiativePage />
      <GlimpsesSection />
      <BlogSection />
      <div className="relative flex flex-col">
        <div className="relative">
          <InstitutionalTalks />
        </div>
        <div className="relative mt-16">
          <Books />
        </div>
      </div>

      <VideoSeries />

      {/* Events Section Component */}
      <EventsSection />

      {/* Contact Section */}
      <SpiritualContactSection />

      <FaqSection faqData={faqData} />
    </>
  );
};

export default Home;

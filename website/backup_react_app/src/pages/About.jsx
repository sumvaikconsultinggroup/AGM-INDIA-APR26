import { useEffect } from "react";
import { useLocation as useReactRouterLocation } from "react-router-dom";
import Location from "../components/Location/Location";
import { useTranslation } from "react-i18next";
import SpiritualTab from "../components/SpritualTab";
import SpiritualJourney from "../components/SpritualJourney";

const About = () => {
  const { t } = useTranslation();
  const location = useReactRouterLocation();
  const { sectionId, tabId } = location.state || {};

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
    <div  className="overflow-x-hidden">
      {/* Simple Hero Banner - No Parallax */}
      <div id="aboutTop" className="relative h-[60vh] overflow-hidden flex items-center justify-center">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "",
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
          }}
        />

        {/* Red Overlay - Semi-transparent */}
        <div className="absolute inset-0 bg-[#7B0000] z-10"></div>

        {/* Content */}
        <div className="relative z-20 text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-serif mb-4">{t("about.hero.title")}</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto font-light">
            {t("about.hero.subtitle")}
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16 overflow-x-hidden">
        {/* Alternating Content Section - Responsive */}
        <section className="py-8 md:py-16 relative bg-white overflow-hidden">
          {/* Background Pattern - Top Left - Hidden on mobile */}
          <div className="absolute top-24 left-0 w-40 md:w-60 h-40 md:h-60 rotate-[200deg] -translate-x-1/3 -translate-y-1/4 opacity-30 md:opacity-50 hidden sm:block">
            <img
              src="/newassets/aboutleft.png"
              alt=""
              className="w-full h-full object-contain"
              aria-hidden="true"
            />
          </div>

          {/* Background Pattern - Bottom Right - Hidden on mobile */}
          <div className="absolute bottom-20 md:bottom-52 right-0 rotate-90 w-40 md:w-80 h-40 md:h-80  translate-x-1/3 translate-y-1/4 opacity-30 md:opacity-50 hidden sm:block">
            <img
              src="/newassets/aboutright.png"
              alt=""
              className="w-full h-full object-contain"
              aria-hidden="true"
            />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            {/* Section Heading */}
            <div className="text-center mb-8 md:mb-16">
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-semibold text-black mb-4 inline-block relative
                after:content-[''] after:block after:w-16 sm:after:w-20 md:after:w-24 after:h-1 after:bg-[#6E0000] after:mx-auto after:mt-2"
              >
                {t("section.title", "About Gurudev (Aacharya)")}
              </h2>
            </div>

            {/* First Row - Image left, Text right on desktop / Stacked on mobile */}
            <div className="flex flex-col lg:flex-row items-center mb-12 md:mb-24 gap-6 md:gap-8">
              {/* Image - Full width on mobile, 60% on desktop */}
              <div className="w-full lg:w-[60%] relative">
                <div className="rounded-xl overflow-hidden shadow-lg">
                  <img
                    src="/assets/swamiji-modi.jpg"
                    alt={t("section.firstRow.imageAlt", "Spiritual teaching session")}
                    className="w-full h-auto object-top object-center object-cover"
                    style={{ aspectRatio: "16/9" }}
                  />
                </div>
              </div>

              {/* Text - Full width on mobile, 40% on desktop */}
              <div className="w-full lg:w-[40%] p-2 md:p-4">
                <h3 className="text-xl sm:text-2xl font-semibold text-[#6E0000] mb-3 md:mb-4">
                  {t("section.firstRow.title", "PRABHU PREMI SANGH - A SPIRITUAL ORGANISATION")}
                </h3>
                <p className="text-sm sm:text-lg text-[#6E0000] mb-3 md:mb-4 leading-relaxed">
                  {t(
                    "section.firstRow.paragraph1",
                    `
PRABHU PREMI SANGH is the emanation of the divine dream of HIS HOLINESS SWAMl AVDHESHANAND GIRI. It has been founded and is being directed by Him. Guided by the six underlying principles of Seva (Selfless service), Satsang (Companionship of the holy), Svadhyay (Study of scriptures), Saiyyam (Self-discipline), Sadhana (Spiritual practice), and Svatma-Utthaan (Self-evolvement), Prabhu Premi Sangh is a social and spiritual organization dedicated towards the spiritual evelation of mankind and selfless service to the global community.`
                  )}
                </p>
                {/* <p className="text-sm sm:text-base text-[#6E0000] leading-relaxed">
                  {t(
                    "section.firstRow.paragraph2",
                    "Our approach focuses on the inner transformation that leads to outer harmony. Through meditation, self-inquiry, and conscious living, we cultivate awareness that naturally expresses itself in compassionate action."
                  )}
                </p> */}
              </div>
            </div>

            {/* Second Row - Text left, Image right on desktop / Stacked on mobile */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-6 md:gap-8">
              {/* Image - Full width on mobile, 40% on desktop */}
              <div className="w-full lg:w-[40%] relative">
                <div className="rounded-xl overflow-hidden shadow-lg h-64 sm:h-80 md:h-[450px] lg:h-[450px]">
                  <img
                    src="/newassets/SwamiJi.png"
                    alt={t("section.secondRow.imageAlt", "Community service initiative")}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Text - Full width on mobile, 60% on desktop */}
              <div className="w-full lg:w-[60%] p-2 md:p-4">
                <p className="text-sm sm:text-lg text-[#6E0000] mb-3 md:mb-4 leading-relaxed">
                  {t(
                    "section.secondRow.paragraph1",
                    `
The major objectives of Prabhu Premi Sangh are to spread the message of tolerance towards all religions, to instill a sense of service to mankind, to endorse the rich knowledge embedded in the ancient Indian scriptures and replenish peace and bliss through regular spiritual discourses. Prabhu Premi Sangh has grown into a huge banyan tree and disseminated its branches all over the country and abroad. 
PRABHU PREMI SANGH has been divided into five major zones; East, West, South, North and Central India for administrative convenience. Several branches of Prabhu Premi Sangh proliferated throughout the country are focused at achieving the objectives as laid down and guided by HIS HOLINESS SWAMl AVDHESHANAND GIRI.`
                  )}
                </p>
                {/* <p className="text-sm sm:text-base text-[#6E0000] leading-relaxed">
                  {t(
                    "section.secondRow.paragraph2",
                    "Through various humanitarian initiatives, educational programs, and community support projects, we put spiritual principles into practice. This path of compassionate action creates positive change while deepening our own spiritual growth."
                  )}
                </p> */}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial/Quote Section */}
        <div className="relative my-8 md:my-16 py-8 md:py-16 overflow-hidden rounded-xl mx-4 md:mx-0">
          <div className="absolute inset-0">
            <img
              src="/newassets/AbouteQuote.png"
              alt="Background"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative max-w-4xl mx-auto px-4 text-center">
            <blockquote className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-serif text-[#6E0000] italic mb-4 md:mb-6 leading-relaxed">
              {t("about.quotee.text")}
            </blockquote>
            <div className="h-0.5 w-24 sm:w-32 bg-[#FFB71B] mx-auto mb-2"></div>
            <p className="text-sm md:text-base text-[#6E0000] font-medium">
              {t("about.quotee.author")}
            </p>
          </div>
        </div>

        {/* About Section */}
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center md:justify-start mb-3 md:mb-6">
            <h2 className="text-2xl sm:text-3xl   lg:text-4xl font-serif text-black ">
              {t("about.temple.title")}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-10 items-center mb-16">
            <div className=" text-center md:text-left">
              <p className="text-[#6E0000] leading-relaxed mb-4">{t("about.temple.paragraph1")}</p>
              <p className="text-[#6E0000] leading-relaxed mb-4">{t("about.temple.paragraph2")}</p>
              <p className="text-[#6E0000] leading-relaxed">{t("about.temple.paragraph3")}</p>
            </div>
            <div className="relative">
              {/* Image - uncommented and made bigger */}
              <div className="relative h-96 w-full overflow-hidden rounded-lg shadow-lg z-10">
                <img
                  src="/assets/Temple.jpg"
                  alt={t("about.temple.imageAlt")}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Values */}
        <div className="bg-[#fcf9f5] text-2xl sm:text-3xl lg:text-4xl p-4 sm:p-6 md:p-8 lg:p-12  md:my-16 relative overflow-hidden">
          {/* Pattern on left side - hidden on mobile for better readability */}
          <div className="absolute inset-y-0 left-0 hidden md:flex items-center">
            <img
              src="/newassets/missionPattern.png"
              alt="pattern"
              className="h-full object-contain"
            />
          </div>

          <div className="max-w-4xl mx-auto relative z-10">
            <div className="flex justify-center items-center mb-6 md:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-black text-center px-4">
                {t("about.mission.sectionTitle")}
              </h2>
            </div>

            <div className="grid md:grid-cols-1 gap-6 md:gap-10">
              <div className="text-center px-2">
                <p className="text-[#6E0000] leading-relaxed mb-4 text-sm sm:text-base">
                  {t("about.mission.paragraph1")}
                </p>
                <p className="text-[#6E0000] leading-relaxed text-sm sm:text-base">
                  {t("about.mission.paragraph2")}
                </p>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl text-center font-serif text-black mb-2 px-4">
                  {t("about.values.title")}
                </h3>
                <div className="w-16 sm:w-24 h-1 bg-[#FFB71B] mx-auto rounded-xl mb-4 sm:mb-6"></div>

                {/* Mobile: Stack vertically, Tablet+: Show horizontally */}
                <ul className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 md:gap-8 px-4">
                  {[
                    { img: "/newassets/baby.png", text: t("about.values.compassion") },
                    { img: "/newassets/books.png", text: t("about.values.enlightenment") },
                    { img: "/newassets/lotus.png", text: t("about.values.wisdom") },
                    { img: "/newassets/heart.png", text: t("about.values.community") },
                  ].map((value, index) => (
                    <li
                      key={index}
                      className="flex flex-row sm:flex-col items-center justify-start sm:justify-center text-left sm:text-center gap-3 sm:gap-0"
                    >
                      <div className="mb-0 sm:mb-2 flex-shrink-0">
                        <img
                          src={value.img}
                          alt={value.text}
                          className="w-10 h-10 sm:w-12 sm:h-12 mx-auto"
                        />
                      </div>
                      <span className="text-[#6E0000] text-sm sm:text-base flex-1 sm:flex-initial">
                        {value.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <SpiritualTab initialTab={tabId} />

        {/* <SpiritualJourney /> */}
      </div>

      {/* Location Component */}
      {/* <Location /> */}
    </div>
  );
};

export default About;

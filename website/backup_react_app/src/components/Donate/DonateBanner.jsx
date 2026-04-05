import { Heart, Users, Globe, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import FaqSection from "../../components/FaqSection";

const DonateBanner = () => {
  const { t } = useTranslation();

  const faqData = [
    {
      id: "q1_en",
      category: "spiritual",
      question: "How will my donation be used?",
      answer:
        " Donations to AGM (Avdheshanandgmission, India) directly support education, healthcare, food distribution, rural development, environmental projects, and spiritual activities guided by Swami Ji.",
    },
    {
      id: "q2_en",
      category: "spiritual",
      question: "Is my donation tax-deductible?",
      answer:
        "Yes 🙏 Donations made to AGM (Avdheshanandgmission, India) are eligible for tax exemption under Section 80G of the Income Tax Act.",
    },
    {
      id: "q3_en",
      category: "community",
      question: "Can I donate from outside India?",
      answer:
        " Yes. AGM (Avdheshanandgmission, India) accepts international donations through authorized gateways. Kindly use only the official website or verified accounts to donate.",
    },
    {
      id: "q4_en",
      category: "spiritual",
      question: " Will I receive a receipt for my donation?",
      answer:
        " Yes 🌸 An official receipt is issued for every donation. For Indian donors, the receipt also carries the 80G exemption details.",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Why Donate Section */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <div className="w-1.5 h-12 bg-gradient-to-b from-[#B82A1E] to-[#8a1f16] mr-4 rounded-full"></div>
          <h2 className="text-3xl md:text-4xl font-serif text-[#5D4037]">
            {t("donate.whySupport.title")}
          </h2>
        </div>

        <div className="text-[#5D4037]/80 space-y-4 mb-12">
          <p className="leading-relaxed">{t("donate.whySupport.paragraph1")}</p>
          <p className="leading-relaxed">{/* {t("donate.whySupport.paragraph2")} */}</p>
        </div>
      </div>

      {/* Impact of Your Donation */}
      <div className="bg-[#fcf9f5] rounded-2xl p-8 md:p-12 my-16 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 text-[#B82A1E]/5 text-[200px] font-serif">ॐ</div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-center mb-8">
            <div className="w-1.5 h-12 bg-gradient-to-b from-[#B82A1E] to-[#8a1f16] mr-4 rounded-full"></div>
            <h2 className="text-3xl md:text-4xl font-serif text-[#5D4037]">
              {t("donate.impact.title")}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-[#B82A1E]/10 rounded-full flex items-center justify-center mb-4">
                <Heart className="text-[#B82A1E]" />
              </div>
              <h3 className="font-serif text-xl text-[#5D4037] mb-2">
                {t("donate.impact.preserve.title")}
              </h3>
              <p className="text-[#5D4037]/70 text-sm">{t("donate.impact.preserve.description")}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-[#B82A1E]/10 rounded-full flex items-center justify-center mb-4">
                <Users className="text-[#B82A1E]" />
              </div>
              <h3 className="font-serif text-xl text-[#5D4037] mb-2">
                {t("donate.impact.community.title")}
              </h3>
              <p className="text-[#5D4037]/70 text-sm">
                {t("donate.impact.community.description")}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-[#B82A1E]/10 rounded-full flex items-center justify-center mb-4">
                <Globe className="text-[#B82A1E]" />
              </div>
              <h3 className="font-serif text-xl text-[#5D4037] mb-2">
                {t("donate.impact.outreach.title")}
              </h3>
              <p className="text-[#5D4037]/70 text-sm">{t("donate.impact.outreach.description")}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-[#B82A1E]/10 rounded-full flex items-center justify-center mb-4">
                <Star className="text-[#B82A1E]" />
              </div>
              <h3 className="font-serif text-xl text-[#5D4037] mb-2">
                {t("donate.impact.transform.title")}
              </h3>
              <p className="text-[#5D4037]/70 text-sm">
                {t("donate.impact.transform.description")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Dharma Section */}
      <div className="max-w-4xl mx-auto my-16">
        <div className="flex items-center mb-8">
          <div className="w-1.5 h-12 bg-gradient-to-b from-[#B82A1E] to-[#8a1f16] mr-4 rounded-full"></div>
          <h2 className="text-3xl md:text-4xl font-serif text-[#5D4037]">
            {t("donate.saveDharma.title")}
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-[#5D4037]/80 leading-relaxed mb-4">
              {t("donate.saveDharma.paragraph1")}
            </p>
            <p className="text-[#5D4037]/80 leading-relaxed mb-4">
              {t("donate.saveDharma.paragraph2")}
            </p>
          </div>
          <div className="relative">
            <div className="relative h-80 w-full overflow-hidden rounded-lg shadow-lg">
              <img
                src="/newassets/swamijiabout.jpg"
                alt={t("donate.acharyaTeachingAlt")}
                className="object-cover w-full h-full object-top"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 h-24 w-24 border-4 border-[#B82A1E]/20 rounded-lg -z-10"></div>
            <div className="absolute -top-4 -left-4 h-24 w-24 border-4 border-[#B82A1E]/20 rounded-lg -z-10"></div>
          </div>
        </div>

        <FaqSection faqData={faqData} />
      </div>
    </div>
  );
};

export default DonateBanner;

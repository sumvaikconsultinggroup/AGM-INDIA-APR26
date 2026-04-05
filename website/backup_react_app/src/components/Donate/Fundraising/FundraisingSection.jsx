import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // Import Link
import { Landmark, Globe, BookOpen, Loader } from "lucide-react";
import FundraisingCard from "./FundraisingCard";
import { useTranslation } from "react-i18next"; // Add translation hook

// Icon mapping to dynamically assign icons based on campaign title or other properties
const getIconForCampaign = (campaign) => {
  const title = campaign.title.toLowerCase();

  if (title.includes("book") || title.includes("publishing")) {
    return <BookOpen className="text-[#B82A1E]" size={24} />;
  } else if (title.includes("mission") || title.includes("spread")) {
    return <Globe className="text-[#B82A1E]" size={24} />;
  } else {
    // Default icon or based on other conditions
    return <Landmark className="text-[#B82A1E]" size={24} />;
  }
};

const FundraisingSection = () => {
  const { t } = useTranslation(); // Add translation hook

  const [fundraisingData, setFundraisingData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fallback data in case API fails - moved inside component to access translation
  // const fallbackData = [
  //   {
  //     id: 1,
  //     title: t("fundraising.workspace.title"),
  //     backgroundImage:
  //       "https://images.unsplash.com/photo-1580894894513-541e068a3e2b?auto=format&fit=crop&q=80&w=800",
  //     achieved: 84443.5,
  //     goal: 200000,
  //     donors: 1181,
  //     daysLeft: 3,
  //     description: t("fundraising.workspace.description"),
  //     additionalText: t("fundraising.workspace.additionalText"),
  //     icon: <Landmark className="text-[#B82A1E]" size={24} />,
  //   },
  //   {
  //     id: 2,
  //     title: t("fundraising.mission.title"),
  //     backgroundImage:
  //       "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800",
  //     achieved: 13576.05,
  //     goal: 100000,
  //     donors: 814,
  //     daysLeft: 3,
  //     description: t("fundraising.mission.description"),
  //     additionalText: t("fundraising.mission.additionalText"),
  //     icon: <Globe className="text-[#B82A1E]" size={24} />,
  //   },
  //   {
  //     id: 3,
  //     title: t("fundraising.books.title"),
  //     backgroundImage:
  //       "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=800",
  //     achieved: 153959,
  //     goal: 1000000,
  //     donors: 47,
  //     daysLeft: 3,
  //     description: t("fundraising.books.description"),
  //     bulletPoints: t("fundraising.books.bulletPoints", { returnObjects: true }),
  //     icon: <BookOpen className="text-[#B82A1E]" size={24} />,
  //   },
  // ];

  useEffect(() => {
    const fetchFundraisingData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(import.meta.env.VITE_APP_DONATE_API_URL);

        if (response.data && response.data.success && response.data.data) {
          // Transform the API data to match our component's expected format
          const transformedData = response.data.data.map((campaign) => {
            // Calculate days left based on totalDays and createdAt
            const createdDate = new Date(campaign.createdAt);
            const currentDate = new Date();
            const daysPassed = Math.floor((currentDate - createdDate) / (1000 * 60 * 60 * 24));
            const daysLeft = Math.max(0, campaign.totalDays - daysPassed);

            return {
              id: campaign._id,
              title: campaign.title,
              backgroundImage: campaign.backgroundImage,
              achieved: campaign.achieved,
              goal: campaign.goal,
              donors: campaign.donors,
              daysLeft: daysLeft,
              description: campaign.description,
              additionalText: campaign.additionalText,
              // Dynamically determine icon based on campaign properties
              icon: getIconForCampaign(campaign),
              // Add any other properties your component needs
              bulletPoints: campaign.bulletPoints || [],
              isActive: campaign.isActive,
            };
          });

          // Only show active campaigns
          const activeCampaigns = transformedData.filter((campaign) => campaign.isActive);
          setFundraisingData(activeCampaigns);
        } else {
          throw new Error("Invalid data structure in API response");
        }
      } catch (err) {
        console.error("Error fetching fundraising data:", err);
        setError(t("fundraising.errors.fetchFailed"));
        // Use fallback data if API fails
        setFundraisingData(fallbackData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFundraisingData();
  }, [t]); // Re-fetch when language changes

  return (
    <section className="bg-[#fcf9f5] py-16 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 text-[#B82A1E]/5 text-[200px] font-serif">ॐ</div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Heading Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center mb-8">
            <div className="w-1.5 h-12 bg-gradient-to-b from-[#B82A1E] to-[#8a1f16] mr-4 rounded-full"></div>
            <h2 className="text-3xl md:text-4xl font-serif text-[#5D4037]">
              {t("fundraising.sectionTitle")}
            </h2>
          </div>

          <p className="text-[#5D4037]/80 leading-relaxed">{t("fundraising.sectionDescription")}</p>
        </div>

        {/* Loading/Error States */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="animate-spin h-8 w-8 text-[#B82A1E]" />
            <span className="ml-3 text-[#5D4037]">{t("fundraising.loading")}</span>
          </div>
        ) : error ? (
          <div className="max-w-4xl mx-auto text-center py-6 px-4 bg-red-50 rounded-lg text-red-700">
            {error}
          </div>
        ) : fundraisingData.length === 0 ? (
          <div className="max-w-4xl mx-auto text-center py-12 text-[#5D4037]">
            <p>{t("fundraising.noCampaigns")}</p>
          </div>
        ) : (
          // Cards Grid - Aligned with heading
          <div className="max-w-5xl mx-auto">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {fundraisingData.map((card) =>
                // Wrap FundraisingCard with a Link
                <Link to={`/donate-form?campaignId=${card.id}`} key={card.id}>
                  <FundraisingCard {...card} />
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Support Button */}
        {/* <div className="max-w-4xl mx-auto text-center mt-12">
          <a
            href="#donate-form"
            className="px-6 py-3 bg-[#B82A1E] text-white rounded-lg hover:bg-[#9a231a] transition-colors inline-flex items-center"
          >
            {t("fundraising.supportButton")}
          </a>
        </div> */}
      </div>
    </section>
  );
};

export default FundraisingSection;

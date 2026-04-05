import { useState, useEffect } from "react";
import PodcastCard from "./PodcastCard";
import axios from "axios";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next"; // Add this import

const PodcastSection = () => {
  const { t } = useTranslation(); // Add this hook
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Move fetchPodcasts outside useEffect so it can be called from handleRetry
  const fetchPodcasts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(import.meta.env.VITE_APP_PODCASTS_API);

      if (response.data && Array.isArray(response.data.data)) {
        // Format the data to match our component needs
        const formattedPodcasts = response.data.data
          .map((podcast) => ({
            id: podcast._id || podcast.id,
            title: podcast.title || t("common.untitledPodcast"),
            // Add thumbnail with fallbacks in the right order
            thumbnail:
              podcast.thumbnail ||
              podcast.coverImage ||
              podcast.image ||
              "assets/Podcast/podcast-placeholder.jpg",
            // Add coverImage field explicitly
            coverImage:
              podcast.coverImage ||
              podcast.thumbnail ||
              podcast.image ||
              "/assests/placeHolders/podcastsThumbnail.jpg",
            // Use videoUrl with fallbacks
            videoUrl: podcast.videoUrl || podcast.url || "",
            // Add date fields for sorting
            createdAt:
              podcast.createdAt || podcast.publishedAt || podcast.date || new Date().toISOString(),
            updatedAt: podcast.updatedAt || podcast.modifiedAt || podcast.lastModified,
          }))
          .sort((a, b) => {
            // Sort by createdAt date in descending order (newest first)
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB - dateA;
          })
          .slice(0, 6); // Limit to 6 podcasts for the section after sorting

        setPodcasts(formattedPodcasts);
      } else {
        throw new Error(t("errors.invalidData"));
      }
    } catch (err) {
      console.error(t("errors.failedToFetchPodcasts"), err);
      setError(t("errors.failedToLoadPodcasts"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    // Now this function can be accessed
    setTimeout(() => {
      setLoading(false);
      fetchPodcasts();
    }, 4000); // Simulate a delay for loading state
  };

  const handlePodcastClick = (podcast) => {
    if (podcast.videoUrl) {
      window.open(podcast.videoUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="bg-[#FAF6F1] py-16 bottom-6 relative overflow-hidden">
      {/* Background pattern (behind everything) */}
      <div className="absolute inset-0 z-0 opacity-30">
        <img
          src="/newassets/podcastsbg.png"
          alt=""
          className="w-full h-full object-cover"
          aria-hidden="true"
        />
      </div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div className="mb-10 flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            {t("podcasts.sectionTitle")}
          </h2>
          <Link to="/podcasts" className="text-[#6E0000]">
            {t("common.seeAll")} →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-[#8a1f16] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">
                {t("common.loading", { content: t("podcasts.plural") })}
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-10 bg-orange-50 rounded-lg border border-orange-100">
            <svg
              className="mx-auto h-12 w-12 text-[#8a1f16]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              {t("podcasts.notAvailable")}
            </h3>
            <p className="mt-1 text-gray-500 mb-4">
              {t("podcasts.unableToLoad")}
            </p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-[#8a1f16] text-white rounded-lg"
            >
              {t("common.tryAgain")}
            </button>
          </div>
        ) : podcasts.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              {t("podcasts.notAvailable")}
            </h3>
            <p className="mt-1 text-gray-500">{t("podcasts.checkBackSoon")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {podcasts.map((podcast) => (
              <PodcastCard
                key={podcast.id}
                title={podcast.title}
                thumbnail={podcast.thumbnail}
                coverImage={podcast.coverImage}
                onClick={() => handlePodcastClick(podcast)}
              />
            ))}
          </div>
        )}
      </div>
    </div>

  );
};

export default PodcastSection;

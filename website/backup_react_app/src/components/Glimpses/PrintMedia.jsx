import  { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";

const PrintMedia = () => {
  const { t } = useTranslation();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [visibleMediaCount, setVisibleMediaCount] = useState(10); // Start with 10 items
  const [loadingMore, setLoadingMore] = useState(false);
  const retryTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  const MAX_RETRIES = 3;
  const REQUEST_TIMEOUT = 10000; // 10 seconds

  const formatDate = (dateString) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return dateString; // Return original string if parsing fails
      }

      // Format date as "MMM DD, YYYY" (e.g., "Jan 15, 2024")
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.warn("Date parsing error:", error);
      return dateString; // Return original string if formatting fails
    }
  };

  const fetchPrintMedia = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      const response = await axios.get(import.meta.env.VITE_APP_PRINT_MEDIA_API, {
        timeout: REQUEST_TIMEOUT,
        signal: abortControllerRef.current.signal,
      });

      if (response.data && Array.isArray(response.data.data)) {
        const formattedMedia = response.data.data
          .map((item) => ({
            id: item._id || item.id,
            title: item.title || t("printMedia.defaultTitle"),
            image: item.image || item.thumbnail || "/assets/PrintMedia/default.jpg",
            link: item.link || item.url || "#",
            description: item.description || item.summary || "",
            publication: item.publication || "",
            date: item.date || item.publishedAt || item.createdAt || "",
            // Format the display date
            displayDate: formatDate(item.date || item.publishedAt || item.createdAt),
            // Add sorting fields with fallbacks
            createdAt: item.createdAt || item.publishedAt || item.date || new Date().toISOString(),
            updatedAt: item.updatedAt || item.modifiedAt || item.lastModified,
          }))
          .sort((a, b) => {
            // Sort by date in descending order (newest first)
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB - dateA;
          });

        setMedia(formattedMedia);
        setRetryCount(0); // Reset retry count on success
      } else {
        throw new Error(t("errors.invalidDataFormat"));
      }
    } catch (err) {
      // Don't handle error if request was aborted
      if (err.name === "AbortError" || err.code === "ERR_CANCELED") {
        return;
      }

      console.error(t("errors.failedToFetchPrintMedia"), err);
      setError(t("printMedia.error"));
      setMedia([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchPrintMedia();

    // Cleanup function to cancel ongoing requests
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [fetchPrintMedia]);

  // Handle view more functionality
  const handleViewMore = () => {
    setLoadingMore(true);
    // Simulate loading delay for better UX
    setTimeout(() => {
      setVisibleMediaCount((prev) => prev + 8);
      setLoadingMore(false);
    }, 500);
  };

  // Get visible media based on current count
  const visibleMedia = media.slice(0, visibleMediaCount);
  const hasMoreMedia = visibleMediaCount < media.length;

  const handleRetry = () => {
    // Prevent multiple rapid retry attempts
    if (loading) {
      return;
    }

    // Check if max retries reached
    if (retryCount >= MAX_RETRIES) {
      setError(
        t("printMedia.maxRetriesReached") ||
          "Maximum retry attempts reached. Please try again later."
      );
      return;
    }

    // Clear any existing retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    // Increment retry count
    setRetryCount((prev) => prev + 1);

    // Add a delay before retrying to prevent spam
    setLoading(true);
    setError(null);

    retryTimeoutRef.current = setTimeout(() => {
      fetchPrintMedia();
    }, 1000); // 1 second delay before retry
  };

  const handleMediaClick = (link) => {
    if (link && link !== "#") {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="rounded-xl bg-[#0A1121] p-8 text-white">
      <div className="mb-8">
        <h3 className="text-2xl sm:text-3xl lg:text-4xl text-center md:text-left font-bold">{t("printMedia.title")}</h3>
        <p className="mt-2 text-center md:text-left text-gray-300">{t("printMedia.description")}</p>
        {/* <button
          onClick={() => window.open("/print-media", "_self")}
          className="mt-4 text-white hover:text-[#8a1f16] flex items-center"
        >
          {t("common.viewAll")} <ExternalLink size={16} className="ml-1" />
        </button> */}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-orange-300">
              {t("common.loading", { content: t("printMedia.content") })}
              {retryCount > 0 && (
                <span className="block text-sm mt-1">
                  {t("common.retryAttempt") || `Retry attempt ${retryCount}/${MAX_RETRIES}`}
                </span>
              )}
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-6 bg-orange-900/20 rounded-lg">
          <p className="text-orange-300 mb-2">{error}</p>
          {retryCount < MAX_RETRIES ? (
            <button
              onClick={handleRetry}
              disabled={loading}
              className="mt-3 px-4 py-2 bg-[#8a1f16] text-white rounded-md hover:bg-[#8a1f16] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("common.tryAgain")} ({MAX_RETRIES - retryCount}{" "}
              {t("common.attemptsLeft") || "attempts left"})
            </button>
          ) : (
            <div className="mt-3">
              <p className="text-orange-400 text-sm mb-2">
                {t("printMedia.maxRetriesReached") || "Maximum retry attempts reached"}
              </p>
              <button
                onClick={() => {
                  setRetryCount(0);
                  setError(null);
                  fetchPrintMedia();
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                {t("common.resetAndTryAgain") || "Reset and Try Again"}
              </button>
            </div>
          )}
        </div>
      ) : media.length === 0 ? (
        <div className="text-center py-12 bg-orange-900/10 rounded-lg">
          <ExternalLink className="mx-auto h-12 w-12 text-orange-400 mb-2" />
          <p className="text-white text-lg font-medium">{t("printMedia.noContent")}</p>
          <p className="text-gray-400 mt-1">{t("printMedia.checkBackSoon")}</p>
        </div>
      ) : (
        <>
          {/* Media Grid */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {visibleMedia.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-white/10 cursor-pointer"
                onClick={() => handleMediaClick(item.link)}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src = "/assets/PrintMedia/default.jpg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-4">
                  <div>
                    <h4 className="text-sm font-medium text-white line-clamp-2 mb-1">
                      {item.title}
                    </h4>
                    <p className="text-sm text-orange-300">{item.publication}</p>
                    {/* Use formatted date instead of raw date */}
                    <p className="text-xs text-gray-300">{item.displayDate}</p>
                    <div className="mt-2 flex items-center text-xs text-white">
                      <span>{t("printMedia.readArticle")}</span>
                      <ExternalLink size={12} className="ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View More Button */}
          {hasMoreMedia && (
            <div className="text-center mt-8">
              <button
                onClick={handleViewMore}
                disabled={loadingMore}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:hover:scale-100"
              >
                {loadingMore ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t("common.loading", "Loading...")}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {t("printMedia.viewMore", "View More Articles")}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                )}
              </button>
              <p className="text-gray-400 text-sm mt-2">
                {t(
                  "printMedia.showingCount",
                  `Showing ${visibleMediaCount} of ${media.length} articles`
                )}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PrintMedia;

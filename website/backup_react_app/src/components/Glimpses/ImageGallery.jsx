import { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

// Fallback static images
const fallbackImages = [];

const ImageGallery = () => {
  const { t } = useTranslation();
  const [images, setImages] = useState(fallbackImages);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleImagesCount, setVisibleImagesCount] = useState(8); // Start with 8 images
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch images from backend
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_APP_GLIMPSE}`);
        console.info("Fetched images from API:", response.data);

        // Check for correct format and valid data
        if (
          response.data?.success === true &&
          Array.isArray(response.data.data) &&
          response.data.data.length > 0
        ) {
          // Extract image URLs from the data structure
          const validImages = response.data.data
            .filter((item) => !item.isdeleted && item.image)
            .map((item) => item.image);

          if (validImages.length > 0) {
            setImages(validImages);
          } else {
            // Use fallback if no valid images
            console.info("No valid images found in API response, using fallback images");
            setImages(fallbackImages);
          }
        } else {
          // Use fallback if API returns empty array or incorrect format
          console.info("Empty or invalid data received from API, using fallback images");
          setImages(fallbackImages);
        }
      } catch (err) {
        console.error("Failed to fetch gallery images:", err);
        setError(err);
        // Use fallback images on error
        setImages(fallbackImages);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Handle view more functionality
  const handleViewMore = () => {
    setLoadingMore(true);
    // Simulate loading delay for better UX
    setTimeout(() => {
      setVisibleImagesCount((prev) => prev + 8);
      setLoadingMore(false);
    }, 500);
  };

  // Get visible images based on current count
  const visibleImages = images.slice(0, visibleImagesCount);
  const hasMoreImages = visibleImagesCount < images.length;

  // Modal handling functions
  const openModal = (index) => {
    setSelectedImageIndex(index);
    document.body.style.overflow = "hidden";
  };

  const closeModal = (e) => {
    // Only close if clicking directly on the backdrop
    if (e.target === e.currentTarget) {
      setSelectedImageIndex(null);
      document.body.style.overflow = "unset";
    }
  };

  const navigateImage = (direction) => {
    const newIndex = selectedImageIndex + direction;
    if (newIndex >= 0 && newIndex < images.length) {
      setSelectedImageIndex(newIndex);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedImageIndex === null) return;

      if (e.key === "Escape") {
        setSelectedImageIndex(null);
        document.body.style.overflow = "unset";
      } else if (e.key === "ArrowLeft" && selectedImageIndex > 0) {
        navigateImage(-1);
      } else if (e.key === "ArrowRight" && selectedImageIndex < images.length - 1) {
        navigateImage(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedImageIndex, images.length]);

  return (
    <div className="mb-16">
      {loading ? (
        // Loading skeleton
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="aspect-[4/3] rounded-lg overflow-hidden">
              <div className="h-full w-full bg-gray-200 animate-pulse" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-gray-500">{t("gallery.errorLoading")}</p>
          {/* Show fallback grid anyway */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 mt-6">
            {visibleImages.map((image, index) => (
              <div
                key={index}
                className="group relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer"
                onClick={() => openModal(index)}
              >
                <img
                  src={image}
                  alt={`${t("gallery.imageAlt")} ${index + 1}`}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/assets/placeholder-image.jpg";
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
            ))}
          </div>
          {/* View More button for error state */}
          {hasMoreImages && (
            <div className="text-center mt-8">
              <button
                onClick={handleViewMore}
                disabled={loadingMore}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors duration-200"
              >
                {loadingMore ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t("gallery.loading", "Loading...")}
                  </div>
                ) : (
                  t("gallery.viewMore", "View More")
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Main gallery grid */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {visibleImages.map((image, index) => (
              <div
                key={index}
                className="group relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer"
                onClick={() => openModal(index)}
              >
                <img
                  src={image}
                  alt={`${t("gallery.imageAlt")} ${index + 1}`}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/assets/placeholder-image.jpg";
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
            ))}
          </div>

          {/* View More Button */}
          {/* View More Button */}
          {hasMoreImages && (
            <div className="text-center mt-8">
              <button
                onClick={handleViewMore}
                disabled={loadingMore}
                className="bg-[#6E0000] text-white font-medium py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 inline-flex items-center gap-3"
              >
                {loadingMore ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t("gallery.loading", "Loading...")}
                  </div>
                ) : (
                  <>
                    <span>{t("gallery.viewMore", "View More")}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </>
                )}
              </button>

              <p className="text-gray-500 text-sm mt-2">
                {t(
                  "gallery.showingCount",
                  `Showing ${visibleImagesCount} of ${images.length} images`
                )}
              </p>
            </div>
          )}
        </>
      )}

      {/* Modal - Same as original */}
      {selectedImageIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
          onClick={closeModal}
        >
          <div
            className="relative flex items-center justify-center w-[80vw] h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left Arrow */}
            {selectedImageIndex > 0 && (
              <button
                className="absolute left-4 p-2 text-white hover:text-gray-300 transition-colors z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage(-1);
                }}
                aria-label={t("gallery.previous")}
              >
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}

            {/* Image */}
            <img
              src={images[selectedImageIndex]}
              alt={`${t("gallery.imageAlt")} ${selectedImageIndex + 1}`}
              className="w-full h-full object-contain transform transition-transform duration-300 ease-out hover:scale-105"
              style={{ maxWidth: "80vw", maxHeight: "80vh" }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/assets/placeholder-image.jpg";
              }}
            />

            {/* Right Arrow */}
            {selectedImageIndex < images.length - 1 && (
              <button
                className="absolute right-4 p-2 text-white hover:text-gray-300 transition-colors z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage(1);
                }}
                aria-label={t("gallery.next")}
              >
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;

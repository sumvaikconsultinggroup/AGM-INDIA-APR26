import  { useState, useEffect } from "react";
import axios from "axios";
import {  ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const VideoCarousel = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [swiperRef, setSwiperRef] = useState(null);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(import.meta.env.VITE_APP_VIDEO_SERIES_API);

      if (response.data && Array.isArray(response.data.data)) {
        const allVideos = [];

        response.data.data.forEach((playlist) => {
          if (playlist.videos && Array.isArray(playlist.videos)) {
            playlist.videos.forEach((video) => {
              allVideos.push({
                id: video.videoId || Math.random().toString(36).substring(7),
                title: video.title || "Untitled Video",
                thumbnail: video.thumbnail || "/assets/videoseries/default-thumbnail.jpg",
                image: video.coverImage || "/assets/videoseries/default-Image.jpg",
                videoUrl: video.youtubeUrl || "",
                duration: video.duration || "",
                description: video.description || "",
              });
            });
          }
        });

        const limitedVideos = allVideos.slice(0, 12);
        setVideos(limitedVideos);
      } else {
        throw new Error("Invalid data structure received from API");
      }
    } catch (err) {
      console.error("Failed to fetch video series:", err);
      setError("Failed to load videos");
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleVideoClick = (video) => {
    if (video.videoUrl) {
      window.open(video.videoUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12 w-full">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#8a1f16] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading video series...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 bg-orange-50 rounded-lg border border-orange-100 mx-auto w-full max-w-6xl">
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
        <h3 className="mt-2 text-lg font-medium text-gray-900">Unable to load videos</h3>
        <p className="mt-1 text-gray-500 mb-4">There was a problem fetching the video series.</p>
        <button onClick={fetchVideos} className="px-4 py-2 bg-[#8a1f16] text-white rounded-lg">
          Try Again
        </button>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-lg mx-auto w-full max-w-6xl">
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
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">No video series available</h3>
        <p className="mt-1 text-gray-500">Check back soon for new content</p>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      {/* Container with proper spacing for arrows */}
      <div className="relative px-12 sm:px-16">
        {/* Navigation Arrows */}
        <button
          onClick={() => swiperRef?.slidePrev()}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-[#6E0000] hover:bg-white rounded-full p-2 sm:p-3 shadow-lg transition-all duration-200 hover:scale-110 group"
          aria-label="Previous video"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:text-[#B82A1E]" />
        </button>

        <button
          onClick={() => swiperRef?.slideNext()}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-[#6E0000] hover:bg-white rounded-full p-2 sm:p-3 shadow-lg transition-all duration-200 hover:scale-110 group"
          aria-label="Next video"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:text-[#B82A1E]" />
        </button>

        {/* Swiper Container */}
        <Swiper
          onSwiper={setSwiperRef}
          modules={[Navigation, Autoplay]}
          spaceBetween={20}
          slidesPerView={4}
          slidesPerGroup={4}
          loop={videos.length > 4}
          speed={800}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          breakpoints={{
            0: {
              slidesPerView: 1,
              slidesPerGroup: 1,
              spaceBetween: 16,
            },
            640: {
              slidesPerView: 2,
              slidesPerGroup: 2,
              spaceBetween: 18,
            },
            768: {
              slidesPerView: 3,
              slidesPerGroup: 3,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 4,
              slidesPerGroup: 4,
              spaceBetween: 20,
            },
            1280: {
              slidesPerView: 4,
              slidesPerGroup: 4,
              spaceBetween: 24,
            },
          }}
          className="video-carousel-swiper"
        >
          {videos.map((video, index) => (
            <SwiperSlide key={`${video.id}-${index}`}>
              <div
                className="relative rounded-xl overflow-hidden group cursor-pointer shadow-lg bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                onClick={() => handleVideoClick(video)}
              >
                {/* Video Card */}
                <div className="aspect-video relative">
                  <img
                    src={video.image}
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = "/assets/videoseries/default-Image.jpg";
                    }}
                  />
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    {/* <div className="bg-white/90 rounded-full p-3 transform scale-90 group-hover:scale-100 transition-transform duration-300">
                      <PlayCircle className="text-[#B82A1E] w-8 h-8" />
                    </div> */}
                  </div>

                  {/* Duration Badge */}
                  {video.duration && (
                    <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-md font-medium">
                      {video.duration}
                    </div>
                  )}
                </div>

                {/* Video Info */}
                {/* <div className="p-4">
                  <h3 className="text-gray-900 font-semibold text-sm leading-tight line-clamp-2 group-hover:text-[#B82A1E] transition-colors duration-200">
                    {video.title}
                  </h3>
                </div> */}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Custom Styles */}
      <style>{`
        :global(.video-carousel-swiper) {
          padding: 20px 0;
          overflow: visible;
        }

        :global(.video-carousel-swiper .swiper-wrapper) {
          align-items: stretch;
        }

        :global(.video-carousel-swiper .swiper-slide) {
          height: auto;
          display: flex;
          flex-direction: column;
        }

        :global(.video-carousel-swiper .swiper-slide > div) {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        /* Ensure smooth transitions */
        :global(.video-carousel-swiper .swiper-wrapper) {
          transition-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        /* Line clamp utility */
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Aspect ratio utility */
        .aspect-video {
          aspect-ratio: 16 / 9;
        }

        /* Mobile optimizations */
        @media (max-width: 640px) {
          :global(.video-carousel-swiper) {
            padding: 15px 0;
          }
        }
      `}</style>
    </div>
  );
};

export default VideoCarousel;
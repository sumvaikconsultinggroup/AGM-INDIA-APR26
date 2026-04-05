import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Play,
  Pause,
  Clock,
  Radio,
  Headphones,
  Volume2,
  Music,
  BookOpen,
  ChevronRight,
  Heart,
  MessageCircle,
  Download,
  Calendar,
  X,
  Eye,
  ThumbsUp,
} from "lucide-react";

// Import custom SVG icon components
const Yoga = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2a5 5 0 0 0-5 5 5 5 0 0 0 5 5 5 5 0 0 0 5-5 5 5 0 0 0-5-5z" />
    <path d="M9 7h6" />
    <path d="M12 17v-5" />
    <path d="m8.5 17-1.5-1.5V12l3-3 1 3h2l1-3 3 3v3.5L15.5 17" />
    <path d="m7.5 17-1 4c-.7.7-1.5 1-2.5 1s-1.8-.3-2.5-1l3-4" />
    <path d="m16.5 17 1 4c.7.7 1.5 1 2.5 1s1.8-.3 2.5-1l-3-4" />
    <path d="m8.5 20 1.5 2h4l1.5-2" />
  </svg>
);

const SunIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const Language = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m5 8 6 6" />
    <path d="m4 14 6-6 2-3" />
    <path d="M2 5h12" />
    <path d="M7 2h1" />
    <path d="m22 22-5-10-5 10" />
    <path d="M14 18h6" />
  </svg>
);

const HeartHandshake = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    <path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66" />
    <path d="m18 15-2-2" />
    <path d="m15 18-2-2" />
  </svg>
);

const ApplePodcastIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="11" r="1" />
    <path d="M11 17a1 1 0 0 1 2 0c0 .5-.34 3-.5 4.5a.5.5 0 0 1-1 0c-.16-1.5-.5-4-.5-4.5Z" />
    <path d="M8 14a5 5 0 1 1 8 0" />
    <path d="M17 18.5a9 9 0 1 0-10 0" />
  </svg>
);

const SpotifyIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M8 11.8A5.5 5.5 0 0 1 14.5 8" />
    <path d="M9 15a4 4 0 0 1 4-1" />
    <path d="M6.6 9.3a8 8 0 0 1 10.2-1" />
  </svg>
);

const GooglePodcastsIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="4" cy="12" r="2" />
    <circle cx="12" cy="4" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="12" cy="20" r="2" />
    <circle cx="20" cy="12" r="2" />
    <line x1="12" y1="6" x2="12" y2="10" />
    <line x1="12" y1="14" x2="12" y2="18" />
    <line x1="6" y1="12" x2="10" y2="12" />
    <line x1="14" y1="12" x2="18" y2="12" />
  </svg>
);

const YoutubeIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </svg>
);

const Quote = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
  </svg>
);

// Sample fallback data in case API fails
const samplePodcastData = {
  featured: {
    id: "featured-1",
    title: "The Path to Inner Peace",
    description:
      "In this special episode, Swami Avdheshanand Giri explores the journey to discovering true inner peace through ancient wisdom practices.",
    image: "/placeholder.svg?height=400&width=400",
    category: "Spirituality",
    duration: "58 min",
    date: "May 2, 2025",
    link: "#",
    featured: true,
    videoId: "dQw4w9WgXcQ",
  },
  episodes: [
    {
      id: 2,
      title: "Unlocking the Secrets of Meditation",
      description:
        "Discover powerful meditation techniques that can transform your consciousness and daily life.",
      image: "/placeholder.svg?height=200&width=200&text=Meditation",
      category: "Meditation",
      duration: "45 min",
      date: "Apr 25, 2025",
      link: "#",
      videoId: "dQw4w9WgXcQ",
    },
    {
      id: 3,
      title: "Vedanta: Ancient Wisdom for Modern Times",
      description:
        "Explore how Vedantic principles can help navigate the complexities of contemporary life.",
      image: "/placeholder.svg?height=200&width=200&text=Vedanta",
      category: "Vedanta",
      duration: "52 min",
      date: "Apr 18, 2025",
      link: "#",
      videoId: "dQw4w9WgXcQ",
    },
    {
      id: 4,
      title: "Q&A: Spiritual Practices for Beginners",
      description:
        "Swamiji answers questions from listeners about starting a spiritual practice from scratch.",
      image: "/placeholder.svg?height=200&width=200&text=Q&A",
      category: "Q&A Sessions",
      duration: "63 min",
      date: "Apr 11, 2025",
      link: "#",
      videoId: "dQw4w9WgXcQ",
    },
  ],
};

const Podcasts = () => {
  const { t, i18n } = useTranslation();

  // Parallax effect for hero section
  const parallaxRef = useRef(null);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");

  // State for dynamically loaded podcast data
  const [featuredEpisode, setFeaturedEpisode] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Categories derived from API data
  const [categories, setCategories] = useState([t("common.all")]);

  // State for modal and video playback
  const [modalOpen, setModalOpen] = useState(false);
  const [currentEpisodeId, setCurrentEpisodeId] = useState(null);
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);

  // Fetch podcast episodes on component mount
  useEffect(() => {
    fetchPodcasts();
  }, []);

  // Helper function to format dates properly
  const formatDate = (dateString) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
      }

      // Format based on current language
      const locale = i18n.language === "hi" ? "hi-IN" : "en-US";

      return date.toLocaleDateString(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (err) {
      console.error("Date formatting error:", err);
      return dateString; // Return original string if formatting fails
    }
  };

  // Modify fetchPodcasts to handle dates correctly
  const fetchPodcasts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(import.meta.env.VITE_APP_PODCASTS_API);

      if (response.data && Array.isArray(response.data.data)) {
        // Format the data to match our component needs
        const formattedPodcasts = response.data.data.map((podcast) => ({
          id: podcast._id || podcast.id || Math.random().toString(36).substring(7),
          title: podcast.title || t("podcasts.untitledEpisode"),
          thumbnail: podcast.thumbnail || t("podcasts.noTitleAvailable"),
          description: podcast.description || t("podcasts.noDescription"),
          image: podcast.coverImage || podcast.thumbnail || "/placeholder.svg?height=200&width=200",
          category: podcast.category || t("podcasts.categories.general"),
          duration:
            podcast.duration || `${Math.ceil(Math.random() * 30 + 20)} ${t("podcasts.minutes")}`,
          // Format date properly
          date: formatDate(podcast.date) || formatDate(new Date()),
          link: podcast.videoUrl || "#",
          videoId: podcast.videoId || "",
          featured: podcast.featured || false,
          views: podcast.views || `${Math.floor(Math.random() * 10) + 2}K`,
          likes: podcast.likes || `${Math.floor(Math.random() * 5) + 1}K`,
        }));

        // Find featured episode but don't remove it from the main list
        const featured = formattedPodcasts.find((ep) => ep.featured) || formattedPodcasts[0];

        // Keep all episodes in the episodes array
        const allEpisodes = formattedPodcasts;

        // Extract all unique categories
        const uniqueCategories = [
          t("common.all"),
          ...new Set(formattedPodcasts.map((ep) => ep.category)),
        ];

        setFeaturedEpisode(featured);
        setEpisodes(allEpisodes);
        setCategories(uniqueCategories);
      } else {
        throw new Error(t("errors.invalidDataStructure"));
      }
    } catch (err) {
      console.error(t("podcasts.errors.fetchFailed"), err);
      const errorMessage =
        axios.isAxiosError && axios.isAxiosError(err)
          ? `${t("podcasts.errors.loadFailed")}: ${err.response?.status || ""} ${err.message}`
          : t("podcasts.errors.loadFailed");
      setError(errorMessage);

      // Fall back to sample data for development
      setFeaturedEpisode(samplePodcastData.featured);

      // Include featured episode in the episodes array
      setEpisodes([samplePodcastData.featured, ...samplePodcastData.episodes]);

      setCategories([
        t("common.all"),
        ...new Set([
          samplePodcastData.featured.category,
          ...samplePodcastData.episodes.map((ep) => ep.category),
        ]),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      fetchPodcasts();
    }, 1000);
  };

  // Parallax effect
  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        const scrollPosition = window.scrollY;
        parallaxRef.current.style.transform = `translateY(${scrollPosition * 0.4}px)`;
        parallaxRef.current.style.opacity = String(1 - scrollPosition * 0.002);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handlePodcastClick = (episode) => {
    setCurrentEpisode(episode);
    setCurrentEpisodeId(episode.videoId || episode.id);
    setModalOpen(true);
    setVideoPlayerOpen(true);
    // Prevent scrolling when modal is open
    document.body.style.overflow = "hidden";
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setVideoPlayerOpen(false);
    setCurrentEpisodeId(null);
    setIsPlaying(false);
    // Re-enable scrolling
    document.body.style.overflow = "auto";
  };

  const togglePlay = (episode) => {
    handlePodcastClick(episode);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fcf9f5] to-white flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#B82A1E] mb-4"></div>
        <h2 className="text-2xl font-serif text-[#5D4037] mb-2">{t("podcasts.loading.title")}</h2>
        <p className="text-[#5D4037]/70 text-center">{t("podcasts.loading.message")}</p>
      </div>
    );
  }

  // Error state with retry option (if we have no data at all)
  if (error && !featuredEpisode && episodes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fcf9f5] to-white flex flex-col items-center justify-center p-4">
        <div className="bg-[#B82A1E]/10 p-6 rounded-full inline-flex mb-4">
          <svg
            className="h-12 w-12 text-[#B82A1E]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-serif text-[#5D4037] mb-2">{t("podcasts.error.title")}</h2>
        <p className="text-[#5D4037]/70 text-center mb-6">{t("podcasts.error.message")}</p>
        <button
          onClick={handleRetry}
          className="px-6 py-3 bg-[#B82A1E] text-white rounded-md hover:bg-[#9a231a] transition-colors flex items-center"
        >
          <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {t("common.tryAgain")}
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section with Parallax */}
      <div className="relative h-[60vh] overflow-hidden flex items-center justify-center">
        {/* Parallax Background */}
        <div
          ref={parallaxRef}
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/placeholder.svg?height=1080&width=1920')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            transform: "translateY(0px)",
          }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-[#7B0000] z-10"></div>

        {/* Content */}
        <div className="relative z-20 text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-serif mb-4">{t("podcasts.hero.title")}</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto font-light">
            {t("podcasts.hero.subtitle")}
          </p>
          <div className="mt-8 inline-block">
            <div className="h-0.5 w-20 bg-white/70 mx-auto"></div>
            <div className="h-0.5 w-12 bg-white/50 mx-auto mt-1"></div>
            <div className="h-0.5 w-6 bg-white/30 mx-auto mt-1"></div>
          </div>
        </div>

        {/* Decorative Audio Wave */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center space-x-1 z-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="w-1 bg-white/30 rounded-full animate-sound-wave"
              style={{
                height: `${Math.sin(i / 3) * 20 + 15}px`,
                animationDelay: `${i * 0.05}s`,
                opacity: 0.3 + Math.abs(Math.sin(i / 5)) * 0.7,
              }}
            ></div>
          ))}
        </div>

        {/* Decorative Om Symbol */}
        <div className="absolute bottom-4 right-4 text-white/20 text-6xl font-serif z-10">ॐ</div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        {/* Show error message if there was an issue loading podcasts but we have fallback data */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error} - {t("podcasts.showingFallbackData")}
            <button onClick={handleRetry} className="ml-2 underline hover:text-red-800">
              {t("common.tryAgain")}
            </button>
          </div>
        )}

        {/* Featured Podcast */}
        {featuredEpisode && (
          <div className="max-w-5xl mx-auto mb-16">
            <div className="flex items-center mb-8">
              <div className="w-1.5 h-12 bg-gradient-to-b from-[#B82A1E] to-[#8a1f16] mr-4 rounded-full"></div>
              <h2 className="text-3xl md:text-4xl font-serif text-[#5D4037]">
                {t("podcasts.featuredEpisode")}
              </h2>
            </div>

            <div className="bg-[#fcf9f5] rounded-2xl p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#B82A1E]/5 rounded-full -translate-x-5 -translate-y-10 z-0"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#B82A1E]/5 rounded-full translate-x-5 translate-y-20 z-0"></div>

              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                <div className="w-full md:w-1/3">
                  <div className="relative group">
                    <div className="relative overflow-hidden rounded-xl aspect-square shadow-lg">
                      <img
                        src={featuredEpisode.image}
                        alt={featuredEpisode.title}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                      />

                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          className="w-16 h-16 rounded-full bg-[#B82A1E] flex items-center justify-center shadow-lg transform transition-transform duration-300 hover:scale-110"
                          onClick={() => togglePlay(featuredEpisode)}
                        >
                          <Play className="text-white w-8 h-8 ml-1" />
                        </button>
                      </div>
                    </div>

                    <div className="absolute -right-4 -top-4 bg-[#B82A1E] text-white px-3 py-1 rounded-full text-xs font-medium shadow-md">
                      {t("podcasts.new")}
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-2/3">
                  <span className="inline-block px-3 py-1 bg-[#B82A1E]/10 text-[#B82A1E] rounded-full text-sm font-medium mb-2">
                    {featuredEpisode.category}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-serif text-[#5D4037] mb-3">
                    {featuredEpisode.thumbnail}
                  </h3>
                  <p className="text-[#5D4037]/80 leading-relaxed mb-4">
                    {featuredEpisode.description}
                  </p>

                  <div className="flex flex-wrap items-center text-[#5D4037]/60 text-sm mb-6">
                    <span className="flex items-center mr-6 mb-2">
                      <Clock className="mr-1 h-4 w-4" />
                      {featuredEpisode.duration}
                    </span>
                    <span className="flex items-center mr-6 mb-2">
                      <Calendar className="mr-1 h-4 w-4" />
                      {featuredEpisode.date}
                    </span>
                    <span className="flex items-center mb-2">
                      <Headphones className="mr-1 h-4 w-4" />
                      10.5k {t("podcasts.listeners")}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      className="px-6 py-2 bg-[#B82A1E] text-white rounded-full hover:bg-[#9a231a] transition-colors flex items-center"
                      onClick={() => handlePodcastClick(featuredEpisode)}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      {t("podcasts.watchNow")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Categories */}
        <div className="flex overflow-x-auto scrollbar-hide pb-4 mb-8 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveCategory(category);
              }}
              className={`flex-shrink-0 px-6 py-2 rounded-full mr-3 transition-colors ${
                activeCategory === category
                  ? "bg-[#B82A1E] text-white"
                  : "bg-[#fcf9f5] text-[#5D4037] hover:bg-[#B82A1E]/10"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Latest Episodes */}
        <div className="my-16">
          <div className="max-w-5xl mx-auto mb-8">
            <div className="flex items-center mb-8">
              <div className="w-1.5 h-12 bg-gradient-to-b from-[#B82A1E] to-[#8a1f16] mr-4 rounded-full"></div>
              <h2 className="text-3xl md:text-4xl font-serif text-[#5D4037]">
                {t("podcasts.latestEpisodes")}
              </h2>
            </div>

            {/* Filter episodes based on selected category */}
            {episodes.filter(
              (ep) => activeCategory === t("common.all") || ep.category === activeCategory
            ).length === 0 ? (
              <div className="text-center py-16 bg-[#fcf9f5] rounded-2xl p-6 md:p-8">
                <div className="inline-flex items-center justify-center p-4 bg-[#B82A1E]/10 rounded-full mb-4">
                  <svg
                    className="w-8 h-8 text-[#B82A1E]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-serif text-[#5D4037] mb-2">
                  {t("podcasts.noEpisodesFound")}
                </h3>
                <p className="text-[#5D4037]/70">{t("podcasts.tryDifferentCategory")}</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {episodes
                  .filter(
                    (ep) => activeCategory === t("common.all") || ep.category === activeCategory
                  )
                  .map((episode) => (
                    <div
                      key={episode.id}
                      className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col cursor-pointer"
                      onClick={() => handlePodcastClick(episode)}
                    >
                      <div className="flex flex-col sm:flex-row h-full">
                        <div className="sm:w-1/3 relative">
                          <div className="h-48 sm:h-full relative overflow-hidden">
                            <img
                              src={episode.image}
                              alt={episode.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <button
                                className="w-12 h-12 rounded-full bg-[#B82A1E] flex items-center justify-center"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  togglePlay(episode, e);
                                }}
                              >
                                <Play className="text-white w-6 h-6 ml-0.5" />
                              </button>
                            </div>
                          </div>

                          {/* Add "Featured" badge for the featured episode */}
                          {/* {episode.featured && (
                            <div className="absolute top-2 right-2 bg-[#B82A1E] text-white px-2 py-1 rounded text-xs font-medium">
                              {t("podcasts.featured")}
                            </div>
                          )} */}
                        </div>

                        <div className="p-4 sm:p-5 sm:w-2/3 flex flex-col justify-between">
                          <div>
                            <span className="inline-block px-2 py-1 bg-[#B82A1E]/10 text-[#B82A1E] rounded-full text-xs font-medium mb-2">
                              {episode.category}
                            </span>
                            <h3 className="text-lg md:text-xl font-serif text-[#5D4037] mb-2 line-clamp-2">
                              {episode.thumbnail}
                            </h3>
                            <p className="text-[#5D4037]/70 text-sm line-clamp-2 mb-4">
                              {episode.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-xs text-[#5D4037]/60">
                            <span className="flex items-center">
                              <Clock className="mr-1 h-3 w-3" />
                              {episode.duration}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              {episode.date}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            <div className="text-center mt-10">
              <a
                href="https://www.youtube.com/results?search_query=swami+avdheshanand+giri+maharaj+latest+podcast+and+interview"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 border border-[#B82A1E] text-[#B82A1E] rounded-md hover:bg-[#B82A1E]/10 transition-colors"
              >
                {t("podcasts.viewAllEpisodes")}
                <ChevronRight className="ml-2 h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Subscription Section */}
        <div className="relative my-16 py-16 overflow-hidden">
          <div className="absolute inset-0 bg-[#B82A1E]/5 -skew-y-2"></div>
          <div className="relative max-w-4xl mx-auto px-4 text-center">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-sm">
              <Radio className="mx-auto text-[#B82A1E] mb-6" size={48} />
              <h3 className="text-2xl md:text-3xl font-serif text-[#5D4037] mb-4">
                {t("podcasts.subscribe.title")}
              </h3>
              <p className="text-[#5D4037]/80 max-w-2xl mx-auto mb-8">
                {t("podcasts.subscribe.description")}
              </p>

              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {platforms.map((platform) => (
                  <a
                    key={platform.name}
                    href={platform.url}
                    className="flex items-center px-4 py-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {platform.icon}
                    <span className="ml-2 text-[#5D4037]">{platform.name}</span>
                  </a>
                ))}
              </div>

              {/* <div className="max-w-md mx-auto">
                <div className="flex">
                  <input
                    type="email"
                    placeholder={t("podcasts.subscribe.emailPlaceholder")}
                    className="flex-grow px-4 py-3 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B82A1E]/30 focus:border-[#B82A1E]"
                  />
                  <button className="px-6 py-3 bg-[#B82A1E] text-white rounded-r-lg hover:bg-[#9a231a] transition-colors whitespace-nowrap">
                    {t("podcasts.subscribe.button")}
                  </button>
                </div>
                <p className="text-xs text-[#5D4037]/60 mt-2">
                  {t("podcasts.subscribe.privacyNote")}
                </p>
              </div> */}
            </div>
          </div>
        </div>

        {/* Host */}
        <div className="my-16">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center mb-8">
              <div className="w-1.5 h-12 bg-gradient-to-b from-[#B82A1E] to-[#8a1f16] mr-4 rounded-full"></div>
              <h2 className="text-3xl md:text-4xl font-serif text-[#5D4037]">
                {t("podcasts.host.sectionTitle")}
              </h2>
            </div>

            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="grid md:grid-cols-2">
                <div className="relative h-full min-h-[300px]">
                  <img
                    src="/assets/swami_awdeshanand.jpg"
                    alt={t("podcasts.host.name")}
                    className="absolute inset-0 w-full h-full object-cover object-top"
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-serif text-[#5D4037] mb-2">
                    {t("podcasts.host.name")}
                  </h3>
                  <p className="text-[#B82A1E] mb-4">{t("podcasts.host.title")}</p>
                  <p className="text-[#5D4037]/80 mb-4">{t("podcasts.host.bio1")}</p>
                  <p className="text-[#5D4037]/80 mb-6">{t("podcasts.host.bio2")}</p>
                  <div className="flex gap-3">
                    <a href="/about" className="text-[#B82A1E] hover:underline">
                      {t("podcasts.host.learnMore")}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="relative my-16 py-16 overflow-hidden">
          <div className="absolute inset-0 bg-[#B82A1E]/5 -skew-y-2"></div>
          <div className="relative max-w-4xl mx-auto px-4 text-center">
            <Quote className="mx-auto text-[#B82A1E]/30 mb-6" size={48} />
            <blockquote className="text-2xl md:text-3xl font-serif text-[#5D4037] italic mb-6">
              {t("podcasts.testimonial.quote")}
            </blockquote>
            <div className="h-0.5 w-20 bg-[#B82A1E]/30 mx-auto mb-4"></div>
            <p className="text-[#5D4037] font-medium">{t("podcasts.testimonial.name")}</p>
            <p className="text-[#5D4037]/70 text-sm">{t("podcasts.testimonial.title")}</p>
          </div>
        </div>
      </div>

      {/* Modal for Podcast Video */}
      {modalOpen && currentEpisode && (
        <div className="fixed inset-0 bg-black/80 z-50 overflow-y-auto flex flex-col">
          {/* Modal Header */}
          <div className="bg-white py-4 px-6 flex justify-between items-center shadow-md">
            <button
              onClick={handleCloseModal}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-6 w-6 text-[#5D4037]" />
            </button>
            <h2 className="text-xl font-serif text-[#5D4037] text-center flex-1">
              {currentEpisode.title}
            </h2>
            <div className="w-10"></div> {/* Spacer for balance */}
          </div>

          {/* Video Player */}
          {videoPlayerOpen && currentEpisodeId && (
            <div className="flex-1 flex flex-col">
              <div className="bg-black flex-1 flex flex-col">
                <div className="relative pt-[56.25%] w-full">
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${currentEpisodeId}?autoplay=1`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>

                {/* Podcast details */}
                <div className="bg-white p-6">
                  <h3 className="text-2xl font-serif text-[#5D4037] mb-2">
                    {currentEpisode.title}
                  </h3>
                  <div className="flex flex-wrap items-center text-[#5D4037]/60 text-sm mb-4">
                    <span className="flex items-center mr-6 mb-2">
                      <Clock className="mr-1 h-4 w-4" />
                      {currentEpisode.duration}
                    </span>
                    <span className="flex items-center mr-6 mb-2">
                      <Calendar className="mr-1 h-4 w-4" />
                      {currentEpisode.date}
                    </span>
                    <span className="flex items-center mr-6 mb-2">
                      <Eye className="mr-1 h-4 w-4" />
                      {currentEpisode.views || "10K"} {t("podcasts.views")}
                    </span>
                    <span className="flex items-center mb-2">
                      <ThumbsUp className="mr-1 h-4 w-4" />
                      {currentEpisode.likes || "1.5K"} {t("podcasts.likes")}
                    </span>
                  </div>
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-[#B82A1E]/10 text-[#B82A1E] rounded-full text-sm font-medium">
                      {currentEpisode.category}
                    </span>
                  </div>
                  <p className="text-[#5D4037]/80 leading-relaxed">{currentEpisode.description}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

// Platforms data
const platforms = [
  // {
  //   name: "Apple Podcasts",
  //   url: "#",
  //   icon: <ApplePodcastIcon className="h-5 w-5 text-[#B82A1E]" />,
  // },
  // {
  //   name: "Spotify",
  //   url: "#",
  //   icon: <SpotifyIcon className="h-5 w-5 text-[#B82A1E]" />,
  // },
  // {
  //   name: "Google Podcasts",
  //   url: "#",
  //   icon: <GooglePodcastsIcon className="h-5 w-5 text-[#B82A1E]" />,
  // },
  {
    name: "YouTube",
    url: "https://www.youtube.com/@avdheshanandg",
    icon: <YoutubeIcon className="h-5 w-5 text-[#B82A1E]" />,
  },
];

// Add animation for sound wave
const styles = `
@keyframes sound-wave {
  0% {
    height: 5px;
  }
  50% {
    height: 25px;
  }
  100% {
    height: 5px;
  }
}

.animate-sound-wave {
  animation: sound-wave 1.4s ease-in-out infinite;
}
`;

// Add styles to head
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default Podcasts;

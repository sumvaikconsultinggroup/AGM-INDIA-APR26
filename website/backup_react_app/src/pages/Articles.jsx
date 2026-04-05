import  { useState, useEffect } from "react";
import {
  Search,
  Clock,
  BookOpen,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next"; // Import translation hook

const Banner = () => {
  const { t } = useTranslation(); // Add translation hook
  
  return (
    <div className="relative h-[60vh] overflow-hidden flex items-center justify-center bg-[#7B0000]">
      <div className="absolute top-8 left-8 text-white/10 text-7xl font-serif z-10">ॐ</div>
      <div className="absolute bottom-8 right-8 text-white/10 text-7xl font-serif z-10">ॐ</div>
      <div className="relative z-20 text-center text-white px-4">
        <h1 className="text-4xl md:text-6xl font-serif mb-4">{t("articles.hero.title")}</h1>
        <p className="text-xl md:text-2xl max-w-3xl mx-auto font-light">
          {t("articles.hero.subtitle")}
        </p>
        <div className="mt-8 inline-block">
          <div className="h-0.5 w-20 bg-white/70 mx-auto"></div>
          <div className="h-0.5 w-12 bg-white/50 mx-auto mt-1"></div>
          <div className="h-0.5 w-6 bg-white/30 mx-auto mt-1"></div>
        </div>
      </div>
    </div>
  );
};

const Articles = () => {
  const { t } = useTranslation(); // Add translation hook
  
  const [articles, setArticles] = useState([]);
  const [liveUpdates, setLiveUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveUpdatesLoading, setLiveUpdatesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveUpdatesError, setLiveUpdatesError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(t("articles.categories.all"));
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([t("articles.categories.all")]);

  // Update selectedCategory when language changes
  useEffect(() => {
    setSelectedCategory(t("articles.categories.all"));
    setCategories(prevCategories => {
      if (prevCategories.length <= 1) return [t("articles.categories.all")];
      
      // Preserve existing categories but update "All" category
      const otherCategories = prevCategories.filter(cat => cat !== "All" && cat !== t("articles.categories.all"));
      return [t("articles.categories.all"), ...otherCategories];
    });
  }, [t]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(import.meta.env.VITE_APP_ARTICLES_API);

      if (response.data && Array.isArray(response.data.data)) {
        const formattedArticles = response.data.data.map((article) => ({
          id: article._id || article.id,
          title: article.title || t("articles.untitledArticle"),
          category: article.category || t("articles.categories.general"),
          description: article.description || article.excerpt || "",
          link: article.link || `#article-${article._id || article.id}`,
          image:
            article.coverImage ||
            article.thumbnail ||
            "https://images.unsplash.com/photo-1609607847926-da4702f01fef?auto=format&fit=crop&q=80&w=1000",
          date:
            article.date ||
            new Date(article.createdAt || article.publishedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            }),
          readTime: article.readTime
            ? `${article.readTime} min read`
            : `${Math.ceil(Math.random() * 10)} min read`,
        }));

        setArticles(formattedArticles);
        const uniqueCategories = [t("articles.categories.all"), ...new Set(formattedArticles.map(article => article.category))];
        setCategories(uniqueCategories);
      } else {
        throw new Error("Invalid data structure received from API");
      }
    } catch (err) {
      console.error("Failed to fetch articles:", err);
      setError(t("articles.errorMessage"));
      setArticles(sampleArticles);
      const fallbackCategories = [t("articles.categories.all"), ...new Set(sampleArticles.map(article => article.category))];
      setCategories(fallbackCategories);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveUpdates = async () => {
    try {
      setLiveUpdatesLoading(true);
      const response = await axios.get(import.meta.env.VITE_APP_ARTICLES_API);

      if (response.data && Array.isArray(response.data.data)) {
        const formattedUpdates = response.data.data
          .map((update) => ({
            id: update._id || update.id,
            title: update.title || t("articles.untitledUpdate"),
            timestamp: formatDistanceToNow(new Date(update.createdAt || update.date), {
              addSuffix: true,
            }),
            originalDate: new Date(update.createdAt || update.date),
            link: update.link || `#update-${update._id || update.id}`,
          }))
          .sort((a, b) => b.originalDate - a.originalDate);

        setLiveUpdates(formattedUpdates);
      } else {
        throw new Error("Invalid live updates data structure");
      }
    } catch (err) {
      console.error("Failed to fetch live updates:", err);
      setLiveUpdatesError(t("articles.liveUpdates.error"));
      setLiveUpdates([
        {
          id: 1,
          title: "Live: Spiritual Discourse by Swamiji",
          timestamp: "2 mins ago",
          link: "#",
        },
        {
          id: 2,
          title: "Ongoing: Special Bhajan Session",
          timestamp: "10 mins ago",
          link: "#",
        },
        {
          id: 3,
          title: "Live Updates: Annual Spiritual Retreat",
          timestamp: "30 mins ago",
          link: "#",
        },
      ]);
    } finally {
      setLiveUpdatesLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
    fetchLiveUpdates();

    const liveUpdateInterval = setInterval(() => {
      fetchLiveUpdates();
    }, 60000);

    return () => clearInterval(liveUpdateInterval);
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchArticles();
  };

  const handleRetryLiveUpdates = () => {
    setLiveUpdatesLoading(true);
    setLiveUpdatesError(null);
    fetchLiveUpdates();
  };

  const filteredArticles = articles.filter((article) => {
    const matchesCategory = selectedCategory === t("articles.categories.all") || article.category === selectedCategory;
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && (searchTerm === "" || matchesSearch);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fcf9f5] to-white flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#B82A1E] mb-4"></div>
        <h2 className="text-2xl font-serif text-[#5D4037] mb-2">{t("articles.loadingTitle")}</h2>
        <p className="text-[#5D4037]/70 text-center">
          {t("articles.loadingMessage")}
        </p>
      </div>
    );
  }

  if (error && articles.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fcf9f5] to-white flex flex-col items-center justify-center p-4">
        <div className="bg-[#B82A1E]/10 p-6 rounded-full inline-flex mb-4">
          <AlertCircle className="h-12 w-12 text-[#B82A1E]" />
        </div>
        <h2 className="text-2xl font-serif text-[#5D4037] mb-2">{t("articles.errorTitle")}</h2>
        <p className="text-[#5D4037]/70 text-center mb-6">
          {t("articles.errorMessage")}
        </p>
        <button
          onClick={handleRetry}
          className="px-6 py-3 bg-[#B82A1E] text-white rounded-md hover:bg-[#9a231a] transition-colors flex items-center"
        >
          <RefreshCw className="mr-2 h-5 w-5" />
          {t("articles.retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fcf9f5] to-white">
      <Banner />

      <div className="container mx-auto px-4 pb-16">
        <div className="bg-white shadow-sm rounded-lg -mt-16 p-6 mb-12 relative z-10">
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder={t("articles.searchPlaceholder")}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B82A1E]/30 focus:border-[#B82A1E]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-[#B82A1E]" />
            </div>
          </div>

          <div className="overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
            <div className="inline-flex min-w-max">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`whitespace-nowrap text-sm px-4 py-2 rounded-full mr-2.5 transition-colors border ${
                    selectedCategory === category
                      ? "bg-[#B82A1E] text-white border-[#B82A1E]"
                      : "bg-[#fcf9f5] text-[#5D4037] border-[#fcf9f5] hover:bg-[#B82A1E]/10"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center mb-8">
              <div className="w-1.5 h-12 bg-gradient-to-b from-[#B82A1E] to-[#8a1f16] mr-4 rounded-full"></div>
              <h2 className="text-3xl md:text-4xl font-serif text-[#5D4037]">
                {selectedCategory === t("articles.categories.all") 
                  ? t("articles.sectionTitle") 
                  : `${selectedCategory} ${t("articles.sectionTitle")}`}
              </h2>
            </div>

            {filteredArticles.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <div className="bg-[#B82A1E]/10 p-6 rounded-full inline-flex mb-4">
                  <Search className="h-12 w-12 text-[#B82A1E]" />
                </div>
                <h3 className="text-2xl font-serif text-[#5D4037] mb-2">{t("articles.noArticlesFound")}</h3>
                <p className="text-[#5D4037]/70 mb-4">
                  {t("articles.tryDifferentSearch")}
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory(t("articles.categories.all"));
                  }}
                  className="px-6 py-2 bg-[#B82A1E] text-white rounded-md hover:bg-[#9a231a] transition-colors"
                >
                  {t("articles.clearFilters")}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredArticles.map((article) => (
                  <div
                    key={article.id}
                    className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <div className="relative">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-56 object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <div className="absolute top-3 right-3 bg-[#B82A1E] text-white text-xs px-2 py-1 rounded">
                        {article.category}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-serif text-xl font-medium text-[#5D4037] mb-2 line-clamp-2">
                        {article.title}
                      </h3>
                      <div className="flex items-center text-[#5D4037]/60 text-sm mb-3">
                        <span className="flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          {article.date}
                        </span>
                        <span className="mx-2">•</span>
                        <span className="flex items-center">
                          <BookOpen className="h-3.5 w-3.5 mr-1" />
                          {article.readTime}
                        </span>
                      </div>
                      <p className="text-[#5D4037]/70 text-sm mb-5 line-clamp-3">
                        {article.description}
                      </p>
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-[#B82A1E] font-medium hover:underline"
                      >
                        {t("articles.readMoreLink")}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-1 space-y-8">
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="border-b border-gray-100">
                <div className="flex items-center p-6">
                  <div className="w-1 h-6 bg-gradient-to-b from-[#B82A1E] to-[#8a1f16] mr-3 rounded-full"></div>
                  <h2 className="text-xl font-serif text-[#5D4037]">{t("articles.liveUpdates.title")}</h2>
                  <span className="ml-2 h-2.5 w-2.5 bg-red-500 rounded-full relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  </span>
                  <button
                    onClick={handleRetryLiveUpdates}
                    className="ml-auto text-[#B82A1E]/70 hover:text-[#B82A1E] transition-colors"
                    aria-label="Refresh live updates"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                {liveUpdatesLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#B82A1E]"></div>
                  </div>
                ) : liveUpdatesError ? (
                  <div className="text-center py-4">
                    <p className="text-[#5D4037]/70 mb-2">{t("articles.liveUpdates.error")}</p>
                    <button
                      onClick={handleRetryLiveUpdates}
                      className="text-sm text-[#B82A1E] hover:underline"
                    >
                      {t("articles.liveUpdates.tryAgain")}
                    </button>
                  </div>
                ) : liveUpdates.length === 0 ? (
                  <p className="text-center py-4 text-[#5D4037]/70">{t("articles.liveUpdates.empty")}</p>
                ) : (
                  <ul className="space-y-5">
                    {liveUpdates.map((post) => (
                      <li
                        key={post.id}
                        className="border-b border-dashed border-gray-100 pb-4 last:border-0 last:pb-0"
                      >
                        <a
                          href={post.link}
                          className="font-medium text-[#5D4037] hover:text-[#B82A1E] line-clamp-2 transition-colors"
                        >
                          {post.title}
                        </a>
                        <span className="text-[#B82A1E]/80 text-sm block mt-1">
                          {post.timestamp}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="border-b border-gray-100">
                <div className="flex items-center p-6">
                  <div className="w-1 h-6 bg-gradient-to-b from-[#B82A1E] to-[#8a1f16] mr-3 rounded-full"></div>
                  <h2 className="text-xl font-serif text-[#5D4037]">{t("articles.mostRead.title")}</h2>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  {articles.slice(0, 5).map((article, index) => (
                    <li key={article.id} className="flex items-start pb-4 last:pb-0">
                      <span className="flex items-center justify-center bg-[#B82A1E]/10 text-[#B82A1E] font-bold h-6 w-6 rounded mr-3 flex-shrink-0">
                        {index + 1}
                      </span>
                      <div>
                        <a
                          href={article.link}
                          className="text-[#5D4037] hover:text-[#B82A1E] font-medium line-clamp-2 transition-colors"
                        >
                          {article.title}
                        </a>
                        <span className="text-[#5D4037]/60 text-xs">{article.readTime}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="relative p-8 overflow-hidden rounded-lg bg-[#fcf9f5]">
              <div className="text-[#B82A1E]/10 text-6xl absolute top-0 left-0 transform -translate-x-1/3 -translate-y-1/3 font-serif">
                ॐ
              </div>
              <div className="text-[#B82A1E]/10 text-6xl absolute bottom-0 right-0 transform translate-x-1/3 translate-y-1/3 font-serif">
                ॐ
              </div>
              <blockquote className="text-lg font-serif text-[#5D4037] italic mb-4 text-center relative z-10">
                {t("articles.quote.text")}
              </blockquote>
              <div className="h-0.5 w-12 bg-[#B82A1E]/30 mx-auto mb-3"></div>
              <p className="text-[#5D4037] font-medium text-center text-sm">
                {t("articles.quote.author")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const sampleArticles = [
  {
    id: 1,
    title: "Swamiji on Self-Realization",
    category: "Latest",
    description:
      "An insight into the teachings of Swamiji on the path to self-discovery and enlightenment.",
    link: "#",
    image:
      "https://images.unsplash.com/photo-1609607847926-da4702f01fef?auto=format&fit=crop&q=80&w=1000",
    date: "May 3, 2025",
    readTime: "7 min read",
  },
  {
    id: 2,
    title: "Bhagwat Wisdom",
    category: "Bhagwat",
    description: "Exploring the sacred wisdom of Bhagwat Gita and its relevance in modern times.",
    link: "#",
    image:
      "https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?auto=format&fit=crop&q=80&w=1000",
    date: "April 28, 2025",
    readTime: "5 min read",
  },
  {
    id: 3,
    title: "Role of Women in Vedic Culture",
    category: "Women",
    description:
      "An exploration of women's roles and their significance in ancient dharmic traditions.",
    link: "#",
    image:
      "https://images.unsplash.com/photo-1604607275559-3f9b0b5c3831?auto=format&fit=crop&q=80&w=1000",
    date: "April 25, 2025",
    readTime: "9 min read",
  },
  {
    id: 4,
    title: "Understanding Hindu Dharma",
    category: "Hindu Dharma",
    description: "Key teachings and principles that form the foundation of Hindu philosophy.",
    link: "#",
    image:
      "https://images.unsplash.com/photo-1545203565-7d7d50789aae?auto=format&fit=crop&q=80&w=1000",
    date: "April 20, 2025",
    readTime: "8 min read",
  },
  {
    id: 5,
    title: "Spiritual Leadership",
    category: "Trending",
    description: "Swamiji's perspective on spiritual leadership and its impact on society.",
    link: "#",
    image:
      "https://images.unsplash.com/photo-1470549638415-0a0755be0619?auto=format&fit=crop&q=80&w=1000",
    date: "April 15, 2025",
    readTime: "6 min read",
  },
  {
    id: 6,
    title: "Role of Women in Vedic Culture Part II",
    category: "Latest",
    description:
      "Further exploration of women's roles in ancient dharmic traditions and modern interpretations.",
    link: "#",
    image:
      "https://images.unsplash.com/photo-1604607275559-3f9b0b5c3831?auto=format&fit=crop&q=80&w=1000",
    date: "April 10, 2025",
    readTime: "7 min read",
  },
  {
    id: 7,
    title: "The Art of Meditation",
    category: "Trending",
    description:
      "Detailed guidance on meditation techniques and their benefits for modern practitioners.",
    link: "#",
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1000",
    date: "April 8, 2025",
    readTime: "10 min read",
  },
  {
    id: 8,
    title: "The Path to Inner Peace",
    category: "Hindu Dharma",
    description: "Discovering tranquility through ancient wisdom and modern spiritual practices.",
    link: "#",
    image:
      "https://images.unsplash.com/photo-1507652955-f3dcef5a3be5?auto=format&fit=crop&q=80&w=1000",
    date: "April 5, 2025",
    readTime: "8 min read",
  },
];

export default Articles;

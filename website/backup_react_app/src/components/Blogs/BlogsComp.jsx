"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import BlogCard from "./BlogCard";
import { BookOpen, LoaderCircle, Filter, ChevronRight, Rss } from "lucide-react";

const BlogsData = [
  {
    id: 1,
    image: "/placeholder.svg?height=400&width=500&text=Meditation+Guide",
    title: "The Art of Meditation: Finding Inner Peace",
    description:
      "Explore the profound practice of meditation and discover how ancient techniques can transform your daily life. Learn about different meditation methods, their benefits, and how to establish a consistent practice that brings clarity and inner peace to your spiritual journey.",
    author: "Swami Anandji",
    date: "January 15, 2024",
    category: "Meditation",
  },
  {
    id: 2,
    image: "/placeholder.svg?height=400&width=500&text=Yoga+Practice",
    title: "Yoga and Spirituality: A Path to Wholeness",
    description:
      "Discover the deep connection between yoga and spiritual growth. This article explores how the physical practice of yoga facilitates spiritual awakening, mental clarity, and emotional balance. Learn how to integrate yoga into your daily spiritual practice.",
    author: "Acharya Priya",
    date: "January 12, 2024",
    category: "Yoga",
  },
  {
    id: 3,
    image: "/placeholder.svg?height=400&width=500&text=Sacred+Teachings",
    title: "Understanding the Bhagavad Gita",
    description:
      "Dive into one of the world's most profound spiritual texts. Explore the timeless wisdom of the Bhagavad Gita and its teachings on dharma, duty, and the path to enlightenment. Understand how these ancient teachings remain relevant in our modern world.",
    author: "Pandit Sharma",
    date: "January 10, 2024",
    category: "Scripture",
  },
  {
    id: 4,
    image: "/placeholder.svg?height=400&width=500&text=Community+Service",
    title: "The Power of Seva: Service as Spiritual Practice",
    description:
      "Explore the transformative power of selfless service (Seva) in spiritual development. Learn how serving others purifies the heart, dissolves the ego, and deepens our connection to the divine. Discover inspiring stories of community service that changed lives.",
    author: "Guru Ramdas",
    date: "January 8, 2024",
    category: "Service",
  },
  {
    id: 5,
    image: "/placeholder.svg?height=400&width=500&text=Festival+Celebration",
    title: "Sacred Festivals: Celebrating Spiritual Awakening",
    description:
      "Learn about the profound spiritual significance of sacred festivals and celebrations. Explore how festivals like Diwali, Holi, and other spiritual observances help us connect with divine energy and celebrate the eternal truths of our spiritual heritage.",
    author: "Swami Anandji",
    date: "January 5, 2024",
    category: "Festivals",
  },
  {
    id: 6,
    image: "/placeholder.svg?height=400&width=500&text=Om+Chanting",
    title: "The Sacred Sound of Om: Gateway to Universal Consciousness",
    description:
      "Discover the transformative power of Om chanting. This article explores the spiritual significance of the sacred sound Om, its effects on the mind and body, and how regular chanting can elevate your spiritual practice and connect you to universal consciousness.",
    author: "Acharya Priya",
    date: "January 3, 2024",
    category: "Mantra",
  },
  {
    id: 7,
    image: "/placeholder.svg?height=400&width=500&text=Spiritual+Journey",
    title: "Beginning Your Spiritual Journey: A Beginner's Guide",
    description:
      "New to spirituality? This comprehensive guide will help you start your spiritual journey with confidence. Learn about foundational practices, how to find a spiritual community, and practical steps to begin your path toward self-realization and inner peace.",
    author: "Guru Ramdas",
    date: "December 28, 2023",
    category: "Beginners",
  },
  {
    id: 8,
    image: "/placeholder.svg?height=400&width=500&text=Mindfulness+Living",
    title: "Living Mindfully: Spirituality in Daily Life",
    description:
      "Explore how to integrate spiritual principles into your everyday activities. Learn practical techniques for bringing mindfulness, compassion, and divine awareness into your work, relationships, and daily interactions, transforming ordinary moments into spiritual practice.",
    author: "Swami Anandji",
    date: "December 25, 2023",
    category: "Lifestyle",
  },
  {
    id: 9,
    image: "/placeholder.svg?height=400&width=500&text=Chakra+Healing",
    title: "Understanding Chakras: Energy Centers of the Spirit",
    description:
      "Explore the seven energy centers (chakras) in the body and their role in spiritual health. Learn how to balance and activate your chakras through meditation, breathing exercises, and mindful awareness for enhanced spiritual and physical well-being.",
    author: "Acharya Priya",
    date: "December 20, 2023",
    category: "Energy",
  },
];

const categories = [
  "All",
  "Meditation",
  "Yoga",
  "Scripture",
  "Service",
  "Festivals",
  "Mantra",
  "Beginners",
  "Lifestyle",
  "Energy",
];

export default function BlogsComp() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [displayCount, setDisplayCount] = useState(6);

  // Filter blogs based on the selected category
  const filteredBlogs =
    selectedCategory === "All"
      ? BlogsData
      : BlogsData.filter((blog) => blog.category === selectedCategory);

  const handleLoadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setDisplayCount((prevCount) => prevCount + 3);
      setIsLoading(false);
    }, 500); // Simulate a network delay
  };

  const handleShowLess = () => {
    setIsLoading(true);
    setTimeout(() => {
      setDisplayCount(6);
      setIsLoading(false);
    }, 500); // Simulate a network delay
  };
  const displayedBlogs = filteredBlogs.slice(0, displayCount);

  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-b from-[#fcf9f5] to-white">
      <div
        id="aboutTop"
        className="relative h-[60vh] overflow-hidden flex items-center justify-center"
      >
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/newassets/blogs-hero.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
          }}
        />

        {/* Red Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#7B0000] to-[#7B0000] z-10"></div>

        {/* Content */}
        <div className="relative z-20 text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-serif mb-4">Our Latest Blogs</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto font-light">
            Reflections on the path of divinity — where sacred teachings, timeless wisdom, and
            spiritual experiences inspire inner awakening.
          </p>
          <div className="mt-8 inline-block">
            <div className="h-0.5 w-20 bg-white/70 mx-auto"></div>
            <div className="h-0.5 w-12 bg-white/50 mx-auto mt-1"></div>
            <div className="h-0.5 w-6 bg-white/30 mx-auto mt-1"></div>
          </div>
        </div>

        <div className="absolute bottom-4 right-4 text-white/20 text-6xl font-serif z-10">ॐ</div>
      </div>

      {/* Om symbol watermark */}
      <div className="absolute opacity-[0.02] text-[#B82A1E] text-[400px] font-serif top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none">
        ॐ
      </div>

      <div className="container relative z-10 px-5 mx-auto">
        {/* Section Header */}
        <div className="mb-16 text-center"></div>

        {/* Category Filter */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <Filter size={20} className="text-[#B82A1E]" />
            <h3 className="text-lg font-serif text-[#5D4037]">
              {t("blogs.filter.title", "Filter by Category")}
            </h3>
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setDisplayCount(6); // Reset to initial count when changing category
                }}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-[#B82A1E] text-white shadow-lg"
                    : "bg-white text-[#5D4037] border border-[#B82A1E]/20 hover:border-[#B82A1E] hover:bg-[#B82A1E]/5"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Grid */}
        <div className="max-w-6xl mx-auto">
          {displayedBlogs.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#B82A1E]/10 flex items-center justify-center">
                <Rss className="w-12 h-12 text-[#B82A1E]/50" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-serif text-[#5D4037] mb-4">
                {t("blogs.empty.title", "No Articles Found")}
              </h3>
              <p className="text-[#5D4037]/70 mb-6">
                {t(
                  "blogs.empty.description",
                  "We couldn't find articles in this category. Try another category or check back soon!"
                )}
              </p>
              <button
                onClick={() => setSelectedCategory("All")}
                className="px-6 py-3 bg-[#B82A1E] text-white rounded-full hover:bg-[#a32519] transition-colors"
              >
                {t("blogs.empty.button", "View All Articles")}
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayedBlogs.map((blog) => (
                  <BlogCard key={blog.id} {...blog} />
                ))}
              </div>

              {/* Load More Button */}
              {displayCount < filteredBlogs.length && (
                <div className="text-center mt-16">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#B82A1E] border-2 border-[#B82A1E] rounded-full hover:bg-[#B82A1E] hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl font-medium group disabled:opacity-70 disabled:cursor-not-allowed min-w-[220px]"
                  >
                    {isLoading ? (
                      <LoaderCircle size={20} className="animate-spin" />
                    ) : (
                      <>
                        {t("blogs.loadMore", "Load More Articles")}
                        <ChevronRight
                          size={20}
                          className="ml-2 group-hover:translate-x-1 transition-transform"
                        />
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Show Less Button */}
              {displayCount > 6 && (
                <div className="text-center mt-8">
                  <button
                    onClick={handleShowLess}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#5D4037] border-2 border-[#5D4037]/30 rounded-full hover:bg-[#5D4037]/10 transition-all duration-300 font-medium disabled:opacity-70 disabled:cursor-not-allowed min-w-[160px]"
                  >
                    {isLoading ? (
                      <LoaderCircle size={20} className="animate-spin" />
                    ) : (
                      t("blogs.showLess", "Show Less")
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto mt-20">
          <div className="bg-gradient-to-br from-[#B82A1E]/5 to-[#B82A1E]/10 rounded-2xl p-8 shadow-lg border border-[#B82A1E]/20 text-center">
            <h3 className="text-2xl font-serif text-[#5D4037] mb-4">
              {t("blogs.cta.title", "Share Your Spiritual Insights")}
            </h3>
            <p className="text-[#5D4037]/80 leading-relaxed mb-6">
              {t(
                "blogs.cta.description",
                `Have a spiritual experience or insight you'd like to share with our community? We welcome contributions
              from fellow seekers. Let's grow together in wisdom and understanding.`
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

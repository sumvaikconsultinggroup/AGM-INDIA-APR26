import { ArrowUpRight } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function BlogSection() {
    const navigate = useNavigate();
    const [blogPosts, setBlogPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fallback static data (your original data)
    const fallbackPosts = [
        {
            id: 1,
            image: "/newassets/blog1.png",
            alt: "Amit Shah Union Home Minister meeting",
            title: "Amit Shah, Union Home Minister met Sadguru Swami Avdheshanand Giri, talked about spirituality",
            date: "Jul 1, 2025"
        },
        {
            id: 2,
            image: "/newassets/blog2.png",
            alt: "Pitru Paksh Mahatmya 2025",
            title: "Pitru Paksh Mahatmya 2025: What will be achieved by the royal bath in Mahakumbh? Avdheshanand Giri Maharaj told",
            date: "Jul 3, 2025"
        },
        {
            id: 3,
            image: "/newassets/blog3.png",
            alt: "Swami Avdheshanand Giri Maharaj appeal",
            title: "Swami Avdheshanand Giri Maharajs appeal- Hindus should rise above Hum Do Hamare Do. What did he say on religion and politics? Read here.",
            date: "Jul 2, 2025"
        }
    ];

    // Fetch articles from API
    const fetchArticles = async () => {
        try {
            setLoading(true);
            const response = await axios.get(import.meta.env.VITE_APP_ARTICLES_API);

            if (response.data && Array.isArray(response.data.data)) {
                const formattedArticles = response.data.data
                    .slice(0, 3) // Get only first 3 articles for the blog section
                    .map((article, index) => ({
                        id: article._id || article.id || index + 1,
                        title: article.title || "Untitled Article",
                        image: article.coverImage || 
                               article.thumbnail || 
                               article.image || 
                               fallbackPosts[index]?.image || 
                               "/newassets/blog1.png",
                        alt: article.title || "Article image",
                        date: article.date || 
                              (article.createdAt ? 
                                new Date(article.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric"
                                }) : 
                                new Date().toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric"
                                })
                              ),
                        link: article.link || `#article-${article._id || article.id}`
                    }));

                setBlogPosts(formattedArticles);
            } else {
                throw new Error("Invalid data structure received from API");
            }
        } catch (error) {
            console.error("Failed to fetch articles for blog section:", error);
            // Use fallback data if API fails
            setBlogPosts(fallbackPosts);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    // Blog Card Component - updated to handle article links
    const BlogCard = ({ post }) => (
        <div 
            className="group cursor-pointer"
            onClick={() => {
                if (post.link && post.link !== '#' && !post.link.startsWith('#article-')) {
                    window.open(post.link, '_blank', 'noopener,noreferrer');
                } else {
                    // Navigate to articles page or handle internal routing
                    navigate("/articles");
                }
            }}
        >
            <div className="relative mb-4 overflow-visible">
                <img
                    src={post.image}
                    alt={post.alt}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                        // Fallback to a default image if the API image fails to load
                        e.target.onerror = null;
                        e.target.src = "/newassets/blog1.png";
                    }}
                />

                {/* Floating arrow button */}
                <div className="absolute -bottom-1 -right-2 w-12 h-12 bg-white rounded-full flex items-center justify-center ">
                    <div className="w-9 h-9 bg-[#6E0000] rounded-full flex items-center justify-center">
                        <ArrowUpRight className="w-5 h-5 text-white font-semibold" />
                    </div>
                </div>
            </div>

            <h3 className="text-[#6E0000] font-medium mb-2 leading-tight line-clamp-3">
                {post.title}
            </h3>
            <p className="text-gray-900 text-sm">{post.date}</p>
        </div>
    );

    // Loading skeleton component
    const LoadingSkeleton = () => (
        <div className="group">
            <div className="relative mb-4 overflow-visible">
                <div className="w-full h-48 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="absolute -bottom-1 -right-2 w-12 h-12 bg-gray-100 rounded-full animate-pulse"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </div>
    );

    return (
        <section className="py-16 px-4 container mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
                <h2 className="relative inline-block text-2xl sm:text-3xl lg:text-4xl font-semibold text-black mb-4 
  after:content-[''] after:block after:w-20 md:after:w-28 after:h-1 after:bg-[#6E0000] after:rounded-full after:mt-2 after:mx-auto">
                    Articles
                </h2>

                <p className="text-[#6E0000] max-w-2xl mx-auto leading-relaxed">
                    The mission and teachings of Swami Avdheshanand Giri are regularly and widely covered by national and
                    international media.
                </p>
            </div>

            {/* Blog Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {loading ? (
                    // Show loading skeletons
                    Array.from({ length: 3 }, (_, index) => (
                        <LoadingSkeleton key={index} />
                    ))
                ) : (
                    // Show actual blog posts
                    blogPosts.map((post) => (
                        <BlogCard key={post.id} post={post} />
                    ))
                )}
            </div>

            {/* View More Button */}
            <div className="flex items-center justify-center mt-6 space-x-0">
                {/* Main red pill button */}
                <button 
                    onClick={() => navigate("/articles")} 
                    className="bg-[#6E0000] text-white hover:shadow-xl
                      transform transition-all duration-500 ease-in-out
                      hover:-translate-y-1 px-8 py-2 rounded-full font-medium"
                >
                    View More Articles
                </button>

                {/* Arrow inside a circle */}
                <span className="w-9 h-9 flex items-center hover:shadow-xl
                  transform transition-all duration-500 ease-in-out
                  hover:-translate-y-1 justify-center rounded-full bg-[#6E0000] text-white">
                    <ArrowUpRight className="w-5 h-5" />
                </span>
            </div>
        </section>
    );
}
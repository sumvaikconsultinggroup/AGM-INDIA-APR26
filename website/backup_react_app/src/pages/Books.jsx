import { useState, useEffect } from "react";
import axios from "axios";
import {  MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Star } from "lucide-react";
import BookStore from "../components/BookStore";

import { useTranslation } from "react-i18next"; // Add this import

function Books() {
  const { t } = useTranslation(); // Add translation hook
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [loading, setLoading] = useState(true);
  const [selectedBookIndex, setSelectedBookIndex] = useState(null);
  const [error, setError] = useState(null);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(import.meta.env.VITE_APP_BOOKS_API);

      if (response.data && Array.isArray(response.data.data)) {
        // Format the data to match our component needs
        const formattedBooks = response.data.data.map((book) => ({
          id: book._id || book.id,
          title: book.title || t("books.untitledBook"),
          author: book.author || t("books.defaultAuthor"),
          price: book.price || 199,
          discount: book.discount || 0,
          image: book.image || book.coverImage || book.thumbnail || "/assets/videoseries/Book1.jpg",
          inStock: book.stock?.available > 0 || true,
          tag: book.discount ? `${book.discount}% ${t("common.off")}` : null,
          rating: (4 + Math.random()).toFixed(1),
          reviews: Math.floor(Math.random() * 200) + 50,
          category: book.genre || t("books.defaultGenre"),
          description: book.description || t("books.noDescription"),
          language: book.language || t("books.defaultLanguage"),
          pages: book.pages || null,
          publishedDate: book.publishedDate || null,
          ISBN: book.ISBN || null,
          genre: book.genre || t("books.defaultGenre"),
        }));

        setBooks(formattedBooks);

        // Extract unique genres for categories filter
        const genres = [
          t("common.all"),
          ...new Set(formattedBooks.map((book) => book.genre).filter(Boolean)),
        ];
        setCategories(genres);
      } else {
        throw new Error(t("errors.invalidResponseFormat"));
      }
    } catch (err) {
      console.error(t("errors.failedToFetchBooks"), err);
      setError(t("errors.failedToLoadBooksMessage"));
      // Fall back to sample data for development
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      fetchBooks();
    }, 1000);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const openModal = (book) => {
    const bookIndex = books.findIndex((b) => b.id === book.id);

    if (bookIndex !== -1) {
      setSelectedBookIndex(bookIndex);
      document.body.style.overflow = "hidden";
      console.log("Modal should be open now, selectedBookIndex:", bookIndex); // Debug log
    } else {
      console.error("Book not found in books array"); // Debug log
    }
  };

  const closeModal = () => {
    setSelectedBookIndex(null);
    document.body.style.overflow = "unset";
  };

  const navigateBook = (direction) => {
    if (selectedBookIndex === null) return;
    const newIndex = selectedBookIndex + direction;
    if (newIndex >= 0 && newIndex < books.length) {
      setSelectedBookIndex(newIndex);
    }
  };

  const formatDate = (date) => {
    if (!date) return t("common.unknown");
    return new Date(date).toLocaleDateString(t("locale"), {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fcf9f5] to-white flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#B82A1E] mb-4"></div>
        <h2 className="text-2xl font-serif text-[#5D4037] mb-2">{t("books.loadingTitle")}</h2>
        <p className="text-[#5D4037]/70 text-center">{t("books.loadingMessage")}</p>
      </div>
    );
  }

  // Error state with retry option
  if (error && books.length === 0) {
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
        <h2 className="text-2xl font-serif text-[#5D4037] mb-2">{t("books.errorTitle")}</h2>
        <p className="text-[#5D4037]/70 text-center mb-6">{t("books.errorMessage")}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-[#fcf9f5] to-white">
      {/* Hero Section with Parallax */}
      <div className="relative h-[530px] overflow-hidden flex items-center justify-center">
        {/* Background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/placeholder.svg?height=1080&width=1920')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-[#7B0000] z-10 h-full w-full"></div>

        {/* Content */}
        <div className="relative z-20 text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-serif mb-4">{t("books.hero.title")}</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto font-light">
            {t("books.hero.subtitle")}
          </p>
          <div className="mt-8 inline-block">
            <div className="h-0.5 w-20 bg-white/70 mx-auto"></div>
            <div className="h-0.5 w-12 bg-white/50 mx-auto mt-1"></div>
            <div className="h-0.5 w-6 bg-white/30 mx-auto mt-1"></div>
          </div>
        </div>

        {/* Decorative Om Symbol */}
        <div className="absolute bottom-4 right-4 text-white/20 text-6xl font-serif z-10">ॐ</div>
      </div>

      <div className="container mx-auto px-4">
        {/* Search and Categories Section */}
        <div className="bg-white shadow-sm rounded-lg mt-8 p-6">
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder={t("books.searchPlaceholder")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B82A1E]/30 focus:border-[#B82A1E]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="absolute right-2 top-2 p-1 bg-[#B82A1E]/10 text-[#B82A1E] rounded-md hover:bg-[#B82A1E]/20 transition-colors">
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex justify-center overflow-x-auto pb-4 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`flex-shrink-0 px-6 py-2 rounded-full mr-3 transition-colors ${
                  selectedCategory === category
                    ? "bg-[#B82A1E] text-white"
                    : "bg-[#fcf9f5] text-[#5D4037] hover:bg-[#B82A1E]/10"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Main Book Store Section */}
        <div className="my-24">
          <div className="max-w-7xl mx-auto mb-12">
            <div className="flex items-center mb-8">
              <div className="w-1.5 h-12 bg-gradient-to-b from-[#B82A1E] to-[#8a1f16] mr-4 rounded-full"></div>
              <h2 className="text-3xl md:text-4xl font-serif text-[#5D4037]">
                {selectedCategory === t("common.all") ? t("books.sectionTitle") : selectedCategory}
              </h2>
            </div>
            <p className="text-[#5D4037]/80 leading-relaxed max-w-3xl">
              {t("books.sectionDescription")}
            </p>
          </div>

          {/* Show error message if there was an issue loading books */}
          {error && (
            <div className="max-w-7xl mx-auto bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error} - {t("books.showingFallbackData")}
              <button onClick={handleRetry} className="ml-2 underline hover:text-red-800">
                {t("common.tryAgain")}
              </button>
            </div>
          )}

          {/* BookStore Component - Use the same container width as the section header */}
          <div className="max-w-7xl mx-auto">
            <BookStore
              books={books}
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
              onBookClick={openModal}
            />
          </div>
        </div>

        {/* Features Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#fcf9f5] p-8 rounded-2xl shadow-sm mb-16">
          <div className="text-center">
            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-serif text-xl text-[#5D4037] mb-2">
              {t("books.features.support.title")}
            </h3>
            <p className="text-[#5D4037]/70 text-sm">{t("books.features.support.description")}</p>
          </div>
          <div className="text-center">
            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
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
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="font-serif text-xl text-[#5D4037] mb-2">
              {t("books.features.securePay.title")}
            </h3>
            <p className="text-[#5D4037]/70 text-sm">{t("books.features.securePay.description")}</p>
          </div>
        </section>

        {/* Quote Section */}
        <div className="relative my-16 py-16 overflow-hidden">
          <div className="absolute inset-0 bg-[#B82A1E]/5 -skew-y-2"></div>
          <div className="relative max-w-4xl mx-auto px-4 text-center">
            <svg
              className="mx-auto text-[#B82A1E]/30 mb-6 h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
            <blockquote className="text-2xl md:text-3xl font-serif text-[#5D4037] italic mb-6">
              {t("books.quote")}
            </blockquote>
            <div className="h-0.5 w-20 bg-[#B82A1E]/30 mx-auto mb-4"></div>
            <p className="text-[#5D4037] font-medium">{t("books.quoteAuthor")}</p>
          </div>
        </div>

        {/* Book Detail Modal */}
        {selectedBookIndex !== null && books.length > 0 && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
            onClick={closeModal}
          >
            <div className="relative flex items-center justify-center w-[90vw] h-[90vh]">
              {/* Left Arrow */}
              {selectedBookIndex > 0 && (
                <button
                  className="absolute left-4 p-2 text-white hover:text-[#f3c78b] transition-colors z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateBook(-1);
                  }}
                  aria-label={t("common.previous")}
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
              )}

              {/* Book Content */}
              <div
                className="bg-white rounded-lg shadow-2xl overflow-hidden max-w-3xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-2/5">
                    <img
                      src={books[selectedBookIndex].image}
                      alt={books[selectedBookIndex].title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 md:w-3/5">
                    <h3 className="text-xl font-bold mb-2">{books[selectedBookIndex].title}</h3>
                    <p className="text-gray-600 italic mb-3 text-sm">
                      {books[selectedBookIndex].subtitle}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="ml-1 text-sm font-medium">
                          {books[selectedBookIndex].rating}
                        </span>
                      </div>
                      <span className="mx-2 text-gray-300">|</span>
                      <span className="text-xs text-gray-500">
                        {books[selectedBookIndex].reviews} {t("books.reviews")}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center">
                        <span className="text-gray-500 w-20">{t("books.author")}:</span>
                        <span className="font-medium">{books[selectedBookIndex].author}</span>
                      </div>

                      {books[selectedBookIndex].publishedDate && (
                        <div className="flex items-center">
                          <span className="text-gray-500 w-20">{t("books.published")}:</span>
                          <span>{formatDate(books[selectedBookIndex].publishedDate)}</span>
                        </div>
                      )}

                      {books[selectedBookIndex].language && (
                        <div className="flex items-center">
                          <span className="text-gray-500 w-20">{t("books.language")}:</span>
                          <span>{books[selectedBookIndex].language}</span>
                        </div>
                      )}

                      {books[selectedBookIndex].pages > 0 && (
                        <div className="flex items-center">
                          <span className="text-gray-500 w-20">{t("books.pages")}:</span>
                          <span>{books[selectedBookIndex].pages}</span>
                        </div>
                      )}

                      <div className="flex items-center">
                        <span className="text-gray-500 w-20">{t("books.status")}:</span>
                        <span
                          className={
                            books[selectedBookIndex].inStock ? "text-green-600" : "text-red-600"
                          }
                        >
                          {books[selectedBookIndex].inStock
                            ? t("books.inStock")
                            : t("books.outOfStock")}
                        </span>
                      </div>
                    </div>

                    <h4 className="font-semibold mb-1 text-sm">{t("books.description")}</h4>
                    <p className="text-gray-700 mb-4 overflow-y-auto max-h-24 text-sm">
                      {books[selectedBookIndex].description || t("books.noDescription")}
                    </p>

                  </div>
                </div>
              </div>

              {/* Right Arrow */}
              {selectedBookIndex < books.length - 1 && (
                <button
                  className="absolute right-4 p-2 text-white hover:text-[#f3c78b] transition-colors z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateBook(1);
                  }}
                  aria-label={t("common.next")}
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    </div>
  );
}

export default Books;

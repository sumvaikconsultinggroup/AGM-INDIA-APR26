import { useState, useEffect } from "react";
import axios from "axios";
import { Star, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next"; // Add this import
import { MoveUpRight } from 'lucide-react';
const Books = () => {
  const { t } = useTranslation(); // Add translation hook
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBookIndex, setSelectedBookIndex] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await axios.get(import.meta.env.VITE_APP_BOOKS_API);

        if (response.data && Array.isArray(response.data.data)) {
          // Format the books data according to our component needs
          const formattedBooks = response.data.data.map((book) => ({
            title: book.title || t("books.untitledBook"),
            subtitle: book.genre || t("books.defaultGenre"),
            author: book.author || t("books.defaultAuthor"),
            publishedDate: book.publishedDate ? new Date(book.publishedDate) : null,
            genre: book.genre || "",
            language: book.language || t("books.defaultLanguage"),
            ISBN: book.ISBN || "",
            description: book.description || t("books.noDescription"),
            image: book.coverImage || "/assets/videoseries/default-book.jpg",
            pages: book.pages || 0,
            availability: book.stock?.available ? t("books.inStock") : t("books.outOfStock"),
            stockCount: book.stock?.count || 0,
            // Additional fields for enhanced modal display
            price: book.price || 299,
            discount: book.discount || 0,
            rating: (4 + Math.random()).toFixed(1), // Generate random rating
            reviews: Math.floor(Math.random() * 200) + 50, // Generate random reviews
            inStock: book.stock?.available > 0,
          }));

          setBooks(formattedBooks);
        } else {
          throw new Error(t("errors.invalidResponseFormat"));
        }
      } catch (err) {
        console.error(t("errors.failedToLoadBooks"), err);
        setError(t("errors.failedToLoadBooksMessage"));
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [t]); // Add t as a dependency

  const navigateBook = (direction) => {
    const newIndex = selectedBookIndex + direction;
    if (newIndex >= 0 && newIndex < books.length) {
      setSelectedBookIndex(newIndex);
    }
  };

  const openModal = (idx) => {
    setSelectedBookIndex(idx);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setSelectedBookIndex(null);
    document.body.style.overflow = "unset";
  };

  const formatDate = (date) => {
    if (!date) return t("common.unknown");
    return new Date(date).toLocaleDateString(t("locale"), {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto px-4 pb-16">
        <div className="absolute top-0 right-0 transform -translate-y-48 w-80 h-90 rotate-180 pointer-events-none opacity-45">
          <img
            src="/newassets/inbtwpattern.png"
            alt="decorative pattern"
            className="w-full h-full object-contain"
          />
        </div>
      <div className="mb-2">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl mb-10 text-center font-semibold w-full relative inline-block after:block after:w-32 md:after:w-40 after:h-1 after:bg-[#6E0000] after:mx-auto after:rounded-xl after:mt-2">
          {t("books.sectionTitle")}
        </h2>
        <p className="text-lg text-[#6E0000] mb-4 max-w-5xl mx-auto text-center">
          {t("books.sectionDescription")}
        </p>

        <div className="mb-2 max-w-10xl w-full flex flex-col items-center justify-center">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4 sm:mb-8 text-center">
            <p className="text-lg text-[#6E0000]">{t("books.impactStatement")}</p>
            <p className="text-lg font-semibold text-[#6E0000]">{t("books.callToAction")}</p>
          </div>
        </div>

      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-10 bg-red-50 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-red-400"
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
          <h3 className="mt-2 text-lg font-semibold text-gray-900">
            {t("errors.somethingWentWrong")}
          </h3>
          <p className="mt-1 text-gray-600">{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
            onClick={() => window.location.reload()}
          >
            {t("common.tryAgain")}
          </button>
        </div>
      )}

      {/* No Books Available */}
      {!loading && !error && books.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-100">
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
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <h3 className="mt-2 text-xl font-medium text-gray-900">{t("books.noBooksAvailable")}</h3>
          <p className="mt-1 text-gray-500">{t("books.newLiteratureSoon")}</p>
        </div>
      )}

      {/* Books Display */}
      {!loading && !error && books.length > 0 && (
        <div className="flex overflow-x-auto space-x-6 scrollbar-hide py-4">
          {books.map((book, idx) => (
            <div
              key={idx}
              className="min-w-[230px] max-w-[230px] text-center cursor-pointer"
              onClick={() => openModal(idx)}
            >
              <div className="bg-[#F9D3CF] h-[320px] rounded-md shadow-md overflow-hidden mb-4 hover:scale-105 transition">
                <img src={book.image} alt={book.title} className="w-full h-full object-contain" />
              </div>
              <h3 className="text-lg font-medium truncate">{book.title}</h3>
              <p className="italic text-gray-600 text-sm truncate">{book.subtitle}</p>
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Modal - Make it more compact */}
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

            {/* Book Content - Smaller max width */}
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

                    {/* Price display */}
                    {/* <div className="flex items-center">
                      <span className="text-gray-500 w-20">{t("books.price")}:</span>
                      {books[selectedBookIndex].discount ? (
                        <div className="flex items-center">
                          <span className="font-bold text-[#B82A1E]">
                            ₹
                            {Math.round(
                              books[selectedBookIndex].price *
                              (1 - books[selectedBookIndex].discount / 100)
                            )}
                          </span>
                          <span className="ml-2 text-sm text-gray-500 line-through">
                            ₹{books[selectedBookIndex].price}
                          </span>
                        </div>
                      ) : (
                        <span className="font-bold text-[#B82A1E]">
                          ₹{books[selectedBookIndex].price}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center">
                      <span className="text-gray-500 w-20">{t("books.status")}:</span>
                      <span
                        className={
                          books[selectedBookIndex].inStock ? "text-green-600" : "text-red-600"
                        }
                      >
                        {books[selectedBookIndex].availability}
                      </span>
                    </div> */}
                  </div>

                  <h4 className="font-semibold mb-1 text-sm">{t("books.description")}</h4>
                  <p className="text-gray-700 mb-4 overflow-y-auto max-h-24 text-sm">
                    {books[selectedBookIndex].description || t("books.noDescription")}
                  </p>

                  {/* <div className="flex space-x-3">
                    <button className="bg-[#8a1f16] text-white px-4 py-1.5 rounded text-sm transition flex items-center">
                      <ShoppingBag className="h-3 w-4 mr-1" />
                      <Link to={"/books"}>{t("books.orderNow")}</Link>
                    </button>
                  </div> */}
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

      <div className="mt-5 text-center italic text-[#6E0000]  py-2 rounded-lg mx-auto max-w-4xl">
        {t("books.quote")}
        <div className="flex items-center  justify-center mt-6 space-x-0">
          {/* Main red pill button */}
          <button  onClick={() => navigate("/books")} className="bg-[#6E0000] hover:shadow-xl
  transform transition-all duration-500 ease-in-out
  hover:-translate-y-1  text-white px-8 py-3 rounded-full  font-medium">
            View More
          </button>

          {/* Arrow inside a circle */}
          <span className="w-10 h-10 flex items-center hover:shadow-xl
  transform transition-all duration-500 ease-in-out
  hover:-translate-y-1 justify-center rounded-full bg-[#6E0000] text-white">
            <MoveUpRight className="w-5 h-5" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default Books;

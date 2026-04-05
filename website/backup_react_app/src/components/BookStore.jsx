import { StarIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";

const BookStore = ({ books,  selectedCategory, searchQuery, onBookClick }) => {
  const { t } = useTranslation();

  // Filter books based on genre (now represented by category) and search query
  const filteredBooks = books.filter((book) => {
    const matchesCategory =
      selectedCategory === "All" || book.genre === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.description &&
        book.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  // If no books match the filters
  if (filteredBooks.length === 0) {
    return (
      <div className="text-center py-16 bg-[#fcf9f5] rounded-2xl p-6">
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
          {t("books.noBooksFound")}
        </h3>
        <p className="text-[#5D4037]/70">
          {t("books.tryDifferentSearch")}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
      {filteredBooks.map((book) => {

        return (
          <div
            key={book.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onBookClick && onBookClick(book)} // Add this click handler
          >
            <div className="relative h-60 overflow-hidden">
              <img
                src={book.image}
                alt={book.title}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/assets/videoseries/Book1.jpg";
                }}
              />
              {book.tag && (
                <div className="absolute top-0 right-0 bg-[#B82A1E] text-white text-xs font-bold px-3 py-1">
                  {book.tag}
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <div className="flex items-center text-white">
                  <StarIcon className="h-4 w-4 text-yellow-400" />
                  <span className="ml-1 text-sm font-medium">{book.rating}</span>
                  <span className="mx-1 text-xs">•</span>
                  <span className="text-xs">
                    {book.reviews} {t("books.reviews")}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-medium text-[#5D4037] text-sm md:text-base line-clamp-2 h-12">
                {book.title}
              </h3>
              <p className="text-[#5D4037]/70 text-xs mb-3">{book.author}</p>
              {/* Price and cart section commented out as in original */}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BookStore;
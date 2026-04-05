import { StarIcon } from "@heroicons/react/24/solid";

export default function BookCard({ book, onAddToCart }) {
  const discountedPrice =
    book.price - (book.price * (book.discount || 0)) / 100;

  return (
    <div className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="relative aspect-[3/4] overflow-hidden">
        {book.tag && (
          <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs px-3 py-1 rounded-full z-10">
            {book.tag}
          </span>
        )}
        <img
          src={book.image}
          alt={book.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-800 line-clamp-2 mb-1 group-hover:text-orange-500 transition-colors">
          {book.title}
        </h3>
        <p className="text-sm text-gray-600 mb-2">{book.author}</p>

        {/* Rating */}
        {book.rating && (
          <div className="flex items-center mb-3">
            <div className="flex items-center text-yellow-400">
              <StarIcon className="h-4 w-4" />
              <span className="ml-1 text-sm font-medium">{book.rating}</span>
            </div>
            <span className="text-xs text-gray-500 ml-2">
              ({book.reviews} reviews)
            </span>
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-lg font-bold text-gray-900">
              ₹{discountedPrice}
            </span>
            {book.discount && (
              <span className="ml-2 text-sm text-gray-500 line-through">
                ₹{book.price}
              </span>
            )}
          </div>
          {book.freeDelivery && (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              Free Delivery
            </span>
          )}
        </div>

        <button
          onClick={() => onAddToCart(book)}
          className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
}

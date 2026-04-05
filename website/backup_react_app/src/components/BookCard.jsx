import React from "react";
import { Star, ShoppingBag } from "lucide-react";



const BookCard = ({ book, addToCart }) => {``
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      {/* Book Image */}
      <div className="relative">
        <div className="relative h-64 w-full overflow-hidden">
          <img
            src={book.image || "/placeholder.svg"} 
            alt={book.title}
            className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
          />
        </div>

        {/* Tag (discount only) */}
        {book.tag && (
          <div className="absolute top-2 right-2 bg-[#B82A1E] text-white text-xs px-2 py-1 rounded">
            {book.tag}
          </div>
        )}
      </div>

      {/* Book Details */}
      <div className="p-4">
        <h3 className="font-serif text-lg font-medium text-[#5D4037] mb-1 line-clamp-2">{book.title}</h3>
        <p className="text-[#5D4037]/70 text-sm mb-2">{book.author}</p>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span className="ml-1 text-sm font-medium">{book.rating}</span>
          </div>
          <span className="mx-2 text-gray-300">|</span>
          <span className="text-xs text-[#5D4037]/60">{book.reviews} reviews</span>
        </div>

        {/* Genre */}
        {book.genre && (
          <div className="mb-2">
            <span className="inline-block px-2 py-1 bg-[#B82A1E]/10 text-[#B82A1E] rounded text-xs">
              {book.genre}
            </span>
          </div>
        )}

        {/* Description */}
        <p className="text-[#5D4037]/70 text-sm mb-4 line-clamp-2">{book.description}</p>

        {/* Additional Book Info */}
        <div className="flex flex-wrap text-xs text-[#5D4037]/70 mb-3 gap-x-2 gap-y-1">
          {book.language && (
            <span>{book.language}</span>
          )}
          {book.pages && (
            <span>{book.pages} pages</span>
          )}
          {book.publishedDate && (
            <span>Published: {new Date(book.publishedDate).getFullYear()}</span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div>
            {book.discount ? (
              <div className="flex items-center">
                <span className="text-lg font-bold text-[#B82A1E]">
                  ₹{Math.round(book.price * (1 - book.discount / 100))}
                </span>
                <span className="ml-2 text-sm text-[#5D4037]/60 line-through">₹{book.price}</span>
              </div>
            ) : (
              <span className="text-lg font-bold text-[#B82A1E]">₹{book.price}</span>
            )}
          </div>

          {/* Stock Indicator */}
          <span className={`text-xs ${book.inStock ? 'text-green-600' : 'text-red-600'}`}>
            {book.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        {/* ISBN */}
        {book.ISBN && (
          <div className="text-xs text-[#5D4037]/60 mb-3">
            ISBN: {book.ISBN}
          </div>
        )}

        {/* Add to Cart Button */}
        <button
          onClick={() => addToCart(book)}
          disabled={!book.inStock}
          className={`w-full py-2 rounded-md transition-colors flex items-center justify-center ${
            book.inStock 
              ? 'bg-[#B82A1E]/10 text-[#B82A1E] hover:bg-[#B82A1E]/20' 
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          <ShoppingBag className="h-4 w-4 mr-2" />
          {book.inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
};

export default BookCard;
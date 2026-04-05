import React, { useEffect, useRef } from "react";
import { XMarkIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  removeFromCart,
  updateQuantity,
  getCartTotal,
  translations,
}) {
  const drawerRef = useRef(null);

  // Close drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target) && isOpen) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      ></div>
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white z-50 shadow-xl transform transition-transform ease-in-out duration-300">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-medium text-[#5D4037]">
            {translations.title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label={translations.close}
          >
            <XMarkIcon className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 p-4">
            <svg
              className="h-16 w-16 text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <p className="text-gray-500 text-center">{translations.empty}</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 divide-y">
              {cart.map((item) => {
                const itemTotal = item.discount
                  ? Math.round(item.price * (1 - item.discount / 100)) * item.quantity
                  : item.price * item.quantity;

                return (
                  <div key={item.id} className="py-4 flex">
                    <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover object-center"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/assets/videoseries/Book1.jpg";
                        }}
                      />
                    </div>
                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <h3 className="text-sm line-clamp-2">{item.title}</h3>
                          <p className="ml-4">₹{itemTotal}</p>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">{item.author}</p>
                      </div>
                      <div className="flex flex-1 items-end justify-between text-sm">
                        <div className="flex items-center">
                          <span className="text-gray-500 mr-2">
                            {translations.quantity}
                          </span>
                          <select
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item.id, parseInt(e.target.value))
                            }
                            className="rounded border-gray-300 text-sm py-1 px-2 focus:ring-[#B82A1E] focus:border-[#B82A1E]"
                          >
                            {[...Array(10).keys()].map((num) => (
                              <option key={num + 1} value={num + 1}>
                                {num + 1}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="font-medium text-[#B82A1E] hover:text-[#9a231a]"
                        >
                          <TrashIcon
                            className="h-5 w-5"
                            aria-label={translations.remove}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-gray-200 p-4 space-y-4">
              <div className="flex justify-between text-base font-medium text-gray-900">
                <p>{translations.subtotal}</p>
                <p>₹{getCartTotal()}</p>
              </div>
              <div className="mt-6">
                <button className="w-full bg-[#B82A1E] px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-[#9a231a] focus:outline-none rounded-md">
                  {translations.checkout}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

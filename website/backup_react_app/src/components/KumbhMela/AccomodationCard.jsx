import { useState } from "react";
import { Users, Check, MapPin, X, ChevronLeft, ChevronRight, Info } from "lucide-react";

const AccommodationCard = ({
  title,
  price,
  capacity,
  perPerson,
  features,
  image,
  description,
  place,
  available,
  additionalImages = [],
  dates = [],
}) => {
  const [showGallery, setShowGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  const allImages = [image, ...additionalImages].filter(Boolean);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-lg transition-all hover:shadow-xl">
      <div
        className="relative h-48 cursor-pointer"
        onClick={() => allImages.length > 1 && setShowGallery(true)}
      >
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/20" />

        {!available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rotate-12 bg-red-500 px-6 py-2 font-bold text-white">
              Not Available
            </span>
          </div>
        )}

        {allImages.length > 1 && (
          <div className="absolute top-2 right-2 rounded-full bg-white/80 px-2 py-1 text-xs font-semibold text-gray-700">
            {allImages.length} photos
          </div>
        )}

        {place && (
          <div className="absolute top-2 left-2 flex items-center rounded-full bg-white/80 px-2 py-1 text-xs font-semibold text-gray-700">
            <MapPin className="mr-1 h-3 w-3" />
            {place}
          </div>
        )}

        <h3 className="absolute bottom-4 left-4 text-2xl font-bold text-white drop-shadow-lg">
          {title}
        </h3>
      </div>

      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-orange-500">{price}</p>
            {perPerson && <p className="text-sm text-gray-600">or {perPerson} per person</p>}
          </div>
          <div className="flex items-center text-gray-600">
            <Users className="mr-2 h-5 w-5" />
            <span>{capacity}</span>
          </div>
        </div>

        {dates.length > 0 && (
          <div className="mb-4">
            <p className="mb-1 font-medium text-gray-700">Available dates:</p>
            <div className="flex flex-wrap gap-1">
              {dates.slice(0, 3).map((date, index) => (
                <span
                  key={index}
                  className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800"
                >
                  {formatDate(date)}
                </span>
              ))}
              {dates.length > 3 && (
                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                  +{dates.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="mb-4">
          <ul className="space-y-2">
            {features.slice(0, 4).map((feature, index) => (
              <li key={index} className="flex items-center text-gray-600">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                {feature}
              </li>
            ))}
            {features.length > 4 && (
              <li className="text-sm text-gray-500">+{features.length - 4} more amenities</li>
            )}
          </ul>
        </div>

        <div className="mt-5 flex justify-between">
          {description && (
            <button
              onClick={() => setShowDetails(true)}
              className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              <Info className="mr-1 h-4 w-4" />
              More details
            </button>
          )}

          <button
            className={`rounded-lg px-6 py-2 text-white transition-colors ${
              available ? "bg-orange-500 hover:bg-orange-600" : "cursor-not-allowed bg-gray-400"
            }`}
            disabled={!available}
          >
            {available ? "Book Now" : "Unavailable"}
          </button>
        </div>
      </div>

      {/* Image Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative h-full max-h-[80vh] w-full max-w-3xl">
            <img
              src={allImages[currentImageIndex]}
              alt={`${title} - image ${currentImageIndex + 1}`}
              className="h-full w-full object-contain"
            />

            <button
              onClick={() => setShowGallery(false)}
              className="absolute top-4 right-4 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
            >
              <X size={24} />
            </button>

            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
            >
              <ChevronRight size={24} />
            </button>

            <div className="absolute bottom-4 left-0 right-0 text-center text-white">
              {currentImageIndex + 1} / {allImages.length}
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6">
            <button
              onClick={() => setShowDetails(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>

            <h3 className="mb-4 text-2xl font-bold">{title}</h3>

            {place && (
              <p className="mb-4 flex items-center text-gray-600">
                <MapPin className="mr-2 h-5 w-5" /> {place}
              </p>
            )}

            <p className="mb-6 text-gray-700">{description}</p>

            <h4 className="mb-2 font-semibold">Amenities:</h4>
            <ul className="mb-6 grid grid-cols-2 gap-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center text-gray-600">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>

            {dates.length > 0 && (
              <>
                <h4 className="mb-2 font-semibold">Available dates:</h4>
                <div className="mb-6 flex flex-wrap gap-2">
                  {dates.map((date, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-green-100 px-2 py-1 text-sm text-green-800"
                    >
                      {formatDate(date)}
                    </span>
                  ))}
                </div>
              </>
            )}

            <div className="mt-4 flex justify-end">
              <button
                className={`rounded-lg px-6 py-2 text-white transition-colors ${
                  available ? "bg-orange-500 hover:bg-orange-600" : "cursor-not-allowed bg-gray-400"
                }`}
                disabled={!available}
              >
                {available ? "Book Now" : "Unavailable"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccommodationCard;

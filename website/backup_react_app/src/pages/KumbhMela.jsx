import React, { useState, useEffect } from "react";
import axios from "axios";
import KumbhBanner from "../components/KumbhMela/KumbhBanner";
import KumbhInfo from "../components/KumbhMela/KumbhInfo";
import AccommodationCard from "../components/KumbhMela/AccomodationCard";
import MultipleStepForm from "../components/KumbhMela/BookingStructure/BookingMultipartForm";


const KumbhMela = () => {
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAccommodations = async () => {
      try {
        setLoading(true);
        const response = await axios.get(import.meta.env.VITE_APP_ROOMS_API);

      
        // Transform the backend data to match the structure expected by AccommodationCard
        const formattedAccommodations = response.data.data.map((item) => ({
          id: item._id,
          title: item.name,
          price: `₹${item.price}/day`,
          capacity: `Up to ${item.occupancy} ${item.occupancy > 1 ? "people" : "person"}`,
          features: item.amenities || [],
          description: item.description,
          image: item.images && item.images.length > 0
            ? `${import.meta.env.VITE_API_BASE_URL}${item.images[0]}`
            : "https://via.placeholder.com/500x300?text=No+Image",
          available: item.available && !item.isBooked,
          place: item.place,
          additionalImages: item.images?.slice(1).map(img => `${import.meta.env.VITE_API_BASE_URL}${img}`) || [],
          dates: item.date ? item.date.map(date => new Date(date)) : [],
          perPerson: item.occupancy > 1 ? `₹${Math.round(item.price/item.occupancy)}/person` : null,
          email: item.email,
        }));

        setAccommodations(formattedAccommodations);
      } catch (err) {
        console.error("Failed to fetch accommodations:", err);
        setError("Failed to load accommodation options. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAccommodations();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <KumbhBanner />

      <div className="container mx-auto px-4 pb-16">
        <div className="mb-12">
          <KumbhInfo />
        </div>

        <h2 className="mb-6 text-2xl font-bold text-gray-900">Available Accommodations</h2>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-8">
            <p>{error}</p>
          </div>
        ) : accommodations.length > 0 ? (
          <div className="mb-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {accommodations.map((accommodation, index) => (
              <AccommodationCard key={accommodation.id || index} {...accommodation} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No accommodations available at this time.</p>
          </div>
        )}

        <div className="py-12 mb-8 bg-[#fff5f1]">
          <MultipleStepForm accommodationOptions={accommodations} />
        </div>

        <div className="flex justify-center items-center gap-8">
          <div className="flex-1 max-w-lg rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-xl font-semibold">Need Help?</h3>
            <p className="mb-4 text-gray-700">
              Contact our support team for assistance with bookings or any queries.
            </p>
            <button className="w-full rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KumbhMela;

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import axios from "axios";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { talks as fallbackTalks } from "../../data/talks"; // Keep as fallback

const TalksCarousel = () => {
  const [talks, setTalks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTalks = async () => {
      try {
        setLoading(true);
        // Use your API endpoint from environment variable
        const response = await axios.get(import.meta.env.VITE_APP_TALKS_API);

        if (response.data && Array.isArray(response.data.data)) {
          // Format the data based on your API response structure
          const formattedTalks = response.data.data.map((talk) => ({
            id: talk._id || talk.id || Math.random().toString(36).substring(7),
            institution: talk.institution || talk.title || "Untitled Talk",
            image: talk.image || talk.coverImage || "/placeholder.svg?height=360&width=480",
            date: talk.date ? new Date(talk.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : "Date not specified",
            // Add any other properties you need from the API response
          }));

          setTalks(formattedTalks);
        } else {
          throw new Error("Invalid data structure received from API");
        }
      } catch (err) {
        console.error("Failed to fetch talks:", err);
        // Fall back to static data
        setTalks(fallbackTalks);
        setError("Failed to load talks. Using local data instead.");
      } finally {
        setLoading(false);
      }
    };

    fetchTalks();
  }, []);

  if (loading) {
    return (
      <div className="w-full py-12 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8a1f16]"></div>
      </div>
    );
  }

  return (
    <div
      className="w-full py-16 relative overflow-hidden"
      dir="rtl"
      style={{ backgroundColor: "#FFFAF0" }}
    >
      {/* Pattern Layer with Opacity */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/newassets/institutionPattern.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "auto",
          opacity: 0.3, // adjust opacity here (0.1 = very light, 0.3 = darker)
        }}
      ></div>

      {/* Content Layer */}
      <div className="relative z-10">
        {error && (
          <div className="mb-4 text-amber-600 bg-[#FFF4E5] px-4 py-2 rounded-md text-sm">
            {error}
          </div>
        )}

        <Swiper
          loop={true}
          allowTouchMove={false}
          modules={[Navigation, Autoplay]}
          spaceBetween={16}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            reverseDirection: true, // important for RTL
          }}
          speed={5000}
          breakpoints={{
            320: { slidesPerView: 1, spaceBetween: 10 },
            480: { slidesPerView: 2, spaceBetween: 12 },
            768: { slidesPerView: 3, spaceBetween: 14 },
            1024: { slidesPerView: 4, spaceBetween: 16 },
          }}
          className="w-full"
        >
          {talks.map((talk) => (
            <SwiperSlide key={talk.id}>
              <div className="flex flex-col">
                {/* Rounded Image */}
                <img
                  src={talk.image}
                  alt={talk.institution}
                  className="w-full h-56 object-cover object-center rounded-2xl"
                />

                {/* Text content with spacing */}
                <div className="px-2 mt-4">
                  <h3 className="font-normal text-lg text-[#6E0000]">{talk.institution}</h3>
                  <p className="text-sm text-[#6E0000] mt-1">{talk.date}</p>
                </div>
              </div>
            </SwiperSlide>


          ))}
        </Swiper>
      </div>
    </div>


  );
};

export default TalksCarousel;

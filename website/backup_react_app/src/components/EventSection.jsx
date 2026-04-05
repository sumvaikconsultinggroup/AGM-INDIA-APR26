import { useState, useEffect } from "react";
import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext"; // Adjust path as needed

const EventsSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // State management
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registeringEvents, setRegisteringEvents] = useState({});
  const [registeredEventIds, setRegisteredEventIds] = useState([]);

  // Fetch user's registered events
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const fetchUserRegistrations = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/api/users/${user.id}/registrations`
          );
          if (response.data.success && Array.isArray(response.data.registeredEvents)) {
            setRegisteredEventIds(response.data.registeredEvents);
            localStorage.setItem(
              "registeredEvents",
              JSON.stringify(response.data.registeredEvents)
            );
          }
        } catch (err) {
          console.error("Failed to fetch user registrations:", err);
          // Fall back to localStorage if API fails
          const saved = localStorage.getItem("registeredEvents");
          if (saved) {
            setRegisteredEventIds(JSON.parse(saved));
          }
        }
      };

      fetchUserRegistrations();
    } else {
      // Clear registrations when logged out
      setRegisteredEventIds([]);
      localStorage.removeItem("registeredEvents");
    }
  }, [isAuthenticated, user?.id]);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get(import.meta.env.VITE_APP_EVENT_API);

        const formattedEvents = response.data.data.map((event) => ({
          id: event._id,
          title: event.eventName,
          date: new Date(event.eventDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          time: new Date(event.eventDate).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          location: event.eventLocation,
          description: event.description,
          expanded: false,
          image: event.eventImage || "/default-event-image.jpg",
          createdAt: event.createdAt,
        }));

        setEvents(formattedEvents);
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setError("Failed to load events. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Handle event registration
  const handleRegister = async (event) => {
    if (!isAuthenticated) {
      toast.info("Please login to register for events");
      navigate("/login", {
        state: { from: "/events", eventId: event.id },
      });
      return;
    }

    // Set loading for this specific event only
    setRegisteringEvents((prev) => ({
      ...prev,
      [event.id]: true,
    }));

    try {
      const response = await axios.post(import.meta.env.VITE_APP_REGISTER_EVENT_API, {
        eventId: event.id,
        userId: user.id,
      });

      if (response.data.success) {
        // Update local state only if API confirms success
        const newRegisteredEvents = [...registeredEventIds, event.id];
        setRegisteredEventIds(newRegisteredEvents);
        localStorage.setItem("registeredEvents", JSON.stringify(newRegisteredEvents));

        toast.success(response.data.message || "Registration successful!");
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message || "Failed to register for event");
      } else if (error.request) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("An unexpected error occurred.");
      }
      console.error("Registration error:", error);
    } finally {
      setRegisteringEvents((prev) => ({
        ...prev,
        [event.id]: false,
      }));
    }
  };

  // Render events list
  const renderEvents = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-10">
          <p className="text-red-600">{error}</p>
        </div>
      );
    }

    if (events.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-gray-600">No upcoming events at the moment.</p>
        </div>
      );
    }

    return events.map((event) => {
      const isRegistered = registeredEventIds.includes(event.id);

      return (
        <div key={event.id} className="py-6 border-b">
          <div className="flex flex-row gap-6 items-start">
            <div className="hidden md:block w-32 h-32 rounded-md overflow-hidden flex-shrink-0">
              <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-black text-lg">
                    {event.date} at {event.time}
                  </p>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-semibold text-[#6E0000]">{event.title}</h3>
                    <button
                      onClick={() => {
                        setEvents(
                          events.map((e) =>
                            e.id === event.id ? { ...e, expanded: !e.expanded } : e
                          )
                        );
                      }}
                      className="ml-2 focus:outline-none"
                      aria-label={event.expanded ? "Show less" : "Show more"}
                    >
                      {event.expanded ? (
                        <ChevronUp className="h-5 w-5 text-[#6E0000]" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-[#6E0000]" />
                      )}
                    </button>
                  </div>

                  {event.expanded && (
                    <div className="space-y-2 transition-all duration-200">
                      <p className="text-[#6E0000] text-lg">{event.location}</p>
                      <p className="text-[#6E0000]">{event.description}</p>
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0">
                  <div className="flex items-center justify-start sm:justify-start ">
                    {/* Main red pill button */}
                    <button
                      onClick={() => handleRegister(event)}
                      disabled={isRegistered || registeringEvents[event.id]}
                      className={`px-6 md:px-8 py-2 md:py-2.5 hover:shadow-xl
  transform transition-all duration-500 ease-in-out
  hover:-translate-y-1 rounded-full font-medium  
        ${
          isRegistered
            ? "bg-gray-400 cursor-not-allowed text-white"
            : "bg-[#6E0000] text-white hover:bg-[#8a1f16]"
        }`}
                    >
                      <span className="flex  items-center justify-center">
                        {registeringEvents[event.id] ? (
                          <>
                            <Loader2 className="animate-spin mr-2 h-4 w-4" />
                            Registering...
                          </>
                        ) : isRegistered ? (
                          "Already Registered"
                        ) : (
                          <>{t("events.register")}</>
                        )}
                      </span>
                    </button>

                    {/* Arrow inside a circle (disabled if already registered) */}
                    <span
                      className={`w-9 h-9 flex items-center hover:shadow-xl
  transform transition-all duration-500 ease-in-out
  hover:-translate-y-1 justify-center rounded-full
        ${
          isRegistered
            ? "bg-gray-500 text-white cursor-not-allowed"
            : "bg-[#6E0000] text-white hover:bg-[#8a1f16]"
        }`}
                    >
                      <ArrowUpRight className="w-5 h-5" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <section id="events" className="pt-16 pb-16 bg-white">
      <div className="container mx-auto px-4 min-w-[320px]">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl mb-4 text-center w-full font-semibold relative inline-block after:block after:rounded-lg md:after:w-32 after:w-24 after:h-1 after:bg-[#6E0000] after:mx-auto after:mt-2">
          {t("events.sectionTitle")}
        </h2>
        <p className="text-center mb-10">{t("events.sectionDescription")}</p>

        {/* Events container with background and pattern */}
        <div
          className="events-container container mx-auto relative overflow-hidden rounded-lg"
          style={{ backgroundColor: "#FFFAF0" }}
        >
          {/* Pattern Layer with Opacity */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "url('/newassets/institutionPattern.png')",
              backgroundRepeat: "repeat",
              backgroundSize: "auto",
              opacity: 0.3,
            }}
          ></div>

          {/* Content Layer */}
          <div className="relative z-10 p-6">{renderEvents()}</div>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;

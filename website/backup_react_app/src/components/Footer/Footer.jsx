import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Twitter, Facebook, Instagram, Youtube, Calendar, ArrowUpRight } from "lucide-react";
import { MapPin, Phone } from "lucide-react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import Location from "../Location/Location";

const Footer = () => {
  const { t, i18n } = useTranslation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(import.meta.env.VITE_APP_EVENT_API);

        if (response.data && Array.isArray(response.data.data)) {
          // Sort events by date (most recent first) and take only the latest 2
          const sortedEvents = response.data.data
            .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
            .slice(0, 2);

          const formattedEvents = sortedEvents.map((event) => ({
            id: event._id,
            title: event.eventName,
            path: `/events/${event._id}`,
            date: new Date(event.eventDate).toLocaleDateString(
              i18n.language === "hi" ? "hi-IN" : "en-US",
              {
                month: "short",
                day: "numeric",
                year: "numeric",
              }
            ),
            time: new Date(event.eventDate).toLocaleTimeString(
              i18n.language === "hi" ? "hi-IN" : "en-US",
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            ),
            location: event.eventLocation,
          }));

          setEvents(formattedEvents);
        }
      } catch (err) {
        console.error(t("footer.errors.eventsFetchFailed"), err);
        setError(t("footer.errors.eventsLoadFailed"));
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [t, i18n.language]);

  const scrollToEvents = (e) => {
    e.preventDefault();
    const eventsSection = document.getElementById("events");
    if (eventsSection) {
      eventsSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      // If events section doesn't exist on current page, navigate to events page
      window.location.href = "/#events";
    }
  };

  return (
    <footer className="bg-white shadow-sm pb-12 lg:py-12 ">
      <div className="w-[78vw] h-[1px] mx-auto bg-[#FFD770]  mb-10"></div>
      <div className="container mx-auto px-4 ">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 ">
          {/* Social Media Section with Logo and Name */}
          <div>
            {/* Logo and Swami's Name */}
            <div className="flex flex-col items-center">
              <img
                src="/assets/Avdheshanandg mission logo.png"
                alt="Avdheshanand Mission Logo"
                className="h-24 w-auto mb-2"
              />
            </div>
            {/* Social Media Heading */}
            <h3 className="text-gray-500 font-medium uppercase text-sm tracking-wider mb-4 text-center">
              {t("footer.social.followUs")}
            </h3>

            {/* Social Media Icons */}
            <div className="flex space-x-2 mb-4 justify-center">
              <a
                href="https://twitter.com/AvdheshanandG"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#1DA1F2] flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                aria-label={t("footer.social.twitter")}
              >
                <Twitter size={16} />
                <span className="sr-only">{t("footer.social.twitter")}</span>
              </a>
              <a
                href="https://www.facebook.com/AvdheshanandG/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#4267B2] flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                aria-label={t("footer.social.facebook")}
              >
                <Facebook size={16} />
                <span className="sr-only">{t("footer.social.facebook")}</span>
              </a>
              <a
                href="https://www.instagram.com/avdheshanandg_official/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#E1306C] flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                aria-label={t("footer.social.instagram")}
              >
                <Instagram size={16} />
                <span className="sr-only">{t("footer.social.instagram")}</span>
              </a>
              <a
                href="https://www.youtube.com/@avdheshanandg"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#FF0000] flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                aria-label={t("footer.social.youtube")}
              >
                <Youtube size={16} />
                <span className="sr-only">{t("footer.social.youtube")}</span>
              </a>
            </div>
          </div>

          {/* Latest Events Section - Dynamic */}
          <div>
            <h3 className="text-[#6E0000] font-medium uppercase text-sm tracking-wider mb-4">
              {t("footer.events.title")}
            </h3>

            {loading ? (
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-16 h-12 flex-shrink-0 mr-3 overflow-hidden rounded bg-gray-200 animate-pulse"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-16 h-12 flex-shrink-0 mr-3 overflow-hidden rounded bg-gray-200 animate-pulse"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
              </div>
            ) : error ? (
              <p className="text-sm text-gray-500">{t("footer.events.loadError")}</p>
            ) : events.length === 0 ? (
              <p className="text-sm text-gray-500">{t("footer.events.noEvents")}</p>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="flex items-start">
                    <div className="w-16 h-12 flex-shrink-0 mr-3 overflow-hidden rounded bg-[#f9f0eb] flex items-center justify-center">
                      <Calendar size={24} className="text-[#B82A1E]" />
                    </div>
                    <div>
                      <Link
                        to={event.path}
                        className="text-sm text-[#6E0000] transition-colors font-medium"
                      >
                        {event.title}
                      </Link>
                      <p className="text-xs text-gray-700 mt-1">
                        {event.date} {t("footer.events.timeConnector")} {event.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center mt-4 justify-start">
              <button
                onClick={scrollToEvents}
                className="bg-[#6E0000] hover:shadow-xl
  transform transition-all duration-500 ease-in-out
  hover:-translate-y-1 text-white px-2.5 py-1.5 rounded-full text-xs font-medium shadow-sm  hover:bg-[#8a1f16]"
              >
                {t("footer.events.viewAll")}
              </button>

              <button
                onClick={scrollToEvents}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:shadow-xl
  transform transition-all duration-500 ease-in-out
  hover:-translate-y-1 bg-[#6E0000] text-white shadow-sm  hover:bg-[#8a1f16]"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Important Links Section */}
          <div>
            <h3 className="text-[#6E0000] font-medium uppercase text-sm tracking-wider mb-4">
              {t("footer.links.title", "Important Links")}
            </h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
              {[
                { name: t("footer.navigation.home"), path: "/" },
                { name: t("footer.navigation.schedule"), path: "/schedule" },
                { name: t("footer.navigation.videoSeries"), path: "/video-series" },
                { name: t("footer.navigation.books"), path: "/books" },
                { name: t("footer.navigation.about"), path: "/about" },
                { name: t("footer.navigation.articles"), path: "/articles" },
                { name: t("footer.navigation.Podcasts"), path: "/podcasts" },
                { name: t("footer.navigation.volunteer"), path: "/volunteer" },
                { name: t("footer.navigation.mantraDiksha"), path: "/mantra-diksha" },
                { name: t("footer.navigation.donate"), path: "/donate" },
                { name: t("footer.legal.privacyPolicy"), path: "/privacy-policys" },
                { name: t("footer.legal.termsAndConditions"), path: "/terms-and-conditions" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-600 hover:text-[#B82A1E] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Instagram Section */}
          <div>
            <h3 className="text-[#6E0000] font-medium uppercase text-sm tracking-wider mb-4">
              {t("footer.instagram.title")}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  alt: t("footer.instagram.images.meditation"),
                  src: "/assets/Ig1.jpg",
                  link: "https://www.instagram.com/avdheshanandg_official/reel/DG5lbtZyRVM/",
                },
                {
                  alt: t("footer.instagram.images.discourse"),
                  src: "/assets/Ig2.jpg",
                  link: "https://www.instagram.com/avdheshanandg_official/reel/DFaYGKgyOVt/",
                },
                {
                  alt: t("footer.instagram.images.temple"),
                  src: "/assets/Ig3.jpg",
                  link: "https://www.instagram.com/avdheshanandg_official/reel/DFaYNseyy4b/",
                },
                {
                  alt: t("footer.instagram.images.yajna"),
                  src: "/assets/Ig4.jpg",
                  link: "https://www.instagram.com/avdheshanandg_official/reel/DKtQRBtRmlH/",
                },
                {
                  alt: t("footer.instagram.images.devotees"),
                  src: "/assets/Ig5.jpg",
                  link: "https://www.instagram.com/avdheshanandg_official/reel/DKo4ThZRSPl/",
                },
                {
                  alt: t("footer.instagram.images.ashram"),
                  src: "/assets/Ig6.jpeg",
                  link: "https://www.instagram.com/avdheshanandg_official/p/DKmhUWvyKDu/?img_index=1",
                },
              ].map((img, index) => (
                <a
                  key={index}
                  href={img.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative h-16 w-full overflow-hidden rounded group"
                  aria-label={`${t("footer.instagram.viewPost")} - ${img.alt}`}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="object-cover h-full w-full group-hover:opacity-80 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                    <Instagram
                      size={14}
                      className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                </a>
              ))}
            </div>

            <div className="flex items-center mt-4 justify-start">
              <a
                href="https://www.instagram.com/avdheshanandg_official/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#6E0000] hover:shadow-xl
  transform transition-all duration-500 ease-in-out
  hover:-translate-y-1 text-white px-2.5 py-1.5 rounded-full text-xs font-medium shadow-sm  hover:bg-[#8a1f16] inline-flex items-center"
              >
                {t("footer.instagram.viewAll")}
              </a>

              <a
                href="https://www.instagram.com/avdheshanandg_official/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 flex items-center hover:shadow-xl
  transform transition-all duration-500 ease-in-out
  hover:-translate-y-1 justify-center rounded-full bg-[#6E0000] text-white shadow-sm  hover:bg-[#8a1f16]"
              >
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
        {/* Bottom Navigation - Updated with better small-screen spacing */}
        <Location />
        <div className="mt-12 pt-6 border-t border-[#FFD770] flex flex-wrap justify-between items-center">
          <p className="text-xs text-gray-400">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

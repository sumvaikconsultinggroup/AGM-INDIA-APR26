import React, { useState } from "react";
import JourneySection from "../components/Journey/JourneySection";
import GlimpsesSection from "../components/Glimpses/GlimpsesSection";
import VideoSeries from "../components/VideoSeries/VideoSeries";
const LandingPage = () => {
  const [selectedBookIndex, setSelectedBookIndex] = useState(null);

  const books = [
    {
      title: "Path to Divinity",
      subtitle: "Subtitle or short description",
      image: "src/assets/videoseries/book1.jpg",
    },
    {
      title: "Eternal Echoes",
      subtitle: "Subtitle or short description",
      image: "src/assets/videoseries/book2.jpg",
    },
    {
      title: "Unfolding Divinity Within",
      subtitle: "Subtitle or short description",
      image: "src/assets/videoseries/book3.jpg",
    },
    {
      title: "Happiness And Peace",
      subtitle: "Subtitle or short description",
      image: "src/assets/videoseries/book4.jpg",
    },
    {
      title: "The Path To Ananda",
      subtitle: "Subtitle or short description",
      image: "src/assets/videoseries/book5.jpg",
    },
    {
      title: "Vision Of Self",
      subtitle: "Subtitle or short description",
      image: "src/assets/videoseries/book6.jpg",
    },
    {
      title: "Towards Perfection",
      subtitle: "Subtitle or short description",
      image: "src/assets/videoseries/book7.jpg",
    },
  ];

  const openModal = (index) => {
    setSelectedBookIndex(index);
    document.body.style.overflow = "hidden";
  };

  const closeModal = (e) => {
    if (e.target === e.currentTarget) {
      setSelectedBookIndex(null);
      document.body.style.overflow = "unset";
    }
  };

  const navigateBook = (direction) => {
    const newIndex = selectedBookIndex + direction;
    if (newIndex >= 0 && newIndex < books.length) {
      setSelectedBookIndex(newIndex);
    }
  };

  return (
    <div className="font-serif bg-[#f8f5f3] text-[#333]">
      {/* Header */}
      <header className="relative top-20 h-screen overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 w-full h-full">
          <video autoPlay loop muted playsInline className="absolute w-full h-full object-cover">
            <source src="src/assets/videoseries/website.mp4" type="video/mp4" />
          </video>
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-5xl md:text-7xl font-light mb-4 animate-fadeIn">
            Swami Avdheshanand Giri
          </h1>
          <h2 className="text-2xl md:text-3xl italic font-light mb-12 animate-fadeIn animation-delay-300">
            Spiritual Guide, Visionary & Author
          </h2>
          <div className="flex gap-6 animate-fadeIn animation-delay-500">
            <a
              href="#about"
              className="px-8 py-3 bg-[#B82A1E] text-gray-900 rounded-lg  transition-all duration-300"
            >
              Discover More
            </a>
            <a
              href="#contact"
              className="px-8 py-3 border-2 border-white rounded-lg hover:bg-white hover:text-gray-900 transition-all duration-300"
            >
              Connect with Swamiji
            </a>
          </div>
        </div>
      </header>

      {/* About Section */}
      <section id="about" className="py-24 bg-white">
        <div className="container mx-auto px-5 flex flex-col md:flex-row gap-10 items-center">
          <div className="flex-1">
            <img
              src="/api/placeholder/500/600"
              alt="Swami Avdheshanand Giri"
              className="rounded-lg shadow-xl"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-4xl mb-6 relative inline-block after:block after:w-20 after:h-1 after:bg-[#f3c78b] after:mt-2">
              About Swamiji
            </h2>
            <p className="mb-4">
              Swami Avdheshanand Giri Ji Maharaj is a renowned spiritual leader, visionary, and the
              Acharya Mahamandaleshwar of the Juna Akhara...
            </p>
            <p className="mb-4">
              Through his extensive travels and numerous spiritual discourses...
            </p>
            <p>As a prolific author, Swamiji has written numerous books...</p>
          </div>
        </div>
      </section>

      {/* Teachings Section */}
      <section id="teachings" className="py-24 bg-[#f8f5f2] text-center">
        <div className="container mx-auto px-5">
          <h2 className="text-4xl mb-4 relative inline-block after:block after:w-20 after:h-1 after:bg-[#f3c78b] after:mx-auto after:mt-2">
            Core Teachings
          </h2>
          <p className="mb-10">
            Swamiji's teachings blend ancient wisdom with contemporary relevance...
          </p>
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: "🧘",
                title: "Meditation",
                desc: "Discover the transformative power of meditation...",
              },
              {
                icon: "🕉️",
                title: "Vedanta Philosophy",
                desc: "Explore the profound teachings of Advaita Vedanta...",
              },
              {
                icon: "🌱",
                title: "Conscious Living",
                desc: "Learn how to integrate spiritual principles into daily life...",
              },
              {
                icon: "❤️",
                title: "Compassionate Service",
                desc: "Understand the importance of selfless service...",
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition hover:-translate-y-2"
              >
                <div className="text-4xl mb-4 text-[#f3c78b]">{icon}</div>
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <JourneySection />

      {/* Glimpses Section */}
      <GlimpsesSection />

      {/* Video Series Section */}
      <VideoSeries />

      {/* Books Section */}
      <section id="books" className="py-24 bg-white">
        <div className="container mx-auto px-5">
          <h2 className="text-4xl mb-6 text-center relative inline-block after:block after:w-20 after:h-1 after:bg-[#F9D3CF] after:mx-auto after:mt-2">
            Literary Works
          </h2>
          <p className="text-center mb-10">
            Swamiji has authored numerous books offering profound insights...
          </p>
          <div className="flex overflow-x-auto space-x-6 scrollbar-hide py-4">
            {books.map((book, idx) => (
              <div
                key={idx}
                className="min-w-[250px] text-center cursor-pointer"
                onClick={() => openModal(idx)}
              >
                <div className="bg-[#F9D3CF] h-[350px] rounded-md shadow-md overflow-hidden mb-4 hover:scale-105 transition">
                  <img src={book.image} alt={book.title} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-lg font-medium">{book.title}</h3>
                <p className="italic text-gray-600 text-sm">{book.subtitle}</p>
              </div>
            ))}
          </div>

          {/* Modal */}
          {selectedBookIndex !== null && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setSelectedBookIndex(null);
                  document.body.style.overflow = "unset";
                }
              }}
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
                  >
                    <svg
                      className="w-10 h-10"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                )}

                {/* Book Content */}
                <div
                  className="bg-white rounded-lg shadow-2xl overflow-hidden max-w-4xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/2">
                      <img
                        src={books[selectedBookIndex].image}
                        alt={books[selectedBookIndex].title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-8 md:w-1/2">
                      <h3 className="text-2xl font-bold mb-4">{books[selectedBookIndex].title}</h3>
                      <p className="text-gray-600 mb-4">{books[selectedBookIndex].subtitle}</p>
                      <div className="space-y-4">
                        <p className="text-gray-700">Detailed description of the book...</p>
                        <button className="bg-[#f3c78b] text-white px-6 py-2 rounded hover:bg-[#e3b77b] transition">
                          Read More
                        </button>
                      </div>
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
                  >
                    <svg
                      className="w-10 h-10"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
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
        </div>
      </section>

      {/* Events Section */}
      <section
        id="events"
        className="py-24 text-white bg-fixed bg-cover bg-center"
        style={{ backgroundImage: `url('/api/placeholder/1200/600')` }}
      >
        <div className="bg-black/80 py-16">
          <div className="container mx-auto px-5 text-center">
            <h2 className="text-4xl mb-4 relative inline-block after:block after:w-20 after:h-1 after:bg-[#f3c78b] after:mx-auto after:mt-2">
              Upcoming Events
            </h2>
            <p className="mb-10">
              Join Swamiji for spiritual discourses, retreats, and ceremonies.
            </p>
            {[
              {
                title: "Spiritual Discourse Series",
                date: "May 15-20, 2025 • New Delhi, India",
                desc: "A six-day exploration of the Upanishads...",
              },
            ].map(({ title, date, desc }) => (
              <div
                key={title}
                className="bg-white/10 backdrop-blur-md p-6 rounded-lg my-6 hover:bg-white/20 transition"
              >
                <h3 className="text-2xl mb-2">{title}</h3>
                <div className="text-[#f3c78b] mb-2">{date}</div>
                <p className="mb-4">{desc}</p>
                <a href="#" className="btn">
                  Register Now
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-[#f8f5f2]">
        <div className="container mx-auto px-5">
          <h2 className="text-4xl mb-6 text-center relative inline-block after:block after:w-20 after:h-1 after:bg-[#f3c78b] after:mx-auto after:mt-2">
            Connect With Us
          </h2>
          <p className="text-center mb-10">
            Reach out for teachings, events, or discourse requests.
          </p>
          <div className="flex flex-col md:flex-row gap-10">
            {/* Form */}
            <form className="flex-1 space-y-4">
              {["Full Name", "Email", "Subject"].map((label) => (
                <div key={label}>
                  <label className="font-semibold block mb-1">{label}</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded"
                    required
                  />
                </div>
              ))}
              <div>
                <label className="font-semibold block mb-1">Message</label>
                <textarea className="w-full p-3 border border-gray-300 rounded h-36" required />
              </div>
              <button type="submit" className="btn">
                Send Message
              </button>
            </form>

            {/* Contact Info */}
            <div className="flex-1 bg-white p-6 rounded-lg shadow space-y-6">
              {[
                {
                  icon: "📍",
                  title: "Headquarters",
                  text: "Juna Akhara, Haridwar, Uttarakhand, India",
                },
                {
                  icon: "📧",
                  title: "Email",
                  text: "info@swamiavdheshanand.org",
                },
                { icon: "📱", title: "Phone", text: "+91 XXXXX XXXXX" },
                {
                  icon: "🌐",
                  title: "Social Media",
                  text: "Follow Swamiji's daily wisdom on social platforms",
                },
              ].map(({ icon, title, text }) => (
                <div key={title} className="flex items-start space-x-4">
                  <div className="bg-[#f3c78b] w-12 h-12 flex items-center justify-center rounded-full text-lg">
                    {icon}
                  </div>
                  <div>
                    <h4 className="font-semibold">{title}</h4>
                    <p>{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#333] text-white py-10 text-center">
        <div className="space-x-4 mb-4">
          {["Home", "About", "Teachings", "Books", "Events", "Contact", "Privacy Policy"].map(
            (link) => (
              <a key={link} href="#" className="hover:text-[#f3c78b] transition">
                {link}
              </a>
            )
          )}
        </div>
        <div className="space-x-3 mb-4">
          {["f", "t", "i", "y"].map((icon, idx) => (
            <a
              key={idx}
              href="#"
              className="inline-flex w-10 h-10 items-center justify-center bg-white/10 rounded-full hover:bg-[#f3c78b] hover:text-[#333] transition"
            >
              {icon}
            </a>
          ))}
        </div>
        <p className="text-sm text-white/70">
          &copy; 2025 Swami Avdheshanand Giri Ji Maharaj. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;

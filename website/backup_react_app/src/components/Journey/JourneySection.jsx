import { ExternalLink, ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";

// Updated StatBox component for better mobile layout
const StatBox = ({ value, description, url }) => {
  // Check if URL is internal (starts with /)
  const isInternalLink = url && url.startsWith("/");

  const content = (
    <>
      {/* Desktop layout - row with description and value side by side */}
      <div className="hidden sm:flex justify-between items-center w-full">
        <span className="text-sm text-[#6E0000] flex items-center gap-2">
          {description}
          {isInternalLink ? (
            <img
              src="/newassets/arrowicon.png"
              alt="icon"
              className="w-4 h-4 inline-block"
            />
          ) : (
            <ExternalLink size={12} className="opacity-70" />
          )}
        </span>
        <span className="text-4xl font-semibold text-[#6E0000]">{value}</span>
      </div>

      {/* Mobile layout - column with value below description */}
      <div className="flex sm:hidden flex-col items-center text-center">
        <span className="text-sm text-[#6E0000] font-medium mb-2">
          {description}
        </span>
        <span className="text-3xl font-semibold text-[#6E0000]">{value}</span>
      </div>
    </>
  );

  // For internal links, use a regular anchor without target="_blank"
  if (isInternalLink) {
    return (
      <a
        href={url}
        className="block border border-gray-200 rounded-lg bg-white p-4 hover:bg-gray-50 transition-all duration-200"
      >
        {content}
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-gray-200 rounded-lg bg-white p-4 hover:bg-gray-50 transition-all duration-200"
    >
      {content}
    </a>
  );
};

const SocialMediaIcon = ({ children, color, value, label, url }) => {
  return (
    <div className="text-center">
      <div className={`${color} text-2xl mb-2`}>
        <div className="w-12 h-12 mx-auto flex items-center justify-center bg-white rounded-full shadow-md">
          {children}
        </div>
      </div>
      <div className={`text-2xl sm:text-3xl font-bold ${color} mb-1`}>{value}</div>
      <div className="text-xs sm:text-sm text-gray-600">{label}</div>

      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-500 hover:text-red-600 flex items-center justify-center mt-1 gap-1"
        >
          Visit <ArrowUpRight className="w-3 h-3" />
        </a>
      )}
    </div>
  );
};

const JourneySection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-8 sm:py-16 px-4 bg-gradient-to-b from-white to-gray-50 relative">
      {/* Absolutely positioned Lotus Decoration - Hide on smaller screens */}
      <div className="hidden xl:block absolute left-0 top-1/2 rotate-45 transform -translate-y-1/2">
        <img
          src="/newassets/glimpsesbg.png"
          alt="Lotus decoration"
          className="w-48 h-auto opacity-80"
        />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-16 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl  font-bold text-gray-800 mb-2">
            {t("journey.sectionTitle")}
          </h2>
          <div className="w-16 sm:w-24 h-1 bg-[#6E0000] rounded-xl mx-auto mb-4 sm:mb-8"></div>
          <p className="text-sm sm:text-base text-gray-600 max-w-3xl mx-auto leading-relaxed px-2">
            {t("journey.sectionDescription")}
          </p>
        </div>

        {/* Main Content Section - Responsive Layout */}
        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
          {/* Social Media Stats Section */}
          <div className="w-full lg:w-3/5">
            {/* Mobile: 2x2 Grid Layout */}
            <div className="grid grid-cols-2 gap-4 sm:hidden">
              {/* YouTube */}
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <SocialMediaIcon
                  color="text-red-600"
                  value="163K+"
                  label={t("journey.youtubeSubscribers")}
                  url="https://www.youtube.com/@avdheshanandg"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </SocialMediaIcon>
              </div>

              {/* Instagram */}
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <SocialMediaIcon
                  color="text-pink-600"
                  value="3.3M"
                  label={t("journey.instagramFollowers")}
                  url="https://www.instagram.com/avdheshanandg_official/"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </SocialMediaIcon>
              </div>

              {/* Facebook */}
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <SocialMediaIcon
                  color="text-blue-600"
                  value="1.4M"
                  label={t("journey.facebookFollowers")}
                  url="https://www.facebook.com/AvdheshanandG/"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </SocialMediaIcon>
              </div>

              {/* Twitter */}
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <SocialMediaIcon
                  color="text-gray-800"
                  value="342.1K"
                  label={t("journey.twitterFollowers")}
                  url="https://twitter.com/AvdheshanandG"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.080l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </SocialMediaIcon>
              </div>
            </div>

            {/* Tablet: 2x2 Grid with larger cards */}
            <div className="hidden sm:grid md:hidden grid-cols-2 gap-6">
              {/* YouTube */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <SocialMediaIcon
                  color="text-red-600"
                  value="163K+"
                  label={t("journey.youtubeSubscribers")}
                  url="https://www.youtube.com/@avdheshanandg"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </SocialMediaIcon>
              </div>

              {/* Instagram */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <SocialMediaIcon
                  color="text-pink-600"
                  value="3.3M"
                  label={t("journey.instagramFollowers")}
                  url="https://www.instagram.com/avdheshanandg_official/"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </SocialMediaIcon>
              </div>

              {/* Facebook */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <SocialMediaIcon
                  color="text-blue-600"
                  value="1.4M"
                  label={t("journey.facebookFollowers")}
                  url="https://www.facebook.com/AvdheshanandG/"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </SocialMediaIcon>
              </div>

              {/* Twitter */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <SocialMediaIcon
                  color="text-gray-800"
                  value="342.1K"
                  label={t("journey.twitterFollowers")}
                  url="https://twitter.com/AvdheshanandG"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.080l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </SocialMediaIcon>
              </div>
            </div>

            {/* Desktop: Horizontal layout with dividers */}
            <div className="hidden md:flex flex-row justify-around items-start">
              {/* YouTube Subscribers */}
              <div className="flex-1">
                <SocialMediaIcon
                  color="text-red-600"
                  value="163K+"
                  label={t("journey.youtubeSubscribers")}
                  url="https://www.youtube.com/@avdheshanandg"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </SocialMediaIcon>
              </div>
              <div className="border-l-2 border-[#6E0000] h-60 self-center"></div>

              {/* Instagram Followers */}
              <div className="flex-1">
                <SocialMediaIcon
                  color="text-pink-600"
                  value="3.3M"
                  label={t("journey.instagramFollowers")}
                  url="https://www.instagram.com/avdheshanandg_official/"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </SocialMediaIcon>
              </div>
              <div className="border-l-2 border-[#6E0000] h-60 self-center"></div>

              {/* Facebook Followers */}
              <div className="flex-1">
                <SocialMediaIcon
                  color="text-blue-600"
                  value="1.4M"
                  label={t("journey.facebookFollowers")}
                  url="https://www.facebook.com/AvdheshanandG/"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </SocialMediaIcon>
              </div>
              <div className="border-l-2 border-[#6E0000] h-60 self-center"></div>

              {/* Twitter Followers */}
              <div className="flex-1">
                <SocialMediaIcon
                  color="text-gray-800"
                  value="342.1K"
                  label={t("journey.twitterFollowers")}
                  url="https://twitter.com/AvdheshanandG"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.080l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </SocialMediaIcon>
              </div>
            </div>
          </div>

          {/* Right Statistics */}
          <div className="w-full lg:w-2/5 grid grid-cols-2 sm:grid-cols-1 gap-4 mt-8 lg:mt-0">
            <StatBox
              value={t("journey.repository.books.count")}
              description={t("journey.repository.books.description")}
              url="/books"
            />
            <StatBox
              value={t("journey.repository.articles.count")}
              description={t("journey.repository.articles.description")}
              url="/articles"
            />
            <StatBox
              value={t("journey.repository.videos.count")}
              description={t("journey.repository.videos.description")}
              url="/video-series"
            />
            <StatBox
              value={t("journey.repository.commentaries.count")}
              description={t("journey.repository.commentaries.description")}
              url="/articles"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default JourneySection;
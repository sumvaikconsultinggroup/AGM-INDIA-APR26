"use client";

import { useState, useEffect } from "react";

const tabsData = [
  {
    id: "avdhesham",
    name: "Avdheshanand G Mission",
    title: " Avdheshanand G Mission",
    role:"Founder",
    icon: "/newassets/logo1.png",
    description:
      "AvdheshanandG Mission is a registered 501(c)(3) nonprofit founded by Pujya Swami Avdheshanand Giri Ji Maharaj — a respected spiritual leader, Vedanta scholar, and humanitarian. Through his teachings and service, Swami Ji has uplifted millions worldwide, especially the vulnerable and underserved. The Mission is rooted in Vedanta and dedicated to holistic human growth and global harmony. Its work spans education, healthcare, social upliftment, empowerment, and sustainable living. By blending spirituality with service, it strives to build a compassionate and inclusive world.",
    image: "/newassets/card6.png",
    subItems: [
      {
        title: "Transforming Lives",
        image: "/newassets/card1.1.png",
      },
      {
        title: "Holistic Development",
        image: "/newassets/card1.2.png",
      },
      {
        title: "Global Harmony",
        image: "/newassets/card1.3.png",
      },
    ],
  },
  {
    id: "hindu",
    name: "Hindu Dharma Acharya Sabha",
    title: "Hindu Dharma Acharya Sabha",
    role: "President",
    icon: "/newassets/logo2.png",
    description:
      "The Hindu Dharma Acharya Sabha (HDAS), founded in 2003 by H.H. Swami Dayananda Saraswati, is the apex council of Hindu spiritual leaders. It unites heads of diverse sampradayas, Akhadas, and traditions under one platform. The Sabha provides a collective voice to guide society and uphold Sanatan Dharma. It addresses issues like temple autonomy, religious freedom, education, and cultural preservation. Through global interfaith dialogues, it promotes harmony, unity, and the timeless values of Hindu Dharma.",
    image: "/hindu-dharam.jpg",
    subItems: [
      {
        title: "Traditional Values",
        image: "/newassets/card2.1.png",
      },
      {
        title: "Spiritual Guidance",
        image: "/newassets/card2.2.png",
      },
      {
        title: "Community Service",
        image: "/newassets/card2.3.png",
      },
    ],
  },
  {
    id: "jagannath",
    name: "Shri Shri Parashakti Dharmarth Trust",
    title: "Shri Shri Parashakti Dharmarth Trust",
    role: "Founder",
    icon: "/newassets/logo3.png",
    description: `The Shri Shri Parashakti Dharmarth Trust, guided by Swami Avdheshanand Giri Ji Maharaj, is dedicated to seva (selfless service). It runs free food distribution programs, ensuring meals for the hungry and needy. The trust supports the poor, destitute, and underprivileged with compassion. Its mission is rooted in charity, care, and spiritual responsibility. Through these efforts, it embodies the true spirit of service to humanity.`,
    image: "/newassets/card4.png",
    subItems: [
      {
        title: "Educational Programs",
        image: "/newassets/card3.1.png",
      },
      {
        title: "Healthcare Services",
        image: "/newassets/card3.2.png",
      },
      {
        title: "Social Welfare",
        image: "/newassets/card3.3.png",
      },
    ],
  },
  {
    id: "bharat-mata",
    name: "Bharat mata Mandir samanvaya sewa Trust",
    title: "Bharat mata Mandir samanvaya sewa Trust",
    role: "President",
    icon: "/newassets/logo4.png",
    description: `Bharat Mata Mandir, located in Haridwar beside the Ganges, is a unique seven-story temple dedicated to Bharat Mata (Mother India), established in 1983 by Swami Satyamitranand. Each floor celebrates a distinct theme: from a grand marble map of India on the ground floor to heroic freedom fighters, eminent women, saints, deities, and divine avatars on the upper levels. The temple artfully showcases India’s rich culture, history, spirituality, and unity through its murals, statues, and thematic galleries. 
Entry to the temple is free, with just a small fee (₹2) for the use of its elevator to access higher floors. It remains open daily from 5 AM to 9 PM and serves as both a place of national pride and spiritual inspiration for visitors.`,
    image: "/newassets/card3.png",
    subItems: [
      {
        title: "Heritage Preservation",
        image: "/newassets/card4.1.png",
      },
      {
        title: "Cultural Programs",
        image: "/newassets/card4.2.png",
      },
      {
        title: "National Unity",
        image: "/newassets/card4.3.png",
      },
    ],
  },
  {
    id: "heritage",
    name: "Ancient Heritage Foundation",
    title: "Ancient Heritage Foundation",
    role: "Founder",
    icon: "/newassets/logo5.png",
    description:
      "The Ancient Heritage Foundation, under the guidance of Swami Avdheshanand Giri Ji Maharaj, is dedicated to preserving culture while serving society. It runs a free hospital and Avdheshanand Ji Polyclinic, ensuring quality healthcare for the underprivileged. The foundation also nurtures compassion through its Gaushala, providing care and protection to cows. With a strong focus on education, it operates schools and a traditional Gurukul, offering free learning rooted in Indian values. Through these initiatives, the Foundation blends spirituality with social responsibility, uplifting lives across communities.",
    image: "/newassets/card2.png",
    subItems: [
      {
        title: "Research Programs",
        image: "/newassets/card5.1.png",
      },
      {
        title: "Documentation",
        image: "/newassets/card5.2.png",
      },
      {
        title: "Educational Outreach",
        image: "/newassets/card5.3.png",
      },
    ],
  },
  {
    id: "prabhu-premi",
    name: "Prabhu Premi Sangh Charitable Trust",
    title: "Prabhu Premi sangh Charitable Trust",
    role: "Founder & Chairman",
    icon: "/newassets/logo6.png",
    description:
      "Prabhu Premi Sangh, founded by H.H. Swami Avdheshanand Giri Ji Maharaj, is a spiritual and social organization dedicated to uplifting humanity. It is guided by six core principles – Seva, Satsang, Svadhyay, Saiyyam, Sadhana, and Svatma-Utthaan. The mission spreads tolerance, service to mankind, and the wisdom of ancient Indian scriptures. Through discourses, seva projects, and spiritual practices, it inspires peace, harmony, and self-evolution.With branches across India and abroad, the Sangh works as a global family rooted in compassion and Dharma.",
    image: "/newassets/card1.png",
    subItems: [
      {
        title: "Humanitarian Aid",
        image: "/newassets/card6.1.png",
      },
      {
        title: "Social Causes",
        image: "/newassets/card6.2.png",
      },
      {
        title: "Community Support",
        image: "/newassets/card6.3.png",
      },
    ],
  },
];

export default function SpiritualTab({ initialTab }) {
  const [activeTab, setActiveTab] = useState(initialTab || "avdhesham");

  // Set activeTab from prop on initial mount only
  useEffect(() => {
    if (initialTab && tabsData.some((tab) => tab.id === initialTab)) {
      setActiveTab(initialTab);
    } else {
      // Fallback to the first tab if the initialTab is invalid or not provided on mount
      setActiveTab("avdhesham");
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  const currentTab = tabsData.find((tab) => tab.id === activeTab) || tabsData[0];

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
      <div id="guiding" className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-black tracking-wide px-4">
            Guiding with Wisdom, Serving with Compassion
          </h1>
          <div className="mt-2 h-0.5 w-24 sm:w-32 bg-[#6E0000] mx-auto rounded"></div>
        </div>

        {/* Description */}
        <p className="text-center text-sm sm:text-base text-[#6E0000] leading-relaxed mb-8 sm:mb-12 max-w-5xl mx-auto px-4">
          H.H. Swami Avdheshanand Giri Ji Maharaj holds several revered positions across spiritual,
          cultural, and humanitarian organizations. As Chairman, Founder, and President of
          numerous trusts and foundations, he contributes to the betterment of society through the
          vision of Vasudhaiva Kutumbakam (the world is one family). His leadership extends from the
          Prabhu Premi Sangh Charitable Trust to the Hindu Dharma Acharya Sabha and Bharat Mata
          Mandir, whose service, spirituality, and nation-building come together. Each role reflects
          his lifelong dedication to preserving Indias ancient heritage, uplifting society, and
          spreading universal harmony.
        </p>

        {/* Main Navigation Tabs */}
        <div className="mb-8 sm:mb-12">
          {/* Mobile: Dropdown */}
          <div className="sm:hidden">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full p-3 border border-red-300 rounded-lg bg-white text-[#6E0000] font-medium"
            >
              {tabsData.map((tab) => (
                <option id={tab.id} key={tab.id} value={tab.id}>
                  {tab.name}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop: Horizontal tabs */}
          <div className="hidden sm:flex justify-center border-2 rounded-full">
            <div className="inline-flex rounded-full p-2 flex-wrap justify-center">
              {tabsData.map((tab) => (
                <button
                  id={tab.id}
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 lg:px-6 py-2 rounded-full text-xs lg:text-sm font-medium transition-colors m-1 ${
                    activeTab === tab.id
                      ? "bg-red-100 text-[#6E0000] border border-red-300"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-[#FCF4E3] rounded-lg p-4 sm:p-6 lg:p-10 shadow-sm relative">
          {/* Decorative pattern - hidden on mobile */}
          <div className="absolute -top-16 -right-24 w-52 h-52 opacity-25 pointer-events-none hidden lg:block">
            <img
              src="/newassets/butterfly.png"
              alt="pattern"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 relative z-10">
            {/* Main Image */}
            <div className="flex-shrink-0 w-full lg:w-[30vw] h-48 sm:h-64 lg:h-[45vh]">
              <img
                src={currentTab.image || "/placeholder.svg"}
                alt={currentTab.title}
                className="w-full h-full object-cover rounded-xl shadow-md"
              />
            </div>

            {/* Content */}
            <div className="flex-1">
              {/* Header with icon and title */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 mb-4 sm:mb-6">
                <div className="flex-shrink-0">
                  <img
                    src={currentTab.icon}
                    alt="Organization Icon"
                    className="w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 object-contain"
                  />
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#6E0000] tracking-wide">
                    {currentTab.title}
                  </h2>
                  <h3 className="text-sm sm:text-base font-semibold text-[#6E0000] mt-2">
                    {currentTab.role}
                  </h3>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6 sm:mb-8">
                <p className="text-sm sm:text-base text-gray-800 leading-relaxed">
                  {currentTab.description}
                </p>
              </div>

              {/* Sub Items */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {currentTab.subItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2"
                  >
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.title}
                      className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded-lg flex-shrink-0"
                    />
                    <span className="text-sm sm:text-base text-gray-800 font-medium leading-tight flex-1 sm:flex-initial">
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

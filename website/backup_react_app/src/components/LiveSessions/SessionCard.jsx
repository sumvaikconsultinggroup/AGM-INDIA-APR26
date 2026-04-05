import React from "react";
import TopicBubble from "./TopicBubble";

const topics = [
  { title: "Bhagavad Gita", position: "top-24 left-24" },
  { title: "Ashtavakra Gita", position: "top-24 right-24" },
  { title: "Upanishads", position: "top-48 left-16" },
  { title: "Buddhism", position: "bottom-48 right-16" },
  { title: "Devotional Verses", position: "bottom-24 right-24" },
];

const SessionCard = () => {
  return (
    <div className="relative h-[500px] overflow-hidden rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 p-6">
      {/* Topic Bubbles */}
      {topics.map((topic) => (
        <TopicBubble
          key={topic.title}
          title={topic.title}
          position={topic.position}
        />
      ))}

      {/* Central Image */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <img
          src="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&h=400"
          alt="Spiritual Teacher"
          className="h-64 w-64 rounded-full object-cover"
        />
      </div>

      {/* Join Button */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <button className="rounded-md bg-orange-500 px-8 py-3 text-lg font-semibold text-white transition-transform hover:scale-105 hover:bg-orange-600">
          JOIN LIVE SESSIONS
        </button>
      </div>
    </div>
  );
};

export default SessionCard;

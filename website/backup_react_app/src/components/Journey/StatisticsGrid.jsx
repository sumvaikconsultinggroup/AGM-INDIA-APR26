import React from "react";
import { Youtube, Globe, BookOpen } from "lucide-react";
import StatCard from "./StatCard";

const StatisticsGrid = () => {
  return (
    <div className="space-y-8">
      {/* Social Media Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-[#fff5f1] p-6">
          <div className="flex items-center gap-2 text-xl font-semibold">
            <Youtube className="h-6 w-6 text-red-600" />
            <span>YouTube</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <StatCard
              value="61 million+"
              description="Subscribers"
              className="col-span-3 bg-orange-500 text-white"
            />
            <StatCard
              value="5.5 billion+"
              description="Views"
              className="col-span-3 md:col-span-1"
            />
            <StatCard
              value="100 million+"
              description="Watch hours"
              className="col-span-3 md:col-span-2"
            />
          </div>
        </div>

        <div className="rounded-lg bg-[#fff5f1] p-6">
          <div className="flex items-center gap-2 text-xl font-semibold">
            <Globe className="h-6 w-6 text-blue-600" />
            <span>Social Media</span>
          </div>
          <div className="mt-4">
            <StatCard
              value="77 million+"
              description="Followers"
              className="bg-blue-500 text-white"
            />
          </div>
        </div>

        <div className="rounded-lg bg-[#fff5f1] p-6">
          <div className="flex items-center gap-2 text-xl font-semibold">
            <BookOpen className="h-6 w-6 text-green-600" />
            <span>Repository of Wisdom Content</span>
          </div>
          <div className="mt-4 grid gap-4">
            <StatCard
              value="200+ Books"
              description="On life topics and scriptures"
              className="bg-green-500 text-white"
            />
          </div>
        </div>
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          value="10,000+"
          description="Articles available for free"
          className="bg-[#fff5f1]"
        />
        <StatCard
          value="16,500+"
          description="Videos available for free"
          className="bg-[#fff5f1]"
        />
        <StatCard
          value="65+"
          description="Commentaries on scriptures"
          className="bg-[#fff5f1]"
        />
        <div className="flex items-center justify-center rounded-lg bg-[#fff5f1] p-6 text-center text-sm text-gray-600">
          (Available in Hindi and English)
        </div>
      </div>
    </div>
  );
};

export default StatisticsGrid;

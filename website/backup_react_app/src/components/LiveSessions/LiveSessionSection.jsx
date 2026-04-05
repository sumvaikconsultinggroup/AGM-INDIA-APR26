import React from "react";
import SessionCard from "./SessionCard";
import Calendar from "./Calendar";
import InfoPoints from "./InfoPoints";

const LiveSessionSection = () => {
  return (
    <section className="bg-white ">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-2">
            <span className="text-4xl font-bold text-red-600">LIVE</span>
            <span className="text-4xl font-bold text-gray-900"> Sessions</span>
          </h2>
          <p className="text-lg text-gray-600">
            Experience Transformation Everyday from the Convenience of your Home
          </p>
        </div>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Session Card - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <SessionCard />
          </div>

          {/* Calendar Section */}
          <div>
            <Calendar />
          </div>
        </div>

        {/* Info Points */}
        <InfoPoints />
      </div>
    </section>
  );
};

export default LiveSessionSection;

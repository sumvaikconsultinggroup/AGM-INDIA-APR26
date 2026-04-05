// import React from "react";

const KumbhInfo = () => {
  return (
    <div className="rounded-lg bg-[#fff5f1] p-8">
      <h2 className="mb-4 text-2xl font-bold text-gray-900">
        About Kumbh Mahaparv
      </h2>
      <p className="mb-6 text-gray-700 leading-relaxed">
        The Kumbh Mela is the largest peaceful gathering of pilgrims on earth,
        where millions of devotees come together to take a holy dip in sacred
        rivers. This grand spiritual congregation happens every twelve years at
        four different locations in India. The 2025 Kumbh Mela promises to be a
        transformative experience, offering a unique blend of spiritual
        enlightenment and cultural immersion.
      </p>
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span className="rounded-full bg-orange-100 px-4 py-1">
          Spiritual Gathering
        </span>
        <span className="rounded-full bg-orange-100 px-4 py-1">Holy Dip</span>
        <span className="rounded-full bg-orange-100 px-4 py-1">
          Cultural Experience
        </span>
      </div>
    </div>
  );
};

export default KumbhInfo;

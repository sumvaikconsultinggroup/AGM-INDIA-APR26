import React from "react";

const KumbhBanner = () => {
  return (
    <div className="relative mb-6 sm:mb-8">
      <img
        src="/kumbh_img.jpg"
        alt="Kumbh Mela"
        className="w-full h-[300px] sm:h-[500px] object-cover object-center"
      />
      {/* <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="mt-36 mb-4 text-5xl font-bold">Kumbh Mela 2025</h1>
          <p className="mx-auto max-w-2xl text-lg">
            Experience the world's largest spiritual gathering at the confluence
            of sacred rivers. Book your accommodation now for this divine
            journey.
          </p>
        </div>
      </div> */}
    </div>
  );
};

export default KumbhBanner;

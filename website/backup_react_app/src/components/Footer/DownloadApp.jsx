import React from "react";

const DownloadApp = () => {
  return (
    <div>
      <h3 className="text-white font-semibold mb-4">DOWNLOAD APP</h3>
      <div className="flex items-center gap-4 mb-4">
        <img
          src="https://acharyaprashant.org/images/ic_favicon_64.png"
          alt="Acharya Prashant"
          className="w-8 h-8 rounded-full"
        />
        <span className="text-white">Acharya Prashant</span>
      </div>
      <div className="space-y-2">
        <a href="#" className="block">
          <img
            src="https://acharyaprashant.org/images/ic_googleplay.png"
            alt="Get it on Google Play"
            className="h-10"
          />
        </a>
        <a href="#" className="block">
          <img
            src="https://acharyaprashant.org/images/ic_appstore.png"
            alt="Download on App Store"
            className="h-10"
          />
        </a>
      </div>
    </div>
  );
};

export default DownloadApp;

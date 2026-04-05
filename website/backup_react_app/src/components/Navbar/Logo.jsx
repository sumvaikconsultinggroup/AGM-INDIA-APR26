import React from "react";
import swamijiLogo from "../../assets/swamiji_logo.jpg";

const Logo = () => {
  return (
    <a href="/" className="flex items-center gap-2">
      <img
        src={swamijiLogo}
        alt="Acharya Prashant"
        className="h-10 w-10 rounded-full object-cover"
      />
      <div className="text-xs font-semibold uppercase leading-tight text-[#1E293B]">
        <div>Acharya</div>
        <div>Swami Avdheshanand Giri ji</div>
      </div>
    </a>
  );
};

export default Logo;

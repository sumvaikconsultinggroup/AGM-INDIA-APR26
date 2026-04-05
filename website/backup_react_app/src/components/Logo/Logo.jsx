import React from "react";
import { Link } from "react-router-dom";
const Logo = () => {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <img
        src="/lovable-uploads/2fe37844-2688-4013-9aa1-1efdb35f3856.png"
        alt="Avdheshanandg"
        className="h-10 w-10 rounded-full"
      />
      <span className="font-semibold text-lg">Avdheshanandg</span>
    </Link>
  );
};
export default Logo;



import  { useState } from "react";
import { Menu } from "lucide-react";
import MobileNav from "./MobileNav/MobileNav";

const MobileMenu = ({ getTextStyle }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-1 lg:hidden"
      >
        <Menu className={`h-6 w-6 ${getTextStyle()}`} />
        {/* <span className="text-sm">Menu</span> */}
      </button>

      <MobileNav isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default MobileMenu;

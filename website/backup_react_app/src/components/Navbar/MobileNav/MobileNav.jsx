import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import MobileNavLinks from "./MobileNavLinks";
import MobileNavFooter from "./MobileNavFooter";

const MobileNav = ({ isOpen, onClose }) => {
  const scrollPositionRef = useRef(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      scrollPositionRef.current = window.scrollY;

      // Set mounted immediately to establish full height
      setIsMounted(true);

      // Apply body lock without visual jump
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollPositionRef.current}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";

      // Use a small delay to trigger the slide animation
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 10);

      return () => clearTimeout(timer);
    } else {
      // Start closing animation
      setIsVisible(false);

      // Wait for animation to complete before cleanup
      const timer = setTimeout(() => {
        setIsMounted(false);

        // Restore body styles
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";

        // Restore scroll position
        window.scrollTo(0, scrollPositionRef.current);
      }, 300); // Match the transition duration

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isOpen) {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
      }
    };
  }, []);

  // Don't render anything if not mounted
  if (!isMounted) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ease-in-out z-40 ${
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Side Navigation */}
      <div
        className={`fixed right-0 top-0 h-screen w-[300px] bg-white shadow-xl transition-transform duration-300 ease-in-out z-50 flex flex-col ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b px-4 flex-shrink-0 bg-white">
          <span className="text-lg font-semibold">Menu</span>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-grow overflow-y-auto overscroll-contain">
          <MobileNavLinks />
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-white border-t">
          <MobileNavFooter />
        </div>
      </div>
    </>
  );
};

export default MobileNav;

import { Link } from "react-router-dom";
import { User } from "lucide-react";

const SideNavbar = ({ showSidebar, toggleSidebar }) => {
  return (
    <div
      className={`fixed top-0 left-0 z-50 h-full bg-white shadow-lg transform ${
        showSidebar ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 w-72`}
    >
      {/* </div>
    <div className="h-full bg-white overflow-y-auto"> */}
      <div className="flex flex-col h-full">
        <button
          className="p-4 text-black font-semibold text-right hover:bg-gray-100"
          onClick={toggleSidebar} // Added toggle functionality
        >
          Close
        </button>
        {/* Login Section */}
        <Link
          to="/login"
          className="flex items-center gap-2 p-4 text-orange-500 hover:bg-orange-50 border-b"
        >
          <User className="h-6 w-6" />
          <span className="font-medium">Login</span>
        </Link>

        {/* Main Navigation */}
        <nav className="flex-1 px-4 py-2">
          <div className="space-y-1">
            <Link
              to="/podcasts"
              className="block py-2.5 hover:text-orange-500 transition-colors"
            >
              Podcasts
            </Link>
            <Link
              to="/gita-samagam"
              className="block py-2.5 hover:text-orange-500 transition-colors"
            >
              Gita Samagam
            </Link>
            <Link
              to="/vedanta-basics"
              className="block py-2.5 hover:text-orange-500 transition-colors"
            >
              Vedanta: Basics to Classics
            </Link>
            <Link
              to="/articles"
              className="block py-2.5 hover:text-orange-500 transition-colors"
            >
              Articles
            </Link>
            <Link
              to="/books"
              className="block py-2.5 hover:text-orange-500 transition-colors"
            >
              Books
            </Link>
            <Link
              to="/video-series"
              className="block py-2.5 hover:text-orange-500 transition-colors"
            >
              Video Series
            </Link>
            <Link
              to="/ap-circle"
              className="block py-2.5 hover:text-orange-500 transition-colors"
            >
              Circle
            </Link>
            <Link
              to="/media"
              className="block py-2.5 hover:text-orange-500 transition-colors"
            >
              Media and Public Interaction
            </Link>
            <Link
              to="/contact"
              className="block py-2.5 hover:text-orange-500 transition-colors"
            >
              Contact Us
            </Link>
            <Link
              to="/careers"
              className="block py-2.5 hover:text-orange-500 transition-colors"
            >
              Careers
            </Link>
            <Link
              to="/donate"
              className="block py-2.5 hover:text-orange-500 transition-colors"
            >
              Donate
            </Link>

            {/* More Section */}
            <div className="pt-4 border-t mt-4">
              <div className="text-sm font-semibold text-gray-500 py-2.5">
                MORE
              </div>
              <div className="space-y-1">
                <Link
                  to="/foundation"
                  className="block py-2.5 hover:text-orange-500 transition-colors"
                >
                  PrashantAdvait Foundation
                </Link>
                <Link
                  to="/upanishad"
                  className="block py-2.5 hover:text-orange-500 transition-colors"
                >
                  Ghar Ghar Upanishad
                </Link>
                <Link
                  to="/about"
                  className="block py-2.5 hover:text-orange-500 transition-colors"
                >
                  About Acharya Prashant
                </Link>
                <Link
                  to="/transformation"
                  className="block py-2.5 hover:text-orange-500 transition-colors"
                >
                  Voices of Transformation
                </Link>
              </div>
            </div>

            {/* Technical Support */}
            <div className="pt-4 border-t mt-4">
              <Link
                to="/support"
                className="block py-2.5 hover:text-orange-500 transition-colors"
              >
                Technical Support
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default SideNavbar;

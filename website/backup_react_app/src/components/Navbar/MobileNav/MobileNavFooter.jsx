import { Phone, Globe } from "lucide-react";

const MobileNavFooter = () => {
  return (
    <div className="absolute bottom-0 left-0 right-0 border-t bg-gray-50 p-4">
      <div className="flex items-center justify-between">
        <button className="flex items-center space-x-2 text-sm text-gray-700">
          <Globe className="h-4 w-4" />
          <span>English</span>
        </button>
        <button className="flex items-center space-x-2 rounded-full border border-gray-300 bg-white p-2">
          <Phone className="h-4 w-4 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default MobileNavFooter;

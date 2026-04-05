import  { useState } from "react";
import { Phone } from "lucide-react";
import { useTranslation } from "react-i18next";

const ContactButton = ({  getTextStyle }) => {
  const { t } = useTranslation();
  const [showTooltip, setShowTooltip] = useState(false);

  // Contact number to call
  const phoneNumber = "+919410160022"; // Replace with your actual number

  const handleClick = () => {
    // Create tel: link to place call
    window.location.href = `tel:${phoneNumber}`;
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label={t("accessibility.callButton")}
        className={`flex items-center justify-center rounded-full border p-2 ml-6 transition-colors duration-200 hover:bg-[#B82A1E]/10 ${getTextStyle()}`}
      >
        <Phone
          className={`h-5 w-5 transition-colors duration-200 ${
            getTextStyle()
          }`}
        />
      </button>

      {/* Tooltip showing the number */}
      {showTooltip && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white text-black text-xs py-1 px-2 rounded shadow-md whitespace-nowrap border border-gray-200">
          {phoneNumber}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-white"></div>
        </div>
      )}
    </div>
  );
};

export default ContactButton;


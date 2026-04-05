// import React from "react";
import PropTypes from "prop-types";
// import DonationInfo from "./DonateInfo";
import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../../context/AuthContext";

const FundraisingCard = ({
  title,
  backgroundImage,
  description,
  additionalText,
  bulletPoints,
  icon,
  id,
}) => {
  // const percentage = Math.round((achieved / goal) * 100);
  // const navigate = useNavigate();
  // const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  // const { isAuthenticated } = useAuth();

  const handleDonateClick = () => {
    navigate(`/donate-form?campaignId=${id}`);
  };

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-lg">
      {/* Card Header with Background */}
      <div className="relative h-48">
        <img src={backgroundImage} alt={title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
        {icon && (
          <div className="absolute top-4 left-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
            {icon}
          </div>
        )}
        <h3 className="absolute inset-0 flex items-center justify-center text-2xl font-serif text-white px-4 text-center">
          {title}
        </h3>
      </div>

      {/* Card Content */}
      <div className="p-6">
        {/* <DonationInfo achieved={achieved} goal={goal} percentage={percentage} /> */}

        {/* Custom progress bar styling to match theme */}
        {/* <div className="h-2 bg-gray-200 rounded-full mt-2">
          <div
            className="h-2 bg-[#B82A1E] rounded-full"
            style={{ width: `${percentage > 100 ? 100 : percentage}%` }}
          ></div>
        </div> */}

        {/* Donor Info */}
        {/* <div className="mb-5 mt-2 flex items-center justify-between text-sm text-[#5D4037]/70">
          <span className="font-medium">{donors} Donors till now</span>
          <span className="font-medium">{daysLeft} day(s) left</span>
        </div> */}

        {/* Description */}
        <div className="mb-6 lg:h-[240px]">
          <p className="mb-4 text-sm text-[#5D4037]/80 leading-relaxed">{description}</p>

          {additionalText && (
            <p className="mb-4 text-sm text-[#5D4037]/80 leading-relaxed">{additionalText}</p>
          )}

          {bulletPoints && (
            <ul className="space-y-2 text-sm text-[#5D4037]/80 pl-4">
              {bulletPoints.map((point, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2 text-[#B82A1E] font-medium">{index + 1}.</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Donate Button */}
        <button
          className="w-full rounded-lg bg-[#B82A1E] px-4 py-2.5 font-medium text-white transition-colors hover:bg-[#9a231a]"
          onClick={handleDonateClick}
        >
          Open Donation
        </button>
      </div>
    </div>
  );
};

FundraisingCard.propTypes = {
  title: PropTypes.string.isRequired,
  backgroundImage: PropTypes.string.isRequired,
  achieved: PropTypes.number.isRequired,
  goal: PropTypes.number.isRequired,
  donors: PropTypes.number.isRequired,
  daysLeft: PropTypes.number.isRequired,
  description: PropTypes.string.isRequired,
  additionalText: PropTypes.string,
  bulletPoints: PropTypes.arrayOf(PropTypes.string),
  icon: PropTypes.node,
};

export default FundraisingCard;

import PropTypes from "prop-types";
import React from "react";
import { useTranslation } from "react-i18next";

const DonationInfo = ({ achieved, goal, percentage }) => {
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const {t} = useTranslation();

  return (
    <div className="mb-2">
      <div className="flex justify-between items-center">
        <span className="text-[#B82A1E] font-medium">
          {formatCurrency(achieved)}
        </span>
        <span className="text-[#5D4037]/70 text-sm">
          Goal: {formatCurrency(goal)}
        </span>
      </div>
      <div className="text-xs text-[#5D4037]/60 mt-1">
        {percentage}% achieved of {formatCurrency(goal)} {t("goal")}
      </div>
    </div>
  );
};

DonationInfo.propTypes = {
  achieved: PropTypes.number.isRequired,
  goal: PropTypes.number.isRequired,
  percentage: PropTypes.number.isRequired,
};

export default DonationInfo;

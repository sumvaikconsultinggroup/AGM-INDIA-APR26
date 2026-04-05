import React from "react";

const StatCard = ({
  icon: Icon,
  title,
  value,
  description,
  className = "",
}) => {
  return (
    <div
      className={`rounded-lg bg-white p-6 shadow-lg transition-transform hover:scale-105 ${className}`}
    >
      {Icon && <Icon className="mb-4 h-8 w-8 text-orange-500" />}
      {title && (
        <h3 className="mb-2 text-lg font-semibold text-gray-600">{title}</h3>
      )}
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </div>
  );
};

export default StatCard;

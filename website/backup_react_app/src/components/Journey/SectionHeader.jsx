import React from "react";

const SectionHeader = ({ title, description }) => {
  return (
    <div className="mb-12 text-center">
      <h2 className="mb-4 text-4xl font-bold text-gray-900">{title}</h2>
      <p className="mx-auto max-w-3xl text-lg text-gray-600">{description}</p>
    </div>
  );
};

export default SectionHeader;

// import React from "react";

const IdVerification = ({ formData, setFormData }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800">
        ID Proof and Verification
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Primary ID Proof *
          </label>
          <input
            type="file"
            required
            className="mt-1 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-orange-50 file:text-orange-700
              hover:file:bg-orange-100"
            onChange={(e) =>
              setFormData({ ...formData, primaryIdFile: e.target.files[0] })
            }
          />
          <p className="mt-1 text-sm text-gray-500">
            Accepted: Aadhaar, Passport, Voter ID
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            ID Number *
          </label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            value={formData.primaryIdNumber}
            onChange={(e) =>
              setFormData({ ...formData, primaryIdNumber: e.target.value })
            }
          />
        </div>
      </div>
    </div>
  );
};

export default IdVerification;

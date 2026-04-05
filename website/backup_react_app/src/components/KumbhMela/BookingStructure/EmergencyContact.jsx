// import React from "react";

const EmergencyContact = ({ formData, setFormData }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800">
        Emergency Contact Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Emergency Contact Name *
          </label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            value={formData.emergencyContactName}
            onChange={(e) =>
              setFormData({ ...formData, emergencyContactName: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Relationship to Applicant *
          </label>
          <select
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            value={formData.emergencyRelationship}
            onChange={(e) =>
              setFormData({
                ...formData,
                emergencyRelationship: e.target.value,
              })
            }
          >
            <option value="">Select Relationship</option>
            <option value="parent">Parent</option>
            <option value="spouse">Spouse</option>
            <option value="sibling">Sibling</option>
            <option value="friend">Friend</option>
            <option value="relative">Other Relative</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Emergency Contact Number *
          </label>
          <input
            type="tel"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            value={formData.emergencyContactNumber}
            onChange={(e) =>
              setFormData({
                ...formData,
                emergencyContactNumber: e.target.value,
              })
            }
            maxLength={10}
          />
        </div>
      </div>
    </div>
  );
};

export default EmergencyContact;

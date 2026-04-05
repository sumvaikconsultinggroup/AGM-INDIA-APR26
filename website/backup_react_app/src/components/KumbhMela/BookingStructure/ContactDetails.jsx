// import React from "react";

const ContactDetails = ({ formData, setFormData }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800">Contact Details</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Mobile Number (Primary) *
          </label>
          <input
            type="tel"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            value={formData.primaryMobile}
            onChange={(e) =>
              setFormData({ ...formData, primaryMobile: e.target.value })
            }
            maxLength={10}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Alternate Mobile Number
          </label>
          <input
            type="tel"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            value={formData.alternateMobile}
            onChange={(e) =>
              setFormData({ ...formData, alternateMobile: e.target.value })
            }
            maxLength={10}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email Address *
          </label>
          <input
            type="email"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Preferred Communication *
          </label>
          <select
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            value={formData.preferredCommunication}
            onChange={(e) =>
              setFormData({
                ...formData,
                preferredCommunication: e.target.value,
              })
            }
          >
            <option value="">Select Preference</option>
            <option value="sms">SMS</option>
            <option value="email">Email</option>
            <option value="phone">Phone Call</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ContactDetails;
